// pages/api/start_game.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    // Upsert a single row game_state
    const { data } = await supabaseAdmin.from("game_state").select("id").maybeSingle();

    if (data && data.id) {
      await supabaseAdmin.from("game_state").update({ phase: "investigation", current_round: 1 }).eq("id", data.id);
    } else {
      await supabaseAdmin.from("game_state").insert([{ phase: "investigation", current_round: 1 }]);
    }

    // also ensure all players are alive initially
    await supabaseAdmin.from("players").update({ is_alive: true, is_ghost: false }).eq("room_id", "main");

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}
