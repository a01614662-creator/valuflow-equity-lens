// Capa de validación (consistencia interna + comparación contra la fuente) y lectura rápida.
import { grid, scenarios, type TornadoRow } from './analysis';
import { fin, fmt } from './format';
import { labelsOf } from './labels';
import { defaults, run } from './model';
import { isNum, relative } from './multiples';
import type { Assumptions, Dataset, RunOk, RunResult } from './types';

export type CheckStatus = 'pass' | 'review' | 'na';
export interface Check { group: string; label: string; status: CheckStatus; detail?: string; calc?: string; exp?: string }

/** Grupo de las comparaciones contra los resultados de referencia del dataset. */
export const SOURCE_GROUP = 'Excel';

export function validate(ds: Dataset, A: Assumptions, base: RunResult, isBase: boolean): Check[] {
  // Con escenarios de inflación, la referencia es la columna del Excel del escenario activo.
  const E = (A.inflation && ds.expectedScenarios && ds.expectedScenarios[A.inflation]) || ds.expected, checks: Check[] = [];
  const add = (group: string, label: string, ok: boolean | null, detail?: string, calc?: string, exp?: string) =>
    checks.push({ group, label, status: ok === null ? 'na' : (ok ? 'pass' : 'review'), detail, calc, exp });
  const L = labelsOf(ds), Y = ds.forecast.years;
  add('Datos', 'Acciones en circulación > 0', (A.shares ?? 0) > 0, 'Acciones: ' + fmt.n(A.shares, 1) + ' mm');
  add('Datos', 'Precio de mercado disponible', (A.price ?? 0) > 0, 'Precio: ' + fmt.cur(A.price));
  add('Datos', 'Proyección completa (' + Y.length + ' años)', base.ok && base.rows.every(r => fin(r.fcf)), Y.join(' · '));
  if (!base.ok) { base.errors.forEach(e => add('Modelo', e, false, '')); return checks; }
  add('Modelo', 'WACC > g', base.wacc > base.g, fmt.p(base.wacc) + ' > ' + fmt.p(base.g));
  if (base.W.iterated) add('Modelo', 'Iteración del WACC convergió', !!base.W.iterated.converged, base.W.iters.length + ' iteraciones');
  const b = base.rows.reduce((s, r) => s + r.pv, 0);
  add('Modelo', 'Σ VP de FCF = VPN explícito', Math.abs(b - base.pvSum) < 1e-6, fmt.m(base.pvSum, 1));
  add('Modelo', 'EV = VPN FCF + VP valor terminal', Math.abs(base.evG - base.pvSum - base.pvTvG) < 1e-6, fmt.m(base.evG, 1));
  add('Modelo', 'Equity = EV − deuda neta', Math.abs(base.eqClose - (base.evW - base.nd)) < 1e-6, fmt.m(base.eqClose, 1));
  const bd = base.drivers.build;
  if (bd) {
    add('Modelo', 'Balance proyectado cuadra (activo = pasivo + capital)', bd.years.every(y => Math.abs(y.check) < 0.5), 'Máx. diferencia ' + fmt.m(Math.max(...bd.years.map(y => Math.abs(y.check))), 6));
    add('Modelo', 'FCF de la proyección = FCF descontado', bd.years.every((y, i) => Math.abs(y.fcf - base.rows[i].fcf) < 1e-6), 'Proyección por drivers vs. motor DCF');
  }
  const s = scenarios(ds, A, base).filter(x => x.constant);
  if (s.length > 1) add('Modelo', 'Escenarios de inflación ordenados (menor inflación → menor valor)', s.every((x, i) => i === 0 || (x.inflation > s[i - 1].inflation) === ((x.value as number) > (s[i - 1].value as number))), s.map(x => x.label + ' ' + fmt.cur(x.value)).join(' · '));
  // Valuación relativa y combinada (solo si el dataset la documenta).
  const RV = ds.comps || ds.combined ? relative(ds, A, base.value) : null;
  if (RV && RV.comps) {
    const C = RV.comps;
    add('Múltiplos', 'Trading Comps · muestra con al menos 3 comparables', C.n >= 3, C.n + ' comparables incluidos');
    add('Múltiplos', 'Trading Comps · al menos un múltiplo usado con precio', C.used > 0, C.used + ' múltiplos usados');
  }
  if (RV && RV.transactions) add('Múltiplos', 'Precedent Transactions · operaciones incluidas', RV.transactions.n > 0, RV.transactions.n + ' operaciones · ' + RV.transactions.checks.filter(c => c.inWindow).length + ' dentro de la ventana');
  if (RV && RV.combined) {
    const K = RV.combined;
    add('Múltiplos', 'Valuación combinada · pesos suman 100%', Math.abs(K.weightSum - 1) < 1e-9, K.rows.map(r => r.label + ' ' + Math.round(r.weight * 100) + '%').join(' · '));
    add('Múltiplos', 'Valuación combinada · todo método con peso tiene precio', K.errors.length === 0, K.errors.join(' ') || 'Sin métodos en NA con peso');
  }
  if (E && isBase) {
    const tol = (c: number, e: number, t: number) => Math.abs(c - e) <= t;
    base.rows.forEach((r, i) => add(SOURCE_GROUP, 'FCF ' + r.year, tol(r.fcf, E.fcf[i], 1.0), '', fmt.m(r.fcf, 1), fmt.m(E.fcf[i], 1)));
    const pct = (v: number) => v.toFixed(2) + '%', mm = (v: number) => fmt.m(v, 1), cur = (v: number) => fmt.cur(v), p1 = (v: number) => v.toFixed(1) + '%';
    const rows: [string, number | null | undefined, number, number, (v: number) => string][] = [
      ['WACC iterado', base.wacc * 100, E.wacc, 0.01, pct], ['Ke', base.ke * 100, E.ke, 0.01, pct],
      ['VPN FCF ' + Y[0] + '–' + Y[Y.length - 1], base.pvSum, E.pvFcf, 3, mm], ['Valor terminal (Gordon)', base.tvG, E.tvG, 25, mm],
      ['VP valor terminal (Gordon)', base.pvTvG, E.pvTvG, 15, mm], ['EV Gordon', base.evG, E.evG, 25, mm],
      ['EV múltiplos', base.evM, E.evM, 15, mm], ['EV ponderado', base.evW, E.evW, 15, mm],
      ['EV al ' + L.rollDate, base.roll && base.roll.ev2, E.ev2, 15, mm], ['Equity a la fecha de valuación', base.eqVal, E.eqVal, 15, mm],
      ['Precio Gordon', base.priceG, E.priceG, 0.02, cur], ['Precio múltiplos', base.priceM, E.priceM, 0.02, cur],
      ['Precio ponderado (' + L.closeDate + ')', base.priceClose, E.priceW, 0.02, cur], ['Valor intrínseco por acción', base.value, E.price, 0.02, cur],
      ['Potencial vs. precio', (base.upside as number) * 100, E.upside, 0.1, p1], ['Peso del valor terminal (Gordon)', base.tvWeightG * 100, E.tvWeight, 0.1, p1],
      ['WACC a valor de mercado', base.W.market.wacc * 100, E.waccMarket, 0.01, pct], ['Ke a valor de mercado', base.W.market.ke * 100, E.keMarket, 0.01, pct]
    ];
    rows.forEach(([l, c, e, t, f]) => add(SOURCE_GROUP, l, fin(c) ? tol(c, e, t) : null, '', fin(c) ? f(c) : '—', f(e)));
    // Valuación relativa: solo se compara si la muestra y los pesos son los del dataset.
    const noOverrides = !A.compsInclude && !A.compsUse && !A.dealsInclude && !A.dealsUse && !A.weights;
    if (RV && noOverrides) {
      const rel: [string, unknown, number | undefined][] = [['Trading Comps', RV.comps && RV.comps.value, E.comps], ['Precedent Transactions', RV.transactions && RV.transactions.value, E.transactions], ['Valuación combinada', RV.combined && RV.combined.value, E.combined]];
      rel.forEach(([l, c, e]) => { if (e != null) add(SOURCE_GROUP, l, isNum(c) ? tol(c, e, 0.02) : false, '', isNum(c) ? cur(c) : String(c), cur(e)); });
    }
    const sr = E.sensRow;
    if (sr) {
      const gr = grid(ds, A, base);
      add(SOURCE_GROUP, 'Sensibilidad · fila WACC base', gr.cells[2].every((v, i) => v != null && tol(v, sr[i], 0.02)), '', gr.cells[2].map(v => (v as number).toFixed(2)).join(' · '), sr.map(v => v.toFixed(2)).join(' · '));
    }
    if (ds.altForecasts) Object.keys(ds.altForecasts).forEach(k => {
      const af = ds.altForecasts![k];
      if (!af.expected) return;
      const r = run(ds, { ...defaults(ds), ...af.overrides, forecastKey: k });
      add(SOURCE_GROUP, af.label, r.ok ? tol(r.value, af.expected.price, 0.02) : false, '', r.ok ? fmt.cur(r.value) : '—', fmt.cur(af.expected.price));
    });
  } else if (E) add(SOURCE_GROUP, 'Comparación contra el ' + L.sourceShort, null, 'Disponible solo con los supuestos base');
  return checks;
}

