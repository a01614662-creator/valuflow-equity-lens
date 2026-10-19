// Instantánea de una valuación: todo lo que se calcula con un juego de supuestos, una sola vez.
// La usan el PDF ejecutivo, el reporte técnico, el libro de Excel, el CSV, el JSON y el ZIP, de modo que todos
// muestran exactamente las cifras de la pantalla con los supuestos activos (base del Excel o escenario modificado).
import * as E from '../engine';
import { fmt as f, type Assumptions, type Dataset, type RunOk } from '../engine';
import { annexTables } from '../ui/annex';
import { overridesActive, relativeView } from '../ui/relative';
import type { TTable } from '../ui/tables';
import type { Calc } from '../ui/viewmodel';

export interface Snapshot {
  ds: Dataset; A: Assumptions; D: Assumptions; b: RunOk; b0: RunOk;
  /** true si los supuestos son exactamente los del Excel (sin cambios del Laboratorio ni de la muestra). */
  isBase: boolean;
  scen: E.Scenario[]; torn: E.TornadoRow[]; grid: E.Grid; methods: E.MethodRow[]; sens: E.SensTable[];
  rel: E.RelativeResult; rec: E.Recommendation | null; checks: E.Check[];
  /** Tablas de la interfaz (mismos objetos que dibujan las pantallas y los anexos). */
  ui: Record<string, TTable[]>;
  /** Supuestos modificados respecto al Excel: [supuesto, Excel, actual]. */
  changes: [string, string, string][];
  generatedAt: Date;
}

const LABELS: [keyof Assumptions, string, (v: any) => string][] = [
  ['inflation', 'Escenario de inflación', v => String(v ?? '—')],
  ['rf', 'Tasa libre de riesgo', v => (+v).toFixed(2) + '%'], ['prm', 'Prima de riesgo de mercado', v => (+v).toFixed(2) + '%'],
  ['betaU', 'Beta desapalancada (βU)', v => (+v).toFixed(4)], ['kdPre', 'Kd antes de impuestos', v => (+v).toFixed(2) + '%'],
  ['taxShield', 'Tasa del escudo fiscal', v => (+v).toFixed(2) + '%'], ['waccMode', 'Modo del WACC', v => ({ iterated: 'iterado', market: 'de mercado', manual: 'manual' } as Record<string, string>)[v] ?? String(v)],
  ['waccManual', 'WACC manual', v => (+v).toFixed(2) + '%'], ['g', 'Crecimiento perpetuo g', v => (+v).toFixed(2) + '%'],
  ['exitMultiple', 'Múltiplo de salida EV/EBITDA', v => v == null ? '—' : (+v).toFixed(2) + 'x'], ['wGordon', 'Peso de Gordon', v => Math.round(+v) + '%'],
  ['dGrowth', 'Δ crecimiento de ventas', v => (+v).toFixed(2) + ' pp'], ['dMargin', 'Δ margen EBIT', v => (+v).toFixed(2) + ' pp'],
  ['dCapex', 'Δ capex (% ventas)', v => (+v).toFixed(2) + ' pp'], ['dTax', 'Δ tasa de impuestos', v => (+v).toFixed(2) + ' pp'],
  ['price', 'Precio de mercado', v => v == null ? '—' : '$' + (+v).toFixed(2)], ['shares', 'Acciones en circulación (mm)', v => v == null ? '—' : f.n(v, 1)]
];

