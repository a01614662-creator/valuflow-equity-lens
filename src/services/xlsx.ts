// Libro de Excel profesional con ExcelJS (incluido en el paquete; no usa CDN).
// Hojas con FÓRMULAS vivas (Supuestos → WACC → FCFF y valuación → Transacciones SDC → Conclusión): al abrirlo en Excel
// o LibreOffice, el valor por acción y el precio objetivo se recalculan y se comparan con la cifra de la app.
// El resto de las hojas lleva las mismas tablas numeradas del reporte técnico, con números reales (no texto).
import ExcelJS from 'exceljs';
import type { RTable, Report, Section } from '../report/content';
import type { ChartImage } from './images';

const STEEL = 'FF416180', NIGHT = 'FF1D2D3D', LIGHT = 'FFECF2F8', GRAY = 'FF5D5D60', INPUT = 'FF1F4E79', WARN = 'FFA15C07';

/** Convierte el texto de una celda del reporte a número de Excel con su formato (o lo deja como texto). */
export function parseCell(s: string): { v: number | string; fmt?: string } {
  const t = String(s ?? '').trim();
  if (!t || /^(NA|NM|—|-)$/.test(t)) return { v: t };
  let m = t.match(/^([+\-−])?\$?([+\-−])?([\d,]+(?:\.(\d+))?)$/);
  if (m && /\$/.test(t)) { const v = +m[3].replace(/,/g, '') * (/[-−]/.test((m[1] || '') + (m[2] || '')) ? -1 : 1); return { v, fmt: '$#,##0.' + '0'.repeat(Math.max(2, (m[4] || '').length)) }; }
  m = t.match(/^([+\-−])?([\d,]+(?:\.(\d+))?)%$/);
  if (m) { const v = +m[2].replace(/,/g, '') / 100 * (m[1] && m[1] !== '+' ? -1 : 1); const d = (m[3] || '').length; return { v, fmt: (m[1] === '+' || m[1] === '−' || m[1] === '-' ? '+' : '') + '0' + (d ? '.' + '0'.repeat(d) : '') + '%' + (m[1] ? ';-0' + (d ? '.' + '0'.repeat(d) : '') + '%' : '') }; }
  m = t.match(/^([\d,]+(?:\.(\d+))?)x$/);
  if (m) return { v: +m[1].replace(/,/g, ''), fmt: '0.' + '0'.repeat(Math.max(1, (m[2] || '').length)) + '"x"' };
  m = t.match(/^\(([\d,]+(?:\.(\d+))?)\)$/);
  if (m) { const d = (m[2] || '').length; return { v: -+m[1].replace(/,/g, ''), fmt: '#,##0' + (d ? '.' + '0'.repeat(d) : '') + ';(#,##0' + (d ? '.' + '0'.repeat(d) : '') + ')' }; }
  m = t.match(/^([+\-−])?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?$/);
  if (m && !(m[2].length >= 7 && !m[2].includes(',') && !m[3])) { const d = (m[3] || '').length; const v = +((m[2] + (m[3] ? '.' + m[3] : '')).replace(/,/g, '')) * (m[1] && m[1] !== '+' ? -1 : 1); return { v, fmt: (m[2].includes(',') || v >= 1000 ? '#,##0' : '0') + (d ? '.' + '0'.repeat(d) : '') }; }
  return { v: t };
}

