import { useNavigate } from 'react-router-dom'
import BotonPrimario from '../components/ui/BotonPrimario'
export default function Edicion() {
const navigate = useNavigate()

  function irAGrilla() {
    navigate('/grilla')
  }
  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">Pantalla de edición</h1>

      <div className="bg-red-500 text-white p-4">
        ¿Se ve rojo con texto blanco?
      </div>
      <BotonPrimario
        texto="Armar la grilla"
        onClick={irAGrilla}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    />
        </div>
  )
}  
  

