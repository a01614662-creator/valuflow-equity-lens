// Excel = app. El Excel maestro integrado es la fuente; la app debe reproducirlo celda por celda.
// Los resultados esperados se generaron recalculando el Excel con cada escenario de inflación
// (tools/excel/extract_dataset.py → src/data/soriana.excel.ts).
import { describe, expect, it } from 'vitest';
import * as E from '../src/engine';
import { soriana } from '../src/data/soriana';
import { SORIANA_XL as XL } from '../src/data/soriana.excel';

// Escenarios oficiales + referencia Citi (con la beta oficial) y las dos columnas con la beta heredada 0.80.
const SCEN = ['citi', 'cautela', 'base', 'alcista'] as const;
const INHERITED = { historico: 'citi', base_beta080: 'base' } as const;
const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(1, Math.abs(b));
const close = (a: number, b: number, tol = 1e-9) => expect(rel(a, b)).toBeLessThan(tol);
const runX = (key: string) => key in INHERITED ? run(INHERITED[key as keyof typeof INHERITED], { betaU: soriana.beta!.inherited! }) : run(key);
const run = (inflation: string, extra: Partial<E.Assumptions> = {}) => {
  const r = E.run(soriana, { ...E.defaults(soriana), inflation, ...extra });
  if (!r.ok) throw new Error(r.errors.join('; '));
  return r;
};

describe('proyección por drivers = hoja Proyección Final (por escenario de inflación)', () => {
  SCEN.forEach(k => {
    const X = XL.expected.dcf[k];
    it(k + ': inflación, crecimiento, estados financieros, balance y FCF', () => {
      const B = E.buildFor(soriana, k)!;
      B.years.forEach((y, i) => {
        close(y.inflation, X.inflation[i], 1e-15);
        close(y.growthExternal, X.growthExternal[i], 1e-12); close(y.growth, X.growthFinal[i], 1e-12); close(y.margin, X.marginFinal[i], 1e-12);
        close(y.revenue, X.revenue[i], 1e-12); close(y.ebitda, X.ebitda[i], 1e-12); close(y.ebit, X.ebit[i], 1e-12); close(y.taxEbit, X.taxEbit[i], 1e-12);
        close(y.da, X.da[i], 1e-12); close(y.capex, X.capex[i], 1e-12); close(y.netIncome, X.netIncome[i], 1e-12);
        close(y.cash, X.cash[i], 1e-12); close(y.equity, X.equityBook[i], 1e-12); close(y.fcf, X.fcf[i], 1e-12);
        expect(Math.abs(y.nwcRelease - X.nwcRelease[i])).toBeLessThan(1e-8);
        expect(Math.abs(y.check)).toBeLessThan(1e-6);
      });
    });
  });
});

