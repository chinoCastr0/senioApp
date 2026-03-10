import { useEffect, useRef, useState } from 'react'
import { pdfjs } from '@/lib/pdfjs'

export default function PdfPreview({
  src,
  page = 1,
  maxWidth = 800,
  showControls = true,
  containerClassName = '',
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  const [currentPage, setCurrentPage] = useState(page)
  const [numPages, setNumPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setCurrentPage(page)
  }, [page])

  useEffect(() => {
    if (!src || !canvasRef.current || !containerRef.current) return

    let cancelled = false
    let pdfDoc = null

    async function renderPDF() {
      setLoading(true)
      setError(null)

      try {
        const documentSource =
          typeof src === 'string'
            ? { url: src }
            : src instanceof Blob
              ? { data: await src.arrayBuffer() }
              : { data: src }

        pdfDoc = await pdfjs.getDocument(documentSource).promise
        if (cancelled) return

        setNumPages(pdfDoc.numPages)

        const safePage = Math.min(Math.max(currentPage, 1), pdfDoc.numPages)
        const pdfPage = await pdfDoc.getPage(safePage)
        if (cancelled) return

        const baseViewport = pdfPage.getViewport({ scale: 1 })

        const containerWidth = containerRef.current.clientWidth || maxWidth
        const targetWidth = Math.min(containerWidth, maxWidth)
        const scale = targetWidth / baseViewport.width

        const viewport = pdfPage.getViewport({ scale })

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        const dpr = Math.min(window.devicePixelRatio || 1, 2)

        canvas.width = Math.round(viewport.width * dpr)
        canvas.height = Math.round(viewport.height * dpr)
        canvas.style.width = `${Math.round(viewport.width)}px`
        canvas.style.height = `${Math.round(viewport.height)}px`

        context.setTransform(dpr, 0, 0, dpr, 0, 0)

        await pdfPage.render({
          canvasContext: context,
          viewport,
        }).promise

        pdfPage.cleanup()
      } catch (err) {
        console.error('Error al renderizar PDF:', err)
        if (!cancelled) {
          setError('No se pudo renderizar el PDF')
        }
      } finally {
        if (pdfDoc) {
          try {
            await pdfDoc.cleanup()
            pdfDoc.destroy()
          } catch {
            // noop
          }
        }

        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    renderPDF()

    return () => {
      cancelled = true
    }
  }, [src, currentPage, maxWidth])

  return (
    <div
      ref={containerRef}
      className={`w-full ${containerClassName}`}
      style={{ maxWidth }}
    >
      {loading && (
        <div className="h-40 w-full animate-pulse rounded-xl bg-gray-200 mb-2" />
      )}

      {error && (
        <div className="mb-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`${loading || error ? 'hidden' : 'block'} mx-auto rounded-xl shadow-sm`}
      />

      {showControls && numPages > 1 && !loading && !error && (
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
          >
            ← Anterior
          </button>

          <span className="text-gray-600">
            Página {currentPage} / {numPages}
          </span>

          <button
            type="button"
            className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
            disabled={currentPage >= numPages}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}