"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function VotePage(){
  const [players, setPlayers] = useState([]);
  const [most, setMost] = useState('');
  const [least, setLeast] = useState('');
  const [timer, setTimer] = useState(60);
  const [running, setRunning] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const router = useRouter();

  useEffect(()=> {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/auth');
      else supabase.from('players').select('id').eq('user_id', data.user.id).maybeSingle().then(r=> setPlayerId(r.data?.id));
    });
    loadPlayers();
  }, []);

  function loadPlayers(){
    supabase.from('players').select('id, profiles(display_name)').eq('room_id','main').then(r=> setPlayers(r.data || []));
  }

  useEffect(()=>{
    let it;
    if (running && timer>0) it = setInterval(()=> setTimer(t=>t-1), 1000);
    else if (timer===0 && running) submitVote();
    return ()=> clearInterval(it);
  }, [running,timer]);

  function start(){
    setTimer(60); setRunning(true);
  }

  async function submitVote(){
    setRunning(false);
    try{
      await fetch('/api/submit_vote', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ roundId: null, voterPlayerId: playerId, trustMostId: most, trustLeastId: least })});
      alert('Vot registrat');
      router.push('/game');
    }catch(e){ alert(e.message || e) }
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-xl mx-auto card">
        <h2 className="text-xl font-semibold mb-3">Votació</h2>
        {!running ? <button className="btn btn-primary w-full" onClick={start}>Iniciar votació</button> : (
          <div>
            <div className="text-2xl font-bold">{timer}s</div>
            <div className="mt-3">
              <label className="text-sm">Confiat</label>
              <select className="w-full p-2 mt-1 bg-black/20 rounded" value={most} onChange={e=>setMost(e.target.value)}>
                <option value="">—</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.profiles?.display_name || p.id}</option>)}
              </select>
              <label className="text-sm mt-3 block">Menys confiat</label>
              <select className="w-full p-2 mt-1 bg-black/20 rounded" value={least} onChange={e=>setLeast(e.target.value)}>
                <option value="">—</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.profiles?.display_name || p.id}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
