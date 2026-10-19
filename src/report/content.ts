// Contenido de los reportes como documento: secciones con tablas, gráficas y textos, todo con cifras vivas.
// Una sola fuente para el PDF ejecutivo, el reporte técnico, el libro de Excel, el CSV y el ZIP.
// Las tablas son las mismas que dibujan las pantallas y los anexos (src/ui/annex.ts y src/ui/relative.ts).
import * as E from '../engine';
import { fmt as f } from '../engine';
import { PROJECT } from '../config';
import type { TTable } from '../ui/tables';
import { chartCatalog, type ChartDef } from './charts';
import type { Snapshot } from './snapshot';

export interface RTable {
  kind: 'table'; id: string; title: string; source: string; head: string[]; rows: string[][];
  bold?: number[]; note?: string; n?: number;
  /** Columnas que entran al PDF cuando la tabla es demasiado ancha (el Excel y el CSV llevan todas). */
  pdfCols?: number[];
}
export interface RChart { kind: 'chart'; id: string; title: string; source: string; chart: ChartDef; n?: number }
export interface RText { kind: 'text'; style: 'p' | 'key' | 'warn' | 'bullets' | 'def'; title?: string; body?: string; items?: string[]; pairs?: [string, string][] }
export type Block = RTable | RChart | RText;
export interface Section { id: string; title: string; blocks: Block[]; page?: boolean }
export interface ReportMeta {
  title: string; subtitle: string; company: string; ticker: string; generated: string; generatedIso: string;
  priceDate: string; valuationDate: string; caseLabel: string; modified: boolean; changes: [string, string, string][];
  team: [string, string][]; institution: string; course: string; year: number;
  cards: [string, string][]; keyFacts: [string, string][];
}
export interface Report { kind: 'full' | 'exec'; sections: Section[]; meta: ReportMeta; snap: Snapshot }

const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const dateText = (d: Date) => d.getDate() + ' de ' + MES[d.getMonth()] + ' de ' + d.getFullYear();
const cur = (v: number | null | undefined) => v == null || !isFinite(v) ? 'NA' : f.cur(v);
const num = (p: E.Price) => E.isNum(p) ? p : null;

/** Convierte una tabla de la interfaz en tabla de documento (mismas celdas, sin estilos de pantalla). */
export function fromUi(t: TTable, o: { id?: string; title?: string; first?: string; pdfCols?: number[]; note?: string } = {}): RTable {
  const head = [o.first ?? '', ...t.head.map(h => String(h.t))];
  const rows: string[][] = [], bold: number[] = [];
  t.rows.forEach(r => {
    const cells = r.cells.map(c => String(c.t ?? ''));
    if (r.fw >= 600) bold.push(rows.length);
    rows.push([r.label, ...cells]);
  });
  const src = t.source + (t.unit ? ' · Unidades: ' + t.unit : '');
  return { kind: 'table', id: o.id ?? t.id, title: o.title ?? t.title, source: src, head, rows, bold, note: o.note ?? (t.question ? t.question + (t.note ? ' ' + t.note : '') : t.note), pdfCols: o.pdfCols };
}

