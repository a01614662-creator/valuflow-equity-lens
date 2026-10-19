// Exportación de la valuación: PDF ejecutivo, PDF técnico, Excel con fórmulas, CSV, JSON reabrible y ZIP.
// Todo se genera en el navegador con librerías empaquetadas (jsPDF, ExcelJS, JSZip, SheetJS): nada depende de una CDN,
// de window.print ni de internet. Cada archivo sale de la misma instantánea de cálculo (supuestos activos).
import JSZip from 'jszip';
import type { Dataset, RunOk } from '../engine/types';
import { buildReport, reportTables, type Report } from '../report/content';
import type { Snapshot } from '../report/snapshot';
import { buildPdf } from './pdf';
import { buildXlsx, tableCsv } from './xlsx';
import { chartImages, type ChartImage } from './images';

export type Progress = (p: number, msg: string) => void;
export interface FileOut { name: string; blob: Blob; bytes: Uint8Array; text?: string; pages?: number }
export interface SaveResult { ok: boolean; method: string; message: string; name: string }

const MIME = { pdf: 'application/pdf', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv;charset=utf-8', json: 'application/json', zip: 'application/zip' };
const pad = (n: number) => String(n).padStart(2, '0');
const stamp = (d: Date) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
/** Nombre de archivo: ValuFlow_Soriana_<tipo>[_Escenario_modificado]_AAAA-MM-DD. */
export const fileBase = (S: Snapshot, kind: string) => 'ValuFlow_' + (S.ds.profile.short || S.ds.profile.name).replace(/[^A-Za-z0-9]+/g, '_') + '_' + kind + (S.isBase ? '' : '_Escenario_modificado') + '_' + stamp(S.generatedAt);
const out = (name: string, bytes: Uint8Array, type: string, extra: Partial<FileOut> = {}): FileOut => ({ name, bytes, blob: new Blob([bytes as BlobPart], { type }), ...extra });
const enc = (s: string) => new TextEncoder().encode(s);

// ---------------------------------------------------------------- generadores (sin efectos en la página; se pueden probar)
export async function makePdf(S: Snapshot, kind: 'exec' | 'full', onProgress?: Progress): Promise<FileOut> {
  const R = buildReport(S, kind), r = await buildPdf(R, onProgress);
  return out(fileBase(S, kind === 'exec' ? 'Resumen_ejecutivo' : 'Reporte_tecnico') + '.pdf', r.bytes, MIME.pdf, { pages: r.pages });
}

export async function makeXlsx(S: Snapshot, onProgress?: Progress, images?: Record<string, ChartImage>): Promise<FileOut> {
  const im = images ?? await chartImages(S, (p, m) => onProgress?.(p * 0.6, m));
  onProgress?.(0.7, 'Escribiendo el libro de Excel');
  const bytes = await buildXlsx(buildReport(S, 'full'), im);
  return out(fileBase(S, 'Modelo') + '.xlsx', bytes, MIME.xlsx);
}

/** CSV único con todas las tablas del reporte en formato largo (tabla, concepto, columna, valor). UTF-8 con BOM. */
export function csvAll(R: Report): string {
  const q = (s: string) => /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  const m = R.meta, lines: string[][] = [
    ['# ValuFlow', m.company + ' · ' + m.subtitle.replace('Reporte técnico completo', 'datos del reporte técnico'), '', '', ''],
    ['# Escenario', m.caseLabel, '', '', ''], ['# Equipo', m.team.map(t => t[0] + ' (' + t[1] + ')').join('; '), '', '', ''], ['# Generado', m.generatedIso, '', '', ''],
    ['tabla', 'titulo', 'concepto', 'columna', 'valor']
  ];
  reportTables(R).forEach(t => t.rows.forEach(r => r.slice(1).forEach((v, j) => lines.push(['Tabla ' + t.n, t.title, r[0], t.head[j + 1] || '', v]))));
  return '﻿' + lines.map(l => l.map(x => q(String(x ?? ''))).join(',')).join('\r\n') + '\r\n';
}
export function makeCsv(S: Snapshot): FileOut {
  const t = csvAll(buildReport(S, 'full'));
  return out(fileBase(S, 'Tablas') + '.csv', enc(t), MIME.csv, { text: t });
}

/** JSON reabrible en la app (Biblioteca → Importar dataset): dataset + supuestos activos + resultados para auditoría. */
export function valuationJson(S: Snapshot): string {
  const { b, rel, rec } = S, n = (p: unknown) => typeof p === 'number' && isFinite(p) ? +p.toFixed(6) : null;
  return JSON.stringify({
    format: 'valuflow/2', app: 'ValuFlow', exportedAt: S.generatedAt.toISOString(),
    case: { isBase: S.isBase, changes: S.changes },
    results: {
      price: b.price, dcf: n(b.value), upside: n(b.upside), wacc: n(b.wacc), ke: n(b.ke), g: n(b.g), ev: n(b.evW), equity: n(b.eqVal),
      comps: n(rel.comps?.value), transactionsSdc: n(rel.sdc?.value), combined: n(rel.combined?.value), recommendation: rec?.rating ?? null, potential: n(rec?.potential)
    },
    assumptions: S.A, dataset: S.ds
  }, null, 2);
}
export function makeJson(S: Snapshot): FileOut {
  const t = valuationJson(S);
  return out(fileBase(S, 'Valuacion') + '.valuflow.json', enc(t), MIME.json, { text: t });
}

/** Paquete completo: ambos PDF, Excel, CSV (uno general y uno por tabla), JSON, gráficas PNG/SVG y LEEME. */
export async function makeZip(S: Snapshot, onProgress?: Progress): Promise<FileOut> {
  const zip = new JSZip(), R = buildReport(S, 'full');
  onProgress?.(0.02, 'PDF · Resumen ejecutivo');
  const pe = await makePdf(S, 'exec', (p, m) => onProgress?.(0.02 + p * 0.18, 'Resumen ejecutivo: ' + m)); zip.file(pe.name, pe.bytes);
  const pf = await makePdf(S, 'full', (p, m) => onProgress?.(0.2 + p * 0.3, 'Reporte técnico: ' + m)); zip.file(pf.name, pf.bytes);
  const images = await chartImages(S, (p, m) => onProgress?.(0.5 + p * 0.15, m));
  onProgress?.(0.68, 'Libro de Excel');
  const x = await makeXlsx(S, undefined, images); zip.file(x.name, x.bytes);
  onProgress?.(0.8, 'CSV y JSON');
  const c = makeCsv(S), j = makeJson(S);
  zip.file(c.name, c.bytes); zip.file(j.name, j.bytes);
  reportTables(R).forEach(t => zip.file('csv/Tabla_' + String(t.n).padStart(2, '0') + '_' + t.id + '.csv', tableCsv(t)));
  Object.values(images).forEach(im => { zip.file('graficas/png/' + im.id + '.png', im.base64, { base64: true }); zip.file('graficas/svg/' + im.id + '.svg', im.svg); });
  const m = R.meta;
  zip.file('LEEME.txt', [
    'ValuFlow · ' + m.title, m.institution + ' · ' + m.course + ' · ' + m.year, '',
    'Equipo:', ...m.team.map(t => '- ' + t[0] + ' (' + t[1] + ')'), '',
    'Escenario: ' + m.caseLabel + (m.modified ? '\r\nSupuestos modificados: ' + m.changes.map(ch => ch[0] + ' ' + ch[1] + ' -> ' + ch[2]).join('; ') : ''),
    'Precio de mercado: cierre ' + m.priceDate + ' · fecha de valuación ' + m.valuationDate + ' · generado ' + m.generated, '',
    'Contenido:',
    '- ' + pe.name + ' (resumen ejecutivo, ' + pe.pages + ' páginas)',
    '- ' + pf.name + ' (reporte técnico completo, ' + pf.pages + ' páginas)',
    '- ' + x.name + ' (libro con fórmulas: Supuestos, WACC, FCFF y valuación, Transacciones SDC, Combinada; más las tablas del reporte)',
    '- ' + c.name + ' (todas las tablas en formato largo, UTF-8 con BOM)',
    '- csv/ (una tabla por archivo, numeradas como en el reporte técnico)',
    '- ' + j.name + ' (dataset y supuestos; se reabre en ValuFlow desde Biblioteca > Importar dataset)',
    '- graficas/png y graficas/svg', '',
    'Todas las cifras salen del motor ValuFlow con el dataset generado desde el Excel PRO auditado.'
  ].join('\r\n') + '\r\n');
  onProgress?.(0.9, 'Comprimiendo');
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  return out(fileBase(S, 'Paquete') + '.zip', bytes, MIME.zip);
}

// ---------------------------------------------------------------- descarga a prueba de bloqueos
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
function openTab(blob: Blob) {
  const url = URL.createObjectURL(blob), w = window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 120000);
  if (!w) throw new Error('el bloqueador de ventanas impidió abrir una pestaña nueva');
}

