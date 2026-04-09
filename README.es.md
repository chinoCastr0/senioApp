# Seño — Grillas imprimibles y comunicados rápidos para docentes

PWA móvil‑first más un servicio FastAPI liviano que ayuda a docentes a convertir una sola imagen de actividad en una grilla imprimible (2/3/4/6/8 por A4) y a generar “comunicados” simples en dos columnas, listos para imprimir y enviar. La app está en español; este README también.

**Por qué existe**
- En la práctica escolar, muchas veces hay que duplicar una actividad para todo el curso y dejarla lista para recortar. Las herramientas típicas requieren notebook o editores complejos y generan impresiones borrosas. Esta app lo resuelve desde el teléfono, en minutos, con PDFs nítidos a tamaño real.
- Para avisos a familias, genera una hoja con el mismo comunicado repetido en dos columnas y con líneas guía.

**Instantánea de arquitectura**
- Frontend: React 19 + Vite 6 + Tailwind + pdf.js + PWA. Ver `src/`, `vite.config.js:10`, `src/main.jsx:6`, `src/lib/pdfjs.js:4`.
- Backend: FastAPI con ReportLab y Pillow. Ver `backend/main.py:55`, `backend/main.py:92`, `backend/main.py:172`.


**Problema que resuelve**
- Generar grillas A4 listas para recortar a partir de una única imagen, sin depender de PC.
- Crear comunicados en dos columnas, repetidos para toda la división, con vista previa.
- Funcionar bien en móviles (Android primero), con soporte offline y “Abrir con…”/Compartir.


**Características clave**
- Imagen → PDF de grilla
  - Subida, compresión en el dispositivo, vista previa rápida y filtros opcionales (grises/B&N) para mejorar la legibilidad al imprimir.
  - Layouts: 2, 3, 4, 6 u 8 por A4, con lógica de orientación sensible al contenido.
  - Generación de PDF en el servidor para obtener impresión nítida y medidas determinísticas.
- Generador de “Comunicado”
  - Se escribe el texto y el backend arma el bloque en dos columnas repetido a lo largo de la página.
  - Vista previa en la app y luego abrir/compartir/descargar según convenga.
- PWA móvil
  - Service Worker con auto‑update; manifest e íconos maskable; fallback SPA. Ver `vite.config.js:10`, `public/manifest.webmanifest:2`, `vercel.json:1`, `src/main.jsx:6`.
- Vista previa y compartido de PDFs
  - Render en‑app con pdf.js y workers. Ver `src/lib/pdfjs.js:4`.
  - “Abrir con…” en Android vía Web Share API, con fallbacks a nueva pestaña o descarga.
- Backend simple
  - Endpoints: `/generar-pdf`, `/generar-comunicado` y `/download/{filename}`. Ver `backend/main.py:55`, `backend/main.py:92`, `backend/main.py:172`.
  - Almacenamiento efímero con barrido en background (30 min por defecto). Ver `backend/main.py:47`, `backend/main.py:225`.


**Decisiones de arquitectura**
- PDF del lado servidor vs. canvas del cliente
  - En móviles, los canvas grandes son pesados y la impresión sale “suave”. ReportLab asegura layout en mm→pt y salidas listas para imprenta.
- Subidas efímeras en disco local
  - Evita acoplar un S3/GCS y permisos en el MVP. Un sweeper elimina archivos viejos.
- PWA con caché en runtime
  - Estáticos e imágenes externas van a caché; las respuestas de API son “network‑first” para evitar PDFs viejos. Ver `vite.config.js:23`.
- Estado de cliente mínimo
  - React state + `localStorage` guardan el base64 original para navegar entre pasos sin sobrescribir. Ver `src/hooks/useImagenTemporal.jsx`.
- Descarga real cuando hace falta
  - `/download/{filename}` devuelve `application/octet-stream` y expone `Content-Disposition` para que Android permita “Abrir con…”. Ver `backend/main.py:172`.


**Trade‑offs y limitaciones**
- Archivos efímeros
  - En despliegues con múltiples instancias hace falta storage compartido o “single writer”; si no, otra instancia podría no ver el PDF recién creado.
- Dependencias de imagen en Python
  - ReportLab/Pillow agrandan el runtime; en máquinas chicas, el cold start es mayor.
- Cobertura de Web Share API
  - No todos los navegadores (especialmente algunas versiones de iOS) permiten compartir archivos; los fallbacks abren nueva pestaña o fuerzan descarga.
- CORS abierto por defecto
  - `allow_origins=["*"]` simplifica desarrollo; en producción hay que restringir a dominios del frontend.


