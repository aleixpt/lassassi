// app/api/record-vote/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { roundId, voterPlayerId, trustMostPlayerId, trustLeastPlayerId } = await req.json();
    if (!roundId || !voterPlayerId) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const { error } = await supabaseAdmin.from("votes").insert({
      round_id: roundId,
      voter_player_id: voterPlayerId,
      trust_most_player_id: trustMostPlayerId ?? null,
      trust_least_player_id: trustLeastPlayerId ?? null,
    });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
