// Modelo de vista de la valuación relativa (04 · Múltiplos, 05 · Transacciones), la valuación combinada (06 · Combinada),
// la inflación (Laboratorio) y la beta. Solo presentación: todos los números salen de src/engine.
// Cada resultado trae su "cadena de trazabilidad": de dónde sale el número, paso a paso.
import * as E from '../engine';
import { fmt as f, type Assumptions, type Dataset, type RunOk } from '../engine';
import { cell, head, row, sec, table, toggle, txt, type TTable } from './tables';

const POS = 'var(--pos)', NEG = 'var(--neg)';
const px = (p: E.Price) => E.isNum(p) ? f.cur(p) : p;
const mx = (v: number | null | undefined) => v == null ? 'NA' : f.x(v, v < 10 ? 2 : 1);
const pc = (v: number | null | undefined, d = 1) => v == null ? '—' : f.p(v, d);

export interface RelativeApp { setA(patch: Partial<Assumptions>): void }
/** Un paso de una cadena de trazabilidad: concepto, valor y fórmula / origen. */
export interface Step { k: string; v: string; f: string; strong?: boolean }
export interface Chain { title: string; steps: Step[] }

/** Cambia un indicador 1/0 respecto al dataset; si vuelve al valor original se elimina la excepción. */
function flip(cur: Record<string, number> | undefined, key: string, base: number, now: number): Record<string, number> | undefined {
  const next = { ...(cur || {}) }, v = now === 1 ? 0 : 1;
  if (v === base) delete next[key]; else next[key] = v;
  return Object.keys(next).length ? next : undefined;
}

export function overridesActive(A: Assumptions) { return !!(A.compsInclude || A.compsUse || A.dealsInclude || A.dealsUse || A.weights); }

const metricName: Record<string, string> = { revenue: 'Ventas LTM', ebitda: 'EBITDA LTM', ebit: 'EBIT LTM', eps: 'UPA LTM' };

/** Cadena múltiplo → estadístico → métrica → EV → Equity → precio para un múltiplo (a la media). */
function multipleChain(m: E.MultipleResult, adj: number, shares: number, sampleTxt: string, sampleLabel: string): Chain {
  const st = m.stats!, d = m.detail, isP = m.def.metric === 'eps';
  const steps: Step[] = [
    { k: sampleLabel, v: sampleTxt, f: 'Incluir = 1' },
    { k: 'Múltiplo ' + m.def.label, v: m.values.map(x => mx(x)).join(' · '), f: 'Publicado por la fuente (sin recalcular)' },
    { k: 'Estadístico: media', v: mx(st.mean), f: 'AVERAGE de ' + st.n + ' valores (mediana ' + mx(st.median) + ', P25 ' + mx(st.p25) + ', P75 ' + mx(st.p75) + ')' },
    { k: 'Métrica de la empresa', v: d.metric == null ? 'NA' : f.n(d.metric, isP ? 4 : 1), f: metricName[m.def.metric || ''] || '' }
  ];
  if (isP) steps.push({ k: 'Equity Value', v: d.equity == null ? 'NA' : f.m(d.equity, 1), f: 'múltiplo × UPA × ' + f.n(shares, 1) + ' mm de acciones' });
  else steps.push({ k: 'EV implícito', v: d.ev == null ? 'NA' : f.m(d.ev, 1), f: 'múltiplo × métrica' }, { k: 'Equity Value', v: d.equity == null ? 'NA' : f.m(d.equity, 1), f: 'EV ' + (adj < 0 ? '− ' : '+ ') + f.m(Math.abs(adj), 1) + ' (caja − deuda − arrendamientos − minoritarios − preferentes)' });
  steps.push({ k: 'Precio implícito', v: px(d.price), f: isP ? 'múltiplo × UPA' : 'Equity ÷ ' + f.n(shares, 1) + ' mm de acciones', strong: true });
  return { title: m.def.label, steps };
}

