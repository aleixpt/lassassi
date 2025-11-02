// pages/_app.js
import '../styles/globals.css'
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // aquí podrías controlar redirecciones globales si quieres
    })
    return () => listener?.subscription?.unsubscribe?.()
  }, [])

  return <Component {...pageProps} />
}
