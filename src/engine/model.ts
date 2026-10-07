// ValuFlow · Motor de valuación reutilizable. No contiene datos de ninguna empresa.
// Capas: drivers → proyección FCFF → WACC (CAPM + iteración) → valor terminal (Gordon / múltiplo) → EV → Equity → valor por acción.
// Traducción 1:1 de project/vf-engine.js; tests/parity.test.ts verifica que los resultados sean idénticos.
import { buildFor } from './build';
import { fin } from './format';
import type { Assumptions, Dataset, DriverSet, ProjRow, Ratio, RollResult, RunResult, Series, WaccIter, WaccLeg, WaccResult } from './types';

const ratio = (s: Ratio): number => (typeof s === 'string' && s.startsWith('r:'))
  ? s.slice(2).split('/').map(Number).reduce((a, b) => a / b)
  : (s as number);
const arr = (v: Series, n: number): number[] => {
  const r = Array.isArray(v) ? v : ratio(v);
  return Array.isArray(r) ? r.slice(0, n).map(ratio) : Array(n).fill(r);
};

// ---------- Supuestos por defecto (vienen del dataset) ----------
export function defaults(ds: Dataset): Assumptions {
  const w = ds.wacc || ({} as Dataset['wacc']), v = ds.valuation || ({} as Dataset['valuation']), m = ds.market || ({} as Dataset['market']);
  const b = v.bridge || ({} as Dataset['valuation']['bridge']), r = v.roll || ({} as NonNullable<Dataset['valuation']['roll']>);
  return {
    forecastKey: 'final', dGrowth: 0, dMargin: 0, dCapex: 0, dTax: 0,
    g: v.g, waccMode: w.mode || 'iterated', waccManual: w.start ?? 12, keFixed: null,
    rf: w.rf, prm: w.prm, betaU: w.betaU, kdPre: w.kdPre, kdMarket: w.kdMarket ?? w.kdPre, taxShield: w.taxShield, taxMarket: w.taxMarket ?? w.taxShield,
    exitMultiple: v.exitMultiple ?? null, wGordon: Math.round((v.wGordon ?? 1) * 100),
    price: m.price, shares: m.shares, rollEnabled: !!r.enabled,
    bridgeDebt: b.debt ?? 0, bridgeLease: b.lease ?? 0, bridgeCash: b.cash ?? 0,
    // Solo existe si el dataset documenta escenarios de inflación (si no, la clave queda indefinida).
    inflation: ds.inflation ? ds.inflation.default : undefined
  };
}

// ---------- Drivers de proyección ----------
export function drivers(ds: Dataset, key?: string, inflation?: string): DriverSet {
  const f = ds.forecast, n = f.years.length, rev0 = f.base.revenue as number;
  const alt = key && key !== 'final' && ds.altForecasts && ds.altForecasts[key];
  // Proyección por drivers (réplica de la hoja del Excel): las filas dependen del escenario de inflación.
  const built = !alt ? buildFor(ds, inflation) : null;
  if (alt || (!f.rows && !built)) {
    const d = alt ? alt.drivers : f.drivers!;
    const nwcPct = arr(d.nwcPct, n);
    return { years: f.years, n, rev0, nwc0: f.base.nwc ?? nwcPct[0] * rev0, growth: arr(d.growth, n), margin: arr(d.margin, n), tax: arr(d.tax, n), da: arr(d.da, n), capex: arr(d.capex, n), nwcPct, derived: false };
  }
  const R = built ? built.rows : f.rows!;
  const out: DriverSet = { years: f.years, n, rev0, nwc0: f.base.nwc as number, growth: [], margin: [], tax: [], da: [], capex: [], nwcPct: [], derived: true };
  if (built) out.build = built;
  let prev = rev0, nwc = f.base.nwc as number;
  for (let i = 0; i < n; i++) {
    const rv = R.revenue[i];
    out.growth.push(rv / prev - 1); prev = rv;
    out.margin.push(R.ebit[i] / rv); out.tax.push(R.taxEbit[i] / R.ebit[i]);
    out.da.push(R.da[i] / rv); out.capex.push(R.capex[i] / rv);
    nwc = nwc - R.nwcRelease[i]; out.nwcPct.push(nwc / rv);
  }
  return out;
}

