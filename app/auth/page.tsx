"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verificant sessió...");

  useEffect(() => {
    (async () => {
      try {
        // Recuperem sessió actual
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          setStatus("Error d'autenticació. Torna a provar-ho.");
          setTimeout(() => router.replace("/"), 3000);
          return;
        }

        const user = data.session.user;
        const localName = localStorage.getItem("lassassi_display_name");

        // No creem perfil per l'admin
        if (user.email !== "aleixpt@gmail.com" && localName) {
          await supabase.from("profiles").upsert({
            id: user.id,
            display_name: localName,
          });
          localStorage.removeItem("lassassi_display_name");
        }

        // Comprovem l'estat del joc
        const { data: gameState } = await supabase
          .from("game_state")
          .select("phase")
          .maybeSingle();

        if (gameState?.phase === "in_progress") {
          router.replace("/game");
        } else {
          router.replace("/waiting");
        }
      } catch (err) {
        console.error(err);
        setStatus("Error processant autenticació.");
        setTimeout(() => router.replace("/"), 3000);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mystery">
      <div className="card p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Validant el teu accés...</h2>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  );
}