export interface Insight { k: string; v: string; t: string }

export function insights(ds: Dataset, A: Assumptions, base: RunResult, torn?: TornadoRow[]): Insight[] {
  if (!base.ok) return [];
  const f = fmt, out: Insight[] = [];
  if (base.upside != null) out.push({ k: 'Valor vs. precio', v: f.pp(base.upside), t: 'El valor intrínseco (' + f.cur(base.value) + ') se ubica ' + f.p(Math.abs(base.upside), 1) + (base.upside < 0 ? ' por debajo' : ' por encima') + ' del precio de mercado (' + f.cur(base.price) + ').' });
  out.push({ k: 'Peso del valor terminal', v: f.p(base.tvWeightG, 1), t: 'El valor terminal explica ' + f.p(base.tvWeightG, 1) + ' del EV (Gordon); el resultado es sensible a WACC y g.' });
  if (base.W.iterated && base.W.market && A.waccMode === 'iterated') out.push({ k: 'Costo de capital', v: f.p(base.wacc), t: 'El WACC iterado al valor DCF es ' + f.p(Math.abs(base.W.market.wacc - base.wacc)) + (base.wacc < base.W.market.wacc ? ' menor' : ' mayor') + ' que el WACC a valor de mercado (' + f.p(base.W.market.wacc) + ').' });
  else out.push({ k: 'Costo de capital', v: f.p(base.wacc), t: 'Los flujos se descuentan a un WACC de ' + f.p(base.wacc) + ' con Ke de ' + f.p(base.ke) + '.' });
  const r0 = base.rows[0], rN = base.rows[base.rows.length - 1];
  // El crecimiento compuesto solo tiene sentido si ambos flujos son positivos (con negativos daría NaN).
  if (r0.fcf > 0 && rN.fcf > 0 && base.rows.length > 1) {
    const cagr = Math.pow(rN.fcf / r0.fcf, 1 / (base.rows.length - 1)) - 1;
    out.push({ k: 'Flujo libre', v: f.pp(cagr), t: 'El FCF pasa de ' + f.m(r0.fcf) + ' (' + r0.year + ') a ' + f.m(rN.fcf) + ' (' + rN.year + '): crecimiento anual compuesto de ' + f.p(cagr, 1) + '.' });
  } else {
    out.push({ k: 'Flujo libre', v: f.m(rN.fcf), t: 'El FCF pasa de ' + f.m(r0.fcf) + ' (' + r0.year + ') a ' + f.m(rN.fcf) + ' (' + rN.year + ').' });
  }
  if (torn && torn[0]) out.push({ k: 'Supuesto más sensible', v: f.cur(torn[0].range), t: torn[0].label + ' genera el mayor rango de valor por acción entre sus escenarios extremos.' });
  return out;
}
