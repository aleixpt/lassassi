// components/AvatarUpload.tsx
"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = { userId: string }; // profiles.id = auth.user.id

export default function AvatarUpload({ userId }: Props) {
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    try {
      setLoading(true);
      const ext = file.name.split(".").pop();
      const filePath = `avatars/${userId}.${ext}`;
      // sube a storage 'avatars' (crear el bucket a Supabase)
      const { data, error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (upErr) throw upErr;

      const { publicURL } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // actualitza el perfil
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicURL })
        .eq("id", userId);

      if (profErr) throw profErr;
      alert("Avatar pujat!");
    } catch (err) {
      console.error(err);
      alert("Error al pujar avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="btn">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
        />
        {loading ? "Pujant..." : "Pujar avatar"}
      </label>
    </div>
  );
}
