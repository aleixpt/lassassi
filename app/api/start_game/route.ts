// app/api/start-game/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

async function getUserFromToken(token: string | null) {
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;
  return data?.user ?? null;
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.email !== "aleixpt@gmail.com") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { roomId } = await req.json();
    if (!roomId) return NextResponse.json({ message: "Missing roomId" }, { status: 400 });

    // update room status
    const { error: e1 } = await supabaseAdmin.from("rooms").update({ status: "in_progress" }).eq("id", roomId);
    if (e1) {
      console.error("Error updating room:", e1);
      return NextResponse.json({ message: "DB error" }, { status: 500 });
    }

    // create first round (number = 1)
    const { data: round, error: rErr } = await supabaseAdmin
      .from("rounds")
      .insert({ room_id: roomId, number: 1, started_at: new Date().toISOString() })
      .select("*")
      .single();

    if (rErr) {
      console.error("Error creating round:", rErr);
      return NextResponse.json({ message: "DB error" }, { status: 500 });
    }

    // notify players
    const { data: players } = await supabaseAdmin.from("players").select("id").eq("room_id", roomId);
    if (players) {
      const now = new Date().toISOString();
      const notifications = players.map((p: any) => ({
        player_id: p.id,
        room_id: roomId,
        message: "La partida ha començat. Ronda 1 iniciada.",
        payload: { event: "game_started", roundId: round.id, roundNumber: 1 },
        created_at: now,
      }));
      const { error: notifErr } = await supabaseAdmin.from("notifications").insert(notifications);
      if (notifErr) console.error("Error inserting notifications:", notifErr);
    }

    return NextResponse.json({ ok: true, round });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
