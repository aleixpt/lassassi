export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { roomId, numAssassins } = req.body
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/assign_roles`, {
      method: 'POST',
      headers: {
        apikey: SERVICE,
        Authorization: `Bearer ${SERVICE}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_room: roomId, p_num_assassins: numAssassins })
    })
    if (!r.ok) {
      const txt = await r.text()
      return res.status(500).json({ ok:false, error: txt })
    }
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ ok:false, error: err.message })
  }
}
