export function aplicarFiltroCanvas(base64, filtro) {
  return new Promise((resolve) => {
    if (!base64 || filtro === 'ninguno') {
      return resolve(base64); // 👈 no reproceses
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      switch (filtro) {
        case 'grises':
          ctx.filter = 'grayscale(100%)';
          break;
        case 'blancoNegro':
          ctx.filter = 'grayscale(100%) contrast(200%)';
          break;
        default:
          ctx.filter = 'none';
      }

      ctx.drawImage(img, 0, 0);
      const nuevoBase64 = canvas.toDataURL('image/jpeg', 1.0);
      resolve(nuevoBase64);
    };
    img.src = base64;
  });
}
