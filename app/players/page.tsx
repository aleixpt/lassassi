// app/players/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();

    // realtime: actualitza quan canvii la taula profiles o players
    const ch1 = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => loadPlayers()
      )
      .subscribe();

    const ch2 = supabase
      .channel("players-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => loadPlayers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, []);

  async function loadPlayers() {
    setLoading(true);
    try {
      // Fem JOIN entre profiles i players per tenir estat i pistes
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          display_name,
          avatar_url,
          created_at,
          players!left(is_alive, is_ghost, role),
          clues_count
        `)
        .order("display_name", { ascending: true });

      if (error) throw error;

      // Filtrar admin si hi és a profiles (si vols que no aparegui)
      const filtered = (data || []).filter((p: any) => {
        const emailOrName = (p.display_name || "")?.toLowerCase();
        const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();
        return emailOrName !== "aleixpt" && emailOrName !== "admin" && p.email !== adminEmail;
      });

      // Normalize
      const normalized = (filtered || []).map((p: any) => ({
        id: p.id,
        name: p.display_name || p.id,
        avatar_url: p.avatar_url,
        status: p.players?.[0] ? (p.players[0].is_alive ? "alive" : "ghost") : "alive",
        role: p.players?.[0]?.role || "amic",
        clues_count: p.clues_count || 0,
      }));

      setPlayers(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mystery text-white">
        Carregant...
      </div>
    );
  }

  const alive = players.filter((p) => p.status === "alive");
  const ghosts = players.filter((p) => p.status === "ghost");

  return (
    <div className="min-h-screen bg-gradient-mystery p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-black/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Jugadors</h1>
            <p className="text-sm text-gray-300">{alive.length} vius • {ghosts.length} fantasmes</p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3">Vius</h2>
          {alive.length === 0 ? (
            <div className="p-6 bg-black/20 rounded">No hi ha jugadors vius</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {alive.map((p) => (
                <div key={p.id} className="p-4 bg-black/30 rounded-xl flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-black/40 flex items-center justify-center text-xl font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-300">{p.clues_count} pistes</div>
                  </div>
                  <div className="text-sm text-clue">{p.role === "assassin" ? "🗡️" : "🔍"}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {ghosts.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Fantasmes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {ghosts.map((p) => (
                <div key={p.id} className="p-4 bg-black/20 rounded-xl flex items-center gap-4 opacity-70">
                  <div className="h-14 w-14 rounded-full bg-black/40 flex items-center justify-center text-xl font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-300">{p.clues_count} pistes</div>
                  </div>
                  <div className="text-sm text-ghost">👻</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
