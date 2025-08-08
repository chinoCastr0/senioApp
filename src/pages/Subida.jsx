import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import BotonPrimario from '../components/ui/BotonPrimario'
import InputArchivo from '../components/ui/InputArchivo'
import VistaPreviaImagen from '../components/ui/VistaPreviaImagen'
import useImagenTemporal from '../hooks/useImagenTemporal'
import InputComunicado from '../components/ui/InputComunicado'

export default function Subida() {
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()
  const { setBase64 } = useImagenTemporal()

  //  Cuando se elige un archivo, lo convertimos a base64 y lo guardamos
  const manejarArchivo = (archivo) => {
    setArchivo(archivo) // lo guardás si querés usarlo para preview temporal

    if (archivo && archivo.type.startsWith('image/')) {
      const lector = new FileReader() //se crea el FileReader q es una instancia de clase del nav
      lector.onload = () => {
        setBase64(lector.result) //  guardado en localStorage, paso 3
      }
      lector.readAsDataURL(archivo) // lee el archivo como una URL de datos PASO 2
    }
  }

  //  Generar vista previa (ObjectURL solo para mostrar)
  useEffect(() => {
    if (archivo && archivo.type.startsWith('image/')) {
      const url = URL.createObjectURL(archivo)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [archivo]) // Cuando cambia el archivo, actualiza la vista previa

  // Cuando hace clic en "Siguiente"
  function irALayouts() {
    navigate('/layouts') // ya no se pasa el archivo, porque ya está guardado en localStorage
  }

  return (
    <div className="bg-emerald-900 min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-white text-2xl font-bold text-center">Subí tu recurso</h1>

      <InputArchivo onArchivoSeleccionado={manejarArchivo} />

      {preview && (
        <div className="text-center text-sm text-gray-300">
          <div className="max-h-30 mt-4 border rounded p-4 bg-blue-900">
            <p className="mb-2">Vista previa:</p>
            <VistaPreviaImagen src={preview} className="max-h-20 mx-auto" />
          </div>
        </div>
      )}

      <BotonPrimario
      //  className="border-2 border-white-300"
        texto="Crear grilla →"
        onClick={irALayouts}
        disabled={!archivo}
      />

      <BotonPrimario
      //  className="border-2 border-white-300"
        texto="Crear comunicado →"
        onClick={() => navigate('/GrillaComunicado')}
      />
      <InputComunicado /> {/* Componente para generar comunicado */}
    </div>
    
  )
}

