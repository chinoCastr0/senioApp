from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from utils.pdf_creator import create_photocopy_grid_pdf
from utils.pdf_to_image import convertir_pdf_a_imagen

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Frame, KeepInFrame

from io import BytesIO
from math import floor
import base64
import os
import uuid

app = FastAPI()

# Servir archivos de /uploads (para la preview)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generar-pdf")
async def generar_pdf(
    file: UploadFile = File(...),
    altoMm: float = Form(...),
    anchoMm: float = Form(...),
    cantidad: int = Form(...)
):
    image_bytes = await file.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    image_base64 = f"data:{file.content_type};base64,{image_base64}"

    layout_data = {
        "altoMm": altoMm,
        "anchoMm": anchoMm,
        "cantidad": cantidad
    }

    pdf_buffer = create_photocopy_grid_pdf(image_base64, layout_data)

    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={
        "Content-Disposition": "inline; filename=grilla.pdf"
    })

#GENERA EL COMUNICADO DE SUBIDA

@app.get("/download/{file_id}") #para borrar el archivo dps de q lo genere
def download_pdf(file_id: str):
    file_path = f"uploads/{file_id}.pdf"
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}

    response = FileResponse(file_path, media_type="application/pdf")

    # Borrar el archivo después de servirlo
    @response.call_on_close
    def remove_file():
        os.remove(file_path)

    return response


@app.post("/generar-comunicado")
async def generar_comunicado_con_preview(
    request: Request,
    texto: str = Form(...)
):
    # Crear carpeta para PDFs
    os.makedirs("uploads/pdfs", exist_ok=True)

    # Generar PDF en memoria
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    doc_width, doc_height = A4
    margen = 36
    ancho_col = (doc_width - 2 * margen - 1) / 2
    alto_util = doc_height - 2 * margen

    estilo = ParagraphStyle(
        name="Comunicado",
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        alignment=TA_LEFT,
        textColor=colors.black,
    )

    texto_html = texto.replace("\n", "<br/>")
    parrafo = Paragraph(texto_html, estilo)
    _, alto_medida = parrafo.wrap(ancho_col, alto_util)
    altura_bloque = alto_medida + 6
    filas = max(1, floor(alto_util / altura_bloque))

    for i in range(filas):
        for j in range(2):
            x = margen + j * (ancho_col + 1)
            y = doc_height - margen - (i + 1) * altura_bloque
            frame = Frame(x, y, ancho_col, altura_bloque, showBoundary=1)
            contenido = KeepInFrame(ancho_col, altura_bloque, [Paragraph(texto_html, estilo)], mode='shrink')
            frame.addFromList([contenido], c)

    c.save()
    buffer.seek(0)
    pdf_bytes = buffer.read()

    # Guardar PDF en disco
    pdf_filename = f"comunicado_{uuid.uuid4()}.pdf"
    pdf_path = os.path.join("uploads", "pdfs", pdf_filename)
    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

    # Convertir PDF a imagen
    relative_img_path = convertir_pdf_a_imagen(pdf_bytes, nombre_base="comunicado")
    public_img_path = "/" + relative_img_path if relative_img_path.startswith("uploads/") else "/uploads/" + relative_img_path

    # URLs públicas
    pdf_url = str(request.base_url).rstrip("/") + f"/uploads/pdfs/{pdf_filename}"
    preview_url = str(request.base_url).rstrip("/") + public_img_path

    return JSONResponse({
        "pdf_url": pdf_url,
        "preview_url": preview_url
    })