// helpers/openWithChooser.js
export async function openWithChooser(pdf_url, filename = "grilla.pdf") {
  try {
    // 1) Descargamos el PDF como Blob
    const res = await fetch(pdf_url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    const blob = await res.blob();

    const file = new File([blob], filename, { type: "application/pdf" });

    // 2) Chequeamos soporte de Web Share con archivos
    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share({
        files: [file],
        title: "Abrir PDF",
        text: "Elegí con qué app abrir/imprimir el PDF",
      });
      return;
    }

    // 3) Fallback 1: abrir en nueva pestaña (para ver/imprimir desde Chrome)
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Nota: URL.revokeObjectURL(url) no lo llamamos acá para que no se rompa la vista
  } catch (err) {
    console.error("openWithChooser error:", err);

    // 4) Fallback 2: forzar descarga y que lo abran desde “Descargas”
    const a = document.createElement("a");
    a.href = pdf_url;
    a.download = filename; // sugiere guardar
    document.body.appendChild(a);
    a.click();
    a.remove();

    // (Opcional) Mostrar un toast:
    // toast.info("Descargado. Abrilo desde la app que prefieras (Impresora, Drive, etc.)");
  }
}
