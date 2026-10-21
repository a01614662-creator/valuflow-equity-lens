// Reactividad del Laboratorio: al cambiar un supuesto, TODAS las vistas que dependen de él deben mostrar el resultado de
// una ejecución completa del motor con esos mismos supuestos (sin datos obsoletos ni cálculos duplicados en la interfaz).
// Se construye el modelo de vista completo (todas las páginas, como al imprimir el reporte completo) sin navegador.
import { describe, expect, it } from 'vitest';
import { App } from '../src/ui/App';
import { buildView } from '../src/ui/viewmodel';
import * as E from '../src/engine';
import { fmt as f } from '../src/engine';
import { BUILT_IN } from '../src/data/registry';

const ds = BUILT_IN[0];
const D = E.defaults(ds);
// Se omiten solo los estados transitorios de la interfaz (indicador "Actualizando…" y mensaje emergente).
const strip = (vm: unknown) => { const x = JSON.parse(JSON.stringify(vm, (_k, v) => typeof v === 'function' ? undefined : v)); delete x.toast; if (x.ui) delete x.ui.busy; return x; };

function mkApp(A: E.Assumptions) {
  const app = new App({}) as unknown as { state: Record<string, unknown>; setState: (p: unknown, cb?: () => void) => void; setA: (p: Partial<E.Assumptions>) => void; resetA: () => void };
  app.state = { ...app.state, ready: true, companies: BUILT_IN, activeId: ds.id, A, view: 'p1', printing: 'full', reveal: true, annexId: null };
  app.setState = (p: unknown, cb?: () => void) => { app.state = { ...app.state, ...(typeof p === 'function' ? (p as (s: unknown) => object)(app.state) : p as object) }; cb && cb(); };
  return app;
}
const vmOf = (A: E.Assumptions) => strip(buildView(mkApp(A) as never));

/** Comprueba que cada vista coincide con una ejecución nueva del motor para los supuestos A. */
function expectConsistent(A: E.Assumptions) {
  const vm = vmOf(A), b = E.run(ds, A) as E.RunOk;
  expect(b.ok).toBe(true);
  const R = E.relative(ds, A, b.value);
  // 01 · Valor: resultado, KPIs y cascada
  expect(vm.r.value).toBe(f.cur(b.value));
  expect(vm.r.upside).toBe(f.pp(b.upside));
  const kp = Object.fromEntries(vm.kpis.map((k: { label: string; value: string }) => [k.label, k.value]));
  expect(kp['WACC']).toBe(f.p(b.wacc)); expect(kp['Enterprise Value']).toBe(f.m(b.ev)); expect(kp['Equity Value']).toBe(f.m(b.eqVal));
  expect(kp['Conclusión de valuación']).toBe(f.cur(R.combined!.value as number));
  expect(vm.wf.note).toContain(f.cur(b.value));
  // 02 · Flujos: FCF por año y valor terminal
  expect(vm.fcfChart.cols.slice(1).map((c: { fcfTxt: string }) => c.fcfTxt)).toEqual(b.rows.map(r => f.m(r.fcf)));
  expect(vm.tv.tv).toBe(f.m(b.tvG)); expect(vm.tv.fcfN).toBe(f.m(b.fcfTv)); expect(vm.tv.g).toBe(f.p(b.g));
  // 03 · Riesgo: WACC, Ke, iteración, sensibilidad y tornado
  expect(vm.wb.keBlocks.find((x: { k: string }) => x.k === 'Ke').v).toBe(f.p(b.W.src!.ke));
  const G = E.grid(ds, A, b, 0.5, 0.5);
  expect(vm.heat.rows.map((r: { cells: { t: string }[] }) => r.cells.map(c => c.t))).toEqual(G.cells.map(r => r.map(v => f.cur(v))));
  expect(vm.heat.rows[2].cells[2].t).toBe(f.cur(b.value));
  const T = E.tornado(ds, A, b);
  expect(vm.torn.rows.map((r: { label: string; rangeTxt: string }) => [r.label, r.rangeTxt])).toEqual(T.map(t => [t.label, f.cur(t.range)]));
  // Escenarios: el activo es el valor actual; los demás se recalculan con los mismos supuestos
  const S = E.scenarios(ds, A, b);
  expect(vm.scen.map((s: { valTxt: string }) => s.valTxt)).toEqual(S.map(s => f.cur(s.value)));
  // Campo de fútbol, combinada y transacciones
  expect(vm.football.rows.find((r: { label: string }) => /precio objetivo/i.test(r.label)).valueTxt).toBe(f.cur(b.value));
  expect(vm.comb.value).toBe(f.cur(R.combined!.value as number));
  expect(vm.trans.value).toBe(f.cur(R.sdc!.value as number));
  // Laboratorio: resultado en vivo
  const st = Object.fromEntries(vm.lab.stats.map((s: { k: string; v: string }) => [s.k, s.v]));
  expect(st['Enterprise Value']).toBe(f.m(b.ev)); expect(st['Equity Value']).toBe(f.m(b.eqVal)); expect(st['WACC']).toBe(f.p(b.wacc));
  // Anexos (reporte completo): tabla del DCF y sensibilidades recalculadas
  const tables = vm.annexTables as { id: string; title: string; rows: { label: string; cells: { t: string }[] }[] }[];
  const bridge = tables.find(t => t.title === 'Del flujo al valor por acción')!;
  expect(bridge.rows.find(r => r.label === 'Valor intrínseco por acción')!.cells[0].t).toBe(f.cur(b.value));
  const sens = tables.find(t => t.id === 'sens' && /WACC vs\. g/.test(t.title))!;
  expect(sens.rows[2].cells[2].t).toContain(b.value.toFixed(2));
  return vm;
}

