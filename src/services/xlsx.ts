// Libro de Excel trazable con ExcelJS (incluido en el paquete; no usa CDN).
// La hoja "Proyección FCFF" calcula NOPAT, FCF, descuento, valor terminal, puente y precio con FÓRMULAS
// que leen la hoja "Supuestos"; al abrirla en Excel o LibreOffice el valor por acción coincide con la app.
import ExcelJS from 'exceljs';
import { AUTHOR, FOOTER } from '../config';
import { cellText, isoToText, type Cell, type RTable, type Report } from '../report/content';

export interface ChartImage { id: string; title: string; base64: string; w: number; h: number }

const BLUE = 'FF0039A6', LIGHT = 'FFEEF3FC', GRAY = 'FF5D5D60';
const FMT: Record<string, string> = { mxn: '#,##0.00', mdp: '#,##0', mdp1: '#,##0.0', pct: '0.00%', pct1: '0.0%', pct0: '0%', x: '0.00"x"', b4: '0.0000', n2: '0.00', n3: '0.000', n4: '0.0000', n5: '0.00000', int: '0', text: '@' };

function headerRow(ws: ExcelJS.Worksheet, r: number, vals: string[]) {
  const row = ws.getRow(r); vals.forEach((v, i) => { const c = row.getCell(i + 1); c.value = v; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } }; c.alignment = { vertical: 'middle', wrapText: true, horizontal: i ? 'center' : 'left' }; });
  row.height = 30;
}
function title(ws: ExcelJS.Worksheet, t: string, sub?: string) {
  ws.getCell('A1').value = t; ws.getCell('A1').font = { bold: true, size: 14, color: { argb: BLUE } };
  if (sub) { ws.getCell('A2').value = sub; ws.getCell('A2').font = { italic: true, size: 9, color: { argb: GRAY } }; }
}
function put(c: ExcelJS.Cell, v: Cell) {
  if (v == null) return;
  if (typeof v === 'string') { c.value = v; return; }
  c.value = v.v; if (v.v != null) c.numFmt = FMT[v.f] ?? 'General'; c.alignment = { horizontal: 'right' };
}
/** Escribe una tabla del reporte a partir de la fila r; devuelve la siguiente fila libre. */
function writeTable(ws: ExcelJS.Worksheet, t: RTable, r: number): number {
  ws.getCell(r, 1).value = (t.n ? 'Tabla ' + t.n + '. ' : '') + t.title; ws.getCell(r, 1).font = { bold: true, color: { argb: BLUE } }; r++;
  headerRow(ws, r, t.head); r++;
  t.rows.forEach((row, i) => { row.forEach((v, j) => put(ws.getCell(r, j + 1), v)); if (t.bold?.includes(i)) ws.getRow(r).font = { bold: true }; if (i % 2) for (let j = 1; j <= t.head.length; j++) ws.getCell(r, j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT } }; r++; });
  if (t.note) { ws.getCell(r, 1).value = t.note; ws.getCell(r, 1).font = { size: 9 }; r++; }
  ws.getCell(r, 1).value = t.source; ws.getCell(r, 1).font = { italic: true, size: 9, color: { argb: GRAY } };
  return r + 2;
}
function widths(ws: ExcelJS.Worksheet, w: number[]) { w.forEach((x, i) => { ws.getColumn(i + 1).width = x; }); }

