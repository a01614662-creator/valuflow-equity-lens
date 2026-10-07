// Validación contra el Excel "VALUACIÓN DEFINITIVA SORIANA" anterior (baseline histórico $31.16, dataset original
// del prototipo en tests/fixtures). El Excel maestro integrado se valida en tests/excel-master.test.ts.
import { describe, expect, it } from 'vitest';
import * as E from '../src/engine';
import { sorianaLegacy as soriana } from './fixtures/soriana-legacy';
import { soriana as sorianaMaster } from '../src/data/soriana';
import { BUILT_IN, checkDataset } from '../src/data/registry';

describe('Soriana (dataset histórico) vs. Excel definitivo anterior', () => {
  const A = E.defaults(soriana), b = E.run(soriana, A);

  it('la valuación base es válida', () => { expect(b.ok).toBe(true); });
  if (!b.ok) return;

  it('valor intrínseco $31.16 y potencial −6.9%', () => {
    expect(b.value).toBeCloseTo(31.16, 2);
    expect((b.upside as number) * 100).toBeCloseTo(-6.9, 1);
  });

  it('WACC iterado 11.88% y Ke 13.95%', () => {
    expect(b.wacc * 100).toBeCloseTo(11.88, 2);
    expect(b.ke * 100).toBeCloseTo(13.95, 2);
    expect(b.W.iterated!.converged).toBe(true);
  });

  it('FCF 2026E–2030E coincide con el Excel (±1 mdp)', () => {
    b.rows.forEach((r, i) => expect(Math.abs(r.fcf - soriana.expected!.fcf[i])).toBeLessThanOrEqual(1));
  });

  // 33 = las 34 originales menos la de escenarios inventados (pesimista/optimista), retirada por la decisión oficial 5.
  it('las 33 comprobaciones de la capa de validación pasan', () => {
    const checks = E.validate(soriana, A, b, true);
    const review = checks.filter(c => c.status !== 'pass');
    expect(review).toEqual([]);
    expect(checks.length).toBe(33);
  });

  it('escenario de supuestos constantes reproduce $34.44', () => {
    const af = soriana.altForecasts!.constante;
    const r = E.run(soriana, { ...A, ...af.overrides, forecastKey: 'constante' });
    expect(r.ok && r.value).toBeCloseTo(34.44, 2);
  });

  it('con supuestos modificados la comparación contra el Excel se desactiva', () => {
    const A2 = { ...A, g: 3.0 }, b2 = E.run(soriana, A2);
    expect(E.isDefault(soriana, A2)).toBe(false);
    const ex = E.validate(soriana, A2, b2, false).filter(c => c.group === E.SOURCE_GROUP);
    expect(ex.map(c => c.status)).toEqual(['na']);
  });
});

describe('identidades financieras', () => {
  const A = E.defaults(soriana), b = E.run(soriana, A);
  if (!b.ok) throw new Error('base inválida');
  it('FCF = NOPAT + D&A − Capex − ΔNWC y NOPAT = EBIT(1 − t)', () => {
    b.rows.forEach(r => {
      expect(r.nopat).toBeCloseTo(r.ebit * (1 - r.taxRate), 9);
      expect(r.fcf).toBeCloseTo(r.nopat + r.da - r.capex - r.dNwc, 9);
    });
  });
  it('EV = Σ VP(FCF) + VP(TV) y TV = FCFₙ(1+g)/(WACC−g)', () => {
    const last = b.rows[b.rows.length - 1];
    expect(b.tvG).toBeCloseTo(last.fcf * (1 + b.g) / (b.wacc - b.g), 6);
    expect(b.evG).toBeCloseTo(b.rows.reduce((s, r) => s + r.fcf / Math.pow(1 + b.wacc, r.n), 0) + b.tvG / Math.pow(1 + b.wacc, b.rows.length), 6);
  });
  it('WACC iterado es un punto fijo: recalcularlo con su propio equity da el mismo WACC', () => {
    const it = b.W.iterated!, t = A.taxShield / 100;
    const beta = A.betaU * (1 + (1 - t) * it.D / it.E), ke = A.rf / 100 + beta * A.prm / 100;
    expect(it.E / (it.D + it.E) * ke + it.D / (it.D + it.E) * it.kdAT).toBeCloseTo(b.wacc, 9);
  });
});

describe('Soriana (Excel maestro) · capa de validación de la app', () => {
  const A = E.defaults(sorianaMaster), b = E.run(sorianaMaster, A);
  it('todas las comprobaciones pasan con los supuestos base', () => {
    const checks = E.validate(sorianaMaster, A, b, true);
    expect(checks.filter(c => c.status !== 'pass')).toEqual([]);
    expect(checks.filter(c => c.group === E.SOURCE_GROUP).length).toBeGreaterThan(20);
  });
  it('cada escenario de inflación se compara contra su columna del Excel', () => {
    ['citi', 'cautela', 'alcista'].forEach(k => {
      const A2 = { ...A, inflation: k }, b2 = E.run(sorianaMaster, A2);
      const checks = E.validate(sorianaMaster, A2, b2, E.isDefault(sorianaMaster, { ...A2, inflation: A.inflation }));
      expect(checks.filter(c => c.status === 'review')).toEqual([]);
      expect(checks.some(c => c.group === E.SOURCE_GROUP && c.status === 'pass')).toBe(true);
    });
  });
});

describe('datasets incluidos', () => {
  it('pasan la revisión de estructura', () => { BUILT_IN.forEach(ds => expect(checkDataset(ds)).toEqual([])); });
  it('un archivo incompleto se rechaza con mensajes claros', () => {
    expect(checkDataset({ profile: { name: 'X' } }).length).toBeGreaterThan(3);
  });
});
