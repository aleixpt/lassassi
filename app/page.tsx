"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem("lassassi_avatar", reader.result as string);
      } catch (e) {
        console.warn("No es pot guardar l'avatar a localStorage:", e);
      }
    };
    reader.readAsDataURL(f);
    setAvatarFile(f);
  }

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      // Guardem el display name i avatar en localStorage per recuperar al callback
      localStorage.setItem("lassassi_display_name", displayName || "");
      // el signup amb magic link
      const redirectTo = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      // Informem l'usuari de forma més professional
      // (Aquí simplifiquem mostrant un alert; pots canviar-ho per un banner)
      alert("Hem enviat un enllaç al teu correu. Revisa la teva safata d'entrada.");
    } catch (err: any) {
      alert(err.message || String(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mystery p-6">
      <form
        onSubmit={handleEnter}
        className="w-full max-w-md bg-card/40 p-6 rounded-2xl border border-white/5 shadow-card"
      >
        <h1 className="text-3xl font-bold text-foreground mb-3">L'assassí</h1>
        <p className="text-sm text-muted-foreground mb-4">Introdueix nom i correu per entrar</p>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Nom visible (ej: Joan)"
          className="w-full mb-3 p-3 rounded bg-muted/10"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correu electrònic"
          type="email"
          required
          className="w-full mb-3 p-3 rounded bg-muted/10"
        />

        <label className="text-sm block mb-2">Foto perfil (opcional)</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="mb-4"
        />

        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 rounded-xl text-white font-semibold bg-primary hover:opacity-95 transition"
        >
          {sending ? "Enviant..." : "Enviar enllaç de verificació"}
        </button>
      </form>
    </div>
  );
}

