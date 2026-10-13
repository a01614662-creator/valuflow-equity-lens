// Descargas a prueba de bloqueos y exportación del estudio (PDF, Excel, CSV, ZIP, JSON y gráficas).
// Todas las librerías van empaquetadas (jsPDF, ExcelJS, JSZip, SheetJS): nada depende de una CDN ni de internet.
import * as XLSXlib from 'xlsx';
import JSZip from 'jszip';
import type { Assumptions, Dataset, RunOk } from '../engine/types';
import { AUTHOR, APP_VERSION } from '../config';
import type { Report, RTable } from '../report/content';
import { numberBlocks } from '../report/content';
import { chartCatalog } from '../report/charts';
import { buildPdf, type PdfVariant } from './pdf';
import { buildXlsx, tableCsv, type ChartImage } from './xlsx';
import { svgToPng } from './raster';

/** Lector de hojas de cálculo para el importador (paquete npm incluido en la app). */
export const getXLSX = (): any => XLSXlib;

export type Progress = (p: number, msg: string) => void;
export interface SaveResult { ok: boolean; method: string; message: string; name: string }

const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const fileBase = (ds: Dataset, extra = '') => 'ValuFlow_' + (ds.profile.short || ds.profile.name).replace(/[^A-Za-z0-9]+/g, '_') + '_' + AUTHOR.fileTag + (extra ? '_' + extra : '') + '_' + today();

const inIframe = () => { try { return window.self !== window.top; } catch { return true; } };

function legacyCopy(t: string) {
  const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
  document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* sin permiso */ } ta.remove(); return ok;
}
async function copyText(t: string): Promise<boolean> {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(t); return true; } } catch { /* sigue */ }
  return legacyCopy(t);
}
function anchorDownload(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener'; a.style.display = 'none';
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 8000);
}
async function pickerSave(name: string, blob: Blob) {
  const w = window as unknown as { showSaveFilePicker?: (o: unknown) => Promise<{ createWritable: () => Promise<{ write: (b: Blob) => Promise<void>; close: () => Promise<void> }> }> };
  if (!w.showSaveFilePicker) throw new Error('el navegador no permite elegir dónde guardar');
  const ext = name.split('.').pop() as string;
  const h = await w.showSaveFilePicker({ suggestedName: name, types: [{ description: ext.toUpperCase(), accept: { [blob.type || 'application/octet-stream']: ['.' + ext] } }] });
  const s = await h.createWritable(); await s.write(blob); await s.close();
}
function openTab(blob: Blob) {
  const url = URL.createObjectURL(blob), w = window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 120000);
  if (!w) throw new Error('el bloqueador de ventanas impidió abrir una pestaña nueva');
}

/**
 * Cadena de intentos: <a download> con blob → selector de archivo (File System Access) → abrir el blob en una
 * pestaña nueva → copiar al portapapeles (formatos de texto). Si todo falla, panel con alternativas y la razón.
 */
export async function saveFile(name: string, blob: Blob, text?: string): Promise<SaveResult> {
  const errors: string[] = [];
  const sandboxed = inIframe();
  if (!sandboxed) {
    try { anchorDownload(name, blob); return { ok: true, method: 'descarga', message: 'Archivo descargado: ' + name, name }; } catch (e) { errors.push('descarga directa: ' + (e as Error).message); }
  } else {
    // En una vista incrustada (iframe) la descarga directa suele bloquearse sin aviso: se intenta y se ofrecen alternativas.
    try { anchorDownload(name, blob); } catch (e) { errors.push('descarga directa: ' + (e as Error).message); }
  }
  try { await pickerSave(name, blob); return { ok: true, method: 'guardar como', message: 'Archivo guardado: ' + name, name }; } catch (e) { if ((e as Error).name === 'AbortError') return { ok: false, method: 'cancelado', message: 'Guardado cancelado.', name }; errors.push('guardar como: ' + (e as Error).message); }
  try { openTab(blob); return { ok: true, method: 'pestaña', message: name + ' se abrió en una pestaña nueva: usa Guardar como (Ctrl/⌘ + S).', name }; } catch (e) { errors.push('pestaña nueva: ' + (e as Error).message); }
  if (text != null && await copyText(text)) return { ok: true, method: 'portapapeles', message: 'No se pudo descargar; el contenido de ' + name + ' se copió al portapapeles.', name };
  fallbackPanel(name, blob, text, (sandboxed ? 'La app está dentro de una vista incrustada (iframe o sandbox) que bloquea descargas. ' : '') + 'Intentos fallidos: ' + errors.join('; ') + '.');
  return { ok: false, method: 'panel', message: 'La descarga fue bloqueada; se abrió el panel de alternativas.', name };
}

