import * as pdfjs from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'

// Conectar el worker (necesario para rendimiento)
pdfjs.GlobalWorkerOptions.workerPort = new pdfjsWorker()

export { pdfjs }