describe('DCF = Excel (por escenario de inflación y beta)', () => {
  [...SCEN, 'historico', 'base_beta080'].forEach(k => {
    const X = XL.expected.dcf[k as keyof typeof XL.expected.dcf];
    it(k + ': WACC iterado, EV, equity y precio final', () => {
      const b = runX(k);
      b.rows.forEach((r, i) => close(r.fcf, X.fcf[i], 1e-11));
      close(b.wacc, X.wacc / 100, 1e-12); close(b.ke, X.ke / 100, 1e-12);
      close(b.W.market.wacc, X.waccMarket / 100, 1e-12);
      b.W.iters.forEach((it, j) => { close(it.win, X.waccIterations[j][0], 1e-12); close(it.E, X.waccIterations[j][1], 1e-11); close(it.wout, X.waccIterations[j][5], 1e-12); });
      expect(b.W.iters.length).toBe(6);
      close(b.pvSum, X.pvFcf, 1e-11); close(b.tvG, X.tvG, 1e-11); close(b.evG, X.evG, 1e-11);
      close(b.tvM!, X.tvM, 1e-11); close(b.evM!, X.evM, 1e-11); close(b.evW, X.evW, 1e-11);
      close(b.priceG, X.priceG, 1e-11); close(b.priceM!, X.priceM, 1e-11); close(b.priceClose, X.priceW, 1e-11);
      close(b.roll!.ev2, X.ev2, 1e-11); close(b.roll!.eq2, X.eq2, 1e-11); close(b.eqVal, X.eqVal, 1e-11);
      close(b.value, X.price, 1e-11);
    });
  });

  it('baseline histórico: trayectoria Citi + βU heredada 0.80 reproduce $31.164416…', () => {
    expect(runX('historico').value).toBeCloseTo(31.164416422208653, 9);
  });
  it('valor oficial por defecto (Base 3.51%, βU Damodaran 0.65) = Excel', () => {
    expect(E.defaults(soriana).inflation).toBe('base');
    const b = E.run(soriana, E.defaults(soriana)) as E.RunOk;
    close(b.value, XL.expected.dcf.base.price, 1e-11);
    expect(b.value).toBeCloseTo(32.41476081702, 9);
  });
  it('mayor inflación → mayor valor (WACC nominal fijo; limitación documentada)', () => {
    const v = ['cautela', 'base', 'alcista'].map(k => run(k).value);
    expect(v[0]).toBeLessThan(v[1]); expect(v[1]).toBeLessThan(v[2]);
  });
  it('tabla de sensibilidad del Excel (precio Gordon al cierre, WACC × g) se reproduce', () => {
    const X = XL.expected.dcf.base.sensGordonClose, base = run('base');
    X.waccs.forEach((w, i) => X.gs.forEach((g, j) => {
      const r = E.run(soriana, { ...E.defaults(soriana), waccMode: 'manual', waccManual: w * 100, g: g * 100, keFixed: base.ke * 100 });
      expect(r.ok && Math.abs(r.priceG - X.grid[i][j])).toBeLessThan(1e-9);
    }));
  });
});

describe('inflación: modelos de clase calculados por la app = hoja Inflación', () => {
  const M = E.inflationModels(soriana.inflation!)!, X = XL.inflation.models;
  it('modelos inmediato, trimestral y de ventana larga', () => {
    (['immediate', 'quarterly', 'long'] as const).forEach(k => {
      close(M[k].a, X[k].a!, 1e-12); close(M[k].b, X[k].b!, 1e-10); close(M[k].r2, X[k].r2!, 1e-10); close(M[k].forecast, X[k].forecast!, 1e-12);
      expect(M[k].n).toBe(X[k].n);
    });
    M.quarterlyAverages.forEach((v, i) => close(v, XL.inflation.quarterlyAverages[i], 1e-14));
  });
  it('referencias del libro de clase (3.427% y construcción S113 3.268%)', () => {
    close(M.classRounded, X.classRounded.forecast!, 1e-12); close(M.classS113, X.classS113.forecast!, 1e-12);
  });
  it('tres escenarios oficiales; la trayectoria Citi es solo referencia', () => {
    const I = soriana.inflation!;
    expect(I.order).toEqual(['cautela', 'base', 'alcista']);
    expect(I.references).toEqual(['citi']);
    expect(I.scenarios.citi.reference).toBe(true);
    const sc = E.scenarios(soriana, E.defaults(soriana), E.run(soriana, E.defaults(soriana)) as E.RunOk);
    expect(sc.filter(x => !x.reference).map(x => x.key)).toEqual(['cautela', 'base', 'alcista']);
    expect(sc.filter(x => x.reference).map(x => x.key)).toEqual(['citi']);
    expect(I.scenarios.base.kind).toMatch(/Forecast/); expect(I.scenarios.alcista.kind).toMatch(/no es pronóstico/);
  });
  it('Base = modelo trimestral redondeado (3.51%); Cautela y Alcista son supuestos documentados', () => {
    expect(M.baseFromModel).toBe(soriana.inflation!.scenarios.base.value);
    expect(soriana.inflation!.scenarios.base.value).toBe(0.0351);
    expect(soriana.inflation!.scenarios.cautela.value).toBe(0.0326);
    expect(soriana.inflation!.scenarios.alcista.value).toBe(0.04);
  });
});

