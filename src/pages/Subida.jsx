import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import BotonPrimario from '../components/ui/BotonPrimario'
import InputArchivo from '../components/ui/InputArchivo'
import VistaPreviaImagen from '../components/ui/VistaPreviaImagen'
import useImagenTemporal from '../hooks/useImagenTemporal'
import { postForm} from '../helpers/api'

export default function Subida() {
  // ---- Imagen para grilla (flujo actual) ----
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()
  const { setBase64 } = useImagenTemporal()

  // Cuando se elige un archivo, lo convertimos a base64 y lo guardamos
  const manejarArchivo = (archivo) => {
    setArchivo(archivo) // lo guardás si querés usarlo para preview temporal

    if (archivo && archivo.type.startsWith('image/')) {
      const lector = new FileReader() // instancia del navegador para leer archivos
      lector.onload = () => {
        setBase64(lector.result) // guardado en localStorage
      }
      lector.readAsDataURL(archivo) // lee el archivo como DataURL
    }
  }

  // Generar vista previa (ObjectURL solo para mostrar)
  useEffect(() => {
    if (archivo && archivo.type.startsWith('image/')) {
      const url = URL.createObjectURL(archivo)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [archivo])

  // Ir a seleccionar layouts para la grilla de imagen
  function irALayouts() {
    navigate('/layouts') // no se pasa el archivo: ya está guardado en localStorage
  }

  // ---- Comunicado rápido (nuevo, inline) ----
  const [texto, setTexto] = useState('')
  const [cargandoCom, setCargandoCom] = useState(false)
  const [errorCom, setErrorCom] = useState('')

  async function generarComunicado(e) {
    e.preventDefault()
    if (!texto.trim()) {
      setErrorCom('Escribí el comunicado')
      return
    }
    setErrorCom('')
    setCargandoCom(true)
    try {
      // Ajustá la ruta según tu backend. Si tu helper ya tiene baseURL, dejá solo el path:
       const fd = new FormData()
      fd.append('texto', texto)
      const { preview_url, pdf_url } = await postForm('/generar-comunicado', fd)
      const qs = new URLSearchParams({ preview: preview_url, pdf: pdf_url })
      navigate(`/grilla-comunicado?${qs.toString()}`)
    } catch  {
      setErrorCom('Hubo un error generando la vista previa')
    } finally {
      setCargandoCom(false)
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-white text-2xl font-bold text-center"></h1>

      {/* --- Bloque: subir imagen para grilla --- */}
      <div className="h-70 w-full max-w-md bg-emerald-800/90 p-4 rounded-xl border border-emerald-700">
        <h2 className="text-white font-serif text-lg  mb-1">Subí tu recurso</h2>
        <p className="text-white mb-4">Subi una imagen para crear una grilla lista para recortar</p>
        <InputArchivo onArchivoSeleccionado={manejarArchivo} className="" />

        {preview && (
          <div className=" text-center text-sm text-gray-200">
            <div className=" mt-4 border border-emerald-700 rounded p-3 bg-emerald-800/30">
              <p className="mb-2"></p>
              <VistaPreviaImagen src={preview} className="max-h-20 mx-auto" />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <BotonPrimario
          div className="w-full"
            texto="Crear grilla →"
            onClick={irALayouts}
            disabled={!archivo}
          />
        </div>
      </div>

      {/* separador visual */}
      <div className="text-gray-900 font-serif text-6xl opacity-70 hidden">A Nisman lo mataron</div>

      {/* --- Bloque: comunicado rápido --- */}
      <div className="w-full max-w-md bg-emerald-800/90 p-4 rounded-xl border border-emerald-700">
        <h2 className="text-white text-lg mb-2">Comunicado rápido</h2>
        <form onSubmit={generarComunicado} className="space-y-3">
          <label htmlFor="comunicado" className="block text-sm text-emerald-100">
            Escribí el comunicado
          </label>
          <textarea
            id="comunicado"
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: Señores padres: Mañana no hay clases por acto escolar..."
            className="w-full rounded-xl p-3 text-base outline-none border border-emerald-700 bg-emerald-900 text-emerald-50 placeholder-emerald-300 focus:border-emerald-400"
          />
          {errorCom && <p className="text-sm text-red-300">{errorCom}</p>}

          <BotonPrimario 
          className="w-full"
          type="submit" 
          disabled={cargandoCom}
          texto="Crear comunicado →">
            {cargandoCom ? 'Generando…' : 'Ver vista previa'}
            
          </BotonPrimario>
        </form>
      </div>
    </div>
  )
}