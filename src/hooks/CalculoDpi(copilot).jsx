import { useState, useEffect } from 'react'

/**
 * Hook para calcular el DPI de una imagen y dar un aviso si es bajo.
 * @param {string} url - URL de la imagen.
 * @param {number} anchoIn - Ancho en pulgadas que tendrá la imagen impresa.
 * @param {number} altoIn - Alto en pulgadas que tendrá la imagen impresa.
 * @returns {Object} { dpi, avisoResolucion }
 */
export function useCalculoDPI(url, anchoIn, altoIn) {
  const [dpi, setDpi] = useState(null)
  const [avisoResolucion, setAvisoResolucion] = useState('')

  useEffect(() => {
    if (!url) return
    const img = new window.Image()
    img.onload = () => {
      const dpiX = img.width / anchoIn
      const dpiY = img.height / altoIn
      const dpiFinal = Math.min(dpiX, dpiY)
      setDpi(dpiFinal)
      if (dpiFinal < 90) {
        setAvisoResolucion(
          '📢 Atención: Esta imagen puede verse un poco borrosa al imprimir si se agranda mucho. No es un error de la app, sino que la calidad original del archivo es baja. Podés seguir usándola, pero tenelo en cuenta si incluye textos o detalles importantes.'
        )
      } else {
        setAvisoResolucion('')
      }
    }
    img.src = url
  }, [url, anchoIn, altoIn])

  return { dpi, avisoResolucion }
}