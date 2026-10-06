// Exportación (Excel, CSV, JSON, PDF). Algunos sitios publicados bloquean descargas, así que
// siempre se ofrece un panel con alternativas (descargar de nuevo, copiar, abrir en pestaña nueva).
import { grid, validate } from '../engine';
import type { Assumptions, Dataset, RunOk } from '../engine/types';

// SheetJS se carga desde su CDN en index.html (window.XLSX).
export const getXLSX = (): any => (window as any).XLSX;

function legacyCopy(t: string) {
  const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
  document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* sin permiso */ } ta.remove(); return ok;
}
function copyText(t: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(() => true, () => legacyCopy(t));
  return Promise.resolve(legacyCopy(t));
}

interface PanelAction { label: string; run: () => unknown }

export function exportPanel(o: { title: string; note: string; actions: PanelAction[] }) {
  const old = document.getElementById('vf-export-panel'); if (old) old.remove();
  const bd = document.createElement('div'); bd.id = 'vf-export-panel'; bd.className = 'dialog-backdrop'; bd.setAttribute('data-noprint', '');
  bd.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;background:color-mix(in srgb, var(--color-text) 35%, transparent);';
  const d = document.createElement('div'); d.className = 'dialog blueprint';
  d.style.cssText = 'position:relative;width:min(560px,100%);max-height:90vh;overflow:auto;background:var(--color-bg);border:1px solid var(--color-divider);padding:28px;display:flex;flex-direction:column;gap:16px;font-family:var(--font-body);color:var(--color-text);';
  d.innerHTML = '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' +
    '<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);">Exportar</div>' +
    '<h3 style="margin:0;font-family:var(--font-heading);font-size:26px;font-weight:600;"></h3>' +
    '<p style="margin:0;font-size:14px;line-height:1.55;color:var(--color-neutral-700);"></p>' +
    '<div data-acts style="display:flex;flex-direction:column;gap:8px;"></div>' +
    '<div data-msg style="font-size:13px;min-height:18px;color:var(--pos);"></div>' +
    '<div style="display:flex;justify-content:flex-end;"><button class="btn btn-ghost" data-close>Cerrar</button></div>';
  d.querySelector('h3')!.textContent = o.title; d.querySelector('p')!.textContent = o.note;
  const acts = d.querySelector('[data-acts]')!, msg = d.querySelector('[data-msg]') as HTMLElement;
  o.actions.forEach((ac, i) => {
    const btn = document.createElement('button'); btn.className = 'btn ' + (i === 0 ? 'btn-primary blueprint' : 'btn-secondary');
    btn.style.cssText = 'justify-content:flex-start;text-align:left;position:relative;height:auto;min-height:44px;padding:10px 14px;white-space:normal;line-height:1.3;width:100%;';
    btn.innerHTML = (i === 0 ? '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' : '') + '<span style="flex:1;min-width:0;"></span>';
    btn.querySelector('span')!.textContent = ac.label;
    btn.onclick = async () => {
      msg.style.color = 'var(--pos)'; msg.textContent = '';
      try { const r = await ac.run(); if (r) msg.textContent = String(r); } catch (e) { msg.style.color = 'var(--neg)'; msg.textContent = 'No se pudo completar: ' + ((e as Error)?.message || e); }
    };
    acts.appendChild(btn);
  });
  const close = () => bd.remove();
  (d.querySelector('[data-close]') as HTMLElement).onclick = close; bd.onclick = e => { if (e.target === bd) close(); };
  bd.appendChild(d); document.body.appendChild(bd);
}

function tryDownload(name: string, blob: Blob) {
  try {
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
  } catch { /* bloqueado por el sitio */ }
}
function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob); const w = window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  if (!w) throw new Error('el navegador bloqueó la ventana nueva');
  return 'Abierto en una pestaña nueva. Usa Guardar como (Ctrl/⌘ + S).';
}

export function download(name: string, content: Blob | string, type: string | null, extra?: { copy?: string; copyLabel?: string; copyDone?: string; noOpen?: boolean }) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: type || 'application/octet-stream' });
  tryDownload(name, blob);
  const actions: PanelAction[] = [{ label: 'Descargar de nuevo', run: () => { tryDownload(name, blob); return 'Descarga solicitada.'; } }];
  if (extra && extra.copy) { const t = extra.copy; actions.push({ label: extra.copyLabel || 'Copiar contenido al portapapeles', run: async () => (await copyText(t)) ? (extra.copyDone || 'Copiado. Pégalo en un editor y guárdalo como ' + name + '.') : 'No se pudo copiar automáticamente.' }); }
  if (!(extra && extra.noOpen)) actions.push({ label: 'Abrir en pestaña nueva', run: () => openBlob(blob) });
  exportPanel({ title: name, note: 'Si la descarga no inició (algunos sitios publicados bloquean descargas), usa una de estas alternativas.', actions });
}

export function printPanel(doPrint: () => void) {
  exportPanel({
    title: 'Reporte PDF', note: 'Se abrió el diálogo de impresión: elige "Guardar como PDF". Si no apareció, el sitio donde está publicada la app bloquea la impresión; usa Ctrl/⌘ + P o abre la app directamente en su propia pestaña.', actions: [
      { label: 'Abrir diálogo de impresión', run: () => { document.getElementById('vf-export-panel')?.remove(); setTimeout(doPrint, 150); } },
      { label: 'Abrir la app en pestaña nueva', run: () => { const w = window.open(location.href, '_blank', 'noopener'); if (!w) throw new Error('el navegador bloqueó la ventana nueva'); return 'Abierta. Exporta el PDF desde esa pestaña.'; } }
    ]
  });
}

