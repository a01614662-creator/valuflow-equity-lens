// Catálogo de gráficas del estudio. Cada función recibe el Bundle (cálculo vivo) y devuelve el SVG.
import { fixed, fmt } from '../engine';
import { PAL, barChart, chainChart, compositionChart, footballChart, hbarChart, tornadoChart, waterfallChart, xyChart, type Svg } from '../charts/svg';
import type { Bundle } from './bundle';

const pct = (d: number) => (v: number) => fixed(v * 100, d) + '%';
const pctPts = (d: number) => (v: number) => fixed(v, d) + '%';
const mdp = (v: number) => fixed(v, 0);
const mxn = (v: number) => fixed(v, 2);
const YEAR = (iso: string) => +iso.slice(0, 4) + (+iso.slice(5, 7) - 1) / 12 + (+iso.slice(8, 10) - 1) / 365;

export interface ChartDef { id: string; title: string; source: string; svg: Svg }

function yearTicks(dates: string[]) {
  const ys = [...new Set(dates.map(d => +d.slice(0, 4)))];
  return { xTicks: ys.map(y => y), xTickLabels: ys.map(String) };
}

/** Recta (o curva) de ajuste evaluada en una malla de x. */
const fitLine = (x0: number, x1: number, f: (x: number) => number, n = 40): [number, number][] => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return [x, f(x)]; });

