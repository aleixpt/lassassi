// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [showRole, setShowRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/"); return; }
      const userId = session.user.id;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) console.error(error);
      setProfile(data || { id: userId, display_name: session.user.email });
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregant...</div>;

  return (
    <div className="min-h-screen bg-gradient-mystery p-6 text-white">
      <div className="max-w-lg mx-auto bg-black/50 p-6 rounded-2xl border border-white/8">
        <h2 className="text-2xl font-bold mb-2">Perfil</h2>
        <div className="mb-4">
          <div className="font-semibold text-lg">{profile.display_name}</div>
          <div className="text-sm text-gray-400">{profile.email}</div>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowRole((s) => !s)}
            className="px-4 py-2 rounded-md bg-gray-800"
          >
            {showRole ? "Amagar rol" : "Veure rol secret"}
          </button>
          {showRole && (
            <div className="mt-3 p-3 bg-black/40 rounded-md">
              <div className="font-semibold">{profile.role ?? "Sense rol assignat"}</div>
              <div className="text-sm text-gray-400">Aquest rol és privat — no el mostris als altres.</div>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => router.push("/game/scan")} className="mr-2 px-4 py-2 rounded-md bg-clue">Escanejar QR</button>
          <button onClick={() => router.push("/game/vote")} className="px-4 py-2 rounded-md bg-trust">Votació</button>
        </div>
      </div>
    </div>
  );
}