describe('Trading Comps = hoja Trading Comps', () => {
  const C = E.comps(soriana.comps!), X = XL.expected.comps;
  const keys = { evSales: 'evSales', evEbitda: 'evEbitda', evEbit: 'evEbit', pe: 'pe' } as const;
  it('muestra depurada: 1 incluida + 6 con reserva; FEMSA, Liverpool y Falabella excluidas', () => {
    expect(C.n).toBe(7);
    const out = soriana.comps!.peers.filter(p => p.include === 0).map(p => p.name).join(' ');
    expect(out).toMatch(/Liverpool/i); expect(out).toMatch(/FEMSA|Fomento/i); expect(out).toMatch(/Falabella/i);
  });
  it('estadísticos, precios implícitos y valor del método', () => {
    Object.values(keys).forEach(k => {
      const m = C.multiples.find(x => x.def.key === k)!, st = X.stats[k], pr = X.prices[k];
      E.STAT_KEYS.forEach((s, i) => { close(m.stats![s], st[i], 1e-12); close(m.prices[s] as number, pr[i], 1e-12); });
      expect(m.stats!.n).toBe(st[6]);
    });
    close(C.adj, X.adjustment, 1e-12);
    close(C.value as number, X.value, 1e-12); close(C.p25 as number, X.p25, 1e-12); close(C.p75 as number, X.p75, 1e-12);
    expect(C.used).toBe(3);
  });
  it('recalcula al cambiar la muestra o los múltiplos usados', () => {
    const only = E.comps(soriana.comps!, { compsUse: { evEbit: 0, pe: 0 } });
    close(only.value as number, X.prices.evEbitda[2], 1e-12);
    const noWal = E.comps(soriana.comps!, { compsInclude: { [soriana.comps!.peers.find(p => /Wal-Mart/i.test(p.name))!.name]: 0 } });
    expect(noWal.n).toBe(6); expect(noWal.value).not.toBe(C.value);
  });
  it('NM cuando el capital implícito es ≤ 0 y NA sin métrica', () => {
    const d = soriana.comps!.multiples.find(m => m.key === 'evEbitda')!;
    expect(E.impliedPrice(d, 0.1, soriana.comps!.target)).toBe('NM');
    const na = soriana.comps!.multiples.find(m => m.metric == null)!;
    expect(E.impliedPrice(na, 5, soriana.comps!.target)).toBe('NA');
  });
});

describe('Precedent Transactions = hoja Precedent Transactions', () => {
  const T = E.transactions(soriana.transactions!, soriana.comps!.target), X = XL.expected.transactions;
  it('criterios de clase: ventana de 3 años, geografía y ≥2 múltiplos', () => {
    expect(T.windowStart).toBe(X.windowStart);
    expect(T.checks.map(c => c.inWindow)).toEqual([true, false, false]);
    expect(T.checks.every(c => !c.inGeo)).toBe(true);
    expect(T.checks.every(c => c.enoughMultiples)).toBe(true);
  });
  it('estadísticos, precios, detalle EV → Equity → precio y valor de referencia', () => {
    (['evSales', 'evEbitda'] as const).forEach(k => {
      const m = T.multiples.find(x => x.def.key === k)!;
      E.STAT_KEYS.forEach((s, i) => { close(m.stats![s], X.stats[k][i], 1e-12); close(m.prices[s] as number, X.prices[k][i], 1e-12); });
      const D = X.detail[k];   // [múltiplo, métrica, EV, ajuste, Equity, precio]
      close(m.detail.metric!, D[1], 1e-12); close(m.detail.ev!, D[2], 1e-12); close(m.detail.equity!, D[4], 1e-12); close(m.detail.price as number, D[5], 1e-12);
    });
    expect(soriana.transactions!.deals.every(d => !!d.industry)).toBe(true);
    close(T.value as number, X.value, 1e-12); close(T.lo as number, X.lo, 1e-12); close(T.hi as number, X.hi, 1e-12);
  });
});

