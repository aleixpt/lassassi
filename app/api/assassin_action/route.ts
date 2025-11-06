// app/api/assassin_action/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assassin_player_id, target_player_id, round_id } = body || {};

    if (!assassin_player_id || !target_player_id) {
      return NextResponse.json({ ok: false, error: "Dades incompletes" }, { status: 400 });
    }

    // (Opcional) comprovar que assassin_player_id té rol 'assassin' i està viu
    const { data: assassin, error: aErr } = await supabaseAdmin
      .from("players")
      .select("id, role, is_alive")
      .eq("id", assassin_player_id)
      .maybeSingle();
    if (aErr) throw aErr;
    if (!assassin) return NextResponse.json({ ok: false, error: "Assassin no trobat" }, { status: 404 });
    if (assassin.role !== "assassin") {
      return NextResponse.json({ ok: false, error: "Jugador no autoritzat" }, { status: 403 });
    }
    if (!assassin.is_alive) {
      return NextResponse.json({ ok: false, error: "Assassin no està actiu" }, { status: 400 });
    }

    // Inserta acció d'assassinat
    const { error: insErr } = await supabaseAdmin.from("assassin_actions").insert([{
      round_id: round_id ?? null,
      assassin_player_id,
      target_player_id,
      executed_at: new Date().toISOString(),
    }]);

    if (insErr) throw insErr;

    // Marca el target com a mort/ghost
    const { error: updErr } = await supabaseAdmin
      .from("players")
      .update({ is_alive: false, is_ghost: true })
      .eq("id", target_player_id);

    if (updErr) throw updErr;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error a /api/assassin_action:", err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
