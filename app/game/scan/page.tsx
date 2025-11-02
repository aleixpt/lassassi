"use client";
import { useRouter } from "next/navigation";
import QRScanner from "../../../components/QRScanner";
import { supabase } from "../../../lib/supabaseClient";

export default function Scan() {
  const router = useRouter();

  async function onResult(decoded) {
    try {
      // call API to find clue by qr_code
      const res = await fetch('/api/scan_qr', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ qrCode: decoded })});
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'No trobat');
      const clue = j.clue;
      // find player id
      const { data: { user } } = await supabase.auth.getUser();
      const { data: player } = await supabase.from('players').select('id').eq('user_id', user.id).single();
      await supabase.from('player_clues').upsert({ player_id: player.id, clue_id: clue.id });
      alert('Pista desbloquejada: ' + clue.title);
    } catch(e){
      alert(e.message || e);
    } finally {
      router.push('/pistas');
    }
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-mystery">
      <div className="max-w-xl mx-auto card">
        <h2 className="text-xl font-semibold mb-3">Escanejar QR</h2>
        <QRScanner onResult={onResult} />
      </div>
    </div>
  );
}

