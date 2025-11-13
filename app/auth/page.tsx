"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Verificant sessió...");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session) {
          setStatus("No s'ha pogut iniciar sessió. Torna-ho a intentar.");
          setTimeout(() => router.replace("/"), 2500);
          return;
        }

        const session = data.session;
        const user = session.user;

        const localName = localStorage.getItem("lassassi_display_name") || "";
        const localAvatar = localStorage.getItem("lassassi_avatar") || null;

        // Comprovem si l'usuari és admin (no creem perfil per l'admin)
        const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();
        const isAdmin = user.email && user.email.toLowerCase() === adminEmail;

        let avatarUrl: string | null = null;

        if (localAvatar) {
          try {
            const res = await fetch(localAvatar);
            const blob = await res.blob();
            const ext = blob.type.split("/")[1] || "png";
            const path = `avatars/${user.id}/avatar.${ext}`;
            // Pujar a bucket 'avatars' (ha d'existir)
            const { error: uploadError } = await supabase.storage
              .from("avatars")
              .upload(path, blob, { upsert: true });
            if (uploadError) {
              console.error("Error pujant avatar:", uploadError);
            } else {
              const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
              avatarUrl = urlData.publicUrl || null;
            }
          } catch (e) {
            console.error("Error convertint/uploadant avatar:", e);
          }
        }

        // Crear/actualitzar perfil només si no és admin
        if (!isAdmin) {
          const display_name = localName || user.email?.split("@")[0] || "Jugador";
          await supabase.from("profiles").upsert({
            id: user.id,
            display_name,
            avatar_url: avatarUrl,
          }, { returning: "minimal" });
        }

        // Netejem localStorage
        localStorage.removeItem("lassassi_display_name");
        localStorage.removeItem("lassassi_avatar");

        // Redirigim segons estat del joc
        const { data: gameState } = await supabase
          .from("game_state")
          .select("phase")
          .maybeSingle();

        if (gameState?.phase === "investigation") {
          router.replace("/game");
        } else {
          router.replace("/waiting");
        }
      } catch (err) {
        console.error(err);
        setStatus("Error d'autenticació. Torna a provar-ho.");
        setTimeout(() => router.replace("/"), 3000);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Validant el teu accés...</h2>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  );
}
