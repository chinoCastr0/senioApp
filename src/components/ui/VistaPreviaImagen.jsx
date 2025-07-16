export default function VistaPreviaImagen({ src, alt = 'Vista previa', className = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded shadow ${className}`}
    />
  )
}