export function chartCatalog(B: Bundle): Record<string, ChartDef> {
  const { b, ds, scen, torn, grid, charts, growth, infl, monthly, prices, beta, methods } = B, C: Record<string, ChartDef> = {};
  const add = (id: string, title: string, source: string, svg: Svg) => { C[id] = { id, title, source, svg }; };
  const price = b.price;

  // Campo de fútbol
  const comb = methods.find(m => m.key === 'combined');
  add('football', 'Campo de fútbol: rango de valor por acción por método (MXN)', 'hojas Valuación Combinada y Escenarios',
    footballChart({ rows: methods.filter(m => m.key !== 'combined').map(m => ({ label: m.label, lo: m.lo, hi: m.hi, value: m.value, main: m.main, ref: m.ref })), marks: [{ x: price, label: 'Mercado ' + mxn(price), color: PAL.neg }].concat(comb && comb.value != null ? [{ x: comb.value, label: 'Combinado ' + mxn(comb.value), color: PAL.accent }] : []), fmt: mxn }));
  add('chain', 'Cadena lógica del estudio', 'estructura de hojas del Excel del estudio',
    chainChart({ steps: [['Inflación', 'Banxico'], ['IPC', 'mercado'], ['Soriana B', 'activo'], ['Beta', 'regresión'], ['WACC', 'CAPM'], ['g', 'crecimiento'], ['Valuación', 'DCF'], ['Escenarios', '3 casos'], ['Validación', 'vs precio']] }));

  if (infl) {
    const S = ds.study!, ser = S.inflation.series, last = ser[ser.length - 1];
    add('inflSeries', 'Inflación anual general, serie quincenal (%)', 'hoja Inflación (Banxico)', xyChart({ legend: false, series: [{ name: 'Inflación', color: PAL.accent, points: ser.map(s => [YEAR(s[0]), s[1]]), labels: ser.map((s, i) => i === ser.length - 1 ? fixed(last[1], 2) + '% (' + last[0] + ')' : null) }], ...yearTicks(ser.map(s => s[0])), yFmt: pctPts(0) }));
    add('inflModels', 'Proyección de inflación por modelo (%)', 'hoja Inflación, filas 11 a 15', barChart({ cats: ['Ciclo inmediato', 'Mediano plazo', 'Larga quincenal', 'Larga trimestral'], series: [{ name: 'Lineal', color: PAL.accent3, values: infl.models.map(m => m.lin) }, { name: 'Exponencial', color: PAL.accent, values: infl.models.map(m => m.exp) }], yFmt: pctPts(0), valFmt: v => fixed(v, 2) }));
    infl.models.forEach(m => {
      const xl = m.key === 'medium' || m.key === 'longQ' ? 'Trimestre (x)' : 'Quincena (x)';
      const pts = m.xs.map((x, i) => [x, m.ys[i]] as [number, number]), xt = m.n <= 15 ? { xTicks: m.xs } : {};
      add('infl_' + m.key + '_lin', m.label + ', lineal (%)', 'hoja Inflación', xyChart({ ...xt, legend: false, xLabel: xl, yFmt: pctPts(1), notes: [m.eqLin, 'R² = ' + fixed(m.r2, 4)], series: [{ name: 'Datos', color: PAL.accent, kind: 'scatter', points: pts, r: 3.2 }, { name: 'Tendencia', color: PAL.neg, kind: 'dash', points: fitLine(1, m.n, x => m.m * x + m.b) }] }));
      add('infl_' + m.key + '_exp', m.label + ', exponencial (%)', 'hoja Inflación', xyChart({ ...xt, legend: false, xLabel: xl, yFmt: pctPts(1), notes: [m.eqExp, 'R² = ' + fixed(m.r2exp, 4)], series: [{ name: 'Datos', color: PAL.accent, kind: 'scatter', points: pts, r: 3.2 }, { name: 'Tendencia', color: PAL.neg, kind: 'dash', points: fitLine(1, m.n, x => m.a * Math.exp(m.k * x)) }] }));
    });
  }
  if (monthly) {
    const V = monthly.valid;
    add('inflPrice', 'Inflación y precio de Soriana B en el tiempo (mensual)', 'hoja Inflación (meses con inflación y precio)', xyChart({ yLabel: 'Inflación (%)', y2Label: 'Precio (MXN)', yFmt: pctPts(0), y2Fmt: v => fixed(v, 0), ...yearTicks(V.map(m => m.month)), series: [{ name: 'Inflación (%, eje izq.)', color: PAL.accent, points: V.map(m => [YEAR(m.month), m.infl as number]) }, { name: 'Precio (MXN, eje der.)', color: PAL.brand, axis: 'y2', points: V.map(m => [YEAR(m.month), m.price as number]) }] }));
    const xs = V.map(m => m.infl as number), x0 = Math.min(...xs), x1 = Math.max(...xs), L = monthly.linear, X = monthly.exponential;
    add('priceVsInfl', 'Precio de Soriana B frente a la inflación, lineal y exponencial', 'hoja Inflación (regresión mensual)', xyChart({ xLabel: 'Inflación anual del mes (%)', yLabel: 'MXN', xFmt: pctPts(0), notes: ['Lineal: ' + L.eq + ', R² = ' + fixed(L.r2, 4), 'Exponencial: ' + X.eq + ', R² = ' + fixed(X.r2, 4)], series: [{ name: 'Meses', color: PAL.accent, kind: 'scatter', points: V.map(m => [m.infl as number, m.price as number]), r: 3 }, { name: 'Lineal', color: PAL.neg, points: fitLine(x0, x1, x => L.m * x + L.b) }, { name: 'Exponencial', color: PAL.warn, kind: 'dash', points: fitLine(x0, x1, x => X.a * Math.exp(X.k * x)) }] }));
    const R = monthly.months.filter(m => m.ret != null && m.dInfl != null), rx = R.map(m => m.dInfl as number), ry = R.map(m => m.ret as number);
    const mx = rx.reduce((a, v) => a + v, 0) / rx.length, my = ry.reduce((a, v) => a + v, 0) / ry.length;
    let sxy = 0, sxx = 0, syy = 0; rx.forEach((x, i) => { sxy += (x - mx) * (ry[i] - my); sxx += (x - mx) ** 2; syy += (ry[i] - my) ** 2; });
    const sl = sxy / sxx, ic = my - sl * mx, r2 = sxy * sxy / (sxx * syy);
    add('retVsDInfl', 'Rendimiento mensual de Soriana B frente al cambio de la inflación', 'hoja Inflación (rendimientos mensuales)', xyChart({ legend: false, xLabel: 'Cambio mensual de la inflación (pp)', yFmt: pct(0), xFmt: v => fixed(v, 2), notes: ['y = ' + fixed(sl, 4) + 'x + ' + fixed(ic, 4), 'R² = ' + fixed(r2, 4) + ' (r = ' + fixed(Math.sqrt(r2) * Math.sign(sl), 2) + ')'], series: [{ name: 'Meses', color: PAL.accent, kind: 'scatter', points: R.map(m => [m.dInfl as number, m.ret as number]), r: 3 }, { name: 'Recta', color: PAL.neg, kind: 'dash', points: fitLine(Math.min(...rx), Math.max(...rx), x => sl * x + ic) }] }));
  }
  if (prices) {
    const W = prices.base100, last = W[W.length - 1];
    add('base100', 'Soriana B frente al IPC (base 100 = ' + W[0].date + ')', 'hoja Precio e IPC (Investing.com)', xyChart({ ...yearTicks(W.map(w => w.date)), yFmt: v => fixed(v, 0), series: [{ name: 'Soriana B (' + fixed(last.soriana as number, 1) + ')', color: PAL.brand, points: W.filter(w => w.soriana != null).map(w => [YEAR(w.date), w.soriana as number]) }, { name: 'IPC (' + fixed(last.ipc as number, 1) + ')', color: PAL.accent, points: W.filter(w => w.ipc != null).map(w => [YEAR(w.date), w.ipc as number]) }] }));
    ([['soriana', 'Soriana B', 'MXN', (v: number) => fixed(v, 0)], ['ipc', 'IPC', 'puntos', (v: number) => fixed(v, 0)]] as const).forEach(([k, nm, u, yf]) => {
      const M = prices[k], pts = prices.weeks.map((w, i) => [i + 1, k === 'soriana' ? w.soriana : w.ipc] as [number, number | null]).filter(p => p[1] != null) as [number, number][];
      add('trend_' + k + '_lin', nm + ', tendencia lineal (' + u + ')', 'hoja Precio e IPC', xyChart({ legend: false, xLabel: 'Semana (x)', yFmt: yf, notes: [M.eqLin, 'R² = ' + fixed(M.r2, 4)], series: [{ name: nm, color: PAL.accent, points: pts, width: 1.4 }, { name: 'Tendencia', color: PAL.neg, kind: 'dash', points: fitLine(1, pts[pts.length - 1][0], x => M.m * x + M.b) }] }));
      add('trend_' + k + '_exp', nm + ', tendencia exponencial (' + u + ')', 'hoja Precio e IPC', xyChart({ legend: false, xLabel: 'Semana (x)', yFmt: yf, notes: [M.eqExp, 'R² = ' + fixed(M.r2exp, 4) + ' · crecimiento anual implícito ' + fixed(M.growth * 100, 1) + '%'], series: [{ name: nm, color: PAL.accent, points: pts, width: 1.4 }, { name: 'Tendencia', color: PAL.neg, kind: 'dash', points: fitLine(1, pts[pts.length - 1][0], x => M.a * Math.exp(M.k * x)) }] }));
    });
  }
  if (beta) {
    const P = beta.pairs, x0 = Math.min(...P.x), x1 = Math.max(...P.x);
    add('beta', 'Rendimientos semanales de Soriana B frente al IPC', 'hoja Beta Regresión (' + beta.n + ' semanas); la pendiente es la beta', xyChart({ legend: false, xLabel: 'IPC (rendimiento semanal)', yLabel: 'Soriana B (semanal)', xFmt: pct(0), yFmt: pct(0), notes: ['y = ' + fixed(beta.slope, 4) + 'x + ' + fixed(beta.intercept, 4), 'R² = ' + fixed(beta.r2, 4)], series: [{ name: 'Semanas', color: PAL.accent, kind: 'scatter', points: P.x.map((x, i) => [x, P.y[i]]), r: 2.4 }, { name: 'Recta', color: PAL.neg, points: fitLine(x0, x1, x => beta.slope * x + beta.intercept) }] }));
  }
  if (growth) add('gRefs', 'g frente a sus referencias (%)', 'hoja Crecimiento Perpetuo (Banxico, sep 2026)', hbarChart({ rows: growth.chart.map(([l, v]) => ({ label: l, value: v, color: /^g (Base|Conservador|Optimista)/.test(l) ? PAL.accent : /implícita/.test(l) ? PAL.warn : PAL.accent3 })), fmt: pct(2) }));

  // DCF
  const R = b.rows;
  add('fcf', 'FCF proyectado y su valor presente (mdp)', 'hoja Proyección Final Soriana, sección 2', barChart({ cats: R.map(r => r.year), series: [{ name: 'FCF', color: PAL.accent, values: R.map(r => r.fcf) }, { name: 'Valor presente', color: PAL.accent3, values: R.map(r => r.pv) }], yFmt: mdp, valFmt: mdp }));
  if (b.mult) {
    const tvB = b.wG * b.tvG + (1 - b.wG) * (b.tvM as number);
    add('tv', 'Gordon frente a múltiplo de salida (mdp, ' + R[R.length - 1].year + ')', 'hoja Proyección Final Soriana', barChart({ cats: ['Gordon (g = ' + fixed(b.g * 100, 2) + '%)', 'Múltiplo ' + fixed(b.mult, 2) + 'x', 'Ponderado ' + Math.round(b.wG * 100) + '/' + Math.round((1 - b.wG) * 100)], series: [{ name: '', color: PAL.accent, values: [b.tvG, b.tvM, tvB] }], yFmt: mdp, valFmt: mdp }));
  }
  add('evComp', 'Composición del Enterprise Value (mdp)', 'hojas Proyección Final Soriana y Validación', compositionChart({ title: 'Enterprise Value al cierre: ' + mdp(b.evW) + ' mdp', parts: [{ label: 'VP de los FCF ' + R[0].year + ' a ' + R[R.length - 1].year, value: b.pvSum, color: PAL.accent3 }, { label: 'VP del valor terminal ponderado', value: b.pvTvW, color: PAL.accent }], fmt: v => mdp(v) + ' mdp' }));
  const st: { label: string; value?: number; total?: number }[] = [{ label: 'EV al cierre', total: b.evW }];
  if (b.roll) st.push({ label: 'Llevado al balance intermedio', value: b.roll.capGain }, { label: 'FCF del periodo (negativo)', value: b.roll.fcfGenerated }, { label: 'EV al balance intermedio', total: b.roll.ev2 }, { label: 'Deuda bursátil y bancaria', value: -b.roll.debt }, { label: 'Arrendamientos', value: -b.roll.lease }, { label: 'Efectivo', value: b.roll.cash }, { label: 'Equity al balance intermedio', total: b.roll.eq2 }, { label: 'Llevado a la fecha de valuación', value: b.roll.keGain }, { label: 'Equity a la fecha de valuación', total: b.roll.eq3 });
  add('bridge', 'Puente del Enterprise Value al valor por acción (mdp)', 'hoja Proyección Final Soriana, sección 11', waterfallChart({ steps: st, fmt: mdp, note: mdp(b.eqVal) + ' mdp ÷ ' + fmt.n(b.shares, 0) + ' millones de acciones = ' + mxn(b.value) + ' MXN por acción' }));

  // Escenarios
  const ok = scen.filter(s => s.m);
  add('scenPrice', 'Valor por acción por escenario frente al precio de mercado (MXN)', 'hoja Escenarios', barChart({ cats: ok.map(s => s.label), subLabels: ok.map(s => (s.m!.diffPct >= 0 ? '+' : '−') + fixed(Math.abs(s.m!.diffPct) * 100, 1) + '%'), series: [{ name: '', color: PAL.accent, values: ok.map(s => s.m!.price) }], hline: { y: price, label: 'Precio de mercado ' + mxn(price) + ' MXN' }, yFmt: v => fixed(v, 0), valFmt: mxn }));
  add('tornado', 'Tornado: valor por acción moviendo una variable a la vez (MXN)', 'hoja Escenarios, filas 47 a 63', tornadoChart({ center: b.value, centerLabel: 'Activo ' + mxn(b.value), fmt: mxn, rows: torn.filter(t => t.low != null && t.high != null).map(t => ({ label: tornLabel(t), low: t.low as number, high: t.high as number })) }));
  add('evEqScen', 'Enterprise Value y Equity Value por escenario (mdp)', 'hoja Escenarios, filas 34 y 35', barChart({ cats: ok.map(s => s.label), series: [{ name: 'Enterprise Value', color: PAL.accent, values: ok.map(s => s.m!.ev) }, { name: 'Equity Value', color: PAL.accent3, values: ok.map(s => s.m!.equity) }], yFmt: mdp, valFmt: mdp }));
  const col = [PAL.accent3, PAL.accent, PAL.brand];
  add('priceWacc', 'Precio objetivo frente al WACC para tres valores de g (MXN)', 'hoja Escenarios (tabla WACC × g)', xyChart({ xLabel: 'WACC', xFmt: pct(2), xTicks: grid.ws.map(w => w / 100), yFmt: v => fixed(v, 0), hlines: [{ y: price, label: 'Mercado ' + mxn(price) }], series: charts.waccLines.map((l, i) => ({ name: 'g ' + fixed(l.g * 100, 2) + '%', color: col[i], points: l.points.filter(p => p[1] != null) as [number, number][] })) }));
  add('inflValue', 'Inflación frente al valor de la acción (MXN)', 'hoja Escenarios (solo inflación, con su efecto en tasas)', xyChart({ legend: false, xLabel: 'Inflación 2026E a 2030E', xFmt: pct(2), xTicks: charts.inflation.map(p => p[0]), yFmt: mxn, series: [{ name: 'Valor', color: PAL.accent, points: charts.inflation.filter(p => p[1] != null) as [number, number][], labels: charts.inflation.map(p => p[1] != null ? mxn(p[1]) : null) }] }));
  add('betaKe', 'Beta frente al costo de capital (CAPM)', 'hoja Escenarios (Ke = Rf + β × prima)', xyChart({ legend: false, xLabel: 'Beta', xFmt: v => fixed(v, 1), xTicks: charts.betaKe.map(p => p[0]), yFmt: pct(0), notes: ['Modelo: ' + fixed(charts.betaModel[0], 4) + ', Ke ' + fixed(charts.betaModel[1] * 100, 2) + '%'], series: [{ name: 'Ke', color: PAL.accent, points: charts.betaKe }, { name: 'Modelo', color: PAL.neg, kind: 'scatter', r: 5, points: [charts.betaModel] }] }));
  add('gEv', 'g frente al Enterprise Value (mdp)', 'hoja Escenarios (WACC del modelo principal)', xyChart({ legend: false, xLabel: 'Crecimiento perpetuo g', xFmt: pct(2), xTicks: charts.gEv.map(p => p[0]), yFmt: mdp, series: [{ name: 'EV', color: PAL.accent, points: charts.gEv.filter(p => p[1] != null) as [number, number][], labels: charts.gEv.map(p => p[1] != null ? mdp(p[1]) : null) }] }));
  const it = b.W.iters;
  if (it.length) add('iter', 'Iteración del WACC: del valor de mercado al valor DCF (%)', 'hoja Proyección Final Soriana, filas 205 a 222', xyChart({ legend: false, xLabel: 'Iteración', xTicks: [0, ...it.map((_, k) => k + 1)], xTickLabels: ['Mercado', ...it.map((_, k) => String(k + 1))], yFmt: pct(2), series: [{ name: 'WACC', color: PAL.accent, points: [[0, it[0].win] as [number, number]].concat(it.map((x, k) => [k + 1, x.wout] as [number, number])), labels: [fixed(it[0].win * 100, 2)].concat(it.map(x => fixed(x.wout * 100, 2))) }] }));
  return C;
}

export function tornLabel(t: { key: string; label: string; lowInput?: number; highInput?: number }): string {
  const lo = t.lowInput, hi = t.highInput;
  if (lo == null || hi == null) return t.label;
  if (t.key === 'margin') return 'Margen EBIT ±' + fixed(Math.abs(lo) * 100, 2) + ' pp';
  if (t.key === 'sales') return 'Ventas ±' + fixed(Math.abs(lo) * 100, 0) + ' pp por año';
  if (t.key === 'beta') return 'Beta ±1 error típico';
  if (t.key === 'g') return 'g ' + fixed(lo * 100, 2) + '% a ' + fixed(hi * 100, 2) + '%';
  if (t.key === 'inflation') return 'Inflación ' + fixed(lo * 100, 2) + '% a ' + fixed(hi * 100, 2) + '%';
  return t.label;
}
