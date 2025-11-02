import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner({ onResult, fps = 10, qrbox = 250 }) {
  const refId = "html5qr-reader";
  const html5Ref = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const html5Qr = new Html5Qrcode(refId);
    html5Ref.current = html5Qr;

    html5Qr.start(
      { facingMode: "environment" },
      { fps, qrbox },
      (decodedText) => {
        html5Qr.pause(true);
        onResult && onResult(decodedText);
      },
      (err) => {
        // ignore per-frame errors
      }
    ).catch(err => {
      console.error("QR start error:", err);
    });

    return () => {
      if (!html5Ref.current) return;
      html5Ref.current.stop().then(() => html5Ref.current.clear()).catch(()=>{ try{ html5Ref.current.clear(); }catch(e){} });
    };
  }, [onResult, fps, qrbox]);

  return <div id={refId} style={{ width: "100%" }} />;
}