/** Descarga directa; dentro de una vista incrustada (iframe) agrega un panel con alternativas por si el sitio la bloquea. */
export async function saveFile(f: FileOut): Promise<SaveResult> {
  try { anchorDownload(f.name, f.blob); } catch (e) { fallbackPanel(f, 'La descarga directa falló: ' + (e as Error).message + '.'); return { ok: false, method: 'panel', message: 'La descarga fue bloqueada; usa el panel de alternativas.', name: f.name }; }
  if (inIframe()) fallbackPanel(f, 'La app está dentro de una vista incrustada que puede bloquear descargas sin avisar. Si el archivo no apareció, usa una alternativa.');
  return { ok: true, method: 'descarga', message: f.name, name: f.name };
}

export function fallbackPanel(f: FileOut, why: string) {
  document.getElementById('vf-export-panel')?.remove();
  const bd = document.createElement('div'); bd.id = 'vf-export-panel'; bd.setAttribute('data-noprint', '');
  bd.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;background:color-mix(in srgb, var(--color-text) 35%, transparent);';
  const d = document.createElement('div'); d.className = 'blueprint';
  d.style.cssText = 'width:min(560px,100%);max-height:90vh;overflow:auto;background:var(--color-bg);border:1px solid var(--color-divider);padding:24px;display:flex;flex-direction:column;gap:12px;font-family:var(--font-body);color:var(--color-text);';
  d.innerHTML = '<h3 style="margin:0;font-family:var(--font-heading);font-size:22px;font-weight:600;"></h3><p data-why style="margin:0;font-size:14px;line-height:1.5;"></p><div data-acts style="display:flex;flex-direction:column;gap:8px;"></div><div data-msg role="status" style="font-size:13px;min-height:18px;color:var(--pos);"></div><button data-close class="btn btn-ghost" style="align-self:flex-end;">Cerrar</button>';
  d.querySelector('h3')!.textContent = f.name; (d.querySelector('[data-why]') as HTMLElement).textContent = why;
  const msg = d.querySelector('[data-msg]') as HTMLElement, acts = d.querySelector('[data-acts]')!;
  const act = (label: string, run: () => Promise<string> | string) => { const b = document.createElement('button'); b.className = 'btn btn-secondary'; b.style.cssText = 'justify-content:flex-start;width:100%;'; b.textContent = label; b.onclick = async () => { try { msg.style.color = 'var(--pos)'; msg.textContent = await run(); } catch (e) { msg.style.color = 'var(--neg)'; msg.textContent = 'No se pudo: ' + (e as Error).message; } }; acts.appendChild(b); };
  act('Descargar de nuevo', () => { anchorDownload(f.name, f.blob); return 'Descarga solicitada.'; });
  act('Abrir en pestaña nueva', () => { openTab(f.blob); return 'Abierto: usa Guardar como (Ctrl/⌘ + S).'; });
  if (f.text != null) act('Copiar el contenido al portapapeles', async () => (await copyText(f.text!)) ? 'Copiado.' : 'El navegador no permitió copiar.');
  act('Abrir la app en su propia pestaña', () => { const w = window.open(location.href, '_blank'); if (!w) throw new Error('bloqueador de ventanas'); return 'Abierta: exporta desde esa pestaña.'; });
  const close = () => bd.remove(); (d.querySelector('[data-close]') as HTMLElement).onclick = close; bd.onclick = e => { if (e.target === bd) close(); };
  bd.appendChild(d); document.body.appendChild(bd);
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
