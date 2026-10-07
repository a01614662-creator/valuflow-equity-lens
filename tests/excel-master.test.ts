// Excel = app. El Excel maestro integrado es la fuente; la app debe reproducirlo celda por celda.
// Los resultados esperados se generaron recalculando el Excel con cada escenario de inflación
// (tools/excel/extract_dataset.py → src/data/soriana.excel.ts).
import { describe, expect, it } from 'vitest';
import * as E from '../src/engine';
import { soriana } from '../src/data/soriana';
import { SORIANA_XL as XL } from '../src/data/soriana.excel';

const SCEN = ['citi', 'cautela', 'base', 'alcista'] as const;
const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(1, Math.abs(b));
const close = (a: number, b: number, tol = 1e-9) => expect(rel(a, b)).toBeLessThan(tol);
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

describe('DCF = Excel (por escenario de inflación)', () => {
  SCEN.forEach(k => {
    const X = XL.expected.dcf[k];
    it(k + ': WACC iterado, EV, equity y precio final', () => {
      const b = run(k);
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

  it('baseline histórico: la trayectoria Citi reproduce $31.164416…', () => {
    expect(run('citi').value).toBeCloseTo(31.164416422208653, 9);
  });
  it('valor por defecto (Base 3.51%) = $30.832', () => {
    expect(E.defaults(soriana).inflation).toBe('base');
    expect(E.run(soriana, E.defaults(soriana)).ok && (E.run(soriana, E.defaults(soriana)) as E.RunOk).value).toBeCloseTo(30.8320001045245, 9);
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
  it('estadísticos, precios y valor de referencia', () => {
    (['evSales', 'evEbitda'] as const).forEach(k => {
      const m = T.multiples.find(x => x.def.key === k)!;
      E.STAT_KEYS.forEach((s, i) => { close(m.stats![s], X.stats[k][i], 1e-12); close(m.prices[s] as number, X.prices[k][i], 1e-12); });
    });
    close(T.value as number, X.value, 1e-12); close(T.lo as number, X.lo, 1e-12); close(T.hi as number, X.hi, 1e-12);
  });
});

describe('Valuación combinada = hoja Valuación Combinada', () => {
  SCEN.forEach(k => it(k + ': DCF 50% + Comps 50% + Transactions 0%', () => {
    const b = run(k), R = E.relative(soriana, { ...E.defaults(soriana), inflation: k }, b.value);
    close(R.combined!.value as number, XL.expected.dcf[k].combined, 1e-12);
    expect(R.combined!.rows.find(r => r.key === 'transactions')!.weight).toBe(0);
  }));
  it('regla de clase ⅓ (memo) y recálculo con otros pesos', () => {
    const b = run('base'), R = E.relative(soriana, E.defaults(soriana), b.value);
    close(R.combined!.classValue as number, XL.expected.combined.classRule, 1e-12);
    const R2 = E.relative(soriana, { ...E.defaults(soriana), weights: { dcf: 1, comps: 0, transactions: 0 } }, b.value);
    close(R2.combined!.value as number, b.value, 1e-15);
  });
  it('un método con peso y sin precio deja el combinado en NA (no se toma como cero)', () => {
    const R = E.combine({ dcf: 30, comps: 'NA', transactions: 40 }, { dcf: 0.5, comps: 0.5, transactions: 0 });
    expect(R.value).toBe('NA'); expect(R.errors.length).toBe(1);
  });
});

describe('controles del Excel maestro', () => {
  it('29 de 29 controles PASS en la hoja Validación', () => {
    expect(XL.expected.validation.summary).toBe('29 PASS de 29');
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
  it('Combinada: es lineal en los precios y no depende de la escala de los pesos', () => {
    for (let i = 0; i < 300; i++) {
      const p = { dcf: 20 + 20 * r(), comps: 20 + 20 * r(), transactions: 20 + 40 * r() }, w = { dcf: r(), comps: r(), transactions: r() };
      const a = E.combine(p, w).value as number, b = E.combine(p, { dcf: w.dcf * 7, comps: w.comps * 7, transactions: w.transactions * 7 }).value as number;
      close(a, b, 1e-12);
      close(a, (p.dcf * w.dcf + p.comps * w.comps + p.transactions * w.transactions) / (w.dcf + w.comps + w.transactions), 1e-12);
    }
  });
  it('Inflación: solo cambia la proyección; Rf, PRM, beta, g y el puente no cambian entre escenarios', () => {
    const a = run('cautela'), b = run('alcista');
    expect(a.W.rf).toBe(b.W.rf); expect(a.W.prm).toBe(b.W.prm); expect(a.W.betaU).toBe(b.W.betaU); expect(a.g).toBe(b.g); expect(a.nd).toBe(b.nd);
    expect(a.rows[0].revenue).toBeLessThan(b.rows[0].revenue);
  });
});
