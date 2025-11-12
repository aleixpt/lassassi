import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase server-side client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assassins } = body;

    // 🔹 Només array d'assassins
    if (!assassins || !Array.isArray(assassins)) {
      return NextResponse.json(
        { ok: false, error: "Assassins no proporcionats" },
        { status: 400 }
      );
    }

    // 🔹 Només hi ha una partida a la vegada
    let { data: game, error: fetchError } = await supabase
      .from("game_state")
      .select("*")
      .maybeSingle();
    if (fetchError) throw fetchError;

    if (!game) {
      // Crear registre si no existeix
      const { data: newGame, error: insertError } = await supabase
        .from("game_state")
        .insert({ phase: "in_progress", current_round: 1 })
        .select()
        .maybeSingle();
      if (insertError) throw insertError;
      game = newGame;
    } else {
      // Reiniciar partida existent
      const { error: updateError } = await supabase
        .from("game_state")
        .update({ phase: "in_progress", current_round: 1 })
        .eq("id", game.id);
      if (updateError) throw updateError;
    }

    // 🔹 Assignar rols dels jugadors
    if (assassins.length > 0) {
      // Assassins
      const { error: assassinError } = await supabase
        .from("players")
        .update({ role: "assassin" })
        .in("id", assassins);
      if (assassinError) throw assassinError;

      // Investigadors (tots els altres)
      const { data: allPlayers } = await supabase.from("players").select("id");
      const investigatorIds = allPlayers
        ?.map((p) => p.id)
        .filter((id) => !assassins.includes(id)) || [];

      if (investigatorIds.length > 0) {
        const { error: investigatorError } = await supabase
          .from("players")
          .update({ role: "amic" })
          .in("id", investigatorIds);
        if (investigatorError) throw investigatorError;
      }
    } else {
      // Cap assassí seleccionat → tots investigadors existents
      const { data: allPlayers } = await supabase.from("players").select("id");
      const playerIds = allPlayers?.map((p) => p.id) || [];

      if (playerIds.length > 0) {
        const { error: investigatorError } = await supabase
          .from("players")
          .update({ role: "amic" })
          .in("id", playerIds);
        if (investigatorError) throw investigatorError;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error iniciant partida:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
