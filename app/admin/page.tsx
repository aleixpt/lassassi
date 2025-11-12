"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const AdminPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-mystery p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground text-center mb-4">
          Panel del Administrador
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-glow-clue transition-all border-border"
            onClick={() => router.push("/admin/players")}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <CardTitle>Jugadores</CardTitle>
                  <CardDescription>Gestiona estados y pistas</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-glow-clue transition-all border-border"
            onClick={() => router.push("/admin/clues")}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-clue" />
                <div>
                  <CardTitle>Pistas</CardTitle>
                  <CardDescription>Consulta o reinicia el progreso</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-glow-danger transition-all border-border md:col-span-2"
            onClick={() => router.push("/admin/settings")}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>Gestiona partidas y roles</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Button variant="secondary" onClick={() => router.push("/profile")}>
            Tornar al Perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
