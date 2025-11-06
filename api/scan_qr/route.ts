// app/api/scan_qr/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qr_code, user_id } = body || {};

    if (!qr_code) {
      return NextResponse.json({ ok: false, error: "Falta qr_code" }, { status: 400 });
    }
    if (!user_id) {
      return NextResponse.json({ ok: false, error: "Falta user_id" }, { status: 400 });
    }

    // 1) troba la pista per qr_code
    const { data: clue, error: clueErr } = await supabaseAdmin
      .from("clues")
      .select("*")
      .eq("qr_code", qr_code)
      .maybeSingle();

    if (clueErr) throw clueErr;
    if (!clue) {
      return NextResponse.json({ ok: false, error: "Codi QR no trobat" }, { status: 404 });
    }

    // 2) troba el player per user_id (assumim room_id = 'main')
    const { data: playerRow, error: playerErr } = await supabaseAdmin
      .from("players")
      .select("id")
      .eq("user_id", user_id)
      .eq("room_id", "main")
      .maybeSingle();

    if (playerErr) throw playerErr;
    if (!playerRow) {
      return NextResponse.json({ ok: false, error: "Jugador no trobat a la partida" }, { status: 404 });
    }

    const player_id = playerRow.id;

    // 3) Inserta a player_clues si no existeix
    const { data: existing } = await supabaseAdmin
      .from("player_clues")
      .select("*")
      .eq("player_id", player_id)
      .eq("clue_id", clue.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, already_unlocked: true, clue });
    }

    const { error: insErr } = await supabaseAdmin
      .from("player_clues")
      .insert([{ player_id, clue_id: clue.id }]);

    if (insErr) throw insErr;

    // Opcional: actualitza un comptador a profiles si vols (si guardes relació user_id->profile)
    // await supabaseAdmin.from('profiles').update({ clues_count: ... }).eq('id', user_id)

    return NextResponse.json({ ok: true, clue });
  } catch (err: any) {
    console.error("Error a /api/scan_qr:", err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
