import os
import uuid
from pdf2image import convert_from_bytes

def convertir_pdf_a_imagen(pdf_bytes: bytes, nombre_base: str = "preview") -> str:
    """
    Convierte un PDF en memoria a una imagen JPEG (solo la primera página).
    Guarda la imagen en la carpeta /uploads y devuelve la ruta relativa al archivo generado.

    Args:
        pdf_bytes (bytes): El contenido del PDF en bytes.
        nombre_base (str): Prefijo opcional para el nombre del archivo generado.

    Returns:
        str: Ruta del archivo .jpg generado.
    """
    os.makedirs("uploads", exist_ok=True)
    unique_id = str(uuid.uuid4())
    output_path = f"uploads/{nombre_base}_{unique_id}.jpg"

    images = convert_from_bytes(pdf_bytes, first_page=1, last_page=1, dpi=150)
    images[0].save(output_path, "JPEG")

    return output_path