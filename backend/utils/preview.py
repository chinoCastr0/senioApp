# backend/utils/preview.py
import os
from typing import Optional
from pdf2image import convert_from_path
from PIL import Image

def crear_preview_pdf(
    pdf_path: str,
    out_dir: str = "uploads",
    dpi: int = 150,
    max_w: Optional[int] = 1200,
    jpeg_quality: int = 85,
) -> str:
    """
    Convierte la PRIMERA página del PDF en una imagen JPG liviana para preview.
    Devuelve la ruta relativa servible: p.ej. '/uploads/archivo_preview.jpg'
    """
    os.makedirs(out_dir, exist_ok=True)

    # Si Poppler está en PATH, no hace falta 'poppler_path'
    pages = convert_from_path(
        pdf_path,
        dpi=dpi,
        first_page=1,
        last_page=1,
        fmt="jpeg",
    )
    img: Image.Image = pages[0]

    # Redimensionar para mobile (ancho máximo)
    if max_w and img.width > max_w:
        r = max_w / img.width
        new_size = (int(img.width * r), int(img.height * r))
        img = img.resize(new_size, Image.LANCZOS)

    base = os.path.splitext(os.path.basename(pdf_path))[0]
    out_name = f"{base}_preview.jpg"
    out_path = os.path.join(out_dir, out_name)

    # Guardar JPG optimizado
    img.save(out_path, "JPEG", quality=jpeg_quality, optimize=True)

    # Devolver ruta relativa para servir por FastAPI StaticFiles
    return f"/uploads/{out_name}"
