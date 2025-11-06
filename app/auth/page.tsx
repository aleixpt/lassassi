"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Validant el teu accés...");

  useEffect(() => {
    (async () => {
      try {
        // Intercanvi del token del magic link per la sessió
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          setStatus("No s'ha pogut verificar la sessió. Torna a iniciar sessió.");
          setTimeout(() => router.replace("/"), 3000);
          return;
        }

        const user = data.session.user;
        const localName = localStorage.getItem("lassassi_display_name");

        // Si no és l’administrador, el guardem a la taula profiles
        if (user.email !== "aleixpt@gmail.com" && localName) {
          await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              display_name: localName,
            })
            .eq("id", user.id);
          localStorage.removeItem("lassassi_display_name");
        }

        // Comprova si el joc està actiu
        const { data: gameState } = await supabase
          .from("game_state")
          .select("phase")
          .maybeSingle();

        // Redirigeix segons l’estat del joc o el tipus d’usuari
        if (user.email === "aleixpt@gmail.com") {
          router.replace("/waiting"); // o una pàgina especial d'administrador
        } else if (gameState?.phase === "investigation") {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-mystery text-white">
      <div className="card bg-black/50 backdrop-blur-md p-6 text-center border border-white/10">
        <h2 className="text-2xl font-semibold mb-2">Accedint al joc...</h2>
        <p className="text-gray-300 animate-pulse">{status}</p>
      </div>
    </div>
  );
}
