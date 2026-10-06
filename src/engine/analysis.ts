// Sensibilidad, tornado, escenarios y comparación de métodos. Todo se calcula re-ejecutando el motor.
import { fmt } from './format';
import { labelsOf } from './labels';
import { run } from './model';
import type { Assumptions, Dataset, RunOk } from './types';

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

export interface Scenario { key: string; label: string; desc: string; value: number | null; upside: number | null }

export function scenarios(ds: Dataset, A: Assumptions, base: RunOk): Scenario[] {
  const fix = { waccMode: 'manual' as const, keFixed: base.ke * 100 };
  const mk = (s: number): Assumptions => ({ ...A, ...fix, waccManual: base.wacc * 100 + s * 0.5, g: A.g - s * 0.5, dGrowth: A.dGrowth - s * 1.0, dMargin: A.dMargin - s * 0.25 });
  const p = run(ds, mk(1)), o = run(ds, mk(-1));
  return [
    { key: 'pes', label: 'Pesimista', desc: 'WACC +0.5 pp · g −0.5 pp · ventas −1 pp · margen −0.25 pp', value: p.ok ? p.value : null, upside: p.ok ? p.upside : null },
    { key: 'base', label: 'Base', desc: 'Supuestos activos del modelo', value: base.value, upside: base.upside },
    { key: 'opt', label: 'Optimista', desc: 'WACC −0.5 pp · g +0.5 pp · ventas +1 pp · margen +0.25 pp', value: o.ok ? o.value : null, upside: o.ok ? o.upside : null }
  ];
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
  if (base.roll) out.push({ key: 'final', label: 'Precio objetivo', sub: 'A la fecha de valuación', value: base.value, lo: lo.ok ? lo.value : null, hi: hi.ok ? hi.value : null, main: true });
  else out[out.length - 1].main = true;
  if (ds.altForecasts) Object.keys(ds.altForecasts).forEach(k => {
    const af = ds.altForecasts![k], r = run(ds, { ...A, ...af.overrides, forecastKey: k, dGrowth: 0, dMargin: 0, dCapex: 0, dTax: 0 });
    if (r.ok) out.push({ key: k, label: 'Proyección base anterior', sub: af.short || 'Supuestos constantes', value: r.value, lo: null, hi: null, ref: true });
  });
  const m = ds.market || ({} as Dataset['market']);
  if (m.consensus) out.push({ key: 'cons', label: 'Consenso de analistas', sub: m.consensusLabel || '', value: m.consensus, lo: null, hi: null, ref: true });
  if (m.low52 && m.high52) out.push({ key: '52w', label: 'Rango 52 semanas', sub: 'Mercado', value: null, lo: m.low52, hi: m.high52, ref: true });
  return out;
}
