// app/game/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Eye, Users, QrCode, FileText, Vote } from "lucide-react";

export default function GameMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        router.replace("/auth");
        return;
      }
      setUser(session.user);
      setIsAdmin(session.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mystery flex items-center justify-center text-white">
        Carregant...
      </div>
    );
  }

  const cards = [
    { title: "El meu perfil", desc: "Veure el teu rol i estat", icon: <Eye className="h-6 w-6" />, path: "/profile" },
    { title: "Jugadors", desc: "Qui està viu/fantasma", icon: <Users className="h-6 w-6" />, path: "/players" },
    { title: "Escanejar QR", desc: "Llegir pistes amb la càmera", icon: <QrCode className="h-6 w-6" />, path: "/game/scan" },
    { title: "Les meves pistes", desc: "Pistes que has desbloquejat", icon: <FileText className="h-6 w-6" />, path: "/clues" },
    { title: "Votació", desc: "Vota el més/menys de confiança", icon: <Vote className="h-6 w-6" />, path: "/game/vote" },
  ];

  return (
    <div className="min-h-screen bg-gradient-mystery text-white p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-black/30 flex items-center justify-center text-2xl font-bold">
            {user?.email?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">L'assassí</h1>
            <p className="text-sm text-gray-300">Menú principal</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((c) => (
            <button
              key={c.path}
              onClick={() => router.push(c.path)}
              className="group bg-black/30 hover:bg-black/40 p-4 rounded-2xl border border-white/6 shadow-md flex items-center gap-4 transition"
            >
              <div className="p-3 rounded-lg bg-gradient-danger group-hover:scale-105 transition">
                {c.icon}
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">{c.title}</div>
                <div className="text-sm text-gray-300">{c.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-6">
            <button
              onClick={() => router.push("/admin")}
              className="w-full py-3 rounded-xl bg-secondary hover:opacity-95 font-semibold"
            >
              Panell d'Administrador
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