export function project(ds: Dataset, A: Assumptions): { rows: ProjRow[]; drivers: DriverSet } {
  const D = drivers(ds, A.forecastKey, A.inflation), rows: ProjRow[] = [];
  let rev = D.rev0, nwcPrev = D.nwc0;
  for (let i = 0; i < D.n; i++) {
    const gr = D.growth[i] + A.dGrowth / 100;
    rev = rev * (1 + gr);
    const margin = D.margin[i] + A.dMargin / 100, taxRate = D.tax[i] + A.dTax / 100;
    const ebit = rev * margin, tax = ebit * taxRate, nopat = ebit - tax;
    const da = rev * D.da[i], capex = rev * (D.capex[i] + A.dCapex / 100);
    const nwc = rev * D.nwcPct[i], dNwc = nwc - nwcPrev; nwcPrev = nwc;
    const fcf = nopat + da - capex - dNwc;
    rows.push({ year: D.years[i], n: i + 1, growth: gr, revenue: rev, margin, ebit, taxRate, tax, nopat, da, capex, capexPct: D.capex[i] + A.dCapex / 100, nwc, dNwc, fcf, ebitda: ebit + da });
  }
  return { rows, drivers: D };
}

function evGordon(rows: ProjRow[], w: number, g: number) {
  let s = 0; rows.forEach((r, i) => { s += r.fcf / Math.pow(1 + w, i + 1); });
  const last = rows[rows.length - 1];
  return s + last.fcf * (1 + g) / (w - g) / Math.pow(1 + w, rows.length);
}

// ---------- WACC: mercado, iterado al valor DCF, o manual ----------
export function wacc(ds: Dataset, A: Assumptions, rows: ProjRow[]): WaccResult {
  const W = ds.wacc || ({} as Dataset['wacc']), g = A.g / 100, rf = A.rf / 100, prm = A.prm / 100, bu = A.betaU;
  const D = W.debt ?? (A.bridgeDebt + A.bridgeLease);
  const nd = A.bridgeDebt + A.bridgeLease - A.bridgeCash;
  const tm = A.taxMarket / 100, Em = (A.price as number) * (A.shares as number);
  const deM = D / Em, betaM = bu * (1 + (1 - tm) * deM), keM = rf + betaM * prm, kdM = A.kdMarket / 100;
  const market: WaccLeg = { E: Em, D, de: deM, beta: betaM, ke: keM, kd: kdM, kdAT: kdM * (1 - tm), wE: Em / (D + Em), wD: D / (D + Em), tax: tm, wacc: NaN };
  market.wacc = market.wE * keM + market.wD * market.kdAT;
  const t = A.taxShield / 100, kdAT = A.kdPre / 100 * (1 - t);
  const iters: WaccIter[] = []; let w = fin(market.wacc) ? market.wacc : 0.12, conv: WaccIter | null = null;
  // El Excel itera un número fijo de veces (wacc.iterations); sin ese dato se itera hasta converger.
  const maxIt = W.iterations ?? 14;
  for (let k = 0; k < maxIt; k++) {
    if (!(w > g)) break;
    const E = evGordon(rows, w, g) - nd; if (!(E > 0)) break;
    const de = D / E, beta = bu * (1 + (1 - t) * de), ke = rf + beta * prm;
    const wout = E / (D + E) * ke + D / (D + E) * kdAT;
    iters.push({ k, win: w, E, de, beta, ke, wout, wE: E / (D + E), wD: D / (D + E) });
    conv = iters[iters.length - 1];
    if (Math.abs(wout - w) < 1e-10) break; w = wout;
  }
  const iterated: WaccLeg | null = conv ? { wacc: conv.wout, ke: conv.ke, beta: conv.beta, de: conv.de, E: conv.E, D, wE: conv.wE, wD: conv.wD, kd: A.kdPre / 100, kdAT, tax: t, converged: iters.length > 1 && Math.abs(conv.wout - conv.win) < 1e-6 } : null;
  let wv: number, ke: number, src: WaccLeg | null;
  if (A.waccMode === 'market') { wv = market.wacc; ke = market.ke; src = market; }
  else if (A.waccMode === 'manual') { wv = A.waccManual / 100; ke = A.keFixed != null ? A.keFixed / 100 : (iterated ? iterated.ke : market.ke); src = iterated || market; }
  else { wv = iterated ? iterated.wacc : NaN; ke = iterated ? iterated.ke : NaN; src = iterated; }
  return { wacc: wv, ke, mode: A.waccMode, market, iterated, iters, src, rf, prm, betaU: bu };
}

