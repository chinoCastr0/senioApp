
export function Compartir(pdfBlob, filename) {
  if (!pdfBlob) return

  const file = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' })

  if (navigator.canShare?.({ files: [file] })) {
    navigator.share({
      files: [file],
      title: 'Abrir PDF',
      text: 'Elegí con qué app abrir/imprimir el PDF'
    }).catch(err => {
      if (err.name !== 'AbortError') console.error('error al compartir:', err)
    })
    return
  }

  // Fallback
  const url = URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}