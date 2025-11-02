"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // optional if using magic link
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(()=> {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.push("/waiting");
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // create user with email + password (if you enabled)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name || '' }
          }
        });
        if (error) throw error;
        alert("Compte creat. Revisa el correu (si està activat).");
        router.push("/waiting");
      } else {
        // magic link
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        alert("Link enviat. Obre'l al mòbil.");
      }
    } catch (err) {
      alert(err.message || err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-mystery">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">{isSignUp ? "Crear compte" : "Iniciar sessió"}</h2>
        <p className="text-sm small-muted text-center mb-4">{isSignUp ? "Registra't per jugar" : "Envia un link al teu email"}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <input required placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 rounded bg-black/20" />
          )}
          <input required placeholder="Correu" type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 rounded bg-black/20" />
          {isSignUp && (
            <input required placeholder="Contrasenya" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 rounded bg-black/20" minLength={6} />
          )}
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Processant..." : (isSignUp ? "Crear compte" : "Enviar link")}
          </button>
        </form>
        <div className="mt-3 text-center text-sm">
          <button onClick={()=>setIsSignUp(!isSignUp)} className="text-[var(--accent)] underline">{isSignUp ? "Ja tens compte? Inicia sessió" : "No tens compte? Registra't"}</button>
        </div>
      </div>
    </div>
  );
}
