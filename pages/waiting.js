// pages/waiting.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import PlayerCard from '../components/PlayerCard'

export default function Waiting() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [players, setPlayers] = useState([])
  const roomId = 'main'
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'aleixpt@gmail.com'
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) router.push('/')
      else {
        setSession(data.session)
        setIsAdmin(data.session.user.email === adminEmail)
        joinRoom(data.session.user)
      }
    })

    const channel = supabase.channel('players-room-main')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => fetchPlayers())
      .subscribe()

    fetchPlayers()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function joinRoom(user) {
    await supabase.from('players').upsert({
      room_id: roomId,
      user_id: user.id
    }, { onConflict: 'user_id' })
    fetchPlayers()
  }

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*, profiles(display_name, avatar_url)').eq('room_id', roomId)
    setPlayers(data || [])
  }

  async function assignRoles() {
    if (!isAdmin) return alert('Solo admin')
    const n = Math.max(2, Math.round(players.length * 0.2))
    const r = await fetch('/api/assign_roles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, numAssassins: n })
    })
    const j = await r.json()
    if (j.ok) alert('Roles asignados')
  }

  async function startGame() {
    if (!isAdmin) return alert('Solo admin')
    const r = await fetch('/api/start_game', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId })
    })
    const j = await r.json()
    if (j.ok) router.push('/game')
    else alert('Error iniciando partida')
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto card">
        <h1 className="text-2xl font-bold text-blood-red mb-3">Sala d'espera</h1>
        <p className="text-sm text-muted-gray">Comparte el enlace con tus amigos para que se unan.</p>

        <div className="mt-4 space-y-2">
          {players.map(p => (
            <PlayerCard key={p.user_id} player={p} />
          ))}
        </div>

        {isAdmin && (
          <div className="mt-4 flex gap-2">
            <button onClick={assignRoles} className="button-primary">Asignar roles</button>
            <button onClick={startGame} className="py-2 px-4 rounded-2xl border border-gray-700">Iniciar partida</button>
          </div>
        )}
      </div>
    </div>
  )
}
