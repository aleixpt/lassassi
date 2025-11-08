"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

type Player = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  joined_at: string;
  role: string;
};

export default function Waiting() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [phase, setPhase] = useState<string>("waiting");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        router.replace("/");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);
      setIsAdmin(currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

      // 🔹 Crear jugador a la taula players si no existeix
      const { data: existingPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!existingPlayer) {
        await supabase.from("players").insert({
          user_id: currentUser.id,
          role: "investigator",
          is_alive: true,
          is_ghost: false,
        });
      }

      await fetchPlayers();

      // 🔹 Realtime: players
      const playersChannel = supabase
        .channel("players_channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players" },
          () => fetchPlayers()
        )
        .subscribe();

      // 🔹 Realtime: game_state
      const gameChannel = supabase
        .channel("game_state_channel")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "game_state" },
          (payload: any) => {
            const newPhase = payload.new.phase;
            setPhase(newPhase);
            if (newPhase === "in_progress") router.push("/game");
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(playersChannel);
        supabase.removeChannel(gameChannel);
      };
    })();
  }, [router]);

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("id, role, joined_at, profiles(display_name, avatar_url)")
      .order("joined_at", { ascending: true });

    if (!error && data) {
      setPlayers(
        data.map((p: any) => ({
          id: p.id,
          role: p.role || "investigator",
          display_name: p.profiles?.display_name || "Jugador",
          avatar_url: p.profiles?.avatar_url || "/default-avatar.png",
          joined_at: p.joined_at || new Date().toISOString(),
        }))
      );
    }
  }

  function toggle(id: string) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }

  async function startGame() {
    if (!isAdmin) return;

    if (selected.size < 2) {
      const confirmContinue = confirm(
        `Només hi ha ${selected.size} assassí(s) seleccionat(s). Vols continuar igualment?`
      );
      if (!confirmContinue) return;
    }

    try {
      const res = await fetch("/api/start_game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assassins: Array.from(selected) }),
      });

      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Error iniciant partida");

      alert("Partida iniciada!");
      router.push("/game");
    } catch (err: any) {
      console.error("Error iniciant la partida:", err);
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-mystery text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Sala d'espera</h1>
        <h2 className="text-center text-gray-300">
          Fase: {phase.toUpperCase()}
        </h2>

        <div className="grid gap-4">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/10 shadow-md"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.avatar_url}
                  alt=""
                  className="w-12 h-12 rounded-full border border-white/20"
                />
                <div>
                  <div className="font-semibold">{p.display_name}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(p.joined_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => toggle(p.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selected.has(p.id)
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {selected.has(p.id) ? "Assassí ✅" : "Seleccionar"}
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdmin ? (
          <div className="text-center space-y-3">
            <button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg transition-all shadow-md"
            >
              Iniciar partida
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400 italic">
            Esperant que l’administrador iniciï la partida...
          </p>
        )}
      </div>
    </div>
  );
}
