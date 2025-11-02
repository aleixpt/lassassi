import fetch from 'node-fetch'
export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end()
  const { qrCode } = req.body
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
  try {
    // find clue by qr_code
    const r = await fetch(`${SUPABASE_URL}/rest/v1/clues?qr_code=eq.${encodeURIComponent(qrCode)}`, {
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }
    })
    const data = await r.json()
    if (!data || data.length === 0) return res.json({ ok:false, error:'Pista no trobada' })
    const clue = data[0]
    // Need to know player id from session — but this is server-side without auth.
    // We expect client to call this endpoint with auth cookie; but easier: client should call supabase client to add player_clues.
    // For simplicity here we return the clue and the client will insert into player_clues.
    return res.json({ ok:true, clue })
  } catch (err) {
    return res.status(500).json({ ok:false, error: err.message })
  }
}
