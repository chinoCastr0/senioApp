# Seño — Herramientas PDF mobile-first para docentes

[English version](README.md)

Seño es una PWA mobile-first para docentes que necesitan preparar material imprimible sin abrir un editor de escritorio. Convierte una imagen de actividad en una grilla A4 lista para recortar y genera comunicados repetidos en PDF.

El proyecto combina un frontend en React/Vite con un backend FastAPI que renderiza documentos listos para imprimir usando ReportLab y Pillow. El producto está pensado para resolver pocas tareas, pero resolverlas rápido: subir, elegir formato, previsualizar, descargar o compartir.

**Enfoque de portfolio**

Este proyecto muestra un flujo completo de producto chico: identificación de un problema real de aula, UX móvil, manejo de archivos, procesamiento de imágenes, generación de PDFs, configuración PWA, integración con API y decisiones pensadas para despliegue.

**Problema**

En la práctica docente es común tener que duplicar una ficha, consigna o actividad chica para todo el curso y dejarla lista para imprimir y recortar. Las herramientas generales sirven, pero suelen ser lentas desde el celular, requieren acomodar todo manualmente o terminan generando impresiones borrosas.

Seño lo resuelve con un flujo guiado:

1. Subir una imagen de actividad.
2. Elegir cuántas copias entran en una hoja A4.
3. Aplicar un filtro opcional para impresión.
4. Generar una vista previa en PDF.
5. Descargar o abrir el archivo con una app nativa de impresión/compartir.

**Funcionalidades principales**

- Generación de grillas desde imagen
  - Soporta 2, 3, 4, 6 y 8 copias por hoja A4.
  - Comprime la imagen en el navegador antes de enviarla.
  - Permite aplicar filtros de escala de grises o blanco y negro de alto contraste.
  - Agrega bordes de corte para facilitar el recortado.
- Generador de comunicados rápidos
  - Recibe un texto y lo repite en una hoja A4 en dos columnas.
  - Produce un PDF descargable para comunicación escuela-familia.
- PWA mobile-first
  - Experiencia instalable con manifest, íconos y service worker.
  - Diseñada pensando primero en uso desde Android y flujos rápidos de aula.
- Vista previa de PDF
  - Usa `react-pdf`/pdf.js para renderizar el PDF generado dentro de la app.
  - Ajusta el ancho de la previsualización de forma responsive con `ResizeObserver`.
- Descarga y compartido
  - El helper de descarga obtiene el PDF como `Blob` y dispara la descarga del archivo.
  - El helper de compartir usa Web Share API cuando el navegador soporta archivos PDF.
- Integración API robusta
  - Helper centralizado de `fetch` con timeouts, reintentos y manejo de URLs absolutas.
  - Soporte para `VITE_API_URL` en entorno local, pruebas desde celular por Wi-Fi y producción.

**Stack técnico**

- Frontend: React 19, Vite 6, React Router, Tailwind CSS, `react-pdf`, `browser-image-compression`, Vite PWA.
- Backend: FastAPI, ReportLab, Pillow, Uvicorn.
- Despliegue previsto: Vercel para el frontend y una VM pequeña o servicio similar para la API FastAPI.

**Arquitectura**

```text
React PWA
  ├─ sube/comprime imagen en el navegador
  ├─ permite elegir layout A4
  ├─ aplica filtro opcional con canvas
  ├─ envía multipart form data a FastAPI
  ├─ previsualiza el PDF generado con react-pdf
  └─ descarga/compartir el archivo generado

FastAPI
  ├─ /generar-pdf
  │   └─ ReportLab + Pillow renderizan la grilla de imagen
  ├─ /generar-comunicado
  │   └─ ReportLab renderiza bloques de texto repetidos
  ├─ /uploads/pdfs/*
  │   └─ archivos estáticos para previsualización
  ├─ /download/{filename}
  │   └─ descarga del PDF como adjunto
  └─ limpieza en background
      └─ elimina PDFs viejos
```

**Detalles de implementación**

