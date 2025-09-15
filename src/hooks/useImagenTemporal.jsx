import { useEffect, useState } from "react";

const CLAVE_ORIGINAL = "imagenOriginalBase64"; // nueva
const CLAVE_VIEJA   = "imagenBase64";          // legacy

export default function useImagenTemporal() {
  const [originalBase64, setOriginalState] = useState(null);
  const [ready, setReady] = useState(false);   // ⬅️ listo para usar

  useEffect(() => {
    let orig = localStorage.getItem(CLAVE_ORIGINAL);

    if (!orig) {
      const vieja = localStorage.getItem(CLAVE_VIEJA);
      if (vieja) {
        orig = vieja;
        localStorage.setItem(CLAVE_ORIGINAL, vieja);
      }
    }

    if (orig) setOriginalState(orig);
    setReady(true);                            // ⬅️ marcamos que terminó la carga
  }, []);

  const setOriginalBase64Once = (b64) => {
    if (!b64) return;
    const existente = localStorage.getItem(CLAVE_ORIGINAL);
    if (existente) {
      setOriginalState(existente);
      return;
    }
    localStorage.setItem(CLAVE_ORIGINAL, b64);
    localStorage.setItem(CLAVE_VIEJA, b64);    // compatibilidad
    setOriginalState(b64);
  };

  const clearAll = () => {
    localStorage.removeItem(CLAVE_ORIGINAL);
    localStorage.removeItem(CLAVE_VIEJA);
    setOriginalState(null);
    setReady(true);
  };

  // Alias legacy
  const base64 = originalBase64;

  return {
    originalBase64,
    base64,
    ready,                 // ⬅️ NUEVO
    setOriginalBase64Once,
    clearAll,
  };
}
