// Sensibilidad, tornado, escenarios, crecimiento perpetuo, comprobaciones y comparación de métodos.
// Todo se calcula re-ejecutando el motor con los supuestos activos. No contiene datos de ninguna empresa.
import { fmt } from './format';
import { labelsOf } from './labels';
import { isNum, relative } from './multiples';
import { recommendation, run } from './model';
import { betaStudy, inflationStudy, presetPatch, scenarioPresets, type ScenarioParams } from './study';
import type { Assumptions, Dataset, RunOk, RunResult, SensTable } from './types';

export interface Grid { ws: number[]; gs: number[]; cells: (number | null)[][] }

/** Tabla WACC × g del valor por acción (flujos y Ke fijos en los del caso activo, como en el Excel). */
export function grid(ds: Dataset, A: Assumptions, base: RunOk, stepW = 0.5, stepG = 0.5): Grid {
  const ws = [-2, -1, 0, 1, 2].map(k => base.wacc * 100 + k * stepW), gs = [-2, -1, 0, 1, 2].map(k => A.g + k * stepG);
  const cells = ws.map(wv => gs.map(gv => { const r = run(ds, { ...A, waccMode: 'manual', waccManual: wv, g: gv, keFixed: base.ke * 100 }); return r.ok ? r.value : null; }));
  return { ws, gs, cells };
}

export interface TornadoRow { key: string; label: string; unit: string; step: number; lowInput?: number; highInput?: number; low: number | null; high: number | null; range: number }

/**
 * Tornado. Con estudio de soporte: cada variable de los escenarios se mueve sola a su valor Conservador y Optimista
 * (el modelo completo se vuelve a correr, con WACC iterado). Sin estudio: pasos genéricos con WACC fijo.
 */
export function tornado(ds: Dataset, A: Assumptions, base: RunOk): TornadoRow[] {
  const P = scenarioPresets(ds);
  if (P.length >= 2) {
    const lo = P[0], hi = P[P.length - 1];
    const F: [string, string, string, (p: ScenarioParams) => Partial<Assumptions>, (p: ScenarioParams) => number][] = [
      ['inflation', 'Inflación (con su efecto en tasas)', '%', p => ({ inflationRate: p.inflationRate }), p => p.inflationRate],
      ['sales', 'Crecimiento de ventas', 'pp', p => ({ salesAdj: p.salesAdj }), p => p.salesAdj],
      ['margin', 'Margen de operación (EBIT)', 'pp', p => ({ marginAdj: p.marginAdj }), p => p.marginAdj],
      ['beta', 'Beta (más o menos un error típico)', 'x', p => ({ betaLevered: p.betaLevered }), p => p.betaLevered],
      ['g', 'Crecimiento perpetuo g', '%', p => ({ g: p.g }), p => p.g / 100]
    ];
    return F.map(([key, label, unit, patch, input]) => {
      const l = run(ds, { ...A, ...patch(lo) }), h = run(ds, { ...A, ...patch(hi) });
      const lv = l.ok ? l.value : null, hv = h.ok ? h.value : null;
      return { key, label, unit, step: 0, lowInput: input(lo), highInput: input(hi), low: lv, high: hv, range: lv != null && hv != null ? Math.abs(hv - lv) : 0 };
    }).sort((a, b) => b.range - a.range);
  }
  const fix = { waccMode: 'manual' as const, waccManual: base.wacc * 100, keFixed: base.ke * 100 };
  const F: [string, string, string, number, (d: number) => Partial<Assumptions>][] = [
    ['wacc', 'WACC', 'pp', 1.0, (d) => ({ waccManual: base.wacc * 100 + d })],
    ['g', 'Crecimiento perpetuo (g)', 'pp', 1.0, (d) => ({ g: A.g + d })],
    ['sales', 'Crecimiento de ventas', 'pp', 2.0, (d) => ({ dGrowth: A.dGrowth + d })],
    ['margin', 'Margen EBIT', 'pp', 0.5, (d) => ({ dMargin: A.dMargin + d })],
    ['capex', 'Capex (% ventas)', 'pp', 0.5, (d) => ({ dCapex: A.dCapex + d })],
    ['tax', 'Tasa de impuestos', 'pp', 4.0, (d) => ({ dTax: A.dTax + d })]
  ];
  if (base.mult) F.push(['mult', 'Múltiplo EV/EBITDA', 'x', 1.0, (d) => ({ exitMultiple: (A.exitMultiple as number) + d })]);
  return F.map(([key, label, unit, step, fn]) => {
    const lo = run(ds, { ...A, ...fix, ...fn(-step) }), hi = run(ds, { ...A, ...fix, ...fn(step) });
    const l = lo.ok ? lo.value : null, h = hi.ok ? hi.value : null;
    return { key, label, unit, step, low: l, high: h, range: (l != null && h != null) ? Math.abs(h - l) : 0 };
  }).sort((a, b) => b.range - a.range);
}

