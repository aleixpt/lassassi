"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PistasPage(){
  const [clues, setClues] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(()=> { load(); }, []);

  async function load(){
    try{
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      // query player_clues joined with clues
      const { data } = await supabase
        .from('player_clues')
        .select('unlocked_at, clues(id, title, content, is_corrupted)')
        .eq('player_id', (await supabase.from('players').select('id').eq('user_id', user.id).maybeSingle()).data?.id)
        .order('unlocked_at', { ascending: false });
      setClues(data || []);
    } catch(e){ console.error(e); alert(e.message || e); }
    finally{ setLoading(false); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregant...</div>

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Les meves pistes</h1>
          <button className="btn" onClick={()=>router.push('/game/scan')}>Escanear més</button>
        </div>

        {clues.length===0 ? (
          <div className="card text-center p-8 small-muted">Encara no tens pistes. Escaneja un QR!</div>
        ) : (
          clues.map((c)=> (
            <div key={c.clues.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{c.clues.title}</h3>
                  <div className="small-muted">{new Date(c.unlocked_at).toLocaleString()}</div>
                </div>
                {c.clues.is_corrupted && <div className="text-sm text-[rgba(198,40,40,0.9)]">Corrompida</div>}
              </div>
              <div className="mt-3 text-foreground whitespace-pre-wrap">{c.clues.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