const CHANGES: [string, Partial<E.Assumptions>][] = [
  ['beta ↑ (βU 0.69 → 0.90)', { betaU: 0.90 }], ['beta ↓ (βU 0.69 → 0.17)', { betaU: 0.1705 }],
  ['Rf +1 pp', { rf: D.rf + 1 }], ['PRM −1 pp', { prm: D.prm - 1 }], ['Kd +2 pp', { kdPre: D.kdPre + 2 }], ['tasa del escudo −5 pp', { taxShield: D.taxShield - 5 }],
  ['g 3.5% → 4.0%', { g: 4 }], ['g 3.5% → 2.5%', { g: 2.5 }],
  ['múltiplo de salida +1x', { exitMultiple: (D.exitMultiple as number) + 1 }], ['peso Gordon 100%', { wGordon: 100 }],
  ['Δ ventas +1 pp', { dGrowth: 1 }], ['Δ margen −0.25 pp', { dMargin: -0.25 }], ['Δ capex +0.25 pp', { dCapex: 0.25 }], ['Δ impuestos +2 pp', { dTax: 2 }],
  ['inflación Alcista', { inflation: 'alcista' }], ['inflación Cautela', { inflation: 'cautela' }],
  ['WACC manual 10%', { waccMode: 'manual', waccManual: 10 }], ['WACC de mercado', { waccMode: 'market' }],
  ['precio de mercado 30.00', { price: 30 }]
];

