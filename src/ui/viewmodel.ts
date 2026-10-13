// Modelo de vista: convierte los resultados del motor en lo que cada pantalla muestra
// (textos formateados, posiciones de gráficas, acciones). Las pantallas (pages/*.tsx) solo dibujan.
import * as E from '../engine';
import { fmt as f, labelsOf, unitsOf, type Assumptions, type Dataset, type RunOk, type RunResult } from '../engine';
import { FIELDS } from '../services/importer';
import { buildReport, isoToText, type Section } from '../report/content';
import type { Bundle } from '../report/bundle';
import { chartCatalog, tornLabel } from '../report/charts';
import { LOGO_URI } from '../assets/logos';
import { store } from '../services/store';
import { brandColor } from '../services/research';
import { DEFAULT_ID } from '../data/registry';
import { APP_TITLE, AUTHOR, FOOTER } from '../config';
import { annexDefs, annexTables } from './annex';
import { overridesActive, relativeView } from './relative';
import type { App } from './App';
import { SEQ, SEQ_N } from './App';

export type VM = Record<string, any>;

export interface Calc {
  ds: Dataset; A: Assumptions; D: Assumptions; base: RunResult; base0: RunResult; isBase: boolean; view: RunResult; VA: Assumptions;
  grid?: E.Grid; torn?: E.TornadoRow[]; scen?: E.Scenario[]; methods?: E.MethodRow[]; ins?: E.Insight[]; valid?: E.Check[]; bundle?: Bundle | null;
}

const POS = 'var(--pos)', NEG = 'var(--neg)', ACC = 'var(--color-accent)';
const initialsOf = (s: string) => s.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

