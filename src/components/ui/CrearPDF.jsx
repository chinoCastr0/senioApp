import { useState, useEffect, useCallback } from "react"

function base64ToFile(base64, filename = "imagen.png") {
  const arr = base64.split(",")
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export default function CrearPDF({ base64Procesada, layoutSeleccionado }) {
  const [pdfURL, setPdfURL] = useState(null)
  const [loading, setLoading] = useState(false)

  const generarPDF = useCallback(async () => {
    if (!base64Procesada || !layoutSeleccionado) return;
    setLoading(true)
    try {
      const archivo = base64ToFile(base64Procesada)
      const formData = new FormData()
      formData.append("file", archivo)

      // Añadir los campos del layout explícitamente
      formData.append("altoMm", layoutSeleccionado.altoMm)
      formData.append("anchoMm", layoutSeleccionado.anchoMm)
      formData.append("cantidad", layoutSeleccionado.cantidad)

      const response = await fetch("http://localhost:8000/generar-pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Error al generar PDF")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfURL(url)
    } catch (err) {
      console.error(err)
      alert("Hubo un error al generar el PDF.")
    } finally {
      setLoading(false)
    }
    
  }, [base64Procesada, layoutSeleccionado])

useEffect(() => {
  generarPDF()
}, [generarPDF])
  return (
  <div className="flex flex-col items-center gap-4 mt-4">
    {loading && <p className="text-gray-500">Generando PDF...</p>}

    {pdfURL && (
      <>
        <iframe
          src={pdfURL}
          title="Vista previa del PDF"
          className="h-[50vh] rounded-xl border border-gray-300 shadow-md"
        />
        <a
          href={pdfURL}
          download="grilla.pdf"
          className="bg-blue-600 p-3 mt-2 text-sm text-white underline rounded-x1 shadow "
        >
          Descargar PDF
        </a>
      </>
    )}
  </div>
)
}
