// Valuación relativa: Trading Comps, Precedent Transactions y valuación combinada.
// Metodología de clase (CIQ Valuations): 6 estadísticos con percentiles inclusivos; puente EV → capital
// (caja − deuda − arrendamientos − minoritarios − preferentes) ÷ acciones; valor del método = promedio de
// los precios implícitos con la MEDIA de cada múltiplo usado; NM si el capital implícito es ≤ 0; NA si falta el dato.
// Réplica de las hojas "Trading Comps", "Precedent Transactions" y "Valuación Combinada" del Excel maestro.
import type { Assumptions, CompsSpec, CompsTarget, Dataset, MultipleDef, MultipleKey, TransactionsSpec } from './types';

export type Price = number | 'NM' | 'NA';
export const isNum = (x: unknown): x is number => typeof x === 'number' && isFinite(x);

export interface Stats { min: number; p25: number; mean: number; median: number; p75: number; max: number; n: number }
export const STAT_KEYS = ['min', 'p25', 'mean', 'median', 'p75', 'max'] as const;
export type StatKey = typeof STAT_KEYS[number];
export const STAT_LABELS: Record<StatKey, string> = { min: 'Mínimo', p25: 'Percentil 25', mean: 'Media', median: 'Mediana', p75: 'Percentil 75', max: 'Máximo' };

/** Percentil con interpolación inclusiva (PERCENTILE / PERCENTILE.INC de Excel). */
export function percentile(sorted: number[], p: number): number {
  const h = (sorted.length - 1) * p, lo = Math.floor(h), hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
}

export function stats(xs: number[]): Stats | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), n = s.length;
  return { min: s[0], p25: percentile(s, 0.25), mean: xs.reduce((a, b) => a + b, 0) / n, median: percentile(s, 0.5), p75: percentile(s, 0.75), max: s[n - 1], n };
}

/** Ajuste neto EV → capital (mdp). */
export const bridgeAdj = (t: CompsTarget) => t.cash - t.debt - t.lease - t.minority - t.preferred;

const metricOf = (t: CompsTarget, m: MultipleDef['metric']) => m === 'revenue' ? t.revenue : m === 'ebitda' ? t.ebitda : m === 'ebit' ? t.ebit : m === 'eps' ? t.eps : null;

/** Precio implícito por acción de un múltiplo aplicado a la métrica de la empresa objetivo. */
export function impliedPrice(def: MultipleDef, multiple: number, t: CompsTarget): Price {
  const m = metricOf(t, def.metric);
  if (m == null || !isNum(multiple)) return 'NA';
  if (def.metric === 'eps') { const p = multiple * m; return p > 0 ? p : 'NM'; }
  const eq = multiple * m + bridgeAdj(t);
  return eq > 0 ? eq / t.shares : 'NM';
}

export interface MultipleResult {
  def: MultipleDef; use: number; values: number[]; stats: Stats | null;
  prices: Record<StatKey, Price>;
  /** Detalle a la media: métrica, EV, capital y precio. */
  detail: { metric: number | null; ev: number | null; equity: number | null; price: Price };
}

function multipleResult(def: MultipleDef, use: number, values: number[], t: CompsTarget): MultipleResult {
  const st = stats(values);
  const prices = Object.fromEntries(STAT_KEYS.map(k => [k, st && def.metric ? impliedPrice(def, st[k], t) : 'NA'])) as Record<StatKey, Price>;
  const metric = metricOf(t, def.metric);
  let ev: number | null = null, equity: number | null = null;
  if (st && metric != null) {
    if (def.metric === 'eps') equity = st.mean * metric * t.shares;
    else { ev = st.mean * metric; equity = ev + bridgeAdj(t); }
  }
  return { def, use, values, stats: st, prices, detail: { metric, ev, equity, price: prices.mean } };
}

/** Promedio de los precios numéricos de los múltiplos usados en un estadístico (NA si no hay ninguno). */
function aggregate(rs: MultipleResult[], k: StatKey): Price {
  const ps = rs.filter(r => r.use === 1).map(r => r.prices[k]).filter(isNum);
  return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : 'NA';
}

export interface CompsResult {
  spec: CompsSpec; include: number[]; n: number; adj: number;
  multiples: MultipleResult[];
  value: Price; p25: Price; p75: Price; used: number;
}

export function comps(spec: CompsSpec, A?: Partial<Assumptions>): CompsResult {
  const inc = spec.peers.map(p => A?.compsInclude?.[p.name] ?? p.include);
  const multiples = spec.multiples.map(d => {
    const use = A?.compsUse?.[d.key] ?? d.use;
    const values = spec.peers.map((p, i) => inc[i] === 1 ? p.multiples[d.key as MultipleKey] : null).filter(isNum);
    return multipleResult(d, use, values, spec.target);
  });
  const used = multiples.filter(r => r.use === 1 && isNum(r.prices.mean)).length;
  return { spec, include: inc, n: inc.filter(x => x === 1).length, adj: bridgeAdj(spec.target), multiples, value: aggregate(multiples, 'mean'), p25: aggregate(multiples, 'p25'), p75: aggregate(multiples, 'p75'), used };
}

