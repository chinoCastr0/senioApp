export async function Descargar(pdf_url, filename) {

  try {
    //  Descarga el PDF como Blob
    const res = await fetch(pdf_url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    const pdfBlob = await res.blob();
    const blobUrl = URL.createObjectURL(pdfBlob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename; // sugiere guardar
    document.body.appendChild(a);
    a.click();
    a.remove();


    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("error de descarga:", err);

    // descarga y que lo abran desde “Descargas”


  } return 
}
