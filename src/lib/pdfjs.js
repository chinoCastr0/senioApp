import * as pdfjs from 'pdfjs-dist'
import * as pdfjsLib from 'pdfjs-dist';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Conectar el worker (necesario para rendimiento)
pdfjs.GlobalWorkerOptions.workerPort = new pdfjsWorker()
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export { pdfjs }
export default pdfjsLib;