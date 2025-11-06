// app/api/assign_roles/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function POST(req: Request) {
  try {
    const { assassins } = await req.json();
    if (!Array.isArray(assassins)) {
      return NextResponse.json({ ok: false, error: "Llista d'assassins invàlida" }, { status: 400 });
    }

    // Reset roles
    await supabaseAdmin.from("players").update({ role: "investigator" }).eq("room_id", "main");

    // Assign assassins
    if (assassins.length > 0) {
      const { error } = await supabaseAdmin.from("players").update({ role: "assassin" }).in("id", assassins);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("assign_roles error:", err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
