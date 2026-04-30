// src/pages/Subida.jsx
import { useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import {useImagenTemporal} from '../hooks/ImageContext'


import BotonPrimario from '../components/ui/BotonPrimario'
import InputArchivo from '../components/ui/InputArchivo'
import VistaPreviaImagen from '../components/ui/VistaPreviaImagen'
import { postForm } from '../helpers/api'
import logo from '../assets/logo.png'
import imageCompression from 'browser-image-compression'


export default function Subida() {
  //Imagen para grilla 
  const [preview, setPreview] = useState(null)
  const {imagenBlob, setImagenBlob} = useImagenTemporal();
  const [listoImg, setListoImg] = useState()
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const [cargandoCom, setCargandoCom] = useState(false)
  const [errorCom, setErrorCom] = useState('')
  const oncePreview = useRef(null)
  

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
  
      const archCompreso = await compresionImagen(archivoSel)
      setImagenBlob(archCompreso)
      console.log('imagen seteada: ',archCompreso)
        setListoImg(true)
        oncePreview.current = URL.createObjectURL(archCompreso)
        setPreview(oncePreview.current)
        oncePreview.current = URL.revokeObjectURL(archCompreso)

  }
  }

    console.log('aca se tendria que borrar', preview, 'aca imagenBLB', imagenBlob)

  function irALayouts() {
    navigate('/layouts')
  }


  // Comunicado 


  async function generarComunicado(e) {
    e.preventDefault()// corroborar si sirve, es para cortar comportamiento default
    if (!texto.trim()) {//evita q se envie vacio
      setErrorCom('Escribí el comunicado')
      return
    }
    setErrorCom('')//corroborar
    setCargandoCom(true)
    try {
      const fd = new FormData()
      fd.append('texto', texto)
      const data = await postForm('/generar-comunicado', fd)//creacion de fd y envio de request


      const pdf = data?.pdf_url || data?.preview_url //preview_url y pdf_url son lo mismo
      const download = data?.download_url || null
      const filename = data?.filename || null
      const qs = new URLSearchParams() //las qs(querystring) son key&value enviadas en la url, urlsearchparams es para separarlas
      if (pdf) qs.set('pdf', pdf)
      if (download) qs.set('download', download)
      if (filename) qs.set('filename', filename)

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
            {/*Bloque: grilla  */}

      <div className=" w-full max-w-md bg-white p-4 rounded-xl border border-emerald-200">
        <h1 className="text-black text-xl  mb-1">Subí tu actividad para niños</h1>
        <h3 className="text-gray-950 text-lg mb-4">Subi una imagen para crear una grilla lista para recortar. </h3>
        <p className="text-black text-sm mb-4 bg-yellow-200 p-3">📷 Tip: asegurate de que la imagen esté clara y se lea bien antes de subirla. </p>

        <InputArchivo onArchivoSeleccionado={manejarArchivo} className="" />

        {preview&& (
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
            texto={listoImg ? "Crear grilla →" : "Inserte imagen"}
            onClick={irALayouts}
            disabled={!imagenBlob || !listoImg}
            
          />
        </div>
      </div>

      {/*Bloque: comunicado  */}
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
