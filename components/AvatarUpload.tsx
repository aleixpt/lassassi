// components/AvatarUpload.tsx
"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = { userId: string };

export default function AvatarUpload({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function uploadFile(file: File) {
    try {
      setLoading(true);

      const ext = file.name.split(".").pop();
      const filePath = `avatars/${userId}.${ext}`;

      // 1) upload a storage
      const { data: upData, error: upError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (upError) throw upError;

      // 2) get public url (handle different SDK shapes)
      const getRes: any = await supabase.storage.from("avatars").getPublicUrl(filePath);
      // supabase v2 -> getRes.data.publicUrl, older -> getRes.publicURL
      const publicURL =
        (getRes && getRes.data && (getRes.data.publicUrl || getRes.data.publicURL)) ||
        getRes?.publicURL ||
        getRes?.publicUrl;

      if (!publicURL)
        throw new Error("No public URL returned from storage (check bucket ACL).");

      // 3) update profile row
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicURL })
        .eq("id", userId);

      if (profErr) throw profErr;

      setPreview(publicURL);
      alert("Avatar pujat!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      alert("Error pujant avatar: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="btn inline-flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
          }}
        />
        {loading ? "Pujant..." : "Pujar avatar"}
      </label>

      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview avatar" className="w-20 h-20 rounded-full object-cover" />
        </div>
      )}
    </div>
  );
}
