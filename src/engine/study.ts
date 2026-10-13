// Estudio de soporte de la valuación (hojas Inflación, Precio e IPC, Beta Regresión, Crecimiento Perpetuo, Escenarios
// y Validación del Excel del estudio). Todo se calcula aquí a partir de las series crudas del dataset; el Excel solo
// se usa en las pruebas para comprobar que los resultados coinciden. No contiene datos de ninguna empresa.
import { correl, expFitR, linFit, mean, regression, round, stdev, type Regression } from './stats';
import type { Assumptions, Dataset, StudySpec } from './types';

const DAY = 86400000;
const toT = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const eomonth = (t: number) => { const d = new Date(t); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0); };
const addMonths = (t: number, k: number) => { const d = new Date(t); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + k, 1); };
const seq = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
/** FIXED de Excel (separador de miles con coma). */
export const fixed = (x: number, d: number) => {
  const [i, f] = Math.abs(x).toFixed(d).split('.'), s = (x < 0 && +Math.abs(x).toFixed(d) !== 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return f ? s + '.' + f : s;
};

const cache = new WeakMap<object, Map<string, unknown>>();
function memo<T>(owner: object, key: string, f: () => T): T {
  let m = cache.get(owner); if (!m) { m = new Map(); cache.set(owner, m); }
  if (!m.has(key)) m.set(key, f());
  return m.get(key) as T;
}

// ------------------------------------------------------------------ inflación (hoja Inflación)
export interface TrendModel {
  key: string; label: string; n: number; m: number; b: number; r2: number; x: number; lin: number; a: number; k: number; r2exp: number; exp: number;
  eqLin: string; eqExp: string; xs: number[]; ys: number[]; dates: string[];
}
export interface InflationStudy {
  n: number; first: string; last: string; lastValue: number; longStartIndex: number; longN: number;
  models: TrendModel[]; rates: Record<string, number>;
}

function trend(key: string, label: string, ys: number[], dates: string[], xNext: number): TrendModel {
  const xs = seq(ys.length), l = linFit(ys, xs), e = expFitR(ys, xs);
  return {
    key, label, n: ys.length, m: l.m, b: l.b, r2: l.r2, x: xNext, lin: l.m * xNext + l.b, a: e.a, k: e.k, r2exp: e.r2, exp: e.a * Math.exp(e.k * xNext),
    eqLin: 'y = ' + fixed(l.m, 5) + 'x + ' + fixed(l.b, 4), eqExp: 'y = ' + fixed(e.a, 4) + ' e^(' + fixed(e.k, 5) + 'x)', xs, ys, dates
  };
}

export function inflationStudy(S: StudySpec): InflationStudy {
  return memo(S, 'infl', () => {
    const I = S.inflation, v = I.series.map(s => s[1]), d = I.series.map(s => s[0]), n = v.length;
    const last = v.slice(n - 25), lastD = d.slice(n - 25);
    const q = [0, 1, 2, 3].map(k => avg(last.slice(6 * k, 6 * k + 6))), qd = [0, 1, 2, 3].map(k => lastD[6 * k]);
    const start = d.filter(x => x < I.longWindowStart).length + 1, longN = n - start + 1;
    const lv = v.slice(start - 1), ld = d.slice(start - 1), nb = Math.floor(longN / 6);
    const lq = seq(nb).map(k => avg(lv.slice(6 * (k - 1), 6 * k))), lqd = seq(nb).map(k => ld[6 * (k - 1)]);
    const models = [
      trend('immediate', 'Ciclo inmediato: último año, quincenal', last, lastD, 26),
      trend('medium', 'Ciclo mediano plazo: último año, trimestral', q, qd, 5),
      trend('long', 'Tendencia larga: quincenal desde el inicio de la ventana larga', lv, ld, longN + 1),
      trend('longQ', 'Tendencia larga: trimestral (solo trimestres completos)', lq, lqd, nb + 1)
    ];
    // Escenarios (Inflación!B20:B22): Base = modelo exponencial trimestral del último año; Optimista = la proyección más baja.
    const rates = { conservador: I.scenarioConservative, base: round(models[1].exp, 2) / 100, optimista: round(Math.min(...models.map(m => m.exp)), 2) / 100 };
    return { n, first: d[0], last: d[n - 1], lastValue: v[n - 1], longStartIndex: start, longN, models, rates };
  });
}

// ------------------------------------------------------------------ inflación frente al precio (mensual)
export interface Month { month: string; infl: number | null; price: number | null; ret: number | null; dInfl: number | null }
export interface MonthlyStudy {
  months: Month[]; valid: Month[];
  correl: { label: string; value: number; n: number }[];
  linear: { n: number; m: number; b: number; r2: number; atBase: number; eq: string };
  exponential: { n: number; a: number; k: number; r2: number; atBase: number; eq: string };
  moves: { label: string; month: string; dInfl: number; infl: number; ret: number }[];
  avgUp: { value: number; n: number }; avgDown: { value: number; n: number };
}

export function monthlyStudy(S: StudySpec): MonthlyStudy {
  return memo(S, 'monthly', () => {
    const Q = S.inflation.series.map(s => [toT(s[0]), s[1]] as [number, number]), W = S.prices.weekly.filter(w => w[1] != null).map(w => [toT(w[0]), w[1] as number] as [number, number]);
    const first = Q[0][0], lastQ = Q[Q.length - 1][0], base = inflationStudy(S).rates.base;
    const months: Month[] = [];
    for (let t = Date.UTC(new Date(first).getUTCFullYear(), new Date(first).getUTCMonth(), 1); t <= lastQ; t = addMonths(t, 1)) {
      const e = eomonth(t), qs = Q.filter(q => q[0] >= t && q[0] <= e).map(q => q[1]);
      const ws = W.filter(w => w[0] >= t && w[0] <= e);
      const price = ws.length ? ws.reduce((a, b) => (b[0] > a[0] ? b : a))[1] : null;
      months.push({ month: iso(t), infl: qs.length ? avg(qs) : null, price, ret: null, dInfl: null });
    }
    months.forEach((m, i) => { if (i > 0) { const p = months[i - 1]; m.ret = m.price != null && p.price != null ? m.price / p.price - 1 : null; m.dInfl = m.infl != null && p.infl != null ? m.infl - p.infl : null; } });
    const valid = months.filter(m => m.infl != null && m.price != null), N = valid.length;
    const pair = (ms: Month[], a: (m: Month) => number | null, b: (m: Month) => number | null) => { const xs = ms.filter(m => a(m) != null && b(m) != null); return { a: xs.map(m => a(m) as number), b: xs.map(m => b(m) as number) }; };
    const c = (label: string, p: { a: number[]; b: number[] }) => ({ label, value: correl(p.a, p.b), n: p.a.length });
    const vInf = valid.map(m => m.infl as number), vPx = valid.map(m => m.price as number);
    const lin = linFit(vPx, vInf), ex = expFitR(vPx, vInf), b100 = base * 100;
    const withMove = months.filter(m => m.dInfl != null);
    const pick = (desc: boolean, k: number) => { const s = [...withMove].sort((x, y) => desc ? (y.dInfl as number) - (x.dInfl as number) : (x.dInfl as number) - (y.dInfl as number)); return s[k]; };
    const moves = [0, 1, 2].map(k => ({ label: 'Mayor alza ' + (k + 1), m: pick(true, k) })).concat([0, 1, 2].map(k => ({ label: 'Mayor baja ' + (k + 1), m: pick(false, k) })))
      .map(x => ({ label: x.label, month: x.m.month, dInfl: x.m.dInfl as number, infl: x.m.infl as number, ret: x.m.ret as number }));
    const ru = months.filter(m => m.ret != null && m.dInfl != null && m.dInfl > 0), rd = months.filter(m => m.ret != null && m.dInfl != null && m.dInfl < 0);
    return {
      months, valid,
      correl: [
        c('Nivel de precio vs nivel de inflación (toda la muestra)', { a: vInf, b: vPx }),
        c('Nivel de precio vs nivel de inflación (últimos 12 meses)', { a: vInf.slice(N - 12), b: vPx.slice(N - 12) }),
        c('Nivel de precio vs nivel de inflación (últimos 6 meses)', { a: vInf.slice(N - 6), b: vPx.slice(N - 6) }),
        c('Rendimiento mensual de Soriana vs cambio de la inflación', pair(months, m => m.ret, m => m.dInfl)),
        c('Rendimiento mensual de Soriana vs nivel de la inflación', pair(months, m => m.ret, m => m.ret != null ? m.infl : null))
      ],
      linear: { n: N, m: lin.m, b: lin.b, r2: lin.r2, atBase: lin.m * b100 + lin.b, eq: 'y = ' + fixed(lin.m, 4) + 'x + ' + fixed(lin.b, 4) },
      exponential: { n: N, a: ex.a, k: ex.k, r2: ex.r2, atBase: ex.a * Math.exp(ex.k * b100), eq: 'y = ' + fixed(ex.a, 4) + ' e^(' + fixed(ex.k, 5) + 'x)' },
      moves,
      avgUp: { value: avg(ru.map(m => m.ret as number)), n: ru.length }, avgDown: { value: avg(rd.map(m => m.ret as number)), n: rd.length }
    };
  });
}

// ------------------------------------------------------------------ precio de Soriana e IPC (semanal)
export interface SeriesModel { n: number; m: number; b: number; r2: number; x: number; lin: number; a: number; k: number; r2exp: number; exp: number; growth: number; exp52: number; eqLin: string; eqExp: string }
export interface ReturnStats { n: number; mean: number; annual: number; vol: number; volAnnual: number; cumulative: number }
export interface PricesStudy {
  weeks: { date: string; soriana: number | null; ipc: number | null; retS: number | null; retI: number | null }[];
  soriana: SeriesModel; ipc: SeriesModel; retSoriana: ReturnStats; retIpc: ReturnStats; correl: number;
  base100: { date: string; soriana: number | null; ipc: number | null }[];
}

function seriesModel(pts: [number, number][]): SeriesModel {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), l = linFit(ys, xs), e = expFitR(ys, xs), x = Math.max(...xs) + 1;
  return {
    n: pts.length, m: l.m, b: l.b, r2: l.r2, x, lin: l.m * x + l.b, a: e.a, k: e.k, r2exp: e.r2, exp: e.a * Math.exp(e.k * x), growth: Math.exp(52 * e.k) - 1, exp52: e.a * Math.exp(e.k * (x + 51)),
    eqLin: 'y = ' + fixed(l.m, 5) + 'x + ' + fixed(l.b, 4), eqExp: 'y = ' + fixed(e.a, 4) + ' e^(' + fixed(e.k, 6) + 'x)'
  };
}
function retStats(r: number[], first: number, last: number): ReturnStats {
  const m = mean(r), sd = stdev(r);
  return { n: r.length, mean: m, annual: Math.pow(1 + m, 52) - 1, vol: sd, volAnnual: sd * Math.sqrt(52), cumulative: last / first - 1 };
}

