"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function GameMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace("/");
        return;
      }
      const userId = data.session.user.id;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      setProfile(p || null);

      // Leer rol desde user_roles (si existeix la taula)
      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
      if (roleData) setRole(roleData.role);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-mystery p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <img src={profile?.avatar_url || "/default-avatar.png"} className="w-16 h-16 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{profile?.display_name || "Jugador"}</h1>
            <p className="text-sm text-muted-foreground">Rol: {role || "Sense assignar"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 rounded-lg bg-card/40" onClick={() => router.push("/profile")}>Veure Perfil</button>
          <button className="p-4 rounded-lg bg-card/40" onClick={() => router.push("/players")}>Jugadors</button>
          <button className="p-4 rounded-lg bg-card/40" onClick={() => router.push("/game/scan")}>Escàner QR</button>
          <button className="p-4 rounded-lg bg-card/40" onClick={() => router.push("/game/vote")}>Votació</button>
        </div>
      </div>
    </div>
  );
}
