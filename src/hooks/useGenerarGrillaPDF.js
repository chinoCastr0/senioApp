// src/hooks/useGenerarGrillaPDF.js
import { useEffect, useState, useCallback } from 'react'
import { postForm, toAbsoluteURL } from '@/helpers/api'

function dataURLtoBlob(dataUrl) {
  const [meta, b64] = dataUrl.split(',')
  const mime = (meta.match(/:(.*?);/) || ['image/png'])[1]
  const bin = atob(b64)
  const u8 = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
  return new Blob([u8], { type: mime })
}

export function useGenerarGrillaPDF(base64Procesada, layout) {
  const [pdfUrl, setPdfUrl]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const generar = useCallback(async () => {
    if (!base64Procesada || !layout) return
    setLoading(true); setError(null); setPdfUrl(null)
    try { 
      const blob = dataURLtoBlob(base64Procesada)
      const fd = new FormData()
      fd.append('file', blob, 'recurso.png')
      fd.append('altoMm', String(layout.altoMm))
      fd.append('anchoMm', String(layout.anchoMm))
      fd.append('cantidad', String(layout.cantidad))

      const data = await postForm('/generar-pdf', fd, 60000)
      const raw = data.pdf_url || data.url || data.path || data.pdf_path
      const abs = toAbsoluteURL(raw)
      const bust = abs?.includes('?') ? '' : `?_=${Date.now()}`
      setPdfUrl(abs ? abs + bust : null)
    } catch  {
      setError('No pudimos generar la grilla. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [base64Procesada, layout])

  useEffect(() => { generar() }, [generar])

  return { pdfUrl, loading, error, regenerate: generar }
}
