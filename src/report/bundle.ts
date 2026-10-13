// Todo lo que se calcula para una valuación (una sola vez por juego de supuestos). Lo usan la pantalla,
// el reporte PDF, el libro de Excel, los CSV y el paquete ZIP, de modo que todos muestran exactamente las mismas cifras.
import * as E from '../engine';
import type { Assumptions, Dataset, RunOk } from '../engine';

export interface Bundle {
  ds: Dataset; A: Assumptions; D: Assumptions; b: RunOk; isDefault: boolean;
  scen: E.Scenario[]; torn: E.TornadoRow[]; grid: E.Grid; charts: E.SensCharts; methods: E.MethodRow[];
  rel: E.RelativeResult | null; growth: E.GrowthStudy | null; checks: E.FormulaCheck[]; parity: E.ParityRow[];
  infl: E.InflationStudy | null; monthly: E.MonthlyStudy | null; prices: E.PricesStudy | null; beta: E.BetaStudy | null;
  /** Supuestos modificados respecto a los del Excel: [etiqueta, valor del Excel, valor actual]. */
  changes: [string, string, string][];
  /** Resultado con los supuestos del Excel (para mostrar ambos valores cuando hay cambios). */
  b0: RunOk;
}

const cache = new WeakMap<Dataset, Map<string, Bundle>>();

export function bundle(ds: Dataset, A: Assumptions): Bundle | null {
  let m = cache.get(ds); if (!m) { m = new Map(); cache.set(ds, m); }
  const key = JSON.stringify(A);
  const hit = m.get(key); if (hit) return hit;
  const b = E.run(ds, A); if (!b.ok) return null;
  const D = E.defaults(ds), isDefault = E.isDefault(ds, A), b0 = isDefault ? b : E.run(ds, D);
  const scen = E.scenarios(ds, A), torn = E.tornado(ds, A, b), grid = E.grid(ds, A, b), growth = E.growthStudy(ds, A, b);
  const S = ds.study;
  const out: Bundle = {
    ds, A, D, b, isDefault, scen, torn, grid, charts: E.sensCharts(ds, A, b, grid), methods: E.methods(ds, A, b, scen),
    rel: ds.comps || ds.combined ? E.relative(ds, A, b.value) : null, growth, checks: E.formulaChecks(ds, A, b, scen, growth), parity: E.appVsExcel(ds, A, b, scen),
    infl: S ? E.inflationStudy(S) : null, monthly: S ? E.monthlyStudy(S) : null, prices: S ? E.pricesStudy(S) : null, beta: S ? E.betaStudy(S) : null,
    changes: changesOf(ds, A, D), b0: (b0.ok ? b0 : b) as RunOk
  };
  if (m.size > 30) m.clear();
  m.set(key, out);
  return out;
}

const LABELS: [keyof Assumptions, string, (v: any) => string][] = [
  ['scenario', 'Escenario', v => String(v ?? '—')],
  ['inflationRate', 'Inflación 2026E–2030E', v => E.fmt.p(v)], ['salesAdj', 'Ajuste al crecimiento de ventas', v => E.fmt.p(v)], ['marginAdj', 'Ajuste al margen EBIT', v => E.fmt.p(v)],
  ['betaLevered', 'Beta apalancada (regresión)', v => v == null ? '—' : (+v).toFixed(4)], ['betaU', 'Beta desapalancada', v => (+v).toFixed(4)],
  ['rf', 'Tasa libre de riesgo', v => (+v).toFixed(2) + '%'], ['prm', 'Prima de riesgo de mercado', v => (+v).toFixed(2) + '%'],
  ['g', 'Crecimiento perpetuo g', v => (+v).toFixed(2) + '%'], ['exitMultiple', 'Múltiplo de salida EV/EBITDA', v => E.fmt.x(v)], ['wGordon', 'Peso de Gordon', v => Math.round(+v) + '%'],
  ['kdPre', 'Kd antes de impuestos', v => (+v).toFixed(2) + '%'], ['taxShield', 'Tasa del escudo fiscal', v => (+v).toFixed(2) + '%'],
  ['waccMode', 'Modo del WACC', v => String(v)], ['waccManual', 'WACC manual', v => (+v).toFixed(2) + '%'],
  ['price', 'Precio de mercado', v => E.fmt.n(v, 2) + ' MXN'], ['shares', 'Acciones en circulación', v => E.fmt.n(v, 1) + ' millones'], ['valuationDate', 'Fecha de valuación', v => String(v)],
  ['dGrowth', 'Δ crecimiento de ventas', v => (+v).toFixed(2) + ' pp'], ['dMargin', 'Δ margen EBIT', v => (+v).toFixed(2) + ' pp'], ['dCapex', 'Δ capex', v => (+v).toFixed(2) + ' pp'], ['dTax', 'Δ tasa de impuestos', v => (+v).toFixed(2) + ' pp']
];

function changesOf(ds: Dataset, A: Assumptions, D: Assumptions): [string, string, string][] {
  const out: [string, string, string][] = [];
  const a = A as unknown as Record<string, unknown>, d = D as unknown as Record<string, unknown>;
  LABELS.forEach(([k, label, f]) => {
    const x = a[k as string], y = d[k as string];
    const same = typeof x === 'number' && typeof y === 'number' ? Math.abs(x - y) < 1e-9 : (x ?? null) === (y ?? null);
    if (!same) out.push([label, f(y), f(x)]);
  });
  if (A.weights && ds.combined) out.push(['Pesos de la valuación combinada', '', JSON.stringify(A.weights)]);
  return out;
}
