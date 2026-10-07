// Sensibilidad, tornado, escenarios y comparación de métodos. Todo se calcula re-ejecutando el motor.
import { fmt } from './format';
import { labelsOf } from './labels';
import { inflationScenarios } from './inflation';
import { isNum, relative } from './multiples';
import { run } from './model';
import type { Assumptions, Dataset, RunOk, SensTable } from './types';

export interface Grid { ws: number[]; gs: number[]; cells: (number | null)[][] }

/** Tabla WACC × g del valor por acción (Ke fijo en el del caso base, como en el Excel). */
export function grid(ds: Dataset, A: Assumptions, base: RunOk, stepW = 0.5, stepG = 0.5): Grid {
  const ws = [-2, -1, 0, 1, 2].map(k => base.wacc * 100 + k * stepW), gs = [-2, -1, 0, 1, 2].map(k => A.g + k * stepG);
  const cells = ws.map(wv => gs.map(gv => { const r = run(ds, { ...A, waccMode: 'manual', waccManual: wv, g: gv, keFixed: base.ke * 100 }); return r.ok ? r.value : null; }));
  return { ws, gs, cells };
}

export interface TornadoRow { label: string; unit: string; step: number; low: number | null; high: number | null; range: number }

export function tornado(ds: Dataset, A: Assumptions, base: RunOk): TornadoRow[] {
  const fix = { waccMode: 'manual' as const, waccManual: base.wacc * 100, keFixed: base.ke * 100 };
  const F: [string, string, number, (d: number) => Partial<Assumptions>][] = [
    ['WACC', 'pp', 1.0, (d) => ({ waccManual: base.wacc * 100 + d })],
    ['Crecimiento perpetuo (g)', 'pp', 1.0, (d) => ({ g: A.g + d })],
    ['Crecimiento de ventas', 'pp', 2.0, (d) => ({ dGrowth: A.dGrowth + d })],
    ['Margen EBIT', 'pp', 0.5, (d) => ({ dMargin: A.dMargin + d })],
    ['Capex (% ventas)', 'pp', 0.5, (d) => ({ dCapex: A.dCapex + d })],
    ['Tasa de impuestos', 'pp', 4.0, (d) => ({ dTax: A.dTax + d })]
  ];
  if (base.mult) F.push(['Múltiplo EV/EBITDA', 'x', 1.0, (d) => ({ exitMultiple: (A.exitMultiple as number) + d })]);
  return F.map(([label, unit, step, fn]) => {
    const lo = run(ds, { ...A, ...fix, ...fn(-step) }), hi = run(ds, { ...A, ...fix, ...fn(step) });
    const l = lo.ok ? lo.value : null, h = hi.ok ? hi.value : null;
    return { label, unit, step, low: l, high: h, range: (l != null && h != null) ? Math.abs(h - l) : 0 };
  }).sort((a, b) => b.range - a.range);
}

export interface Scenario {
  key: string; label: string; kind: string; desc: string; source: string; inflation: number; constant: boolean; active: boolean;
  value: number | null; upside: number | null; wacc: number | null; revenueLast: number | null; fcfLast: number | null;
}

/**
 * Escenarios DOCUMENTADOS del dataset (inflación). Cada uno re-ejecuta el modelo completo con los demás supuestos activos.
 * Si el dataset no documenta escenarios, no se inventan: la lista queda vacía.
 */
export function scenarios(ds: Dataset, A: Assumptions, base: RunOk): Scenario[] {
  if (!ds.inflation) return [];
  const n = ds.forecast.years.length;
  return inflationScenarios(ds.inflation, n).map(s => {
    const active = (A.inflation ?? ds.inflation!.default) === s.key;
    const r = active ? base : run(ds, { ...A, inflation: s.key });
    const desc = s.constant ? 'Inflación ' + fmt.p(s.path[0]) + ' constante ' + ds.forecast.years[0] + '–' + ds.forecast.years[n - 1] : 'Trayectoria ' + s.path.map(v => (v * 100).toFixed(2) + '%').join(' · ');
    return {
      key: s.key, label: s.label, kind: s.kind, desc, source: s.source, inflation: s.path[0], constant: s.constant, active,
      value: r.ok ? r.value : null, upside: r.ok ? r.upside : null, wacc: r.ok ? r.wacc : null,
      revenueLast: r.ok ? r.rows[n - 1].revenue : null, fcfLast: r.ok ? r.rows[n - 1].fcf : null
    };
  });
}

/** Tablas de sensibilidad recalculadas con el motor (pasos de la tabla del Excel: 0.5 pp en WACC y g). */
export function sensTables(ds: Dataset, A: Assumptions, base: RunOk): SensTable[] {
  const fix = { waccMode: 'manual' as const, keFixed: base.ke * 100 }, K = [-2, -1, 0, 1, 2];
  const val = (p: Partial<Assumptions>) => { const r = run(ds, { ...A, ...fix, waccManual: base.wacc * 100, ...p }); return r.ok ? r.value : NaN; };
  const sg = (v: number, d = 2) => (v >= 0 ? '+' : '') + v.toFixed(d);
  const T = (label: string, rowsLabel: string, colsLabel: string, rs: number[], cs: number[], rh: (v: number) => string, ch: (v: number) => string, fn: (r: number, c: number) => Partial<Assumptions>): SensTable =>
    ({ label, rowsLabel, colsLabel, rowHeads: rs.map(rh), cols: cs.map(ch), grid: rs.map(r => cs.map(c => val(fn(r, c)))) });
  const out = [
    T('WACC vs. g', 'WACC', 'g', K.map(k => base.wacc * 100 + k * 0.5), K.map(k => A.g + k * 0.5), v => v.toFixed(2) + '%', v => v.toFixed(2) + '%', (w, g) => ({ waccManual: w, g })),
    T('Δ Ventas vs. Δ Margen EBIT', 'Δ ventas', 'Δ margen', K.map(k => A.dGrowth + k), K.map(k => A.dMargin + k * 0.25), v => sg(v), v => sg(v), (dg, dm) => ({ dGrowth: dg, dMargin: dm })),
    T('Δ Capex vs. Δ Tasa de impuestos', 'Δ capex', 'Δ tasa', K.map(k => A.dCapex + k * 0.25), K.map(k => A.dTax + k * 2), v => sg(v), v => sg(v), (dc, dt) => ({ dCapex: dc, dTax: dt }))
  ];
  if (base.mult) out.splice(2, 0, T('WACC vs. múltiplo EV/EBITDA', 'WACC', 'Múltiplo', K.map(k => base.wacc * 100 + k * 0.5), K.map(k => (A.exitMultiple as number) + k * 0.5), v => v.toFixed(2) + '%', v => v.toFixed(2) + 'x', (w, m) => ({ waccManual: w, exitMultiple: m })));
  return out;
}

