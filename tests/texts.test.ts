// Los textos del estudio, llenados con las cifras del motor, deben coincidir palabra por palabra con los del Excel
// (hojas Conclusiones, Validación y WACC) cuando se usan los supuestos del Excel.
import { describe, expect, it } from 'vitest';
import * as E from '../src/engine';
import { soriana as ds } from '../src/data/soriana';
import { SORIANA_FINAL as X } from '../src/data/soriana.final';
import { bundle } from '../src/report/bundle';
import { studyTexts } from '../src/report/context';

const T = studyTexts(bundle(ds, E.defaults(ds))!)!;

describe('Textos con cifras vivas = Excel', () => {
  it('11 conclusiones', () => expect(T.conclusions).toEqual(X.expected.conclusions));
  it('resumen y sensibilidad', () => { expect(T.summary).toBe(X.expected.validation.texts.summary); expect(T.sensitivity).toEqual([X.expected.validation.texts.sens1, X.expected.validation.texts.sens2]); });
  it('razones de la diferencia', () => expect(T.reasons).toEqual(X.expected.validation.reasons));
  it('limitaciones', () => expect(T.limits).toEqual(X.expected.validation.limits));
  it('WACC paso a paso', () => expect(T.wacc).toEqual(X.expected.waccTexts));
  it('9 preguntas de análisis sin marcadores vacíos', () => { expect(T.questions.length).toBe(9); T.questions.forEach(([q, a]) => { expect(q + a).not.toMatch(/—|\{|NaN|undefined/); }); });
  it('con otro escenario las cifras cambian', () => {
    const P = E.scenarioPresets(ds).find(p => p.key === 'conservador')!;
    const T2 = studyTexts(bundle(ds, { ...E.defaults(ds), ...E.presetPatch(P) })!)!;
    expect(T2.conclusions[10][1]).toContain('32.12'); expect(T2.conclusions[10][1]).toContain('Con los supuestos del escenario Conservador');
  });
});
