import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import CrearPDF from "../components/ui/CrearPDF"

export default function Grilla() {
  const location = useLocation()
  const [base64Procesada, setBase64Procesada] = useState("")
  const [layoutSeleccionado, setLayoutSeleccionado] = useState(null)

  useEffect(() => {
    if (location.state) {
      setBase64Procesada(location.state.base64Procesada)
      setLayoutSeleccionado(location.state.layoutSeleccionado)
    }
  }, [location.state])

  return (
    <div className="h-[100vh] bg-emerald-900 p-6 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 text-white mb-4">
        <span className="text-2xl">✅</span>
        <h1 className="text-xl font-bold">Grilla finalizada con éxito</h1>
      </div>

      {base64Procesada && layoutSeleccionado ? (
        <CrearPDF
          base64Procesada={base64Procesada}
          layoutSeleccionado={layoutSeleccionado}
        />
      ) : (
        <p className="text-gray-500">Cargando datos...</p>
      )}
    </div>
  )
}