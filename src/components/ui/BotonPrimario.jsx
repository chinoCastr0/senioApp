export default function BotonPrimario({ texto, onClick, disabled = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border-2 border-white-300 bg-green-500 text-white px-4 py-2 rounded transition 
                  hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {texto}
    </button>
  )
} //boton primario se le dice al boton mas importante de la pantalla; avanzar, guardar, subir, etc.