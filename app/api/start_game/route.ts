import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();
  const { assassins } = body;

  if (!assassins || !Array.isArray(assassins)) {
    return NextResponse.json({ ok: false, error: "Assassins no proporcionats" }, { status: 400 });
  }

  // Només hi ha una partida a la vegada
  const { data: game } = await supabase.from("game_state").select("*").maybeSingle();
  if (!game) return NextResponse.json({ ok: false, error: "No hi ha partida creada" });

  try {
    // Actualitzar rols dels jugadors
    await supabase.from("players").update({ role: "assassin" }).in("id", assassins);
    await supabase.from("players").update({ role: "investigator" }).not("id", "in", assassins);

    // Canviar fase a in_progress i ronda 1
    await supabase.from("game_state").update({ phase: "in_progress", current_round: 1 }).eq("id", game.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
