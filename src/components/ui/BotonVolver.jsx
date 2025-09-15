import { useNavigate } from 'react-router-dom'

export default function BotonVolver({ className = '' }) {
  const navigate = useNavigate()
  return (
    <div
      className={`fixed left-2 top-2 z-10 ${className}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-800/80 text-white backdrop-blur border border-emerald-700 shadow-sm active:scale-[0.98]"
        aria-label="Volver"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M19 11H7.414l3.293-3.293a1 1 0 1 0-1.414-1.414l-5 5a1 1 0 0 0 0 1.414l5 5a1 1 0 0 0 1.414-1.414L7.414 13H19a1 1 0 1 0 0-2z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">Volver</span>
      </button>
    </div>
  )
}

