"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) return router.replace("/auth");
      // comprovar que és admin: compara email amb env var
      const isAdmin = data.session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (!isAdmin) return router.replace("/waiting");
      const { data: gs } = await supabase.from("game_state").select("*").maybeSingle();
      setGameState(gs || null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregant...</div>;

  return (
    <div className="min-h-screen bg-gradient-mystery p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Panel Administrador</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-card/30 rounded">
            <h2 className="font-semibold">Estat del joc</h2>
            <p>Fase: {gameState?.phase || "waiting"}</p>
            <p>Ronda: {gameState?.current_round ?? 0}</p>
            <div className="mt-3">
              <button className="px-4 py-2 bg-destructive text-white rounded" onClick={() => router.push("/admin/players")}>Gestionar Jugadors</button>
            </div>
          </div>

          <div className="p-4 bg-card/30 rounded">
            <h2 className="font-semibold">Controls</h2>
            <p className="text-sm text-muted-foreground">Inicia votacions, canvia rols i reinicia el progrés des d'aquí</p>
          </div>
        </div>
      </div>
    </div>
  );
}
