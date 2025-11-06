// app/game/vote/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function VotePage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [most, setMost] = useState("");
  const [least, setLeast] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/"); return; }
      const { data } = await supabase.from("profiles").select("id, display_name").order("display_name");
      setPlayers(data || []);
      setLoading(false);
    })();
  }, [router]);

  async function submitVote(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Obtenir player id
      const { data: playerRow } = await supabase.from("players").select("id").eq("user_id", user.id).maybeSingle();
      const voterPlayerId = playerRow?.id;
      const res = await fetch("/api/submit_vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterPlayerId, trustMostId: most, trustLeastId: least }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error enviant vot");
      alert("Vot registrat!");
      router.push("/game");
    } catch (err: any) {
      alert(err.message || err);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregant...</div>;

  return (
    <div className="min-h-screen bg-gradient-mystery p-6 text-white">
      <div className="max-w-xl mx-auto bg-black/50 p-6 rounded-2xl border border-white/8">
        <h2 className="text-xl font-bold mb-4">Votació</h2>
        <form onSubmit={submitVote} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Jugador de confiança</label>
            <select value={most} onChange={(e)=>setMost(e.target.value)} className="w-full p-3 rounded-md bg-[#0b0b0d]">
              <option value="">—</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Jugador menys confiat</label>
            <select value={least} onChange={(e)=>setLeast(e.target.value)} className="w-full p-3 rounded-md bg-[#0b0b0d]">
              <option value="">—</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select>
          </div>

          <button className="w-full py-2 rounded-md bg-blood-red" type="submit">Enviar vot</button>
        </form>
      </div>
    </div>
  );
}