/** Panel de último recurso con botones (cada clic es un gesto nuevo del usuario, que los navegadores sí permiten). */
export function fallbackPanel(name: string, blob: Blob, text: string | undefined, why: string) {
  const old = document.getElementById('vf-export-panel'); if (old) old.remove();
  const bd = document.createElement('div'); bd.id = 'vf-export-panel'; bd.setAttribute('data-noprint', '');
  bd.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;background:rgba(29,31,32,.35);';
  const d = document.createElement('div');
  d.style.cssText = 'width:min(560px,100%);max-height:90vh;overflow:auto;background:var(--color-bg,#f2f2f3);border:1px solid #ccc;padding:24px;display:flex;flex-direction:column;gap:12px;font-family:var(--font-body,sans-serif);color:var(--color-text,#1d1f20);';
  d.innerHTML = '<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#00276f;">Descarga bloqueada</div><h3 style="margin:0;font-size:22px;"></h3><p data-why style="margin:0;font-size:13px;line-height:1.5;"></p><div data-acts style="display:flex;flex-direction:column;gap:8px;"></div><div data-msg style="font-size:13px;min-height:18px;color:#16794a;"></div><button data-close class="btn btn-ghost" style="align-self:flex-end;">Cerrar</button>';
  d.querySelector('h3')!.textContent = name; (d.querySelector('[data-why]') as HTMLElement).textContent = why;
  const msg = d.querySelector('[data-msg]') as HTMLElement, acts = d.querySelector('[data-acts]')!;
  const act = (label: string, run: () => Promise<string> | string) => { const b = document.createElement('button'); b.className = 'btn btn-secondary'; b.style.cssText = 'justify-content:flex-start;width:100%;'; b.textContent = label; b.onclick = async () => { try { msg.style.color = '#16794a'; msg.textContent = await run(); } catch (e) { msg.style.color = '#b42318'; msg.textContent = 'No se pudo: ' + (e as Error).message; } }; acts.appendChild(b); };
  act('Descargar de nuevo', () => { anchorDownload(name, blob); return 'Descarga solicitada.'; });
  act('Elegir dónde guardar', async () => { await pickerSave(name, blob); return 'Guardado.'; });
  act('Abrir en pestaña nueva', () => { openTab(blob); return 'Abierto: usa Guardar como (Ctrl/⌘ + S).'; });
  if (text != null) act('Copiar el contenido al portapapeles', async () => (await copyText(text)) ? 'Copiado.' : 'El navegador no permitió copiar.');
  act('Abrir la app en su propia pestaña', () => { const w = window.open(location.href, '_blank'); if (!w) throw new Error('bloqueador de ventanas'); return 'Abierta: exporta desde esa pestaña.'; });
  const close = () => bd.remove(); (d.querySelector('[data-close]') as HTMLElement).onclick = close; bd.onclick = e => { if (e.target === bd) close(); };
  bd.appendChild(d); document.body.appendChild(bd);
}

// ---------------------------------------------------------------- generadores
const PDF = 'application/pdf', XLSX_T = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function makePdf(R: Report, variant: PdfVariant, onProgress?: Progress) {
  const r = await buildPdf(R, variant, onProgress);
  return { ...r, name: fileBase(R.bundle.ds, variant === 'exec' ? 'Resumen_ejecutivo' : '') + '.pdf', blob: new Blob([r.bytes as BlobPart], { type: PDF }) };
}

export async function chartImages(R: Report, onProgress?: Progress, from = 0, to = 1): Promise<Record<string, ChartImage>> {
  const C = chartCatalog(R.bundle), out: Record<string, ChartImage> = {}, ids = Object.keys(C);
  for (let i = 0; i < ids.length; i++) {
    const c = C[ids[i]]; onProgress?.(from + (to - from) * i / ids.length, 'Gráfica ' + (i + 1) + ' de ' + ids.length);
    const p = await svgToPng(c.svg.svg, c.svg.w, c.svg.h, 2); out[c.id] = { id: c.id, title: c.title, base64: p.dataUrl.split(',')[1], w: c.svg.w, h: c.svg.h };
  }
  return out;
}