/** Indicadores de un escenario (filas de la tabla comparativa). */
export interface ScenarioMetrics {
  inflation: number; salesAdj: number; marginAdj: number; betaLevered: number;
  salesCagr: number; marginAvg: number; betaIter: number; rf: number; ke: number; wacc: number; g: number; fcfLast: number;
  pvFcf: number; tvG: number; tvBlend: number; ev: number; equity: number; price: number; market: number; diff: number; diffPct: number; recommendation: string;
}
export interface Scenario { key: string; label: string; active: boolean; params: ScenarioParams; result: RunResult; m: ScenarioMetrics | null }

export function metricsOf(ds: Dataset, A: Assumptions, r: RunOk): ScenarioMetrics {
  const n = r.rows.length, rev0 = ds.forecast.base.revenue as number, last = r.rows[n - 1];
  const tvBlend = r.mult ? r.wG * r.tvG + (1 - r.wG) * (r.tvM as number) : r.tvG;
  return {
    inflation: A.inflationRate ?? NaN, salesAdj: A.salesAdj ?? 0, marginAdj: A.marginAdj ?? 0, betaLevered: A.betaLevered ?? NaN,
    salesCagr: Math.pow(last.revenue / rev0, 1 / n) - 1, marginAvg: r.rows.reduce((s, x) => s + x.margin, 0) / n,
    betaIter: r.W.src ? r.W.src.beta : NaN, rf: r.W.rf, ke: r.ke, wacc: r.wacc, g: r.g, fcfLast: last.fcf,
    pvFcf: r.pvSum, tvG: r.tvG, tvBlend, ev: r.evW, equity: r.eqVal, price: r.value, market: r.price, diff: r.value - r.price, diffPct: r.upside ?? NaN,
    recommendation: recommendation(r.upside, r.threshold) ?? '—'
  };
}

/** Escenarios del estudio: cada uno corre el DCF completo (WACC iterado) con sus parámetros sobre los supuestos activos. */
export function scenarios(ds: Dataset, A: Assumptions): Scenario[] {
  return scenarioPresets(ds).map(p => {
    const SA = { ...A, ...presetPatch(p) }, r = run(ds, SA);
    return { key: p.key, label: p.label, active: A.scenario === p.key, params: p, result: r, m: r.ok ? metricsOf(ds, SA, r) : null };
  });
}

export interface SensCharts {
  /** Precio objetivo vs WACC para tres valores de g (columnas centrales de la tabla). */
  waccLines: { g: number; points: [number, number | null][] }[];
  /** Inflación (solo inflación, con su efecto en tasas) vs valor por acción. */
  inflation: [number, number | null][];
  /** Beta vs Ke (CAPM) y punto del modelo. */
  betaKe: [number, number][]; betaModel: [number, number];
  /** g vs EV ponderado (WACC fijo). */
  gEv: [number, number | null][];
}

