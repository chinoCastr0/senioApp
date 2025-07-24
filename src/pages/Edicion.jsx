import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import VistaPreviaImagen from '../components/ui/VistaPreviaImagen'
import BotonPrimario from '../components/ui/BotonPrimario'
import useImagenTemporal from '../hooks/useImagenTemporal'
import { aplicarFiltroCanvas } from '../hooks/aplicarFiltroCanvas'

const FILTROS = [
  {
    clave: 'ninguno',
    clase: '',
    label: 'Normal',
  },
  {
    clave: 'grises',
    clase: 'filter grayscale',
    label: 'Escala de grises',
  },
  {
    clave: 'blancoNegro',
    clase: 'filter grayscale contrast-200',
    label: 'Blanco y negro',
  },
]

export default function Edicion() {
  const { base64, setBase64 } = useImagenTemporal()
  const { state } = useLocation()
  const navigate = useNavigate()
  const layoutSeleccionado = state?.layoutSeleccionado

  const [filtro, setFiltro] = useState('ninguno')

      async function irAGrilla() {
  const base64Procesada = await aplicarFiltroCanvas(base64, filtro)
  setBase64(base64Procesada) // reemplaza con la imagen filtrada de verdad
  navigate('/grilla', { state: { base64Procesada,layoutSeleccionado } })
  console.log('obtenido', {state: {layoutSeleccionado, base64Procesada}})
}
  const filtroActual = FILTROS.find(f => f.clave === filtro)

  return (
    <div className="min-h-screen bg-emerald-900 px-4 py-6 flex flex-col items-center gap-6">
      <h1 className="text-white text-xl font-bold">Editá tu imagen</h1>

      <div className='max-h-50 mt-4 border rounded p-4 bg-blue-900 '>
        {base64 && (
          <VistaPreviaImagen src={base64} className={`max-h-40 mx-auto ${filtroActual.clase}`} />
        )}
      </div>

      <div className="flex gap-2 text-white text-sm">
        {FILTROS.map(({ clave, label }) => (
          <button
            key={clave}
            className={`px-3 py-1 rounded ${
              filtro === clave ? 'bg-white text-black' : 'bg-emerald-700'
            }`}
            onClick={() => setFiltro(clave)}
          >
            {label}
          </button>
        ))}
      </div>

      <BotonPrimario
        texto="Siguiente →"
        onClick={irAGrilla}
        disabled={!base64 || !layoutSeleccionado}
      />
    </div>
  )

}