export function buildView(app: App): VM {
  const S = app.state;
  if (!S.ready || !S.A) return { loading: true, v: {}, co: {}, r: {}, cv: {}, ui: {}, drawer: {}, pres: {}, toast: {} };
  const c = app.calc(), ds = c.ds, b = c.view as RunOk, A = c.VA, P = ds.profile, rv = S.reveal || !!S.printing, L = labelsOf(ds);
  const view = S.view, pr = S.printing;
  const v = { cover: view === 'cover' && !pr, app: view !== 'cover' || !!pr, p1: view === 'p1' || !!pr, p2: view === 'p2' || !!pr, p3: view === 'p3' || !!pr, p4: view === 'p4' || !!pr, p5: view === 'p5' || !!pr, p6: view === 'p6' || !!pr, lab: view === 'lab' && !pr, annex: view === 'annex' || pr === 'full', library: view === 'library' && !pr, import: view === 'import' && !pr, author: view === 'author' && !pr, study: view === 'study' || pr === 'full' };
  const go = (x: string, a?: string | null) => () => app.go(x, a);
  const upColor = b.ok && b.upside != null ? (b.upside >= 0 ? POS : NEG) : 'var(--color-text)';
  const co = { ticker: P.ticker || '—', exchange: P.exchange || '—', hasLogo: !!P.logo, noLogo: !P.logo, logo: P.logo || '', name: P.name, short: P.short || P.name, legalName: P.legalName || P.name, brand: P.brand || ACC, initials: initialsOf(P.short || P.name || '?'), sector: P.sector || P.industry || '', currency: P.currency, units: unitsOf(ds), valDate: ds.dates.valuation, priceDate: ds.dates.price };
  const mu = co.units;
  const r = b.ok ? {
    value: f.cur(b.value), price: b.price ? f.cur(b.price) : 'No disponible', upside: b.upside != null ? f.pp(b.upside) : '—', upColor, heroDisp: f.cur(S.heroDisp || 0),
    diff: b.price ? (b.value - b.price >= 0 ? '+' : '−') + '$' + Math.abs(b.value - b.price).toFixed(2) : '—', signal: b.signal ?? '—', threshold: Math.round(b.threshold * 100) + '%',
    caseName: caseName(c), modelLabel: 'Escenario ' + caseName(c) + ' · DCF', tvWeight: f.p(b.tvWeightW, 1),
    coverFacts: coverFacts(c, b)
  } : { value: '—', price: '—', upside: '—', upColor, heroDisp: '—', diff: '—', signal: '—', threshold: '', caseName: '', modelLabel: '', tvWeight: '—', coverFacts: [] };

  const cv = { o1: rv ? 1 : 0, o2: rv ? 1 : 0, o3: rv ? 1 : 0, o4: rv ? 1 : 0, t1: rv ? 'none' : 'translateY(-10px)', t2: rv ? 'none' : 'translateY(28px)', t3: rv ? 'none' : 'translateY(36px)' };
  const author = {
    name: AUTHOR.name, id: AUTHOR.id, footer: FOOTER, course: AUTHOR.course, activity: AUTHOR.activity, courseShort: 'Valuación de Empresas · ' + AUTHOR.year, contextShort: AUTHOR.context,
    line: AUTHOR.program + ' · ' + AUTHOR.institution + ', ' + AUTHOR.campus,
    intro: 'Estudio individual de valuación intrínseca de Organización Soriana. Todas las cifras salen del Excel del estudio (SORIANA_FINAL) y se recalculan en el motor de la app; el reporte PDF, el libro de Excel y el paquete ZIP se generan desde estos mismos cálculos.',
    rows: [['Programa', AUTHOR.program], ['Institución', AUTHOR.institution + ', ' + AUTHOR.campus], ['Materia', AUTHOR.course], ['Actividad', AUTHOR.activity], ['Profesor', AUTHOR.professor], ['Contexto', AUTHOR.context], ['Rol', AUTHOR.role]].map(([k, v]) => ({ k, v }))
  };
  const ui = {
    headerT: S.presenting ? 'translateY(-100%)' : 'none', companyMenu: S.menu === 'company', exportMenu: S.menu === 'export', desktop: !S.mobile, mobile: S.mobile,
    modified: !c.isBase || overridesActive(c.A), title: APP_TITLE, pageO: rv ? 1 : 0, pageT: rv ? 'none' : 'translateY(14px)', errorsShow: !c.base.ok && ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'lab'].includes(view), errors: c.base.errors || [], busy: S.busy
  };
  const companyList = S.companies.map(x => { const rr = E.run(x, x.id === S.activeId ? S.A as Assumptions : { ...E.defaults(x), ...(store.getA(x.id) || {}) }); return { name: x.profile.name, meta: x.profile.ticker + ' · ' + x.profile.exchange + (x.builtIn ? ' · caso presentado' : ''), value: rr.ok ? f.cur(rr.value) : '—', bg: x.id === S.activeId ? 'var(--color-accent-100)' : 'transparent', onClick: () => app.switchCompany(x.id), rr, x }; });
  const hasRel = !!(ds.comps || ds.combined);
  const NAV = [['01', 'Valor', 'p1'], ['02', 'Flujos', 'p2'], ['03', 'Riesgo', 'p3']].concat(hasRel ? [['04', 'Múltiplos', 'p4'], ['05', 'Transacciones', 'p5'], ['06', 'Combinada', 'p6']] : []).concat(ds.study ? [['07', 'Estudio', 'study']] : []).concat([['', 'Laboratorio', 'lab'], ['', 'Anexos', 'annex'], ['', 'Autor', 'author']]);
  const navItems = NAV.map(([num, label, vw]) => ({ num, label, onClick: go(vw), color: view === vw ? ACC : 'var(--color-text)', border: view === vw ? ACC : 'transparent' }));
  const mobileNav = [['Inicio', 'cover'], ['Valor', 'p1'], ['Riesgo', 'p3'], ['Estudio', 'study'], ['Más', 'annex']].map(([label, vw]) => ({ label, onClick: go(vw), color: view === vw ? ACC : 'var(--color-text)', border: view === vw ? ACC : 'transparent' }));
  const exportItems = [
    { label: 'PDF · Reporte completo', desc: 'Portada, estudio completo, escenarios, validación y apéndices (carta, con tu nombre y matrícula)', onClick: () => app.exportPdf('full') },
    { label: 'PDF · Resumen ejecutivo', desc: 'Portada y 2 a 3 páginas: ficha, campo de fútbol, escenarios y conclusiones', onClick: () => app.exportPdf('exec') },
    { label: 'Excel (.xlsx)', desc: '13 hojas; la Proyección FCFF calcula con fórmulas vivas', onClick: () => app.exportXlsx() },
    { label: 'Paquete completo (.zip)', desc: 'PDF, Excel, CSV de cada tabla, JSON y gráficas PNG + SVG', onClick: () => app.exportZip() },
    { label: 'CSV de todas las tablas (.zip)', desc: 'Una tabla por archivo, UTF-8 con BOM', onClick: () => app.exportCsvAll() },
    { label: 'Dataset ValuFlow (.json)', desc: 'Para reabrir esta valuación (incluye versión y fecha)', onClick: () => app.exportJson() },
    { label: 'Imprimir pantalla (respaldo)', desc: 'Solo si las descargas están bloqueadas', onClick: () => app.print() }
  ];


  // ----- Página 01 -----
  let track: any = {}, football: any = { rows: [] }, wf: any = { steps: [] }, kpis: any[] = [], insights: any[] = [];
  const ms = c.methods || [];
  if (b.ok) {
    const m = ds.market || ({} as Dataset['market']), pts = [b.value, b.price, m.consensus, m.low52, m.high52].filter((x): x is number => (x as number) > 0);
    const mn = Math.min(...pts) * 0.9, mx = Math.max(...pts) * 1.06, pos = (x: number) => ((x - mn) / (mx - mn) * 100).toFixed(2) + '%';
    const lo = Math.min(b.value, b.price || b.value), hi = Math.max(b.value, b.price || b.value);
    track = { has52: !!(m.low52 && m.high52), lo52: pos(m.low52 || 0), w52: m.low52 ? (((m.high52 as number) - m.low52) / (mx - mn) * 100).toFixed(2) + '%' : '0%', hasCons: !!m.consensus, cons: pos(m.consensus || 0), consTxt: m.consensus ? f.cur(m.consensus) : '', price: b.price ? pos(b.price) : '0%', value: rv ? pos(b.value) : (b.price ? pos(b.price) : '0%'), segL: pos(lo), segW: rv ? ((hi - lo) / (mx - mn) * 100).toFixed(2) + '%' : '0%', minTxt: f.cur(mn), maxTxt: f.cur(mx) };
    const all: number[] = []; ms.forEach(x => { [x.value, x.lo, x.hi].forEach(y => { if ((y as number) > 0) all.push(y as number); }); }); if (b.price) all.push(b.price);
    const fmn = Math.floor(Math.min(...all) * 0.92), fmx = Math.ceil(Math.max(...all) * 1.04), fp = (x: number) => ((x - fmn) / (fmx - fmn) * 100).toFixed(2) + '%';
    football = { priceLeft: b.price ? fp(b.price) : '0%', scaleTxt: 'Escala ' + f.cur(fmn, 0) + ' – ' + f.cur(fmx, 0), rows: ms.map((x, i) => ({ label: x.label, sub: x.sub, weight: x.main ? 700 : 500, hasBar: x.lo != null && x.hi != null, barLeft: x.lo != null ? fp(Math.min(x.lo, x.hi as number)) : '0%', barWidth: x.lo != null ? (rv ? (Math.abs((x.hi as number) - x.lo) / (fmx - fmn) * 100).toFixed(2) + '%' : '0%') : '0%', barBg: x.main ? 'var(--color-accent)' : x.ref ? 'var(--color-neutral-300)' : 'var(--color-accent-300)', hasDot: x.value != null, dotLeft: x.value != null ? fp(x.value) : '0%', dotBg: x.main ? 'var(--color-accent-900)' : x.ref ? 'var(--color-neutral-700)' : 'var(--color-accent-700)', valueTxt: x.value != null ? f.cur(x.value) : '', rangeTxt: x.lo != null ? f.cur(x.lo) + ' – ' + f.cur(x.hi) : (x.ref ? 'Referencia' : ''), color: x.main ? ACC : 'var(--color-text)', delay: (i * 90) + 'ms' })) };
    const st: any[] = []; const br = ds.valuation.bridge;
    st.push({ label: 'VP FCF ' + b.rows[0].year + '–' + b.rows[b.rows.length - 1].year, v: b.pvSum }, { label: b.mult ? 'VP valor terminal (ponderado)' : 'VP valor terminal', v: b.pvTvW }, { label: b.roll ? 'EV al ' + L.closeDate : 'Enterprise Value', total: b.evW });
    if (b.roll) st.push({ label: 'Capitalización a ' + L.rollDate, v: b.roll.capGain }, { label: 'Menos FCF ' + L.rollFcf + ' (negativo)', v: b.roll.fcfGenerated }, { label: 'EV al ' + L.rollDate, total: b.roll.ev2 }, { label: 'Deuda bursátil y bancaria', v: -b.roll.debt }, { label: 'Arrendamientos', v: -b.roll.lease }, { label: 'Efectivo', v: b.roll.cash }, { label: 'Equity al ' + L.rollDate, total: b.roll.eq2 }, { label: 'Capitalización a Ke', v: b.roll.keGain }, { label: 'Equity a la fecha de valuación', total: b.roll.eq3 });
    else { st.push({ label: 'Deuda', v: -br.debt }); if (br.lease) st.push({ label: 'Arrendamientos', v: -br.lease }); st.push({ label: 'Efectivo', v: br.cash }, { label: 'Equity Value', total: b.eqClose }); }
    let cum = 0; st.forEach(s => { if (s.total != null) { s.a = 0; s.z = s.total; cum = s.total; } else { s.a = cum; s.z = cum + s.v; cum = s.z; } });
    const wmax = Math.max(...st.map(s => Math.max(s.a, s.z))) * 1.08;
    wf = { minW: (st.length * 78) + 'px', note: '÷ ' + f.n(b.shares, 1) + ' mm de acciones = ' + f.cur(b.value) + ' por acción', steps: st.map((s, i) => { const lo2 = Math.min(s.a, s.z), hi2 = Math.max(s.a, s.z); const isT = s.total != null, neg = !isT && s.v < 0; return { label: s.label, valTxt: (isT ? '' : (neg ? '−' : '+')) + f.m(Math.abs(isT ? s.total : s.v), 0), bottom: (lo2 / wmax * 100).toFixed(2) + '%', height: rv ? ((hi2 - lo2) / wmax * 100).toFixed(2) + '%' : '0%', labelBottom: rv ? (hi2 / wmax * 100).toFixed(2) + '%' : (lo2 / wmax * 100).toFixed(2) + '%', op: rv ? 1 : 0, bg: isT ? ACC : neg ? 'color-mix(in srgb, var(--neg) 70%, white)' : 'var(--color-accent-300)', border: 'none', color: isT ? 'var(--color-accent-800)' : neg ? NEG : 'var(--color-text)', delay: (i * 70) + 'ms' }; }) };
    kpis = [
      { label: 'WACC', kind: 'Supuesto', value: f.p(b.wacc), unit: '', desc: (A.waccMode === 'iterated' ? 'Iterado al valor DCF. ' : A.waccMode === 'market' ? 'A valor de mercado. ' : 'Manual. ') + 'Tasa para descontar los FCF.', onClick: () => app.setState({ drawer: 'wacc' }) },
      { label: 'Crecimiento perpetuo', kind: 'Supuesto', value: f.p(b.g), unit: '', desc: 'Crecimiento de los flujos después del periodo explícito.', onClick: () => app.setState({ drawer: 'tv' }) },
      { label: 'Enterprise Value', kind: 'Cálculo', value: f.m(b.ev), unit: mu, desc: b.roll ? 'Al ' + L.rollDate + ' · ' + Math.round(b.wG * 100) + '% Gordon / ' + Math.round((1 - b.wG) * 100) + '% múltiplo.' : 'VP de FCF + VP del valor terminal.', onClick: () => app.setState({ drawer: 'ev' }) },
      { label: 'Equity Value', kind: 'Resultado', value: f.m(b.eqVal), unit: mu, desc: 'Valor para los accionistas' + (b.roll ? ' a la fecha de valuación.' : '.'), onClick: () => app.setState({ drawer: 'value' }) },
      { label: 'Peso del valor terminal', kind: 'Cálculo', value: f.p(b.tvWeightG, 1), unit: '', desc: 'Proporción del EV (Gordon) que proviene del valor terminal.', onClick: () => app.setState({ drawer: 'tv' }) },
      { label: 'FCF ' + b.rows[0].year, kind: 'Cálculo', value: f.m(b.rows[0].fcf), unit: mu, desc: 'Flujo libre disponible para proveedores de capital.', onClick: () => app.go('p2') }
    ];
    const RVk = (ds.comps || ds.combined) ? E.relative(ds, A, b.value) : null;
    if (RVk && RVk.combined && E.isNum(RVk.combined.value)) kpis.push({ label: 'Valuación combinada', kind: 'Resultado', value: f.cur(RVk.combined.value), unit: '', desc: RVk.combined.rows.map(x => x.label + ' ' + Math.round(x.weight * 100) + '%').join(' · ') + '.', onClick: () => app.go('p6') });
    if (RVk && RVk.comps && E.isNum(RVk.comps.value)) kpis.push({ label: 'Trading Comps', kind: 'Resultado', value: f.cur(RVk.comps.value), unit: '', desc: RVk.comps.n + ' comparables · promedio de ' + RVk.comps.used + ' múltiplos a la media.', onClick: () => app.go('p4') });
    insights = (c.ins || []).map((x, i) => ({ ...x, op: rv ? 1 : 0, tr: rv ? 'none' : 'translateY(12px)', delay: (200 + i * 90) + 'ms' }));
  }

  // ----- Página 02 -----
  let fcfChart: any = { cols: [] }, fcfSel: any = { items: [] }, sales: any = { legend: [], yl: [], paths: [], dots: [], xl: [] }, tv: any = {}, weights: any[] = [], extNet: any[] = [], extTop: any[] = [], methodSteps: any[] = [];
  if (b.ok) {
    const B = ds.forecast.base, R = b.rows, mxF = Math.max(...R.map(x => x.fcf), B.fcf || 0) * 1.12;
    const sel = Math.min(S.fcfSel, R.length - 1);
    fcfChart.cols = [{ label: ds.forecast.baseYear, fcfTxt: B.fcf != null ? f.m(B.fcf) : '—', pvTxt: '—', hF: rv && B.fcf ? (B.fcf / mxF * 100).toFixed(1) + '%' : '0%', hP: '0%', fBg: 'transparent', fBorder: '1px dashed var(--color-neutral-600)', bg: 'transparent', weight: 500, delay: '0ms', delay2: '0ms', onClick: () => { /* año base: sin desglose */ } }]
      .concat(R.map((x, i) => ({ label: x.year, fcfTxt: f.m(x.fcf), pvTxt: f.m(x.pv), hF: rv ? (x.fcf / mxF * 100).toFixed(1) + '%' : '0%', hP: rv ? (x.pv / mxF * 100).toFixed(1) + '%' : '0%', fBg: 'var(--color-accent-300)', fBorder: 'none', bg: i === sel ? 'var(--color-accent-100)' : 'transparent', weight: i === sel ? 700 : 500, delay: ((i + 1) * 90) + 'ms', delay2: ((i + 1) * 90 + 300) + 'ms', onClick: () => app.setState({ fcfSel: i }) })));
    fcfChart.note = 'Suma del valor presente ' + f.m(b.pvSum) + ' ' + mu + ' (' + f.p(1 - b.tvWeightG, 1) + ' del EV Gordon). ' + (B.fcf != null ? ds.forecast.baseYear + ' = flujo actual de referencia.' : '');
    const x = R[sel], mxB = Math.max(x.ebit, x.nopat + x.da) * 1.05, pc = (vv: number) => (vv / mxB * 100).toFixed(2) + '%';
    const it: [string, number, number, string][] = [['EBIT', 0, x.ebit, 'add'], ['(−) Impuestos', x.nopat, x.ebit, 'sub'], ['NOPAT', 0, x.nopat, 'tot'], ['(+) D&A', x.nopat, x.nopat + x.da, 'add'], ['(−) Capex', x.nopat + x.da - x.capex, x.nopat + x.da, 'sub'], ['(−) ΔNWC', Math.min(x.fcf, x.fcf + x.dNwc), Math.max(x.fcf, x.fcf + x.dNwc), x.dNwc > 0 ? 'sub' : 'add'], ['FCF', 0, x.fcf, 'tot']];
    const vals = [x.ebit, -x.tax, x.nopat, x.da, -x.capex, -x.dNwc, x.fcf];
    fcfSel = { year: x.year, tax: f.p(x.taxRate), margin: f.p(x.margin), growth: f.pp(x.growth), items: it.map(([l, a, z, k], i) => ({ label: l, left: pc(Math.max(0, a)), width: rv ? pc(Math.abs(z - a)) : '0%', bg: k === 'tot' ? ACC : k === 'sub' ? 'color-mix(in srgb, var(--neg) 70%, white)' : 'var(--color-accent-300)', valTxt: (k === 'tot' ? '' : vals[i] < 0 ? '−' : '+') + f.m(Math.abs(vals[i])), color: k === 'tot' ? ACC : vals[i] < 0 ? NEG : 'var(--color-text)', weight: k === 'tot' ? 700 : 400 })) };
    const yrs = [ds.forecast.baseYear].concat(R.map(rr => rr.year)), X0 = 80, X1 = 600, xs = (i: number) => X0 + i * (X1 - X0) / (yrs.length - 1);
    const BS = ds.forecast.build, BD = b.drivers.build;
    const series: any[] = [{ label: 'Proyección final', color: ACC, dash: 'solid', w: 3, data: [B.revenue as number].concat(R.map(rr => rr.revenue)), solid: true }];
    if (BS) series.push({ label: 'Mínimos cuadrados (LTM)', color: 'var(--color-accent-400)', dash: 'dotted', w: 2, data: BS.sales.lsSales });
    const allS = series.flatMap(s => s.data as number[]), ymn = Math.min(...allS) * 0.96, ymx = Math.max(...allS) * 1.02, ys = (vv: number) => 248 - (vv - ymn) / (ymx - ymn) * 220;
    const lastY = R[R.length - 1];
    sales = {
      legend: series.map(s => ({ label: s.label, color: s.color, dash: s.dash })), splitX: ((xs(0) + xs(1)) / 2).toFixed(1), splitTx: ((xs(0) + xs(1)) / 2 + 6).toFixed(1),
      yl: [0, 1, 2, 3].map(k => { const val = ymn + (ymx - ymn) * k / 3; return { y: ys(val).toFixed(1), ty: (ys(val) + 4).toFixed(1), t: f.m(val / 1000, 0) + 'k' }; }),
      paths: series.map(s => ({ d: (s.data as number[]).map((vv, i) => (i ? 'L' : 'M') + xs(i).toFixed(1) + ' ' + ys(vv).toFixed(1)).join(' '), color: s.color, w: s.w, dash: s.solid ? '1000' : (s.dash === 'dashed' ? '7 6' : '2 5'), off: s.solid ? (rv ? 0 : 1000) : 0 })),
      dots: (series[0].data as number[]).map((vv, i) => ({ x: xs(i).toFixed(1), y: ys(vv).toFixed(1), ty: (ys(vv) - 12).toFixed(1), t: f.m(vv / 1000, 1) + 'k' })),
      xl: yrs.map((y, i) => ({ x: xs(i).toFixed(1), t: y, fw: i === 0 ? 700 : 400 })),
      note: BS ? 'Ventas ' + lastY.year + ': ' + f.m(lastY.revenue) + ' ' + mu + ' con la proyección final (inflación ' + f.p(BD ? BD.inflation[0] : NaN) + '), frente a ' + f.m(BS.sales.lsSales[BS.sales.lsSales.length - 1]) + ' con la tendencia lineal pura de los últimos trimestres.' : 'Crecimiento constante de ' + f.p(R[0].growth) + ' anual a partir del último año reportado.'
    };
    if (BS && BD) {
      const Y = ds.forecast.years, wN = BS.weightsExternal.length - 1, by = BD.years;
      const adjS = BS.sales.adjustments, adjM = BS.margin.adjustments;
      methodSteps = [
        { n: '01', title: 'Variables externas', text: 'Crecimiento del mercado = inflación del escenario (' + f.p(by[0].inflation) + ') + PIB × elasticidad + ajuste de consumo, más ' + adjS.length + ' ajustes de competencia y negocio' + ((A.salesAdj ?? 0) !== 0 ? ' y el ajuste del escenario (' + f.pp(A.salesAdj ?? 0, 2) + ')' : '') + '.', meta: 'Crecimiento por variables externas: ' + f.pp(by[0].growthExternal, 2) + ' → ' + f.pp(by[by.length - 1].growthExternal, 2) },
        { n: '02', title: 'Mínimos cuadrados', text: 'Tendencia lineal de las ventas de los últimos trimestres llevada a cada año proyectado; margen, D&A, capex e impuestos también tienen su versión por mínimos cuadrados.', meta: 'Crecimiento por mínimos cuadrados: ' + f.pp(by[0].growthLS, 2) + ' → ' + f.pp(by[by.length - 1].growthLS, 2) },
        { n: '03', title: 'Ponderación', text: 'La proyección final combina ambos métodos: ' + f.p(BS.weightsExternal[0], 0) + ' variables externas en ' + Y[0] + ', hasta ' + f.p(BS.weightsExternal[wN], 0) + ' en ' + Y[wN] + '.', meta: 'Crecimiento final: ' + f.pp(by[0].growth, 2) + ' → ' + f.pp(by[by.length - 1].growth, 2) + ' · margen EBIT ' + f.p(by[0].margin) + ' → ' + f.p(by[by.length - 1].margin) }
      ];
      weights = BS.weightsExternal.map((w, i) => ({ year: Y[i], ext: rv ? (w * 100) + '%' : '0%', extTxt: f.p(w, 0), lsTxt: f.p(1 - w, 0), delay: (i * 80) + 'ms' }));
      extNet = [{ k: 'Inflación', v: f.p(by[0].inflation), color: 'var(--color-text)' }, { k: 'Ajuste ventas', v: f.pp(A.salesAdj ?? 0, 2), color: (A.salesAdj ?? 0) < 0 ? NEG : POS }, { k: 'Ajuste margen', v: f.pp(A.marginAdj ?? 0, 2), color: (A.marginAdj ?? 0) < 0 ? NEG : POS }];
      const items = adjS.map(x => ({ name: x.label.replace(/^\(más o menos \) ?/, ''), cat: 'Ventas · ' + Y[0], v: x.values[0] })).concat(adjM.map(x => ({ name: x.label.replace(/^\(más o menos \) ?/, ''), cat: 'Margen EBIT · ' + Y[0], v: x.values[0] }))).filter(x => x.v);
      const mxA = Math.max(...items.map(x => Math.abs(x.v)), 0.0001);
      extTop = items.sort((p, q) => Math.abs(q.v) - Math.abs(p.v)).slice(0, 8).map(e => { const w = Math.abs(e.v) / mxA * 46; return { name: e.name, cat: e.cat, v: f.pp(e.v, 2), left: e.v < 0 ? (50 - (rv ? w : 0)) + '%' : '50%', width: rv ? w + '%' : '0%', color: e.v < 0 ? NEG : POS }; });
    } else {
      methodSteps = [
        { n: '01', title: 'Base del archivo', text: 'Último año reportado: ventas ' + f.m(B.revenue) + ' ' + mu + ', margen EBIT ' + f.p((B.ebit as number) / (B.revenue as number)) + '.', meta: 'Fuente: ' + (ds.source.file || 'captura') },
        { n: '02', title: 'Drivers constantes', text: 'Crecimiento ' + f.p(R[0].growth) + ', D&A, capex y capital de trabajo como porcentaje de ventas, tasa ' + f.p(R[0].taxRate) + '.', meta: 'Editables en el Laboratorio' },
        { n: '03', title: 'Mismo motor', text: 'WACC iterado al valor DCF y valor terminal por Gordon' + (b.mult ? ' y múltiplo EV/EBITDA.' : '.'), meta: 'Sin código específico por empresa' }
      ];
    }
    tv = { lastYear: R[R.length - 1].year, fcfN: f.m(R[R.length - 1].fcf), g: f.p(b.g), denom: f.p(b.wacc - b.g), tv: f.m(b.tvG), pv: f.m(b.pvTvG), wExp: rv ? ((1 - b.tvWeightW) * 100).toFixed(1) + '%' : '0%', expTxt: f.p(1 - b.tvWeightW, 1), tvTxt: f.p(b.tvWeightW, 1) };
  }
  const extCount = ds.forecast.build ? ds.forecast.build.sales.adjustments.length + ds.forecast.build.margin.adjustments.length : 0;

  // ----- Página 03 -----
  let wb: any = { keBlocks: [], kdBlocks: [] }, iter: any = { yl: [], pts: [], stats: [] }, heat: any = { steps: [], cols: [], rows: [] }, torn: any = { rows: [] }, scen: any[] = [];
  if (b.ok) {
    const W = b.W, useM = A.waccMode === 'market', src = (useM ? W.market : (W.iterated || W.market));
    const blk = (k: string, vv: string, s: string, op: string, hl?: boolean) => ({ k, v: vv, s, op, bg: hl ? ACC : 'transparent', color: hl ? 'var(--color-bg)' : 'var(--color-text)', border: hl ? ACC : 'var(--color-divider)' });
    wb = {
      modeLabel: A.waccMode === 'iterated' ? 'Iterado al valor DCF' : useM ? 'Valor de mercado' : 'Manual · ' + f.p(b.wacc),
      keBlocks: [blk('Tasa libre de riesgo', f.p(W.rf), L.rfSource, '+'), blk('Beta apalancada βL', src.beta.toFixed(3), 'βU ' + W.betaU.toFixed(2) + ' (regresión)' + ' · D/E ' + f.x(src.de, 3), '×'), blk('Prima de riesgo', f.p(W.prm), 'PRM aplicada', '='), blk('Ke', f.p(src.ke), 'Costo del capital', '', true)],
      kdBlocks: [blk('Kd antes de impuestos', f.p(src.kd), useM ? 'Gastos financieros / deuda' : 'Tasa implícita proyectada', '× (1 −'), blk('Tasa fiscal', f.p(src.tax), 'Escudo fiscal', ') ='), blk('Kd(1 − t)', f.p(src.kdAT), 'Costo de la deuda', '', true)],
      structLabel: useM ? 'capital a valor de mercado (' + f.m(src.E) + ' ' + mu + ')' : 'capital al valor DCF (' + f.m(src.E) + ' ' + mu + ')', wEW: rv ? (src.wE * 100).toFixed(1) + '%' : '50%', wE: f.p(src.wE, 1), wD: f.p(src.wD, 1), ke: f.p(src.ke), kdat: f.p(src.kdAT), wacc: f.p(b.wacc)
    };
    const seq = W.iters.length ? [W.iters[0].win].concat(W.iters.slice(0, 6).map(i => i.wout)) : [b.wacc];
    const imn = Math.min(...seq) - 0.002, imx = Math.max(...seq) + 0.002, iy = (vv: number) => 150 - (vv - imn) / (imx - imn) * 120, ix = (i: number) => 60 + i * (280 / Math.max(1, seq.length - 1));
    iter = { poly: seq.map((v2, i) => ix(i).toFixed(1) + ',' + iy(v2).toFixed(1)).join(' '), pts: seq.map((v2, i) => ({ x: ix(i).toFixed(1), y: iy(v2).toFixed(1), ty: (iy(v2) - 10).toFixed(1), t: (v2 * 100).toFixed(2), k: i === 0 ? 'Mercado' : 'It. ' + i })), yl: [0, 1, 2].map(k => { const vv = imn + (imx - imn) * k / 2; return { y: iy(vv).toFixed(1), ty: (iy(vv) + 3).toFixed(1), t: (vv * 100).toFixed(2) + '%' }; }), stats: [{ k: 'WACC de mercado', v: f.p(W.market.wacc) }, { k: 'WACC convergido', v: W.iterated ? f.p(W.iterated.wacc) : '—' }, { k: 'Iteraciones', v: String(W.iters.length) }] };
    const G = c.grid as E.Grid; heat = {
      steps: [0.25, 0.5, 1].map(s => ({ t: s.toFixed(2) + ' pp', onClick: () => app.setState({ step: s }), bg: S.step === s ? ACC : 'transparent', color: S.step === s ? 'var(--color-bg)' : 'var(--color-text)' })),
      cols: G.gs.map(x => (x).toFixed(2) + '%'),
      rows: G.ws.map((w, i) => ({ head: w.toFixed(2) + '%', cells: G.cells[i].map((val, j) => { if (val == null) return { t: 'n/a', bg: 'var(--color-neutral-200)', outline: 'none', weight: 400 }; const d = b.price ? val / b.price - 1 : 0, k = Math.min(1, Math.abs(d) / 0.25), pct = Math.round(8 + 30 * k); return { t: f.cur(val), bg: 'color-mix(in srgb, ' + (d >= 0 ? 'var(--pos)' : 'var(--neg)') + ' ' + pct + '%, transparent)', outline: i === 2 && j === 2 ? '2px solid var(--color-text)' : 'none', weight: i === 2 && j === 2 ? 700 : 500 }; }) }))
    };
    const T = c.torn || [], dev = Math.max(...T.map(t => Math.max(Math.abs((t.low ?? b.value) - b.value), Math.abs((t.high ?? b.value) - b.value))), 0.01);
    torn.rows = T.map((t, i) => { const lo = Math.min(t.low as number, t.high as number), hi = Math.max(t.low as number, t.high as number); return { label: tornLabel(t), stepTxt: t.lowInput != null ? (t.key === 'beta' ? t.lowInput.toFixed(4) + ' a ' + (t.highInput as number).toFixed(4) : f.p(t.lowInput) + ' a ' + f.p(t.highInput)) : t.step + (t.unit === 'x' ? 'x' : ' pp'), rangeTxt: f.cur(t.range), lW: rv ? (Math.max(0, b.value - lo) / dev * 44).toFixed(1) + '%' : '0%', rW: rv ? (Math.max(0, hi - b.value) / dev * 44).toFixed(1) + '%' : '0%', lowTxt: f.cur(lo), highTxt: f.cur(hi), delay: (i * 70) + 'ms' }; });
    scen = (c.scen || []).map(s => { const m = s.m; return { label: s.label, kind: s.active ? 'Activo' : 'Escenario', desc: s.m ? 'Inflación ' + f.p(s.params.inflationRate) + ' · ventas ' + f.pp(s.params.salesAdj, 0) + ' · margen ' + f.pp(s.params.marginAdj, 2) + ' · beta ' + s.params.betaLevered.toFixed(4) + ' · g ' + s.params.g.toFixed(2) + '% · WACC ' + f.p(m!.wacc) : '', source: ds.study?.inflation.why?.[s.key] ?? '', valTxt: m ? f.cur(m.price) : '—', upTxt: m ? f.pp(m.diffPct) + ' · ' + m.recommendation : '—', upColor: (m?.diffPct ?? 0) >= 0 ? POS : NEG, vColor: s.active ? ACC : 'var(--color-text)', bg: s.active ? 'var(--color-accent-100)' : 'transparent', active: s.active, reference: false, canUse: !s.active, btnTxt: s.active ? 'Escenario activo' : 'Usar este escenario', onClick: () => app.setA(E.presetPatch(s.params)) }; });
  }
  const scenNote = ds.study ? 'Cada escenario corre el DCF completo con WACC iterado: inflación (con su efecto en Rf y Kd por Fisher), ajuste de ventas y margen, beta ± un error típico y g.' : 'Este dataset no documenta escenarios: no se generan escenarios arbitrarios.';
  const hasScen = (c.scen || []).length > 0;
  // Bloques del reporte para la vista Riesgo y la vista Estudio (mismo contenido que el PDF).
  const REP = c.bundle && (v.p3 || v.study || v.p1) ? buildReport(c.bundle) : null;
  const repBlock = (sid: string, id: string) => REP?.sections.find(x => x.id === sid)?.blocks.find(k => (k.kind === 'table' || k.kind === 'chart') && k.id === id);
  const act = { csv: (t: any) => app.exportTable(t), png: (ch: any) => app.exportChart(ch, 'png'), svg: (ch: any) => app.exportChart(ch, 'svg') };
  const risk = { blocks: REP ? [repBlock('scen', 'scen'), repBlock('scen', 'scenPrice'), repBlock('scen', 'tornado'), repBlock('valid', 'sens'), repBlock('appD', 'priceWacc'), repBlock('appD', 'inflValue'), repBlock('appD', 'betaKe'), repBlock('appD', 'gEv'), repBlock('appD', 'evEqScen')].filter(Boolean) : [], act };

  // ----- Laboratorio -----
  const SA = S.A as Assumptions, SAr = SA as unknown as Record<string, number>;
  const D = c.D as unknown as Record<string, number>, ch = (k: string) => Math.abs((SAr[k] ?? 0) - (D[k] ?? 0)) > 1e-9 ? '●' : '';
  const pp = (vv: number) => (vv >= 0 ? '+' : '−') + Math.abs(vv).toFixed(2) + ' pp';
  const ctl = (k: string, label: string, min: number, max: number, step: number, fm: (v: number) => string, impact: string, source: string, scale = 1) => ({ range: true, num: false, label, min, max, step, value: (SAr[k] ?? 0) * scale, valTxt: fm(SAr[k] ?? 0), onChange: (e: { target: { value: string } }) => app.setA({ [k]: parseFloat(e.target.value) / scale } as Partial<Assumptions>), impact, source, dot: ch(k) });
  const inp = (k: string, label: string, step: number, fm: (v: number) => string, impact: string, source: string, scale = 1) => ({ ...ctl(k, label, 0, 0, step, fm, impact, source, scale), value: +(+((SAr[k] ?? 0) * scale)).toPrecision(12), range: false, num: true, onChange: (e: { target: { value: string } }) => { const x = parseFloat(e.target.value); if (isFinite(x)) app.setA({ [k]: x / scale } as Partial<Assumptions>); } });
  const pct = (vv: number) => (+vv).toFixed(2) + '%', pctF = (vv: number) => (vv * 100).toFixed(2) + '%';
  const srcX = L.sourceShort, PR = E.scenarioPresets(ds), BT = ds.study ? E.betaStudy(ds.study) : null;
  const groups = [
    { title: 'Escenario', desc: 'Inflación 2026E–2030E (mueve ventas y, por Fisher, Rf y Kd) y ajustes de ventas y margen del escenario. Rango: valores Conservador a Optimista del Excel', controls: (ds.study ? [
      inp('inflationRate', 'Inflación anual del escenario (%)', 0.01, pctF, 'Ventas nominales, Rf y Kd', 'Excel · hoja Inflación (Conservador ' + pctF(PR[0]?.inflationRate ?? 0) + ', Base ' + pctF(PR.find(p => p.key === 'base')?.inflationRate ?? 0) + ', Optimista ' + pctF(PR[PR.length - 1]?.inflationRate ?? 0) + ')', 100),
      ctl('salesAdj', 'Ajuste al crecimiento de ventas', -2, 2, 0.25, v2 => pp(v2 * 100), 'Se suma al crecimiento por variables externas', 'Excel · hoja Escenarios fila 8 (±1 pp)', 100),
      ctl('marginAdj', 'Ajuste al margen EBIT', -0.5, 0.5, 0.05, v2 => pp(v2 * 100), 'Se suma al margen final', 'Excel · hoja Escenarios fila 9 (±0.25 pp)', 100)
    ] : []).concat([ctl('dCapex', 'Δ Capex (% ventas)', -0.5, 0.5, 0.05, pp, 'Reduce el FCF uno a uno', 'Ajuste adicional del Laboratorio'), ctl('dTax', 'Δ Tasa de impuestos sobre EBIT', -4, 4, 0.5, pp, 'Afecta NOPAT', 'Ajuste adicional del Laboratorio')]) },
    { title: 'Valor terminal', desc: 'Afectan principalmente el valor terminal', controls: [ctl('g', 'Crecimiento perpetuo (g)', 2, 5, 0.05, pct, 'Afecta principalmente el valor terminal', 'Excel · hoja Crecimiento Perpetuo (3.0% / 3.5% / 4.0%)')].concat(A.exitMultiple ? [ctl('exitMultiple', 'Múltiplo de salida EV/EBITDA', +(D.exitMultiple - 1).toFixed(4), +(D.exitMultiple + 1).toFixed(4), 0.05, vv => (+vv).toFixed(2) + 'x', 'Valor terminal por múltiplos', L.multipleSource + ' · rango ±1x'), ctl('wGordon', 'Peso del método Gordon', 0, 100, 5, vv => Math.round(vv) + '%', 'Ponderación Gordon vs. múltiplo', srcX + ' · 50% / 50%')] : []) },
    { title: 'Costo de capital', desc: 'Cambian Ke, el WACC y el descuento de todos los flujos. Insumos sin rango documentado: se capturan como número', controls: (A.waccMode === 'manual' ? [ctl('waccManual', 'WACC manual', +((b.ok ? b.wacc * 100 : 12) - 1).toFixed(2), +((b.ok ? b.wacc * 100 : 12) + 1).toFixed(2), 0.05, pct, 'Descuento de todos los flujos', 'Rango: tabla WACC × g (±1 pp)')] : []).concat([inp('rf', 'Tasa libre de riesgo base (Rf, %)', 0.001, pct, 'Sube Ke y el WACC (Fisher ajusta por la inflación del escenario)', srcX + ' · ' + L.rfSource), inp('prm', 'Prima de riesgo de mercado (%)', 0.01, pct, 'Sube Ke y el WACC', srcX + ' · hoja WACC'), inp('kdPre', 'Kd antes de impuestos (%)', 0.05, pct, 'Costo de la deuda (WACC iterado)', srcX + ' · tasa esperada 2026'), inp('taxShield', 'Tasa del escudo fiscal (%)', 0.1, pct, 'Kd después de impuestos y βL', srcX)]) }
  ];
  const b0 = c.base0;
  const betaSel = SA.betaLevered == null ? 'manual' : BT && Math.abs(SA.betaLevered - BT.slope) < 1e-12 ? 'reg' : BT && Math.abs(SA.betaLevered - (BT.slope + BT.se)) < 1e-12 ? 'plus' : BT && Math.abs(SA.betaLevered - (BT.slope - BT.se)) < 1e-12 ? 'minus' : 'manual';
  const lab = {
    hasScen: PR.length > 0,
    scenOpts: PR.map(p => { const on = SA.scenario === p.key && Math.abs((SA.inflationRate ?? 0) - p.inflationRate) < 1e-12 && Math.abs((SA.betaLevered ?? 0) - p.betaLevered) < 1e-12 && Math.abs(SA.g - p.g) < 1e-9; return { t: p.label, onClick: () => app.setA(E.presetPatch(p)), bg: on ? ACC : 'transparent', color: on ? 'var(--color-bg)' : 'var(--color-text)' }; }),
    scenNote: SA.scenario ? 'Escenario de partida: ' + (PR.find(p => p.key === SA.scenario)?.label ?? SA.scenario) + '. Cambiar un control no cambia de escenario: el reporte indica los supuestos modificados.' : '',
    waccOpts: ([['Iterado', 'iterated'], ['Mercado', 'market'], ['Manual', 'manual']] as const).map(([t, k]) => ({ t, onClick: () => app.setA(k === 'manual' ? { waccMode: k, waccManual: +(b.ok ? b.wacc * 100 : 12).toFixed(2), keFixed: b.ok ? b.ke * 100 : null } : { waccMode: k, keFixed: null }), bg: SA.waccMode === k ? ACC : 'transparent', color: SA.waccMode === k ? 'var(--color-bg)' : 'var(--color-text)' })),
    hasBeta: !!BT,
    betaOpts: BT ? ([['Regresión ' + BT.slope.toFixed(4), 'reg', BT.slope], ['+1 error típico ' + (BT.slope + BT.se).toFixed(4), 'plus', BT.slope + BT.se], ['−1 error típico ' + (BT.slope - BT.se).toFixed(4), 'minus', BT.slope - BT.se], ['Manual', 'manual', null]] as [string, string, number | null][]).map(([t, k, v2]) => ({ t, onClick: () => app.setA({ betaLevered: v2 ?? (SA.betaLevered ?? BT.slope) }), bg: betaSel === k ? ACC : 'transparent', color: betaSel === k ? 'var(--color-bg)' : 'var(--color-text)' })) : [],
    betaManual: SA.betaLevered ?? '', onBeta: (e: { target: { value: string } }) => { const x = parseFloat(e.target.value); if (isFinite(x)) app.setA({ betaLevered: x }); },
    betaNote: BT ? 'Beta apalancada a la estructura de mercado (regresión semanal de ' + BT.n + ' semanas; error típico ' + BT.se.toFixed(4) + ', p ' + BT.p.toFixed(3) + '). El motor la desapalanca con el D/E de mercado y la reapalanca en cada iteración del WACC.' : '',
    groups, price: numIn(SA.price), shares: numIn(SA.shares), date: SA.valuationDate ?? '',
    onPrice: (e: { target: { value: string } }) => app.setA({ price: parseFloat(e.target.value) }), onShares: (e: { target: { value: string } }) => app.setA({ shares: parseFloat(e.target.value) }),
    onDate: (e: { target: { value: string } }) => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) app.setA({ valuationDate: e.target.value }); },
    delta: b.ok && b0.ok ? (b.value - b0.value >= 0 ? '+' : '−') + '$' + Math.abs(b.value - b0.value).toFixed(2) : '—', deltaColor: b.ok && b0.ok ? (b.value - b0.value >= 0 ? POS : NEG) : 'var(--color-text)',
    stats: b.ok ? [{ k: 'Enterprise Value', v: f.m(b.ev) }, { k: 'Equity Value', v: f.m(b.eqVal) }, { k: 'WACC', v: f.p(b.wacc) }, { k: 'Recomendación', v: b.signal ?? '—' }] : [],
    changes: c.bundle ? c.bundle.changes.map(x => ({ k: x[0], a: x[1], b: x[2] })) : []
  };

  // ----- Estudio -----
  const STUDY_TABS: [string, string, string[]][] = [['all', 'Todo', ['vars', 'models', 'beta', 'wacc', 'growth', 'tv', 'valid', 'concl', 'questions']], ['infl', 'Inflación y precio', ['vars', 'models']], ['beta', 'Beta', ['beta']], ['wacc', 'WACC', ['wacc']], ['g', 'Crecimiento perpetuo', ['growth', 'tv']], ['valid', 'Validación', ['valid']], ['concl', 'Conclusiones y preguntas', ['concl', 'questions']]];
  const tab = STUDY_TABS.find(t => t[0] === S.studyTab) ?? STUDY_TABS[0];
  const notesKey = 'vf-parity-notes';
  let notesStore: Record<string, string> = {}; try { notesStore = JSON.parse(localStorage.getItem(notesKey) || '{}'); } catch { /* sin almacenamiento */ }
  const parityRows = c.bundle ? c.bundle.parity : [];
  const study = REP ? {
    intro: 'Explicación breve de cada módulo del Excel del estudio, recalculado en el motor desde las series crudas (mínimos cuadrados, correlación, regresión con error típico, t y p). Cada tabla se descarga en CSV y cada gráfica en PNG o SVG.',
    changes: c.bundle && c.bundle.changes.length ? 'Supuestos modificados respecto al Excel: ' + c.bundle.changes.map(x => x[0] + ' (' + x[1] + ' → ' + x[2] + ')').join('; ') + '. Las cifras de esta vista usan los supuestos actuales.' : '',
    tabs: STUDY_TABS.map(t => ({ label: t[1], on: t[0] === tab[0], onClick: () => app.setState({ studyTab: t[0] }) })),
    sections: (pr === 'full' ? STUDY_TABS[0][2] : tab[2]).map(id => REP.sections.find(x => x.id === id)).filter((x): x is Section => !!x),
    act,
    notes: { id: 'parity', render: (i: number) => { const k = parityRows[i]?.label ?? String(i); return { key: k, value: notesStore[k] ?? '', onChange: (e: { target: { value: string } }) => { notesStore[k] = e.target.value; try { localStorage.setItem(notesKey, JSON.stringify(notesStore)); } catch { /* sin almacenamiento */ } } }; } }
  } : null;

  // ----- Anexos -----
  const defs = annexDefs(ds), aid = defs.find(d => d[0] === S.annexId) ? S.annexId as string : defs[0][0];
  const annexNav = defs.map(([id, code, title]) => ({ code, title, onClick: () => app.setState({ annexId: id }, () => { try { window.scrollTo({ top: 0 }); } catch { /* sin ventana */ } }), bg: id === aid ? 'var(--color-accent-100)' : 'transparent', border: id === aid ? ACC : 'transparent', fw: id === aid ? 600 : 400 }));
  const full = pr === 'full';
  const annexTablesV = v.annex ? annexTables(c, full ? 'all' : aid) : [];
  const codeOf = (id: string) => (defs.find(d => d[0] === id) || [])[1];
  const ax = { empresa: v.annex && (full || aid === 'empresa'), valid: v.annex && (full || aid === 'valid'), method: v.annex && (full || aid === 'method'), empCode: codeOf('empresa'), valCode: codeOf('valid'), metCode: codeOf('method') };
  const RS = S.research[ds.id] || null, applied = RS ? (RS.items || []).filter(i => i.status === 'applied') : [];
  const m = ds.market || ({} as Dataset['market']);
  const facts = ([['Ticker', P.ticker], ['Mercado', P.exchange], ['País', P.country], ['Moneda', P.currency], ['Sector', P.sector], ['Fundación', P.founded], ['Sede', P.hq], ['Bursatilidad', P.listed], ['Tiendas', P.stores ? f.n(P.stores) : null], ['Colaboradores', P.employees ? f.n(P.employees) : null], ['Acciones (millones)', m.shares ? f.n(m.shares, 1) : null]] as [string, unknown][]).filter(x => x[1]).map(([k, vv]) => ({ k, v: vv }))
    .concat(applied.filter(i => i.section !== 'Historia').map(i => ({ k: i.field, v: i.value })));
  const gv = ds.governance;
  const emp: any = {
    hasDesc: !!P.description, desc: P.description, facts, hasFormats: !!(P.formats && P.formats.length), formats: P.formats || [],
    timeline: (ds.timeline || []).map(t => ({ date: t[0], title: t[1], desc: t[2], src: t[3] })).concat(applied.filter(i => i.section === 'Historia').map(i => ({ date: i.date || '', title: i.field, desc: i.value, src: 'Investigación · ' + (i.url || '') }))),
    hasGov: !!gv, gov: gv ? { board: gv.board, patrimonial: gv.patrimonial, related: gv.related, independent: gv.independent, ind: gv.independencePct.toFixed(2) + '%', best: gv.bestPractice + '%', pW: (gv.patrimonial / gv.board * 100) + '%', rW: (gv.related / gv.board * 100) + '%', chair: gv.chair, ceo: gv.ceo, committees: gv.committees.map(x => ({ k: x[0], v: x[1] })), controls: gv.controls } : {},
    market: ([['Precio', m.price ? f.cur(m.price) : null], ['Acciones en circulación', m.shares ? f.n(m.shares, 1) + ' mm' : null], ['Capitalización de mercado', m.marketCap ? f.m(m.marketCap) + ' ' + mu : null], ['P/U', m.pe ? f.x(m.pe) : null], ['P/VL', m.pbv ? f.x(m.pbv) : null], ['Rendimiento por dividendo', m.divYield ? m.divYield.toFixed(2) + '%' : null], ['Variación 1 año', m.chg1y ? (m.chg1y >= 0 ? '+' : '') + m.chg1y.toFixed(1) + '%' : null], ['Rango 52 semanas', m.low52 ? f.cur(m.low52) + ' – ' + f.cur(m.high52) : null], ['Consenso de analistas', m.consensus ? f.cur(m.consensus) + ' · ' + m.consensusLabel : null], ['Calificación crediticia', m.rating], ['Señal técnica · RSI (14)', m.technical ? m.technical + ' · ' + m.rsi : null]] as [string, unknown][]).filter(x => x[1]).map(([k, vv]) => ({ k, v: vv })),
    hasDiv: !!(ds.dividends && ds.dividends.length), div: (ds.dividends || []).map(d => ({ a: d[0], b: d[1], c: '$' + d[2].toFixed(4) }))
  };
  emp.hasTimeline = emp.timeline.length > 0;
  const res = { btn: RS && RS.status === 'loading' ? 'Investigando…' : (RS && RS.items && RS.items.length ? 'Investigar de nuevo' : 'Investigar con IA'), has: !!(RS && RS.items && RS.items.length), meta: RS ? 'Investigado el ' + (RS.date || '—') + ' · ' + (RS.via || '') + ' · fuente con fecha de consulta; verificar antes de aplicar.' : '', items: RS ? (RS.items || []).map(it => ({ ...it, date: it.date || '', url: it.url || '#', confidence: it.confidence || '—', pending: it.status === 'pending', stTxt: it.status === 'applied' ? '✓ Aplicada' : it.status === 'discarded' ? '— Descartada' : 'Pendiente', stColor: it.status === 'applied' ? POS : 'var(--color-neutral-700)', onApply: () => app.setResearchItem(it.id, 'applied'), onDiscard: () => app.setResearchItem(it.id, 'discarded') })) : [] };
  const VC = c.valid || [];
  const icon = (s: string) => s === 'pass' ? '✓' : s === 'review' ? '⚠' : '–', stl = (s: string) => s === 'pass' ? 'Validado' : s === 'review' ? 'Revisar' : 'N/A', col = (s: string) => s === 'pass' ? POS : s === 'review' ? 'var(--warn)' : 'var(--color-neutral-700)';
  const gnames = [...new Set(VC.map(x => x.group))];
  const val = {
    note: c.isBase ? (ds.expected ? 'Resultados del motor comparados contra el ' + L.sourceShort + ' (tolerancia de redondeo).' : 'Comprobaciones internas del motor.') : 'Supuestos modificados: la comparación contra el ' + L.sourceShort + ' se habilita al restaurar la base.',
    summary: [{ k: 'Validado', v: VC.filter(x => x.status === 'pass').length, color: POS }, { k: 'Revisar', v: VC.filter(x => x.status === 'review').length, color: 'var(--warn)' }],
    groups: gnames.map(g => ({ name: g === E.SOURCE_GROUP ? 'Comparación contra el ' + L.sourceShort + ' · calculado vs. ' + L.sourceShort : g, items: VC.filter(x => x.group === g).map(x => ({ icon: icon(x.status), st: stl(x.status), color: col(x.status), label: x.label, detail: x.detail || '', calc: x.calc || '', exp: x.exp ? L.sourceShort + ' ' + x.exp : '' })) })),
    hasDisc: false, disc: [],
    discNote: 'No se elige silenciosamente: el modelo usa el ' + L.sourceShort + (ds.builtIn ? ' definitivo' : '') + ' y documenta la otra versión.'
  };
  const formulas = [
    ['CAPM', 'Ke = Rf + βL × PRM', 'Costo del capital propio.'], ['Beta apalancada', 'βL = βU × [1 + (1 − t) × D/E]', 'Ajusta el riesgo sistemático por la estructura de capital.'],
    ['WACC', 'WACC = E/(D+E)·Ke + D/(D+E)·Kd(1−t)', 'Tasa de descuento de los FCF.'], ['WACC iterado', 'E = EV(WACC) − deuda neta → D/E → βL → Ke → WACC', 'Se repite hasta converger.'],
    ['NOPAT', 'NOPAT = EBIT × (1 − t)', 'Utilidad operativa después de impuestos.'], ['FCF', 'FCF = NOPAT + D&A − Capex − ΔNWC', 'Flujo libre para proveedores de capital.'],
    ['Valor terminal · Gordon', 'TV = FCFₙ × (1 + g) / (WACC − g)', 'Flujos posteriores al periodo explícito.'], ['Valor terminal · múltiplo', 'TV = EBITDAₙ × múltiplo EV/EBITDA', 'Método de salida por comparables.'],
    ['Enterprise Value', 'EV = Σ FCFₜ/(1+WACC)ᵗ + TV/(1+WACC)ⁿ', 'Valor de la operación.'], ['Ponderación', 'EV = w·EV Gordon + (1 − w)·EV múltiplo', 'Combina ambos métodos.'],
    ['Fecha de valuación', 'EV₂ = EV × (1+WACC)^t₁ − FCF del periodo intermedio; E = (EV₂ − D + C) × (1+Ke)^t₂', 'Lleva el valor del cierre a la fecha de valuación. Si el FCF del periodo fue negativo, restarlo aumenta el EV.'], ['Valor por acción', 'Valor = Equity / acciones; Potencial = Valor / Precio − 1', 'Resultado e interpretación.']
  ].map((x, i) => ({ n: String(i + 1).padStart(2, '0'), k: x[0], f: x[1], d: x[2] }));
  const sources = (ds.sources || []).map(s => ({ a: s[0], b: s[1], c: s[2] }));

  // ----- Mis valuaciones -----
  const libCards = companyList.map(({ x, rr }) => ({
    name: x.profile.name, meta: x.profile.ticker + ' · ' + x.profile.exchange + ' · ' + x.profile.currency, hasLogo: !!x.profile.logo, noLogo: !x.profile.logo, logo: x.profile.logo || '', brand: x.profile.brand || ACC, initials: initialsOf(x.profile.short || x.profile.name), tag: x.builtIn ? 'Caso presentado' : 'Importada', tagCls: x.builtIn ? 'tag-accent' : 'tag-neutral', valTxt: rr.ok ? f.cur(rr.value) : '—', upTxt: rr.ok && rr.upside != null ? f.pp(rr.upside) : '—', upColor: rr.ok && (rr.upside ?? 0) >= 0 ? POS : NEG, created: (x.builtIn ? 'Modelo académico · ' : 'Creada ') + String(x.createdAt).slice(0, 10) + ' · ' + x.version, border: x.id === S.activeId ? ACC : 'var(--color-divider)', canDel: !x.builtIn,
    onOpen: () => { app.switchCompany(x.id); app.go('p1'); },
    onDup: () => { const cp: Dataset = JSON.parse(JSON.stringify(x)); cp.id = 'c' + Date.now().toString(36); cp.builtIn = false; cp.profile.name = x.profile.name + ' (copia)'; cp.createdAt = new Date().toISOString(); cp.updatedAt = cp.createdAt; cp.version = 'Copia de ' + x.version; store.setA(cp.id, store.getA(x.id)); app.saveCompanies([...app.state.companies, cp]); app.flash('Valuación duplicada'); },
    onJson: () => app.exportJson(x, x.id === S.activeId ? SA : { ...E.defaults(x), ...(store.getA(x.id) || {}) }),
    onDel: () => { if (!confirm('¿Eliminar la valuación de ' + x.profile.name + '?')) return; store.setA(x.id, null); const list = app.state.companies.filter(y => y.id !== x.id); app.saveCompanies(list); if (S.activeId === x.id) app.switchCompany(DEFAULT_ID); }
  }));

  // ----- Importación -----
  const I = S.imp || app.newImp();
  const STEPS = ['Archivo', 'Detectar', 'Mapear', 'Supuestos', 'Crear'];
  const block = S.imp ? app.impBlock() : [];
  let preview: RunResult | null = null; if (S.imp && I.step === 5 && !block.length) { try { const dsx = app.impBuild(); preview = E.run(dsx, E.defaults(dsx)); } catch { preview = null; } }
  const setF = (k: string, val: string | null) => app.setImp({ fields: { ...app.state.imp!.fields, [k]: val }, touched: { ...app.state.imp!.touched, [k]: true } });
  const PF: any[] = I.parsed ? I.parsed.fields : FIELDS.map(F => ({ ...F, cands: [], conf: 'Sin dato', period: '—' }));
  const imp = {
    title: I.step === 1 ? '¿Cómo quieres comenzar?' : I.step === 2 ? 'Datos detectados' : I.step === 3 ? 'Revisar y mapear' : I.step === 4 ? 'Identidad y supuestos' : 'Crear valuación',
    steps: STEPS.map((l, i) => ({ n: i + 1, label: l, bg: I.step === i + 1 ? ACC : I.step > i + 1 ? 'var(--color-accent-100)' : 'transparent', color: I.step === i + 1 ? 'var(--color-bg)' : I.step > i + 1 ? 'var(--color-accent-800)' : 'var(--color-neutral-700)' })),
    s1: I.step === 1, s2: I.step === 2, s3: I.step === 3, s4: I.step === 4, s5: I.step === 5, parsing: !!I.parsing, hasError: !!I.error, error: I.error || '', dropBg: S.drag ? 'var(--color-accent-100)' : 'transparent',
    meta: I.parsed ? ([['Empresa', I.parsed.meta.name || 'No detectada'], ['Ticker', I.parsed.meta.ticker || 'No detectado'], ['Mercado', I.parsed.meta.exchange || 'No detectado'], ['Moneda', I.parsed.meta.currency || 'No detectada'], ['Unidades', I.parsed.meta.units || 'No detectadas'], ['Periodos', I.parsed.periods.length + ' detectados · ' + I.parsed.periods.slice(-4).join(', ')], ['Hojas', I.parsed.sheets.length + ' · ' + I.parsed.sheets.map(s => s.name).slice(0, 6).join(', ')], ['Archivo', I.parsed.fileName]]).map(([k, vv]) => ({ k, v: vv })) : [],
    coverage: I.parsed ? Math.round(I.parsed.coverage * 100) + '%' : '—', coverageTxt: I.parsed ? I.parsed.mapped + ' de ' + I.parsed.total + ' campos fueron identificados automáticamente con confianza alta o media.' : '',
    sections: I.parsed ? I.parsed.detected.map(s => ({ name: s.name, icon: s.found ? '✓' : '—', color: s.found ? POS : 'var(--color-neutral-600)' })) : [],
    fields: PF.map(F => { const has = I.fields[F.key] != null && I.fields[F.key] !== ''; const conf = I.touched[F.key] ? 'Manual' : F.conf; return { label: F.label, reqMark: F.req ? ' *' : '', sel: String(I.sel[F.key] ?? -1), options: (F.cands || []).map((o: any) => ({ id: String(o.id), label: o.label + ' · ' + o.sheet + ' · ' + o.period })), onSel: (e: { target: { value: string } }) => { const id = +e.target.value; const cand = (F.cands || [])[id]; app.setImp({ sel: { ...app.state.imp!.sel, [F.key]: id }, fields: { ...app.state.imp!.fields, [F.key]: cand ? cand.value : null }, touched: { ...app.state.imp!.touched, [F.key]: true } }); }, value: has ? I.fields[F.key] : '', onVal: (e: { target: { value: string } }) => setF(F.key, e.target.value === '' ? null : e.target.value), period: F.period || '—', conf, confCls: conf === 'Alta' ? 'tag-accent' : conf === 'Media' || conf === 'Manual' ? 'tag-neutral' : 'tag-outline', st: has ? (conf === 'Alta' || conf === 'Manual' ? '✓ Listo' : '⚠ Requiere revisión') : (F.req ? '✕ Falta' : '— Opcional'), stColor: has ? (conf === 'Alta' || conf === 'Manual' ? POS : 'var(--warn)') : (F.req ? NEG : 'var(--color-neutral-700)') }; }),
    hasLogo: !!I.id.logo, noLogo: !I.id.logo, logo: I.id.logo || '', initials: initialsOf(I.id.name || '?'), logoTxt: I.logoTxt,
    idFields: ([['name', 'Nombre de la empresa', true, 'Microsoft Corporation'], ['ticker', 'Ticker', true, 'MSFT'], ['exchange', 'Mercado', false, 'NasdaqGS'], ['currency', 'Moneda', false, 'USD'], ['sector', 'Sector', false, 'Software'], ['domain', 'Sitio web', false, 'microsoft.com']] as const).map(([k, l, req, ph]) => ({ label: l, reqMark: req ? ' *' : '', value: I.id[k] || '', ph, onChange: (e: { target: { value: string } }) => app.setImp({ id: { ...app.state.imp!.id, [k]: e.target.value } }) })),
    aFields: ([['rf', 'Tasa libre de riesgo (%)', true], ['prm', 'Prima de riesgo de mercado (%)', true], ['betaU', 'Beta desapalancada', false], ['betaL', 'Beta apalancada', false], ['g', 'Crecimiento perpetuo g (%)', true], ['growth', 'Crecimiento anual de ventas (%)', true], ['margin', 'Margen EBIT (%)', true], ['taxF', 'Tasa de impuestos (%)', true], ['daPct', 'D&A (% ventas)', true], ['capexPct', 'Capex (% ventas)', true]] as const).map(([k, l, req]) => ({ label: l, reqMark: req ? ' *' : '', value: I.a[k] ?? '', hint: I.hints[k] || '', border: req && (I.a[k] == null || I.a[k] === '') ? 'var(--warn)' : 'var(--color-divider)', onChange: (e: { target: { value: string } }) => app.setImp({ a: { ...app.state.imp!.a, [k]: e.target.value === '' ? null : e.target.value } }) })),
    summary: ([['Empresa', I.id.name || '—'], ['Ticker', (I.id.ticker || '—') + ' · ' + (I.id.exchange || '—')], ['Moneda', I.id.currency || '—'], ['Periodo base', (PF.find(x => x.key === 'revenue') || {}).period || 'Manual'], ['Campos con dato', Object.values(I.fields).filter(x => x != null && x !== '').length + ' / ' + FIELDS.length], ['Pendientes', String(block.length)]]).map(([k, vv]) => ({ k, v: vv })),
    hasBlock: block.length > 0, block, hasPreview: !!(preview && preview.ok), previewValue: preview && preview.ok ? f.cur(preview.value) : '', previewUp: preview && preview.ok && preview.upside != null ? f.pp(preview.upside) : '', previewColor: preview && preview.ok && (preview.upside ?? 0) >= 0 ? POS : NEG, previewWacc: preview && preview.ok ? f.p(preview.wacc) : '',
    backTxt: I.step === 1 ? 'Cancelar' : '← Atrás', onBack: () => I.step === 1 ? (app.setState({ imp: null }), app.go('library')) : app.setImp({ step: I.step - 1 }),
    showNext: I.step > 1, nextTxt: I.step === 5 ? 'Crear valuación' : 'Continuar →', nextDisabled: I.step === 5 && block.length > 0,
    onNext: () => I.step === 5 ? app.createFromImp() : app.setImp({ step: I.step + 1 })
  };

  // ----- Drawer -----
  let drawer: any = { open: false, steps: [] };
  if (S.drawer && b.ok) {
    const W = b.W, src = A.waccMode === 'market' ? W.market : (W.iterated || W.market), st = (k: string, vv: string, fx?: string, o?: object) => ({ k, v: vv, f: fx || '', fw: 500, color: 'var(--color-text)', ...(o || {}) }), tot = { fw: 700, color: ACC };
    const last = b.rows[b.rows.length - 1];
    const map: Record<string, [string, any[], string]> = {
      value: ['Valor intrínseco por acción', [st('EV · Gordon', f.m(b.evG, 1), 'VPN FCF + VP valor terminal Gordon')].concat(b.mult ? [st('EV · múltiplos', f.m(b.evM, 1), 'VPN FCF + VP de EBITDA × ' + f.x(b.mult)), st('EV ponderado', f.m(b.evW, 1), Math.round(b.wG * 100) + '% Gordon + ' + Math.round((1 - b.wG) * 100) + '% múltiplo')] : []).concat(b.roll ? [st('EV al ' + L.rollDate, f.m(b.roll.ev2, 1), 'EV × (1+WACC)^' + b.roll.t1 + ' − FCF ' + L.rollFcf + ' (' + f.m(-b.roll.fcfGenerated, 1) + ')'), st('Equity al ' + L.rollDate, f.m(b.roll.eq2, 1), '− deuda ' + f.m(b.roll.debt, 1) + ' − arrendamiento ' + f.m(b.roll.lease, 1) + ' + efectivo ' + f.m(b.roll.cash, 1)), st('Equity a la fecha de valuación', f.m(b.eqVal, 1), '× (1 + Ke ' + f.p(b.ke) + ')^' + b.roll.t2)] : [st('Equity Value', f.m(b.eqVal, 1), 'EV − deuda neta ' + f.m(b.nd, 1))]).concat([st('Acciones en circulación', f.n(b.shares, 1) + ' mm', 'Dato de mercado'), st('Valor intrínseco por acción', f.cur(b.value), 'Equity / acciones', tot), st('Potencial', b.upside != null ? f.pp(b.upside) : '—', 'Valor / precio ' + f.cur(b.price) + ' − 1')]), 'dcf'],
      ev: ['Enterprise Value', [st('VPN FCF ' + b.rows[0].year + '–' + last.year, f.m(b.pvSum, 1), 'Σ FCFₜ / (1 + WACC)ᵗ'), st('VP valor terminal · Gordon', f.m(b.pvTvG, 1), 'TV ' + f.m(b.tvG, 1) + ' × factor ' + last.df.toFixed(4)), st('EV · Gordon', f.m(b.evG, 1), '', tot)].concat(b.mult ? [st('VP valor terminal · múltiplo', f.m(b.pvTvM, 1), 'EBITDA ' + f.m(last.ebitda, 1) + ' × ' + f.x(b.mult)), st('EV · múltiplos', f.m(b.evM, 1), '', tot), st('EV ponderado', f.m(b.evW, 1), Math.round(b.wG * 100) + '% / ' + Math.round((1 - b.wG) * 100) + '%', tot)] : []).concat([st('Deuda neta', f.m(b.nd, 1), 'Deuda + arrendamientos − efectivo'), st('Equity Value al cierre', f.m(b.eqClose, 1), 'EV − deuda neta', tot)]), 'dcf'],
      wacc: ['WACC', [st('Tasa libre de riesgo', f.p(W.rf), 'Rf'), st('Beta desapalancada', W.betaU.toFixed(2), 'βU sectorial'), st('D / E', f.x(src.de, 4), A.waccMode === 'market' ? 'Deuda / capital de mercado' : 'Deuda / equity del DCF'), st('Beta apalancada', src.beta.toFixed(4), 'βU × [1 + (1 − t) × D/E]'), st('Prima de riesgo', f.p(W.prm), 'PRM'), st('Ke', f.p(src.ke), 'Rf + βL × PRM', tot), st('Kd después de impuestos', f.p(src.kdAT), f.p(src.kd) + ' × (1 − ' + f.p(src.tax) + ')'), st('Pesos', f.p(src.wE, 1) + ' / ' + f.p(src.wD, 1), 'E/(D+E) · D/(D+E)'), st('WACC', f.p(b.wacc), A.waccMode === 'manual' ? 'Supuesto manual' : 'E/(D+E)·Ke + D/(D+E)·Kd(1−t)', tot)], 'wacc'],
      tv: ['Valor terminal', [st('FCF ' + last.year, f.m(last.fcf, 1), 'Último año explícito'), st('FCF siguiente año', f.m(b.fcfN1, 1), '× (1 + g ' + f.p(b.g) + ')'), st('WACC − g', f.p(b.wacc - b.g), f.p(b.wacc) + ' − ' + f.p(b.g)), st('Valor terminal', f.m(b.tvG, 1), 'FCFₙ₊₁ / (WACC − g)', tot), st('Valor presente', f.m(b.pvTvG, 1), '× 1/(1+WACC)ⁿ'), st('Peso en el EV', f.p(b.tvWeightG, 1), 'VP TV / EV Gordon')], 'dcf']
    };
    const d = map[S.drawer] || map.value;
    drawer = { open: true, title: d[0], steps: d[1], note: 'Todos los valores se recalculan con los supuestos activos. Cifras en ' + mu + ' salvo indicación.', goAnnex: () => { app.setState({ drawer: null }); app.go('annex', d[2]); } };
  }
  const rel = b.ok ? relativeView(app, ds, A, b) : { has: false, mult: { has: false }, comb: { has: false } };
  const pi = SEQ.indexOf(view);
  const arch = [['01', 'Excel', 'SORIANA_FINAL.xlsx: series, estados, supuestos y resultados de referencia'], ['02', 'Dataset', 'scripts/build-dataset.py lee el Excel con openpyxl (nada se teclea)'], ['03', 'Motor', 'Inflación, beta, escenarios, DCF con WACC iterado, validación'], ['04', 'Reporte', 'Mismas tablas y gráficas en pantalla, PDF, Excel y CSV'], ['05', 'Paquete', 'ZIP con PDF, XLSX, CSV, JSON y gráficas PNG + SVG']].map(([n, k, d], i) => ({ n, k, d, bg: i === 2 ? ACC : 'transparent', color: i === 2 ? 'var(--color-bg)' : 'var(--color-text)', border: i === 2 ? ACC : 'var(--color-divider)' }));

  return {
    loading: false, v, cv, co, r, author, logos: LOGO_URI, ui, risk, study, goStudy: go('study'),
    progress: S.exporting ? { show: true, title: S.exporting.title, msg: S.exporting.msg, pct: Math.round(S.exporting.p * 100) + '%' } : { show: false }, companyList, navItems, mobileNav, exportItems, track, kpis, football, wf, insights,
    fcfChart, fcfSel, sales, methodSteps, hasMethod: !!ds.forecast.build, weights, extNet, extTop, extCount, tv, wb, iter, heat, torn, scen, scenNote, hasScen, lab,
    mult: rel.mult, trans: (rel as any).trans || { has: false }, comb: rel.comb, inflFlow: [], hasInflFlow: false, betaT: [], hasBeta: false,
    goP4: go('p4'), goP5: go('p5'), goP6: go('p6'), goAnnexInfl: go('study'), goAnnexBeta: go('study'),
    annexNav, annexTables: annexTablesV, ax, emp, res, val, formulas, sources, libCards, imp, drawer, arch,
    pres: { on: S.presenting, label: (pi >= 0 ? SEQ_N[pi] : 'Fuera de secuencia') + ' · ' + (pi + 1) + '/' + SEQ.length, progress: ((pi + 1) / SEQ.length * 100) + '%', prev: () => app.presStep(-1), next: () => app.presStep(1), exit: () => app.exitPresent() },
    toast: { show: !!S.toast, t: S.toast || '' },
    startTour: () => app.go('p1'), startPresent: () => app.startPresent(), goCover: go('cover'), goImport: () => { app.setState({ imp: app.newImp() }); app.go('import'); }, goLibrary: go('library'),
    goP1: go('p1'), goP2: go('p2'), goP3: go('p3'), goLab: go('lab'), goAnnexMethod: go('annex', ds.forecast.build ? 'pond' : 'dcf'), goAnnexMet: go('annex', 'method'),
    toggleCompanyMenu: () => app.setState({ menu: S.menu === 'company' ? null : 'company' }), toggleExportMenu: () => app.setState({ menu: S.menu === 'export' ? null : 'export' }),
    resetA: () => app.resetA(), openDrawerValue: () => app.setState({ drawer: 'value' }), openDrawerEV: () => app.setState({ drawer: 'ev' }), openDrawerWacc: () => app.setState({ drawer: 'wacc' }), closeDrawer: () => app.setState({ drawer: null }),
    runResearch: () => app.runResearch(),
    onFile: (e: { target: HTMLInputElement }) => app.handleFile(e.target.files && e.target.files[0]),
    onDragOver: (e: DragEvent) => { e.preventDefault(); if (!S.drag) app.setState({ drag: true }); },
    onDrop: (e: DragEvent) => { e.preventDefault(); app.setState({ drag: false }); app.handleFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); },
    onJsonFile: (e: { target: HTMLInputElement }) => app.importJson(e.target.files && e.target.files[0]),
    startManual: () => { const fields: Record<string, null> = {}; FIELDS.forEach(F => fields[F.key] = null); app.setImp({ step: 3, parsed: null, fields, sel: {}, hints: { rf: 'Requerido', prm: 'Requerido', g: 'Requerido · menor que el WACC' } }); },
    findLogo: () => app.findLogo(), onLogoFile: (e: { target: HTMLInputElement }) => { const fl = e.target.files && e.target.files[0]; if (!fl) return; const rd = new FileReader(); rd.onload = async () => { const brand = await brandColor(rd.result as string); app.setImpId({ logo: rd.result as string, ...(brand ? { brand } : {}) }, { logoTxt: 'Logo cargado manualmente' }); }; rd.readAsDataURL(fl); },
    copyMarketParams: () => app.setImp({ a: { ...app.state.imp!.a, rf: SA.rf, prm: SA.prm, betaU: SA.betaU }, hints: { ...app.state.imp!.hints, rf: 'Copiado de ' + co.short + ' · verificar país', prm: 'Copiado de ' + co.short, betaU: 'Copiado de ' + co.short + ' · beta sectorial' + (P.sector ? ' (' + P.sector + ')' : '') } })
  };
}

