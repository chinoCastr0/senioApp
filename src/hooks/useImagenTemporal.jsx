// src/hooks/useImagenTemporal.js
import { useState, useEffect } from 'react'

const CLAVE_STORAGE = 'imagenBase64'

export default function useImagenTemporal() {
  const [base64, setBase64State] = useState(null)

  // Al iniciar, buscamos si ya había una imagen guardada
  useEffect(() => {
    const guardada = localStorage.getItem(CLAVE_STORAGE)
    if (guardada) setBase64State(guardada)
  }, [])

  // Cuando se actualiza el base64, también lo guardamos en localStorage
  const setBase64 = (nuevoBase64) => {
    setBase64State(nuevoBase64)
    localStorage.setItem(CLAVE_STORAGE, nuevoBase64)
  }

  // Borrar la imagen temporal cuando termina el flujo
  const clearBase64 = () => {
    setBase64State(null)
    localStorage.removeItem(CLAVE_STORAGE)
  }

  return { base64, setBase64, clearBase64 }
}
