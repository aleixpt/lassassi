"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) {
      setMessage("Si us plau, introdueix nom i correu.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      // Guardem el nom temporalment al navegador
      localStorage.setItem("lassassi_display_name", name);

      // Enviem magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` }
      });

      if (error) throw error;
      setMessage("📧 Revisa el teu correu per completar l'inici de sessió.");
    } catch (err: any) {
      console.error(err);
      setMessage("Error enviant el correu: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-mystery">
      <div className="max-w-md w-full card">
        <h1 className="text-4xl font-bold text-center text-foreground mb-4">L'assassí</h1>

        <form onSubmit={handleEnter} className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom" required className="w-full p-3 rounded bg-black/20" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correu electrònic" type="email" required className="w-full p-3 rounded bg-black/20" />
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Enviant..." : "Entrar"}
          </button>
        </form>

        {message && <div className="mt-4 text-sm text-gray-300 bg-gray-800/60 px-4 py-2 rounded-lg text-center">{message}</div>}
      </div>
    </div>
  );
}

