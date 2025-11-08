import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // 🔹 Comprovació usuari admin
  const { data: { user } = {} } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 🔹 Llegeix llista d'assassins enviada pel client
  const body = await req.json();
  const assassins: string[] = body.assassins || [];

  try {
    // 🔹 Assigna rol als jugadors
    const { error: roleError } = await supabase
      .from("players")
      .update({
        role: supabase.raw(`CASE WHEN id = ANY($1) THEN 'assassin' ELSE 'investigator' END`, [assassins])
      });

    if (roleError) {
      console.error("Error assignant rols:", roleError);
      return NextResponse.json({ ok: false, error: "Error assignant rols" }, { status: 500 });
    }

    // 🔹 Actualitza fase global
    const { error: gsError } = await supabase
      .from("game_state")
      .update({ phase: "in_progress", current_round: 1 })
      .eq("id", 1);

    if (gsError) {
      console.error("Error actualitzant game_state:", gsError);
      return NextResponse.json({ ok: false, error: "Error actualitzant fase" }, { status: 500 });
    }

    // 🔹 Crea primera ronda
    const { error: roundError } = await supabase.from("rounds").insert([
      {
        number: 1,
        started_at: new Date().toISOString(),
      },
    ]);

    if (roundError) {
      console.error("Error creant ronda:", roundError);
      return NextResponse.json({ ok: false, error: "Error creant ronda" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Partida iniciada correctament" });
  } catch (err: any) {
    console.error("Error start_game:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