/** Nombre del caso que se muestra: Base (supuestos del Excel), el escenario elegido o "Laboratorio" si hay más cambios. */
function caseName(c: Calc): string {
  if (c.isBase) return 'Base';
  const act = (c.scen || []).find(s => s.active);
  const onlyScen = c.bundle ? c.bundle.changes.every(x => /^(Escenario|Inflación|Ajuste|Beta apalancada|Crecimiento perpetuo)/.test(x[0])) : false;
  return act && onlyScen ? act.label : 'Laboratorio';
}
/** Cifras de la portada: precio y fecha, rango de escenarios, recomendación y precio combinado. */
function coverFacts(c: Calc, b: RunOk) {
  const sp = (c.scen || []).map(s => s.m?.price).filter((x): x is number => x != null), out: { k: string; v: string }[] = [];
  out.push({ k: 'Precio de mercado (' + (c.VA.valuationDate ? isoToText(c.VA.valuationDate) : c.ds.dates.price) + ')', v: f.cur(b.price) + ' MXN' });
  if (sp.length) out.push({ k: 'Rango de escenarios', v: f.cur(Math.min(...sp)) + ' a ' + f.cur(Math.max(...sp)) + ' MXN' });
  out.push({ k: 'Diferencia', v: f.pp(b.upside) + ' · ' + (b.signal ?? '') });
  const cb = c.bundle?.rel?.combined?.value; if (typeof cb === 'number') out.push({ k: 'Precio combinado', v: f.cur(cb) + ' MXN' });
  return out;
}

/** Valor para un <input type="number"> controlado: vacío si no es un número válido. */
function numIn(v: number | null | undefined): number | string { return typeof v === 'number' && isFinite(v) ? v : ''; }

/** Fuente por insumo según el registro de insumos del dataset (hoja Fuentes del Excel), si existe. */
function srcRegistry(ds: Dataset): Record<string, string> {
  const out: Record<string, string> = {};
  const tag = (k: string, re: RegExp) => { const hit = (ds.inputs || []).find(r => re.test(r[0])); if (hit) out[k] = hit[5] + ' · ' + hit[6]; };
  tag('rf', /libre de riesgo|^Rf/i); tag('prm', /Prima de riesgo/i); tag('betaU', /Beta/i); tag('kdPre', /^Kd/i); tag('g', /perpetuo/i);
  return out;
}
