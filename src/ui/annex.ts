// Anexos (segunda capa): definición del índice y construcción de las tablas.
import * as E from '../engine';
import { fmt as f, labelsOf, type Dataset, type RunOk } from '../engine';
import { projectedTable } from './relative';
import type { Calc } from './viewmodel';

const POS = 'var(--pos)', NEG = 'var(--neg)', ACC = 'var(--color-accent)';

/** [id, código, título] de cada anexo. Las empresas con anexo de Excel muestran más tablas. */
export function annexDefs(ds: Dataset): [string, string, string][] {
  const L: [string, string, string][] = [];
  if (ds.annex) {
    L.push(['est', 'A1', 'Estados financieros trimestrales'], ['rat', 'A2', 'Razones financieras'], ['proj', 'A3', 'Proyección de estados financieros']);
    L.push(['dcf', 'A4', 'Flujo libre y DCF']);
    if (ds.forecast.build) L.push(['pond', '', 'Variables externas y ponderación']);
    L.push(['wacc', '', 'WACC e iteración'], ['sens', '', ds.forecast.build ? 'Sensibilidad (recalculada)' : 'Sensibilidad (' + labelsOf(ds).sourceShort + ')']);
    L.push(['empresa', '', 'Empresa'], ['valid', '', 'Validación'], ['method', '', 'Metodología y fuentes']);
  } else {
    L.push(['imp', '', 'Datos importados'], ['dcf', '', 'Flujo libre y DCF'], ['wacc', '', 'WACC e iteración'], ['empresa', '', 'Empresa'], ['valid', '', 'Validación'], ['method', '', 'Metodología y fuentes']);
  }
  // Numeración consecutiva (A1, A2…) según los anexos que realmente existen.
  return L.map((d, i) => [d[0], 'A' + (i + 1), d[2]]);
}

