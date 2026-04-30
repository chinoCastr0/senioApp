// src/hooks/useGenerarGrillaPDF.js
import { useEffect, useState } from 'react'
import { postForm, toAbsoluteURL } from '@/helpers/api'

// function dataURLtoBlob(dataUrl) {
//   const [meta, base64] = dataUrl.split(',')
//   const mime = (meta.match(/:(.*?);/) || [])[1] || 'image/png'

//   const binary = atob(base64)
//   const bytes = new Uint8Array(binary.length)

//   for (let i = 0; i < binary.length; i++) {
//     bytes[i] = binary.charCodeAt(i)
//   }

//   return new Blob([bytes], { type: mime })
// }

export function useGenerarGrillaPDF(imgblob, layout) {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const {altoMm, anchoMm, cantidad} = layout.layoutSeleccionado
 console.log('llego esto al custom hook', imgblob,layout)
  useEffect(() => {
    if (!imgblob || !layout) return

    // Validar que layout tenga las propiedades necesarias
    if (!layout.altoMm || !layout.anchoMm || !layout.cantidad) {
      setError('El layout seleccionado no es válido. Faltan dimensiones o cantidad.')
    //   return
    }

    let cancelled = false
    const imageBlob = imgblob
    //aca esta esperando un objeto blob por eso no funciona, hay que hacer fetch que es lo que hace /Grilla
    async function generarPDF() {
      setLoading(true)
      setError(null)
      setPdfUrl(null)

      try {
   
        console.log('la url de la imagen', imageBlob)
        console.log('layout:', layout)
        const formData = new FormData()
        formData.append('file', imageBlob, 'recurso.png')
        formData.append('altoMm', String(altoMm))
        formData.append('anchoMm', String(anchoMm))
        formData.append('cantidad', String(cantidad))
 console.log('llego esto al custom hook 2', imgblob,layout)

        const data = await postForm('/generar-pdf', formData, 60000)

        if (!data?.pdf_url) {
          throw new Error('El backend no devolvió pdf_url')
        }

        const absolutePdfUrl = toAbsoluteURL(data.pdf_url)

        if (!cancelled) {
          setPdfUrl(absolutePdfUrl)
        }
      } catch (err) {
        console.error('Error al generar PDF:', err)

        if (!cancelled) {
          setError('No pudimos generar la grilla. Probá de nuevo.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    generarPDF()

    return () => {
      cancelled = true
    }
  }, [imgblob, layout,altoMm, anchoMm, cantidad])

  return { pdfUrl, loading, error }
}