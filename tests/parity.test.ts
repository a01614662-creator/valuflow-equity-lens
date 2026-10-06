// Garantía de "no romper nada": el motor nuevo (TypeScript) debe dar EXACTAMENTE los mismos
// resultados que el motor original del prototipo (project/vf-engine.js), para el caso base y
// para miles de combinaciones aleatorias de supuestos.
import { describe, expect, it } from 'vitest';
import * as E from '../src/engine';
import type { Assumptions, Dataset } from '../src/engine';
import { soriana } from '../src/data/soriana';
import { loadLegacy } from './legacy';

const { VF, dataset: legacyDs } = loadLegacy();
const plain = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/** Generador pseudoaleatorio con semilla fija: las pruebas siempre son reproducibles. */
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

function randomAssumptions(ds: Dataset, r: () => number): Assumptions {
  const D = E.defaults(ds), u = (a: number, b: number) => a + (b - a) * r();
  const A: Assumptions = {
    ...D,
    dGrowth: u(-3, 3), dMargin: u(-1, 1), dCapex: u(-1, 1), dTax: u(-6, 6), g: u(0.5, 6),
    waccMode: (['iterated', 'market', 'manual'] as const)[Math.floor(r() * 3)], waccManual: u(6, 20),
    rf: u(2, 15), prm: u(2, 10), betaU: u(0.3, 1.8), kdPre: u(2, 20), taxShield: u(0, 40),
    exitMultiple: r() < 0.15 ? null : u(3, 12), wGordon: Math.round(u(0, 100)),
    price: r() < 0.05 ? null : u(10, 60), shares: r() < 0.05 ? 0 : u(500, 3000),
    rollEnabled: r() < 0.7, forecastKey: r() < 0.25 ? 'constante' : 'final'
  };
  if (A.forecastKey === 'constante') Object.assign(A, ds.altForecasts!.constante.overrides);
  return A;
}

describe('dataset de Soriana', () => {
  it('tiene exactamente los mismos números que el original (solo se agregaron etiquetas)', () => {
    const now = plain(soriana) as Dataset & Record<string, unknown>;
    delete now.labels;
    delete (now.altForecasts!.constante as unknown as Record<string, unknown>).short;
    delete (now.method as unknown as Record<string, unknown>).salesConstLabel;
    delete (now.method as unknown as Record<string, unknown>).salesLSLabel;
    expect(now).toEqual(plain(legacyDs));
  });
});

describe('paridad con el motor original', () => {
  const ds = soriana;

  it('caso base: todos los resultados idénticos', () => {
    const A = E.defaults(ds);
    expect(plain(A)).toEqual(plain(VF.defaults(legacyDs)));
    expect(plain(E.run(ds, A))).toEqual(plain(VF.run(legacyDs, A)));
  });

  it('3,000 combinaciones aleatorias de supuestos: run() idéntico', () => {
    const r = rng(20261006);
    let ok = 0, fail = 0;
    for (let i = 0; i < 3000; i++) {
      const A = randomAssumptions(ds, r);
      const mine = E.run(ds, A), theirs = VF.run(legacyDs, plain(A));
      expect(plain(mine)).toEqual(plain(theirs));
      mine.ok ? ok++ : fail++;
    }
    // Se cubren tanto valuaciones válidas como casos de error (p. ej. g ≥ WACC, sin acciones).
    expect(ok).toBeGreaterThan(1000);
    expect(fail).toBeGreaterThan(50);
  });

  it('sensibilidad, tornado, escenarios, métodos y lectura rápida idénticos', () => {
    const r = rng(42);
    for (let i = 0; i < 150; i++) {
      const A = i === 0 ? E.defaults(ds) : randomAssumptions(ds, r);
      const b = E.run(ds, A), lb = VF.run(legacyDs, plain(A));
      if (!b.ok) continue;
      expect(plain(E.grid(ds, A, b, 0.25, 0.5))).toEqual(plain(VF.grid(legacyDs, plain(A), lb, 0.25, 0.5)));
      const t = E.tornado(ds, A, b);
      expect(plain(t)).toEqual(plain(VF.tornado(legacyDs, plain(A), lb)));
      expect(plain(E.scenarios(ds, A, b))).toEqual(plain(VF.scenarios(legacyDs, plain(A), lb)));
      expect(plain(E.methods(ds, A, b))).toEqual(plain(VF.methods(legacyDs, plain(A), lb)));
      // La lectura rápida solo difiere cuando el FCF es negativo (antes mostraba "NaN%").
      if (b.rows[0].fcf > 0 && b.rows[b.rows.length - 1].fcf > 0) expect(plain(E.insights(ds, A, b, t))).toEqual(plain(VF.insights(legacyDs, plain(A), lb, t)));
    }
  });

  it('validación: mismos estados y cifras (solo cambian etiquetas de fecha)', () => {
    const A = E.defaults(ds), b = E.run(ds, A), lb = VF.run(legacyDs, A);
    const strip = (cs: { status: string; calc?: string; exp?: string; group: string }[]) => cs.map(c => [c.group, c.status, c.calc || '', c.exp || '']);
    expect(strip(E.validate(ds, A, b, true))).toEqual(strip(VF.validate(legacyDs, A, lb, true)));
  });

  it('formato numérico idéntico', () => {
    for (const v of [0, -1234.567, 98765.4321, 0.118793, -0.069, NaN, null]) {
      for (const k of ['m', 'n', 'p', 'pp', 'x', 'cur'] as const) expect(E.fmt[k](v, 2)).toBe(VF.fmt[k](v, 2));
    }
  });
});
