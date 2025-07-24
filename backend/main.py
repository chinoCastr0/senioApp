from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from utils.pdf_creator import create_photocopy_grid_pdf
import base64

app = FastAPI()

# Permitir conexión desde cualquier origen
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