export async function buildXlsx(R: Report, images: Record<string, ChartImage>): Promise<Uint8Array> {
  const B = R.bundle, { ds, A, b, scen, infl, monthly, prices, beta } = B;
  const wb = new ExcelJS.Workbook();
  wb.creator = AUTHOR.name + ' (' + AUTHOR.id + ')'; wb.title = R.meta.title; wb.subject = AUTHOR.activity; wb.company = AUTHOR.institution;
  wb.created = new Date(); wb.calcProperties.fullCalcOnLoad = true;
  const tables: Record<string, RTable> = {};
  R.sections.forEach(s => s.blocks.forEach(k => { if (k.kind === 'table') tables[k.id] = k; }));
  const img = (ws: ExcelJS.Worksheet, id: string, col: number, row: number, wpx = 620) => {
    const im = images[id]; if (!im) return 0;
    const imageId = wb.addImage({ base64: im.base64, extension: 'png' }), h = wpx * im.h / im.w;
    ws.addImage(imageId, { tl: { col, row }, ext: { width: wpx, height: h } });
    return Math.ceil(h / 20) + 2;
  };

  // ---------- Resumen
  const ws0 = wb.addWorksheet('Resumen', { views: [{ state: 'frozen', ySplit: 3 }] });
  title(ws0, 'ValuFlow · Estudio individual de Soriana', FOOTER + ' · generado el ' + R.meta.generated);
  let r = 4;
  ([['Autor', AUTHOR.name], ['Matrícula', AUTHOR.id], ['Programa', AUTHOR.program], ['Institución', AUTHOR.institution + ', ' + AUTHOR.campus], ['Materia', AUTHOR.course], ['Actividad', AUTHOR.activity], ['Profesor', AUTHOR.professor], ['Contexto', AUTHOR.context], ['Fecha del precio', R.meta.priceDate], ['Escenario', B.isDefault ? 'Base (supuestos del Excel)' : (scen.find(s => s.active)?.label ?? 'Laboratorio') + ' (supuestos modificados)']] as [string, string][])
    .forEach(([k, v]) => { ws0.getCell(r, 1).value = k; ws0.getCell(r, 1).font = { bold: true, color: { argb: BLUE } }; ws0.getCell(r, 2).value = v; r++; });
  r++;
  r = writeTable(ws0, tables.keyFacts, r);
  if (R.meta.changes.length) { ws0.getCell(r, 1).value = 'Supuestos modificados respecto al Excel'; ws0.getCell(r, 1).font = { bold: true, color: { argb: 'FFA15C07' } }; r++; headerRow(ws0, r, ['Supuesto', 'Excel', 'Actual']); r++; R.meta.changes.forEach(c => { c.forEach((v, j) => { ws0.getCell(r, j + 1).value = v; }); r++; }); r++; }
  img(ws0, 'football', 0, r); widths(ws0, [44, 70, 20]);

  // ---------- Supuestos (insumos de las fórmulas)
  const wsS = wb.addWorksheet('Supuestos', { views: [{ state: 'frozen', ySplit: 3 }] });
  title(wsS, 'Supuestos del modelo (insumos de la hoja Proyección FCFF)', 'Cambiar un valor de la columna B recalcula la hoja Proyección FCFF.');
  headerRow(wsS, 3, ['Supuesto', 'Valor', 'Unidad', 'Fuente']);
  const ro = b.roll, ref: Record<string, string> = {};
  const S: [string, string, number | null, string, string, string][] = [
    ['wacc', 'WACC usado en el DCF', b.wacc, '0.0000%', 'fracción', A.waccMode === 'iterated' ? 'WACC iterado (motor ValuFlow)' : 'Modo ' + A.waccMode],
    ['ke', 'Costo del capital Ke', b.ke, '0.0000%', 'fracción', 'Rf + beta × prima'],
    ['g', 'Crecimiento perpetuo g', b.g, '0.00%', 'fracción', 'Hoja Crecimiento Perpetuo'],
    ['mult', 'Múltiplo de salida EV/EBITDA', b.mult, '0.0000"x"', 'veces', 'Mediana de comparables con descuento'],
    ['wG', 'Peso de Gordon en el valor terminal', b.wG, '0%', 'fracción', 'Promedio de los dos métodos'],
    ['debt', 'Deuda bursátil y bancaria al cierre', A.bridgeDebt, '#,##0.0', 'mdp', 'Puente al cierre'],
    ['lease', 'Pasivo por arrendamiento al cierre', A.bridgeLease, '#,##0.0', 'mdp', 'Puente al cierre'],
    ['cash', 'Efectivo al cierre', A.bridgeCash, '#,##0.0', 'mdp', 'Puente al cierre'],
    ['t1', 't1: años del cierre al balance intermedio', ro ? ro.t1 : 0, '0.0000', 'años', 'DAYS360 / 360'],
    ['fcfGen', 'Ajuste por FCF del periodo intermedio', ro ? ro.fcfGenerated : 0, '#,##0.000', 'mdp', 'CFO − capex del periodo (se suma)'],
    ['debt2', 'Deuda bursátil y bancaria al balance intermedio', ro ? ro.debt : 0, '#,##0.000', 'mdp', 'Balance intermedio'],
    ['lease2', 'Arrendamientos al balance intermedio', ro ? ro.lease : 0, '#,##0.000', 'mdp', 'Balance intermedio'],
    ['cash2', 'Efectivo al balance intermedio', ro ? ro.cash : 0, '#,##0.000', 'mdp', 'Balance intermedio'],
    ['t2', 't2: años del balance a la fecha de valuación', ro ? ro.t2 : 0, '0.000000', 'años', 'DAYS360 / 360 a ' + isoToText(A.valuationDate ?? '')],
    ['shares', 'Acciones en circulación', b.shares, '#,##0.0', 'millones', 'Hoja WACC'],
    ['price', 'Precio de mercado', b.price, '#,##0.00', 'MXN', String(ds.market.priceSource ?? '')],
    ['th', 'Umbral de recomendación', b.threshold, '0%', 'fracción', 'COMPRAR / VENDER fuera de ±umbral']
  ];
  r = 4;
  S.forEach(([k, l, v, f, u, s]) => { wsS.getCell(r, 1).value = l; const c = wsS.getCell(r, 2); c.value = v; c.numFmt = f; c.font = { color: { argb: BLUE } }; wsS.getCell(r, 3).value = u; wsS.getCell(r, 4).value = s; ref[k] = 'Supuestos!$B$' + r; r++; });
  r++;
  wsS.getCell(r, 1).value = 'Parámetros del escenario activo (informativos)'; wsS.getCell(r, 1).font = { bold: true, color: { argb: BLUE } }; r++;
  r = writeTable(wsS, tables.assumptions, r);
  widths(wsS, [48, 16, 12, 60]);

  // ---------- Inflación
  if (infl && ds.study) {
    const ws = wb.addWorksheet('Inflación', { views: [{ state: 'frozen', ySplit: 3 }] });
    title(ws, 'Inflación general anual quincenal (Banxico SP74833) y modelos de tendencia', 'Series crudas del Excel; coeficientes calculados por el motor (mínimos cuadrados).');
    headerRow(ws, 3, ['Fecha', 'Inflación (%)', 'x (ventana larga)']);
    ds.study.inflation.series.forEach((s, i) => { ws.getCell(4 + i, 1).value = s[0]; ws.getCell(4 + i, 2).value = s[1]; ws.getCell(4 + i, 2).numFmt = '0.00'; if (i + 1 >= infl.longStartIndex) ws.getCell(4 + i, 3).value = i + 2 - infl.longStartIndex; });
    const c0 = 5; // tabla de modelos a la derecha de la serie
    let rm = 3;
    rm = writeTableAt(ws, tables.inflModels, rm, c0);
    ws.getCell(rm, c0).value = 'Escenarios de inflación'; ws.getCell(rm, c0).font = { bold: true, color: { argb: BLUE } }; rm++;
    headerRow2(ws, rm, c0, ['Escenario', 'Inflación', 'Por qué']); rm++;
    scen.forEach(s => { ws.getCell(rm, c0).value = s.label; ws.getCell(rm, c0 + 1).value = s.params.inflationRate; ws.getCell(rm, c0 + 1).numFmt = '0.00%'; ws.getCell(rm, c0 + 2).value = ds.study!.inflation.why?.[s.key] ?? ''; rm++; });
    rm++;
    rm += img(ws, 'inflSeries', c0 - 1, rm, 560); rm += img(ws, 'inflModels', c0 - 1, rm, 560);
    widths(ws, [12, 13, 14, 2, 52, 8, 11, 11, 10, 11, 11, 11, 10, 11]);
  }
  // ---------- Inflación vs precio
  if (monthly) {
    const ws = wb.addWorksheet('Inflación vs precio', { views: [{ state: 'frozen', ySplit: 3 }] });
    title(ws, 'Inflación frente al precio de Soriana B (mensual)', 'Inflación = promedio de las quincenas del mes; precio = último cierre semanal del mes.');
    headerRow(ws, 3, ['Mes', 'Inflación (%)', 'Precio (MXN)', 'Rendimiento mensual', 'Cambio de inflación (pp)']);
    monthly.months.forEach((m, i) => { const row = 4 + i; ws.getCell(row, 1).value = m.month.slice(0, 7); [m.infl, m.price, m.ret, m.dInfl].forEach((v, j) => { const c = ws.getCell(row, j + 2); c.value = v; c.numFmt = j === 2 ? '0.00%' : j === 1 ? '0.00' : '0.000'; }); });
    let rm = writeTableAt(ws, tables.inflPrice, 3, 7);
    rm = writeTableAt(ws, tables.moves, rm, 7);
    rm += img(ws, 'inflPrice', 6, rm, 560); img(ws, 'priceVsInfl', 6, rm, 560);
    widths(ws, [10, 13, 13, 16, 18, 2, 52, 26, 10, 10, 18]);
  }
  // ---------- Precio e IPC
  if (prices) {
    const ws = wb.addWorksheet('Precio e IPC', { views: [{ state: 'frozen', ySplit: 3 }] });
    title(ws, 'Precio semanal de Soriana B y del S&P/BMV IPC', 'Investing.com; x = número de semana.');
    headerRow(ws, 3, ['x', 'Fecha', 'Soriana B (MXN)', 'IPC (puntos)', 'Rend. Soriana', 'Rend. IPC', 'Soriana base 100', 'IPC base 100']);
    prices.weeks.forEach((w, i) => { const row = 4 + i; ws.getCell(row, 1).value = i + 1; ws.getCell(row, 2).value = w.date; [w.soriana, w.ipc, w.retS, w.retI, prices.base100[i].soriana, prices.base100[i].ipc].forEach((v, j) => { const c = ws.getCell(row, j + 3); c.value = v; c.numFmt = j === 2 || j === 3 ? '0.00%' : '#,##0.00'; }); });
    let rm = writeTableAt(ws, tables.trends, 3, 10); rm = writeTableAt(ws, tables.returns, rm, 10);
    rm += img(ws, 'base100', 9, rm, 560); img(ws, 'trend_soriana_exp', 9, rm, 560);
    widths(ws, [6, 11, 14, 13, 12, 12, 14, 13, 2, 16, 30, 9, 30, 9, 12, 14]);
  }
  // ---------- Beta
  if (beta) {
    const ws = wb.addWorksheet('Beta', { views: [{ state: 'frozen', ySplit: 3 }] });
    title(ws, 'Beta por regresión: rendimientos semanales de Soriana B (y) contra el IPC (x)', 'Últimos ' + beta.window + ' pares válidos; tabla completa de regresión calculada por el motor. Columnas D y E: fórmulas de Excel para comprobar.');
    headerRow(ws, 3, ['Semana', 'Rend. Soriana (y)', 'Rend. IPC (x)']);
    beta.pairs.y.forEach((y, i) => { ws.getCell(4 + i, 1).value = beta.pairs.dates[i]; ws.getCell(4 + i, 2).value = y; ws.getCell(4 + i, 3).value = beta.pairs.x[i]; ws.getCell(4 + i, 2).numFmt = '0.00%'; ws.getCell(4 + i, 3).numFmt = '0.00%'; });
    const n = beta.pairs.y.length, yr = 'B4:B' + (3 + n), xr = 'C4:C' + (3 + n);
    ws.getCell('E3').value = 'Comprobación en Excel'; ws.getCell('E3').font = { bold: true, color: { argb: BLUE } };
    ([['Beta = PENDIENTE(y, x)', 'SLOPE(' + yr + ',' + xr + ')'], ['R² = COEFICIENTE.R2', 'RSQ(' + yr + ',' + xr + ')'], ['Error típico de la beta', 'STEYX(' + yr + ',' + xr + ')/SQRT(DEVSQ(' + xr + '))'], ['Observaciones', 'COUNT(' + yr + ')']] as [string, string][])
      .forEach(([l, f], i) => { ws.getCell(4 + i, 5).value = l; const c = ws.getCell(4 + i, 6); c.value = { formula: f }; c.numFmt = i === 3 ? '0' : '0.000000'; });
    let rm = writeTableAt(ws, tables.beta, 10, 5);
    ws.getCell(rm, 5).value = 'Escenarios de beta (± un error típico)'; ws.getCell(rm, 5).font = { bold: true, color: { argb: BLUE } }; rm++;
    headerRow2(ws, rm, 5, ['Escenario', 'Beta apalancada', 'Desplazamiento (errores típicos)']); rm++;
    scen.forEach(s => { ws.getCell(rm, 5).value = s.label; ws.getCell(rm, 6).value = s.params.betaLevered; ws.getCell(rm, 6).numFmt = '0.0000'; ws.getCell(rm, 7).value = ds.study?.scenarios.betaShiftSE[s.key] ?? 0; rm++; });
    img(ws, 'beta', 4, rm + 1, 560);
    widths(ws, [12, 16, 14, 2, 48, 18, 26]);
  }
  // ---------- WACC
  {
    const ws = wb.addWorksheet('WACC', { views: [{ state: 'frozen', ySplit: 2 }] });
    title(ws, 'WACC paso a paso y su iteración');
    let rm = writeTable(ws, tables.wacc, 3); rm = writeTable(ws, tables.waccIter, rm);
    (R.texts?.wacc ?? []).forEach(t => { ws.getCell(rm, 1).value = t; ws.getCell(rm, 1).alignment = { wrapText: true }; ws.mergeCells(rm, 1, rm, 4); ws.getRow(rm).height = 30; rm++; });
    img(ws, 'iter', 0, rm + 1, 520);
    widths(ws, [46, 16, 16, 50, 12, 12, 12]);
  }
  // ---------- Proyección FCFF (fórmulas vivas)
  {
    const ws = wb.addWorksheet('Proyección FCFF', { views: [{ state: 'frozen', xSplit: 1, ySplit: 3 }] });
    title(ws, 'Proyección FCFF y valuación con fórmulas', 'Filas con fondo azul claro: datos de la proyección por drivers (motor). Lo demás son fórmulas que leen la hoja Supuestos.');
    const R0 = b.rows, n = R0.length, col = (i: number) => String.fromCharCode(66 + i); // B..F
    headerRow(ws, 3, ['Concepto', ...R0.map(x => x.year)]);
    const input = (row: number, label: string, vals: number[], f = '#,##0.0') => { ws.getCell(row, 1).value = label; vals.forEach((v, i) => { const c = ws.getCell(row, i + 2); c.value = v; c.numFmt = f; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT } }; }); };
    const formula = (row: number, label: string, fn: (c: string, i: number) => string, f = '#,##0.0', bold = false) => { ws.getCell(row, 1).value = label; for (let i = 0; i < n; i++) { const c = ws.getCell(row, i + 2); c.value = { formula: fn(col(i), i) }; c.numFmt = f; if (bold) c.font = { bold: true }; } if (bold) ws.getCell(row, 1).font = { bold: true }; };
    input(4, 'Ventas', R0.map(x => x.revenue)); input(5, 'Utilidad de operación (EBIT)', R0.map(x => x.ebit)); input(6, 'Tasa de impuestos sobre EBIT', R0.map(x => x.taxRate), '0.00%');
    formula(7, '(−) Impuestos sobre EBIT', c => c + '5*' + c + '6'); formula(8, 'NOPAT', c => c + '5-' + c + '7', '#,##0.0', true);
    input(9, '(+) Depreciación y amortización', R0.map(x => x.da)); input(10, '(−) Capex', R0.map(x => x.capex)); input(11, '(−) Inversión en capital de trabajo', R0.map(x => x.dNwc));
    formula(12, 'FCF', c => c + '8+' + c + '9-' + c + '10-' + c + '11', '#,##0.0', true);
    input(13, 'Periodo n', R0.map((_, i) => i + 1), '0');
    formula(14, 'Factor de descuento 1/(1+WACC)^n', c => '1/(1+' + ref.wacc + ')^' + c + '13', '0.0000'); formula(15, 'Valor presente del FCF', c => c + '12*' + c + '14');
    input(16, 'EBITDA', R0.map(x => x.ebitda));
    const L = col(n - 1), V = (row: number, label: string, f: string, fmt = '#,##0.0', bold = false) => { ws.getCell(row, 1).value = label; const c = ws.getCell(row, 2); c.value = { formula: f }; c.numFmt = fmt; if (bold) { c.font = { bold: true }; ws.getCell(row, 1).font = { bold: true }; } };
    ws.getCell(18, 1).value = 'Valuación'; ws.getCell(18, 1).font = { bold: true, color: { argb: BLUE } };
    V(19, 'Suma VP de los FCF', 'SUM(B15:' + L + '15)');
    V(20, 'Valor terminal Gordon = FCF × (1+g)/(WACC − g)', L + '12*(1+' + ref.g + ')/(' + ref.wacc + '-' + ref.g + ')'); V(21, 'VP valor terminal Gordon', 'B20*' + L + '14'); V(22, 'EV Gordon', 'B19+B21');
    V(23, 'Valor terminal múltiplo = EBITDA × múltiplo', L + '16*' + ref.mult); V(24, 'VP valor terminal múltiplo', 'B23*' + L + '14'); V(25, 'EV múltiplo', 'B19+B24');
    V(26, 'EV ponderado al cierre', ref.wG + '*B22+(1-' + ref.wG + ')*B25', '#,##0.0', true);
    V(27, 'EV llevado al balance intermedio = EV × (1+WACC)^t1', 'B26*(1+' + ref.wacc + ')^' + ref.t1); V(28, 'EV al balance intermedio (+ ajuste FCF del periodo)', 'B27+' + ref.fcfGen);
    V(29, 'Equity al balance intermedio = EV − deuda − arrendamiento + efectivo', 'B28-' + ref.debt2 + '-' + ref.lease2 + '+' + ref.cash2);
    V(30, 'Equity a la fecha de valuación = × (1+Ke)^t2', 'B29*(1+' + ref.ke + ')^' + ref.t2, '#,##0.0', true);
    V(31, 'Valor por acción (MXN)', 'B30/' + ref.shares, '#,##0.00', true); V(32, 'Precio de mercado (MXN)', ref.price, '#,##0.00');
    V(33, 'Diferencia (%)', 'B31/B32-1', '0.0%'); V(34, 'Recomendación', 'IF(ABS(B33)<=' + ref.th + ',"MANTENER",IF(B33>0,"COMPRAR","VENDER"))', '@', true);
    ws.getCell(35, 1).value = 'Valor por acción calculado por la app (para comparar)'; ws.getCell(35, 2).value = b.value; ws.getCell(35, 2).numFmt = '#,##0.00';
    ws.getCell(36, 1).value = 'Diferencia fórmula − app (MXN)'; ws.getCell(36, 2).value = { formula: 'B31-B35' }; ws.getCell(36, 2).numFmt = '0.000000';
    if (!b.roll) { ['B27', 'B28', 'B29'].forEach(a => { ws.getCell(a).value = null; }); ws.getCell('B30').value = { formula: 'B26-' + ref.debt + '-' + ref.lease + '+' + ref.cash }; }
    widths(ws, [58, 14, 14, 14, 14, 14]);
    let rm = 39; rm += img(ws, 'fcf', 0, rm, 560); img(ws, 'bridge', 0, rm, 640);
  }
  // ---------- Escenarios
  {
    const ws = wb.addWorksheet('Escenarios', { views: [{ state: 'frozen', xSplit: 1, ySplit: 2 }] });
    title(ws, 'Escenarios: cada uno corre el DCF completo con WACC iterado');
    let rm = writeTable(ws, tables.scen, 3); rm = writeTable(ws, tables.tornado, rm);
    rm += img(ws, 'scenPrice', 0, rm, 520); img(ws, 'tornado', 0, rm, 560);
    widths(ws, [52, 16, 16, 16, 14, 14]);
  }
  // ---------- Sensibilidad
  {
    const ws = wb.addWorksheet('Sensibilidad');
    title(ws, 'Sensibilidad del valor por acción', 'Valores calculados por el motor (flujos y Ke fijos, como la tabla del Excel); no son fórmulas.');
    let rm = writeTable(ws, tables.sens, 3);
    (R.texts?.sensitivity ?? []).forEach(t => { ws.getCell(rm, 1).value = t; rm++; });
    rm++; rm += img(ws, 'priceWacc', 0, rm, 520); rm += img(ws, 'gEv', 0, rm, 520); img(ws, 'inflValue', 0, rm, 520);
    widths(ws, [16, 12, 12, 12, 12, 12]);
  }
  // ---------- Validación
  {
    const ws = wb.addWorksheet('Validación', { views: [{ state: 'frozen', ySplit: 2 }] });
    title(ws, 'Validación: valor vs precio, comprobaciones de fórmulas y app vs Excel');
    let rm = writeTable(ws, tables.valueVsPrice, 3); rm = writeTable(ws, tables.checks, rm); rm = writeTable(ws, tables.parity, rm);
    ws.getCell(rm, 1).value = 'Notas (para explicar diferencias)'; ws.getCell(rm, 1).font = { bold: true }; ws.getCell(rm, 2).value = B.isDefault ? 'Sin diferencias fuera de tolerancia.' : 'Supuestos modificados en el Laboratorio: la comparación aplica solo con los supuestos del Excel.';
    rm += 2;
    (R.texts?.reasons ?? []).forEach(t => { ws.getCell(rm, 1).value = '• ' + t; rm++; });
    widths(ws, [62, 16, 16, 16, 14, 12]);
  }
  // ---------- Conclusiones
  if (R.texts) {
    const ws = wb.addWorksheet('Conclusiones');
    title(ws, 'Conclusiones y preguntas de análisis (cifras vivas)');
    let rm = 3;
    const write = (a: string, z: string) => { ws.getCell(rm, 1).value = a; ws.getCell(rm, 1).font = { bold: true, color: { argb: BLUE } }; ws.getCell(rm, 1).alignment = { wrapText: true, vertical: 'top' }; ws.getCell(rm, 2).value = z; ws.getCell(rm, 2).alignment = { wrapText: true, vertical: 'top' }; ws.getRow(rm).height = Math.max(30, Math.ceil(z.length / 95) * 15); rm++; };
    R.texts.conclusions.forEach(([a, z]) => write(a, z));
    rm++; ws.getCell(rm, 1).value = 'Riesgos y limitaciones'; ws.getCell(rm, 1).font = { bold: true }; rm++;
    R.texts.limits.forEach(z => write('', z));
    rm++; ws.getCell(rm, 1).value = 'Preguntas de análisis'; ws.getCell(rm, 1).font = { bold: true }; rm++;
    R.texts.questions.forEach(([a, z]) => write(a, z));
    widths(ws, [42, 110]);
  }
  // ---------- Fuentes
  {
    const ws = wb.addWorksheet('Fuentes');
    title(ws, 'Fuentes y trazabilidad', FOOTER);
    headerRow(ws, 3, ['Fuente', 'Documento', 'Uso']);
    let rm = 4; (ds.sources || []).forEach(s => { s.forEach((v, j) => { ws.getCell(rm, j + 1).value = v; }); rm++; });
    rm++;
    ([['Motor', 'ValuFlow (src/engine): proyección por drivers, WACC iterado, Gordon y múltiplo, puente, escenarios, regresión de la beta y modelos de inflación'], ['Dataset', 'src/data/soriana.final.ts, generado desde SORIANA_FINAL.xlsx con scripts/build-dataset.py (openpyxl)'], ['Generado', R.meta.generated], ['Autor', AUTHOR.name + ' · ' + AUTHOR.id]] as [string, string][])
      .forEach(([k, v]) => { ws.getCell(rm, 1).value = k; ws.getCell(rm, 1).font = { bold: true }; ws.getCell(rm, 2).value = v; rm++; });
    widths(ws, [32, 70, 70]);
  }
  wb.eachSheet(ws => { ws.headerFooter.oddFooter = '&L' + FOOTER + '&RPágina &P de &N'; ws.pageSetup = { paperSize: 1 as unknown as ExcelJS.PaperSize, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.6, right: 0.6, top: 0.7, bottom: 0.7, header: 0.3, footer: 0.3 } }; });
  const buf = await wb.xlsx.writeBuffer();
  return new Uint8Array(buf as ArrayBuffer);
}