export function buildReport(S: Snapshot, kind: 'full' | 'exec' = 'full'): Report {
  const { ds, A, b, scen, torn, methods, rel, rec, checks, ui } = S, L = E.labelsOf(ds), P = ds.profile, CH = chartCatalog(S);
  const price = b.price, sd = rel.sdc, comps = rel.comps, K = rel.combined;
  const compsV = comps ? num(comps.value) : null, sdcV = sd ? num(sd.value) : null, comb = K ? num(K.value) : null;
  const act = scen.find(s => s.active), off = scen.filter(s => !s.reference && s.value != null), ref = scen.filter(s => s.reference && s.value != null);
  const scLo = off.length ? Math.min(...off.map(s => s.value as number)) : null, scHi = off.length ? Math.max(...off.map(s => s.value as number)) : null;
  const caseLabel = S.isBase ? 'Caso base del Excel (inflación ' + (act?.label ?? '') + ')' : 'Escenario modificado en el Laboratorio' + (act ? ' (inflación ' + act.label + ')' : '');
  const pick = (id: string, re?: RegExp) => (ui[id] || []).find(t => !re || re.test(t.title));
  const tb = (t: TTable | undefined, o?: Parameters<typeof fromUi>[1]): RTable[] => t ? [fromUi(t, o)] : [];
  const ch = (id: string): RChart[] => CH[id] ? [{ kind: 'chart', id, title: CH[id].title, source: 'Fuente: ' + CH[id].source + '. Cálculo: motor ValuFlow con los supuestos activos.', chart: CH[id] }] : [];
  const p = (body: string, title?: string): RText => ({ kind: 'text', style: 'p', body, title });
  const key = (body: string, title = 'Resultado clave'): RText => ({ kind: 'text', style: 'key', title, body });
  const warn = (title: string, body: string): RText => ({ kind: 'text', style: 'warn', title, body });
  const bullets = (items: string[], title?: string): RText => ({ kind: 'text', style: 'bullets', items, title });
  const T = (id: string, title: string, source: string, head: string[], rows: string[][], o: { bold?: number[]; note?: string; pdfCols?: number[] } = {}): RTable => ({ kind: 'table', id, title, source, head, rows, ...o });
  const SRC = L.sourceShort === 'Excel' ? 'Excel PRO auditado' : L.sourceShort;
  const W = b.W, it = W.src ?? W.market;
  const Rg = ds.beta?.regression, Bt0 = S.D.betaU, dam = ds.beta?.unleveredCash ?? ds.beta?.unlevered;
  const damR = dam != null ? E.run(ds, { ...A, betaU: dam }) : null, damV = damR && damR.ok ? damR.value : null;
  const indiv = ds.external?.find(x => x.key === 'indiv_dcf')?.value ?? null;
  const recTxt = rec && rec.rating ? rec.rating + ' (potencial ' + f.pp(rec.potential) + ' frente a ' + cur(price) + ')' : (b.signal ?? '—');
  const weightsTxt = K ? K.rows.map(r => Math.round(r.weight * 100) + '% ' + (r.key === 'dcf' ? 'DCF' : r.key === 'comps' ? 'Trading Comps' : 'Transacciones')).join(' · ') : '';

  const keyFacts: [string, string][] = [
    ['Precio de mercado de referencia', cur(price) + ' (cierre ' + ds.dates.price + ')'],
    ['Fecha de valuación', ds.dates.valuation],
    ['Valor DCF por acción', cur(b.value) + ' (' + f.pp(b.upside) + ' frente al mercado)'],
    ['Rango DCF por escenario de inflación', off.length ? cur(scLo) + ' a ' + cur(scHi) + ' (' + off.map(s => s.label).join(', ') + ')' : '—'],
    ['Trading Comps', compsV != null ? cur(compsV) + ' (' + (comps!.n) + ' comparable(s), media)' : '—'],
    ['Precedent Transactions LSEG/SDC (referencia)', sdcV != null ? cur(sdcV) + ' (mediana EV/EBITDA, ' + (sd!.stats.evEbitda?.n ?? 0) + ' operaciones; peso ' + Math.round((K?.rows.find(r => r.key === 'transactions')?.weight ?? 0) * 100) + '%)' : '—'],
    ['Precio objetivo combinado', comb != null ? cur(comb) + ' (' + weightsTxt + ')' : '—'],
    ['Recomendación', recTxt],
    ['WACC / Ke / g', f.p(b.wacc) + ' / ' + f.p(b.ke) + ' / ' + f.p(b.g)],
    ['Beta desapalancada (βU) / apalancada (βL)', W.betaU.toFixed(4) + ' / ' + (it.beta != null ? it.beta.toFixed(4) : '—')],
    ['Enterprise Value (' + L.closeDate + (b.roll ? ' / ' + L.rollDate : '') + ')', f.m(b.evW) + (b.roll ? ' / ' + f.m(b.ev) : '') + ' mdp'], ['Equity Value a la fecha de valuación', f.m(b.eqVal) + ' mdp'],
    ['Peso del valor terminal en el EV', f.p(b.tvWeightW, 1)]
  ];
  const cards: [string, string][] = [
    ['Precio objetivo combinado', comb != null ? cur(comb) : cur(b.value)], ['Precio de mercado (' + ds.dates.price + ')', cur(price)],
    ['Valor DCF', cur(b.value)], ['Recomendación', rec?.rating ? rec.rating + ' (' + f.pp(rec.potential) + ')' : (b.signal ?? '—')]
  ];
  const meta: ReportMeta = {
    title: 'Valuación de ' + (P.legalName || P.name) + ': DCF, múltiplos y transacciones precedentes',
    subtitle: kind === 'exec' ? 'Resumen ejecutivo' : 'Reporte técnico completo',
    company: P.legalName || P.name, ticker: P.ticker + ' · ' + P.exchange,
    generated: dateText(S.generatedAt), generatedIso: S.generatedAt.toISOString(),
    priceDate: ds.dates.price, valuationDate: ds.dates.valuation, caseLabel, modified: !S.isBase, changes: S.changes,
    team: PROJECT.team, institution: PROJECT.institution, course: PROJECT.course, year: PROJECT.year, cards, keyFacts
  };
  const changesTable = S.changes.length ? [T('changes', 'Supuestos modificados respecto al Excel', 'Laboratorio de la app', ['Supuesto', 'Excel', 'Activo'], S.changes)] : [];
  const modWarn = S.isBase ? [] : [warn('Escenario modificado', 'Este documento usa supuestos distintos a los del Excel PRO auditado: ' + S.changes.map(c => c[0] + ' ' + c[1] + ' → ' + c[2]).join('; ') + '. Con los supuestos del Excel el DCF es ' + cur(S.b0.value) + '; con los activos es ' + cur(b.value) + '.')];
  const sections: Section[] = [];

  // ---------------------------------------------------------------- 1. Resumen ejecutivo
  const conclPairs: [string, string][] = [
    ['¿Cuánto vale la acción?', 'El DCF del equipo da ' + cur(b.value) + ' por acción y Trading Comps ' + cur(compsV) + '. Ponderados ' + weightsTxt + ', el precio objetivo es ' + cur(comb) + ', ' + f.pp(rec?.potential ?? null) + ' frente al cierre de ' + cur(price) + ' del ' + ds.dates.price + '.'],
    ['¿Qué recomendamos?', (rec?.rating ?? b.signal ?? '—') + '. ' + (rec ? rec.rule + ' Rango de valor razonable (DCF, Trading Comps y transacciones sin atípicos): ' + cur(rec.fairLo) + ' a ' + cur(rec.fairHi) + '.' : '')],
    ['¿Qué tan sensible es?', 'Por inflación, el DCF va de ' + cur(scLo) + ' a ' + cur(scHi) + '. La variable que más mueve el valor es ' + (torn[0]?.label ?? '—') + ' (rango ' + cur(torn[0]?.range) + ' por acción). El valor terminal explica ' + f.p(b.tvWeightW, 1) + ' del EV.'],
    ['¿Qué dicen las transacciones?', sd ? 'La muestra LSEG/SDC auditada (' + (sd.stats.evEbitda?.n ?? 0) + ' operaciones con EV/EBITDA) da ' + cur(sdcV) + ' a la mediana. Es global, de control mixto y dispersa, por eso es referencia con peso 0% y no entra al precio objetivo.' : 'No hay muestra de transacciones.'],
    ['¿Por qué otras fuentes dan otro valor?', 'El DCF del equipo usa la beta desapalancada de la regresión semanal (βU ' + Bt0.toFixed(4) + '), la misma del modelo individual del reporte comparativo, cuyo DCF es ' + cur(indiv) + '; la diferencia restante (' + cur(indiv != null ? indiv - b.value : null) + ') viene de la proyección, la fecha y el precio de referencia. Con la beta sectorial de Damodaran (βU ' + (dam ?? 0).toFixed(2) + ', la beta oficial anterior) el DCF sería ' + cur(damV) + '.']
  ];
  sections.push({ id: 'exec', title: '1. Resumen ejecutivo', blocks: [
    ...modWarn,
    T('keyFacts', 'Datos clave de la valuación', 'Motor ValuFlow con el ' + SRC + ' (' + caseLabel + ').', ['Concepto', 'Valor'], keyFacts),
    ...ch('football'),
    key(meta.company + ' (' + P.ticker + '): precio objetivo ' + cur(comb) + ' frente a ' + cur(price) + ' de mercado. Recomendación: ' + recTxt + '.'),
    { kind: 'text', style: 'def', pairs: conclPairs }
  ] });

  // ---------------------------------------------------------------- 2. Contexto
  sections.push({ id: 'ctx', title: '2. Contexto, objetivo y alcance', blocks: [
    p((P.description || '') + ' Sede: ' + (P.hq || '—') + '. ' + (P.stores ? f.n(P.stores) + ' tiendas' : '') + (P.employees ? ', ' + f.n(P.employees) + ' colaboradores' : '') + '.', P.legalName || P.name),
    p('Objetivo: estimar el valor intrínseco por acción de ' + P.short + ' a la fecha de valuación (' + ds.dates.valuation + ') con un DCF de flujo libre para la empresa (FCFF) y contrastarlo con Trading Comps y Precedent Transactions, para emitir una recomendación frente al precio de mercado. Alcance: proyección ' + b.rows[0].year + '–' + b.rows[b.rows.length - 1].year + ' en millones de pesos (mdp), WACC iterado al valor DCF, valor terminal ponderado (Gordon y múltiplo) y puente al balance del ' + L.rollDate + '.'),
    T('dates', 'Fechas del modelo', SRC + ' · hoja Fuentes', ['Fecha', 'Valor'], [['Estados financieros base', ds.dates.base], ['Balance intermedio', ds.dates.balance || '—'], ['Precio de mercado', ds.dates.price], ['Fecha de valuación', ds.dates.valuation], ['Siguiente reporte trimestral', String(ds.dates.nextReport || '—')]])
  ] });

  // ---------------------------------------------------------------- 3. Variables, fuentes y fechas
  sections.push({ id: 'src', title: '3. Variables, fuentes y fechas', blocks: [
    ...tb(pick('method', /Registro de insumos/), { first: 'Dónde se usa', pdfCols: [0, 1, 2, 4, 5, 6] }),
    T('sources', 'Fuentes documentales', SRC + ' · hoja Fuentes', ['Fuente', 'Documento', 'Uso'], (ds.sources || []).map(s => s.map(String)))
  ] });

  // ---------------------------------------------------------------- 4. Inflación
  const infl = ui.infl || [];
  sections.push({ id: 'infl', title: '4. Inflación y escenarios macro', blocks: [
    p('La inflación entra al modelo por el crecimiento nominal de las ventas (variables externas ponderadas con mínimos cuadrados) y por las tasas. Hay tres escenarios oficiales y una trayectoria de referencia histórica (Citi), que se calcula para comparar pero no es escenario. Escenario activo: ' + (act?.label ?? '—') + ' (' + (act ? f.p(act.inflation) : '—') + ').'),
    ...infl.filter(t => !/Serie observada/.test(t.title)).map(t => fromUi(t, { first: /Escenarios/.test(t.title) ? 'Escenario' : /Transmisión/.test(t.title) ? 'Concepto' : 'Modelo' })),
    ...ch('scen')
  ] });

  // ---------------------------------------------------------------- 5. Beta y regresión
  sections.push({ id: 'beta', title: '5. Beta y costo de la deuda', blocks: [
    p('La beta del WACC sale de la regresión semanal de rendimientos de Soriana B contra el IPC: la pendiente observada (βL ' + (Rg ? Rg.levered.toFixed(4) : '—') + ') se desapalanca con la estructura de capital de la propia regresión (D/E ' + (Rg ? Rg.de.toFixed(4) : '—') + ', t ' + (Rg ? f.p(Rg.tax, 0) : '—') + ') y da βU ' + Bt0.toFixed(4) + '; esa βU se reapalanca con la estructura de capital del modelo (' + (it.beta != null ? 'βL ' + it.beta.toFixed(4) : '') + '). La pendiente no es significativa al 95% (p ≈ 0.09). La beta sectorial de Damodaran (βU ' + (dam ?? 0).toFixed(2) + ') se conserva como referencia' + (W.betaU !== Bt0 ? '. Este escenario usa βU ' + W.betaU.toFixed(4) + ' (Laboratorio)' : '') + '.'),
    ...(ui.beta || []).map(t => fromUi(t, { first: 'Concepto' }))
  ] });

  // ---------------------------------------------------------------- 6. CAPM y WACC
  sections.push({ id: 'wacc', title: '6. CAPM y WACC', blocks: [
    p('Ke = Rf + βL × PRM = ' + f.p(W.rf) + ' + ' + (it.beta != null ? it.beta.toFixed(4) : '—') + ' × ' + f.p(W.prm) + ' = ' + f.p(b.ke) + '. El WACC parte del valor de mercado del capital y se itera con el equity del DCF hasta converger (' + W.iters.length + ' iteraciones): ' + f.p(b.wacc) + ' (modo ' + ({ iterated: 'iterado', market: 'de mercado', manual: 'manual' } as Record<string, string>)[W.mode] + ').'),
    ...(ui.wacc || []).map(t => fromUi(t, { first: /Iteraciones/.test(t.title) ? 'Iteración' : 'Componente' })),
    ...ch('iter')
  ] });

  // ---------------------------------------------------------------- 7. Proyección y FCFF
  const ls = pick('ls'), lsN = ls ? ls.head.length : 0;
  sections.push({ id: 'fcff', title: '7. Proyecciones operativas y FCFF', page: true, blocks: [
    p('Las ventas de ' + b.rows[0].year + ' salen de la regresión de mínimos cuadrados ponderada con variables externas; después crecen con la inflación del escenario. Margen, impuestos, D&A, capex y capital de trabajo son drivers del Excel. FCFF = NOPAT + D&A − capex − Δ capital de trabajo.'),
    ...tb(pick('proj'), { first: 'Concepto' }),
    ...tb(pick('pond'), { first: 'Concepto' }),
    ...(ls ? [fromUi(ls, { first: 'Partida', pdfCols: lsCols(lsN, ds.method?.lsQuarters.length ?? 0) })] : []),
    ...tb(pick('ext', /Variables externas/), { first: 'Variable' }),
    ...tb(pick('dcf', /Flujo libre/), { first: 'Concepto' }),
    ...ch('sales'), ...ch('fcf')
  ] });

  // ---------------------------------------------------------------- 8. Valor terminal
  const last = b.rows[b.rows.length - 1];
  sections.push({ id: 'tv', title: '8. Valor terminal', blocks: [
    p('Gordon: TV = FCF normalizado × (1 + g) / (WACC − g), con FCF ' + last.year + ' normalizado (capex = D&A) de ' + f.m(b.fcfTv, 1) + ' mdp y g = ' + f.p(b.g) + ' → ' + f.m(b.tvG, 1) + ' mdp. Múltiplo de salida: EBITDA ' + last.year + ' × ' + (b.mult ? f.x(b.mult) : '—') + ' → ' + f.m(b.tvM, 1) + ' mdp. Se ponderan ' + Math.round(b.wG * 100) + '/' + Math.round((1 - b.wG) * 100) + '.' + (b.impliedG != null ? ' La g implícita en el múltiplo es ' + f.p(b.impliedG) + '.' : '')),
    ...ch('tv'),
    T('tvTab', 'Valor terminal y su peso', 'Motor ValuFlow · ' + SRC + ' hoja Proyección Final', ['Concepto', 'mdp'], [['FCF normalizado ' + last.year, f.m(b.fcfTv, 1)], ['Valor terminal Gordon', f.m(b.tvG, 1)], ['VP Gordon', f.m(b.pvTvG, 1)], ['Valor terminal múltiplo', f.m(b.tvM, 1)], ['VP múltiplo', f.m(b.pvTvM, 1)], ['VP valor terminal ponderado', f.m(b.pvTvW, 1)], ['Peso del valor terminal en el EV', f.p(b.tvWeightW, 1)]], { bold: [5] })
  ] });

  // ---------------------------------------------------------------- 9. EV → Equity → precio
  sections.push({ id: 'bridge', title: '9. Del Enterprise Value al precio por acción', blocks: [
    p('El EV se calcula al ' + L.closeDate + ', se capitaliza al ' + L.rollDate + ' con el WACC, se resta la deuda y los arrendamientos y se suma el efectivo del balance intermedio; el equity resultante se lleva a la fecha de valuación con Ke y se divide entre ' + f.n(b.shares, 1) + ' millones de acciones.'),
    ...ch('bridge'),
    ...tb(pick('dcf', /Del flujo al valor/), { first: 'Concepto' })
  ] });

  // ---------------------------------------------------------------- 10. Trading Comps
  sections.push({ id: 'comps', title: '10. Trading Comps', blocks: [
    p(comps ? 'Comparables de S&P Capital IQ revisados uno por uno: solo los incluidos entran a los estadísticos. Precio implícito a la media: ' + cur(compsV) + ' (rango P25–P75 ' + cur(num(comps.p25)) + ' a ' + cur(num(comps.p75)) + ').' : 'Sin comparables documentados.'),
    ...tb(pick('peers'), { first: 'Empresa' }), ...tb(pick('msel'), { first: 'Múltiplo' }), ...tb(pick('stats'), { first: 'Estadístico' }),
    ...tb(pick('detail'), { first: 'Paso' }), ...tb(pick('bridge'), { first: 'Partida' })
  ] });

  // ---------------------------------------------------------------- 11. Precedent Transactions
  const tblocks: Block[] = [];
  if (sd) {
    const S2 = sd.spec, rate = S2.fx.rate, mx = (v: number | null) => v == null ? 'NA' : v.toFixed(v < 10 ? 2 : 1) + 'x', usd = (v: number | null) => v == null ? 'NA' : f.m(v, 1);
    tblocks.push(p('Búsqueda en LSEG/SDC (' + S2.screen.file + ', ' + S2.screen.date + '): ' + S2.screen.count + ' operaciones en pantalla, ' + S2.deals.length + ' evaluadas con los criterios del Excel. Monto = Rank Value de LSEG (incluye deuda neta del objetivo; no es la contraprestación). Los EV en USD se convierten a MXN con ' + f.n(rate, 2) + ' MXN/USD (' + S2.fx.source + '). Los NA nunca cuentan como cero.'));
    tblocks.push(...tb(pick('sdcFunnel'), { first: 'Paso' }));
    // Tabla definitiva de transacciones (la versión completa con todos los criterios va en el Excel y el CSV).
    tblocks.push(T('sdcDefinitive', 'Tabla definitiva de transacciones LSEG/SDC', S2.screen.provider + ' · ' + S2.screen.file + ' · hoja Transacciones SDC. Unidades: USD mm, MXN mm, x.',
      ['Objetivo', 'Anuncio', 'País', 'Comprador', 'Valor operación (USD mm)', 'EV (USD mm)', 'EV (MXN mm)', 'EV/EBITDA', 'EV/Ventas', 'P/E', 'Decisión'],
      S2.deals.map((d, i) => { const c = sd.checks[i]; return [d.target, d.date, d.targetNation, d.acquiror, usd(d.rankValue), usd(d.ev), d.ev == null ? 'NA' : f.m(d.ev * rate, 0), mx(d.evEbitda), mx(d.evSales), mx(d.pe), c.include ? 'Incluida' : 'Excluida']; }),
      { bold: S2.deals.map((_, i) => i).filter(i => sd.checks[i].include === 1) }));
    const exc = S2.deals.map((d, i) => ({ d, c: sd.checks[i] })).filter(x => !x.c.include);
    if (exc.length) tblocks.push(T('sdcExcl', 'Operaciones excluidas y motivo', 'hoja Transacciones SDC (criterios: ventana, ≥2 múltiplos, sector, sin recompra, juicio)', ['Objetivo', 'Ventana', '≥2 múlt.', 'Recompra', 'Motivo'], exc.map(x => [x.d.target, x.c.inWindow ? 'Sí' : 'No', x.c.enough ? 'Sí' : 'No', x.c.buyback ? 'Sí' : 'No', x.d.reason || x.d.judgment || ''])));
    tblocks.push(...tb(pick('sdcStats'), { first: 'Estadístico' }), ...ch('sdc'), ...tb(pick('sdcSens'), { first: 'Muestra' }));
    tblocks.push(key('Mediana EV/EBITDA ' + (sd.stats.evEbitda ? mx(sd.stats.evEbitda.median) : 'NA') + ' → ' + cur(sdcV) + ' por acción (P25–P75: ' + cur(num(sd.lo)) + ' a ' + cur(num(sd.hi)) + '). ' + (S2.weightNote || 'Peso en el precio combinado: 0% (referencia).'), 'Resultado de transacciones'));
    tblocks.push(...tb(pick('ciqHist'), { first: 'Objetivo' }));
  }
  sections.push({ id: 'trans', title: '11. Precedent Transactions (LSEG/SDC)', page: true, blocks: tblocks.length ? tblocks : [p('Sin transacciones documentadas.')] });

  // ---------------------------------------------------------------- 12. Contraste externo
  const extT = pick('ext', /Contraste/);
  sections.push({ id: 'external', title: '12. Contraste con S&P Capital IQ y LSEG Refinitiv', blocks: [
    warn('Separado de la valuación oficial', 'Estas cifras son referencias externas con su propia fecha, precio y supuestos. No sustituyen ni modifican el precio objetivo del equipo.'),
    ...(extT ? [fromUi(extT, { first: 'Fuente', pdfCols: [0, 1, 2, 3, 4, 5, 6, 7] })] : []),
    ...ch('ext'),
    T('disc', 'Diferencias explicadas', SRC + ' · hoja Contraste externo y Auditoría', ['Tema', 'Fuente A', 'Fuente B', 'Se usa', 'Explicación'], (ds.discrepancies || []).map(d => [d.topic, d.a.join(': '), d.b.join(': '), d.used, d.note]))
  ] });

  // ---------------------------------------------------------------- 13. Combinada y recomendación
  sections.push({ id: 'comb', title: '13. Valuación combinada y recomendación', blocks: [
    ...(K ? [T('combined', 'Ponderación de métodos', SRC + ' · hoja Valuación Combinada', ['Método', 'Precio por acción', 'Peso', 'Contribución', 'Motivo'], K.rows.map(r => [r.label, E.isNum(r.price) ? cur(r.price) : String(r.price), f.p(r.weight, 0), cur(r.contribution), ds.combined?.reasons?.[r.key] || ''])
      .concat([['Precio objetivo combinado', cur(comb), f.p(K.weightSum, 0), cur(comb), ds.combined?.classRule || '']]), { bold: [K.rows.length] })] : []),
    ...(rec ? [T('rec', 'Recomendación', SRC + ' · hoja Transacciones SDC §7', ['Concepto', 'Valor'], [['Precio objetivo', cur(rec.target)], ['Precio de mercado', cur(price) + ' (' + ds.dates.price + ')'], ['Potencial', f.pp(rec.potential)], ['Umbral de compra / venta', f.pp(rec.buy, 0) + ' / ' + f.pp(rec.sell, 0)], ['Rango de valor razonable', cur(rec.fairLo) + ' a ' + cur(rec.fairHi)], ['Recomendación', rec.rating ?? '—']], { bold: [5], note: rec.rule })] : []),
    ...ch('rec')
  ] });

  // ---------------------------------------------------------------- 14. Escenarios y sensibilidad
  sections.push({ id: 'sens', title: '14. Escenarios y sensibilidad', page: true, blocks: [
    T('scenTab', 'Escenarios de inflación (modelo completo re-ejecutado)', SRC + ' · hojas Inflación y Escenarios', ['Escenario', 'Inflación', 'WACC', 'Ventas ' + last.year, 'FCFF ' + last.year, 'Valor por acción', 'vs. mercado'],
      scen.map(s => [s.label + (s.reference && !/referencia/i.test(s.label) ? ' (referencia)' : s.active ? ' (activo)' : ''), s.constant ? f.p(s.inflation) : 'trayectoria', f.p(s.wacc), f.m(s.revenueLast), f.m(s.fcfLast), cur(s.value), f.pp(s.upside)]), { bold: scen.map((s, i) => s.active ? i : -1).filter(i => i >= 0) }),
    ...ch('scen'),
    T('tornTab', 'Tornado: una variable a la vez', 'Motor ValuFlow (WACC y Ke fijos en el caso activo)', ['Variable', 'Paso', 'Valor bajo', 'Valor alto', 'Rango'], torn.map(t => [t.label, '±' + t.step + ' ' + t.unit, cur(t.low), cur(t.high), cur(t.range)])),
    ...ch('tornado'),
    ...(ui.sens || []).map(t => fromUi(t, { first: t.title.split(' vs. ')[0] })),
    ...ch('priceWacc')
  ] });

  // ---------------------------------------------------------------- 15. Validaciones y auditoría
  const st = (s: E.CheckStatus) => s === 'pass' ? 'Cuadra' : s === 'review' ? 'Revisar' : 'No aplica';
  const nPass = checks.filter(c => c.status === 'pass').length, nRev = checks.filter(c => c.status === 'review').length;
  sections.push({ id: 'valid', title: '15. Validaciones y auditoría del Excel', blocks: [
    p('La app recalcula cada resultado y lo compara con el Excel PRO auditado (tolerancias: precio ±0.01 MXN, tasas ±0.01 pp, montos ±1 mdp). ' + nPass + ' comprobaciones cuadran' + (nRev ? ' y ' + nRev + ' requieren revisión' : '') + (S.isBase ? '.' : '; con supuestos modificados, la comparación contra el Excel no aplica y se marca como tal.')),
    T('checks', 'Comprobaciones de la app contra el Excel', 'Motor ValuFlow · validate()', ['Grupo', 'Comprobación', 'Estado', 'App', 'Excel'], checks.map(c => [c.group, c.label, st(c.status), c.calc || c.detail || '', c.exp || ''])),
    ...tb(pick('audit'), { first: '#', pdfCols: [1, 3, 4, 5] })
  ] });

  // ---------------------------------------------------------------- 16. Conclusiones
  sections.push({ id: 'concl', title: '16. Conclusiones y limitaciones', blocks: [
    { kind: 'text', style: 'def', pairs: conclPairs },
    bullets([
      'El valor terminal pesa ' + f.p(b.tvWeightW, 1) + ' del EV: pequeñas variaciones en g o en el múltiplo de salida mueven el precio.',
      'La beta sale de una regresión semanal que no es significativa al 95%; con la beta sectorial de Damodaran (βU ' + (dam ?? 0).toFixed(2) + ') el DCF sería ' + cur(damV) + '. El valor es muy sensible a esta elección.',
      'La muestra de transacciones es global y de control mixto; se reporta como referencia y no entra al precio objetivo.',
      'El precio de mercado es el cierre del ' + ds.dates.price + '; no es el precio del día de la consulta.',
      'Las proyecciones dependen de la inflación del escenario y de los drivers históricos de márgenes, capex y capital de trabajo.'
    ], 'Limitaciones'),
    ...changesTable
  ] });

  numberBlocks(sections);
  if (kind === 'exec') return { kind, meta, snap: S, sections: execSections(sections, S, CH) };
  return { kind, meta, snap: S, sections };
}

