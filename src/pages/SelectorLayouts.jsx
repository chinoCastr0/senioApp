import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import BotonPrimario from '../components/ui/BotonPrimario'
import { calcularDPI, clasificarCalidad } from '../hooks/CalDPI'
import useImagenTemporal from '../hooks/useImagenTemporal'

export default function LayoutSelector() {
  const navigate = useNavigate()
  const { base64 } = useImagenTemporal()
  const [dimensiones, setDimensiones] = useState(null)

  // Extraer dimensiones de la imagen base64
  useEffect(() => {
    if (base64) {
      const img = new Image()
      img.onload = () => {
        setDimensiones({ width: img.width, height: img.height })
      }
      img.src = base64
    }
  }, [base64])

  // Layouts disponibles
  const layouts = [
    { id: 1, titulo: "1 por hoja", cantidad: 1, altoMm: 297, anchoMm: 210 },
    { id: 2, titulo: "2 por hoja", cantidad: 2, altoMm: 148.5, anchoMm: 210 },
    { id: 4, titulo: "4 por hoja", cantidad: 4, altoMm: 148.5, anchoMm: 105 },
    { id: 6, titulo: "6 por hoja", cantidad: 6, altoMm: 99, anchoMm: 105 },
  ]

  // Ir a la etapa de edición
  const handleSeleccion = (layout) => {
    navigate('/editar', { state: { layoutSeleccionado: layout } })
  }

  // Mientras se carga la imagen
  if (!base64 || !dimensiones) {
    return <p className="text-center text-gray-600 mt-10">Cargando imagen...</p>
  }

  return (
    <div className="bg-emerald-900 min-h-screen px-4 py-6">
      <h1 className="bg-lime-950 text-white text-xl font-bold mb-4 text-center">Elegí un formato de impresión</h1>

      <div className="space-y-4">
        {layouts.map((layout) => {
          const dpi = calcularDPI(dimensiones, layout.anchoMm, layout.altoMm)
          const calidad = clasificarCalidad(dpi)

          return (
            <div key={layout.id} className="flex items-center justify-between border rounded-xl p-4 shadow-sm bg-white">
              <div>
                <p className="font-semibold">{layout.titulo}</p>
                <p className="text-sm text-gray-600">{layout.cantidad} copia(s) por hoja</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${calidad.color}`}>{calidad.texto}</p>
                <BotonPrimario onClick={() => handleSeleccion(layout)}>
                  Seleccionar
                </BotonPrimario>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