export function sensCharts(ds: Dataset, A: Assumptions, base: RunOk, G?: Grid): SensCharts {
  const gr = G ?? grid(ds, A, base);
  const waccLines = [1, 2, 3].map(j => ({ g: gr.gs[j] / 100, points: gr.ws.map((w, i) => [w / 100, gr.cells[i][j]] as [number, number | null]) }));
  const P = scenarioPresets(ds), infl = P.length ? [...new Set(P.map(p => p.inflationRate).concat(A.inflationRate != null ? [A.inflationRate] : []))].sort((a, b) => a - b) : [];
  const inflation = infl.map(x => { const r = run(ds, { ...A, inflationRate: x }); return [x, r.ok ? r.value : null] as [number, number | null]; });
  const betaKe = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6].map(b => [b, base.W.rf + b * base.W.prm] as [number, number]);
  const fix = { waccMode: 'manual' as const, waccManual: base.wacc * 100, keFixed: base.ke * 100 };
  const gEv = [-1, -0.5, 0, 0.5, 1].map(d => { const r = run(ds, { ...A, ...fix, g: A.g + d }); return [(A.g + d) / 100, r.ok ? r.evW : null] as [number, number | null]; });
  return { waccLines, inflation, betaKe, betaModel: [base.W.market.beta, base.W.market.ke], gEv };
}

// ------------------------------------------------------------------ crecimiento perpetuo (hoja Crecimiento Perpetuo)
export interface GrowthControl { label: string; value: number; limit: number; ok: boolean; kind: 'lt' | 'le' | 'order' }
export interface GrowthStudy {
  cagr: number; inflAvg: number; realHist: number; nominalLT: number; growthLast: number; reinvest: number; reinvestRate: number; roic: number; sustainable: number; impliedG: number;
  scenarios: { key: string; label: string; g: number; inflation: number; real: number }[];
  controls: GrowthControl[]; passed: number;
  chart: [string, number][];
}

export function growthStudy(ds: Dataset, A: Assumptions, base: RunOk): GrowthStudy | null {
  const S = ds.study; if (!S) return null;
  const Gs = S.growth, rev0 = ds.forecast.base.revenue as number, y0 = +ds.forecast.baseYear.slice(0, 4);
  const cagr = Math.pow(rev0 / Gs.sales2023, 1 / 2) - 1;
  const q = S.inflation.series.filter(x => x[0] >= (y0 - 1) + '-01-01' && x[0] <= y0 + '-12-31').map(x => x[1]);
  const inflAvg = q.reduce((a, b) => a + b, 0) / q.length / 100, realHist = (1 + cagr) / (1 + inflAvg) - 1;
  const nominalLT = (1 + Gs.gdpLT) * (1 + Gs.inflLT) - 1;
  const bd = base.drivers.build, n = base.rows.length, last = base.rows[n - 1];
  const reinvest = last.nopat - last.fcf, reinvestRate = reinvest / last.nopat;
  const by = bd ? bd.years[n - 1] : null;
  const roic = by ? by.nopat / (by.nonCurrent + by.inventory + by.otherCA - by.opCL) : NaN;
  const impliedG = impliedGrowth(base);
  const P = scenarioPresets(ds), gOf = (k: string) => (P.find(p => p.key === k)?.g ?? NaN) / 100;
  const def = S.scenarios.default, gBase = A.scenario === def || !A.scenario ? A.g / 100 : gOf(def);
  const lo = P[0], hi = P[P.length - 1];
  const gLo = lo.key === A.scenario ? A.g / 100 : lo.g / 100, gHi = hi.key === A.scenario ? A.g / 100 : hi.g / 100;
  const controls: GrowthControl[] = [
    { label: 'g Base < WACC del modelo', value: gBase, limit: base.wacc, ok: gBase < base.wacc, kind: 'lt' },
    { label: 'g Base < tasa libre de riesgo esperada (Bono M 10 años)', value: gBase, limit: Gs.bondExpected, ok: gBase < Gs.bondExpected, kind: 'lt' },
    { label: 'g Optimista menor o igual a crecimiento nominal de largo plazo de la economía', value: gHi, limit: nominalLT, ok: gHi <= nominalLT, kind: 'le' },
    { label: 'g Base menor o igual a inflación esperada de largo plazo + 0.5 pp', value: gBase, limit: Gs.inflLT + 0.005, ok: gBase <= Gs.inflLT + 0.005, kind: 'le' },
    { label: 'Orden: Conservador < Base < Optimista', value: gLo < gBase && gBase < gHi ? 1 : 0, limit: 1, ok: gLo < gBase && gBase < gHi, kind: 'order' }
  ];
  return {
    cagr, inflAvg, realHist, nominalLT, growthLast: last.growth, reinvest, reinvestRate, roic, sustainable: reinvestRate * roic, impliedG,
    scenarios: P.map(p => ({ key: p.key, label: p.label, g: p.g / 100, inflation: p.inflationRate, real: (1 + p.g / 100) / (1 + p.inflationRate) - 1 })),
    controls, passed: controls.filter(c => c.ok).length,
    chart: [['Meta de inflación de Banxico', Gs.banxicoTarget], ['g ' + lo.label, gLo], ['g Base', gBase], ['Inflación esperada de largo plazo', Gs.inflLT], ['g ' + hi.label, gHi], ['g implícita en el múltiplo', impliedG], ['PIB nominal de largo plazo', nominalLT], ['Bono M 10 años esperado', Gs.bondExpected]]
  };
}

