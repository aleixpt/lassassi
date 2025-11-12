// app/api/assign-roles/route.ts
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

    // admin hardcoded by email
    if (user.email !== "aleixpt@gmail.com") {
      return NextResponse.json({ message: "Forbidden - not admin" }, { status: 403 });
    }

    const body = await req.json();
    const { roomId, assassinIds } = body;
    if (!roomId || !Array.isArray(assassinIds)) {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    // 1) Set all players in room to amic
    const { error: e1 } = await supabaseAdmin
      .from("players")
      .update({ role: "amic" })
      .eq("room_id", roomId);

    if (e1) {
      console.error("Error setting amics:", e1);
      return NextResponse.json({ message: "DB error" }, { status: 500 });
    }

    // 2) Set selected to assassin (if any)
    if (assassinIds.length > 0) {
      const { error: e2 } = await supabaseAdmin
        .from("players")
        .update({ role: "assassin" })
        .in("id", assassinIds);

      if (e2) {
        console.error("Error setting assassins:", e2);
        return NextResponse.json({ message: "DB error" }, { status: 500 });
      }
    }

    // 3) Insert notifications for affected players (those que han passat a assassin i els que han estat revertits)
    // Obtenim llistat de players de la sala per comparar rols anteriors si vols; per simplicitat, n'enviem una notificació a tots:
    const { data: players } = await supabaseAdmin
      .from("players")
      .select("id, user_id")
      .eq("room_id", roomId);

    if (players) {
      const now = new Date().toISOString();
      const notifications = players.map((p: any) => {
        const isAssassin = assassinIds.includes(p.id);
        return {
          player_id: p.id,
          room_id: roomId,
          message: isAssassin
            ? "Has estat assignat/da com a ASSASSÍ per l'administrador."
            : "Ets AMIC per aquesta partida.",
          payload: { role: isAssassin ? "assassin" : "amic" },
          created_at: now,
        };
      });

      // Insertem en bloc
      const { error: notifErr } = await supabaseAdmin.from("notifications").insert(notifications);
      if (notifErr) console.error("Error inserting notifications:", notifErr);
    }

    // 4) Return updated players list (per facilitar UI client)
    const { data: updatedPlayers } = await supabaseAdmin
      .from("players")
      .select("id, role, is_alive, is_ghost, room_id")
      .eq("room_id", roomId);

    return NextResponse.json({ ok: true, players: updatedPlayers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
