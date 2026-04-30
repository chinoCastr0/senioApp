// src/pages/GrillaComunicado.jsx
import { useMemo, useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import BotonPrimario from '../components/ui/BotonPrimario'
import BotonVolver from '../components/ui/BotonVolver'
import { Document, Page, pdfjs} from 'react-pdf'
import TextLayer from 'react-pdf/dist/Page/TextLayer.js'
import AnnotationLayer from 'react-pdf/dist/Page/AnnotationLayer.js'
import { Descargar } from '../helpers/descargar'
import {Compartir} from '../helpers/compartir'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()


export default function GrillaComunicado() {
  const { search } = useLocation()
  const params = useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search])
  const pdf = params.pdf
  const download = params.download
  const filename = params.filename
  console.log(pdf,"pdf es")
 
  

  //preview
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
    console.log(resizeObserver)
  return () => resizeObserver.disconnect()
}, [pdf])


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

  


  return (
    <div className="bg-emerald-900 min-h-screen flex items-center justify-center p-4">
      <BotonVolver />
      <div className="w-full max-w-md  space-y-4">
        <h1 className="flex text-white justify-center text-xl font-semibold">Vista previa</h1>

        <div 
        ref = {containerRef}
        className=" border border-emerald-700 rounded-xl bg-emerald-800/30 p-2">
           <Document file={pdf}>
            <Page 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            pageNumber={1} width={containerWidth} />
            
            </Document>             
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => Descargar(download, filename)}
            className="w-full px-4 py-3 rounded-xl bg-white text-emerald-900 border border-emerald-600 hover:bg-emerald-50 transition disabled:opacity-60"
          >Descargar
          </button>

          <button
            onClick={() => Compartir(download, filename)}
            className="w-full px-4 py-3 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition disabled:opacity-60"
          >
            Abrir con...
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

