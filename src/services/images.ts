// Gráficas del reporte a PNG (para el libro de Excel y el ZIP). Usa el mismo catálogo que el PDF.
import { chartCatalog } from '../report/charts';
import type { Snapshot } from '../report/snapshot';
import { svgToPng } from './raster';

export interface ChartImage { id: string; title: string; base64: string; w: number; h: number; svg: string }

export async function chartImages(S: Snapshot, onProgress?: (p: number, msg: string) => void): Promise<Record<string, ChartImage>> {
  const C = chartCatalog(S), out: Record<string, ChartImage> = {}, ids = Object.keys(C);
  for (let i = 0; i < ids.length; i++) {
    const c = C[ids[i]]; onProgress?.(i / ids.length, 'Gráfica ' + (i + 1) + ' de ' + ids.length);
    const p = await svgToPng(c.svg.svg, c.svg.w, c.svg.h, 2);
    out[c.id] = { id: c.id, title: c.title, base64: p.dataUrl.split(',')[1], w: c.svg.w, h: c.svg.h, svg: c.svg.svg };
  }
  return out;
}
