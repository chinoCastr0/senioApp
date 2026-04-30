[Leer en Español](README.es.md)

# Seño — Mobile-first PDF tools for teachers

Seño is a mobile-first PWA for teachers who need printable classroom material without opening a desktop editor. It turns one activity image into a cut-ready A4 grid and generates repeated family notices ("comunicados") as clean PDFs.

The project combines a React/Vite frontend with a FastAPI backend that renders print-ready documents with ReportLab and Pillow. The product is intentionally narrow: upload, choose a layout, preview, download or share.

**Portfolio Focus**

This project shows a complete small-product workflow: user research from a real classroom pain point, mobile UX, file handling, image processing, PDF generation, PWA setup, API integration, and deployment-oriented decisions.

**Problem**

Teachers often need to duplicate a worksheet, label, or small activity for an entire class and print it in a format that is easy to cut. General-purpose tools work, but they are slow on phones, require manual layout work, or produce blurry print output.

Seño solves that with a guided flow:

1. Upload an activity image.
2. Choose how many copies should fit on an A4 page.
3. Optionally apply a print-friendly filter.
4. Generate a PDF preview.
5. Download it or open it with a native print/share app.

**Main Features**

- Image-to-grid PDF generation
  - Supports 2, 3, 4, 6 and 8 copies per A4 page.
  - Compresses uploaded images in the browser before sending them.
  - Applies optional grayscale or high-contrast black-and-white filters.
  - Generates crop borders for cutting.
- Quick notice generator
  - Accepts a text message and repeats it in a two-column A4 layout.
  - Produces a downloadable PDF for school-family communication.
- Mobile-first PWA
  - Installable app experience with manifest, icons and service worker.
  - Designed around Android phone usage and quick classroom workflows.
- PDF preview
  - Uses `react-pdf`/pdf.js to render the generated PDF inside the app.
  - Adjusts preview width responsively with `ResizeObserver`.
- Sharing and download flow
  - Download helper fetches the PDF as a blob and triggers a file download.
  - Share helper uses the Web Share API when the browser supports PDF files.
- API resiliency
  - Centralized `fetch` helper with timeouts, retries and absolute URL handling.
  - `VITE_API_URL` support for local, phone-over-Wi-Fi and production setups.

**Tech Stack**

- Frontend: React 19, Vite 6, React Router, Tailwind CSS, `react-pdf`, `browser-image-compression`, Vite PWA.
- Backend: FastAPI, ReportLab, Pillow, Uvicorn.
- Deployment targets: Vercel for the frontend and a small VM or similar service for the FastAPI API.

**Architecture**

```text
React PWA
  ├─ upload/compress image in browser
  ├─ choose A4 layout
  ├─ apply optional canvas filter
  ├─ POST multipart form data to FastAPI
  ├─ preview generated PDF with react-pdf
  └─ download/share generated file

FastAPI
  ├─ /generar-pdf
  │   └─ ReportLab + Pillow render the image grid PDF
  ├─ /generar-comunicado
  │   └─ ReportLab renders repeated text blocks
  ├─ /uploads/pdfs/*
  │   └─ static preview files
  ├─ /download/{filename}
  │   └─ attachment-style PDF download
  └─ background sweeper
      └─ deletes old generated PDFs
```

**Key Implementation Details**

- The frontend keeps the selected image as a `Blob` in React context (`src/hooks/ImageContext.jsx`) so the user can move between the upload, layout, edit and preview screens without serializing large base64 strings.
- `src/hooks/aplicarFiltroCanvas.jsx` applies grayscale and high-contrast filters only when the user confirms the edit, keeping the preview interaction lightweight.
- `src/hooks/useGenerarGrillaPDF.js` sends the final image and layout dimensions as `FormData` to the backend.
- `backend/utils/pdf_creator.py` computes the grid, resizes the image to print-friendly dimensions and draws borders on an A4 canvas.
- `src/helpers/api.js` centralizes API URL detection, retry behavior and timeout handling.
- `vite.config.js` configures PWA generation, static asset caching, path aliases and the pdf.js worker dependency used by `react-pdf`.

**Product Decisions**

- Server-side PDF generation
  - Large client-side canvases were not reliable enough for crisp printing on phones. ReportLab gives deterministic A4 measurements and stable PDF output.
- Short, guided flow
  - The app avoids a full editor. Teachers get a fixed set of useful layouts and can finish the task quickly.
- Ephemeral storage
  - Generated PDFs are written to local disk and cleaned by a background task. This keeps the MVP simple while avoiding long-term storage of classroom material.
- Mobile-first sharing
  - The UI prioritizes "open with", download and native print flows over desktop-style file management.

**API**

- `GET /health` -> `{ ok: true }`
- `POST /generar-pdf` -> `{ pdf_url, pdf_path, filename, download_url }`
- `POST /generar-comunicado` -> `{ pdf_url, preview_url, pdf_path, filename, download_url }`
- `GET /download/{filename}` -> PDF as an attachment-style response

**Local Setup**

Prerequisites:

- Node.js 18+
- Python 3.11+

Backend:

```bash
cd backend
python -m venv .venv
. .venv/Scripts/Activate   # Windows PowerShell
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
npm install
npm run dev
```

Create `.env.development` in the repo root when needed:

```env
VITE_API_URL=http://localhost:8000
```

For testing from a phone on the same Wi-Fi network, point `VITE_API_URL` to the computer's local IP, for example:

```env
VITE_API_URL=http://192.168.1.10:8000
```

**Scripts**

- `npm run dev` — start Vite development server.
- `npm run build` — build the frontend.
- `npm run preview` — preview the production build.
- `npm run lint` — run ESLint.

**Project Structure**

```text
src/
  components/ui/          reusable UI controls
  helpers/                API, download and share helpers
  hooks/                  image context, filters and PDF generation hook
  pages/                  upload, layout selection, edit and PDF preview screens
backend/
  main.py                 FastAPI app and endpoints
  utils/pdf_creator.py    A4 grid PDF generation
public/
  manifest.webmanifest    PWA metadata
  icons/                  installable app icons
```

**Deployment Notes**

- The frontend can be deployed to Vercel. `vercel.json` already provides an SPA fallback.
- Set `VITE_API_URL` in the frontend deployment to the public backend URL.
- The backend can run with Uvicorn behind a reverse proxy such as Caddy or Nginx.
- Generated PDFs live under `backend/uploads/pdfs/`; use shared storage if running multiple backend instances.
- CORS currently allows the deployed frontend and local development origin. Add any new frontend domains in `backend/main.py`.

**Known Limitations**

- Generated PDFs are temporary and local to the backend instance.
- Multi-instance backend deployments need shared storage or sticky routing.
- Web Share API support differs by browser; the app falls back to download/open flows.
- The current layout options are fixed to the most common classroom print formats.

**Roadmap**

- Custom rows, columns, margins and crop marks.
- Multi-page batches.
- Per-cell zoom/rotation controls.
- Stronger accessibility pass.
- Docker setup and CI.
- Automated tests for layout math and mobile happy paths.
