"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [showRole, setShowRole] = useState(false);
  const router = useRouter();

  useEffect(()=> {
    (async ()=> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      // read role if exists in players table or user_roles
      const { data: p } = await supabase.from('players').select('role').eq('user_id', user.id).maybeSingle();
      if (p) setRole(p.role);
    })();
  }, []);

  if (!profile) return <div className="min-h-screen flex items-center justify-center">Carregant..</div>

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <img src={profile.avatar_url || '/default-avatar.png'} className="w-20 h-20 rounded-full" />
          <div>
            <h2 className="text-2xl font-bold">{profile.display_name || 'Jugador'}</h2>
            <div className="small-muted">{profile.created_at && new Date(profile.created_at).toLocaleString()}</div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Rol secret</h3>
              <div className="small-muted">Mostra el teu rol només a tu</div>
            </div>
            <button className="btn border border-[rgba(255,255,255,0.05)]" onClick={()=>setShowRole(s=>!s)}>{showRole ? 'Amagar' : 'Revelar'}</button>
          </div>
          {showRole && <div className="mt-3"><span className={`px-3 py-2 rounded ${role==='assassin' ? 'bg-[rgba(198,40,40,0.15)]' : 'bg-[rgba(45,150,80,0.12)]'}`}>{role || 'No assignat'}</span></div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={()=>router.push('/game/scan')} className="btn btn-primary w-full">Escanejar QR</button>
          <button onClick={()=>router.push('/game/vote')} className="btn w-full border border-[rgba(255,255,255,0.05)]">Votació</button>
        </div>
      </div>
    </div>
  );
}