export function annexTables(c: Calc, which: string): any[] {
  const ds = c.ds, b = c.view as RunOk, T: any[] = [], L = labelsOf(ds), src = L.sourceShort;
  const code = (id: string) => (annexDefs(ds).find(d => d[0] === id) || [])[1] || '';
  const cell = (t: unknown, o?: object) => ({ t: t == null ? '—' : t, align: 'right', ws: 'nowrap', mw: 'auto', bg: 'transparent', color: 'var(--color-text)', ...(o || {}) });
  const txt = (t: unknown, mw?: string) => cell(t, { align: 'left', ws: 'normal', mw: mw || '140px' });
  const row = (label: string, cells: any[], o?: object) => ({ label, cells, fw: 400, lc: 'var(--color-text)', fs: '13px', ls: 'normal', tt: 'none', ...(o || {}) });
  const sec = (label: string, n: number) => row(label, Array(n).fill(cell('')), { fw: 600, lc: 'var(--color-accent-700)', fs: '11px', ls: '.1em', tt: 'uppercase' });
  const head = (cols: string[], estFrom?: number | null, alignLeftUntil?: number | null) => cols.map((t, i) => ({ t, bg: estFrom != null && i >= estFrom ? 'var(--color-accent-100)' : 'var(--color-bg)', align: alignLeftUntil != null && i < alignLeftUntil ? 'left' : 'right' }));
  const estBg = (i: number, from?: number | null) => from != null && i >= from ? { bg: 'color-mix(in srgb, var(--color-accent-100) 55%, transparent)' } : {};
  const mm = (v: unknown) => v == null ? '—' : f.m(v, 1);
  const tb = (id: string, cd: string, title: string, question: string, source: string, unit: string, cols: any[], rows: any[], o?: { minW?: string; note?: string }) =>
    T.push({ id, code: cd, title, question, source, unit, head: cols, rows, minW: (o && o.minW) || '720px', note: (o && o.note) || '', hasNote: !!(o && o.note) });
  const want = (id: string) => which === 'all' || which === id;
  if (ds.annex) {
    const S = ds.annex.statements;
    const fyCol = S.cols.length - 1;
    if (want('est')) tb('est', code('est'), 'Estados financieros trimestrales', 'Datos históricos de entrada: resultados, flujo y balance.', src + ' · Estados financieros', ds.profile.units || '', head(S.cols), S.rows.map(r => row(r[0] as string, r.slice(1).map((v, i) => cell(mm(v), i === fyCol ? { bg: 'var(--color-neutral-100)' } : {})))), { note: 'FY = suma de trimestres para flujos y saldo de cierre para balance. Deuda total incluye arrendamientos.' });
    if (want('rat') && ds.ratios && ds.quarterly) {
      const P = ds.quarterly.periods as string[], rows: any[] = []; let cat: string | null = null;
      ds.ratios.forEach(r => { if (r.cat !== cat) { cat = r.cat; rows.push(sec(cat, P.length + 2)); } const fm = (v: number) => r.unit === 'x' ? v.toFixed(2) + 'x' : r.unit === '%' ? v.toFixed(2) + '%' : v.toFixed(1); rows.push(row(r.name, r.v.map(v => cell(fm(v))).concat([cell(fm(r.avg), { bg: 'var(--color-neutral-100)' }), txt(r.read, '260px')]))); });
      tb('rat', code('rat'), 'Razones financieras', 'Liquidez, apalancamiento, eficiencia y rentabilidad (trimestral).', src + ' · Razones financieras', 'x · % · días', head(P.concat(['Prom. ' + P.length + 'T', 'Lectura']), null, null).map((h, i) => i === P.length + 1 ? { ...h, align: 'left' } : h), rows, { minW: '980px' });
    }
    const live = want('proj') && b.ok ? projectedTable(ds, b, code('proj')) : null;
    if (live) T.push(live);
    else if (want('proj')) { const Pj = ds.annex.projected; tb('proj', code('proj'), 'Proyección de estados financieros', 'Estado de resultados y balance proyectados con los supuestos finales.', src + ' · Proyección final', ds.profile.units || '', head(Pj.cols, 1), Pj.rows.map(r => 'section' in r ? sec(r.section, Pj.cols.length) : row(r[0] as string, r.slice(1).map((v, i) => cell(mm(v), estBg(i, 1))), /Utilidad neta|EBIT\)|Activo total|Pasivo total/.test(r[0] as string) ? { fw: 600 } : {}))); }
  }
  if (ds.imported && want('imp')) tb('imp', code('imp'), 'Datos importados', 'Campos normalizados tal como se confirmaron en la revisión.', ds.source.file || 'Archivo', ds.profile.currency + ' ' + ds.profile.units, head(['Valor', 'Periodo', 'Campo de origen', 'Hoja', 'Confianza'], null, 0).map((h, i) => i === 0 ? { ...h, align: 'right' } : { ...h, align: 'left' }), ds.imported.map(x => row(x.label, [cell(x.value == null ? 'No disponible' : f.m(x.value, 1)), txt(x.period || '—', '90px'), txt(x.srcLabel || '—', '200px'), txt(x.srcSheet || '—', '120px'), txt(x.conf || '—', '80px')])));
  if (want('dcf') && b.ok) {
    const yrs = [ds.forecast.baseYear].concat(b.rows.map(r => r.year)), B = ds.forecast.base, R = b.rows as any[];
    const line = (l: string, a0: number | null | undefined, k: string | ((r: any) => number), fm: (v: any) => string, o?: object) => row(l, [cell(a0 == null ? '' : fm(a0))].concat(R.map((r, i) => cell(fm(typeof k === 'function' ? k(r) : r[k]), estBg(i, 0)))), o);
    tb('dcf', code('dcf'), 'Flujo libre de efectivo', 'Calculado en vivo por el motor con los supuestos activos.', 'Motor ValuFlow · drivers del ' + (ds.annex ? src : 'archivo'), ds.profile.units || '', head(yrs, 1), [
      line('Ventas', B.revenue, 'revenue', mm, { fw: 600 }), line('Crecimiento', null, 'growth', v => f.p(v)), line('Utilidad de operación (EBIT)', B.ebit, 'ebit', mm), line('Margen EBIT', B.ebit != null && B.revenue ? B.ebit / B.revenue : null, 'margin', v => f.p(v)),
      line('(−) Impuestos sobre EBIT', null, r => -r.tax, mm), line('Tasa de impuestos', null, 'taxRate', v => f.p(v)), line('NOPAT', null, 'nopat', mm, { fw: 600 }),
      line('(+) Depreciación y amortización', B.da, 'da', mm), line('(−) Capex', B.capex != null ? -B.capex : null, r => -r.capex, mm), line('(−) Inversión en capital de trabajo', null, r => -r.dNwc, mm),
      line('FCF', B.fcf, 'fcf', mm, { fw: 700 }), line('Factor de descuento', null, 'df', v => v.toFixed(4)), line('Valor presente del FCF', null, 'pv', mm, { fw: 600 })
    ], { note: 'WACC ' + f.p(b.wacc) + ' · g ' + f.p(b.g) + '. Los drivers (crecimiento, margen, tasa, D&A, capex y capital de trabajo) se derivan de las filas de la proyección fuente.' });
    const last = R[R.length - 1].year;
    const V: [string, number | null, number?][] = [['VPN de los FCF', b.pvSum], ['FCF ' + last + ' × (1 + g)', b.fcfN1], ['Valor terminal (Gordon)', b.tvG], ['VP del valor terminal (Gordon)', b.pvTvG], ['EV · Gordon', b.evG, 1]];
    if (b.mult) V.push(['EBITDA ' + last + ' × ' + f.x(b.mult), b.tvM], ['VP del valor terminal (múltiplo)', b.pvTvM], ['EV · múltiplos', b.evM, 1], ['EV ponderado (' + Math.round(b.wG * 100) + '% Gordon)', b.evW, 1]);
    const br = ds.valuation.bridge;
    V.push(['(−) Deuda bursátil y bancaria', -br.debt], ['(−) Pasivo por arrendamiento', -br.lease], ['(+) Efectivo', br.cash], ['Equity Value al cierre', b.eqClose, 1]);
    if (b.roll) V.push(['EV capitalizado × (1+WACC)^' + b.roll.t1, b.roll.evCap], ['(−) FCF ' + L.rollFcf + ' (fue ' + f.m(-b.roll.fcfGenerated, 1) + '; restarlo suma)', b.roll.fcfGenerated], ['EV al ' + L.rollDate, b.roll.ev2, 1], ['(−) Deuda ' + L.rollDate, -b.roll.debt], ['(−) Arrendamiento ' + L.rollDate, -b.roll.lease], ['(+) Efectivo ' + L.rollDate, b.roll.cash], ['Equity al ' + L.rollDate, b.roll.eq2, 1], ['× (1+Ke)^' + b.roll.t2 + ' → Equity a la fecha de valuación', b.roll.eq3, 1]);
    V.push(['Acciones en circulación (mm)', b.shares]);
    tb('dcf', '', 'Del flujo al valor por acción', 'Puente completo de valuación.', 'Motor ValuFlow', ds.profile.units || '', head(['Valor']), V.map(v => row(v[0], [cell(f.m(v[1], 1))], v[2] ? { fw: 700 } : {})).concat([row('Valor intrínseco por acción', [cell(f.cur(b.value), { color: ACC })], { fw: 700 })]), { minW: '420px' });
  }
  const BS = ds.forecast.build;
  if (BS && want('pond') && b.ok && b.drivers.build) {
    const Y = ds.forecast.years, n = Y.length, pr = (a: number[]) => a.map(v => cell(f.p(v)));
    const by = b.drivers.build.years, lv = (k: keyof E.BuildYear) => by.map(y => y[k] as number);
    tb('pond', code('pond'), 'Variables externas y ponderación de métodos', 'Cómo se combinan las variables externas y los mínimos cuadrados en cada año (escenario activo).', src + ' · Proyección Final Soriana', '%', head(Y, 0), [
      row('Peso de variables externas', pr(BS.weightsExternal)), row('Peso de mínimos cuadrados', pr(BS.weightsExternal.map(v => 1 - v))),
      sec('Crecimiento de ventas', n), row('Inflación', pr(lv('inflation'))), row('Crecimiento del mercado (inflación + PIB × elasticidad + consumo)', pr(lv('marketGrowth'))),
      ...BS.sales.adjustments.map(a => row(a.label.replace(/^\(más o menos \) ?/, ''), pr(a.values))),
      row('Ajuste del escenario', pr(Array(n).fill(c.VA.salesAdj ?? 0))), row('Variables externas', pr(lv('growthExternal'))), row('Mínimos cuadrados', pr(lv('growthLS'))), row('Final (ponderado)', pr(lv('growth')), { fw: 700 }),
      sec('Margen EBIT', n), ...BS.margin.adjustments.map(a => row(a.label.replace(/^\(más o menos \) ?/, ''), pr(a.values))), row('Variables externas', pr(lv('marginExternal'))), row('Mínimos cuadrados', pr(BS.margin.ls)), row('Ajuste del escenario', pr(Array(n).fill(c.VA.marginAdj ?? 0))), row('Final (ponderado)', pr(lv('margin')), { fw: 700 }),
      sec('Otros supuestos finales', n), row('Capex (% ventas)', pr(lv('capexPct'))), row('D&A (% ventas)', pr(lv('daPct'))), row('Tasa de impuestos', pr(lv('taxRate')))
    ], { minW: '980px' });
  }
  if (want('wacc') && b.ok) {
    const W = b.W, mk = W.market, it: any = W.iterated || {};
    const r2 = (l: string, a: string, z: string, o?: object) => row(l, [cell(a), cell(z)], o);
    tb('wacc', code('wacc'), 'WACC · mercado vs. iterado', 'Componentes del costo de capital en ambos enfoques.', ds.annex ? src + ' · WACC e iteración' : 'Motor ValuFlow', '% · ' + (ds.profile.units || ''), head(['Valor de mercado', 'Iterado al DCF']), [
      r2('Tasa libre de riesgo (Rf)', f.p(W.rf), f.p(W.rf)), r2('Prima de riesgo de mercado', f.p(W.prm), f.p(W.prm)), r2('Beta desapalancada (βU)', W.betaU.toFixed(2), W.betaU.toFixed(2)),
      r2('Deuda (D)', f.m(mk.D, 1), f.m(it.D, 1)), r2('Capital (E)', f.m(mk.E, 1) + ' · mercado', f.m(it.E, 1) + ' · DCF'), r2('D / E', f.x(mk.de, 3), f.x(it.de, 3)), r2('Beta apalancada βL', mk.beta.toFixed(4), it.beta != null ? it.beta.toFixed(4) : '—'),
      r2('Ke = Rf + βL × PRM', f.p(mk.ke), f.p(it.ke)), r2('Kd antes de impuestos', f.p(mk.kd), f.p(it.kd)), r2('Tasa fiscal', f.p(mk.tax), f.p(it.tax)), r2('Kd después de impuestos', f.p(mk.kdAT), f.p(it.kdAT)),
      r2('E / (D + E)', f.p(mk.wE), f.p(it.wE)), r2('D / (D + E)', f.p(mk.wD), f.p(it.wD)), r2('WACC', f.p(mk.wacc), f.p(it.wacc), { fw: 700 })
    ], { minW: '520px', note: 'Activo en el modelo: ' + (W.mode === 'iterated' ? 'WACC iterado' : W.mode === 'market' ? 'WACC de mercado' : 'WACC manual (' + f.p(b.wacc) + ')') + '.' });
    tb('wacc', '', 'Iteraciones', 'El equity del DCF alimenta D/E hasta converger.', 'Motor ValuFlow', '%', head(['WACC entrada', 'Equity DCF', 'D / E', 'Beta', 'Ke', 'WACC salida']), W.iters.map(i => row('Iteración ' + i.k, [cell(f.p(i.win)), cell(f.m(i.E, 1)), cell(i.de.toFixed(4)), cell(i.beta.toFixed(4)), cell(f.p(i.ke)), cell(f.p(i.wout), { color: ACC })])), { minW: '640px' });
  }
  if (want('method') && ds.inputs && ds.inputs.length) tb('method', '', 'Registro de insumos y fuentes', 'Cada insumo del modelo con su origen. Tipo: Observado · Supuesto · Modelo · Pendiente (input heredado sin fuente verificada).', src + ' · hoja Fuentes', '', head(['Dónde se usa', 'Valor', 'Fecha', 'Unidad', 'Tipo', 'Fuente'], null, 6), ds.inputs.map(r => row(r[0], [txt(r[1], '170px'), txt(r[2], '90px'), txt(r[3], '90px'), txt(r[4], '80px'), cell(r[5], { align: 'left', ws: 'normal', mw: '80px', color: r[5] === 'Pendiente' ? 'var(--warn)' : 'var(--color-text)' }), txt(r[6], '380px')])), { minW: '1300px' });
  if (want('method') && ds.notes && ds.notes.length) tb('method', '', 'Notas metodológicas', 'DCF principal, referencia de Capital IQ y métodos relativos.', src + ' · hoja Fuentes', '', head(['Nota'], null, 1), ds.notes.map((n, i) => row(String(i + 1), [txt(n, '760px')])), { minW: '860px' });
  // Con proyección por drivers, las tablas se recalculan con el motor (la versión estática sería de otro escenario).
  const sensT = ds.forecast.build && b.ok ? E.sensTables(ds, c.VA, b) : null;
  if (ds.annex && want('sens') && sensT) sensT.forEach((s, k) => tb('sens', k === 0 ? code('sens') : '', s.label, s.rowsLabel + ' (filas) vs. ' + s.colsLabel + ' (columnas) · precio por acción', 'Motor ValuFlow · supuestos activos', ds.profile.currency + ' por acción', head(s.cols), s.grid.map((r, i) => row(s.rowsLabel + ' ' + s.rowHeads[i], r.map((v, j) => cell(f.cur(v), i === 2 && j === 2 ? { bg: 'var(--color-accent-200)', color: 'var(--color-accent-800)' } : { bg: v >= (ds.market.price as number) ? 'color-mix(in srgb, var(--pos) 14%, transparent)' : 'color-mix(in srgb, var(--neg) 10%, transparent)' })))), { minW: '560px', note: 'Pasos: WACC y g ±0.5 pp (como la tabla del Excel) y múltiplo ±0.5x. Flujos y Ke fijos en los del caso activo.' }));
  return T;
}