export function pricesStudy(S: StudySpec): PricesStudy {
  return memo(S, 'prices', () => {
    const W = S.prices.weekly;
    const weeks = W.map((w, i) => ({ date: w[0], soriana: w[1], ipc: w[2], retS: i > 0 && w[1] != null && W[i - 1][1] != null ? (w[1] as number) / (W[i - 1][1] as number) - 1 : null, retI: i > 0 && w[2] != null && W[i - 1][2] != null ? (w[2] as number) / (W[i - 1][2] as number) - 1 : null }));
    const sPts = W.map((w, i) => [i + 1, w[1]] as [number, number | null]).filter(p => p[1] != null) as [number, number][];
    const iPts = W.map((w, i) => [i + 1, w[2]] as [number, number | null]).filter(p => p[1] != null) as [number, number][];
    const lastIdx = W.reduce((b, w, i) => (w[0] > W[b][0] ? i : b), 0);
    const pairs = betaPairs(S);
    return {
      weeks, soriana: seriesModel(sPts), ipc: seriesModel(iPts),
      retSoriana: retStats(weeks.filter(w => w.retS != null).map(w => w.retS as number), W[0][1] as number, W[lastIdx][1] as number),
      retIpc: retStats(weeks.filter(w => w.retI != null).map(w => w.retI as number), W[0][2] as number, W[lastIdx][2] as number),
      correl: correl(pairs.y, pairs.x),
      base100: W.map(w => ({ date: w[0], soriana: w[1] != null ? (w[1] as number) / (W[0][1] as number) * 100 : null, ipc: w[2] != null ? (w[2] as number) / (W[0][2] as number) * 100 : null }))
    };
  });
}

