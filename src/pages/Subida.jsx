import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import BotonPrimario from '../components/ui/BotonPrimario'
import InputArchivo from '../components/ui/InputArchivo'
import VistaPreviaImagen from '../components/ui/VistaPreviaImagen'

export default function Subida() {
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (archivo && archivo.type.startsWith('image/')) {
      const url = URL.createObjectURL(archivo)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [archivo])



  function irALayouts() {
    navigate('/layouts', { state: { archivo } })
  }

  return (
    <div className="bg-emerald-900 min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-white text-2xl font-bold text-center border-">Subí tu recurso</h1>

      <InputArchivo onArchivoSeleccionado={setArchivo} />

      {archivo && (
        <div className="text-center text-sm text-gray-300">
          {preview && (
            <div className="max-h-30 mt-4 border rounded p-4 bg-blue-900">
              <p className="mb-2">Vista previa:</p>
              <VistaPreviaImagen src={preview} className="max-h-20 mx-auto" />
            </div>
          )}
        </div>
      )}

      <BotonPrimario className='border-2 border-white-300'
        texto="Siguiente →"
        onClick={irALayouts}
        disabled={!archivo}
      />
    </div>
  )
}

