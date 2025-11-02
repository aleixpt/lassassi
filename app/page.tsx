"use client";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-mystery flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <Eye className="h-28 w-28 mx-auto text-[var(--accent)] animate-pulse" />
        <h1 className="text-5xl md:text-6xl font-bold tracking-wide">MISTERI</h1>
        <p className="small-muted">Joc social d'investigació i assassinat</p>
        <div className="flex justify-center gap-4">
          <Link href="/auth" className="btn btn-primary text-lg">Entrar</Link>
          <Link href="/waiting" className="btn border border-[rgba(255,255,255,0.06)]">Sala d'espera</Link>
        </div>
      </div>
    </div>
  );
}
