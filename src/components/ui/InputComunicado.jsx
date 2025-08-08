import { useState } from 'react'
import BotonPrimario from './BotonPrimario'

export default function InputComunicado() {
  const [texto, setTexto] = useState('')
  const [previewURL, setPreviewURL] = useState(null)
  const [pdfURL, setPdfURL] = useState(null)
  const [cargando, setCargando] = useState(false)

  const handleGenerar = async () => {
    if (!texto.trim()) {
      alert('Por favor, escribí el comunicado antes de generar.')
      return
    }

    setCargando(true)
    setPreviewURL(null)
    setPdfURL(null)

    const formData = new FormData()
    formData.append('texto', texto)

    try {
      const response = await fetch('http://localhost:8000/generar-comunicado', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.preview_url || !data.pdf_url) {
        throw new Error('La respuesta del servidor no es válida.')
      }

      setPreviewURL(data.preview_url)
      setPdfURL(data.pdf_url)
    } catch (error) {
      console.error('Error al generar comunicado:', error)
      alert('No se pudo generar el comunicado. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribí tu comunicado acá..."
        rows={6}
        className="w-full p-2 rounded-md border border-gray-300 text-sm"
      />

      <BotonPrimario
        onClick={handleGenerar}
        texto={cargando ? 'Generando...' : 'Generar comunicado'}
        disabled={cargando}
      />

      {previewURL && (
        <div className="mt-4 flex flex-col gap-2 items-start">
          <img
            src={previewURL}
            alt="Vista previa del comunicado"
            className="w-auto h-auto border rounded"
          />
          {pdfURL && (
            <a
              href={pdfURL}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Descargar PDF
            </a>
          )}
        </div>
      )}
    </div>
  )
}