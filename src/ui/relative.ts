// Modelo de vista de la valuación relativa (04 · Múltiplos), la valuación combinada (05 · Combinada)
// y las tablas de inflación. Solo presentación: todos los números salen de src/engine.
import * as E from '../engine';
import { fmt as f, type Assumptions, type Dataset, type RunOk } from '../engine';
import { cell, head, row, sec, table, toggle, txt, type TTable } from './tables';

const POS = 'var(--pos)', NEG = 'var(--neg)';
const px = (p: E.Price) => E.isNum(p) ? f.cur(p) : p;
const mx = (v: number | null | undefined) => v == null ? 'NA' : f.x(v, v < 10 ? 2 : 1);
const pc = (v: number | null | undefined, d = 1) => v == null ? '—' : f.p(v, d);

export interface RelativeApp { setA(patch: Partial<Assumptions>): void }

/** Cambia un indicador 1/0 respecto al dataset; si vuelve al valor original se elimina la excepción. */
function flip(cur: Record<string, number> | undefined, key: string, base: number, now: number): Record<string, number> | undefined {
  const next = { ...(cur || {}) }, v = now === 1 ? 0 : 1;
  if (v === base) delete next[key]; else next[key] = v;
  return Object.keys(next).length ? next : undefined;
}

export function overridesActive(A: Assumptions) { return !!(A.compsInclude || A.compsUse || A.dealsInclude || A.dealsUse || A.weights); }

