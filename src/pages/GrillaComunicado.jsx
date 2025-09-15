// src/pages/GrillaComunicado.jsx
import { useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import BotonPrimario from '../components/ui/BotonPrimario'
import BotonVolver from '../components/ui/BotonVolver'
import PdfPreview from '../components/PdfPreview'
import '../lib/pdfjs'

function deriveDownloadFromPdf(pdfUrl) {
  if (typeof pdfUrl !== 'string') return null
  // /uploads/pdfs/<filename>.pdf  ->  /download/<filename>.pdf
  const m = pdfUrl.match(/\/uploads\/pdfs\/([^/?#]+)/i)
  if (!m) return null
  const filename = m[1]
  try {
    const u = new URL(pdfUrl)
    return `${u.origin}/download/${filename}`
  } catch {
    // por si viene relativo
    return `/download/${filename}`
  }
}

export default function GrillaComunicado() {
  const { search } = useLocation()
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search])

  const pdf = params.pdf
  // usa el que venga; si no, derivamos desde pdf
  const download = params.download || deriveDownloadFromPdf(pdf)

  const [compartiendo, setCompartiendo] = useState(false)
  const [descargando, setDescargando] = useState(false)

  if (!pdf) {
    return (
      <div className="bg-emerald-900 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-emerald-800/40 p-4 rounded-xl border border-emerald-700 text-emerald-50">
          <p className="mb-4 text-sm">No encontramos la vista previa del comunicado.</p>
          <Link to="/" className="inline-block w-full">
            <BotonPrimario className="w-full">Volver</BotonPrimario>
          </Link>
        </div>
      </div>
    )
  }

  const fetchBlobAndName = async (url, fallbackName = 'comunicado.pdf') => {
    const res = await fetch(url, { method: 'GET', mode: 'cors' })
    if (!res.ok) throw new Error('Respuesta no OK')
    const cd = res.headers.get('content-disposition') || ''
    const match = /filename\*?=(?:UTF-8'')?\"?([^\";]+)\"?/i.exec(cd)
    const filename = match ? decodeURIComponent(match[1]) : fallbackName
    const blob = await res.blob()
    return { blob, filename }
  }

  const handleDescargar = async () => {
    if (!download) {
      alert('No hay URL de descarga')
      return
    }
    setDescargando(true)
    try {
      const { blob, filename } = await fetchBlobAndName(download)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('[Descargar] error:', e)
      alert('No pude descargar el archivo. Probá de nuevo.')
    } finally {
      setDescargando(false)
    }
  }

  const handleAbrirCon = async () => {
    if (!download) {
      alert('No hay archivo para compartir')
      return
    }
    setCompartiendo(true)
    try {
      const { blob, filename } = await fetchBlobAndName(download)
      const file = new File([blob], filename, { type: 'application/pdf' })

      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })

      if (canShareFiles) {
        await navigator.share({
          files: [file],
          title: 'Comunicado',
          text: 'Abrir con…'
        })
      } else {
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch (e) {
      console.error('[Abrir con] error:', e)
      alert('No se pudo abrir con otra app. Probá de nuevo.')
    } finally {
      setCompartiendo(false)
    }
  }

  return (
    <div className="bg-emerald-900 min-h-screen flex items-center justify-center p-4">
      <BotonVolver />
      <div className="w-full  max-w-md space-y-4">
        <h1 className="flex text-white justify-center text-xl font-semibold">Vista previa</h1>

        <div className="w-full border border-emerald-700 rounded-xl bg-emerald-800/30 p-2">
          <PdfPreview src={pdf} page={1} maxWidth={800} showControls />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={handleDescargar}
            disabled={descargando}
            className="w-full px-4 py-3 rounded-xl bg-white text-emerald-900 border border-emerald-600 hover:bg-emerald-50 transition disabled:opacity-60"
          >
            {descargando ? 'Descargando…' : 'Descargar PDF'}
          </button>

          <button
            onClick={handleAbrirCon}
            disabled={compartiendo}
            className="w-full px-4 py-3 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition disabled:opacity-60"
          >
            {compartiendo ? 'Abriendo…' : 'Abrir con…'}
          </button>
        </div>

        <p className="text-xs text-emerald-200 opacity-80">
          Tip: revisá que el texto sea legible antes de imprimir.
        </p>

        <Link to="/" className="inline-block w-full">
          <button className="w-full text-emerald-200 text-xs underline underline-offset-4">
            Generar otro comunicado
          </button>
        </Link>
      </div>
    </div>
  )
}

