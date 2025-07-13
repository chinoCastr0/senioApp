import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BotonPrimario from '../components/ui/BotonPrimario'


export default function Subida() {
  const [archivo, setArchivo] = useState(null)
  const navigate = useNavigate()

  function manejarArchivo(evento) {
    const archivoSubido = evento.target.files[0]
    if (archivoSubido) {
      setArchivo(archivoSubido)
    }
  }

  function irAEdicion() {
    navigate('/editar')
  }

   return (
  <div className="bg-slate-600">
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-bold text-center">Subí tu recurso</h1>

      <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition">
        Elegir archivo
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={manejarArchivo}
          className="hidden"
        />
      </label>

      {archivo && (
        <p className="text-gray-700 text-sm">
          Archivo seleccionado: <strong>{archivo.name}</strong>
        </p>
      )}
      <BotonPrimario
        texto="Siguiente →"
        onClick={irAEdicion}
        disabled={!archivo}
      />
    </div>
    </div>
  )
}
     /* <button
        onClick={irAEdicion}
        disabled={!archivo}
        className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente →
      </button>*/