/** g implícita en el múltiplo de salida: TV múltiplo = FCF·(1+g)/(WACC − g) → g = (TV·WACC − FCF)/(TV + FCF). */
export function impliedGrowth(r: RunOk): number {
  if (!r.tvM) return NaN;
  const f = r.rows[r.rows.length - 1].fcf;
  return (r.tvM * r.wacc - f) / (r.tvM + f);
}

// ------------------------------------------------------------------ comprobaciones de fórmulas (hoja Validación, sección 6)
export interface FormulaCheck { label: string; model: number; other: number; diff: number; tol: number; ok: boolean; kind: 'num' | 'bool' | 'count' | 'bp' }

export function formulaChecks(ds: Dataset, A: Assumptions, base: RunOk, sc?: Scenario[], gs?: GrowthStudy | null): FormulaCheck[] {
  const out: FormulaCheck[] = [], L = labelsOf(ds);
  const add = (label: string, model: number, other: number, tol: number, kind: FormulaCheck['kind'] = 'num') => { const diff = model - other; out.push({ label, model, other, diff, tol, ok: isFinite(diff) && Math.abs(diff) <= tol, kind }); };
  const bd = base.drivers.build, its = base.W.iters;
  add('El balance proyectado cuadra (activo = pasivo + capital)', bd ? bd.years.reduce((s, y) => s + Math.abs(y.check), 0) : 0, 0, 0.5);
  add('El WACC es mayor que g (condición de Gordon)', base.wacc > base.g ? 1 : 0, 1, 0, 'bool');
  add('La iteración del WACC ya no cambia (puntos base)', its.length > 1 ? Math.abs(its[its.length - 1].wout - its[its.length - 2].wout) * 1e4 : (its.length ? Math.abs(its[0].wout - its[0].win) * 1e4 : NaN), 0, 0.01, 'bp');
  add('Suma de flujos descontados', base.pvSum, base.rows.reduce((s, r) => s + r.fcf / Math.pow(1 + base.wacc, r.n), 0), 1e-6);
  const last = base.rows[base.rows.length - 1];
  add('Valor terminal de Gordon', base.tvG, last.fcf * (1 + base.g) / (base.wacc - base.g), 1e-6);
  if (base.roll) add('Equity Value al ' + L.rollDate, base.roll.eq2, base.roll.ev2 - base.roll.debt - base.roll.lease + base.roll.cash, 1e-6);
  add('Valor por acción = Equity Value / acciones', base.value, base.eqVal / base.shares, 1e-6);
  const g = grid(ds, A, base);
  add('Centro de la tabla de sensibilidad = valor por acción', g.cells[2][2] as number, base.value, 1e-6);
  if (ds.study) {
    const B = betaStudy(ds.study), I = inflationStudy(ds.study), P = scenarioPresets(ds);
    add('Beta de la regresión = covarianza / varianza del IPC', B.slope, B.covVar, 1e-6);
    const bi = P.find(p => p.key === ds.study!.scenarios.default)?.inflationRate ?? NaN;
    add('Inflación base = proyección del modelo trimestral', bi, Math.round(I.models[1].exp * 100) / 1e4, 0);
    const S = sc ?? scenarios(ds, A), sb = S.find(s => s.key === ds.study!.scenarios.default), active = S.find(s => s.active);
    add('Escenario Base de la hoja de escenarios = modelo principal', sb && sb.m ? sb.m.price : NaN, active && active.key === sb?.key ? base.value : (sb && sb.m ? sb.m.price : NaN), 1e-6);
    const pr = S.map(s => s.m ? s.m.price : NaN);
    add('Escenarios en orden: Conservador menor que Base menor que Optimista', pr.every((v, i) => i === 0 || v > pr[i - 1]) ? 1 : 0, 1, 0, 'bool');
    const c0 = S[0].m, cb = sb?.m;
    add(S[0].label + ' con más inflación y WACC más alto que el Base', c0 && cb && c0.inflation > cb.inflation && c0.wacc > cb.wacc ? 1 : 0, 1, 0, 'bool');
    add('Datos semanales suficientes para la beta (mínimo ' + B.minObs + ' semanas)', B.enough ? 1 : 0, 1, 0, 'bool');
    const G = gs ?? growthStudy(ds, A, base);
    if (G) add('Controles del crecimiento perpetuo que cumplen (de ' + G.controls.length + ')', G.passed, G.controls.length, 0, 'count');
  }
  return out;
}

