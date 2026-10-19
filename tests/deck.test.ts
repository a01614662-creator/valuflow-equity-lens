// Presentación: 7 diapositivas construidas con el motor y los supuestos activos (sin cifras escritas a mano).
import { describe, expect, it } from 'vitest';
import * as E from '../src/engine';
import { fmt as f } from '../src/engine';
import { BUILT_IN } from '../src/data/registry';
import { buildDeck } from '../src/ui/present/deck';

const ds = BUILT_IN[0], D = E.defaults(ds);
const deckOf = (A: E.Assumptions) => { const b = E.run(ds, A) as E.RunOk; return { b, d: buildDeck(ds, A, b, ['Equipo'], 'Tec', !E.isDefault(ds, A)) }; };

describe('modo presentación', () => {
  it('siete diapositivas con la secuencia acordada y sin valores vacíos', () => {
    const { d } = deckOf(D);
    expect(d.slides.map(s => s.key)).toEqual(['conclusion', 'inflacion', 'riesgo', 'flujos', 'valor', 'metodos', 'cierre']);
    d.slides.forEach(s => { const all = JSON.stringify(s); expect(all).not.toMatch(/NaN|undefined|Infinity/); expect(s.title.length).toBeGreaterThan(20); });
    expect(d.modified).toBe(false);
  });
  it('títulos y cifras salen del motor (caso base del Excel)', () => {
    const { b, d } = deckOf(D), R = E.recommendation(ds, D, b)!;
    expect(d.slides[0].title).toContain(f.cur(R.target!)); expect(d.slides[0].lede).toContain(f.cur(b.value)); expect(d.slides[0].lede).toContain(R.rating!);
    expect(d.slides[2].title).toContain(f.p(b.wacc, 2));
    expect(d.slides[4].title).toContain(f.cur(b.value)); expect(d.slides[4].figure).toContain(f.m(b.roll!.eq3));
    expect(d.slides[6].title.toLowerCase()).toContain(R.rating!.toLowerCase());
  });
  it('con supuestos modificados, las diapositivas cambian y lo indican', () => {
    const A = { ...D, betaU: 0.9, g: 4 }, { b, d } = deckOf(A), base = deckOf(D).d;
    expect(d.modified).toBe(true);
    expect(d.slides[4].title).toContain(f.cur(b.value)); expect(d.slides[4].title).not.toBe(base.slides[4].title);
    expect(d.slides[2].title).toContain(f.p(b.wacc, 2));
  });
  it('construir la presentación no modifica los supuestos', () => {
    const A = { ...D }, snap = JSON.stringify(A); deckOf(A); expect(JSON.stringify(A)).toBe(snap);
  });
});