// ------------------------------------------------------------------ beta por regresión (hoja Beta Regresión)
/** Pares válidos (rendimiento de Soriana y del IPC en la misma semana), últimos N de la ventana. */
export function betaPairs(S: StudySpec) {
  return memo(S, 'pairs', () => {
    const W = S.prices.weekly, P: { date: string; y: number; x: number }[] = [];
    for (let i = 1; i < W.length; i++) {
      const [d, s, c] = W[i], [, s0, c0] = W[i - 1];
      if (s != null && s0 != null && c != null && c0 != null) P.push({ date: d, y: s / s0 - 1, x: c / c0 - 1 });
    }
    const win = P.slice(Math.max(0, P.length - S.prices.betaWindowWeeks));
    return { dates: win.map(p => p.date), y: win.map(p => p.y), x: win.map(p => p.x), total: P.length };
  });
}
export interface BetaStudy extends Regression { enough: boolean; minObs: number; window: number; pairs: { y: number[]; x: number[]; dates: string[] } }
export function betaStudy(S: StudySpec): BetaStudy {
  return memo(S, 'beta', () => {
    const p = betaPairs(S), r = regression(p.y, p.x);
    return { ...r, enough: r.n >= S.prices.betaMinObs, minObs: S.prices.betaMinObs, window: S.prices.betaWindowWeeks, pairs: p };
  });
}

