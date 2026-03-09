// src/pages/Grilla.jsx
import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useGenerarGrillaPDF } from '@/hooks/useGenerarGrillaPDF'
import PdfPreview from '@/components/PdfPreview'
import BotonPrimario from '@/components/ui/BotonPrimario'
import BotonVolver from '@/components/ui/BotonVolver'
import '@/lib/pdfjs'

export default function Grilla() {
  const { state } = useLocation()
  const base64 = state?.base64Procesada
  const layout  = state?.layoutSeleccionado

  const { pdfUrl, loading, error } = useGenerarGrillaPDF(base64, layout)
  const [shareLoading, setShareLoading] = useState(false)

  async function handleOpenWithChooser() {
    if (!pdfUrl) return
    setShareLoading(true)
    try {
      // 1) Traer el PDF como Blob
      const res = await fetch(pdfUrl, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Fetch error ${res.status}`)
      const blob = await res.blob()

      const file = new File([blob], 'grilla.pdf', { type: 'application/pdf' })

      // 2) Web Share API con archivos (Android Chrome/PWA)
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Abrir PDF',
          text: 'Elegí con qué app abrir o imprimir el PDF',
        })
        return
      }

      // 3) Fallback: abrir en nueva pestaña (visor del navegador)
      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')
      // revocamos más tarde para no cortar el visor
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (e) {
      console.error('openWithChooser error:', e)
      // 4) Último recurso: forzar descarga
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = 'grilla.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      setShareLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-emerald-900 p-6 flex flex-col items-center">
      <BotonVolver />
      <div className="flex items-center gap-2 text-white mb-4">
        <span className="text-2xl">✅</span>
        <h1 className="text-xl font-bold">Grilla finalizada con éxito</h1>
      </div>

      {!base64 || !layout ? (
        <div className="w-full max-w-md bg-emerald-800/40 p-4 rounded-xl border border-emerald-700 text-emerald-50">
          <p className="mb-3 text-sm">asdfasdfdsa.</p>
          <Link to="/" className="inline-block" >Volver al inicio</Link>
        </div>
      ) : loading ? (
        <div className="w-full max-w-md">
          <div className="animate-pulse rounded-xl bg-emerald-800/40 h-40 w-full mb-4" />
          <p className="text-emerald-200 text-sm">Generando PDF…</p>
        </div>
      ) : error ? (
        <div className="w-full max-w-md bg-emerald-800/40 p-4 rounded-xl border border-emerald-700 text-emerald-50">
          <p className="mb-3 text-sm">{error}</p>
          <Link to="/" className="inline-block" >Volver al inicio</Link>
        </div>
      ) : (
        pdfUrl && (
          <div className="w-full max-w-md space-y-4">
            <div className="w-full border border-emerald-700 rounded-xl bg-emerald-800/30 p-2">
              <PdfPreview src={pdfUrl} page={1} maxWidth={800} showControls />
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-1 gap-2">
              {/* Ver en pestaña (no toma PWA, abre Chrome externo si está instalada) */}
              <button
                onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
                className="hidden md:block w-full bg-white text-emerald-900 border border-emerald-600 rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50"
              >Abrir en pestaña
              </button>

              {/* Abrir con… (chooser del sistema) */}
              <button
                onClick={handleOpenWithChooser}
                disabled={shareLoading}
                className={`w-full rounded-xl px-4 py-3 font-semibold border border-emerald-600
                  ${shareLoading ? 'bg-emerald-700 text-emerald-200 opacity-70' : 'bg-white text-emerald-900 hover:bg-emerald-50'}
                `}
              >
                {shareLoading ? 'Abriendo…' : 'Abrir con…'}
              </button>

              {/* Descargar directo
              <a href={pdfUrl} download="grilla.pdf" className="block">
                <BotonPrimario
                  texto="Descargar grilla"
                  className="w-full bg-white text-emerald-900 border border-emerald-600 hover:bg-emerald-50"
                >
                  Descargar PDF
                </BotonPrimario>
              </a>
               */}
            </div>

            <p className="text-xs text-emerald-200 opacity-80 text-center">
              Tip: verificá el tamaño de cada ficha antes de imprimir.
            </p>

            <Link to="/" className="inline-block text-center">
              <button className="text-emerald-200 text-xs underline underline-offset-4">
                Crear otra grilla
              </button>
            </Link>
          </div>
        )
      )}
    </div>
  )
}
