import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'

import BotonPrimario from '../components/ui/BotonPrimario'
import BotonVolver from '../components/ui/BotonVolver'
//import { calcularDPI, clasificarCalidad } from '../hooks/CalDPI'
import useImagenTemporal from '../hooks/useImagenTemporal'

export default function LayoutSelector() {
  const navigate = useNavigate()
  const location = useLocation()

  const { originalBase64, base64: legacyBase64, setOriginalBase64Once } = useImagenTemporal()
  const base64FromState = location.state?.base64Tmp || null

  // Fuente final de imagen (hook primero; si no, state)
  const imgBase64 = originalBase64 || legacyBase64 || base64FromState

  const [dimensiones, setDimensiones] = useState(null)

  // Si no hay imagen en ningún lado, volver a Subida
  useEffect(() => {
    if (!imgBase64) {
      navigate('/', { replace: true })
    }
  }, [imgBase64, navigate])

  // Si vino por state (fallback) y aún no está persistida como original, persistimos ahora
  useEffect(() => {
    if (!originalBase64 && base64FromState && typeof setOriginalBase64Once === 'function') {
      setOriginalBase64Once(base64FromState)
    }
  }, [originalBase64, base64FromState, setOriginalBase64Once])

  // Extraer dimensiones de la imagen base64
  useEffect(() => {
    if (!imgBase64) return
    const img = new Image()
    img.onload = () => setDimensiones({ width: img.width, height: img.height })
    img.src = imgBase64
  }, [imgBase64])

  // Layouts disponibles
  const layouts = useMemo(() => ([
    //{ id: 1, titulo: "1 por hoja", cantidad: 1, altoMm: 297,  anchoMm: 210 },
    { id: 2, titulo: "2 por hoja", cantidad: 2, altoMm: 148.5, anchoMm: 210 },
    { id: 3, titulo: "3 por hoja", cantidad: 3, altoMm: 99,   anchoMm: 210 },
    { id: 4, titulo: "4 por hoja", cantidad: 4, altoMm: 148.5, anchoMm: 105 },
    { id: 6, titulo: "6 por hoja", cantidad: 6, altoMm: 99,   anchoMm: 105 },
    { id: 8, titulo: "8 por hoja", cantidad: 8, altoMm: 74.25,   anchoMm: 105 },

  ]), [])

  const gridFor = (cantidad) => {
   // if (cantidad === 1) return { rows: 1, cols: 1 }
    if (cantidad === 2) return { rows: 2, cols: 1 }
    if (cantidad === 3) return { rows: 3, cols: 1 }
    if (cantidad === 4) return { rows: 2, cols: 2 }
    if (cantidad === 6) return { rows: 3, cols: 2 }
    if (cantidad === 8) return { rows: 4, cols: 2 }

    return { rows: 1, cols: 1 }
  }

  const handleSeleccion = (layout) => {
    navigate('/editar', { state: { layoutSeleccionado: layout, base65Tmp:imgBase64 } })
  }

  if (!imgBase64 || !dimensiones) {
    return <p className="text-center text-gray-200 mt-10">Cargando imagen...</p>
  }

  return (
    <div className="min-h-screen bg-emerald-900 px-4 py-6">
      <BotonVolver />
      <h1 className="text-white text-xl font-bold mb-5 text-center">
        Elegí un formato de impresión
      </h1>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {layouts.map((layout) => {
          //const dpi = calcularDPI(dimensiones, layout.anchoMm, layout.altoMm)
          //const calidad = clasificarCalidad(dpi)
          const { rows, cols } = gridFor(layout.cantidad)

          return (
            <div
              key={layout.id}
              className="rounded-2xl bg-white p-3 border border-emerald-100 shadow-sm flex flex-col"
            >
              <div className="relative w-full aspect-square rounded-xl bg-emerald-50 border border-emerald-200 overflow-hidden">
                <div
                  className="absolute inset-2 grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                  }}
                >
                  {Array.from({ length: layout.cantidad }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-emerald-300 rounded-sm"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <p className="text-[13px] font-semibold text-emerald-900">{layout.titulo}</p>
                <p className="text-[12px] text-emerald-700">
                  {layout.cantidad} copia(s) por hoja
                </p>
             {/* <p className={`text-[12px] mt-1 font-medium ${calidad.color}`}>
                  {calidad.texto}
                </p> */} 
              </div>

              <BotonPrimario
                onClick={() => handleSeleccion(layout)}
                className="mt-2 w-full h-12 text-base"
                texto="Seleccionar"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
