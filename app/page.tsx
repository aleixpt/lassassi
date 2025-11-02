// app/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEnter(e) {
    e.preventDefault();
    if (!name || !email) return alert("Introdueix nom i correu");
    setLoading(true);

    try {
      // Guardem el nom temporalment al localStorage perquè després el puguem usar
      localStorage.setItem("lassassi_display_name", name);

      // Enviem magic link (OTP) al correu
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin } // redirigeix a l'arrel on la sessió serà accessible
      });

      if (error) throw error;

      alert("S'ha enviat un enllaç al teu correu. Obre-lo per completar l'inici de sessió.");
    } catch (err) {
      alert(err.message || err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-mystery">
      <div className="max-w-md w-full card">
        <h1 className="text-4xl font-bold text-center text-foreground mb-4">L'assassí</h1>

        <form onSubmit={handleEnter} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom"
            required
            className="w-full p-3 rounded bg-black/20"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correu electrònic"
            type="email"
            required
            className="w-full p-3 rounded bg-black/20"
          />

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Enviant..." : "Entrar"}
          </button>
        </form>

        <p className="mt-3 small-muted text-center text-sm">
          Rebràs un enllaç al teu correu per entrar. Obre'l al dispositiu on vulguis jugar.
        </p>
      </div>
    </div>
  );
}
