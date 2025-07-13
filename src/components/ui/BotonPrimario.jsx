export default function BotonPrimario({ texto, onClick, disabled = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-green-500 text-white px-4 py-2 rounded transition 
                  hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {texto}
    </button>
  )
}