- El frontend conserva la imagen seleccionada como `Blob` en React context (`src/hooks/ImageContext.jsx`) para navegar entre subida, selección de layout, edición y vista previa sin serializar base64 pesado.
- `src/hooks/aplicarFiltroCanvas.jsx` aplica escala de grises o blanco y negro solo al confirmar la edición, manteniendo liviana la vista previa.
- `src/hooks/useGenerarGrillaPDF.js` envía la imagen final y las dimensiones del layout como `FormData` al backend.
- `backend/utils/pdf_creator.py` calcula la grilla, redimensiona la imagen a dimensiones adecuadas para impresión y dibuja bordes sobre un canvas A4.
- `src/helpers/api.js` centraliza detección de URL base, reintentos y timeouts.
- `vite.config.js` configura PWA, caché de assets, alias de paths y la dependencia del worker de pdf.js que usa `react-pdf`.

**Decisiones de producto y arquitectura**

- Generación de PDF del lado servidor
  - Los canvas grandes del cliente no eran suficientemente confiables para impresión nítida en celulares. ReportLab permite medidas A4 determinísticas y salida estable.
- Flujo corto y guiado
  - La app evita convertirse en un editor completo. Ofrece formatos útiles y una secuencia rápida para terminar la tarea.
- Almacenamiento efímero
  - Los PDFs generados se guardan en disco local y se limpian con una tarea en background. Esto mantiene simple el MVP y evita almacenar material de aula a largo plazo.
- Compartido mobile-first
  - La interfaz prioriza "abrir con", descargar e imprimir desde apps nativas antes que una gestión de archivos estilo escritorio.

**API**

- `GET /health` -> `{ ok: true }`
- `POST /generar-pdf` -> `{ pdf_url, pdf_path, filename, download_url }`
- `POST /generar-comunicado` -> `{ pdf_url, preview_url, pdf_path, filename, download_url }`
- `GET /download/{filename}` -> PDF como respuesta de descarga

**Setup local**

Requisitos:

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

Crear `.env.development` en la raíz cuando sea necesario:

```env
VITE_API_URL=http://localhost:8000
```

Para probar desde un celular en la misma red Wi-Fi, apuntar `VITE_API_URL` a la IP local de la computadora, por ejemplo:

```env
VITE_API_URL=http://192.168.1.10:8000
```

**Scripts**

- `npm run dev` — inicia el servidor de desarrollo de Vite.
- `npm run build` — genera el build del frontend.
- `npm run preview` — previsualiza el build de producción.
- `npm run lint` — ejecuta ESLint.

**Estructura del proyecto**

```text
src/
  components/ui/          controles reutilizables de UI
  helpers/                helpers de API, descarga y compartir
  hooks/                  contexto de imagen, filtros y generación de PDF
  pages/                  subida, layouts, edición y previsualización de PDF
backend/
  main.py                 app FastAPI y endpoints
  utils/pdf_creator.py    generación de grilla A4 en PDF
public/
  manifest.webmanifest    metadata PWA
  icons/                  íconos de app instalable
```

**Notas de despliegue**

- El frontend puede desplegarse en Vercel. `vercel.json` ya incluye fallback para SPA.
- En el despliegue del frontend, definir `VITE_API_URL` con la URL pública del backend.
- El backend puede correr con Uvicorn detrás de un reverse proxy como Caddy o Nginx.
- Los PDFs generados viven en `backend/uploads/pdfs/`; si hay múltiples instancias, hace falta storage compartido o enrutamiento sticky.
- CORS permite el frontend desplegado y el origen local de desarrollo. Agregar nuevos dominios en `backend/main.py`.

**Limitaciones conocidas**

- Los PDFs generados son temporales y locales a la instancia del backend.
- Un backend con múltiples instancias necesita storage compartido o sticky routing.
- El soporte de Web Share API varía según navegador; la app usa descarga/apertura como fallback.
- Los layouts actuales son fijos y cubren los formatos de impresión más comunes para aula.

**Roadmap**

- Filas, columnas, márgenes y marcas de corte personalizables.
- Lotes multipágina.
- Controles de zoom/rotación por celda.
- Revisión fuerte de accesibilidad.
- Docker y CI.
- Tests automáticos para cálculo de layouts y flujos móviles principales.
