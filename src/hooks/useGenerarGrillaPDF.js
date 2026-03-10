// src/hooks/useGenerarGrillaPDF.js
import { useEffect, useState } from 'react'
import { postForm, toAbsoluteURL } from '@/helpers/api'

function dataURLtoBlob(dataUrl) {
  const [meta, base64] = dataUrl.split(',')
  const mime = (meta.match(/:(.*?);/) || [])[1] || 'image/png'

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new Blob([bytes], { type: mime })
}

export function useGenerarGrillaPDF(base64Procesada, layout) {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!base64Procesada || !layout) return

    let cancelled = false

    async function generarPDF() {
      setLoading(true)
      setError(null)
      setPdfUrl(null)

      try {
        const imageBlob = dataURLtoBlob(base64Procesada)

        const formData = new FormData()
        formData.append('file', imageBlob, 'recurso.png')
        formData.append('altoMm', String(layout.altoMm))
        formData.append('anchoMm', String(layout.anchoMm))
        formData.append('cantidad', String(layout.cantidad))

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
  }, [base64Procesada, layout])

  return { pdfUrl, loading, error }
}