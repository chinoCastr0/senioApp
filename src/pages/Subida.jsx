// src/pages/Subida.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import BotonPrimario from '../components/ui/BotonPrimario'
import InputArchivo from '../components/ui/InputArchivo'
import VistaPreviaImagen from '../components/ui/VistaPreviaImagen'
import useImagenTemporal from '../hooks/useImagenTemporal'
import { postForm } from '../helpers/api'
import logo from '../assets/logo.png'
import imageCompression from 'browser-image-compression'


export default function Subida() {
  // ---- Imagen para grilla (flujo actual) ----
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [ultimoBase64, setUltimoBase64] = useState(null)
  const [listoBase64, setListoBase64] = useState(false)
  const navigate = useNavigate()

  const { setOriginalBase64Once, clearAll } = useImagenTemporal()

  async function compresionImagen(archivo){
    const archivoOriginal = archivo

    console.log (`Peso original: ${(archivoOriginal.size / 1024 / 1024).toFixed(2)}MB`);
    const opciones = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const archivoComprimido = await imageCompression(archivoOriginal, opciones);
      
      console.log(`Peso nuevo: ${(archivoComprimido.size / 1024 / 1024).toFixed(2)} MB`);
      return archivoComprimido
    } catch (error){
      console.log("fallo compresion", error);
    }
  }

  async function manejarArchivo (archivoSel) {
    

    if (archivoSel && archivoSel.type.startsWith('image/')) {
      clearAll?.()
      setListoBase64(false)
      setUltimoBase64(null)
      const archCompreso = await compresionImagen(archivoSel)
      setArchivo(archCompreso)
      
      const lector = new FileReader()
      lector.onload = () => {
        const b64 = lector.result
        setUltimoBase64(b64)
        setOriginalBase64Once?.(b64)
        setListoBase64(true)
      }
      lector.readAsDataURL(archCompreso)
    }
  }

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
    navigate('/layouts', { state: { base64Tmp: ultimoBase64 } })
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
      const fd = new FormData()
      fd.append('texto', texto)
      const data = await postForm('/generar-comunicado', fd)

      // Antes mandabas solo pdf; ahora incluimos download.
      const pdf = data?.pdf_url || data?.preview_url
      const download = data?.download_url || null

      const qs = new URLSearchParams()
      if (pdf) qs.set('pdf', pdf)
      if (download) qs.set('download', download)

      navigate(`/grilla-comunicado?${qs.toString()}`)
    } catch  {
      setErrorCom('Hubo un error generando la vista previa')
    } finally {
      setCargandoCom(false)
    }
  }

  return (
    <div className="bg-emerald-900 min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <div
          className=''>
        <img src={logo} 
        className='h-20'
        alt="" />
      </div>
      {/* --- Bloque: subir imagen para grilla --- */}
      <div className=" w-full max-w-md bg-white p-4 rounded-xl border border-emerald-200">
        <h1 className="text-black text-xl  mb-1">Subí tu actividad</h1>
        <h3 className="text-gray-950 text-lg mb-4">Subi una imagen para crear una grilla lista para recortar. </h3>
        <p className="text-black text-sm mb-4 bg-yellow-200 p-3">📷 Tip: asegurate de que la imagen esté clara y se lea bien antes de subirla. </p>

        <InputArchivo onArchivoSeleccionado={manejarArchivo} className="" />

        {preview && (
          <div className=" text-center text-sm text-emerald-700">
            <div className=" mt-4 border border-emerald-200 rounded p-3 bg-emerald-50">
              <p className="mb-2"></p>
              <VistaPreviaImagen src={preview} className="max-h-20 mx-auto" />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <BotonPrimario
            div
            className="w-full"
            texto={listoBase64 ? "Crear grilla →" : "Leyendo imagen…"}
            onClick={irALayouts}
            disabled={!archivo || !listoBase64}
          />
        </div>
      </div>

      {/* separador visual */}
      <div className="text-gray-900 font-serif text-6xl opacity-70 hidden"></div>

      {/* --- Bloque: comunicado rápido --- */}
      <div className="w-full max-w-md bg-white p-4 rounded-xl border border-emerald-200">
        <h2 className="text-black text-lg mb-2">Comunicado rápido</h2>
        <form onSubmit={generarComunicado} className="space-y-3">
          <label htmlFor="comunicado" className="block text-sm text-black">
            Escribí el comunicado
          </label>
          <textarea
            id="comunicado"
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: Señores padres: Mañana no hay clases por acto escolar..."
            className="w-full rounded-xl p-3 text-base outline-none border border-emerald-300 bg-emerald-50 text-black placeholder-gray-600 focus:border-emerald-400"
          />
          {errorCom && <p className="text-sm text-red-300">{errorCom}</p>}

          <BotonPrimario 
            className="w-full text-black"
            type="submit" 
            disabled={cargandoCom}
            texto={cargandoCom ? 'Generando…' : 'Crear comunicado →'}
          />
        </form>
      </div>
    </div>
  )
}



