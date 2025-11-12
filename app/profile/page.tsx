// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, FileText } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [showRole, setShowRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        router.replace("/auth");
        return;
      }
      const user = session.user;

      // Obtenim perfil (profiles)
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      // Obtenim rol si existeix a players
      const { data: playerRow } = await supabase.from("players").select("role,is_alive,is_ghost").eq("user_id", user.id).maybeSingle();

      // Si no hi ha perfil, créem objecte mínim (alguns usuaris admin no tenen perfil)
      const finalProfile = prof || {
        id: user.id,
        display_name: user.email?.split("@")[0],
        email: user.email,
        avatar_url: null,
        clues_count: 0,
        status: playerRow ? (playerRow.is_alive ? "alive" : "ghost") : "alive",
      };

      setProfile(finalProfile);

      // Determine role: players.role > user_roles > default amics (except admin)
      if (playerRow?.role) setRole(playerRow.role);
      else if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) setRole("admin");
      else setRole("amic");

      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregant...</div>;
  if (!profile) return null;

  const roleLabel = role === "assassin" ? "Assassí" : role === "admin" ? "Administrador" : "Amic";
  const roleColor = role === "assassin" ? "bg-red-600" : role === "admin" ? "bg-yellow-600" : "bg-green-600";

  return (
    <div className="min-h-screen bg-gradient-mystery p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <div className="bg-black/30 p-6 rounded-2xl border border-white/6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-black/40 flex items-center justify-center text-2xl font-bold">
              {profile.display_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{profile.display_name}</div>
              <div className="text-sm text-gray-300">{profile.email}</div>
            </div>
            <div>
              <button onClick={() => setShowRole(!showRole)} className="px-3 py-2 rounded-lg bg-black/40">
                {showRole ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {showRole ? (
              <div className={`inline-block ${roleColor} px-4 py-2 rounded-full font-semibold`}>{roleLabel}</div>
            ) : (
              <div className="text-sm text-gray-400">Prem l'ull per revelar el teu rol (privat).</div>
            )}

            <div className="mt-4 p-3 bg-black/20 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-clue" />
                  <div>
                    <div className="text-sm">Pistes desbloquejades</div>
                    <div className="font-semibold text-clue">{profile.clues_count || 0}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {profile.status === "ghost" ? "👻 Fantasma" : "Viu"}
                </div>
              </div>
            </div>

            {/* No hi ha botons d'escanejar ni votació aquí segons la teva petició */}
          </div>
        </div>
      </div>
    </div>
  );
}