export function changesOf(ds: Dataset, A: Assumptions, D: Assumptions): [string, string, string][] {
  const out: [string, string, string][] = [], a = A as unknown as Record<string, unknown>, d = D as unknown as Record<string, unknown>;
  const scenLabel = (k: unknown) => (ds.inflation?.scenarios as Record<string, { label: string }> | undefined)?.[k as string]?.label ?? String(k ?? '—');
  LABELS.forEach(([k, label, fm]) => {
    const x = a[k as string], y = d[k as string];
    const same = typeof x === 'number' && typeof y === 'number' ? Math.abs(x - y) < 1e-9 : (x ?? null) === (y ?? null);
    if (same) return;
    // El WACC manual solo cuenta si el modo activo es manual.
    if (k === 'waccManual' && A.waccMode !== 'manual') return;
    out.push(k === 'inflation' ? [label, scenLabel(y), scenLabel(x)] : [label, fm(y), fm(x)]);
  });
  if (A.weights && ds.combined) { const w = ds.combined.weights, z = A.weights, t = (o: typeof w) => Math.round(o.dcf * 100) + ' / ' + Math.round(o.comps * 100) + ' / ' + Math.round(o.transactions * 100) + ' %'; out.push(['Pesos DCF / Comps / Transacciones', t(w), t(z)]); }
  const n = (o?: Record<string, number>) => o ? Object.keys(o).length : 0;
  if (A.compsInclude || A.compsUse) out.push(['Muestra de Trading Comps', 'criterios del Excel', (n(A.compsInclude) + n(A.compsUse)) + ' cambio(s) manual(es)']);
  if (A.sdcInclude) out.push(['Muestra LSEG/SDC', 'criterios del Excel', n(A.sdcInclude) + ' operación(es) cambiada(s)']);
  if (A.dealsInclude || A.dealsUse) out.push(['Muestra CIQ (histórico)', 'criterios del Excel', (n(A.dealsInclude) + n(A.dealsUse)) + ' cambio(s) manual(es)']);
  return out;
}

const cache = new WeakMap<Dataset, Map<string, Snapshot>>();

/** Calcula (o reutiliza) la instantánea para los supuestos A. Devuelve null si el modelo no corre con esos supuestos. */
export function snapshot(ds: Dataset, A: Assumptions, now = new Date()): Snapshot | null {
  let m = cache.get(ds); if (!m) { m = new Map(); cache.set(ds, m); }
  const key = JSON.stringify(A), hit = m.get(key);
  if (hit) return { ...hit, generatedAt: now };
  const r = E.run(ds, A); if (!r.ok) return null;
  const b = r, D = E.defaults(ds), isBase = E.isDefault(ds, A) && !overridesActive(A);
  const r0 = isBase ? b : E.run(ds, D), b0 = (r0.ok ? r0 : b) as RunOk;
  const scen = E.scenarios(ds, A, b), torn = E.tornado(ds, A, b), grid = E.grid(ds, A, b), methods = E.methods(ds, A, b), sens = E.sensTables(ds, A, b);
  const rel = E.relative(ds, A, b.value), rec = E.recommendation(ds, A, b);
  const cmp = E.isDefault(ds, { ...A, inflation: D.inflation }) && (!A.inflation || !ds.expectedScenarios || !!ds.expectedScenarios[A.inflation]);
  const checks = E.validate(ds, A, b, cmp);
  // Tablas de la interfaz con los mismos supuestos (sin acciones: en un documento no se puede hacer clic).
  const c: Calc = { ds, A, D, base: b, base0: b0, isBase, view: b, VA: A };
  const all = annexTables(c, 'all') as TTable[], RV = relativeView({ setA: () => undefined }, ds, A, b) as any;
  const ui: Record<string, TTable[]> = {};
  all.forEach(t => { (ui[t.id] = ui[t.id] || []).push(t); });
  ([RV.mult, RV.trans, RV.ext] as { has?: boolean; tables?: TTable[] }[]).forEach(s => (s && s.has && s.tables || []).forEach(t => { (ui[t.id] = ui[t.id] || []).push(t); }));
  const out: Snapshot = { ds, A, D, b, b0, isBase, scen, torn, grid, methods, sens, rel, rec, checks, ui, changes: changesOf(ds, A, D), generatedAt: now };
  if (m.size > 20) m.clear();
  m.set(key, out);
  return out;
}