// ------------------------------------------------------------------ app vs Excel (hoja Validación, sección 7)
export interface ParityRow { label: string; unit: '%' | 'mdp' | 'MXN'; excel: number; app: number | null; diff: number | null; ok: boolean | null }

/** Compara los resultados de la app con los del Excel del dataset (solo tiene sentido con los supuestos del Excel). */
export function appVsExcel(ds: Dataset, A: Assumptions, base: RunOk, sc?: Scenario[]): ParityRow[] {
  const E = ds.expected; if (!E) return [];
  const S = sc ?? scenarios(ds, A), rows: ParityRow[] = [];
  // Tolerancias de la paridad: precio ±0.01 MXN, tasas ±0.01 pp, montos ±1 mdp.
  const add = (label: string, unit: ParityRow['unit'], excel: number | undefined, app: number | null) => {
    if (excel == null) return;
    const diff = app == null ? null : app - excel, tol = unit === '%' ? 0.0001 : unit === 'mdp' ? 1 : 0.01;
    rows.push({ label, unit, excel, app, diff, ok: diff == null ? null : Math.abs(diff) <= tol + 1e-12 });
  };
  const tvBlend = base.mult ? base.wG * base.tvG + (1 - base.wG) * (base.tvM as number) : base.tvG;
  add('WACC', '%', E.wacc / 100, base.wacc); add('Crecimiento perpetuo', '%', ds.valuation.g / 100, base.g);
  add('Valor terminal ponderado', 'mdp', E.tvBlend, tvBlend); add('Enterprise Value', 'mdp', E.evW, base.evW);
  add('Equity Value', 'mdp', E.eqVal, base.eqVal); add('Valor por acción', 'MXN', E.price, base.value);
  const ES = ds.expectedScenarios || {};
  S.forEach(s => add('Valor por acción · ' + s.label, 'MXN', ES[s.key]?.price, s.m ? s.m.price : null));
  return rows;
}

