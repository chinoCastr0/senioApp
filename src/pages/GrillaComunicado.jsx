import { useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import BotonPrimario from '../components/ui/BotonPrimario'

export default function GrillaComunicado() {
  const { search } = useLocation()
  const { preview, pdf } = useMemo(
    () => Object.fromEntries(new URLSearchParams(search)),
    [search]
  )

  if (!preview || !pdf) {
    return (
      <div className="bg-emerald-900 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-emerald-800/40 p-4 rounded-xl border border-emerald-700 text-emerald-50">
          <p className="mb-4 text-sm">No encontramos la vista previa del comunicado.</p>
          <Link to="/" className="inline-block">
            <BotonPrimario>Volver</BotonPrimario>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-emerald-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-white text-xl font-semibold">Vista previa</h1>

        <div className="w-full border border-emerald-700 rounded-xl overflow-hidden bg-emerald-800/30">
          {/* Para móviles de gama baja: <img> directo */}
          <img
            src={preview}
            alt="Vista previa del comunicado"
            className="w-full h-auto block"
            loading="lazy"
          />
        </div>

        <a href={pdf} download className="inline-block">
          <BotonPrimario>Descargar PDF</BotonPrimario>
        </a>

        <p className="text-xs text-emerald-200 opacity-80">
          Tip: Revisá que el texto sea legible antes de imprimir.
        </p>

        <Link to="/" className="inline-block">
          <button className="text-emerald-200 text-xs underline underline-offset-4">
            Generar otro comunicado
          </button>
        </Link>
      </div>
    </div>
  )
}
