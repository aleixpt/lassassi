"use client";

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"; 
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.push('/waiting')
    })
  }, [])

  async function signIn(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) return alert(error.message)
    alert('Enllaç enviat al teu email')
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
    // Supabase redirige tras OAuth; si quieres un callback distinto, configúralo en Supabase Auth.
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <h1 className="text-3xl font-bold text-blood-red text-center mb-4">L'assassí</h1>
        <p className="mb-4 text-muted-gray text-sm">Inicia sesión para unirte a la partida con tu móvil</p>
        <form onSubmit={signIn} className="space-y-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full p-3 rounded bg-black/20" required />
          <button disabled={loading} className="w-full button-primary">{loading ? 'Enviando...' : 'Enviar link (email)'}</button>
        </form>

        <div className="mt-4">
          <button onClick={signInWithGoogle} className="w-full py-2 rounded border border-gray-700">Entrar con Google</button>
        </div>
        <p className="mt-4 text-sm text-muted-gray">Después del primer login completa tu perfil (nombre + foto).</p>
      </div>
    </div>
  )
}
