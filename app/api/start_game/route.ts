import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies as nextCookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies }); 
  // PASA EL REPOSITORI DE SUPABASE QUE AUTOMÀTICAMENT USARÀ GET/SET
  // El client és capaç de resoldre-ho internament
  const body = await req.json();
  const { assassins } = body;

  if (!assassins || !Array.isArray(assassins)) {
    return NextResponse.json({ ok: false, error: "Assassins no proporcionats" }, { status: 400 });
  }

  try {
    let { data: game } = await supabase.from("game_state").select("*").maybeSingle();

    if (!game) {
      const { data: newGame } = await supabase
        .from("game_state")
        .insert({ phase: "in_progress", current_round: 1 })
        .select()
        .maybeSingle();
      game = newGame;
    } else {
      await supabase
        .from("game_state")
        .update({ phase: "in_progress", current_round: 1 })
        .eq("id", game.id);
    }

    if (assassins.length > 0) {
      await supabase.from("players").update({ role: "assassin" }).in("id", assassins);
      await supabase.from("players").update({ role: "investigator" }).not("id", "in", assassins);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