function headerRow(ws: ExcelJS.Worksheet, r: number, vals: string[], c0 = 1) {
  vals.forEach((v, i) => { const c = ws.getCell(r, c0 + i); c.value = v; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STEEL } }; c.alignment = { vertical: 'middle', wrapText: true, horizontal: i ? 'center' : 'left' }; });
  ws.getRow(r).height = 30;
}
function title(ws: ExcelJS.Worksheet, t: string, sub?: string) {
  ws.getCell('A1').value = t; ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NIGHT } };
  if (sub) { ws.getCell('A2').value = sub; ws.getCell('A2').font = { italic: true, size: 9, color: { argb: GRAY } }; }
}
/** Escribe una tabla del reporte a partir de la fila r; devuelve la siguiente fila libre. */
function writeTable(ws: ExcelJS.Worksheet, t: RTable, r: number): number {
  ws.getCell(r, 1).value = (t.n ? 'Tabla ' + t.n + '. ' : '') + t.title; ws.getCell(r, 1).font = { bold: true, color: { argb: NIGHT } }; r++;
  headerRow(ws, r, t.head.map((h, i) => h || (i === 0 ? 'Concepto' : ''))); r++;
  t.rows.forEach((row, i) => {
    row.forEach((v, j) => {
      const c = ws.getCell(r, j + 1);
      if (j === 0) { c.value = v; c.alignment = { wrapText: true, vertical: 'top' }; return; }
      const p = parseCell(v); c.value = p.v; if (p.fmt) { c.numFmt = p.fmt; c.alignment = { horizontal: 'right' }; } else c.alignment = { wrapText: v.length > 40, vertical: 'top' };
    });
    if (t.bold?.includes(i)) ws.getRow(r).font = { bold: true };
    if (i % 2) for (let j = 1; j <= t.head.length; j++) ws.getCell(r, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT } };
    r++;
  });
  if (t.note) { ws.getCell(r, 1).value = t.note; ws.getCell(r, 1).font = { size: 9 }; r++; }
  ws.getCell(r, 1).value = 'Fuente: ' + t.source; ws.getCell(r, 1).font = { italic: true, size: 9, color: { argb: GRAY } };
  return r + 2;
}
const widths = (ws: ExcelJS.Worksheet, w: number[]) => w.forEach((x, i) => { ws.getColumn(i + 1).width = x; });
const sheetName = (s: Section) => s.title.replace(/^(\d+)\.\s*/, (_, n) => String(n).padStart(2, '0') + ' ').replace(/[\\/?*[\]:]/g, '').slice(0, 31);

