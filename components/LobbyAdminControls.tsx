// components/LobbyAdminControls.tsx
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Player = { id: string; user_id?: string | null; role?: string; is_alive?: boolean; profile?: any };

export default function LobbyAdminControls({ roomId, players }: { roomId: string; players: Player[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init: Record<string, boolean> = {};
    players.forEach((p) => {
      init[p.id] = p.role === "assassin";
    });
    setSelected(init);
  }, [players]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const save = async () => {
    setLoading(true);
    try {
      const assassinIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);

      // get token
      const { data: { session } = {} } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/assign-roles", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roomId, assassinIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error");
      alert("Assignacions guardades");
    } catch (err: any) {
      console.error(err);
      alert("Error guardant assignacions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!confirm("Segur que vols iniciar la partida? Un cop iniciada no podràs seguir canviant rols (excepte via panell admin).")) return;
    setLoading(true);
    try {
      const { data: { session } = {} } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/start-game", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roomId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Error");
      alert("Partida iniciada!");
    } catch (err: any) {
      console.error(err);
      alert("Error iniciant la partida: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 border rounded">
      <h4 className="font-semibold">Controls d'administrador</h4>
      <p className="text-sm mb-2">Marca qui vols que sigui ASSASSÍ (per defecte: tots INVESTIGADOR).</p>

      <div className="grid gap-2">
        {players.map((p) => (
          <label key={p.id} className="flex items-center gap-2 p-2 border rounded">
            <input type="checkbox" checked={!!selected[p.id]} onChange={() => toggle(p.id)} />
            <span>{p.profile?.display_name ?? p.user_id ?? p.id}</span>
            <span className="ml-auto text-xs">{p.is_alive === false ? "FANTASMA" : p.role ?? "?"}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <button className="btn" onClick={save} disabled={loading}>Guardar assignacions</button>
        <button className="btn-primary" onClick={startGame} disabled={loading}>Iniciar partida</button>
      </div>
    </div>
  );
}
