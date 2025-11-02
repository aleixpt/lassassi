"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage(){
  const [players, setPlayers] = useState([]);
  const router = useRouter();

  useEffect(()=> { checkAdmin(); loadPlayers(); }, []);

  async function checkAdmin(){
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push('/auth');
    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) { alert('Sense permisos'); router.push('/waiting'); }
  }

  async function loadPlayers(){
    const { data } = await supabase.from('players').select('id, user_id, profiles(display_name, avatar_url), role, is_alive');
    setPlayers(data || []);
  }

  async function assignRoles(){
    // call rpc assign_roles via API
    await fetch('/api/assign_roles', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ roomId: 'main', numAssassins: Math.max(2, Math.round(players.length*0.2)) })});
    alert('Rols assignats');
    loadPlayers();
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Panell admin</h1>
        <div className="space-y-3">
          <button className="btn btn-primary" onClick={assignRoles}>Assignar rols</button>
          <div className="mt-4">
            {players.map(p=> <div key={p.id} className="card mb-2 flex items-center gap-3"><img src={p.profiles?.avatar_url} className="w-10 h-10 rounded-full" /> <div><div className="font-semibold">{p.profiles?.display_name}</div><div className="small-muted">{p.role || '—'}</div></div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
