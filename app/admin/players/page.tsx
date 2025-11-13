"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
    // subscripció realtime (opcional)
    const ch = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadPlayers())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  async function loadPlayers() {
    const { data } = await supabase.from("profiles").select("id, display_name, avatar_url");
    setPlayers(data || []);
    setLoading(false);
  }

  async function toggleAlive(playerId: string) {
    try {
      // primer agafem player (table players) per trobar id de player
      const { data: pl } = await supabase.from("players").select("id,is_alive").eq("user_id", playerId).maybeSingle();
      if (!pl) return alert("No s'ha trobat player (registre players)");
      const { error } = await supabase.from("players").update({ is_alive: !pl.is_alive }).eq("id", pl.id);
      if (error) throw error;
      loadPlayers();
    } catch (err: any) {
      alert(err.message || String(err));
    }
  }

  async function setRole(playerUserId: string, role: string) {
    try {
      // delete existing
      await supabase.from("user_roles").delete().eq("user_id", playerUserId);
      if (role !== "none") {
        const { error } = await supabase.from("user_roles").insert({ user_id: playerUserId, role });
        if (error) throw error;
      }
      loadPlayers();
    } catch (err: any) {
      alert(err.message || String(err));
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregant...</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-mystery">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Jugadors (Admin)</h1>

        <div className="space-y-3">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-card/30 p-3 rounded">
              <div className="flex items-center gap-3">
                <img src={p.avatar_url || "/default-avatar.png"} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-medium">{p.display_name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded bg-muted/70" onClick={() => toggleAlive(p.id)}>Toggle Alive</button>
                <select onChange={(e) => setRole(p.id, e.target.value)} defaultValue="none" className="p-2 rounded bg-card/20">
                  <option value="none">Sense rol</option>
                  <option value="investigator">Investigator</option>
                  <option value="assassin">Assassin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