describe('Valuación combinada = hoja Valuación Combinada', () => {
  [...SCEN, 'historico', 'base_beta080'].forEach(k => it(k + ': DCF 50% + Comps 50% + Transactions 0%', () => {
    const b = runX(k), R = E.relative(soriana, E.defaults(soriana), b.value);
    close(R.combined!.value as number, XL.expected.dcf[k as keyof typeof XL.expected.dcf].combined, 1e-12);
    expect(R.combined!.rows.find(r => r.key === 'transactions')!.weight).toBe(0);
  }));
  it('regla de clase ⅓ (memo) y recálculo con otros pesos', () => {
    const b = run('base'), R = E.relative(soriana, E.defaults(soriana), b.value);
    close(R.combined!.classValue as number, XL.expected.combined.classRule, 1e-12);
    const R2 = E.relative(soriana, { ...E.defaults(soriana), weights: { dcf: 1, comps: 0, transactions: 0 } }, b.value);
    close(R2.combined!.value as number, b.value, 1e-15);
  });
  it('los pesos deben sumar 100%: si no, el combinado es NA', () => {
    const R = E.combine({ dcf: 30, comps: 34, transactions: 40 }, { dcf: 0.6, comps: 0.5, transactions: 0 });
    expect(R.value).toBe('NA'); expect(R.errors[0]).toMatch(/100%/);
    const R2 = E.relative(soriana, { ...E.defaults(soriana), weights: { dcf: 0.5, comps: 0.3, transactions: 0.2 } }, 32);
    close(R2.combined!.value as number, 0.5 * 32 + 0.3 * (XL.expected.comps.value) + 0.2 * XL.expected.transactions.value, 1e-12);
    expect(R2.combined!.rows.filter(r => r.weight > 0).length).toBe(3);
  });
  it('un método con peso y sin precio deja el combinado en NA (no se toma como cero)', () => {
    const R = E.combine({ dcf: 30, comps: 'NA', transactions: 40 }, { dcf: 0.5, comps: 0.5, transactions: 0 });
    expect(R.value).toBe('NA'); expect(R.errors.length).toBe(1);
  });
});

describe('controles del Excel maestro', () => {
  it('todos los controles PASS en la hoja Validación (39)', () => {
    expect(XL.expected.validation.checks.length).toBe(39);
    expect(XL.expected.validation.summary).toBe('39 PASS de 39');
    expect(XL.expected.validation.checks.every(c => c[1] === 'PASS')).toBe(true);
  });
});

