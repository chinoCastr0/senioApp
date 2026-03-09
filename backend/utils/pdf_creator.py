
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image
import base64

def create_photocopy_grid_pdf(image_base64: str, layout_data: dict) -> BytesIO:
    try:
        # Tamaño A4 en puntos
        page_width, page_height = A4

        # Margen
        margin_mm = 5
        margin = margin_mm * 72 / 25.4  # convierte a puntos

        # Dimensiones desde el layout
        try:
            alto_mm = float(layout_data["altoMm"])
            ancho_mm = float(layout_data["anchoMm"])
            cantidad = int(layout_data["cantidad"])
        except (KeyError, TypeError, ValueError):
            raise ValueError("Datos de layout inválidos.")

        # Decodificar imagen base64
        base64_data = image_base64.split(",")[1] if "," in image_base64 else image_base64
        image_bytes = base64.b64decode(base64_data)
        original_image = Image.open(BytesIO(image_bytes)).convert("RGB")
        # Girar la imagen si el width < height 
   #     if original_image.height < original_image.width:
    #        original_image = original_image.rotate(90, expand=True)
        # Crear PDF
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)

        # Calcular filas y columnas
        if cantidad == 1:
            grid_rows, grid_cols = 1, 1
        if cantidad == 2 and original_image.height < original_image.width:
                grid_rows, grid_cols = 2, 1
        elif cantidad == 2 :
                grid_rows, grid_cols = 1, 2
        if cantidad == 3 and original_image.height < original_image.width:
            grid_rows, grid_cols = 3, 1
        elif cantidad == 3:
            grid_rows, grid_cols = 1, 3
        if cantidad == 4 and original_image.height < original_image.width:
            original_image = original_image.rotate(90, expand=True)
            grid_rows, grid_cols = 2, 2
        elif cantidad == 4:
            grid_rows, grid_cols = 2, 2
        if cantidad == 6 and original_image.height < original_image.width:
            grid_rows, grid_cols = 2, 3
            original_image = original_image.rotate(90, expand=True)
        elif cantidad == 6:
            grid_rows, grid_cols = 3, 2
        if cantidad == 8 and original_image.height < original_image.width:
            grid_rows, grid_cols = 4, 2
           # original_image = original_image.rotate(90, expand=True)
        elif cantidad == 8:
            grid_rows, grid_cols = 2, 4

        usable_width = page_width - 2 * margin
        usable_height = page_height - 2 * margin

        cell_width = usable_width / grid_cols
        cell_height = usable_height / grid_rows

        # Validación de tamaño
        dpi = 300
        resized_width_px = int(cell_width * dpi / 72)
        resized_height_px = int(cell_height * dpi / 72)
        if resized_width_px <= 0 or resized_height_px <= 0:
            raise ValueError("Tamaño de celda inválido. Probá con menos copias por hoja.")

        resized_image = original_image.resize((resized_width_px, resized_height_px), Image.LANCZOS)

        # Dibujar imágenes y bordes
        for row in range(grid_rows):
            for col in range(grid_cols):
                x = margin + col * cell_width
                y = page_height - margin - (row + 1) * cell_height
                img_reader = ImageReader(resized_image)

                c.drawImage(img_reader, x, y, width=cell_width, height=cell_height)
                c.setLineWidth(1)
                c.rect(x, y, cell_width, cell_height)  # borde
        
        


        c.showPage()
        c.save()
        buffer.seek(0)
        return buffer

    except Exception as e:
        print(f"[ERROR] Falló la creación del PDF: {e}")
        raise