export function relativeView(app: RelativeApp, ds: Dataset, A: Assumptions, b: RunOk) {
  if (!ds.comps && !ds.combined) return { has: false, mult: { has: false }, comb: { has: false } };
  const R = E.relative(ds, A, b.value), C = R.comps, T = R.transactions, K = R.combined, price = b.price;
  const up = (p: E.Price) => E.isNum(p) && price > 0 ? f.pp(p / price - 1) : '—';
  const upC = (p: E.Price) => E.isNum(p) && price > 0 ? (p >= price ? POS : NEG) : 'var(--color-text)';
  const tables: TTable[] = [], ttables: TTable[] = [];
  let mult: any = { has: false };
  if (C) {
    const S = C.spec, tgt = S.target;
    const keys: E.MultipleKey[] = ['evSales', 'evEbitda', 'evEbit', 'pe'], labels = ['EV/Ventas', 'EV/EBITDA', 'EV/EBIT', 'P/U'];
    const useOf = (k: E.MultipleKey) => (C.multiples.find(m => m.def.key === k) || { use: 0 }).use;
    tables.push(table('peers', '', 'Grupo comparable', 'Revisión de comparabilidad: clasificación y razón por empresa. Solo las empresas incluidas entran a los estadísticos.', 'S&P Capital IQ · as-of ' + (S.asOf || '—'), 'múltiplos LTM (x) · USD mm',
      head(['País', 'Industria (CIQ)', 'Clasificación', 'Incluir', 'Mg EBITDA', 'Crec. ventas', ...labels, 'Razón'], null, 4).map((h, i) => i === 10 ? { ...h, align: 'left' } : h),
      S.peers.map((p, i) => row(p.name, [txt(p.country, '80px'), txt(p.industry, '150px'), txt(p.classification, '130px', { color: p.include ? 'var(--color-text)' : NEG }),
        toggle(C.include[i], () => app.setA({ compsInclude: flip(A.compsInclude, p.name, p.include, C.include[i]) }), 'Incluir o excluir de la muestra'),
        cell(pc(p.ebitdaMargin)), cell(pc(p.growth)), ...keys.map(k => cell(mx(p.multiples[k]), { color: C.include[i] ? 'var(--color-text)' : 'var(--color-neutral-600)' })), txt(p.reason, '320px')], { tip: p.model })),
      { minW: '1500px', note: 'Clasificación del análisis de comparabilidad (Excel maestro, hoja Trading Comps). Múltiplos publicados por CIQ; no se recalculan ni se convierten divisas (los múltiplos no tienen unidades). NA = dato no disponible.' }));
    tables.push(table('msel', '', 'Múltiplos: selección', 'NM = calculable pero sin utilidad analítica · NA = falta el dato.', 'Excel maestro · Trading Comps §3', '',
      head(['Tipo', 'Métrica de ' + (ds.profile.short || ds.profile.name), 'Usar', 'Estado', 'Justificación'], null, 0).map((h, i) => i === 4 ? { ...h, align: 'left' } : h),
      C.multiples.map(m => row(m.def.label, [txt(m.def.kind || '', '40px'), cell(m.detail.metric == null ? 'NA' : f.n(m.detail.metric, 2)),
        m.def.metric ? toggle(m.use, () => app.setA({ compsUse: flip(A.compsUse, m.def.key, m.def.use, m.use) }), 'Usar o no este múltiplo en el valor del método') : cell('NA'),
        txt(m.def.status, '80px'), txt(m.def.reason, '420px')])), { minW: '980px' }));
    const ms = keys.map(k => C.multiples.find(m => m.def.key === k)!);
    tables.push(table('stats', '', 'Estadísticos de la muestra y precio implícito', 'Precio = (múltiplo × métrica + ajuste neto) ÷ acciones; múltiplos de precio: múltiplo × UPA. Percentiles inclusivos.', 'Motor ValuFlow · réplica de Trading Comps §4', 'x · ' + ds.profile.currency + ' por acción',
      head([...labels, ...labels.map(l => 'Precio ' + l)]),
      E.STAT_KEYS.map(s => row(E.STAT_LABELS[s], [...ms.map(m => cell(m.stats ? mx(m.stats[s]) : 'NA')), ...ms.map(m => cell(px(m.prices[s]), { bg: s === 'mean' ? 'var(--color-accent-100)' : 'transparent', color: m.use ? 'var(--color-text)' : 'var(--color-neutral-600)' }))], s === 'mean' ? { fw: 700 } : {}))
        .concat([row('n', [...ms.map(m => cell(m.stats ? m.stats.n : 0)), ...ms.map(() => cell(''))])]),
      { minW: '1100px', note: 'En gris: múltiplos no usados en el valor del método (se muestran para transparencia).' }));
    tables.push(table('detail', '', 'Del múltiplo al precio (a la media)', 'EV implícito → Equity Value → precio por acción.', 'Motor ValuFlow', ds.profile.units || '', head(labels),
      [row('Métrica de la empresa', ms.map(m => cell(m.detail.metric == null ? 'NA' : f.n(m.detail.metric, 2)))),
        row('EV implícito', ms.map(m => cell(m.detail.ev == null ? 'n.a. (múltiplo de precio)' : f.m(m.detail.ev, 1)))),
        row('(+/−) Ajuste neto EV → capital', ms.map(m => cell(m.detail.ev == null ? '—' : f.m(C.adj, 1)))),
        row('Equity Value implícito', ms.map(m => cell(m.detail.equity == null ? 'NA' : f.m(m.detail.equity, 1))), { fw: 600 }),
        row('Precio implícito', ms.map(m => cell(px(m.detail.price), { color: 'var(--color-accent)' })), { fw: 700 })], { minW: '640px' }));
    tables.push(table('bridge', '', 'Métricas de la empresa y puente EV → capital', 'Mismo corte que el as-of de CIQ (LTM al 2T26). Cada partida con su celda de origen.', 'Excel maestro · hoja Datos', ds.profile.units || '', head(['Valor', 'Origen'], null, null).map((h, i) => i === 1 ? { ...h, align: 'left' } : h),
      ([['Ventas LTM', tgt.revenue, 'revenue'], ['EBIT LTM', tgt.ebit, 'ebit'], ['EBITDA LTM', tgt.ebitda, 'ebitda'], ['UPA LTM (MXN)', tgt.eps, 'eps'], ['Acciones (millones)', tgt.shares, 'shares'],
        ['(+) Efectivo', tgt.cash, 'cash'], ['(−) Deuda bursátil y bancaria', -tgt.debt, 'debt'], ['(−) Arrendamientos', -tgt.lease, 'lease'], ['(−) Interés minoritario', -tgt.minority, 'minority'], ['(−) Capital preferente', -tgt.preferred, 'preferred']] as [string, number, string][])
        .map(([l, v, k]) => row(l, [cell(f.n(v, k === 'eps' ? 4 : 1)), txt((tgt.sources || {})[k] || '', '420px')])).concat([row('Ajuste neto EV → capital', [cell(f.m(C.adj, 1)), txt('Diap. 7: caja − deuda − minoritarios − preferentes', '420px')], { fw: 700 })]),
      { minW: '760px' }));
    mult = {
      has: true, value: px(C.value), p25: px(C.p25), p75: px(C.p75), n: C.n, total: S.peers.length, used: C.used, asOf: S.asOf || '', up: up(C.value), upColor: upC(C.value),
      note: S.note || '', tables, ttables, modified: !!(A.compsInclude || A.compsUse || A.dealsInclude || A.dealsUse),
      reset: () => app.setA({ compsInclude: undefined, compsUse: undefined, dealsInclude: undefined, dealsUse: undefined })
    };
  }
  if (T) {
    const S = T.spec, ms = (['evSales', 'evEbitda'] as const).map(k => T.multiples.find(m => m.def.key === k)!);
    ttables.push(table('deals', '', 'Operaciones y criterios de selección', 'Ventana de ' + S.criteria.windowYears + ' años (desde ' + T.windowStart + '), geografía ' + S.criteria.geography + ', al menos ' + S.criteria.minMultiples + ' múltiplos.', 'S&P Capital IQ · Comparable M&A Transactions', 'MXN mm · x',
      head(['Fecha', 'Comprador', 'País', 'TEV', 'EV/Ventas', 'EV/EBITDA', '¿Ventana?', '¿Geografía?', '¿≥2 múlt.?', '¿Control?', 'Incluir', 'Observaciones'], null, 3).map((h, i) => i === 11 ? { ...h, align: 'left' } : h),
      S.deals.map((d, i) => row(d.target, [txt(d.date, '90px'), txt(d.buyer || '—', '150px'), txt(d.country, '80px'), cell(d.tev == null ? '—' : f.m(d.tev, 1)), cell(mx(d.evSales)), cell(mx(d.evEbitda)),
        cell(T.checks[i].inWindow ? 'Sí' : 'No', { color: T.checks[i].inWindow ? POS : NEG }), cell(T.checks[i].inGeo ? 'Sí' : 'No', { color: T.checks[i].inGeo ? POS : NEG }), cell(T.checks[i].enoughMultiples ? 'Sí' : 'No'), cell(d.control || '—'),
        toggle(T.include[i], () => app.setA({ dealsInclude: flip(A.dealsInclude, d.id, d.include, T.include[i]) }), 'Incluir o excluir la operación'), txt(d.note, '360px')])),
      { minW: '1500px', warn: S.warning, note: 'No se agregan operaciones, geografías ni ventanas que no estén en la fuente. La ampliación por industria o global requiere otra búsqueda en CIQ.' }));
    ttables.push(table('tstats', '', 'Estadísticos y precio implícito', 'Mismo puente EV → capital que Trading Comps.', 'Motor ValuFlow · réplica de Precedent Transactions §3', 'x · ' + ds.profile.currency + ' por acción',
      head(['EV/Ventas', 'EV/EBITDA', 'Precio EV/Ventas', 'Precio EV/EBITDA']),
      E.STAT_KEYS.map(s => row(E.STAT_LABELS[s], [...ms.map(m => cell(m.stats ? mx(m.stats[s]) : 'NA')), ...ms.map(m => cell(px(m.prices[s]), { bg: s === 'mean' ? 'var(--color-accent-100)' : 'transparent', color: m.use ? 'var(--color-text)' : 'var(--color-neutral-600)' }))], s === 'mean' ? { fw: 700 } : {}))
        .concat([row('n', [...ms.map(m => cell(m.stats ? m.stats.n : 0)), cell(''), cell('')])])
        .concat(ms.map(m => row('Usar ' + m.def.label, [toggle(m.use, () => app.setA({ dealsUse: flip(A.dealsUse, m.def.key, m.def.use, m.use) }), m.def.reason), txt(m.def.status, '80px'), txt(m.def.reason, '360px'), cell('')]))),
      { minW: '760px' }));
    mult.trans = { value: px(T.value), lo: px(T.lo), hi: px(T.hi), n: T.n, inWindow: T.checks.filter((c, i) => c.inWindow && T.include[i]).length, inGeo: T.checks.filter(c => c.inGeo).length, warning: S.warning || '', up: up(T.value), upColor: upC(T.value) };
  }
  let comb: any = { has: false };
  if (K) {
    const W0 = ds.combined!.weights, reasons = ds.combined!.reasons || {};
    const setW = (k: 'dcf' | 'comps' | 'transactions') => (e: { target: { value: string } }) => {
      const v = parseFloat(e.target.value); if (!isFinite(v) || v < 0) return;
      const cur = { ...(A.weights || W0), [k]: v / 100 };
      const same = (['dcf', 'comps', 'transactions'] as const).every(x => Math.abs(cur[x] - W0[x]) < 1e-12);
      app.setA({ weights: same ? undefined : cur });
    };
    comb = {
      has: true, value: px(K.value), up: up(K.value), upColor: upC(K.value), classValue: px(K.classValue), weightSum: f.p(K.weightSum, 0), sumOk: Math.abs(K.weightSum - 1) < 1e-9,
      errors: K.errors, hasErrors: K.errors.length > 0, classRule: ds.combined!.classRule || '', modified: !!A.weights, reset: () => app.setA({ weights: undefined }),
      price: f.cur(price), diff: E.isNum(K.value) ? (K.value - price >= 0 ? '+' : '−') + '$' + Math.abs(K.value - price).toFixed(2) : '—',
      rows: K.rows.map(r => ({ key: r.key, label: r.label, price: px(r.price), weight: +(r.weight * 100).toFixed(6), onChange: setW(r.key), classW: f.p(r.classWeight, 1), contribution: f.cur(r.contribution), reason: reasons[r.key] || '', ref: r.key === 'transactions' }))
    };
  }
  return { has: true, mult, comb };
}

