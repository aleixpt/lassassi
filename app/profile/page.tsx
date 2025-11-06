"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfileLanding() {
  const router = useRouter();
  const [status, setStatus] = useState("Comprovant sessió...");

  useEffect(() => {
    (async () => {
      try {
        // 1) Intentem recuperar la sessió actual (si Supabase ja ha establert la sessió)
        const s = await supabase.auth.getSession();
        if (!s.data?.session) {
          // Supabase pot utilitzar el hash o query params: intentar intercanviar codi (opcional)
          // Si l'enllaç no ha estat processat, Supabase JS pot fer-ho automàticament en navegadors moderns.
          setStatus("Esperant la confirmació del correu...");
          // Deixa un curt delay per si Supabase està processant.
          await new Promise((r) => setTimeout(r, 800));
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (!session) {
          // Si encara no hi ha sessió, redirigeix a landing
          setStatus("No s'ha pogut establir la sessió. Torna-ho a intentar.");
          setTimeout(() => router.replace("/"), 2000);
          return;
        }

        const user = session.user;

        // 2) Recuperem nom guardat al localStorage
        const localName = (localStorage.getItem("lassassi_display_name") || "").trim();

        // 3) Fem upsert al perfil per assegurar que el display_name queda guardat
        if (localName) {
          const { error: upErr } = await supabase.from("profiles").upsert({
            id: user.id,
            display_name: localName
          });
          if (upErr) {
            console.error("Error upserting profile:", upErr);
          }
        } else {
          // si no hi ha localName i no existeix perfil, el trigger ja hauria creat un perfil amb email
          // Opcional: podríem demanar nom al primer inici de sessió
        }

        // 4) Redirigeix segons l'estat de la partida
        const { data: gs } = await supabase.from("game_state").select("phase").maybeSingle();
        if (gs && gs.phase === "investigation") router.replace("/game");
        else router.replace("/waiting");
      } catch (err: any) {
        console.error(err);
        setStatus("S'ha produït un error: " + (err.message || err));
        setTimeout(() => router.replace("/"), 3000);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card p-6">
        <div className="text-center">
          <div className="text-lg font-semibold">Iniciant sessió...</div>
          <div className="text-sm text-gray-400 mt-2">No tanquis aquesta finestra — et redirigirem en breu.</div>
        </div>
      </div>
    </div>
  );
}

