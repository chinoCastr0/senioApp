import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useGenerarGrillaPDF } from '@/hooks/useGenerarGrillaPDF'
import BotonVolver from '@/components/ui/BotonVolver'
import { Document, Page, pdfjs} from 'react-pdf'
import TextLayer from 'react-pdf/dist/Page/TextLayer.js'
import AnnotationLayer from 'react-pdf/dist/Page/AnnotationLayer.js'
import { Descargar } from '../helpers/descargar'
import { Compartir } from '../helpers/compartir'


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()


export default function Grilla() {
  const { state } = useLocation()

  const imgblob = state?.imagenFinal
  console.log('llego la url', imgblob)
  const layout = state?.layoutSeleccionado
  console.log('layout recibido:', layout)

  const { pdfUrl, loading, error } = useGenerarGrillaPDF(imgblob, layout)
console.log (pdfUrl, "pdfurl ES")
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(null)

useEffect(() => {
  if (!containerRef.current) return

  const resizeObserver = new ResizeObserver(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth - 16)
    }
  })

  resizeObserver.observe(containerRef.current)
  return () => resizeObserver.disconnect()
}, [pdfUrl])

  return (
    <div className="min-h-screen bg-emerald-900 p-6 flex flex-col items-center">
      <BotonVolver />

      <div className="flex flex-col items-center gap-2 text-white mb-4">
        <span className="text-2xl"></span>
        <h1 className="text-xl font-bold">Grilla finalizada</h1>
        <p className='text-cyan-300'>La primer grilla puede tardar unos minutos</p>
      </div>

      {renderContenido()}
    </div>
  )

  function renderContenido() {

    if (!imgblob || !layout) {
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

        <div 
        ref = {containerRef}
        className="w-full border border-emerald-700 rounded-xl bg-emerald-800/30 p-2">

          <Document file={pdfUrl}>
            <Page pageNumber={1} width={containerWidth } />
          </Document>        
          </div>

        <div className="grid grid-cols-1 gap-2">

          <button
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
            className="hidden md:block w-full bg-white text-emerald-900 border border-emerald-600 rounded-xl px-4 py-3 font-semibold hover:bg-emerald-500"
          >
            Abrir en pestaña
          </button>

          <button
            onClick={()=>Compartir(pdfUrl, "grilla")}
            className="md:hidden block w-full rounded-xl emerald-4 py-3 text-emerald-900 bg-white font-semibold border border-emerald-600  hover:bg-emerald-500"
            >
              Abrir con...
          </button>
   <button
            onClick={()=>Descargar(pdfUrl, "grilla")}
            className="w-full rounded-xl pemeraldx-4 text-emerald-900 bg-white py-3 font-semibold border border-emerald-600  hover:bg-emerald-500"
            >Descargar
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