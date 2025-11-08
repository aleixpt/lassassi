// components/QRScanner.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../lib/supabaseClient";

type Props = { playerId: string; roomId: string };

export default function QRScanner({ playerId, roomId }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const elementId = "qr-reader";
    const html5QrCode = new Html5Qrcode(elementId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // decodedText -> enviar al servidor per validar QR i desbloquejar pista
          try {
            const res = await fetch("/api/unlock-clue", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ playerId, roomId, qr: decodedText }),
            });
            const json = await res.json();
            if (res.ok) {
              alert("Pista desbloquejada: " + json.title ?? "OK");
            } else {
              alert("No s'ha desbloquejat: " + json.message);
            }
          } catch (err) {
            console.error(err);
            alert("Error comunicant amb el servidor");
          }
        },
        (errorMessage) => {
          // can ignore scan errors
        }
      )
      .catch((err) => console.error("Error iniciant QR scanner", err));

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [playerId, roomId]);

  return <div id="qr-reader" style={{ width: "100%" }} />;
}