/** Resumen ejecutivo (2–3 páginas): datos clave, campo de fútbol, recomendación, escenarios, riesgos y fuentes. */
function execSections(full: Section[], S: Snapshot, CH: Record<string, ChartDef>): Section[] {
  const byId = (sid: string, bid: string) => full.find(s => s.id === sid)?.blocks.find(k => (k.kind === 'table' || k.kind === 'chart') && k.id === bid);
  const ex = full.find(s => s.id === 'exec')!, concl = full.find(s => s.id === 'concl')!;
  const scenT = byId('sens', 'scenTab') as RTable | undefined, combT = byId('comb', 'combined') as RTable | undefined, extT = byId('external', 'ext') as RTable | undefined;
  const trKey = full.find(s => s.id === 'trans')?.blocks.find(k => k.kind === 'text' && k.style === 'key');
  const risks = (concl.blocks.find(k => k.kind === 'text' && k.style === 'bullets') as RText | undefined)?.items ?? [];
  const out: Section[] = [
    { id: 'x1', title: 'Resultado', blocks: ex.blocks.filter(k => k.kind !== 'chart' && (k.kind !== 'text' || (k.style !== 'def' && k.style !== 'warn'))) },
    { id: 'x2', title: 'Valor por método y conclusiones', blocks: [...ex.blocks.filter(k => k.kind === 'chart'), ex.blocks.find(k => k.kind === 'text' && k.style === 'def') as Block] },
    { id: 'x3', title: 'Escenarios y ponderación', blocks: [...(scenT ? [{ ...scenT, pdfCols: [0, 1, 2, 5, 6] }] : []), ...(combT ? [{ ...combT, pdfCols: [0, 1, 2, 3] }] : [])] },
    { id: 'x4', title: 'Transacciones y contraste externo', blocks: [
      ...(trKey ? [trKey] : []),
      ...(extT ? [{ ...extT, title: 'Contraste externo (referencia; no entra al precio oficial)', note: undefined, pdfCols: [0, 1, 3, 6] }] : [])
    ] },
    { id: 'x5', title: 'Riesgos, fuentes y fecha de corte', blocks: [
      { kind: 'text', style: 'bullets', items: risks } as RText,
      { kind: 'text', style: 'p', body: 'Fuentes: ' + (S.ds.sources || []).slice(0, 4).map(s => s[0]).join('; ') + '. Precio de mercado al ' + S.ds.dates.price + '; fecha de valuación ' + S.ds.dates.valuation + '. Generado por ValuFlow el ' + dateText(S.generatedAt) + '.' } as RText
    ] }
  ];
  void CH;
  numberBlocks(out);
  return out;
}

/** Columnas de la tabla de mínimos cuadrados para el PDF: últimos 4 trimestres observados, a, b, R² y pronóstico. */
function lsCols(nCols: number, nq: number): number[] {
  const hist = Array.from({ length: Math.min(4, nq) }, (_, i) => nq - Math.min(4, nq) + 1 + i);
  return [0, ...hist, ...Array.from({ length: nCols - nq }, (_, i) => nq + 1 + i)];
}

/** Numera tablas y gráficas en el orden en que aparecen (Tabla 1, Gráfica 1…). */
export function numberBlocks(sections: Section[]) {
  let t = 0, g = 0;
  sections.forEach(s => s.blocks.forEach(bk => { if (bk.kind === 'table') bk.n = ++t; if (bk.kind === 'chart') bk.n = ++g; }));
}

export function reportTables(R: Report): RTable[] { return R.sections.flatMap(s => s.blocks.filter((b): b is RTable => b.kind === 'table')); }
