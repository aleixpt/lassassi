"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PlayerCard from "../../components/PlayerCard";

export default function PlayersPage(){
  const [players, setPlayers] = useState([]);
  useEffect(()=>{ load(); const ch = supabase.channel('profiles-ch').on('postgres_changes',{event:'*',schema:'public',table:'profiles'}, load).subscribe(); return ()=> supabase.removeChannel(ch); }, []);
  async function load(){ const { data } = await supabase.from('profiles').select('id, display_name, avatar_url, status, clues_count'); setPlayers(data||[]); }

  const alive = players.filter(p=>p.status==='alive');
  const ghosts = players.filter(p=>p.status==='ghost');

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Jugadors</h1>
        <div className="space-y-3">
          {alive.map(p=> <PlayerCard key={p.id} avatar={p.avatar_url} name={p.display_name} status="Viu" />)}
        </div>
        {ghosts.length>0 && <div className="mt-6">
          <h2 className="text-lg font-semibold">Fantasmes</h2>
          <div className="space-y-3 mt-2">{ghosts.map(p=> <PlayerCard key={p.id} avatar={p.avatar_url} name={p.display_name} status="Fantasma" />)}</div>
        </div>}
      </div>
    </div>
  );
}
