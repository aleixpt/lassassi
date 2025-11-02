// pages/game/scan.js
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const QRScanner = dynamic(() => import('../../components/QRScanner'), { ssr: false })

export default function Scan() {
  const router = useRouter()

  async function onResult(result) {
    if (!result) return
    try {
      // Buscar la pista en el backend (API) que usa service role (segura)
      const res = await fetch('/api/scan_qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: result })
      })
      const j = await res.json()
      if (!j.ok) throw new Error(j.error || 'Pista no trobada')

      // insertar la pista per al jugador actual utilitzant el client Supabase (anon key)
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id
      if (!userId) throw new Error('No hi ha sessió')

      // obtenir player.id
      const { data: playerData, error: pErr } = await supabase.from('players').select('id').eq('user_id', userId).single()
      if (pErr) throw pErr
      const playerId = playerData.id

      // insert player_clues (evitem duplicitats amb upsert)
      await supabase.from('player_clues').upsert({
        player_id: playerId,
        clue_id: j.clue.id
      })

      alert('Pista desbloquejada!')
    } catch (err) {
      alert('Error: ' + (err.message || err))
      console.error(err)
    } finally {
      router.push('/game')
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-xl mx-auto card">
        <h2 className="text-lg font-semibold text-blood-red mb-3">Escanejar QR</h2>
        <QRScanner onResult={onResult} />
      </div>
    </div>
  )
}