/** Tablas de sensibilidad recalculadas con el motor (pasos de la tabla del Excel: 0.5 pp en WACC y g). */
export function sensTables(ds: Dataset, A: Assumptions, base: RunOk): SensTable[] {
  const fix = { waccMode: 'manual' as const, keFixed: base.ke * 100 }, K = [-2, -1, 0, 1, 2];
  const val = (p: Partial<Assumptions>) => { const r = run(ds, { ...A, ...fix, waccManual: base.wacc * 100, ...p }); return r.ok ? r.value : NaN; };
  const sg = (v: number, d = 2) => (v >= 0 ? '+' : '') + v.toFixed(d);
  const T = (label: string, rowsLabel: string, colsLabel: string, rs: number[], cs: number[], rh: (v: number) => string, ch: (v: number) => string, fn: (r: number, c: number) => Partial<Assumptions>): SensTable =>
    ({ label, rowsLabel, colsLabel, rowHeads: rs.map(rh), cols: cs.map(ch), grid: rs.map(r => cs.map(c => val(fn(r, c)))) });
  const out = [T('WACC vs. g', 'WACC', 'g', K.map(k => base.wacc * 100 + k * 0.5), K.map(k => A.g + k * 0.5), v => v.toFixed(2) + '%', v => v.toFixed(2) + '%', (w, g) => ({ waccManual: w, g }))];
  if (base.mult) out.push(T('WACC vs. múltiplo EV/EBITDA', 'WACC', 'Múltiplo', K.map(k => base.wacc * 100 + k * 0.5), K.map(k => (A.exitMultiple as number) + k * 0.5), v => v.toFixed(2) + '%', v => v.toFixed(2) + 'x', (w, m) => ({ waccManual: w, exitMultiple: m })));
  return out;
}

export interface MethodRow { key: string; label: string; sub: string; value: number | null; lo: number | null; hi: number | null; main?: boolean; ref?: boolean }

/** Campo de fútbol: rango de valor por acción por método. */
export function methods(ds: Dataset, A: Assumptions, base: RunOk, sc?: Scenario[]): MethodRow[] {
  const L = labelsOf(ds), out: MethodRow[] = [];
  const S = (sc ?? scenarios(ds, A)).map(s => s.m ? s.m.price : null).filter((v): v is number => v != null);
  const fix = { waccMode: 'manual' as const, keFixed: base.ke * 100 };
  const lo = run(ds, { ...A, ...fix, waccManual: base.wacc * 100 + 0.5, g: A.g - 0.5 }), hi = run(ds, { ...A, ...fix, waccManual: base.wacc * 100 - 0.5, g: A.g + 0.5 });
  out.push({ key: 'dcf', label: 'DCF', sub: S.length > 1 ? 'Escenarios (' + L.closeDate + ' → fecha de valuación)' : 'WACC ±0.5 pp y g ∓0.5 pp', value: base.value, lo: S.length > 1 ? Math.min(...S) : (lo.ok ? lo.value : null), hi: S.length > 1 ? Math.max(...S) : (hi.ok ? hi.value : null), main: true });
  const RV = ds.comps || ds.combined ? relative(ds, A, base.value) : null, num = (p: unknown) => isNum(p) ? p : null;
  if (RV && RV.comps) out.push({ key: 'comps', label: 'Múltiplos de competidores', sub: RV.comps.n + ' comparables · percentil 25 a 75', value: num(RV.comps.value), lo: num(RV.comps.p25), hi: num(RV.comps.p75) });
  if (RV && RV.transactions) out.push({ key: 'trans', label: 'Transacciones comparables', sub: 'Referencia · ' + RV.transactions.n + ' operaciones · mínimo a máximo', value: num(RV.transactions.value), lo: num(RV.transactions.lo), hi: num(RV.transactions.hi), ref: true });
  if (RV && RV.combined) out.push({ key: 'combined', label: 'Precio combinado', sub: RV.combined.rows.map(r => Math.round(r.weight * 100) + '%').join(' / ') + ' · DCF / múltiplos / transacciones', value: num(RV.combined.value), lo: null, hi: null, main: true });
  const m = ds.market;
  if (m.consensus) out.push({ key: 'cons', label: 'Consenso de analistas', sub: m.consensusLabel || '', value: m.consensus, lo: null, hi: null, ref: true });
  return out;
}

/** Resumen numérico para textos (conclusiones, preguntas): cada valor se recalcula con los supuestos activos. */
export function fmtRange(a: number | null, b: number | null) { return a == null || b == null ? '—' : fmt.cur(a) + ' a ' + fmt.cur(b); }