export const fileBase = (ds: Dataset) => (ds.profile.short || ds.profile.name).replace(/[^A-Za-z0-9]+/g, '_') + '_Valuacion_' + new Date().toISOString().slice(0, 10);

/** Libro de Excel con resumen, supuestos, FCF, WACC, sensibilidad, validación y fuentes. */
export function exportXLSX(ds: Dataset, A: Assumptions, base: RunOk) {
  const XLSX = getXLSX();
  const wb = XLSX.utils.book_new(), sheets: [string, unknown[][]][] = [];
  const add = (n: string, a: unknown[][]) => { sheets.push([n, a]); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(a), n); };
  add('Resumen', [['ValuFlow · ' + (ds.profile.legalName || ds.profile.name)], ['Ticker', ds.profile.ticker + ' · ' + ds.profile.exchange], ['Fecha de valuación', ds.dates.valuation], [],
    ['Valor intrínseco por acción', base.value], ['Precio de mercado', base.price], ['Potencial', base.upside], ['WACC', base.wacc], ['g', base.g], ['Enterprise Value', base.ev], ['Equity Value', base.eqVal], ['Peso valor terminal (Gordon)', base.tvWeightG]]);
  add('Supuestos', [['Supuesto', 'Valor'] as unknown[]].concat(Object.entries(A).map(([k, v]) => [k, v])));
  const R = base.rows as unknown as Record<string, unknown>[];
  add('Proyección FCF', [['Concepto' as unknown].concat(base.rows.map(r => r.year))].concat([['Ventas', 'revenue'], ['Crecimiento', 'growth'], ['EBIT', 'ebit'], ['Tasa', 'taxRate'], ['NOPAT', 'nopat'], ['D&A', 'da'], ['Capex', 'capex'], ['ΔNWC', 'dNwc'], ['FCF', 'fcf'], ['Factor de descuento', 'df'], ['VP FCF', 'pv']].map(([l, k]) => [l as unknown].concat(R.map(r => r[k])))));
  const W = base.W;
  add('WACC', [['Concepto', 'Valor'], ['Rf', W.rf], ['PRM', W.prm], ['Beta desapalancada', W.betaU], ['Modo', W.mode], ['WACC', base.wacc], ['Ke', base.ke], [], ['Iteración', 'WACC entrada', 'Equity DCF', 'D/E', 'Beta', 'Ke', 'WACC salida'] as unknown[]].concat(W.iters.map(i => [i.k, i.win, i.E, i.de, i.beta, i.ke, i.wout])));
  const g = grid(ds, A, base);
  add('Sensibilidad', [['WACC \\ g' as unknown].concat(g.gs.map(x => x / 100))].concat(g.ws.map((w, i) => [w / 100 as unknown].concat(g.cells[i]))));
  add('Validación', [['Grupo', 'Comprobación', 'Estado', 'Calculado', 'Excel']].concat(validate(ds, A, base, false).map(c => [c.group, c.label, c.status, c.calc || c.detail || '', c.exp || ''])));
  add('Fuentes', [['Fuente', 'Documento', 'Uso'] as unknown[]].concat(ds.sources || []));
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const tsv = sheets.map(([n, a]) => '### ' + n + '\n' + a.map(r => r.map(x => x == null ? '' : String(x)).join('\t')).join('\n')).join('\n\n');
  download(fileBase(ds) + '.xlsx', new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), null, { copy: tsv, copyLabel: 'Copiar tablas para pegar en Excel', copyDone: 'Copiado. Pégalo en una hoja de Excel (Ctrl/⌘ + V).', noOpen: true });
}

/** Contenido CSV de los datos financieros normalizados (separado para poder probarlo). */
export function csvContent(ds: Dataset, base: RunOk): string {
  const lines: unknown[][] = [['field', 'period', 'value', 'unit', 'type', 'source']];
  const u = ds.profile.currency + ' ' + (ds.profile.units || '');
  Object.entries(ds.forecast.base).forEach(([k, v]) => lines.push([k, ds.forecast.baseYear, v, u, 'Actual', ds.source.kind]));
  const R = base.rows as unknown as Record<string, number>[];
  base.rows.forEach((r, i) => ['revenue', 'ebit', 'nopat', 'da', 'capex', 'dNwc', 'fcf', 'pv'].forEach(k => lines.push([k, r.year, R[i][k].toFixed(4), u, 'Estimado', 'ValuFlow engine'])));
  return lines.map(l => l.map(x => '"' + String(x ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
}

export function exportCSV(ds: Dataset, base: RunOk) {
  const csv = csvContent(ds, base);
  download(fileBase(ds) + '.csv', '﻿' + csv, 'text/csv;charset=utf-8', { copy: csv });
}

export function exportJSON(ds: Dataset, A: Assumptions) {
  const t = JSON.stringify({ format: 'valuflow/1', dataset: ds, assumptions: A }, null, 2);
  download(fileBase(ds) + '.valuflow.json', t, 'application/json', { copy: t });
}
