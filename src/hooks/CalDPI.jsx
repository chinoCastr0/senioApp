export function calcularDPI(archivo, anchoMm, altoMm) {
  const anchoPulgadas = anchoMm / 25.4
  const altoPulgadas = altoMm / 25.4

  const dpiX = archivo.width / anchoPulgadas
  const dpiY = archivo.height / altoPulgadas

  return Math.min(dpiX, dpiY)
}

export function clasificarCalidad(dpi) {
  if (dpi >= 200) return { texto: "Óptima calidad", color: "text-green-600" }
  if (dpi >= 120) return { texto: "Aceptable", color: "text-yellow-600" }
  return { texto: "Baja calidad", color: "text-red-600" }
  }