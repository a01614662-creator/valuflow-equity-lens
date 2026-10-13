// SVG → PNG en el navegador (canvas a escala 2x). Lo usan el PDF, el Excel, el ZIP y los botones de descarga.
export interface Png { dataUrl: string; w: number; h: number }

export function svgToPng(svg: string, w: number, h: number, scale = 2): Promise<Png> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
        const g = c.getContext('2d')!; g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        resolve({ dataUrl: c.toDataURL('image/png'), w: c.width, h: c.height });
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error('No se pudo dibujar la gráfica'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/** Tamaño natural de un SVG (atributos width/height o viewBox). */
export function svgSize(svg: string): { w: number; h: number } {
  const vb = svg.match(/viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"/);
  if (vb) return { w: +vb[1], h: +vb[2] };
  const w = svg.match(/width="([\d.]+)/), h = svg.match(/height="([\d.]+)/);
  return { w: w ? +w[1] : 300, h: h ? +h[1] : 150 };
}

export const dataUrlToBytes = (u: string) => { const b = atob(u.split(',')[1]); const a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
