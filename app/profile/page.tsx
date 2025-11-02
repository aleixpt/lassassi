"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) router.push('/')
      else setUser(data.session.user)
    })
  }, [])

  async function uploadAvatar(file, userId) {
    const path = `${userId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('avatars').upload(path, file)
    if (error) throw error
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      let avatar_url = null
      if (file) avatar_url = await uploadAvatar(file, user.id)
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name,
        avatar_url
      })
      if (error) throw error
      router.push('/waiting')
    } catch (err) {
      alert(err.message || 'Error guardando perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <h2 className="text-xl font-semibold text-blood-red mb-3">Completa el perfil</h2>
        <form onSubmit={saveProfile} className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full p-3 rounded bg-black/20" required />
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
          <button type="submit" className="button-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar perfil'}</button>
        </form>
      </div>
    </div>
  )
}
