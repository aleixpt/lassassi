"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

// Tipus de dades
interface Player {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export default function Waiting() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Obté sessió + subscripció a canvis
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        router.replace("/");
        return;
      }

      setUser(session.user);
      setIsAdmin(session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

      await fetchPlayers();

      const channel = supabase
        .channel("waiting-profiles")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "profiles" },
          () => fetchPlayers()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, [router]);

  // Obté jugadors de la taula "profiles"
  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, created_at")
      .order("created_at");

    if (error) console.error("Error obtenint jugadors:", error);
    else setPlayers(data || []);
  }

  // Marca/desmarca assassins seleccionats
  function toggle(id: string) {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(new Set(s));
  }

  // Assigna rols d’assassins
  async function assignAssassins() {
    if (!isAdmin) {
      alert("Només l'administrador pot fer això");
      return;
    }

    const arr = Array.from(selected);
    if (arr.length < 2 || arr.length > 3) {
      const cont = confirm(
        "Vols assignar menys de 2 o més de 3? Normalment són 2-3. Vols continuar?"
      );
      if (!cont) return;
    }

    try {
      const res = await fetch("/api/assign_roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assassins: arr }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Error");
      alert("Rols assignats correctament");
    } catch (err: any) {
      alert(err.message || String(err));
    }
  }

  // Inicia la partida
  async function startGame() {
    if (!isAdmin) {
      alert("Només l'administrador pot iniciar la partida");
      return;
    }

    const res = await fetch("/api/start_game", { method: "POST" });
    const j = await res.json();

    if (j.ok) router.push("/game");
    else alert("Error iniciant: " + (j.error || "unknown"));
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Sala d'espera</h1>

        <div className="space-y-3">
          {players.length === 0 ? (
            <p className="text-center text-gray-400">
              Encara no hi ha jugadors a la sala...
            </p>
          ) : (
            players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatar_url || "/default-avatar.png"}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">
                      {p.display_name || "Jugador"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(p.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-400">Assassí</label>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {isAdmin ? (
          <div className="space-y-3">
            <button
              onClick={assignAssassins}
              className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-semibold"
            >
              Assignar assassins seleccionats
            </button>
            <button
              onClick={startGame}
              className="w-full border border-gray-700 hover:bg-gray-800 py-2 rounded font-semibold"
            >
              Iniciar partida
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400">
            Esperant que l'administrador iniciï la partida...
          </p>
        )}
      </div>
    </div>
  );
}

