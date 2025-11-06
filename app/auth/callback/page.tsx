"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Verificant sessió...");

  useEffect(() => {
    (async () => {
      try {
        // 🔹 Intercanvia el codi del magic link per una sessió vàlida
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setStatus("No s'ha pogut iniciar sessió. Torna-ho a intentar.");
          setTimeout(() => router.replace("/"), 3000);
          return;
        }

        const session = data.session;
        const user = session.user;

        // 🔹 Recuperem el nom desat localment
        const localName = localStorage.getItem("lassassi_display_name");

        // 🔹 Només inserim a la taula `profiles` si NO és l'administrador
        if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && localName) {
          await supabase.from("profiles").upsert({
            id: user.id,
            display_name: localName,
            email: user.email,
          });
          localStorage.removeItem("lassassi_display_name");
        }

        // 🔹 Comprovem si el joc ja ha començat
        const { data: gameState } = await supabase
          .from("game_state")
          .select("phase")
          .maybeSingle();

        // 🔹 Si el joc està en marxa → cap a /game, sinó → /waiting
        if (gameState?.phase === "investigation") {
          setStatus("Partida en curs. Redirigint al joc...");
          router.replace("/game");
        } else {
          setStatus("Benvingut! Redirigint a la sala d'espera...");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-mystery">
      <div className="card p-6 text-center max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2 text-foreground">
          Validant el teu accés...
        </h2>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  );
}