/** Tablas de inflación (anexo y página de flujos). */
export function inflationTables(ds: Dataset, A: Assumptions, b: RunOk, code = ''): TTable[] {
  const I = ds.inflation; if (!I) return [];
  const out: TTable[] = [], Y = ds.forecast.years, n = Y.length, M = E.inflationModels(I);
  const sc = E.scenarios(ds, A, b);
  out.push(table('infl', code, 'Escenarios de inflación documentados', 'Solo existen estos escenarios; cada uno re-ejecuta el modelo completo.', 'Excel maestro · hoja Inflación §1 y §4', '% anual · ' + ds.profile.currency + ' por acción',
    head([...Y, 'Precio DCF', 'Naturaleza', 'Fuente'], null, null).map((h, i) => i >= n + 1 ? { ...h, align: 'left' } : h),
    sc.map(s => row(s.label + (s.active ? ' · activo' : ''), [...E.inflationScenarios(I, n).find(x => x.key === s.key)!.path.map(v => cell(f.p(v))), cell(s.value == null ? '—' : f.cur(s.value), { color: 'var(--color-accent)' }), txt(s.kind, '200px'), txt(s.source, '420px')], s.active ? { fw: 700 } : {})),
    { minW: '1400px', note: 'Los escenarios constantes extienden a ' + Y[0] + '–' + Y[n - 1] + ' un pronóstico de un periodo: es un supuesto documentado. Mayor inflación eleva el valor porque el WACC nominal no cambia (no hay relación documentada inflación → Rf/WACC/g).' }));
  const bd = b.drivers.build;
  if (bd) out.push(table('infl', '', 'Transmisión de la inflación a las ventas (escenario activo)', 'Inflación → crecimiento nominal del mercado → variables externas → ponderación con mínimos cuadrados → ventas → FCF.', 'Motor ValuFlow · réplica de Proyección Final filas 10–28', '% · ' + (ds.profile.units || ''), head(Y),
    [row('Inflación aplicada', bd.years.map(y => cell(f.p(y.inflation)))), row('Crecimiento nominal del mercado', bd.years.map(y => cell(f.p(y.marketGrowth)))),
      row('Crecimiento por variables externas', bd.years.map(y => cell(f.p(y.growthExternal)))), row('Crecimiento por mínimos cuadrados', bd.years.map(y => cell(f.p(y.growthLS)))),
      row('Peso de variables externas', ds.forecast.build!.weightsExternal.map(w => cell(f.p(w, 0)))),
      row('Crecimiento final de ventas', bd.years.map(y => cell(f.p(y.growth))), { fw: 700 }), row('Ventas', bd.years.map(y => cell(f.m(y.revenue, 1)))),
      row('Margen EBIT (sin término de inflación)', bd.years.map(y => cell(f.p(y.margin)))), row('Capex', bd.years.map(y => cell(f.m(y.capex, 1)))), row('FCF', bd.years.map(y => cell(f.m(y.fcf, 1))), { fw: 700 })],
    { minW: '760px', note: (I.chain || []).map(c => c[0] + ' ' + c[1]).join(' · ') }));
  if (M && I.models) {
    const X = I.models, m3 = (k: 'immediate' | 'quarterly' | 'long', l: string) => row(l, [cell(M[k].n), cell(M[k].a.toFixed(4)), cell(M[k].b.toFixed(6)), cell(M[k].r2.toFixed(3)), cell(M[k].xNext), cell(f.p(M[k].forecast, 3), { color: 'var(--color-accent)' }), cell(X[k] && X[k].forecast != null ? f.p(X[k].forecast as number, 3) : '—')]);
    out.push(table('infl', '', 'Modelos exponenciales de clase  y = a·e^(b·x)', 'Calculados por la app con la serie de Banxico y comparados contra el Excel.', 'Banxico SP74833 · Excel maestro hoja Inflación §3', 'n · coeficientes · %',
      head(['n', 'a', 'b', 'R²', 'x siguiente', 'Proyección (app)', 'Excel']),
      [m3('immediate', 'Inmediata (último año, quincenal)'), m3('quarterly', 'Trimestral (4 promedios) → Base'), m3('long', 'Ventana larga 2023–2026'),
        row('Libro de clase (coeficientes redondeados)', [cell(''), cell(X.classRounded && X.classRounded.a != null ? String(X.classRounded.a) : '—'), cell(X.classRounded && X.classRounded.b != null ? String(X.classRounded.b) : '—'), cell(''), cell(''), cell(f.p(M.classRounded, 3)), cell(X.classRounded && X.classRounded.forecast != null ? f.p(X.classRounded.forecast, 3) : '—')]),
        row('Construcción de clase S113', [cell(''), cell(''), cell(''), cell(''), cell(''), cell(f.p(M.classS113, 3)), cell(X.classS113 && X.classS113.forecast != null ? f.p(X.classS113.forecast, 3) : '—')]),
        row('Escenario Base = trimestral redondeado', [cell(''), cell(''), cell(''), cell(''), cell(''), cell(f.p(M.baseFromModel, 2), { color: 'var(--color-accent)' }), cell(I.scenarios.base ? f.p(I.scenarios.base.value as number, 2) : '—')], { fw: 700 })],
      { minW: '820px', note: 'b = SLOPE(ln y, x); a = EXP(INTERCEPT(ln y, x)); R² = RSQ. R² bajo en los modelos de corto plazo: la tendencia explica poco de la variación.' }));
  }
  if (I.beta) out.push(table('infl', '', 'Beta: histórica vs. beta del WACC', 'Son conceptos distintos: la beta del WACC es sectorial desapalancada (input heredado).', 'Excel maestro · hoja Inflación §6 y WACC!B9', 'x',
    head(['Valor', 'Lectura'], null, null).map((h, i) => i === 1 ? { ...h, align: 'left' } : h),
    [row('Beta histórica (regresión diaria Soriana vs. IPC)', [cell(I.beta.historical.toFixed(4)), txt('R² ' + I.beta.r2.toFixed(4) + ' · ' + I.beta.n + ' observaciones. No alimenta el DCF.', '420px')]),
      row('Beta reportada en el estudio de clase', [cell(I.beta.reported.toFixed(4)), txt('Fórmula SLOPE(…)×10: el factor ×10 no tiene sustento.', '420px')]),
      row('Beta desapalancada sectorial usada en el WACC', [cell(I.beta.wacc.toFixed(2)), txt('Input heredado del Excel; fuente pendiente. No es una beta calculada de Soriana.', '420px')], { fw: 700 }),
      ...(I.beta.damodaranUnverified != null ? [row('Referencia Damodaran (no verificada)', [cell(I.beta.damodaranUnverified.toFixed(2)), txt('No se usa: el sitio de la fuente no fue accesible para verificar.', '420px')])] : [])],
    { minW: '720px' }));
  if (I.series) out.push(table('infl', '', 'Serie observada: INPC, variación anual quincenal', I.series.length + ' observaciones.', 'Banco de México · SP74833', '% anual', head(['Inflación']),
    I.series.slice().reverse().map(s => row(s[0], [cell(s[1].toFixed(2) + '%')])), { minW: '320px' }));
  return out;
}

