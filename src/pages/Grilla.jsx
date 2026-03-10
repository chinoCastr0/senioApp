import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useGenerarGrillaPDF } from '@/hooks/useGenerarGrillaPDF'
import PdfPreview from '@/components/PdfPreview'
import BotonVolver from '@/components/ui/BotonVolver'
import '@/lib/pdfjs'

export default function Grilla() {
  const { state } = useLocation()

  const base64 = state?.base64Procesada
  const layout = state?.layoutSeleccionado

  const { pdfUrl, loading, error } = useGenerarGrillaPDF(base64, layout)
  const [shareLoading, setShareLoading] = useState(false)

  async function handleOpenWithChooser() {
    if (!pdfUrl) return

    setShareLoading(true)

    try {
      const res = await fetch(pdfUrl, { cache: 'no-store' })
      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const file = new File([blob], 'grilla.pdf', { type: 'application/pdf' })

      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Abrir PDF',
          text: 'Elegí con qué app abrir o imprimir el PDF',
        })
        return
      }

      const objectUrl = URL.createObjectURL(blob)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')

      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000)

    } catch (e) {
      console.error(e)

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
        <span className="text-2xl"></span>
        <h1 className="text-xl font-bold">Grilla finalizada</h1>
        <p className='text-cyan-300'>La primer grilla puede tardar unos minutos</p>
      </div>

      {renderContenido()}
    </div>
  )

  function renderContenido() {

    if (!base64 || !layout) {
      return (
        <Card>
          <p className="mb-3 text-sm">
            Faltan datos para generar la grilla.
          </p>
          <Link to="/">Volver al inicio</Link>
        </Card>
      )
    }

    if (loading) {
      return (
        <div className="w-full max-w-md">
          <div className="animate-pulse rounded-xl bg-emerald-800/40 h-40 w-full mb-4" />
          <p className="text-emerald-200 text-sm">
            Generando PDF…
          </p>
        </div>
      )
    }

    if (error) {
      return (
        <Card>
          <p className="mb-3 text-sm">{error}</p>
          <Link to="/">Volver al inicio</Link>
        </Card>
      )
    }

    if (!pdfUrl) return null

    return (
      <div className="w-full max-w-md space-y-4">

        <div className="w-full border border-emerald-700 rounded-xl bg-emerald-800/30 p-2">
          <PdfPreview src={pdfUrl} page={1} maxWidth={800} showControls />
        </div>

        <div className="grid grid-cols-1 gap-2">

          <button
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
            className="hidden md:block w-full bg-white text-emerald-900 border border-emerald-600 rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50"
          >
            Abrir en pestaña
          </button>

          <button
            onClick={handleOpenWithChooser}
            disabled={shareLoading}
            className={`w-full rounded-xl px-4 py-3 font-semibold border border-emerald-600
            ${shareLoading
              ? 'bg-emerald-700 text-emerald-200 opacity-70'
              : 'bg-white text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            {shareLoading ? 'Abriendo…' : 'Abrir con…'}
          </button>

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
  }
}

function Card({ children }) {
  return (
    <div className="w-full max-w-md bg-emerald-800/40 p-4 rounded-xl border border-emerald-700 text-emerald-50">
      {children}
    </div>
  )
}