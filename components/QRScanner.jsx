// components/QRScanner.jsx
import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

/**
 * Props:
 *  - onResult(resultString) -> se llama cuando se detecta un QR
 *  - fps (opcional), qrbox (opcional), verbose (opcional)
 *
 * Uso: <QRScanner onResult={(txt)=>...} />
 */
export default function QRScanner({ onResult, fps = 10, qrbox = 250, verbose = false }) {
  const scannerRef = useRef(null)
  const html5Ref = useRef(null)

  useEffect(() => {
    // sólo correr en cliente
    if (typeof window === 'undefined') return

    const elementId = scannerRef.current?.id || 'html5qr-reader'
    const config = { fps, qrbox }

    const verboseLogger = (msg) => {
      if (verbose) console.log('[QRScanner]', msg)
    }

    // crea instancia (usa el id del div)
    const html5Qr = new Html5Qrcode(elementId, { verbose })
    html5Ref.current = html5Qr

    // start with camera (prefer rear camera)
    html5Qr
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          verboseLogger('decoded: ' + decodedText)
          // stop scanning para evitar múltiples triggers inmediatos
          html5Qr.pause(true) // pausa el procesado, leave camera on
          try {
            onResult && onResult(decodedText)
          } catch (err) {
            console.error(err)
          }
        },
        (errorMessage) => {
          // scan failure per-frame (ignorable)
          // verboseLogger('scan error: ' + errorMessage)
        }
      )
      .catch((err) => {
        console.error('Failed to start HTML5 Qr scanner:', err)
      })

    // cleanup on unmount
    return () => {
      try {
        if (html5Ref.current) {
          // stop() libera camara
          html5Ref.current.stop().then(() => {
            html5Ref.current.clear()
          }).catch((e) => {
            // for safety, try clear
            try { html5Ref.current.clear() } catch(e2) {}
          })
        }
      } catch (e) {
        console.warn('Error cleaning QR scanner:', e)
      }
    }
  }, [onResult, fps, qrbox, verbose])

  return (
    <div className="w-full">
      <div id="html5qr-reader" ref={scannerRef} style={{ width: '100%' }} />
      <div className="mt-2 text-sm text-muted-gray">Apunta la cámara al QR. Permite el acceso a la cámara si el navegador lo pide.</div>
    </div>
  )
}
