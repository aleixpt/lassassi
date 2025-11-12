"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../hooks/use-toast";
import { Loader2, ArrowLeft, Users, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  status: "alive" | "ghost";
  clues_count: number;
  role?: string;
}

const AdminPlayersPage = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadPlayers();

    const channel = supabase
      .channel("profiles-changes-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadPlayers())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, created_at, players!left(is_alive, is_ghost, role), clues_count")
        .order("display_name", { ascending: true });

      if (error) throw error;

      const normalized = (data || []).map((p: any) => ({
        id: p.id,
        name: p.display_name || p.id,
        avatar_url: p.avatar_url,
        status: p.players?.[0] ? (p.players[0].is_alive ? "alive" : "ghost") : "alive",
        role: p.players?.[0]?.role || "amic",
        clues_count: p.clues_count || 0,
      }));

      setPlayers(normalized);
    } catch (error: any) {
      toast({
        title: "Error cargando jugadores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: "alive" | "ghost") => {
    const newStatus = currentStatus === "alive" ? "ghost" : "alive";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      toast({
        title: "Estado actualizado",
        description: `Jugador ahora está ${newStatus === "alive" ? "vivo" : "👻 fantasma"}.`,
      });
      loadPlayers();
    } catch (error: any) {
      toast({
        title: "Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mystery">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mystery p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Jugadores</h1>
            <p className="text-muted-foreground">
              Controla estados y accede a sus pistas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player) => (
            <Card key={player.id} className="shadow-card border-border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={player.avatar_url} alt={player.name} />
                    <AvatarFallback className="text-xl">
                      {player.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={player.status === "alive" ? "default" : "secondary"}>
                        {player.status === "alive" ? "Vivo" : "👻 Fantasma"}
                      </Badge>
                      <span className="text-sm text-clue">
                        {player.clues_count} pistes
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between">
                <Button
                  variant={player.status === "alive" ? "destructive" : "default"}
                  onClick={() => toggleStatus(player.id, player.status)}
                >
                  {player.status === "alive" ? "Convertir en Fantasma" : "Revivir"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/admin/players/${player.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Pistas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPlayersPage;