// ---------- Ejecución completa ----------
export function run(ds: Dataset, A: Assumptions): RunResult {
  const errors: string[] = [], warnings: string[] = [];
  const P = project(ds, A), rows = P.rows, n = rows.length;
  const g = A.g / 100, shares = +(A.shares as number), price = +(A.price as number);
  if (!fin(A.g)) errors.push('Falta el crecimiento perpetuo (g).');
  if (!(shares > 0)) errors.push('No fue posible calcular el valor intrínseco porque falta el número de acciones en circulación.');
  if (!(price > 0)) warnings.push('No hay precio de mercado: no se puede calcular el upside/downside.');
  if (!rows.every(r => fin(r.fcf))) errors.push('Faltan datos necesarios para proyectar el FCFF.');
  const W = wacc(ds, A, rows);
  if (!fin(W.wacc)) errors.push('No fue posible calcular el WACC con los insumos actuales.');
  else if (!(W.wacc > g)) errors.push('El crecimiento perpetuo debe ser menor que el WACC.');
  if (errors.length) return { ok: false, errors, warnings, rows, W, drivers: P.drivers };
  const w = W.wacc; let pvSum = 0;
  const drows = rows as (ProjRow & { df: number; pv: number })[];
  drows.forEach((r, i) => { r.df = 1 / Math.pow(1 + w, i + 1); r.pv = r.fcf * r.df; pvSum += r.pv; });
  const last = drows[n - 1], dfN = last.df;
  const fcfN1 = last.fcf * (1 + g), tvG = fcfN1 / (w - g), pvTvG = tvG * dfN, evG = pvSum + pvTvG;
  const mult = (A.exitMultiple ?? 0) > 0 ? A.exitMultiple as number : null;
  const tvM = mult ? last.ebitda * mult : null, pvTvM = mult ? tvM! * dfN : null, evM = mult ? pvSum + pvTvM! : null;
  const wG = mult ? Math.min(1, Math.max(0, A.wGordon / 100)) : 1;
  const evW = mult ? wG * evG + (1 - wG) * evM! : evG;
  const nd = A.bridgeDebt + A.bridgeLease - A.bridgeCash;
  const eqClose = evW - nd, priceClose = eqClose / shares;
  const priceG = (evG - nd) / shares, priceM = mult ? (evM! - nd) / shares : null;
  const R = (ds.valuation && ds.valuation.roll) || ({} as NonNullable<Dataset['valuation']['roll']>);
  let roll: RollResult | null = null, eqVal = eqClose, value = priceClose;
  if (A.rollEnabled && R.enabled !== undefined) {
    const t1 = R.t1 as number, t2 = R.t2 as number, fcfGenerated = R.fcfGenerated as number;
    const debt = R.debt as number, lease = R.lease as number, cash = R.cash as number;
    const cap = Math.pow(1 + w, t1), evCap = evW * cap, ev2 = evCap + fcfGenerated;
    const eq2 = ev2 - debt - lease + cash, keCap = Math.pow(1 + W.ke, t2), eq3 = eq2 * keCap;
    roll = { t1, t2, cap, evCap, capGain: evCap - evW, fcfGenerated, ev2, debt, lease, cash, eq2, keCap, keGain: eq3 - eq2, eq3 };
    eqVal = eq3; value = eq3 / shares;
  }
  const upside = price > 0 ? value / price - 1 : null;
  const th = ((ds.valuation && ds.valuation.signalThreshold) ?? 15) / 100;
  const signal = upside == null ? null : (Math.abs(upside) <= th ? 'Mantener' : (upside > 0 ? 'Valor por encima del umbral' : 'Valor por debajo del umbral'));
  return {
    ok: true, errors, warnings, rows: drows, drivers: P.drivers, W, wacc: w, ke: W.ke, g,
    pvSum, fcfN1, tvG, pvTvG, evG, mult, tvM, pvTvM, evM, wG, evW, nd, eqClose, priceClose, priceG, priceM,
    pvTvW: wG * pvTvG + (1 - wG) * (pvTvM || 0), tvWeightG: pvTvG / evG, tvWeightW: (wG * pvTvG + (1 - wG) * (pvTvM || 0)) / evW,
    roll, eqVal, ev: roll ? roll.ev2 : evW, value, price, shares, upside, signal, threshold: th,
    impliedMultiple: tvG / last.ebitda
  };
}

/** ¿Los supuestos son exactamente los del dataset? (habilita la comparación contra la fuente). */
export function isDefault(ds: Dataset, A: Assumptions): boolean {
  const D = defaults(ds) as unknown as Record<string, unknown>, X = A as unknown as Record<string, unknown>;
  return Object.keys(D).every(k => (D[k] ?? null) === (X[k] ?? null) || (typeof D[k] === 'number' && Math.abs((D[k] as number) - (X[k] as number)) < 1e-9));
}