describe('reactividad: cada supuesto se propaga a todas las vistas que dependen de él', () => {
  const vm0 = expectConsistent(D), b0 = E.run(ds, D) as E.RunOk;
  CHANGES.forEach(([name, patch]) => it(name, () => {
    const A = { ...D, ...patch } as E.Assumptions, vm = expectConsistent(A), b = E.run(ds, A) as E.RunOk;
    // Lo que cambia en el motor cambia en la pantalla (no se queda el valor anterior).
    if (Math.abs(b.value - b0.value) > 0.005) expect(vm.r.value).not.toBe(vm0.r.value);
    if (patch.price) { expect(vm.r.upside).not.toBe(vm0.r.upside); expect(vm.r.value).toBe(vm0.r.value); }
  }));

  it('la beta se propaga por CAPM → WACC → valor (y no cambia los flujos)', () => {
    const up = E.run(ds, { ...D, betaU: 0.9 }) as E.RunOk;
    expect(up.W.src!.beta).toBeGreaterThan(b0.W.src!.beta); expect(up.ke).toBeGreaterThan(b0.ke); expect(up.wacc).toBeGreaterThan(b0.wacc); expect(up.value).toBeLessThan(b0.value);
    expect(up.rows.map(r => r.fcf)).toEqual(b0.rows.map(r => r.fcf));
  });
  it('WACC manual: mismos flujos, descuento y valor terminal recalculados', () => {
    const m = E.run(ds, { ...D, waccMode: 'manual', waccManual: 10, keFixed: b0.ke * 100 }) as E.RunOk;
    expect(m.rows.map(r => r.fcf)).toEqual(b0.rows.map(r => r.fcf));
    m.rows.forEach((r, i) => expect(r.df).toBeCloseTo(1 / Math.pow(1.10, i + 1), 12));
    expect(m.tvG).toBeCloseTo(m.fcfTv * (1 + m.g) / (0.10 - m.g), 6);
  });
  it('g: cambia el valor terminal, el EV y el valor por acción', () => {
    const a = E.run(ds, { ...D, g: 4 }) as E.RunOk;
    expect(a.tvG).toBeGreaterThan(b0.tvG); expect(a.evW).toBeGreaterThan(b0.evW); expect(a.value).toBeGreaterThan(b0.value);
    // Los flujos no cambian; el WACC iterado sí (el equity del DCF depende de g), por eso cambia también el VP de los flujos.
    expect(a.rows.map(r => r.fcf)).toEqual(b0.rows.map(r => r.fcf));
    const m = E.run(ds, { ...D, g: 4, waccMode: 'manual', waccManual: b0.wacc * 100, keFixed: b0.ke * 100 }) as E.RunOk;
    expect(m.pvSum).toBeCloseTo(b0.pvSum, 6); expect(m.tvG).toBeGreaterThan(b0.tvG);
  });
  it('margen y ventas: cambian la proyección del FCFF y la valuación', () => {
    const m = E.run(ds, { ...D, dMargin: 0.25 }) as E.RunOk, g = E.run(ds, { ...D, dGrowth: 1 }) as E.RunOk;
    m.rows.forEach((r, i) => expect(r.ebit).toBeGreaterThan(b0.rows[i].ebit)); g.rows.forEach((r, i) => expect(r.revenue).toBeGreaterThan(b0.rows[i].revenue));
    expect(m.value).toBeGreaterThan(b0.value); expect(g.value).not.toBe(b0.value);
  });
  it('varios supuestos a la vez = una ejecución completa del motor con esos mismos supuestos', () => {
    expectConsistent({ ...D, betaU: 0.8, g: 3, dMargin: 0.2, dGrowth: -1, inflation: 'alcista', exitMultiple: 6.3, price: 31 });
  });
  it('secuencia de cambios en la app (como al mover deslizadores) termina en el mismo estado que una ejecución directa', () => {
    const app = mkApp(D);
    [3.6, 3.7, 3.9, 4.1, 4.0].forEach(g => app.setA({ g }));
    app.setA({ betaU: 0.75 }); app.setA({ dMargin: 0.1 }); app.setA({ inflation: 'cautela' });
    const A = app.state.A as E.Assumptions;
    expect(strip(buildView(app as never))).toEqual(vmOf(A));
    expect(A.g).toBe(4); expect(A.betaU).toBe(0.75);
  });
  it('restablecer: todos los supuestos y resultados vuelven exactamente al caso base del Excel', () => {
    const app = mkApp(D);
    app.setA({ g: 4.2, betaU: 0.3, dMargin: 0.4, inflation: 'alcista', waccMode: 'manual', waccManual: 9, sdcInclude: { '4338758040': 0 }, weights: { dcf: 1, comps: 0, transactions: 0 } });
    expect(strip(buildView(app as never)).r.value).not.toBe(vm0.r.value);
    app.resetA();
    expect(app.state.A).toEqual(D);
    expect(strip(buildView(app as never))).toEqual(vm0);
    expect(E.isDefault(ds, app.state.A as E.Assumptions)).toBe(true);
  });
  it('el modelo de vista identifica si se ve el caso base o un escenario modificado', () => {
    expect(vm0.ui.modified).toBe(false);
    expect(vmOf({ ...D, g: 4 }).ui.modified).toBe(true);
  });
});
