// app/api/submit_vote/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { voterPlayerId, trustMostId, trustLeastId } = body || {};

    if (!voterPlayerId || !trustMostId || !trustLeastId) {
      return NextResponse.json({ ok: false, error: "Dades incompletes" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("votes").insert([{
      round_id: null,
      voter_player_id: voterPlayerId,
      trust_most_player_id: trustMostId,
      trust_least_player_id: trustLeastId,
    }]);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("submit_vote error:", err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
