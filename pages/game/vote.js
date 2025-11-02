// pages/game/vote.js
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Vote() {
  const router = useRouter()
  const [players, setPlayers] = useState([])
  const [most, setMost] = useState('')
  const [least, setLeast] = useState('')
  const [timer, setTimer] = useState(60)
  const [running, setRunning] = useState(false)
  const [playerId, setPlayerId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) router.push('/')
      else {
        supabase.from('players').select('id').eq('user_id', data.session.user.id).single().then(res => setPlayerId(res.data?.id))
      }
    })
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    const { data } = await supabase.from('players').select('id, profiles(display_name)').eq('room_id', 'main')
    setPlayers(data || [])
  }

  useEffect(() => {
    let it
    if (running && timer > 0) it = setInterval(() => setTimer(t => t - 1), 1000)
    else if (timer === 0 && running) submitVote()
    return () => clearInterval(it)
  }, [running, timer])

  function startCountdown() {
    setTimer(60)
    setRunning(true)
  }

  async function submitVote() {
    setRunning(false)
    try {
      await fetch('/api/submit_vote', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          roundId: null, voterPlayerId: playerId, trustMostId: most, trustLeastId: least
        })
      })
      alert('Voto registrado')
      router.push('/game')
    } catch (err) {
      alert('Error enviando voto')
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto card">
        <h2 className="text-lg font-semibold text-blood-red mb-3">Votación</h2>
        {!running ? (
          <div>
            <p className="text-sm text-muted-gray mb-3">Sólo el admin inicia la votación desde la sala, pero puedes probar iniciar aquí.</p>
            <button onClick={startCountdown} className="button-primary">Iniciar votación</button>
          </div>
        ) : (
          <div>
            <div className="text-xl font-bold">{timer}s</div>
            <div className="mt-3">
              <label className="text-sm">Confiado (most)</label>
              <select onChange={e => setMost(e.target.value)} className="w-full p-2 mt-1 bg-black/20 rounded">
                <option value="">—</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.profiles?.display_name || p.id}</option>)}
              </select>
              <label className="text-sm mt-3 block">Menos confiado (least)</label>
              <select onChange={e => setLeast(e.target.value)} className="w-full p-2 mt-1 bg-black/20 rounded">
                <option value="">—</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.profiles?.display_name || p.id}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
