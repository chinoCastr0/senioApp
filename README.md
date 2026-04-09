[Leer en Español](README.es.md)

# Seño — Printable Grids and Quick Notices for Teachers

A mobile-first PWA plus a lightweight FastAPI service that helps teachers turn a single activity image into a printable grid (2/3/4/6/8 per A4) and generate simple two-column “comunicados” ready to print and send home. The UI is Spanish; the README is in English for portfolio clarity.

**Why it exists**
- In school reality, teachers often need to duplicate a small activity across a whole class quickly and print it cut-ready. Many tools require a laptop, fiddly editors, or produce fuzzy results. This app does it from a phone in minutes with DPI-clean PDFs.
- For quick communication to families, it generates a compact, repeated message sheet (“comunicado”) that prints cleanly and is easy to cut.

**Live Architecture Snapshot**
- Frontend: React 19 + Vite 6 + Tailwind + pdf.js + PWA. See `src/`, `vite.config.js:10`, `src/main.jsx:6`, `src/lib/pdfjs.js:4`.
- Backend: FastAPI with ReportLab and Pillow. See `backend/main.py:55`, `backend/main.py:92`, `backend/main.py:172`.


**Problem Solved**
- Produce crisp, printable A4 grids from a single image without desktop apps.
- Generate a repeated two-column message (“comunicado”) that fits many students per page.
- Work reliably on phones (Android first) with offline support and easy “Open with…/Share”.


**Key Features**
- Image ? Grid PDF
  - Upload, on-device compression, quick preview, optional filters (grayscale/B&W) for cleaner prints.
  - Layouts: 2, 3, 4, 6 or 8 per A4 with sensible orientation logic.
  - Server-side PDF generation yields sharp vectors/rasters at print time.
- “Comunicado” generator
  - Type the message; backend builds a two-column layout repeated down the page.
  - Preview in-app; then open/share/download as needed.
- Mobile-first PWA
  - Service Worker auto-update; manifest + maskable icons; SPA fallback configured. See `vite.config.js:10`, `public/manifest.webmanifest:2`, `vercel.json:1`, `src/main.jsx:6`.
- PDF preview and sharing
  - In-app preview via pdf.js workers. See `src/lib/pdfjs.js:4`.
  - Android “Open with…” via Web Share API with fallbacks to new tab or download.
- Low-friction backend
  - Simple FastAPI endpoints: `/generar-pdf`, `/generar-comunicado`, and `/download/{filename}`. See `backend/main.py:55`, `backend/main.py:92`, `backend/main.py:172`.
  - Ephemeral storage with background sweeper; defaults to 30 minutes. See `backend/main.py:47`, `backend/main.py:225`.


**Architecture Decisions**
- Server-side PDF instead of client canvas
  - Mobile browsers struggle with large canvases and produce fuzzy prints. ReportLab gives deterministic mm?pt layout and print-ready output.
- Keep uploads ephemeral on local disk
  - Avoids introducing S3/GCS and access control for the MVP. A background sweeper deletes old PDFs.
- PWA with runtime caching
  - Cache static assets and external images; keep API responses network-first to avoid stale PDFs. See `vite.config.js:23`.
- Simple client state
  - Use React state + `localStorage` for the original base64 so navigation between steps is robust. See `src/hooks/useImagenTemporal.jsx`.
- Force real downloads when needed
  - A dedicated `/download/{filename}` endpoint returns `application/octet-stream` and exposes `Content-Disposition` so Android lets users open in native print/share apps. See `backend/main.py:172`.


**Trade-offs and Limitations**
- Ephemeral files only
  - Multi-instance deployments need shared storage or a single writer; otherwise a different instance may not see a just-created PDF.
- Heavy Python deps
  - ReportLab/Pillow enlarge the image; cold start times are higher on tiny instances.
- Web Share API coverage
  - Not all browsers (notably some iOS versions) support file sharing; fallbacks open a new tab or trigger download.
- CORS is wide open by default
  - `allow_origins=["*"]` eases dev; in production this must be restricted to frontend domains.


