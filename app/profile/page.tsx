// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ProfileLanding() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session) {
          // No hi ha sessió: torna a la pàgina principal
          router.replace("/");
          return;
        }

        const user = session.user;
        // Check si ja existeix profile
        const { data: profileData, error: profErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profErr) throw profErr;

        if (!profileData) {
          // agafem el nom des del localStorage si existeix
          const name = (localStorage.getItem("lassassi_display_name") || "").trim();

          // upsert profile
          const { error: upErr } = await supabase.from("profiles").upsert({
            id: user.id,
            display_name: name || null,
            avatar_url: null
          });
          if (upErr) throw upErr;
        }

        // Ara comprovem l'estat de la partida
        const { data: gs } = await supabase.from("game_state").select("phase").maybeSingle();

        // Si la partida ja està en fase 'investigation' (activa), enviar a /game
        if (gs && gs.phase === "investigation") {
          router.replace("/game");
        } else {
          // si no, a la sala d'espera
          router.replace("/waiting");
        }
      } catch (err) {
        console.error(err);
        alert("Error gestionant el perfil: " + (err.message || err));
        router.replace("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card">
        <div className="p-6 text-center">
          <div className="text-lg font-semibold">Comprovant la teva sessió...</div>
        </div>
      </div>
    </div>
  );
}
