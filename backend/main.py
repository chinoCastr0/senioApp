# main.py
import os
import uuid
import base64
import time
import asyncio
from io import BytesIO
from pathlib import Path
from math import floor

from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from utils.pdf_creator import create_photocopy_grid_pdf

# --- Imports para generar comunicado ---
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import Paragraph, Frame, KeepInFrame

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en prod, limitar a dominios propios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Storage ---
BASE_UPLOAD_DIR = Path("uploads")
PDFS_DIR = BASE_UPLOAD_DIR / "pdfs"
PDFS_DIR.mkdir(parents=True, exist_ok=True)

# Montar /uploads para servir estáticos (lo usa el visor PDF del front)
app.mount("/uploads", StaticFiles(directory=str(BASE_UPLOAD_DIR)), name="uploads")

# --- Config de limpieza ---
RETENTION_SECONDS = 1800  # 30 minutos

@app.get("/health", include_in_schema=False)
def health():
    return {"ok": True}
# ======================================
# Generar PDF de grilla de imágenes
# ======================================
@app.post("/generar-pdf")
async def generar_pdf(
    request: Request,
    file: UploadFile = File(...),
    altoMm: float = Form(...),
    anchoMm: float = Form(...),
    cantidad: int = Form(...),
):
    image_bytes = await file.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    image_data_url = f"data:{file.content_type};base64,{image_base64}"

    layout_data = {"altoMm": altoMm, "anchoMm": anchoMm, "cantidad": cantidad}

    pdf_buffer: BytesIO = create_photocopy_grid_pdf(image_data_url, layout_data)

    filename = f"grilla_{uuid.uuid4().hex}.pdf"
    disk_path = PDFS_DIR / filename
    with open(disk_path, "wb") as f:
        f.write(pdf_buffer.getvalue())

    base = str(request.base_url).rstrip("/")
    pdf_path = f"/uploads/pdfs/{filename}"
    pdf_url = f"{base}{pdf_path}"
    download_url = f"{base}/download/{filename}"

    return JSONResponse({
        "pdf_url": pdf_url,
        "pdf_path": pdf_path,
        "filename": filename,
        "download_url": download_url
    })


# ======================================
# Generar comunicado en 2 columnas
# ======================================
@app.post("/generar-comunicado")
async def generar_comunicado(
    request: Request,
    texto: str = Form(...)
):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)

    doc_width, doc_height = A4
    margen = 36
    separacion_col = 1

    ancho_col = (doc_width - 2 * margen - separacion_col) / 2
    alto_util = doc_height - 2 * margen

    estilo = ParagraphStyle(
        name="Comunicado",
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        alignment=TA_LEFT,
        textColor=colors.black,
    )

    texto_html = (texto or "").replace("\n", "<br/>")

    # medir alto del párrafo para saber cuántas filas entran
    parrafo_medicion = Paragraph(texto_html, estilo)
    _, alto_medida = parrafo_medicion.wrap(ancho_col, alto_util)
    altura_bloque = max(20, alto_medida + 6)

    filas = max(1, floor(alto_util / altura_bloque))

    for i in range(filas):
        for j in range(2):
            x = margen + j * (ancho_col + separacion_col)
            y_top = doc_height - margen - i * altura_bloque

            frame = Frame(
                x,
                y_top - altura_bloque,  # origen abajo
                ancho_col,
                altura_bloque,
                showBoundary=1          # guía de recorte
            )
            contenido = KeepInFrame(
                ancho_col,
                altura_bloque,
                [Paragraph(texto_html, estilo)],
                mode="shrink",
            )
            frame.addFromList([contenido], c)

    c.showPage()
    c.save()
    buffer.seek(0)
    pdf_bytes = buffer.read()

    filename = f"comunicado_{uuid.uuid4().hex}.pdf"
    disk_path = PDFS_DIR / filename
    with open(disk_path, "wb") as f:
        f.write(pdf_bytes)

    base = str(request.base_url).rstrip("/")
    pdf_path = f"/uploads/pdfs/{filename}"
    pdf_url = f"{base}{pdf_path}"
    download_url = f"{base}/download/{filename}"

    return JSONResponse({
        "pdf_url": pdf_url,         # para preview (PdfPreview)
        "preview_url": pdf_url,     # compat
        "pdf_path": pdf_path,
        "filename": filename,
        "download_url": download_url  # para forzar descarga
    })


# ======================================
# Forzar descarga en dispositivo (evita visor/Drive)
# ======================================
@app.get("/download/{filename}")
async def download_pdf(filename: str):
    path = PDFS_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    def iterfile():
        with open(path, "rb") as f:
            while True:
                chunk = f.read(1024 * 64)
                if not chunk:
                    break
                yield chunk

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        # ⬇️ Exponer Content-Disposition para que el front pueda leer el nombre
        "Access-Control-Expose-Headers": "Content-Disposition",
    }
    # octet-stream para que Android no lo abra, sino lo descargue
    return StreamingResponse(iterfile(), media_type="application/octet-stream", headers=headers)


# ======================================
# Limpieza de PDFs viejos
# ======================================
async def _sweeper_loop():
    while True:
        now = time.time()
        try:
            for p in PDFS_DIR.iterdir():
                if p.is_file():
                    try:
                        age = now - p.stat().st_mtime
                        if age > RETENTION_SECONDS:
                            p.unlink(missing_ok=True)
                            print(f"[SWEEP] Borrado: {p.name}")
                    except Exception as e:
                        print(f"[SWEEP WARN] {p.name}: {e}")
        except Exception as e:
            print(f"[SWEEP FATAL] {e}")
        await asyncio.sleep(300)  # cada 5 minutos


@app.on_event("startup")
async def _startup():
    asyncio.create_task(_sweeper_loop())


@app.get("/")
async def root():
    return {"ok": True}
