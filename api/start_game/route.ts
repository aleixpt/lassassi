import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST() {
  try {
    const { data, error } = await supabaseAdmin
      .from("game_state")
      .select("id")
      .maybeSingle();

    if (error) throw error;

    if (data && data.id) {
      await supabaseAdmin
        .from("game_state")
        .update({ phase: "investigation", current_round: 1 })
        .eq("id", data.id);
    } else {
      await supabaseAdmin
        .from("game_state")
        .insert([{ phase: "investigation", current_round: 1 }]);
    }

    await supabaseAdmin
      .from("players")
      .update({ is_alive: true, is_ghost: false })
      .eq("room_id", "main");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error iniciant partida:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