**Cómo funciona (de punta a punta)**
- Frontend
  - `Subida`: se selecciona imagen → compresión con `browser-image-compression`.
  - `SelectorLayouts`: se elige layout → `Edicion` aplica filtros no destructivos.
  - `Grilla`: se envía base64 a `/generar-pdf`; se previsualiza con pdf.js y se comparte o descarga.
  - “Comunicado rápido”: se envía texto a `/generar-comunicado` y se previsualiza en `GrillaComunicado`.
  - La URL base del API se detecta de `VITE_API_URL` o cae en `proto://host:8000`. Ver `src/helpers/api.js:3` y `src/helpers/api.js:20`.
- Backend
  - `/generar-pdf`: decodifica imagen, calcula filas/columnas por cantidad pedida, dibuja celdas + bordes y guarda en `uploads/pdfs/`. Devuelve URLs. Ver `backend/main.py:55`.
  - `/generar-comunicado`: arma el texto repetido en dos columnas ajustado a la página. Ver `backend/main.py:92`.
  - `/download/{filename}`: fuerza descarga como adjunto y expone headers para el frontend. Ver `backend/main.py:172`.
  - Un sweeper elimina archivos con antigüedad > `RETENTION_SECONDS` (30 min). Ver `backend/main.py:47`, `backend/main.py:225`.


**Setup local**
- Requisitos
  - Node.js 18+ y npm (o pnpm)
  - Python 3.11+ y pip
- Backend (FastAPI)
  - `cd backend`
  - Crear venv: `python -m venv .venv` y activarlo (`. .venv/Scripts/Activate` en Windows o `. .venv/bin/activate` en Unix)
  - `pip install -r requirements.txt`
  - `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Frontend (Vite)
  - En la raíz: `npm install`
  - Configurar API base:
    - Simple: crear `./.env.development` con `VITE_API_URL=http://localhost:8000` (hay un ejemplo en el repo).
    - Para probar desde el celular por Wi‑Fi: `VITE_API_URL=http://<IP-de-tu-PC>:8000`.
  - `npm run dev` y abrir `http://localhost:5173`


**Despliegue**
- Frontend en Vercel
  - Fallback SPA configurado en `vercel.json:1`. Build con `vite build` (output `dist/`).
  - Definir `VITE_API_URL` apuntando al backend público.
- Backend en una VM pequeña (lo que uso)
  - Crear venv y `pip install -r backend/requirements.txt`.
  - Servir detrás de un reverse proxy (Caddy/Nginx) hacia `127.0.0.1:8000`.
  - Persistir `backend/uploads/` (o montar un volumen). Ajustar `RETENTION_SECONDS` según necesidad.
  - Restringir CORS al origen del frontend en `backend/main.py:30`.
  - Comando de producción: `uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*"`.


**API**
- `POST /generar-pdf` → `{ pdf_url, download_url, filename }`
- `POST /generar-comunicado` → `{ pdf_url, preview_url, download_url, filename }`
- `GET /download/{filename}` → adjunto `application/octet-stream`
- `GET /health` → `{ ok: true }`


**Desafíos técnicos**
- Impresiones nítidas desde el teléfono
  - Con canvas del cliente la salida era “suave”; con ReportLab en servidor quedó definido.
- Flujo “Abrir con…” en Android
  - Algunos viewers interceptaban el PDF; el endpoint de descarga + Web Share API estabilizaron la UX.
- pdf.js worker con Vite
  - Worker cableado vía imports `?worker` y `?url` + `GlobalWorkerOptions`. Ver `src/lib/pdfjs.js:4`.
- URL base sensible a red
  - La autodetección permite usar el mismo build localmente y en el teléfono cambiando solo una env var.


**Roadmap**
- Layout libre: filas/columnas, márgenes y guías configurables.
- Lotes multipágina y rotación/zoom por celda.
- Almacenamiento en la nube + links firmados en lugar de disco local.
- i18n (toggle ES/EN) y accesibilidad.
- Dockerfiles y CI para construir/probar ambos tiers.
- Caching PWA más fino y bundles más chicos; cachear PDFs solo por acción del usuario.
- Tests: unitarios (cálculo de layout) y E2E (flujos móviles).


**Estructura del proyecto**
- `src/pages/` — pantallas de ruta (`Subida`, `Edicion`, `SelectorLayouts`, `Grilla`, `GrillaComunicado`)
- `src/components/` — UI y `PdfPreview`
- `src/hooks/` — estado de imagen y hooks de generación de PDF
- `backend/` — FastAPI y utilidades de PDF
- `public/` — manifest e íconos PWA

**Scripts**
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de frontend
- `npm run preview` — previsualizar build

Versión en inglés: `README.md`.