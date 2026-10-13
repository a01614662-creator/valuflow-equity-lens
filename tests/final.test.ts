// Paridad Excel (SORIANA_FINAL.xlsx) = app. Los resultados esperados se leen del Excel con scripts/build-dataset.py;
// la app los recalcula desde las series crudas y los supuestos. Tolerancias del proyecto: precio ±0.01 MXN, tasas ±0.01 pp, montos ±1 mdp.
import { describe, expect, it } from 'vitest';
import * as E from '../src/engine';
import { soriana as ds } from '../src/data/soriana';
import { SORIANA_FINAL as X } from '../src/data/soriana.final';

const A = E.defaults(ds), base = E.run(ds, A) as E.RunOk, XD = X.expected.dcf;
const near = (a: number | null | undefined, b: number, tol: number) => expect(Math.abs((a as number) - b), `${a} vs ${b}`).toBeLessThanOrEqual(tol);
const PRICE = 0.01, RATE = 0.0001, MDP = 1;

describe('DCF base', () => {
  it('corre sin errores', () => expect(base.ok).toBe(true));
  it('FCF 2026E–2030E', () => base.rows.forEach((r, i) => near(r.fcf, XD.fcf[i], MDP)));
  it('WACC, Ke, beta iterada', () => { near(base.wacc, XD.wacc, RATE); near(base.ke, XD.ke, RATE); near(base.W.iterated!.beta, XD.betaIter, 1e-4); near(base.W.market.wacc, XD.waccMarket, RATE); near(base.W.market.ke, XD.keMarket, RATE); near(base.W.market.beta, XD.betaMarket, 1e-6); near(base.W.betaU, XD.betaU, 1e-6); });
  it('valor terminal y EV', () => {
    near(base.pvSum, XD.pvFcf, MDP); near(base.tvG, XD.tvG, MDP); near(base.tvM, XD.tvM, MDP); near(base.evW, XD.evW, MDP);
    near(base.wG * base.tvG + (1 - base.wG) * (base.tvM as number), XD.tvBlend, MDP); near(base.tvWeightW, XD.tvWeight, 1e-4); near(E.impliedGrowth(base), XD.impliedG, 1e-6);
  });
  it('puente al valor por acción', () => {
    near(base.roll!.ev2, XD.ev2, MDP); near(base.roll!.eq2, XD.eq2, MDP); near(base.eqVal, XD.eqVal, MDP);
    near(base.priceM, XD.priceM, PRICE); near(base.priceClose, XD.priceW, PRICE); near(base.value, XD.price, PRICE); near(base.upside, XD.upside, 1e-4);
    expect(base.signal).toBe('COMPRAR');
  });
  it('iteración del WACC fila por fila', () => base.W.iters.forEach((it, k) => { near(it.wout, XD.iterations[k][5], 1e-6); near(it.E, XD.iterations[k][1], MDP); }));
});

describe('Escenarios', () => {
  const S = E.scenarios(ds, A);
  it('tres escenarios en orden', () => expect(S.map(s => s.key)).toEqual(['conservador', 'base', 'optimista']));
  for (const k of ['conservador', 'base', 'optimista'] as const) it(k, () => {
    const s = S.find(x => x.key === k)!.m!, e = X.expected.scenarios[k];
    near(s.inflation, e.inflation, 1e-12); near(s.betaLevered, e.betaLevered, 1e-6); near(s.rf, e.rf, RATE); near(s.ke, e.ke, RATE); near(s.wacc, e.wacc, RATE);
    near(s.betaIter, e.betaIter, 1e-4); near(s.salesCagr, e.salesCagr, 1e-6); near(s.marginAvg, e.marginAvg, 1e-9); near(s.g, e.g, 1e-12);
    near(s.fcfLast, e.fcf2030, MDP); near(s.pvFcf, e.pvFcf, MDP); near(s.tvG, e.tvG, MDP); near(s.tvBlend, e.tvBlend, MDP); near(s.ev, e.ev, MDP); near(s.equity, e.equity, MDP);
    near(s.price, e.price, PRICE); expect(s.recommendation).toBe(e.recommendation);
  });
  it('tornado (orden y rangos)', () => {
    const T = E.tornado(ds, A, base);
    expect(T.map(t => t.label)).toEqual(X.expected.tornadoOrder);
    X.expected.tornado.forEach(x => { const t = T.find(y => y.label === x.label)!; near(t.low, x.priceLow, PRICE); near(t.high, x.priceHigh, PRICE); });
  });
  it('tabla WACC × g', () => { const G = E.grid(ds, A, base); X.expected.sensitivity.grid.forEach((r, i) => r.forEach((v, j) => near(G.cells[i][j], v, PRICE))); G.ws.forEach((w, i) => near(w / 100, X.expected.sensitivity.waccs[i], 1e-9)); });
  it('gráficas de sensibilidad', () => {
    const C = E.sensCharts(ds, A, base), sc = X.expected.sensCharts;
    sc.inflation.forEach(([x, v]) => near(C.inflation.find(p => Math.abs(p[0] - x) < 1e-12)![1], v, PRICE));
    sc.betaKe.forEach(([b, k], i) => { near(C.betaKe[i][0], b, 1e-12); near(C.betaKe[i][1], k, 1e-9); });
    sc.gEv.forEach(([g, ev], i) => { near(C.gEv[i][0], g, 1e-12); near(C.gEv[i][1], ev, MDP); });
  });
});

