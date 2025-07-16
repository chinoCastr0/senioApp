import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import BotonPrimario from '../components/ui/BotonPrimario'
import { calcularDPI, clasificarCalidad } from '../hooks/CalDPI'


export default function LayoutSelector() {
    const {state} = useLocation()
    const archivo = state?.archivo
    console.log('Archivo recibido:', archivo)
  const navigate = useNavigate()

  const layouts = [
    { id: 1, titulo: "1 por hoja", cantidad: 1, altoMm: 297, anchoMm: 210 },
    { id: 2, titulo: "2 por hoja", cantidad: 2, altoMm: 148.5, anchoMm: 210 },
    { id: 4, titulo: "4 por hoja", cantidad: 4, altoMm: 148.5, anchoMm: 105 },
    { id: 6, titulo: "6 por hoja", cantidad: 6, altoMm: 99, anchoMm: 105 },
  ]

  const handleSeleccion = (layout) => {
    navigate('/edicion', { state: { layoutSeleccionado: layout } })
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h1 className="text-xl font-bold mb-4 text-center">Elegí un formato de impresión</h1>

      <div className="space-y-4">
        {layouts.map((layout) => {
          const dpi = calcularDPI(archivo, layout.anchoMm, layout.altoMm)
          const calidad = clasificarCalidad(dpi)

          return (
            <div key={layout.id} className="flex items-center justify-between border rounded-xl p-4 shadow-sm">
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
