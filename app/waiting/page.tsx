"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PlayerCard from "../../components/PlayerCard";
import { useRouter } from "next/navigation";

export default function Waiting() {
  const [players, setPlayers] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { router.push("/auth"); return; }
      setUser(data.user);
      setIsAdmin(data.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    });
    fetchPlayers();

    const channel = supabase.channel('waiting-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchPlayers)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchPlayers() {
    const { data } = await supabase.from('profiles').select('id, display_name, avatar_url, created_at');
    setPlayers(data || []);
  }

  async function startGame() {
    if (!isAdmin) return alert('Només admin');
    // simple: set a room.status to running via API or update game_state
    const res = await fetch('/api/start_game', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ roomId: 'main'})});
    const j = await res.json();
    if (j.ok) router.push('/game');
    else alert('Error iniciant partida');
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground text-center">Sala d'espera</h1>

        <div className="grid gap-3">
          {players.map(p => <PlayerCard key={p.id} avatar={p.avatar_url} name={p.display_name || 'Jugador'} status={new Date(p.created_at).toLocaleTimeString()} />)}
        </div>

        {isAdmin ? (
          <div className="mt-4">
            <button className="btn btn-primary w-full" onClick={startGame}>Iniciar Partida</button>
          </div>
        ) : (
          <p className="text-center small-muted">Esperant que l'administrador iniciï la partida...</p>
        )}
      </div>
    </div>
  );
}