/** Proyección de estados financieros en vivo (proyección por drivers). */
export function projectedTable(ds: Dataset, b: RunOk, code: string): TTable | null {
  const bd = b.drivers.build; if (!bd) return null;
  const Y = [ds.forecast.baseYear, ...bd.years.map(y => y.year)], base = ds.annex?.projected;
  const b0 = (label: string): unknown => { const r = base && base.rows.find(x => !('section' in x) && x[0] === label); return r && !('section' in r) ? r[1] : null; };
  const L: [string, (y: E.BuildYear) => number, boolean?][] = [
    ['Ventas', y => y.revenue, true], ['Costo de ventas', y => y.cogs], ['Utilidad bruta', y => y.gross], ['Gastos de operación (sin D&A)', y => y.opex], ['EBITDA', y => y.ebitda],
    ['Depreciación y amortización', y => -y.da], ['Utilidad de operación (EBIT)', y => y.ebit, true], ['Gastos financieros', y => y.interest], ['Utilidad antes de impuestos', y => y.ebt],
    ['Impuestos a la utilidad', y => y.taxes], ['Utilidad neta', y => y.netIncome, true], ['Dividendos pagados', y => y.dividends]];
  const Bs: [string, (y: E.BuildYear) => number, boolean?][] = [
    ['Efectivo y equivalentes', y => y.cash], ['Inventarios', y => y.inventory], ['Otros activos circulantes', y => y.otherCA], ['Activo no circulante', y => y.nonCurrent], ['Activo total', y => y.totalAssets, true],
    ['Pasivo circulante operativo', y => y.opCL], ['Deuda bursátil y bancaria', y => y.debt], ['Pasivo por arrendamiento', y => y.lease], ['Otros pasivos a largo plazo', y => y.otherLT], ['Pasivo total', y => y.totalLiabilities, true],
    ['Capital contable', y => y.equity], ['Comprobación (A − P − C)', y => y.check]];
  const mk = (l: [string, (y: E.BuildYear) => number, boolean?]) => row(l[0], [cell(b0(l[0]) == null ? '—' : f.m(b0(l[0]), 1)), ...bd.years.map(y => cell(f.m(l[1](y), 1), { bg: 'color-mix(in srgb, var(--color-accent-100) 55%, transparent)' }))], l[2] ? { fw: 600 } : {});
  const sc = ds.inflation && bd.scenario ? ds.inflation.scenarios[bd.scenario] : null;
  return table('proj', code, 'Proyección de estados financieros', 'Recalculada en vivo desde los drivers del Excel' + (sc ? ' · inflación: ' + sc.label : '') + '.', 'Motor ValuFlow · réplica de Proyección Final', ds.profile.units || '', head(Y, 1),
    [sec('Estado de resultados', Y.length), ...L.map(mk), sec('Balance general', Y.length), ...Bs.map(mk)]);
}
