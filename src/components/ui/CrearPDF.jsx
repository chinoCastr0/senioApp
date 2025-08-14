// src/components/ui/CrearPDF.jsx
import { useState, useEffect, useCallback } from "react";
import { postForm, toAbsoluteURL } from "@/helpers/api"; // o ../../helpers/api

function base64ToFile(base64, filename = "imagen.png") {
  const [meta, data] = base64.split(",");
  const mime = meta.match(/:(.*?);/)[1];
  const bin = atob(data);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new File([u8], filename, { type: mime });
}

export default function CrearPDF({ base64Procesada, layoutSeleccionado }) {
  const [previewURL, setPreviewURL] = useState(null);
  const [pdfURL, setPdfURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const generarPDF = useCallback(async () => {
    if (!base64Procesada || !layoutSeleccionado) return;
    setLoading(true);
    setErr(null);
    setPreviewURL(null);
    setPdfURL(null);

    try {
      const archivo = base64ToFile(base64Procesada);
      const formData = new FormData();
      formData.append("file", archivo);
      formData.append("altoMm", String(layoutSeleccionado.altoMm));
      formData.append("anchoMm", String(layoutSeleccionado.anchoMm));
      formData.append("cantidad", String(layoutSeleccionado.cantidad));

      // El backend devuelve: { path/url, preview_path/preview_url }
      const data = await postForm("/generar-pdf", formData, 60000);

      // Resolvemos relativas y agregamos cache-buster para evitar caché en Android
      const pdfHref = toAbsoluteURL(data.url || data.path);
      const prevHref = toAbsoluteURL(data.preview_url || data.preview_path);
      const bust = `?_=${Date.now()}`;

      setPdfURL(pdfHref ? `${pdfHref}${pdfHref.includes("?") ? "" : bust}` : null);
      setPreviewURL(prevHref ? `${prevHref}${prevHref.includes("?") ? "" : bust}` : null);
    } catch (e) {
      console.error(e);
      setErr("No pudimos generar la grilla. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [base64Procesada, layoutSeleccionado]);

  useEffect(() => {
    generarPDF();
  }, [generarPDF]);

  return (
    <div className="flex flex-col items-center gap-4 mt-4 w-full">
      {loading && <p className="text-gray-500">Generando…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {/* Preview liviana en imagen (ideal mobile) */}
      {previewURL && (
        <img
          src={previewURL}
          alt="Vista previa de la grilla"
          className="w-full max-w-[900px] rounded-xl border border-gray-300 shadow-md"
          loading="lazy"
        />
      )}

      {/* Fallback: si no hay preview pero sí PDF, mostramos iframe */}
      {!previewURL && pdfURL && (
        <iframe
          src={pdfURL}
          title="Vista previa del PDF"
          className="w-full h-[65vh] rounded-xl border border-gray-300 shadow-md"
        />
      )}

      {/* Acción para abrir/descargar el PDF real */}
      {pdfURL && (
        <div className="flex gap-2">
          <a
            href={pdfURL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 px-4 py-3 mt-2 text-sm text-white rounded-xl shadow active:scale-[0.99]"
          >
            Abrir PDF
          </a>
          <a
            href={pdfURL}
            download="grilla.pdf"
            className="bg-gray-800 px-4 py-3 mt-2 text-sm text-white rounded-xl shadow active:scale-[0.99]"
          >
            Descargar
          </a>
        </div>
      )}
    </div>
  );
}