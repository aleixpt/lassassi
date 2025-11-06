import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: Request) {
  try {
    const { assassins } = await req.json();

    if (!Array.isArray(assassins) || assassins.length === 0) {
      return NextResponse.json({ ok: false, error: "Cap assassí rebut" }, { status: 400 });
    }

    // Reseteja tots
    await supabaseAdmin.from("players").update({ role: "innocent" }).eq("room_id", "main");

    // Marca els seleccionats com assassins
    await supabaseAdmin.from("players").update({ role: "assassin" }).in("id", assassins);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error assignant rols:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
