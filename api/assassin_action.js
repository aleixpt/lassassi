export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end()
  const { assassinPlayerId, targetPlayerId, roundId } = req.body
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    // insert action
    const r = await fetch(`${SUPABASE_URL}/rest/v1/assassin_actions`, {
      method: 'POST',
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ assassin_player_id: assassinPlayerId, target_player_id: targetPlayerId, round_id: roundId })
    })
    if (!r.ok) return res.status(500).json({ ok:false, error: await r.text() })
    // kill the target (set is_alive=false, is_ghost=true)
    const r2 = await fetch(`${SUPABASE_URL}/rest/v1/players?id=eq.${targetPlayerId}`, {
      method: 'PATCH',
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ is_alive: false, is_ghost: true })
    })
    if (!r2.ok) return res.status(500).json({ ok:false, error: await r2.text() })
    return res.json({ ok:true })
  } catch (err) { return res.status(500).json({ ok:false, error: err.message }) }
}
