import { useEffect, useMemo, useRef, useState } from 'react'
import { pdfjs } from '@/lib/pdfjs'

export default function PdfPreview({
  src,
  page = 1,
  maxWidth = 800,
  showControls = true,
  containerClassName = '', // estilos para el contenedor externo (podés poner p-2, borde, etc.)
}) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [numPages, setNumPages] = useState(1)
  const [currPage, setCurrPage] = useState(page)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contentWidth, setContentWidth] = useState(maxWidth)

  const docParams = useMemo(() => {
    if (typeof src === 'string') return { url: src }
    if (src instanceof Blob) return { data: src }
    return { data: src } // ArrayBuffer
  }, [src])

  // Mide ancho de contenido (resta paddings del wrapper)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const compute = () => {
      const rectW = el.getBoundingClientRect().width
      const cs = getComputedStyle(el)
      const pl = parseFloat(cs.paddingLeft) || 0
      const pr = parseFloat(cs.paddingRight) || 0
      const usable = Math.max(0, rectW - pl - pr)
      setContentWidth(Math.min(usable || maxWidth, maxWidth))
    }

    const ro = new ResizeObserver(compute)
    ro.observe(el)
    compute()
    return () => ro.disconnect()
  }, [maxWidth])

  useEffect(() => {
    let cancelled = false
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { willReadFrequently: false })
    if (!canvas || !ctx) return

    const run = async () => {
      setLoading(true); setError(null)
      try {
        const doc = await pdfjs.getDocument(docParams).promise
        if (cancelled) { doc.destroy(); return }
        setNumPages(doc.numPages)

        const p = await doc.getPage(currPage)
        const vpBase = p.getViewport({ scale: 1 })

        // Escala exacta al ancho útil del contenedor
        const targetCssWidth = Math.min(contentWidth, vpBase.width, maxWidth)
        const scale = targetCssWidth / vpBase.width
        const vp = p.getViewport({ scale })

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const cssW = Math.round(vp.width)
        const cssH = Math.round(vp.height)
        canvas.width  = Math.round(vp.width * dpr)
        canvas.height = Math.round(vp.height * dpr)
        canvas.style.width  = cssW + 'px'
        canvas.style.height = cssH + 'px'

        const task = p.render({
          canvasContext: ctx,
          viewport: vp,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        })
        await task.promise

        p.cleanup(); await doc.cleanup(); doc.destroy()
      } catch (e) {
        console.error(e); setError('No se pudo renderizar el PDF')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [docParams, currPage, contentWidth, maxWidth])

  return (
    <div ref={wrapRef} className={`w-full ${containerClassName}`} style={{ maxWidth }}>
      {loading && <div className="animate-pulse rounded-xl bg-gray-200 h-40 w-full mb-2" />}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <canvas className="rounded-xl shadow-sm block mx-auto" ref={canvasRef} />
      {showControls && numPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          <button className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                  onClick={() => setCurrPage(p => Math.max(1, p - 1))}
                  disabled={currPage <= 1}>← Anterior</button>
          <span className="text-gray-600">Página {currPage} / {numPages}</span>
          <button className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-50"
                  onClick={() => setCurrPage(p => Math.min(numPages, p + 1))}
                  disabled={currPage >= numPages}>Siguiente →</button>
        </div>
      )}
    </div>
  )
}