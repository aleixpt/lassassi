// app/api/get-notifications/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const playerId = url.searchParams.get("playerId");
  if (!playerId) return NextResponse.json({ message: "Missing playerId" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ message: "DB error" }, { status: 500 });
  return NextResponse.json({ notifications: data });
}
