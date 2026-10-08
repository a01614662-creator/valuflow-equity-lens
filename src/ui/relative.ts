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

// ------------------------------------------------------------- Inflación (Laboratorio y anexo)

/** Cadena datos → modelo → forecast → escenario → inflación → ventas → FCF → EV → Equity → precio (escenario activo). */
export function inflationChain(ds: Dataset, A: Assumptions, b: RunOk): Chain | null {
  const I = ds.inflation, bd = b.drivers.build; if (!I || !bd) return null;
  const M = E.inflationModels(I), key = A.inflation ?? I.default, sc = I.scenarios[key], S = I.series || [], last = S[S.length - 1], n = bd.years.length, yN = bd.years[n - 1];
  const steps: Step[] = [];
  if (last) steps.push({ k: 'Datos históricos', v: S.length + ' quincenas', f: 'INPC anual, Banxico SP74833 · último ' + last[0] + ': ' + last[1].toFixed(2) + '%' });
  if (M) steps.push({ k: 'Modelo', v: 'y = ' + M.quarterly.a.toFixed(4) + '·e^(' + M.quarterly.b.toFixed(4) + '·x)', f: 'Exponencial trimestral de clase · R² ' + M.quarterly.r2.toFixed(3) },
    { k: 'Forecast del modelo', v: f.p(M.quarterly.forecast, 3), f: 'x = 5 (siguiente trimestre) → Base ' + f.p(M.baseFromModel, 2) });
  steps.push({ k: 'Escenario aplicado', v: sc.label + (sc.value != null ? ' ' + f.p(sc.value) : ''), f: sc.kind },
    { k: 'Inflación aplicada', v: bd.years.map(y => f.p(y.inflation)).join(' · '), f: ds.forecast.years[0] + '–' + ds.forecast.years[n - 1] + ' · Proyección Final fila 10' },
    { k: 'Crecimiento de ventas ' + bd.years[0].year, v: f.p(bd.years[0].growth), f: 'w·(inflación + PIB × elasticidad + ajustes) + (1 − w)·mín. cuadrados' },
    { k: 'Ventas ' + yN.year, v: f.m(yN.revenue, 1), f: 'Σ crecimientos compuestos' },
    { k: 'FCF ' + yN.year, v: f.m(yN.fcf, 1), f: 'NOPAT + D&A − Capex − ΔNWC' },
    { k: 'EV ponderado', v: f.m(b.evW, 1), f: 'Σ VP(FCF) + VP(valor terminal 50% Gordon / 50% múltiplo) · WACC ' + f.p(b.wacc) },
    { k: 'Equity a la fecha de valuación', v: f.m(b.eqVal, 1), f: 'EV − deuda neta, llevado al ' + ds.dates.valuation },
    { k: 'Precio DCF', v: f.cur(b.value), f: 'Equity ÷ acciones', strong: true });
  return { title: 'Inflación → precio (' + sc.label + ')', steps };
}