// ------------------------------------------------------------------ escenarios (hoja Escenarios)
export interface ScenarioParams { key: string; label: string; inflationRate: number; salesAdj: number; marginAdj: number; betaLevered: number; g: number }

/** Parámetros de cada escenario del dataset, con la inflación de los modelos y la beta ± un error típico. */
export function scenarioPresets(ds: Dataset): ScenarioParams[] {
  const S = ds.study; if (!S) return [];
  return memo(S, 'presets', () => {
    const I = inflationStudy(S), B = betaStudy(S), C = S.scenarios, G = S.growth.scenarios;
    return C.order.map(k => ({ key: k, label: C.labels[k], inflationRate: I.rates[k], salesAdj: C.salesAdj[k], marginAdj: C.marginAdj[k], betaLevered: B.slope + C.betaShiftSE[k] * B.se, g: G[k] * 100 }));
  });
}
export function presetPatch(p: ScenarioParams): Partial<Assumptions> {
  return { scenario: p.key, inflationRate: p.inflationRate, salesAdj: p.salesAdj, marginAdj: p.marginAdj, betaLevered: p.betaLevered, g: p.g };
}
/** Inflación del escenario base (alimenta la tasa real de Fisher). */
export const baseInflation = (ds: Dataset) => ds.study ? inflationStudy(ds.study).rates[ds.study.scenarios.default] : (ds.wacc.fisher?.baseInflation ?? 0);