export interface MethodRow { key: string; label: string; sub: string; value: number | null; lo: number | null; hi: number | null; main?: boolean; ref?: boolean }

export function methods(ds: Dataset, A: Assumptions, base: RunOk): MethodRow[] {
  const L = labelsOf(ds);
  const fix = { waccMode: 'manual' as const, keFixed: base.ke * 100 };
  const lo = run(ds, { ...A, ...fix, waccManual: base.wacc * 100 + 0.5, g: A.g - 0.5 });
  const hi = run(ds, { ...A, ...fix, waccManual: base.wacc * 100 - 0.5, g: A.g + 0.5 });
  const out: MethodRow[] = [];
  out.push({ key: 'gordon', label: 'DCF · crecimiento perpetuo', sub: 'Gordon, al ' + L.closeDate, value: base.priceG, lo: lo.ok ? lo.priceG : null, hi: hi.ok ? hi.priceG : null });
  if (base.mult) {
    const ml = run(ds, { ...A, exitMultiple: (A.exitMultiple as number) - 0.5 }), mh = run(ds, { ...A, exitMultiple: (A.exitMultiple as number) + 0.5 });
    out.push({ key: 'mult', label: 'DCF · múltiplo de salida', sub: 'EV/EBITDA ' + fmt.x(A.exitMultiple), value: base.priceM, lo: ml.ok ? ml.priceM : null, hi: mh.ok ? mh.priceM : null });
    out.push({ key: 'w', label: 'Ponderado', sub: Math.round(base.wG * 100) + '% Gordon · ' + Math.round((1 - base.wG) * 100) + '% múltiplo', value: base.priceClose, lo: lo.ok ? lo.priceClose : null, hi: hi.ok ? hi.priceClose : null });
  }
  // Rango del DCF: escenarios documentados del dataset si existen (como en el Excel); si no, WACC ±0.5 pp y g ∓0.5 pp.
  const sc = scenarios(ds, A, base).map(s => s.value).filter((v): v is number => v != null);
  const dLo = sc.length > 1 ? Math.min(...sc) : (lo.ok ? lo.value : null), dHi = sc.length > 1 ? Math.max(...sc) : (hi.ok ? hi.value : null);
  if (base.roll) out.push({ key: 'final', label: ds.combined ? 'DCF · precio objetivo' : 'Precio objetivo', sub: 'A la fecha de valuación' + (sc.length > 1 ? ' · rango: escenarios de inflación' : ''), value: base.value, lo: dLo, hi: dHi, main: true });
  else out[out.length - 1].main = true;
  const RV = ds.comps || ds.combined ? relative(ds, A, base.value) : null;
  const num = (p: unknown) => isNum(p) ? p : null;
  if (RV && RV.comps) out.push({ key: 'comps', label: 'Trading Comps', sub: RV.comps.n + ' comparables · rango P25–P75', value: num(RV.comps.value), lo: num(RV.comps.p25), hi: num(RV.comps.p75) });
  if (RV && RV.transactions) out.push({ key: 'trans', label: 'Precedent Transactions', sub: 'Referencia · ' + RV.transactions.n + ' operaciones · mín–máx', value: num(RV.transactions.value), lo: num(RV.transactions.lo), hi: num(RV.transactions.hi), ref: true });
  if (RV && RV.combined) out.push({ key: 'combined', label: 'Valuación combinada', sub: RV.combined.rows.map(r => Math.round(r.weight * 100) + '%').join(' / ') + ' · DCF / Comps / Transactions', value: num(RV.combined.value), lo: null, hi: null, main: true });
  if (ds.altForecasts) Object.keys(ds.altForecasts).forEach(k => {
    const af = ds.altForecasts![k], r = run(ds, { ...A, ...af.overrides, forecastKey: k, dGrowth: 0, dMargin: 0, dCapex: 0, dTax: 0 });
    if (r.ok) out.push({ key: k, label: 'Proyección base anterior', sub: af.short || 'Supuestos constantes', value: r.value, lo: null, hi: null, ref: true });
  });
  const m = ds.market || ({} as Dataset['market']);
  if (m.consensus) out.push({ key: 'cons', label: 'Consenso de analistas', sub: m.consensusLabel || '', value: m.consensus, lo: null, hi: null, ref: true });
  if (m.low52 && m.high52) out.push({ key: '52w', label: 'Rango 52 semanas', sub: 'Mercado', value: null, lo: m.low52, hi: m.high52, ref: true });
  return out;
}