function headerRow2(ws: ExcelJS.Worksheet, r: number, c0: number, vals: string[]) {
  vals.forEach((v, i) => { const c = ws.getCell(r, c0 + i); c.value = v; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLUE } }; c.alignment = { wrapText: true, vertical: 'middle' }; });
}
function writeTableAt(ws: ExcelJS.Worksheet, t: RTable | undefined, r: number, c0: number): number {
  if (!t) return r;
  ws.getCell(r, c0).value = (t.n ? 'Tabla ' + t.n + '. ' : '') + t.title; ws.getCell(r, c0).font = { bold: true, color: { argb: BLUE } }; r++;
  headerRow2(ws, r, c0, t.head); r++;
  t.rows.forEach(row => { row.forEach((v, j) => put(ws.getCell(r, c0 + j), v)); r++; });
  if (t.note) { ws.getCell(r, c0).value = t.note; ws.getCell(r, c0).font = { size: 9 }; r++; }
  ws.getCell(r, c0).value = t.source; ws.getCell(r, c0).font = { italic: true, size: 9, color: { argb: GRAY } };
  return r + 2;
}

/** CSV por tabla: UTF-8 con BOM, separador coma, punto decimal y números sin formato. */
export function tableCsv(t: RTable): string {
  const q = (s: string) => /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  const val = (c: Cell) => c == null ? '' : typeof c === 'string' ? q(c) : c.v == null ? '' : String(c.v);
  return '﻿' + [t.head.map(q).join(',')].concat(t.rows.map(r => r.map(val).join(','))).join('\r\n') + '\r\n';
}
export { cellText };
