"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        router.replace("/");
        return;
      }
      const userId = session.user.id;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      setProfile(p || null);
      setLoading(false);
    })();
  }, [router]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLocalFile(f);
  }

  async function uploadAvatar() {
    if (!localFile || !profile) return;
    setUploading(true);
    try {
      const ext = localFile.type.split("/")[1] || "png";
      const path = `avatars/${profile.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, localFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = await supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = urlData.publicUrl || null;
      const { error: upsertError } = await supabase.from("profiles").upsert({ id: profile.id, avatar_url: avatarUrl }, { returning: "minimal" });
      if (upsertError) throw upsertError;
      setProfile({ ...profile, avatar_url: avatarUrl });
      alert("Avatar actualitzat");
    } catch (err: any) {
      alert(err.message || String(err));
    } finally {
      setUploading(false);
      setLocalFile(null);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregant...</div>;
  }
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-mystery p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <img src={profile.avatar_url || "/default-avatar.png"} alt="" className="w-20 h-20 rounded-full border border-white/10" />
          <div>
            <h2 className="text-2xl font-bold">{profile.display_name}</h2>
            <p className="text-sm text-muted-foreground">{profile.id}</p>
          </div>
        </div>

        <div className="bg-card/30 p-4 rounded">
          <label className="block mb-2">Canvia avatar</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          <div className="mt-3">
            <button onClick={uploadAvatar} disabled={uploading || !localFile} className="px-4 py-2 rounded bg-primary text-white">
              {uploading ? "Pugant..." : "Pujar avatar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