/** Gráfica de la serie observada con los escenarios oficiales y la referencia. */
export function inflationChart(ds: Dataset, A: Assumptions) {
  const I = ds.inflation; if (!I || !I.series || !I.series.length) return null;
  const S = I.series, n = ds.forecast.years.length, sc = E.inflationScenarios(I, n, true), M = E.inflationModels(I);
  const vals = S.map(s => s[1]).concat(sc.map(s => s.path[0] * 100));
  const lo = Math.floor(Math.min(...vals) - 0.3), hi = Math.ceil(Math.max(...vals) + 0.3);
  // Serie observada hasta X1; zona de proyección X1–X2 con los escenarios; etiquetas separadas para no encimarse.
  const W = 680, H = 230, X0 = 44, X1 = 470, X2 = 530, Y0 = 16, Y1 = 196;
  const xs = (i: number) => X0 + i * (X1 - X0) / (S.length - 1), ys = (v: number) => Y1 - (v - lo) / (hi - lo) * (Y1 - Y0);
  const active = A.inflation ?? I.default;
  const raw = sc.map(s => ({ s, y: ys(s.path[0] * 100) })).sort((a, z) => a.y - z.y);
  let prev = -Infinity; const ly = raw.map(r => { const v = Math.max(r.y, prev + 12); prev = v; return v; });
  const lines = raw.map((r, i) => ({ y: r.y.toFixed(1), ly: ly[i].toFixed(1), lty: (ly[i] + 3.5).toFixed(1), label: r.s.label.replace(' — Referencia', ' (ref.)') + ' ' + f.p(r.s.path[0]), color: r.s.reference ? 'var(--color-neutral-600)' : (r.s.key === active ? 'var(--color-accent)' : 'var(--color-accent-400)'), dash: r.s.reference ? '2 4' : '6 4', w: r.s.key === active ? 2.5 : 1.5 }));
  const ticks = [lo, (lo + hi) / 2, hi].map(v => ({ y: ys(v).toFixed(1), ty: (ys(v) + 3).toFixed(1), t: v.toFixed(1) + '%' }));
  const years = S.map((s, i) => [s[0].slice(0, 4), i] as [string, number]).filter((x, i, a) => i === 0 || x[0] !== a[i - 1][0]).map(([y, i]) => ({ x: xs(i).toFixed(1), t: y }));
  const q = M ? M.quarterlyAverages.map((v, k) => ({ x: xs(S.length - 25 + 6 * k + 3).toFixed(1), y: ys(v).toFixed(1) })) : [];
  return {
    W, H, X1, X2, path: S.map((s, i) => (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(s[1]).toFixed(1)).join(' '), lines, ticks, years, q,
    note: 'Línea continua: INPC observado (Banxico SP74833). Puntos: promedios trimestrales del último año (insumo del modelo Base). Zona 2026–30: escenarios oficiales (línea discontinua; el activo en negritas) y la referencia Citi (punteada, primer año).'
  };
}

export function inflationTables(ds: Dataset, A: Assumptions, b: RunOk, code = ''): TTable[] {
  const I = ds.inflation; if (!I) return [];
  const out: TTable[] = [], Y = ds.forecast.years, n = Y.length, M = E.inflationModels(I);
  const sc = E.scenarios(ds, A, b), paths = E.inflationScenarios(I, n, true);
  out.push(table('infl', code, 'Escenarios oficiales y referencia', 'Tres escenarios oficiales; la trayectoria Citi es una referencia histórica (no es escenario). Cada uno re-ejecuta el modelo completo.', 'Excel maestro · hoja Inflación §1 y §4', '% anual · ' + ds.profile.currency + ' por acción',
    head([...Y, 'Precio DCF', 'Naturaleza', 'Fuente'], null, null).map((h, i) => i >= n + 1 ? { ...h, align: 'left' } : h),
    sc.map(s => row(s.label + (s.active ? ' · activo' : ''), [...paths.find(x => x.key === s.key)!.path.map(v => cell(f.p(v), s.reference ? { color: 'var(--color-neutral-700)' } : undefined)), cell(s.value == null ? '—' : f.cur(s.value), { color: s.reference ? 'var(--color-neutral-700)' : 'var(--color-accent)' }), txt(s.kind, '200px'), txt(s.source, '420px')], s.active ? { fw: 700 } : (s.reference ? { lc: 'var(--color-neutral-700)' } : {}))),
    { minW: '1400px', note: 'Los escenarios constantes extienden a ' + Y[0] + '–' + Y[n - 1] + ' un pronóstico de un periodo: es un supuesto documentado. Mayor inflación eleva el valor porque el WACC nominal no cambia (no hay relación documentada inflación → Rf/WACC/beta/g).' }));
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
      [m3('immediate', 'Inmediata (último año, quincenal)'), m3('quarterly', 'Trimestral (4 promedios) → forecast Base'), m3('long', 'Ventana larga 2023–2026'),
        row('Libro de clase (coeficientes redondeados)', [cell(''), cell(X.classRounded && X.classRounded.a != null ? String(X.classRounded.a) : '—'), cell(X.classRounded && X.classRounded.b != null ? String(X.classRounded.b) : '—'), cell(''), cell(''), cell(f.p(M.classRounded, 3)), cell(X.classRounded && X.classRounded.forecast != null ? f.p(X.classRounded.forecast, 3) : '—')]),
        row('Construcción de clase S113 (≈ Cautela)', [cell(''), cell(''), cell(''), cell(''), cell(''), cell(f.p(M.classS113, 3)), cell(X.classS113 && X.classS113.forecast != null ? f.p(X.classS113.forecast, 3) : '—')]),
        row('Escenario Base = trimestral redondeado', [cell(''), cell(''), cell(''), cell(''), cell(''), cell(f.p(M.baseFromModel, 2), { color: 'var(--color-accent)' }), cell(I.scenarios.base ? f.p(I.scenarios.base.value as number, 2) : '—')], { fw: 700 })],
      { minW: '820px', note: 'b = SLOPE(ln y, x); a = EXP(INTERCEPT(ln y, x)); R² = RSQ. R² bajo en los modelos de corto plazo: la tendencia explica poco de la variación.' }));
  }
  if (I.series) out.push(table('infl', '', 'Serie observada: INPC, variación anual quincenal', I.series.length + ' observaciones.', 'Banco de México · SP74833', '% anual', head(['Inflación']),
    I.series.slice().reverse().map(s => row(s[0], [cell(s[1].toFixed(2) + '%')])), { minW: '320px' }));
  return out;
}