export async function buildXlsx(R: Report, images: Record<string, ChartImage>): Promise<Uint8Array> {
  const S = R.snap, { ds, A, b, rel, rec } = S, meta = R.meta;
  const wb = new ExcelJS.Workbook();
  wb.creator = meta.team.map(t => t[0]).join(', '); wb.title = meta.title; wb.subject = meta.course; wb.company = meta.institution;
  wb.created = S.generatedAt; wb.calcProperties.fullCalcOnLoad = true;
  const img = (ws: ExcelJS.Worksheet, id: string, col: number, row: number, wpx = 620) => {
    const im = images[id]; if (!im) return 0;
    const imageId = wb.addImage({ base64: im.base64, extension: 'png' }), h = wpx * im.h / im.w;
    ws.addImage(imageId, { tl: { col, row }, ext: { width: wpx, height: h } });
    return Math.ceil(h / 20) + 2;
  };
  const label = (ws: ExcelJS.Worksheet, r: number, t: string, c = 1) => { ws.getCell(r, c).value = t; ws.getCell(r, c).font = { bold: true, color: { argb: NIGHT } }; };

  // ---------------------------------------------------------------- Portada
  const ws0 = wb.addWorksheet('Portada');
  title(ws0, meta.title, meta.institution + ' · ' + meta.course + ' · ' + meta.year + ' · generado el ' + meta.generated);
  let r = 4;
  ([['Empresa', meta.company + ' (' + meta.ticker + ')'], ['Escenario', meta.caseLabel], ['Precio de mercado', 'Cierre ' + meta.priceDate], ['Fecha de valuación', meta.valuationDate]] as [string, string][])
    .forEach(([k, v]) => { label(ws0, r, k); ws0.getCell(r, 2).value = v; r++; });
  r++; label(ws0, r, 'Equipo'); r++;
  meta.team.forEach(([n, id]) => { ws0.getCell(r, 1).value = n; ws0.getCell(r, 2).value = id; r++; });
  r++; headerRow(ws0, r, ['Dato clave', 'Valor']); r++;
  meta.keyFacts.forEach(([k, v]) => { ws0.getCell(r, 1).value = k; ws0.getCell(r, 2).value = v; r++; });
  if (meta.changes.length) {
    r++; ws0.getCell(r, 1).value = 'Escenario modificado: supuestos distintos al Excel'; ws0.getCell(r, 1).font = { bold: true, color: { argb: WARN } }; r++;
    headerRow(ws0, r, ['Supuesto', 'Excel', 'Activo']); r++; meta.changes.forEach(c => { c.forEach((v, j) => { ws0.getCell(r, j + 1).value = v; }); r++; });
  }
  r++; ws0.getCell(r, 1).value = 'Hojas con fórmulas: Supuestos, WACC, FCFF y valuación, Transacciones SDC y Conclusión. Las demás hojas reproducen las tablas numeradas del reporte técnico.'; ws0.getCell(r, 1).font = { italic: true, size: 9, color: { argb: GRAY } };
  r += 2; img(ws0, 'football', 0, r, 680);
  widths(ws0, [46, 70, 24]);

  // ---------------------------------------------------------------- Supuestos (insumos de las fórmulas)
  const wsS = wb.addWorksheet('Supuestos', { views: [{ state: 'frozen', ySplit: 3 }] });
  title(wsS, 'Supuestos activos (insumos de las hojas con fórmulas)', 'Valores en azul: cambiarlos recalcula WACC, FCFF y valuación, transacciones y conclusión.');
  headerRow(wsS, 3, ['Supuesto', 'Valor', 'Unidad', 'Fuente']);
  const ro = b.roll, it = b.W.iterated ?? b.W.market, ref: Record<string, string> = {};
  const tgt = ds.comps?.target, n = b.rows.length;
  const SUP: [string, string, number | null, string, string, string][] = [
    ['rf', 'Tasa libre de riesgo (Rf)', b.W.rf, '0.00%', 'fracción', 'Bono M 10 años'],
    ['prm', 'Prima de riesgo de mercado', b.W.prm, '0.00%', 'fracción', 'Hoja WACC'],
    ['bu', 'Beta desapalancada (βU)', b.W.betaU, '0.0000', 'x', ds.beta?.regression && Math.abs(b.W.betaU - ds.beta.regression.unlevered) < 1e-12 ? 'Regresión semanal (βL ' + ds.beta.regression.levered.toFixed(4) + ') desapalancada' : 'Laboratorio / referencia'],
    ['D', 'Deuda total para el WACC', it.D, '#,##0.0', 'mdp', 'Deuda + arrendamientos'],
    ['tax', 'Tasa del escudo fiscal', A.taxShield / 100, '0.00%', 'fracción', 'Hoja WACC'],
    ['kd', 'Kd antes de impuestos', A.kdPre / 100, '0.00%', 'fracción', 'Hoja Beta y Kd'],
    ['g', 'Crecimiento perpetuo (g)', b.g, '0.00%', 'fracción', 'Hoja Proyección Final'],
    ['mult', 'Múltiplo de salida EV/EBITDA', b.mult, '0.00"x"', 'x', 'Mediana comparables −10%'],
    ['wG', 'Peso de Gordon', b.wG, '0%', 'fracción', 'Ponderación del valor terminal'],
    ['debt0', 'Deuda bursátil y bancaria al cierre', A.bridgeDebt, '#,##0.0', 'mdp', 'Puente al cierre'],
    ['lease0', 'Arrendamientos al cierre', A.bridgeLease, '#,##0.0', 'mdp', 'Puente al cierre'],
    ['cash0', 'Efectivo al cierre', A.bridgeCash, '#,##0.0', 'mdp', 'Puente al cierre'],
    ['t1', 't1: años del cierre al balance intermedio', ro ? ro.t1 : 0, '0.000000', 'años', 'YEARFRAC base 0'],
    ['fcfGen', 'Ajuste FCF del periodo intermedio', ro ? ro.fcfGenerated : 0, '#,##0.000', 'mdp', 'Se suma al EV capitalizado'],
    ['debt2', 'Deuda al balance intermedio', ro ? ro.debt : 0, '#,##0.0', 'mdp', 'Balance 2T26'],
    ['lease2', 'Arrendamientos al balance intermedio', ro ? ro.lease : 0, '#,##0.0', 'mdp', 'Balance 2T26'],
    ['cash2', 'Efectivo al balance intermedio', ro ? ro.cash : 0, '#,##0.0', 'mdp', 'Balance 2T26'],
    ['t2', 't2: años a la fecha de valuación', ro ? ro.t2 : 0, '0.000000', 'años', 'YEARFRAC base 0'],
    ['shares', 'Acciones en circulación', b.shares, '#,##0.0', 'millones', 'Hoja WACC'],
    ['price', 'Precio de mercado', b.price, '$#,##0.00', 'MXN', 'Cierre ' + ds.dates.price],
    ['ebitdaT', 'EBITDA LTM (para transacciones)', tgt?.ebitda ?? null, '#,##0.0', 'mdp', 'Hoja Datos (LTM 2T26)'],
    ['adjT', 'Ajuste EV → capital (caja − deuda − arrend. − minoritarios − preferentes)', tgt ? tgt.cash - tgt.debt - tgt.lease - tgt.minority - tgt.preferred : null, '#,##0.0', 'mdp', 'Hoja Datos'],
    ['sharesT', 'Acciones (múltiplos)', tgt?.shares ?? null, '#,##0.0', 'millones', 'Hoja Datos'],
    ['buy', 'Umbral de compra', rec?.buy ?? 0.1, '0%', 'fracción', 'Regla de recomendación'],
    ['sell', 'Umbral de venta', rec?.sell ?? -0.1, '0%', 'fracción', 'Regla de recomendación']
  ];
  r = 4;
  SUP.forEach(([k, l, v, f, u, s]) => { wsS.getCell(r, 1).value = l; const c = wsS.getCell(r, 2); c.value = v; c.numFmt = f; c.font = { color: { argb: INPUT }, bold: true }; wsS.getCell(r, 3).value = u; wsS.getCell(r, 4).value = s; ref[k] = 'Supuestos!$B$' + r; r++; });
  widths(wsS, [60, 16, 11, 44]);

  // ---------------------------------------------------------------- WACC (fórmulas)
  const wsW = wb.addWorksheet('WACC', { views: [{ state: 'frozen', ySplit: 3 }] });
  title(wsW, 'WACC con fórmulas (última iteración, equity del DCF)', 'El equity E es el del DCF en la última iteración del motor; el resto se calcula aquí.');
  headerRow(wsW, 3, ['Concepto', 'Valor', 'Fórmula', 'App']);
  const wRows: [string, string | number, string, number | null, string][] = [
    ['Equity E (DCF, última iteración)', b.W.iters.length ? b.W.iters[b.W.iters.length - 1].E : it.E, 'dato del motor', null, '#,##0.0'],
    ['D / E', '=' + ref.D + '/B4', 'D ÷ E', it.de, '0.0000'],
    ['βL = βU × [1 + (1 − t) × D/E]', '=' + ref.bu + '*(1+(1-' + ref.tax + ')*B5)', 'Hamada', it.beta, '0.0000'],
    ['Ke = Rf + βL × PRM', '=' + ref.rf + '+B6*' + ref.prm, 'CAPM', it.ke, '0.0000%'],
    ['Kd después de impuestos', '=' + ref.kd + '*(1-' + ref.tax + ')', 'Kd × (1 − t)', it.kdAT, '0.0000%'],
    ['E / (D + E)', '=B4/(B4+' + ref.D + ')', 'peso del capital', it.wE, '0.0000%'],
    ['D / (D + E)', '=' + ref.D + '/(B4+' + ref.D + ')', 'peso de la deuda', it.wD, '0.0000%'],
    ['WACC', '=B9*B7+B10*B8', 'E/V × Ke + D/V × Kd(1−t)', it.wacc, '0.0000%']
  ];
  wRows.forEach(([l, v, fx, app, fm], i) => { const rr = 4 + i; wsW.getCell(rr, 1).value = l; const c = wsW.getCell(rr, 2); c.value = typeof v === 'string' && v.startsWith('=') ? { formula: v.slice(1) } : v; c.numFmt = fm; wsW.getCell(rr, 3).value = fx; if (app != null) { wsW.getCell(rr, 4).value = app; wsW.getCell(rr, 4).numFmt = fm; } });
  wsW.getCell(11, 1).font = { bold: true }; wsW.getCell(11, 2).font = { bold: true };
  wsW.getCell(12, 1).value = 'Modo activo del WACC en el modelo'; wsW.getCell(12, 2).value = ({ iterated: 'iterado', market: 'de mercado', manual: 'manual' } as Record<string, string>)[b.W.mode];
  wsW.getCell(13, 1).value = 'WACC usado en el DCF'; wsW.getCell(13, 2).value = b.W.mode === 'iterated' ? { formula: 'B11' } : b.wacc; wsW.getCell(13, 2).numFmt = '0.0000%'; wsW.getCell(13, 2).font = { bold: true };
  wsW.getCell(14, 1).value = 'Ke usado en el DCF'; wsW.getCell(14, 2).value = b.W.mode === 'iterated' ? { formula: 'B7' } : b.ke; wsW.getCell(14, 2).numFmt = '0.0000%';
  ref.wacc = 'WACC!$B$13'; ref.ke = 'WACC!$B$14';
  let rw = 17; label(wsW, rw, 'Iteraciones del motor'); rw++;
  headerRow(wsW, rw, ['Iteración', 'WACC entrada', 'Equity DCF', 'D/E', 'Beta', 'Ke', 'WACC salida']); rw++;
  b.W.iters.forEach(x => { [x.k, x.win, x.E, x.de, x.beta, x.ke, x.wout].forEach((v, j) => { const c = wsW.getCell(rw, j + 1); c.value = v; c.numFmt = ['0', '0.0000%', '#,##0.0', '0.0000', '0.0000', '0.0000%', '0.0000%'][j]; }); rw++; });
  img(wsW, 'iter', 0, rw + 1, 560);
  widths(wsW, [40, 16, 26, 16, 12, 12, 12]);

  // ---------------------------------------------------------------- FCFF y valuación (fórmulas)
  const wsF = wb.addWorksheet('FCFF y valuación', { views: [{ state: 'frozen', xSplit: 1, ySplit: 3 }] });
  title(wsF, 'Proyección FCFF y valuación con fórmulas', 'Fondo azul claro: proyección por drivers del motor (con la inflación del escenario). Lo demás son fórmulas que leen Supuestos y WACC.');
  const col = (i: number) => String.fromCharCode(66 + i), L = col(n - 1), R0 = b.rows;
  headerRow(wsF, 3, ['Concepto', ...R0.map(x => x.year)]);
  const input = (row: number, l: string, vals: number[], fm = '#,##0.0') => { wsF.getCell(row, 1).value = l; vals.forEach((v, i) => { const c = wsF.getCell(row, i + 2); c.value = v; c.numFmt = fm; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT } }; }); };
  const fx = (row: number, l: string, fn: (c: string, i: number) => string, fm = '#,##0.0', bold = false) => { wsF.getCell(row, 1).value = l; for (let i = 0; i < n; i++) { const c = wsF.getCell(row, i + 2); c.value = { formula: fn(col(i), i) }; c.numFmt = fm; if (bold) c.font = { bold: true }; } if (bold) wsF.getCell(row, 1).font = { bold: true }; };
  input(4, 'Ventas', R0.map(x => x.revenue)); input(5, 'Utilidad de operación (EBIT)', R0.map(x => x.ebit)); input(6, 'Tasa de impuestos sobre EBIT', R0.map(x => x.taxRate), '0.00%');
  fx(7, '(−) Impuestos sobre EBIT', c => c + '5*' + c + '6'); fx(8, 'NOPAT', c => c + '5-' + c + '7', '#,##0.0', true);
  input(9, '(+) Depreciación y amortización', R0.map(x => x.da)); input(10, '(−) Capex', R0.map(x => x.capex)); input(11, '(−) Inversión en capital de trabajo', R0.map(x => x.dNwc));
  fx(12, 'FCFF', c => c + '8+' + c + '9-' + c + '10-' + c + '11', '#,##0.0', true);
  input(13, 'Periodo n', R0.map((_, i) => i + 1), '0');
  fx(14, 'Factor de descuento 1/(1+WACC)^n', c => '1/(1+' + ref.wacc + ')^' + c + '13', '0.000000'); fx(15, 'Valor presente del FCFF', c => c + '12*' + c + '14');
  input(16, 'EBITDA', R0.map(x => x.ebitda));
  const V = (row: number, l: string, f: string, fm = '#,##0.0', bold = false) => { wsF.getCell(row, 1).value = l; const c = wsF.getCell(row, 2); c.value = { formula: f }; c.numFmt = fm; if (bold) { c.font = { bold: true }; wsF.getCell(row, 1).font = { bold: true }; } };
  label(wsF, 18, 'Valuación');
  const normalized = Math.abs(b.fcfTv - R0[n - 1].fcf) > 1e-9;
  V(19, 'Suma VP de los FCFF', 'SUM(B15:' + L + '15)');
  V(20, normalized ? 'FCF normalizado ' + R0[n - 1].year + ' (capex = D&A): NOPAT − ΔNWC' : 'FCF ' + R0[n - 1].year, normalized ? L + '8-' + L + '11' : L + '12');
  V(21, 'Valor terminal Gordon = FCF × (1+g)/(WACC − g)', 'B20*(1+' + ref.g + ')/(' + ref.wacc + '-' + ref.g + ')'); V(22, 'VP valor terminal Gordon', 'B21*' + L + '14'); V(23, 'EV Gordon', 'B19+B22');
  V(24, 'Valor terminal múltiplo = EBITDA × múltiplo', L + '16*' + ref.mult); V(25, 'VP valor terminal múltiplo', 'B24*' + L + '14'); V(26, 'EV múltiplo', 'B19+B25');
  V(27, 'EV ponderado al cierre', ref.wG + '*B23+(1-' + ref.wG + ')*B26', '#,##0.0', true);
  if (ro) {
    V(28, 'EV capitalizado = EV × (1+WACC)^t1', 'B27*(1+' + ref.wacc + ')^' + ref.t1); V(29, 'EV al balance intermedio (+ ajuste FCF del periodo)', 'B28+' + ref.fcfGen);
    V(30, 'Equity al balance intermedio = EV − deuda − arrendamientos + efectivo', 'B29-' + ref.debt2 + '-' + ref.lease2 + '+' + ref.cash2);
    V(31, 'Equity a la fecha de valuación = × (1+Ke)^t2', 'B30*(1+' + ref.ke + ')^' + ref.t2, '#,##0.0', true);
  } else V(31, 'Equity Value = EV − deuda − arrendamientos + efectivo', 'B27-' + ref.debt0 + '-' + ref.lease0 + '+' + ref.cash0, '#,##0.0', true);
  V(32, 'Valor DCF por acción (MXN)', 'B31/' + ref.shares, '$#,##0.00', true); V(33, 'Precio de mercado (MXN)', ref.price, '$#,##0.00');
  V(34, 'Potencial (%)', 'B32/B33-1', '+0.0%;-0.0%');
  wsF.getCell(36, 1).value = 'Valor DCF por acción calculado por la app'; wsF.getCell(36, 2).value = b.value; wsF.getCell(36, 2).numFmt = '$#,##0.00';
  wsF.getCell(37, 1).value = 'Diferencia fórmula − app (MXN)'; wsF.getCell(37, 2).value = { formula: 'B32-B36' }; wsF.getCell(37, 2).numFmt = '0.000000';
  wsF.getCell(38, 1).value = 'Nota: con WACC iterado, cambiar un supuesto aquí no repite la iteración (el equity del DCF queda fijo en la hoja WACC); la app sí la repite.'; wsF.getCell(38, 1).font = { italic: true, size: 9, color: { argb: GRAY } };
  ref.dcf = "'FCFF y valuación'!$B$32";
  let rf = 40; rf += img(wsF, 'fcf', 0, rf, 560); img(wsF, 'bridge', 0, rf, 680);
  widths(wsF, [64, 14, 14, 14, 14, 14, 14]);

  // ---------------------------------------------------------------- Transacciones SDC (fórmulas sobre la muestra)
  const SD = rel.sdc;
  if (SD) {
    const ws = wb.addWorksheet('Transacciones SDC', { views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }] });
    const sp = SD.spec;
    title(ws, 'Precedent Transactions LSEG/SDC: muestra, criterios y estadísticos con fórmulas', sp.screen.provider + ' · ' + sp.screen.file + ' · ' + sp.screen.date + ' · tipo de cambio ' + sp.fx.rate + ' MXN/USD (' + sp.fx.source + ')');
    const H = ['Objetivo', 'Deal #', 'Anuncio', 'País objetivo', 'Comprador', 'País comprador', 'Subindustria', 'Valor operación (USD mm)', 'EV (USD mm)', 'EV (MXN mm)', 'EV/EBITDA', 'EV/Ventas', 'P/E', '# múltiplos', 'Ventana', '≥2 múltiplos', 'Autoservicio', 'Recompra', 'Juicio', 'Incluir (1/0)', 'EV/EBITDA usado', 'Motivo'];
    headerRow(ws, 4, H);
    const r0 = 5, rN = r0 + sp.deals.length - 1;
    sp.deals.forEach((d, i) => {
      const c = SD.checks[i], rr = r0 + i;
      const vals: (string | number | null)[] = [d.target, d.id, d.date, d.targetNation, d.acquiror, d.acquirorNation, d.targetIndustry, d.rankValue, d.ev, null, d.evEbitda, d.evSales, d.pe, null, c.inWindow ? 'Sí' : 'No', c.enough ? 'Sí' : 'No', d.sector, c.buyback ? 'Sí' : 'No', d.judgment, c.include, null, d.reason];
      vals.forEach((v, j) => { const cell = ws.getCell(rr, j + 1); cell.value = v == null ? 'NA' : v; if (typeof v === 'number') cell.numFmt = j >= 10 && j <= 12 ? '0.00"x"' : '#,##0.0'; });
      ws.getCell(rr, 10).value = d.ev == null ? 'NA' : { formula: 'I' + rr + '*' + sp.fx.rate }; ws.getCell(rr, 10).numFmt = '#,##0';
      ws.getCell(rr, 14).value = { formula: 'COUNT(K' + rr + ':M' + rr + ')' };
      ws.getCell(rr, 20).font = { color: { argb: INPUT }, bold: true };
      ws.getCell(rr, 21).value = { formula: 'IF(AND(T' + rr + '=1,ISNUMBER(K' + rr + ')),K' + rr + ',"")' }; ws.getCell(rr, 21).numFmt = '0.00"x"';
    });
    const U = 'U' + r0 + ':U' + rN;
    let rs = rN + 3; label(ws, rs, 'Estadísticos de EV/EBITDA (solo operaciones incluidas con dato; los NA no cuentan)'); rs++;
    headerRow(ws, rs, ['Estadístico', 'EV/EBITDA', 'Precio implícito (MXN)', 'App (MXN)']); rs++;
    const statF: [string, string, E_P][] = [['Mínimo', 'MIN(' + U + ')', SD.prices.min], ['Percentil 25', 'QUARTILE(' + U + ',1)', SD.prices.p25], ['Media', 'AVERAGE(' + U + ')', SD.prices.mean], ['Mediana', 'MEDIAN(' + U + ')', SD.prices.median], ['Percentil 75', 'QUARTILE(' + U + ',3)', SD.prices.p75], ['Máximo', 'MAX(' + U + ')', SD.prices.max], ['n', 'COUNT(' + U + ')', null]];
    const statRow: Record<string, number> = {};
    statF.forEach(([l, fm, app]) => {
      ws.getCell(rs, 1).value = l; ws.getCell(rs, 2).value = { formula: fm }; ws.getCell(rs, 2).numFmt = l === 'n' ? '0' : '0.00"x"';
      if (l !== 'n') { ws.getCell(rs, 3).value = { formula: '(B' + rs + '*' + ref.ebitdaT + '+' + ref.adjT + ')/' + ref.sharesT }; ws.getCell(rs, 3).numFmt = '$#,##0.00'; }
      if (typeof app === 'number') { ws.getCell(rs, 4).value = app; ws.getCell(rs, 4).numFmt = '$#,##0.00'; }
      statRow[l] = rs; rs++;
    });
    const off = { median: 'Mediana', mean: 'Media', meanEx: 'Media', medianEx: 'Mediana' }[sp.official];
    ws.getCell(rs, 1).value = 'Precio de transacciones (estadístico oficial: ' + sp.official + ')'; ws.getCell(rs, 1).font = { bold: true };
    ws.getCell(rs, 2).value = { formula: 'C' + statRow[off] }; ws.getCell(rs, 2).numFmt = '$#,##0.00'; ws.getCell(rs, 2).font = { bold: true };
    ref.trans = "'Transacciones SDC'!$B$" + rs;
    rs += 2; img(ws, 'sdc', 0, rs, 640);
    widths(ws, [36, 12, 12, 14, 30, 14, 26, 14, 12, 12, 10, 10, 9, 10, 9, 10, 11, 10, 12, 11, 12, 70]);
  }

  // ---------------------------------------------------------------- Combinada y recomendación (fórmulas)
  const K = rel.combined;
  if (K) {
    const ws = wb.addWorksheet('Conclusión');
    title(ws, 'Conclusión de valuación y recomendación con fórmulas', 'Pesos en azul: editables. El precio objetivo y la recomendación se recalculan.');
    headerRow(ws, 3, ['Método', 'Precio por acción', 'Peso', 'Contribución', 'Origen']);
    const src: Record<string, string> = { dcf: ref.dcf, transactions: ref.trans ?? '' };
    K.rows.forEach((x, i) => {
      const rr = 4 + i; ws.getCell(rr, 1).value = x.label;
      const pc = ws.getCell(rr, 2); pc.value = src[x.key] ? { formula: src[x.key] } : (typeof x.price === 'number' ? x.price : String(x.price)); pc.numFmt = '$#,##0.00';
      const wc = ws.getCell(rr, 3); wc.value = x.weight; wc.numFmt = '0%'; wc.font = { color: { argb: INPUT }, bold: true };
      ws.getCell(rr, 4).value = { formula: 'IF(ISNUMBER(B' + rr + '),B' + rr + '*C' + rr + ',0)' }; ws.getCell(rr, 4).numFmt = '$#,##0.00';
      ws.getCell(rr, 5).value = src[x.key] ? 'Fórmula (hoja ' + (x.key === 'dcf' ? 'FCFF y valuación' : 'Transacciones SDC') + ')' : 'Motor ValuFlow (Trading Comps, media)';
    });
    const rT = 4 + K.rows.length;
    ws.getCell(rT, 1).value = 'Precio objetivo (conclusión)'; ws.getCell(rT, 1).font = { bold: true };
    ws.getCell(rT, 3).value = { formula: 'SUM(C4:C' + (rT - 1) + ')' }; ws.getCell(rT, 3).numFmt = '0%';
    ws.getCell(rT, 2).value = { formula: 'SUM(D4:D' + (rT - 1) + ')/C' + rT }; ws.getCell(rT, 2).numFmt = '$#,##0.00'; ws.getCell(rT, 2).font = { bold: true };
    const rr = rT + 2;
    ([['Precio de mercado', ref.price, '$#,##0.00'], ['Potencial', 'B' + rT + '/B' + rr + '-1', '+0.0%;-0.0%'], ['Recomendación', 'IF(B' + (rr + 1) + '>' + ref.buy + ',"COMPRAR",IF(B' + (rr + 1) + '<' + ref.sell + ',"VENDER","MANTENER"))', '@']] as [string, string, string][])
      .forEach(([l, fm, nf], i) => { ws.getCell(rr + i, 1).value = l; const c = ws.getCell(rr + i, 2); c.value = { formula: fm }; c.numFmt = nf; if (i === 2) c.font = { bold: true }; });
    ws.getCell(rr + 4, 1).value = 'Precio objetivo calculado por la app'; ws.getCell(rr + 4, 2).value = E_num(K.value); ws.getCell(rr + 4, 2).numFmt = '$#,##0.00';
    ws.getCell(rr + 5, 1).value = 'Recomendación de la app'; ws.getCell(rr + 5, 2).value = rec?.rating ?? '—';
    ws.getCell(rr + 6, 1).value = rec?.rule ?? ''; ws.getCell(rr + 6, 1).font = { italic: true, size: 9, color: { argb: GRAY } };
    img(ws, 'rec', 0, rr + 8, 560);
    widths(ws, [38, 18, 10, 16, 48]);
  }

  // ---------------------------------------------------------------- Tablas del reporte técnico (una hoja por sección)
  R.sections.forEach(s => {
    const tables = s.blocks.filter((k): k is RTable => k.kind === 'table');
    if (!tables.length) return;
    const ws = wb.addWorksheet(sheetName(s));
    title(ws, s.title, 'Tablas numeradas como en el reporte técnico PDF. ' + meta.caseLabel + '.');
    let rr = 3; tables.forEach(t => { rr = writeTable(ws, t, rr); });
    s.blocks.filter(k => k.kind === 'chart').forEach(k => { rr += img(ws, k.id, 0, rr, k.kind === 'chart' && k.chart.wide ? 680 : 540); });
    const maxCols = Math.max(...tables.map(t => t.head.length));
    widths(ws, [44, ...Array.from({ length: maxCols - 1 }, () => maxCols > 8 ? 14 : 22)]);
  });

  const footer = 'ValuFlow · ' + meta.company + ' · ' + meta.institution;
  wb.eachSheet(ws => { ws.headerFooter.oddFooter = '&L' + footer + '&RPágina &P de &N'; ws.pageSetup = { paperSize: 1 as unknown as ExcelJS.PaperSize, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } }; });
  const buf = await wb.xlsx.writeBuffer();
  return new Uint8Array(buf as ArrayBuffer);
}

type E_P = number | string | null;
const E_num = (p: unknown) => typeof p === 'number' && isFinite(p) ? p : null;

/** CSV de una tabla: UTF-8 con BOM, separador coma, CRLF; números como en el reporte (texto exacto). */
export function tableCsv(t: RTable): string {
  const q = (s: string) => /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  return '﻿' + [t.head.map((h, i) => q(h || (i === 0 ? 'Concepto' : ''))).join(',')].concat(t.rows.map(r => r.map(c => q(String(c ?? ''))).join(','))).join('\r\n') + '\r\n';
}