describe('Valuación relativa y combinada', () => {
  const RV = E.relative(ds, A, base.value);
  it('Trading Comps', () => { near(RV.comps!.value as number, X.expected.comps.value, PRICE); near(RV.comps!.p25 as number, X.expected.comps.p25, PRICE); near(RV.comps!.p75 as number, X.expected.comps.p75, PRICE); });
  it('Precedent Transactions', () => { near(RV.transactions!.value as number, X.expected.transactions.value, PRICE); near(RV.transactions!.lo as number, X.expected.transactions.lo, PRICE); near(RV.transactions!.hi as number, X.expected.transactions.hi, PRICE); });
  it('Combinado', () => near(RV.combined!.value as number, X.expected.combined.value, PRICE));
});

describe('Estudio: inflación, precios y beta (calculados desde las series)', () => {
  const S = ds.study!;
  it('modelos de inflación', () => {
    const I = E.inflationStudy(S);
    X.expected.inflation.models.forEach((e, i) => { const m = I.models[i]; expect(m.n).toBe(e.n); near(m.m, e.m, 1e-9); near(m.b, e.b, 1e-9); near(m.r2, e.r2, 1e-9); near(m.lin, e.lin, 1e-9); near(m.a, e.a, 1e-9); near(m.k, e.k, 1e-9); near(m.r2exp, e.r2exp, 1e-9); near(m.exp, e.exp, 1e-9); });
    expect(I.rates).toEqual(X.expected.inflation.scenarios);
  });
  it('inflación frente al precio (mensual)', () => {
    const M = E.monthlyStudy(S), e = X.expected.inflation;
    expect(M.valid.length).toBe(e.monthsValid);
    e.correl.forEach((c, i) => { near(M.correl[i].value, c[1] as number, 1e-9); expect(M.correl[i].n).toBe(c[2]); });
    near(M.linear.m, e.priceRegression[0].a, 1e-9); near(M.linear.b, e.priceRegression[0].b, 1e-9); near(M.linear.r2, e.priceRegression[0].r2, 1e-9); near(M.linear.atBase, e.priceRegression[0].atBase, 1e-9);
    near(M.exponential.a, e.priceRegression[1].a, 1e-9); near(M.exponential.k, e.priceRegression[1].b, 1e-9); near(M.exponential.r2, e.priceRegression[1].r2, 1e-9); near(M.exponential.atBase, e.priceRegression[1].atBase, 1e-9);
    e.moves.forEach((m, i) => { expect(M.moves[i].month).toBe(m[1]); near(M.moves[i].dInfl, m[2] as number, 1e-9); near(M.moves[i].ret, m[4] as number, 1e-9); });
    near(M.avgUp.value, e.avgReturnUp[0], 1e-12); expect(M.avgUp.n).toBe(e.avgReturnUp[1]); near(M.avgDown.value, e.avgReturnDown[0], 1e-12); expect(M.avgDown.n).toBe(e.avgReturnDown[1]);
  });
  it('precio de Soriana e IPC', () => {
    const P = E.pricesStudy(S), e = X.expected.prices;
    for (const k of ['soriana', 'ipc'] as const) Object.entries(e.models[k]).forEach(([f, v]) => near((P[k] as any)[f], v as number, Math.abs(v as number) * 1e-9 + 1e-9));
    Object.entries(e.returns.soriana).forEach(([f, v]) => near((P.retSoriana as any)[f], v, 1e-9));
    Object.entries(e.returns.ipc).forEach(([f, v]) => near((P.retIpc as any)[f], v, 1e-9));
    near(P.correl, e.correl, 1e-9);
  });
  it('regresión de la beta (tabla completa)', () => {
    const B = E.betaStudy(S), e = X.expected.beta;
    expect(B.n).toBe(e.n); near(B.slope, e.beta, 1e-9); near(B.se, e.se, 1e-9); near(B.t, e.t, 1e-7); near(B.p, e.p, 1e-7); near(B.lo, e.lo, 1e-7); near(B.hi, e.hi, 1e-7);
    near(B.r, e.r, 1e-9); near(B.r2, e.r2, 1e-9); near(B.r2adj, e.r2adj, 1e-9); near(B.steyx, e.steyx, 1e-9); near(B.F, e.F, 1e-7); near(B.pF, e.pF, 1e-7);
    near(B.intercept, e.alpha, 1e-9); near(B.alphaSE, e.alphaSE, 1e-9); near(B.alphaT, e.alphaT, 1e-7); near(B.alphaP, e.alphaP, 1e-7);
  });
  it('crecimiento perpetuo', () => {
    const G = E.growthStudy(ds, A, base)!, e = X.expected.growth;
    Object.entries(e.calcs).forEach(([k, v]) => near((G as any)[k === 'growth2030' ? 'growthLast' : k], v, 1e-6));
    G.scenarios.forEach(s => near(s.real, (e.realImplied as any)[s.key], 1e-9));
    e.controls.forEach((c, i) => { near(G.controls[i].value, c[1] as number, 1e-9); near(G.controls[i].limit, c[2] as number, 1e-9); expect(G.controls[i].ok).toBe(c[3] === 'Cumple'); });
  });
  it('15 comprobaciones de fórmulas', () => {
    const C = E.formulaChecks(ds, A, base);
    expect(C.length).toBe(15); expect(C.filter(c => c.ok).length).toBe(15);
    X.expected.validation.checks.forEach((x, i) => { expect(C[i].label.slice(0, 12)).toBe((x[0] as string).slice(0, 12)); near(C[i].model, x[1] as number, Math.abs(x[1] as number) * 1e-9 + 1e-4); });
  });
  it('app vs Excel en verde', () => expect(E.appVsExcel(ds, A, base).every(r => r.ok)).toBe(true));
});
