// app/game/scan/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [clue, setClue] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace("/");
    })();
  }, [router]);

  async function submitCode(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch("/api/scan_qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: code, user_id: user?.id }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "No s'ha pogut desbloquejar la pista");
      setClue(json.clue);
    } catch (err: any) {
      alert(err.message || err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-mystery p-6 text-white">
      <div className="max-w-md mx-auto bg-black/50 p-6 rounded-2xl border border-white/8">
        <h2 className="text-xl font-bold mb-3">Escanejar QR</h2>

        <form onSubmit={submitCode} className="space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Introdueix codi (ex: CLUE-001)"
            className="w-full p-3 rounded-md bg-[#0b0b0d] border border-white/6"
            required
          />
          <button className="w-full py-2 rounded-md bg-clue" disabled={loading}>{loading ? "Comprovant..." : "Desbloquejar pista"}</button>
        </form>

        {clue && (
          <div className="mt-4 p-3 bg-black/40 rounded-md">
            <h3 className="font-semibold">{clue.title}</h3>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{clue.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
