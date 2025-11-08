// app/api/unlock-clue/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { playerId, qr } = await req.json();
    if (!playerId || !qr) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    // busca la pista per qr_code
    const { data: clue, error: clueErr } = await supabaseAdmin
      .from("clues")
      .select("*")
      .eq("qr_code", qr)
      .single();

    if (clueErr || !clue) return NextResponse.json({ message: "Clue not found" }, { status: 404 });

    // crea relació player_clues (si no existeix)
    const { error: upErr } = await supabaseAdmin
      .from("player_clues")
      .insert({ player_id: playerId, clue_id: clue.id, unlocked_at: new Date().toISOString() })
      .onConflict("(player_id, clue_id)")
      .ignore();

    if (upErr) {
      console.error(upErr);
      return NextResponse.json({ message: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, title: clue.title });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
