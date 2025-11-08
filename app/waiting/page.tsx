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

  // 🔹 Comprovació d'usuari i càrrega inicial
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

      await ensurePlayerExists(currentUser.id);
      await fetchPlayers();

      // 🔁 Refresc automàtic cada 5 segons
      const interval = setInterval(fetchPlayers, 5000);
      return () => clearInterval(interval);
    })();
  }, [router]);

  // 🔹 Assegura que el jugador existeixi a la taula players
  async function ensurePlayerExists(userId: string) {
    try {
      const { error } = await supabase
        .from("players")
        .upsert(
          {
            user_id: userId,
            role: "investigator",
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

  // 🔹 Obtenir jugadors amb perfil
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
      // 🔹 Filtrar duplicats per user_id
      const uniquePlayers = Array.from(new Map(data.map(p => [p.user_id, p])).values());
      setPlayers(uniquePlayers);
    }
  }

  // 🔹 Seleccionar/desseleccionar assassins (només admin)
  function toggle(id: string) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }

  // 🔹 Iniciar partida (només admin)
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

      // 🔁 Quan s’inicia la partida → redirigeix tothom a /game
      router.push("/game");
    } catch (err: any) {
      console.error("Error iniciant la partida:", err);
      alert("Error iniciant la partida: " + (err.message || JSON.stringify(err)));
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-mystery text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">Sala d'espera</h1>

        {/* Llista de jugadors */}
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
                  <div className="text-xs text-gray-400">{p.role?.toUpperCase()}</div>
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

        {/* Botó per iniciar partida */}
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
