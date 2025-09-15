export default function InputArchivo({ onArchivoSeleccionado , accept = '.webp,.jpg,.jpeg,.png', texto = 'Elegir archivo' }) {
  function manejarCambio(evento) {
    const archivo = evento.target.files[0]
    if (archivo) {
      onArchivoSeleccionado(archivo)
    }
  }

  return (
    <label className=" border-2 border-white-300 bg-amber-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-amber-700 transition">
      {texto}
      <input
        type="file"
        accept={accept}
        onChange={manejarCambio}
        className="hidden"
      />
    </label>
  )
}