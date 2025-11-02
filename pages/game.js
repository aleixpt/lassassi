// pages/game.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import PlayerCard from '../components/PlayerCard'

export default function Game() {
  const router = useRouter()
  const [player, setPlayer] = useState(null)
  const [players, setPlayers] = useState([])
  const [clues, setClues] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) router.push('/')
      else loadPlayer(data.session.user.id)
    })
  }, [])

  async function loadPlayer(userId) {
    const { data } = await supabase.from('players').select('*, profiles(display_name,avatar_url)').eq('user_id', userId).single()
    setPlayer(data)
    fetchPlayers()
    fetchPlayerClues(data?.id)
  }

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('*, profiles(display_name,avatar_url)').eq('room_id', 'main')
    setPlayers(data || [])
  }

  async function fetchPlayerClues(pid) {
    if (!pid) return
    const { data } = await supabase.from('player_clues').select('clue_id, clues(*)').eq('player_id', pid)
    setClues(data || [])
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto card">
        <h1 className="text-2xl font-bold text-blood-red mb-3">Menú de la partida</h1>

        <div className="mb-4">
          <div className="font-semibold">Tu rol</div>
          <div className="p-3 rounded bg-black/20 mt-2">{player?.role ?? 'Desconocido'}</div>
          <div className="text-xs text-muted-gray mt-1">Secreto — no lo enseñes a nadie</div>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold mb-2">Pistas desbloqueadas</h2>
          {clues.length === 0 ? <p className="text-sm text-muted-gray">Aún no tienes pistas.</p> : clues.map(c => (
            <div key={c.clue_id} className="p-2 bg-black/30 rounded mb-2">{c.clues.title}</div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => router.push('/game/scan')} className="py-2 px-4 rounded-2xl border border-gray-700">Leer QR</button>
          <button onClick={() => router.push('/game/vote')} className="button-primary">Votación</button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Jugadores</h3>
          <div className="space-y-2">
            {players.map(p => <PlayerCard key={p.user_id} player={p} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