export async function makeXlsx(R: Report, onProgress?: Progress, images?: Record<string, ChartImage>) {
  numberBlocks(R.sections);
  const im = images ?? await chartImages(R, onProgress, 0, 0.7);
  onProgress?.(0.8, 'Escribiendo el libro de Excel');
  const bytes = await buildXlsx(R, im);
  return { bytes, name: fileBase(R.bundle.ds) + '.xlsx', blob: new Blob([bytes as BlobPart], { type: XLSX_T }) };
}

export function datasetJson(ds: Dataset, A: Assumptions) {
  return JSON.stringify({ format: 'valuflow/2', version: APP_VERSION, exportedAt: new Date().toISOString(), author: { name: AUTHOR.name, id: AUTHOR.id }, dataset: ds, assumptions: A }, null, 2);
}

export const tableSlug = (t: RTable) => String(t.n ?? '').padStart(2, '0') + '_' + t.id;
export function reportTables(R: Report): RTable[] { numberBlocks(R.sections); return R.sections.flatMap(s => s.blocks.filter((b): b is RTable => b.kind === 'table')); }

/** Paquete completo: PDF, XLSX, CSV de cada tabla, JSON reabrible y las gráficas en PNG y SVG. */
export async function makeZip(R: Report, onProgress?: Progress) {
  const zip = new JSZip(), ds = R.bundle.ds;
  onProgress?.(0.02, 'Reporte completo (PDF)');
  const pdf = await makePdf(R, 'full', (p, m) => onProgress?.(0.02 + p * 0.4, m));
  zip.file(pdf.name, pdf.bytes);
  const images = await chartImages(R, (p, m) => onProgress?.(0.45 + p * 0.25, m));
  const x = await makeXlsx(R, undefined, images); zip.file(x.name, x.bytes);
  onProgress?.(0.8, 'Tablas CSV');
  reportTables(R).forEach(t => zip.file('csv/Tabla_' + tableSlug(t) + '.csv', tableCsv(t)));
  zip.file(fileBase(ds) + '.valuflow.json', datasetJson(ds, R.bundle.A));
  const C = chartCatalog(R.bundle);
  Object.values(C).forEach(c => { zip.file('graficas/svg/' + c.id + '.svg', c.svg.svg); zip.file('graficas/png/' + c.id + '.png', images[c.id].base64, { base64: true }); });
  zip.file('LEEME.txt', 'ValuFlow · Estudio individual de Soriana\r\n' + AUTHOR.name + ' · ' + AUTHOR.id + '\r\n' + AUTHOR.institution + ', ' + AUTHOR.campus + '\r\n\r\nContenido:\r\n- ' + pdf.name + ' (reporte completo)\r\n- ' + x.name + ' (libro con fórmulas vivas)\r\n- csv/ (una tabla por archivo, UTF-8 con BOM)\r\n- graficas/png y graficas/svg\r\n- ' + fileBase(ds) + '.valuflow.json (dataset y supuestos; se reabre en la app)\r\n');
  onProgress?.(0.9, 'Comprimiendo');
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  return { bytes, name: fileBase(ds) + '.zip', blob: new Blob([bytes as BlobPart], { type: 'application/zip' }) };
}

/** Contenido CSV de los datos financieros normalizados (lo usa el flujo de importación). */
export function csvContent(ds: Dataset, base: RunOk): string {
  const lines: unknown[][] = [['field', 'period', 'value', 'unit', 'type', 'source']];
  const u = ds.profile.currency + ' ' + (ds.profile.units || '');
  Object.entries(ds.forecast.base).forEach(([k, v]) => lines.push([k, ds.forecast.baseYear, v, u, 'Actual', ds.source.kind]));
  const R = base.rows as unknown as Record<string, number>[];
  base.rows.forEach((r, i) => ['revenue', 'ebit', 'nopat', 'da', 'capex', 'dNwc', 'fcf', 'pv'].forEach(k => lines.push([k, r.year, R[i][k].toFixed(4), u, 'Estimado', 'ValuFlow engine'])));
  return lines.map(l => l.map(x => '"' + String(x ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
}
