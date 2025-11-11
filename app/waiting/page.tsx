"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function WaitingPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        router.replace("/");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);
      const admin = currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      setIsAdmin(admin);

      // Comprova si la partida ja ha començat
      const { data: gameData } = await supabase
        .from("game_state")
        .select("phase")
        .maybeSingle();

      if (gameData?.phase === "in_progress") {
        setGameStarted(true);

        // 🔹 Si el jugador encara no existeix a players, no pot entrar
        const { data: player } = await supabase
          .from("players")
          .select("id")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (!player) {
          setBlocked(true);
          return;
        }

        router.push("/game");
        return;
      }

      // 🔹 Només assegura el jugador si NO és l'administrador
      if (!admin) {
        await ensurePlayerExists(currentUser.id);
      }

      await fetchPlayers();

      // 🔁 Refresc automàtic cada 5 segons
      interval = setInterval(async () => {
        if (!isMounted) return;
        await fetchPlayers();
        await checkGameState(); 
      }, 5000);

      // Comprovació inicial
      await checkGameState();
    })();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [router]);

  async function ensurePlayerExists(userId: string) {
    try {
      const { error } = await supabase
        .from("players")
        .upsert(
          {
            user_id: userId,
            role: "Amics", // 🔹 Rol per defecte
            is_alive: true,
            is_ghost: false,
          },
          { onConflict: "user_id" }
        );
      if (error) console.error("Error assegurant jugador:", error);
    } catch (err) {
      console.error("Excepció assegurant jugador:", err);
    }
  }

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("id, role, is_alive, is_ghost, user_id, profiles(display_name, avatar_url)")
      .order("joined_at");

    if (error) {
      console.error("Error obtenint jugadors:", error);
      return;
    }

    if (data) {
      const uniquePlayers = Array.from(new Map(data.map((p) => [p.user_id, p])).values());
      setPlayers(uniquePlayers);
    }
  }

  async function checkGameState() {
    const { data, error } = await supabase
      .from("game_state")
      .select("phase")
      .maybeSingle();

    if (error) {
      console.error("Error comprovant estat del joc:", error);
      return;
    }

    if (data?.phase === "in_progress" && window.location.pathname === "/waiting") {
      router.push("/game");
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

    try {
      const res = await fetch(`${window.location.origin}/api/start_game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assassins: Array.from(selected) }),
      });

      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Error iniciant partida");

      router.push("/game");
    } catch (err: any) {
      console.error("Error iniciant la partida:", err);
      alert("Error iniciant la partida: " + (err.message || JSON.stringify(err)));
    }
  }

  // 🔹 Missatge estètic per jugador bloquejat
  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mystery text-white p-6">
        <div className="bg-black/40 p-6 rounded-2xl text-center shadow-md border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Partida ja iniciada</h2>
          <p className="text-gray-300">
            La partida ja ha començat i no pots unir-te. Espera la següent ronda!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-mystery text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Sala d'espera</h1>

        <div className="grid gap-4">
          {players.map((p) => (
            <div
              key={p.user_id}
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
                  {/* 🔹 S'ha eliminat la línia de rol/INVESTIGADOR */}
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