// ------------------------------------------------------------- Beta del WACC

/** Beta: fuente externa, tratamiento, reapalancamiento e impacto (recalculado en vivo contra la beta heredada). */
export function betaTables(ds: Dataset, A: Assumptions, b: RunOk, code = ''): TTable[] {
  const Bt = ds.beta; if (!Bt) return [];
  const out: TTable[] = [], W = b.W, it = W.iterated, mk = W.market;
  out.push(table('beta', code, 'Beta del WACC: fuente externa', Bt.source + ' · ' + Bt.date + ' · ' + Bt.industry, 'Damodaran (NYU Stern) · Excel maestro hoja Beta y Kd §1', 'x · %',
    head(['Valor', 'Lectura'], null, null).map((h, i) => i === 1 ? { ...h, align: 'left' } : h),
    [row('Industria', [cell(Bt.industry), txt((Bt.firms ? Bt.firms + ' empresas · ' : '') + 'muestra global', '420px')]),
      row('Beta apalancada de la industria (βL)', [cell(Bt.levered.toFixed(2)), txt('Refleja la estructura de capital promedio de la industria (D/E ' + f.p(Bt.de) + '), no la de la empresa.', '420px')]),
      row('Beta desapalancada (βU)', [cell(Bt.unlevered.toFixed(2)), txt('βU = βL / [1 + (1 − t) × D/E] con t marginal ' + f.p(Bt.marginalTax) + (Bt.check != null ? ' → ' + Bt.check.toFixed(4) + ' (control)' : ''), '420px')], { fw: 700 }),
      ...(Bt.unleveredCash != null ? [row('βU corregida por caja (no usada)', [cell(Bt.unleveredCash.toFixed(2)), txt('Sensibilidad documentada; el modelo reapalanca con deuda bruta y suma la caja en el puente.', '420px')])] : []),
      ...(Bt.inherited != null ? [row('βU heredada del modelo anterior', [cell(Bt.inherited.toFixed(2)), txt('Solo reproduce el baseline histórico $31.16.', '420px')])] : [])],
    { minW: '760px', note: Bt.treatment.join(' ') + (Bt.url ? ' Fuente: ' + Bt.url : '') }));
  out.push(table('beta', '', 'Reapalancamiento con la estructura de capital de la empresa', 'βL = βU × [1 + (1 − t) × D/E]; Ke = Rf + βL × PRM.', 'Motor ValuFlow · réplica de Beta y Kd §3', 'x · %', head(['A valor de mercado', 'Iterado al valor DCF']),
    [row('βU usada', [cell(W.betaU.toFixed(2)), cell(W.betaU.toFixed(2))]), row('D/E', [cell(mk.de.toFixed(4)), cell(it ? it.de.toFixed(4) : '—')]), row('Tasa fiscal', [cell(f.p(mk.tax)), cell(it ? f.p(it.tax) : '—')]),
      row('βL reapalancada', [cell(mk.beta.toFixed(4)), cell(it ? it.beta.toFixed(4) : '—')], { fw: 700 }), row('Ke', [cell(f.p(mk.ke)), cell(it ? f.p(it.ke) : '—')]), row('WACC', [cell(f.p(mk.wacc)), cell(f.p(b.wacc))], { fw: 700 })], { minW: '560px' }));
  if (Bt.inherited != null && Math.abs(A.betaU - Bt.inherited) > 1e-12) {
    const r0 = E.run(ds, { ...A, betaU: Bt.inherited });
    if (r0.ok) {
      const d = (a: number, z: number, fm: (v: number) => string) => [cell(fm(a)), cell(fm(z)), cell((z - a >= 0 ? '+' : '−') + fm(Math.abs(z - a)).replace('−', ''))];
      out.push(table('beta', '', 'Impacto del cambio de beta (supuestos activos)', 'Recalculado con el modelo completo: misma proyección, distinta beta.', 'Motor ValuFlow · réplica de Beta y Kd §4', '% · ' + (ds.profile.units || '') + ' · ' + ds.profile.currency, head(['βU ' + Bt.inherited.toFixed(2), 'βU ' + A.betaU.toFixed(2), 'Cambio']),
        [row('βL iterada', d(r0.W.iterated!.beta, it!.beta, v => v.toFixed(4))), row('Ke', d(r0.ke, b.ke, v => f.p(v)).map((c, i) => i === 2 ? { ...c, t: String(c.t).replace('%', ' pp') } : c)), row('WACC', d(r0.wacc, b.wacc, v => f.p(v)).map((c, i) => i === 2 ? { ...c, t: String(c.t).replace('%', ' pp') } : c)),
          row('EV ponderado', d(r0.evW, b.evW, v => f.m(v, 1))), row('Equity a la fecha de valuación', d(r0.eqVal, b.eqVal, v => f.m(v, 1))), row('Precio DCF', d(r0.value, b.value, v => f.cur(v)), { fw: 700 })], { minW: '620px' }));
    }
  }
  if (Bt.kd) out.push(table('beta', '', 'Costo de la deuda (Kd)', 'Se conserva el 10% con su fuente; control con datos observados.', 'Excel maestro · Beta y Kd §5', '%', head(['Valor', 'Lectura'], null, null).map((h, i) => i === 1 ? { ...h, align: 'left' } : h),
    [row('Kd antes de impuestos (iteración)', [cell(f.p(Bt.kd.value)), txt(Bt.kd.source, '480px')], { fw: 700 }), row('Control: intereses 1S26 anualizados / deuda 2T26', [cell(f.p(Bt.kd.check)), txt(Bt.kd.checkNote || '', '480px')]),
      ...(Bt.kd.fy2025 != null ? [row('Referencia (no usada): tasa implícita FY2025', [cell(f.p(Bt.kd.fy2025)), txt('Solo alimenta el WACC a valor de mercado (punto de partida de la iteración).', '480px')])] : [])], { minW: '760px' }));
  const H = ds.inflation && ds.inflation.beta;
  if (H) out.push(table('beta', '', 'Beta histórica (regresión) — NO alimenta el WACC', 'Concepto distinto de la beta sectorial del WACC.', 'Excel maestro · hoja Inflación §6', 'x', head(['Valor', 'Lectura'], null, null).map((h, i) => i === 1 ? { ...h, align: 'left' } : h),
    [row('Pendiente: rendimientos diarios vs. IPC', [cell(H.historical.toFixed(4)), txt('R² ' + H.r2.toFixed(4) + ' · ' + H.n + ' observaciones: no es una estimación defendible.', '420px')]),
      row('Beta reportada en el estudio de clase', [cell(H.reported.toFixed(4)), txt('Fórmula SLOPE(…)×10: el factor ×10 no tiene sustento.', '420px')])], { minW: '720px' }));
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