describe('pruebas aleatorias de los métodos nuevos', () => {
  let seed = 20261007; const r = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  it('Comps: con cualquier muestra, el valor = promedio de los precios a la media de los múltiplos usados (recalculado a mano)', () => {
    const S = soriana.comps!, T = S.target, adj = T.cash - T.debt - T.lease - T.minority - T.preferred;
    for (let i = 0; i < 300; i++) {
      const inc: Record<string, number> = {}; S.peers.forEach(p => { inc[p.name] = r() < 0.6 ? 1 : 0; });
      const C = E.comps(S, { compsInclude: inc });
      const prices = (['evEbitda', 'evEbit', 'pe'] as const).map(k => {
        const xs = S.peers.filter(p => inc[p.name] === 1).map(p => p.multiples[k]).filter((x): x is number => x != null);
        if (!xs.length) return null;
        const m = xs.reduce((a, b) => a + b, 0) / xs.length;
        const v = k === 'pe' ? m * T.eps : (m * (k === 'evEbitda' ? T.ebitda : T.ebit) + adj) / T.shares;
        return v > 0 ? v : null;
      }).filter((x): x is number => x != null);
      if (!prices.length) expect(C.value).toBe('NA');
      else close(C.value as number, prices.reduce((a, b) => a + b, 0) / prices.length, 1e-12);
    }
  });
  it('Combinada: con pesos que suman 100% es la suma ponderada; con cualquier otra suma es NA', () => {
    for (let i = 0; i < 300; i++) {
      const p = { dcf: 20 + 20 * r(), comps: 20 + 20 * r(), transactions: 20 + 40 * r() }, a = r(), c = r() * (1 - a), w = { dcf: a, comps: c, transactions: 1 - a - c };
      close(E.combine(p, w).value as number, p.dcf * w.dcf + p.comps * w.comps + p.transactions * w.transactions, 1e-12);
      expect(E.combine(p, { dcf: w.dcf * 1.1, comps: w.comps, transactions: w.transactions + 0.01 }).value).toBe('NA');
    }
  });
  it('Inflación: solo cambia la proyección; Rf, PRM, beta, g y el puente no cambian entre escenarios', () => {
    const a = run('cautela'), b = run('alcista');
    expect(a.W.rf).toBe(b.W.rf); expect(a.W.prm).toBe(b.W.prm); expect(a.W.betaU).toBe(b.W.betaU); expect(a.g).toBe(b.g); expect(a.nd).toBe(b.nd);
    expect(a.rows[0].revenue).toBeLessThan(b.rows[0].revenue);
  });
});

describe('beta del WACC (Damodaran global, enero 2026)', () => {
  const Bt = soriana.beta!, X = XL.expected.dcf;
  it('fuente documentada: Retail (Grocery and Food), βL 0.87, βU 0.65', () => {
    expect(Bt.industry).toBe('Retail (Grocery and Food)'); expect(Bt.date).toMatch(/2026/);
    expect(Bt.levered).toBe(0.87); expect(Bt.unlevered).toBe(0.65); expect(Bt.url).toMatch(/BetasGlobal/);
  });
  it('control: desapalancar 0.87 con D/E 45.96% y t 25.37% da 0.65 (redondeo)', () => {
    const bu = Bt.levered / (1 + (1 - Bt.marginalTax) * Bt.de);
    expect(Math.abs(bu - Bt.unlevered)).toBeLessThan(0.005); close(bu, Bt.check!, 1e-12);
  });
  it('el WACC usa la βU sectorial reapalancada (no la βL de 0.87 ni la beta histórica)', () => {
    expect(soriana.wacc.betaU).toBe(Bt.unlevered);
    expect(soriana.wacc.betaU).not.toBe(soriana.inflation!.beta!.historical);
    const b = run('base'), it = b.W.iterated!, mk = b.W.market;
    close(mk.beta, Bt.unlevered * (1 + (1 - mk.tax) * mk.de), 1e-12);
    close(it.beta, Bt.unlevered * (1 + (1 - it.tax) * it.de), 1e-12);
    close(it.ke, b.W.rf + it.beta * b.W.prm, 1e-12);
    close(it.beta, X.base.betaLIter, 1e-11); close(mk.beta, X.base.betaLMarket, 1e-12);
  });
  it('impacto del cambio de beta = Excel (Base: βU 0.80 → 0.65)', () => {
    const a = runX('base_beta080'), b = run('base');
    close(a.value, X.base_beta080.price, 1e-11); close(b.value, X.base.price, 1e-11);
    expect(b.ke).toBeLessThan(a.ke); expect(b.wacc).toBeLessThan(a.wacc); expect(b.value).toBeGreaterThan(a.value);
    expect(a.rows.map(r => r.fcf)).toEqual(b.rows.map(r => r.fcf));
  });
  it('Kd 10% con fuente y control con intereses 1S26 / deuda 2T26', () => {
    expect(soriana.wacc.kdPre).toBeCloseTo(10, 12); expect(Bt.kd!.source).toMatch(/Citi/);
    expect(Math.abs(Bt.kd!.check - 0.1)).toBeLessThan(0.005);
  });
});