**How It Works (End-to-End)**
- Frontend
  - Select an image on `Subida` ? compress in-browser (`browser-image-compression`).
  - Choose a layout on `SelectorLayouts` ? optional non-destructive filters on `Edicion`.
  - Generate the grid on `Grilla`: base64 is posted to `/generar-pdf`; result is previewed with pdf.js and can be shared.
  - Quick “Comunicado”: send text to `/generar-comunicado` and preview on `GrillaComunicado`.
  - Base API URL is auto-detected from `VITE_API_URL` or falls back to `proto://host:8000`. See `src/helpers/api.js:3` and `src/helpers/api.js:20`.
- Backend
  - `/generar-pdf`: decodes the image, computes rows/cols from the requested quantity, draws cells + crop borders, writes PDF to `uploads/pdfs/` and returns URLs. See `backend/main.py:55`.
  - `/generar-comunicado`: lays out the message in repeated two-column blocks sized to the page. See `backend/main.py:92`.
  - `/download/{filename}`: forces attachment download and exposes headers for the frontend. See `backend/main.py:172`.
  - A sweeper removes files older than `RETENTION_SECONDS` (30 min). See `backend/main.py:47`, `backend/main.py:225`.


**Local Setup**
- Prerequisites
  - Node.js 18+ and npm (or pnpm)
  - Python 3.11+ and pip
- Backend (FastAPI)
  - `cd backend`
  - `python -m venv .venv && . .venv/Scripts/Activate` (Windows) or `. .venv/bin/activate` (Unix)
  - `pip install -r requirements.txt`
  - `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Frontend (Vite)
  - From repo root: `npm install`
  - Configure API base:
    - Easiest: create `./.env.development` with `VITE_API_URL=http://localhost:8000` (a sample is already present).
    - If running on a phone over Wi-Fi, point to your machine IP, e.g. `VITE_API_URL=http://192.168.1.10:8000`.
  - `npm run dev` then open `http://localhost:5173`


**Deployment Setup**
- Frontend on Vercel
  - The SPA fallback is configured in `vercel.json:1`. Build with `vite build` and output `dist/` (Vercel auto-detects).
  - Set the env var `VITE_API_URL` to your backend’s public base URL.
- Backend on a small VM (what I use)
  - Create a Python venv, `pip install -r backend/requirements.txt`.
  - Run behind a reverse proxy (Caddy/Nginx) pointing `api.<your-domain>` to `127.0.0.1:8000`.
  - Persist the `backend/uploads/` directory (or mount a small volume). Tune `RETENTION_SECONDS` as needed.
  - Restrict CORS to your frontend origin(s) in `backend/main.py:30`.
  - Production command example: `uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"`.


**API**
- `POST /generar-pdf` ? `{ pdf_url, download_url, filename }`
- `POST /generar-comunicado` ? `{ pdf_url, preview_url, download_url, filename }`
- `GET /download/{filename}` ? octet-stream attachment
- `GET /health` ? `{ ok: true }`


**Technical Challenges**
- Clean prints from phones
  - Client-side canvas approaches produced soft edges; ReportLab + server render fixed that.
- Android “Open with…” flow
  - Some viewers intercepted PDFs; the explicit download endpoint plus Web Share API yielded consistent UX.
- pdf.js worker bundling under Vite
  - Wired the worker via `?worker` and `?url` imports and set `GlobalWorkerOptions`. See `src/lib/pdfjs.js:4`.
- Network-aware base URL
  - Auto-detecting the backend lets the same build run on localhost and on-device with only an env var change.


**Roadmap**
- Free-form layout: custom rows/cols, margins and crop marks.
- Multi-page batches and per-cell rotation/zoom tools.
- Cloud storage + signed links for PDFs instead of local disk.
- i18n (Spanish/English toggle) and accessibility passes.
- Dockerfiles and CI to build/test both tiers.
- Tighter PWA caching and smaller bundles; cache PDFs only by explicit user action.
- Tests: unit (layout math) and E2E (happy paths on mobile browsers).


**Project Structure**
- `src/pages/` — route screens (`Subida`, `Edicion`, `SelectorLayouts`, `Grilla`, `GrillaComunicado`)
- `src/components/` — UI and `PdfPreview`
- `src/hooks/` — image state and PDF generation hooks
- `backend/` — FastAPI app and PDF utilities
- `public/` — PWA manifest and icons

**Scripts**
- `npm run dev` — run Vite dev server
- `npm run build` — build frontend
- `npm run preview` — preview production build

If you want more details about any decision or the deployment I used, open an issue or ping me.