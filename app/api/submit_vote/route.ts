import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: Request) {
  try {
    const { roundId, voterPlayerId, trustMostId, trustLeastId } = await req.json();

    if (!voterPlayerId || !trustMostId || !trustLeastId) {
      return NextResponse.json({ ok: false, error: "Falten dades" }, { status: 400 });
    }

    await supabaseAdmin.from("votes").insert([
      { round_id: roundId, voter_id: voterPlayerId, trust_most_id: trustMostId, trust_least_id: trustLeastId },
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error registrant vot:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
