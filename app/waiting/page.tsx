"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Waiting() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // 🔹 Comprovació d'usuari i càrrega inicial
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        router.replace("/auth");
        return;
      }

      setUser(session.user);
      setIsAdmin(session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

      await fetchPlayers();
      await checkGameState();

      // 🔁 Refresc de jugadors cada 5s
      const interval = setInterval(fetchPlayers, 5000);

      // 🔁 Subscriure’s a canvis de game_state
      const gameSub = supabase
        .channel("game_state_channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_state" },
          (payload) => {
            if (payload.new?.phase === "in_progress") {
              router.push("/game");
            }
          }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(gameSub);
      };
    })();
  }, []);

  // 🔹 Obtenir jugadors
  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("id, user_id, role, is_alive, is_ghost, profiles(display_name, avatar_url)")
      .order("joined_at");

    if (!error && data) {
      setPlayers(data);
    }
  }

  // 🔹 Comprovar si ja hi ha partida en curs
  async function checkGameState() {
    const { data: game } = await supabase.from("game_state").select("*").maybeSingle();
    if (game?.phase === "in_progress") {
      router.push("/game");
    }
  }

  // 🔹 Seleccionar/desseleccionar assassins
  function toggle(id: string) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }

  // 🔹 Iniciar partida (només administrador)
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
      if (!j.ok) throw new Error(j.error || "Error iniciant partida");

      router.push("/game");
    } catch (err: any) {
      console.error("Error iniciant la partida:", err);
      alert("Error iniciant la partida: " + err.message);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-mystery text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Sala d'espera</h1>

        <div className="grid gap-4">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/10 shadow-md"
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.profiles?.avatar_url || "/default-avatar.png"}
                  alt=""
                  className="w-12 h-12 rounded-full border border-white/20"
                />
                <div>
                  <div className="font-semibold">{p.profiles?.display_name || "Jugador"}</div>
                  <div className="text-xs text-gray-400">{p.role || "investigator"}</div>
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

        {isAdmin && (
          <div className="text-center space-y-3">
            <button
              onClick={startGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-lg transition-all shadow-md"
            >
              Iniciar partida
            </button>
          </div>
        )}

        {!isAdmin && (
          <p className="text-center text-gray-400 italic">
            Esperant que l’administrador iniciï la partida...
          </p>
        )}
      </div>
    </div>
  );
}