export function relativeView(app: RelativeApp, ds: Dataset, A: Assumptions, b: RunOk) {
  const none = { has: false, mult: { has: false }, trans: { has: false }, comb: { has: false } };
  if (!ds.comps && !ds.combined) return none;
  const R = E.relative(ds, A, b.value), C = R.comps, T = R.transactions, K = R.combined, price = b.price;
  const up = (p: E.Price) => E.isNum(p) && price > 0 ? f.pp(p / price - 1) : '—';
  const upC = (p: E.Price) => E.isNum(p) && price > 0 ? (p >= price ? POS : NEG) : 'var(--color-text)';
  const reset = () => app.setA({ compsInclude: undefined, compsUse: undefined, dealsInclude: undefined, dealsUse: undefined });

  // ------------------------------------------------------------- 04 · Trading Comps
  let mult: any = { has: false };
  if (C) {
    const S = C.spec, tgt = S.target, tables: TTable[] = [];
    const keys: E.MultipleKey[] = ['evSales', 'evEbitda', 'evEbit', 'pe'], labels = ['EV/Ventas', 'EV/EBITDA', 'EV/EBIT', 'P/U'];
    tables.push(table('peers', '', 'Muestra y criterios: grupo comparable', 'Revisión de comparabilidad por empresa (1 incluida, 6 con reserva, 3 excluidas). Solo las incluidas entran a los estadísticos.', 'S&P Capital IQ · as-of ' + (S.asOf || '—'), 'múltiplos LTM (x) · márgenes %',
      head(['País', 'Industria (CIQ)', 'Clasificación', 'Incluir', 'Mg EBITDA', 'Crec. ventas', ...labels, 'Razón'], null, 4).map((h, i) => i === 10 ? { ...h, align: 'left' } : h),
      S.peers.map((p, i) => row(p.name, [txt(p.country, '80px'), txt(p.industry, '150px'), txt(p.classification, '130px', { color: p.include ? 'var(--color-text)' : NEG }),
        toggle(C.include[i], () => app.setA({ compsInclude: flip(A.compsInclude, p.name, p.include, C.include[i]) }), 'Incluir o excluir de la muestra'),
        cell(pc(p.ebitdaMargin)), cell(pc(p.growth)), ...keys.map(k => cell(mx(p.multiples[k]), { color: C.include[i] ? 'var(--color-text)' : 'var(--color-neutral-600)' })), txt(p.reason, '320px')], { tip: p.model })),
      { minW: '1500px', note: 'Clasificación del análisis de comparabilidad (Excel maestro, hoja Trading Comps). Múltiplos publicados por CIQ; no se recalculan ni se convierten divisas (los múltiplos no tienen unidades). NA = dato no disponible.' }));
    tables.push(table('msel', '', 'Múltiplos: selección', 'NM = calculable pero sin utilidad analítica (p. ej. capital implícito ≤ 0) · NA = falta el dato.', 'Excel maestro · Trading Comps §3', '',
      head(['Tipo', 'Métrica de ' + (ds.profile.short || ds.profile.name), 'Usar', 'Estado', 'Justificación'], null, 0).map((h, i) => i === 4 ? { ...h, align: 'left' } : h),
      C.multiples.map(m => row(m.def.label, [txt(m.def.kind || '', '40px'), cell(m.detail.metric == null ? 'NA' : f.n(m.detail.metric, 2)),
        m.def.metric ? toggle(m.use, () => app.setA({ compsUse: flip(A.compsUse, m.def.key, m.def.use, m.use) }), 'Usar o no este múltiplo en el valor del método') : cell('NA'),
        txt(m.def.status, '80px'), txt(m.def.reason, '420px')])), { minW: '980px' }));
    const ms = keys.map(k => C.multiples.find(m => m.def.key === k)!);
    tables.push(table('stats', '', 'Estadísticos y precio implícito', 'Precio = (múltiplo × métrica + ajuste neto) ÷ acciones; múltiplos de precio: múltiplo × UPA. Percentiles inclusivos.', 'Motor ValuFlow · réplica de Trading Comps §4', 'x · ' + ds.profile.currency + ' por acción',
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
    const incNames = S.peers.filter((_, i) => C.include[i] === 1).map(p => p.name.replace(/\s*\(.*\)$/, '').replace(/,? S\.A\.B?\..*$/i, ''));
    const chains = C.multiples.filter(m => m.use === 1 && m.stats).map(m => multipleChain(m, C.adj, tgt.shares, C.n + ' de ' + S.peers.length + ': ' + incNames.join(', '), 'Comparables'));
    const usedP = C.multiples.filter(m => m.use === 1 && E.isNum(m.prices.mean));
    chains.push({ title: 'Resultado del método', steps: [...usedP.map(m => ({ k: 'Precio ' + m.def.label, v: px(m.prices.mean), f: 'a la media' })), { k: 'Trading Comps', v: px(C.value), f: 'Promedio simple de ' + usedP.length + ' precios (diap. 9)', strong: true }] });
    mult = {
      has: true, value: px(C.value), p25: px(C.p25), p75: px(C.p75), n: C.n, total: S.peers.length, used: C.used, asOf: S.asOf || '', up: up(C.value), upColor: upC(C.value),
      note: S.note || '', tables, chains, modified: !!(A.compsInclude || A.compsUse), reset
    };
  }

  // ------------------------------------------------------------- 05 · Precedent Transactions
  let trans: any = { has: false };
  if (T) {
    const S = T.spec, tgt = ds.comps!.target, ms = (['evSales', 'evEbitda'] as const).map(k => T.multiples.find(m => m.def.key === k)!), tables: TTable[] = [];
    tables.push(table('crit', '', 'Criterios de selección (metodología de clase, diap. 10)', 'Se evalúan con los datos de cada operación; no se agregan operaciones ni se amplían criterios sin una nueva búsqueda en CIQ.', 'Excel maestro · Precedent Transactions §1', '',
      head(['Valor', 'Lectura'], null, null).map((h, i) => i === 1 ? { ...h, align: 'left' } : h),
      [row('Fecha de valuación', [cell(S.criteria.valuationDate), txt('Misma fecha que el DCF.', '420px')]),
        row('Ventana temporal', [cell(S.criteria.windowYears + ' años'), txt('Desde ' + T.windowStart + ' · ' + T.checks.filter(c => c.inWindow).length + ' de ' + S.deals.length + ' operaciones dentro.', '420px')]),
        row('Geografía del objetivo', [cell(S.criteria.geography), txt(T.checks.filter(c => c.inGeo).length + ' de ' + S.deals.length + ' operaciones cumplen.', '420px')]),
        row('Industria', [cell('Autoservicio'), txt('Selección "Comparable M&A Transactions" de CIQ para Soriana; objetivos: supermercados (Grupo Éxito, InRetail).', '420px')]),
        row('Mínimo de múltiplos', [cell(String(S.criteria.minMultiples)), txt(T.checks.filter(c => c.enoughMultiples).length + ' de ' + S.deals.length + ' operaciones cumplen.', '420px')])], { minW: '760px' }));
    tables.push(table('deals', '', 'Operaciones, comparabilidad y múltiplos', 'Datos de CIQ con la evaluación de cada criterio.', 'S&P Capital IQ · Comparable M&A Transactions', 'MXN mm · x',
      head(['Fecha', 'Comprador', 'País', 'Industria', 'TEV', 'EV/Ventas', 'EV/EBITDA', '¿Ventana?', '¿Geografía?', '¿≥2 múlt.?', '¿Control?', 'Incluir', 'Observaciones'], null, 4).map((h, i) => i === 12 ? { ...h, align: 'left' } : h),
      S.deals.map((d, i) => row(d.target, [txt(d.date, '90px'), txt(d.buyer || '—', '150px'), txt(d.country, '80px'), txt(d.industry || '—', '170px'), cell(d.tev == null ? '—' : f.m(d.tev, 1)), cell(mx(d.evSales)), cell(mx(d.evEbitda)),
        cell(T.checks[i].inWindow ? 'Sí' : 'No', { color: T.checks[i].inWindow ? POS : NEG }), cell(T.checks[i].inGeo ? 'Sí' : 'No', { color: T.checks[i].inGeo ? POS : NEG }), cell(T.checks[i].enoughMultiples ? 'Sí' : 'No'), cell(d.control || '—'),
        toggle(T.include[i], () => app.setA({ dealsInclude: flip(A.dealsInclude, d.id, d.include, T.include[i]) }), 'Incluir o excluir la operación'), txt(d.note, '360px')])),
      { minW: '1650px', warn: S.warning }));
    tables.push(table('tstats', '', 'Estadísticos, precio implícito y selección de múltiplos', 'Mismo puente EV → capital que Trading Comps.', 'Motor ValuFlow · réplica de Precedent Transactions §3', 'x · ' + ds.profile.currency + ' por acción',
      head(['EV/Ventas', 'EV/EBITDA', 'Precio EV/Ventas', 'Precio EV/EBITDA']),
      E.STAT_KEYS.map(s => row(E.STAT_LABELS[s], [...ms.map(m => cell(m.stats ? mx(m.stats[s]) : 'NA')), ...ms.map(m => cell(px(m.prices[s]), { bg: s === 'mean' ? 'var(--color-accent-100)' : 'transparent', color: m.use ? 'var(--color-text)' : 'var(--color-neutral-600)' }))], s === 'mean' ? { fw: 700 } : {}))
        .concat([row('n', [...ms.map(m => cell(m.stats ? m.stats.n : 0)), cell(''), cell('')])])
        .concat(ms.map(m => row('Usar ' + m.def.label, [toggle(m.use, () => app.setA({ dealsUse: flip(A.dealsUse, m.def.key, m.def.use, m.use) }), m.def.reason), txt(m.def.status, '80px'), txt(m.def.reason, '360px'), cell('')]))),
      { minW: '760px' }));
    tables.push(table('tdetail', '', 'Del múltiplo al precio (a la media)', 'EV implícito → Equity Value → precio por acción.', 'Motor ValuFlow · réplica de Precedent Transactions (detalle)', ds.profile.units || '', head(['EV/Ventas', 'EV/EBITDA']),
      [row('Múltiplo (media)', ms.map(m => cell(m.stats ? mx(m.stats.mean) : 'NA'))), row('Métrica de la empresa', ms.map(m => cell(m.detail.metric == null ? 'NA' : f.m(m.detail.metric, 1)))),
        row('EV implícito', ms.map(m => cell(m.detail.ev == null ? 'NA' : f.m(m.detail.ev, 1)))), row('(+/−) Ajuste neto EV → capital', ms.map(() => cell(f.m(E.bridgeAdj(tgt), 1)))),
        row('Equity Value implícito', ms.map(m => cell(m.detail.equity == null ? 'NA' : f.m(m.detail.equity, 1))), { fw: 600 }),
        row('Precio implícito', ms.map(m => cell(px(m.detail.price), { color: m.use ? 'var(--color-accent)' : 'var(--color-neutral-600)' })), { fw: 700 })], { minW: '560px' }));
    const chains = T.multiples.filter(m => m.use === 1 && m.stats).map(m => multipleChain(m, E.bridgeAdj(tgt), tgt.shares, T.n + ' de ' + S.deals.length + ': ' + S.deals.filter((_, i) => T.include[i] === 1).map(d => d.target + ' (' + d.date.slice(0, 4) + ')').join(', '), 'Transacciones'));
    const usedP = T.multiples.filter(m => m.use === 1 && E.isNum(m.prices.mean));
    chains.push({ title: 'Resultado del método', steps: [...usedP.map(m => ({ k: 'Precio ' + m.def.label, v: px(m.prices.mean), f: 'a la media' })), { k: 'Precedent Transactions', v: px(T.value), f: 'Promedio de ' + usedP.length + ' precio(s) · rango ' + px(T.lo) + ' – ' + px(T.hi) + ' (mín – máx)', strong: true }] });
    const wT = (A.weights ?? ds.combined?.weights)?.transactions ?? 0;
    trans = {
      has: true, value: px(T.value), lo: px(T.lo), hi: px(T.hi), n: T.n, total: S.deals.length, inWindow: T.checks.filter((c, i) => c.inWindow && T.include[i]).length, inGeo: T.checks.filter(c => c.inGeo).length,
      warning: S.warning || '', up: up(T.value), upColor: upC(T.value), weightTxt: f.p(wT, 0), contributes: wT > 0, tables, chains, modified: !!(A.dealsInclude || A.dealsUse), reset
    };
  }

  // ------------------------------------------------------------- 06 · Valuación combinada
  let comb: any = { has: false };
  if (K) {
    const W0 = ds.combined!.weights, reasons = ds.combined!.reasons || {}, Wc = A.weights || W0;
    const setW = (k: 'dcf' | 'comps' | 'transactions') => (e: { target: { value: string } }) => {
      const v = parseFloat(e.target.value); if (!isFinite(v) || v < 0 || v > 100) return;
      const cur = { ...Wc, [k]: v / 100 };
      const same = (['dcf', 'comps', 'transactions'] as const).every(x => Math.abs(cur[x] - W0[x]) < 1e-12);
      app.setA({ weights: same ? undefined : cur });
    };
    const chain: Step[] = K.rows.map(r => ({ k: r.label + ' (' + f.p(r.weight, 0) + ')', v: f.cur(r.contribution), f: px(r.price) + ' × ' + f.p(r.weight, 0) + (r.weight > 0 ? '' : ' · no contribuye') }));
    chain.push({ k: 'Precio combinado', v: px(K.value), f: 'Σ contribuciones (pesos = ' + f.p(K.weightSum, 0) + ')', strong: true });
    comb = {
      has: true, value: px(K.value), up: up(K.value), upColor: upC(K.value), classValue: px(K.classValue), weightSum: f.p(K.weightSum, 0), sumOk: Math.abs(K.weightSum - 1) < 1e-9,
      errors: K.errors, hasErrors: K.errors.length > 0, classRule: ds.combined!.classRule || '', modified: !!A.weights, reset: () => app.setA({ weights: undefined }),
      price: f.cur(price), diff: E.isNum(K.value) ? (K.value - price >= 0 ? '+' : '−') + '$' + Math.abs(K.value - price).toFixed(2) : '—',
      contributors: K.rows.filter(r => r.weight > 0).map(r => r.label).join(' + ') || 'ninguno',
      chain: { title: '¿De dónde salió el precio combinado?', steps: chain },
      rows: K.rows.map(r => ({ key: r.key, label: r.label, price: px(r.price), weight: +(r.weight * 100).toFixed(6), onChange: setW(r.key), classW: f.p(r.classWeight, 1), contribution: f.cur(r.contribution), reason: reasons[r.key] || '', ref: r.weight === 0, tag: r.weight > 0 ? 'Contribuye' : 'Referencia · 0%', tagCls: r.weight > 0 ? 'tag-accent' : 'tag-neutral' }))
    };
  }
  return { has: true, mult, trans, comb };
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
  return table('proj', code, 'Proyección de estados financieros', 'Recalculada en vivo desde los drivers del Excel · inflación ' + f.p(bd.inflation[0]) + (bd.scenario ? ' · escenario ' + bd.scenario : '') + '.', 'Motor ValuFlow · réplica de Proyección Final', ds.profile.units || '', head(Y, 1),
    [sec('Estado de resultados', Y.length), ...L.map(mk), sec('Balance general', Y.length), ...Bs.map(mk)]);
}