export interface DealCheck { inWindow: boolean; inGeo: boolean; enoughMultiples: boolean }

export interface TransactionsResult {
  spec: TransactionsSpec; include: number[]; checks: DealCheck[]; windowStart: string; n: number;
  multiples: MultipleResult[]; value: Price; lo: Price; hi: Price; used: number;
}

/** Fecha ISO menos N años (EDATE de Excel con −12·N meses). */
export function minusYears(iso: string, years: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = Math.round(years * 12), total = y * 12 + (m - 1) - months;
  const ny = Math.floor(total / 12), nm = total % 12 + 1, last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return ny + '-' + String(nm).padStart(2, '0') + '-' + String(Math.min(d, last)).padStart(2, '0');
}

export function transactions(spec: TransactionsSpec, target: CompsTarget, A?: Partial<Assumptions>): TransactionsResult {
  const c = spec.criteria, windowStart = minusYears(c.valuationDate, c.windowYears);
  const inc = spec.deals.map(d => A?.dealsInclude?.[d.id] ?? d.include);
  const checks = spec.deals.map(d => ({ inWindow: d.date >= windowStart, inGeo: d.country === c.geography, enoughMultiples: [d.evSales, d.evEbitda].filter(isNum).length >= c.minMultiples }));
  const multiples = spec.multiples.map(def => {
    const use = A?.dealsUse?.[def.key] ?? def.use;
    const values = spec.deals.map((d, i) => inc[i] === 1 ? (d as unknown as Record<string, number | null>)[def.key] : null).filter(isNum);
    return multipleResult(def, use, values, target);
  });
  const used = multiples.filter(r => r.use === 1 && isNum(r.prices.mean)).length;
  return { spec, include: inc, checks, windowStart, n: inc.filter(x => x === 1).length, multiples, value: aggregate(multiples, 'mean'), lo: aggregate(multiples, 'min'), hi: aggregate(multiples, 'max'), used };
}

export interface CombinedRow { key: 'dcf' | 'comps' | 'transactions'; label: string; price: Price; weight: number; classWeight: number; contribution: number }
export interface CombinedResult { rows: CombinedRow[]; weightSum: number; value: Price; classValue: Price; errors: string[] }

/**
 * Precio combinado = Σ (peso × precio), con pesos que deben sumar 100%. Si un método con peso > 0 no tiene
 * precio numérico, el resultado es NA (no se trata como cero). Igual que 'Valuación Combinada'!B11 del Excel.
 */
export function combine(prices: Record<CombinedRow['key'], Price>, weights: Record<CombinedRow['key'], number>): CombinedResult {
  const labels = { dcf: 'DCF', comps: 'Trading Comps', transactions: 'Precedent Transactions' };
  const keys = ['dcf', 'comps', 'transactions'] as const, errors: string[] = [];
  const rows = keys.map(k => ({ key: k, label: labels[k], price: prices[k], weight: weights[k], classWeight: 1 / 3, contribution: isNum(prices[k]) ? (prices[k] as number) * weights[k] : 0 }));
  const ws = rows.reduce((s, r) => s + r.weight, 0);
  rows.forEach(r => { if (r.weight > 0 && !isNum(r.price)) errors.push(r.label + ' tiene peso pero no tiene precio (' + r.price + ').'); });
  if (rows.some(r => !(r.weight >= 0))) errors.push('Los pesos no pueden ser negativos.');
  if (!(Math.abs(ws - 1) <= 1e-9)) errors.push('Los pesos deben sumar 100% (suman ' + (ws * 100).toFixed(2) + '%).');
  const value: Price = errors.length ? 'NA' : rows.reduce((s, r) => s + r.contribution, 0);
  const cls = rows.every(r => isNum(r.price)) ? rows.reduce((s, r) => s + (r.price as number) * r.classWeight, 0) / rows.reduce((s, r) => s + r.classWeight, 0) : 'NA';
  return { rows, weightSum: ws, value, classValue: cls, errors };
}

export interface RelativeResult { comps: CompsResult | null; transactions: TransactionsResult | null; combined: CombinedResult | null }

/** Valuación relativa y combinada del dataset; dcfPrice = precio final del DCF con los supuestos activos. */
export function relative(ds: Dataset, A: Assumptions, dcfPrice: Price): RelativeResult {
  const C = ds.comps ? comps(ds.comps, A) : null;
  const T = ds.transactions && ds.comps ? transactions(ds.transactions, ds.comps.target, A) : null;
  const W = A.weights ?? ds.combined?.weights;
  const combined = ds.combined && W ? combine({ dcf: dcfPrice, comps: C ? C.value : 'NA', transactions: T ? T.value : 'NA' }, W) : null;
  return { comps: C, transactions: T, combined };
}
