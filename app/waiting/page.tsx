// app/waiting/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PlayerCard from "../../components/PlayerCard";
import { useRouter } from "next/navigation";

export default function Waiting() {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        router.replace("/");
        return;
      }
      setUser(session.user);
      setIsAdmin(session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
      await fetchPlayers();

      const ch = supabase
        .channel("waiting-profiles")
        .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchPlayers)
        .subscribe();

      return () => supabase.removeChannel(ch);
    })();
  }, []);

  async function fetchPlayers() {
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url, created_at").order("created_at");
    setPlayers(data || []);
  }

  function toggle(id) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  }

  async function assignAssassins() {
    if (!isAdmin) return alert("Només admin pot fer això");
    const arr = Array.from(selected);
    if (arr.length < 2 || arr.length > 3) {
      if (!confirm("Vols assignar menys de 2 o més de 3? Normalment són 2-3. Vols continuar?") ) return;
    }

    try {
      const res = await fetch("/api/assign_roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assassins: arr })
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Error");
      alert("Rols assignats correctament");
    } catch (err) {
      alert(err.message || err);
    }
  }

  async function startGame() {
    if (!isAdmin) return alert("Només admin pot iniciar la partida");
    const res = await fetch("/api/start_game", { method: "POST" });
    const j = await res.json();
    if (j.ok) {
      router.push("/game");
    } else {
      alert("Error iniciant: " + (j.error || "unknown"));
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground text-center">Sala d'espera</h1>

        <div className="grid gap-3">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={p.avatar_url || "/default-avatar.png"} alt="" className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-semibold">{p.display_name || "Jugador"}</div>
                  <div className="text-sm small-muted">{new Date(p.created_at).toLocaleTimeString()}</div>
                </div>
              </div>

              {isAdmin ? (
                <div className="flex items-center gap-3">
                  <label className="text-sm small-muted">Assassí</label>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {isAdmin ? (
          <div className="space-y-3">
            <button className="btn btn-primary w-full" onClick={assignAssassins}>
              Assignar assassins seleccionats
            </button>
            <button className="btn w-full border border-[rgba(255,255,255,0.06)]" onClick={startGame}>
              Iniciar partida
            </button>
          </div>
        ) : (
          <p className="text-center small-muted">Esperant que l'administrador iniciï la partida...</p>
        )}
      </div>
    </div>
  );
}
