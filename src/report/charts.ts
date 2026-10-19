// Catálogo de gráficas de los reportes. Cada gráfica se dibuja con las mismas funciones SVG de la app
// (src/charts/svg.ts) a partir de la instantánea viva: con supuestos modificados, las gráficas cambian igual que la pantalla.
import * as E from '../engine';
import { PAL, barChart, footballChart, hbarChart, tornadoChart, waterfallChart, xyChart, type Svg } from '../charts/svg';
import type { Snapshot } from './snapshot';

export interface ChartDef { id: string; title: string; source: string; svg: Svg; wide?: boolean }

const nf = (d: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const mxn = (v: number) => nf(2).format(v), mdp = (v: number) => nf(0).format(v), pct = (d: number) => (v: number) => nf(d).format(v * 100) + '%';
const num = (p: E.Price) => E.isNum(p) ? p : null;

export function chartCatalog(S: Snapshot): Record<string, ChartDef> {
  const { ds, A, b, scen, torn, grid, methods, rel, rec } = S, C: Record<string, ChartDef> = {}, L = E.labelsOf(ds), price = b.price;
  const add = (id: string, title: string, source: string, svg: Svg, wide = false) => { C[id] = { id, title, source, svg, wide }; };

  // Campo de fútbol: rango por método, precio de mercado y precio objetivo combinado.
  const comb = rel.combined && E.isNum(rel.combined.value) ? rel.combined.value : null;
  const marks = [{ x: price, label: 'Mercado ' + mxn(price), color: PAL.neg }].concat(comb != null ? [{ x: comb, label: 'Combinado ' + mxn(comb), color: PAL.accent }] : []);
  add('football', 'Campo de fútbol: valor por acción por método (MXN)', 'hojas Valuación Combinada, Escenarios y Transacciones SDC',
    footballChart({ rows: methods.filter(m => m.key !== 'combined' && (m.value != null || (m.lo != null && m.hi != null))).map(m => ({ label: m.label, lo: m.lo, hi: m.hi, value: m.value, main: m.main, ref: m.ref })), marks, fmt: mxn }), true);

  // FCFF y valor presente
  const R = b.rows;
  add('fcf', 'FCFF proyectado y su valor presente (mdp)', 'hoja Proyección Final, sección FCFF', barChart({ cats: R.map(r => r.year), series: [{ name: 'FCFF', color: PAL.accent, values: R.map(r => r.fcf) }, { name: 'Valor presente', color: PAL.accent3, values: R.map(r => r.pv) }], yFmt: mdp, valFmt: mdp }));
  add('sales', 'Ventas y margen EBIT proyectados', 'hoja Proyección Final (drivers con inflación ' + (scen.find(s => s.active)?.label ?? '') + ')', barChart({ cats: R.map(r => r.year), series: [{ name: 'Ventas (mdp)', color: PAL.accent2, values: R.map(r => r.revenue) }], subLabels: R.map(r => 'margen ' + pct(1)(r.margin)), yFmt: mdp, valFmt: mdp }));

  // Valor terminal: Gordon frente a múltiplo
  if (b.mult) add('tv', 'Valor terminal: Gordon frente a múltiplo de salida (mdp)', 'hoja Proyección Final, valor terminal', barChart({ cats: ['Gordon (g ' + pct(2)(b.g) + ')', 'Múltiplo ' + nf(2).format(b.mult) + 'x', 'Ponderado ' + Math.round(b.wG * 100) + '/' + Math.round((1 - b.wG) * 100)], series: [{ name: '', color: PAL.accent, values: [b.tvG, b.tvM, b.wG * b.tvG + (1 - b.wG) * (b.tvM as number)] }], yFmt: mdp, valFmt: mdp }));

  // Puente EV → Equity → precio
  const st: { label: string; value?: number; total?: number }[] = [{ label: 'VP de los FCFF', value: b.pvSum }, { label: 'VP del valor terminal', value: b.pvTvW }, { label: 'EV al ' + L.closeDate, total: b.evW }];
  if (b.roll) st.push({ label: 'Capitalización al ' + L.rollDate, value: b.roll.evCap - b.evW }, { label: 'FCF ' + L.rollFcf, value: b.roll.fcfGenerated }, { label: 'EV al ' + L.rollDate, total: b.roll.ev2 }, { label: 'Deuda', value: -b.roll.debt }, { label: 'Arrendamientos', value: -b.roll.lease }, { label: 'Efectivo', value: b.roll.cash }, { label: 'Equity al ' + L.rollDate, total: b.roll.eq2 }, { label: 'Capitalización a Ke', value: b.roll.eq3 - b.roll.eq2 }, { label: 'Equity a la fecha', total: b.roll.eq3 });
  else { const br = ds.valuation.bridge; st.push({ label: 'Deuda', value: -br.debt }, { label: 'Arrendamientos', value: -br.lease }, { label: 'Efectivo', value: br.cash }, { label: 'Equity Value', total: b.eqClose }); }
  add('bridge', 'Del Enterprise Value al valor por acción (mdp)', 'hoja Proyección Final, puente de valuación', waterfallChart({ steps: st, fmt: mdp, note: mdp(b.eqVal) + ' mdp ÷ ' + nf(1).format(b.shares) + ' mm de acciones = $' + mxn(b.value) + ' por acción' }), true);

  // Escenarios de inflación
  const sc = scen.filter(s => s.value != null);
  if (sc.length) add('scen', 'Valor por acción por escenario de inflación (MXN)', 'hoja Inflación y Escenarios (cada escenario re-ejecuta el modelo)', barChart({ cats: sc.map(s => s.label + (s.reference ? ' (ref.)' : '')), subLabels: sc.map(s => 'inflación ' + pct(2)(s.inflation) + (s.constant ? '' : ' (trayectoria)')), series: [{ name: '', color: PAL.accent, values: sc.map(s => s.value) }], hline: { y: price, label: 'Mercado $' + mxn(price) }, yFmt: v => nf(0).format(v), valFmt: mxn }));

  // Tornado y sensibilidad WACC × g
  add('tornado', 'Tornado: valor por acción moviendo una variable a la vez (MXN)', 'Motor ValuFlow (WACC y Ke fijos en el caso activo)', tornadoChart({ center: b.value, centerLabel: 'Caso activo $' + mxn(b.value), fmt: mxn, rows: torn.filter(t => t.low != null && t.high != null).map(t => ({ label: t.label + ' ±' + nf(t.unit === 'x' ? 1 : 2).format(t.step) + ' ' + t.unit, low: t.low as number, high: t.high as number })) }), true);
  const col = [PAL.accent3, PAL.accent2, PAL.accent, PAL.ink, PAL.gray];
  add('priceWacc', 'Valor por acción frente al WACC para cinco valores de g (MXN)', 'Motor ValuFlow · tabla WACC × g', xyChart({ xLabel: 'WACC', xFmt: v => nf(1).format(v) + '%', xTicks: grid.ws, yFmt: v => nf(0).format(v), hlines: [{ y: price, label: 'Mercado $' + mxn(price) }], series: grid.gs.map((g, j) => ({ name: 'g ' + nf(2).format(g) + '%', color: col[j], points: grid.ws.map((w, i) => [w, grid.cells[i][j]] as [number, number | null]).filter(p => p[1] != null) as [number, number][] })) }));

  // Iteración del WACC
  const it = b.W.iters;
  if (it.length) add('iter', 'Iteración del WACC: del valor de mercado al valor DCF', 'hoja WACC, iteración', xyChart({ legend: false, xLabel: 'Iteración', xTicks: [0, ...it.map((_, k) => k + 1)], xTickLabels: ['Mercado', ...it.map((_, k) => String(k + 1))], yFmt: pct(2), series: [{ name: 'WACC', color: PAL.accent, points: [[0, it[0].win] as [number, number]].concat(it.map((x, k) => [k + 1, x.wout] as [number, number])), labels: [pct(2)(it[0].win)].concat(it.map(x => pct(2)(x.wout))) }] }));

  // Transacciones LSEG/SDC: EV/EBITDA de las operaciones incluidas con la mediana
  const SD = rel.sdc;
  if (SD) {
    const inc = SD.included.filter(d => d.evEbitda != null).sort((a, z) => (z.evEbitda as number) - (a.evEbitda as number));
    const med = SD.stats.evEbitda?.median, lo = SD.stats.evEbitda?.lo, hi = SD.stats.evEbitda?.hi;
    if (inc.length) add('sdc', 'Precedent Transactions LSEG/SDC: EV/EBITDA por operación incluida (x)', 'GridExport LSEG/SDC 19-oct-2026 · hoja Transacciones SDC', hbarChart({ rows: inc.map(d => ({ label: d.target.slice(0, 34) + ' (' + d.date.slice(-4) + ')', value: d.evEbitda as number, color: med != null && lo != null && hi != null && ((d.evEbitda as number) < lo || (d.evEbitda as number) > hi) ? PAL.warn : PAL.accent })), fmt: v => nf(1).format(v) + 'x', min: 0 }), true);
  }

  // Contraste externo: cada fuente frente a su precio de referencia
  if (ds.external && ds.external.length) {
    const live: Record<string, number | null> = { team_dcf: b.value, team_comps: rel.comps ? num(rel.comps.value) : null, team_sdc: SD ? num(SD.value) : null, team_ciq_trans: rel.transactions ? num(rel.transactions.value) : null, team_combined: comb };
    const rows = ds.external.map(x => ({ label: (x.source + ' · ' + x.method).slice(0, 48), value: x.key in live ? live[x.key] : x.value, team: x.key.startsWith('team_') })).filter(r => r.value != null) as { label: string; value: number; team: boolean }[];
    add('ext', 'Contraste: equipo frente a S&P Capital IQ, LSEG Refinitiv y otros modelos (MXN por acción)', 'hoja Contraste externo · reporte CIQ/Refinitiv 19-oct-2026', hbarChart({ rows: rows.map(r => ({ label: r.label, value: r.value, color: r.team ? PAL.accent : PAL.gray })), fmt: mxn, min: 0 }), true);
  }

  // Recomendación: potencial frente a los umbrales
  if (rec && rec.target != null) add('rec', 'Precio objetivo combinado frente al mercado y bandas de recomendación (MXN)', 'hoja Transacciones SDC §7 · regla de recomendación', barChart({ cats: ['Mercado', 'DCF', 'Trading Comps', 'Objetivo combinado'], series: [{ name: '', color: PAL.accent, values: [price, b.value, rel.comps ? num(rel.comps.value) : null, rec.target] }], hline: { y: price * (1 + rec.buy), label: 'COMPRAR > $' + mxn(price * (1 + rec.buy)) }, yFmt: v => nf(0).format(v), valFmt: mxn }));
  return C;
}
