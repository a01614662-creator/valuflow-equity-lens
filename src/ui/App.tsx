// Controlador de la aplicación: estado, navegación, persistencia e importación.
// Toda la presentación se arma en viewmodel.ts y se dibuja en pages/*.tsx.
import { Component } from 'react';
import * as E from '../engine';
import type { Assumptions, Dataset, RunResult } from '../engine';
import { BUILT_IN, DEFAULT_ID, checkDataset } from '../data/registry';
import { store } from '../services/store';
import { FIELDS, buildFromImport, parseWorkbook, type Parsed, type ParsedLite } from '../services/importer';
import { getXLSX, printPanel } from '../services/exporter';
import { brandColor, findLogo, research, type Research } from '../services/research';
import { buildView, type Calc } from './viewmodel';
import { Shell } from './Shell';

export const SEQ = ['cover', 'p1', 'p2', 'p3', 'p4', 'p5', 'lab'];
export const SEQ_N = ['Portada', '01 · Valor', '02 · Flujos', '03 · Riesgo', '04 · Múltiplos', '05 · Combinada', 'Laboratorio'];
const VIEWS = ['cover', 'p1', 'p2', 'p3', 'p4', 'p5', 'lab', 'annex', 'team', 'library'];

export interface ImpState {
  step: number; parsing: boolean; error: string | null; parsed: Parsed | null;
  fields: Record<string, number | string | null>; sel: Record<string, number>; touched: Record<string, boolean>;
  id: { name: string; ticker: string; exchange: string; currency: string; sector: string; domain: string; logo: string | null; brand: string | null };
  a: Record<string, number | string | null>; hints: Record<string, string>; logoTxt: string;
}

export interface AppState {
  ready: boolean; view: string; annexId: string | null; activeId: string; companies: Dataset[]; A: Assumptions | null;
  menu: string | null; drawer: string | null; toast: string | null; busy: boolean; reveal: boolean; heroDisp: number;
  presenting: boolean; printing: string | null; fcfSel: number; step: number; mobile: boolean; imp: ImpState | null;
  research: Record<string, Research>; drag: boolean;
}

export class App extends Component<object, AppState> {
  state: AppState = { ready: false, view: 'cover', annexId: null, activeId: DEFAULT_ID, companies: [], A: null, menu: null, drawer: null, toast: null, busy: false, reveal: false, heroDisp: 0, presenting: false, printing: null, fcfSel: 0, step: 0.5, mobile: false, imp: null, research: {}, drag: false };

  // Cálculo en caché (una sola fuente de verdad por render).
  _c: Calc | null = null; _ck: string | null = null;
  _lastGood: { id: string; r: RunResult; A: Assumptions } | null = null;
  _tw: number | null = null; _raf = 0;
  _rv?: ReturnType<typeof setTimeout>; _bt?: ReturnType<typeof setTimeout>; _tt?: ReturnType<typeof setTimeout>;
  mq?: MediaQueryList;
  onMq = () => this.setState({ mobile: !!this.mq?.matches });
  onAfterPrint = () => this.setState({ printing: null });
  onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && /INPUT|SELECT|TEXTAREA/.test(t.tagName)) return;
    if (e.key === 'Escape') { if (this.state.drawer) this.setState({ drawer: null }); else if (this.state.presenting) this.exitPresent(); else this.setState({ menu: null }); }
    if (!this.state.presenting) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); this.presStep(1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); this.presStep(-1); }
  };

  componentDidMount() {
    this.boot();
    this.mq = window.matchMedia('(max-width: 860px)'); this.onMq(); this.mq.addEventListener('change', this.onMq);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('afterprint', this.onAfterPrint);
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKey); window.removeEventListener('afterprint', this.onAfterPrint);
    this.mq && this.mq.removeEventListener('change', this.onMq); cancelAnimationFrame(this._raf);
  }
  componentDidUpdate() {
    const c = this._c; if (!c) return;
    const tgt = c.view && c.view.ok ? c.view.value : null;
    if (tgt != null && tgt !== this._tw) { this._tw = tgt; this.tween(this.state.heroDisp || tgt * 0.7, tgt); }
  }
  tween(from: number, to: number) {
    cancelAnimationFrame(this._raf); const t0 = performance.now(), d = 900;
    const step = (t: number) => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); this.setState({ heroDisp: from + (to - from) * e }); if (k < 1) this._raf = requestAnimationFrame(step); };
    this._raf = requestAnimationFrame(step);
  }

  boot() {
    const companies = [...BUILT_IN, ...store.list()];
    let id = store.active(); if (!companies.find(c => c.id === id)) id = DEFAULT_ID;
    let view = store.view() || 'cover';
    if (!VIEWS.includes(view)) view = 'cover';
    const researchMap: Record<string, Research> = {};
    companies.forEach(c => { const r = store.getResearch<Research>(c.id); if (r) researchMap[c.id] = r; });
    this.setState({ ready: true, companies, activeId: id, A: this.loadA(companies, id), view, research: researchMap }, () => this.enter());
  }
  ds(id?: string): Dataset { return this.state.companies.find(c => c.id === (id || this.state.activeId)) || this.state.companies[0]; }
  loadA(companies: Dataset[], id: string): Assumptions { const ds = companies.find(c => c.id === id)!; return { ...E.defaults(ds), ...(store.getA(id) || {}) }; }
  enter() {
    this.setState({ reveal: false, heroDisp: this._c && this._c.view && this._c.view.ok ? this._c.view.value * 0.72 : 0 }); this._tw = null;
    clearTimeout(this._rv); this._rv = setTimeout(() => this.setState({ reveal: true }), 90);
    try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch { /* sin ventana */ }
  }
  go(view: string, annexId?: string | null) {
    if (view !== 'import') store.setView(view);
    this.setState({ view, annexId: annexId !== undefined ? annexId : this.state.annexId, menu: null, drawer: null }, () => this.enter());
  }
  setA(patch: Partial<Assumptions>, silent?: boolean) {
    const A = { ...(this.state.A as Assumptions), ...patch }; store.setA(this.state.activeId, A);
    this.setState({ A, busy: true }); clearTimeout(this._bt); clearTimeout(this._tt);
    this._bt = setTimeout(() => this.setState({ busy: false, toast: silent ? null : 'Valuación actualizada' }), 420);
    this._tt = setTimeout(() => this.setState({ toast: null }), 2400);
  }
  resetA() { store.setA(this.state.activeId, null); this.setState({ A: E.defaults(this.ds()), toast: 'Valores base restaurados' }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: null }), 2200); }
  flash(t: string) { this.setState({ toast: t }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: null }), 2600); }
  switchCompany(id: string) { store.setActive(id); this.setState({ activeId: id, A: this.loadA(this.state.companies, id), menu: null, fcfSel: 0, annexId: null }, () => this.enter()); }
  saveCompanies(list: Dataset[]) { this.setState({ companies: list }); store.save(list.filter(c => !c.builtIn)); }

  // ---------- Presentación / impresión ----------
  startPresent() { const i = SEQ.indexOf(this.state.view); this.setState({ presenting: true }); this.go(i >= 0 ? this.state.view : 'cover'); try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch { /* no permitido */ } }
  exitPresent() { this.setState({ presenting: false }); try { document.fullscreenElement && document.exitFullscreen(); } catch { /* no permitido */ } }
  presStep(d: number) {
    // Las páginas de múltiplos solo forman parte de la presentación si el dataset las documenta.
    const ds = this.ds(), seq = SEQ.filter(x => (x !== 'p4' && x !== 'p5') || !!(ds.comps || ds.combined));
    const i = Math.max(0, seq.indexOf(this.state.view)); const n = Math.min(seq.length - 1, Math.max(0, i + d)); if (n !== i) this.go(seq[n]);
  }
  print(mode: 'summary' | 'full') { this.setState({ printing: mode, menu: null, reveal: true }); const p = () => { try { window.print(); } catch { /* bloqueado */ } }; setTimeout(() => { p(); printPanel(p); }, 600); }

  // ---------- Cálculo central (una sola fuente de verdad) ----------
  calc(): Calc {
    const ds = this.ds(), A = this.state.A as Assumptions;
    const key = ds.id + '|' + ds.updatedAt + '|' + JSON.stringify(A) + '|' + this.state.step;
    if (this._ck === key && this._c) return this._c;
    const D = E.defaults(ds), base = E.run(ds, A);
    const isBase = E.isDefault(ds, A);
    const base0 = isBase ? base : E.run(ds, D);
    if (base.ok) this._lastGood = { id: ds.id, r: base, A };
    // Si los supuestos actuales no permiten calcular, se muestra el último resultado válido (con aviso).
    const view = base.ok ? base : (this._lastGood && this._lastGood.id === ds.id ? this._lastGood.r : base0);
    const VA = base.ok ? A : (this._lastGood && this._lastGood.id === ds.id ? this._lastGood.A : D);
    const c: Calc = { ds, A, D, base, base0, isBase, view, VA };
    if (view.ok) {
      c.grid = E.grid(ds, VA, view, this.state.step, this.state.step);
      c.torn = E.tornado(ds, VA, view); c.scen = E.scenarios(ds, VA, view); c.methods = E.methods(ds, VA, view);
      // La comparación contra el Excel también aplica a cada escenario de inflación documentado (tiene su columna de referencia).
      const cmp = base.ok && E.isDefault(ds, { ...A, inflation: D.inflation }) && (!A.inflation || !ds.expectedScenarios || !!ds.expectedScenarios[A.inflation]);
      c.ins = E.insights(ds, VA, view, c.torn); c.valid = E.validate(ds, VA, view, cmp);
    }
    this._ck = key; this._c = c; return c;
  }

  // ---------- Importador ----------
  newImp(extra?: Partial<ImpState>): ImpState {
    return { step: 1, parsing: false, error: null, parsed: null, fields: {}, sel: {}, touched: {}, id: { name: '', ticker: '', exchange: '', currency: '', sector: '', domain: '', logo: null, brand: null }, a: {}, hints: {}, logoTxt: 'Sin logo: se mostrará un monograma.', ...(extra || {}) };
  }
  // Siempre sobre el estado más reciente: React agrupa actualizaciones y this.state puede ir un paso atrás.
  setImp(p: Partial<ImpState>) { this.setState(s => ({ imp: { ...(s.imp as ImpState), ...p } })); }
  setImpId(p: Partial<ImpState['id']>, extra?: Partial<ImpState>) { this.setState(s => ({ imp: { ...(s.imp as ImpState), ...(extra || {}), id: { ...(s.imp as ImpState).id, ...p } } })); }
  async handleFile(file?: File | null) {
    if (!file) return;
    if (!/\.(xls|xlsx|csv)$/i.test(file.name)) { this.setImp({ error: 'Formato no compatible. Usa un archivo XLS, XLSX o CSV.' }); return; }
    const XLSX = getXLSX();
    if (!XLSX) { this.setImp({ error: 'El lector de hojas de cálculo aún no está disponible. Intenta de nuevo en unos segundos.' }); return; }
    this.setImp({ parsing: true, error: null });
    try {
      const buf = await file.arrayBuffer();
      const wb = /\.csv$/i.test(file.name) ? XLSX.read(new TextDecoder().decode(buf), { type: 'string' }) : XLSX.read(buf, { type: 'array' });
      const P = parseWorkbook(wb, file.name, XLSX);
      if (!P.rowsCount) throw new Error('No se encontraron filas con periodos y valores numéricos.');
      const fields: ImpState['fields'] = {}, sel: ImpState['sel'] = {};
      P.fields.forEach(f => { fields[f.key] = f.value; sel[f.key] = f.cands.length && f.value != null ? 0 : -1; });
      const id = { name: P.meta.name || '', ticker: P.meta.ticker || '', exchange: P.meta.exchange || '', currency: P.meta.currency || '' };
      const { a, hints } = this.deriveA(P, fields);
      this.setImpId(id, { step: 2, parsing: false, parsed: P, fields, sel, a, hints });
      if (id.name) this.findLogo(id.name);
    } catch (e) { this.setImp({ parsing: false, error: 'No fue posible leer el archivo: ' + ((e as Error).message || 'formato desconocido') + '.' }); }
  }
  /** Propone drivers a partir del archivo. Rf, PRM, beta y g nunca se infieren. */
  deriveA(P: Parsed, F: ImpState['fields']) {
    const a: ImpState['a'] = {}, hints: ImpState['hints'] = {}, v = (k: string) => F[k] != null ? +(F[k] as number) : null, rev = v('revenue');
    const h = (P.fields.find(f => f.key === 'revenue') || { hist: [] }).hist || [];
    const hs = h.filter(x => x.year).sort((x, y) => (x.year as number) - (y.year as number)).slice(-4);
    if (hs.length >= 2 && hs[0].v > 0) { const n = (hs[hs.length - 1].year as number) - (hs[0].year as number); a.growth = +((Math.pow(hs[hs.length - 1].v / hs[0].v, 1 / n) - 1) * 100).toFixed(2); hints.growth = 'Derivado: CAGR ' + hs[0].year + '–' + hs[hs.length - 1].year + ' del archivo'; }
    else hints.growth = 'Requerido: no hay suficiente historia';
    if (rev && v('ebit') != null) { a.margin = +((v('ebit') as number) / rev * 100).toFixed(2); hints.margin = 'Derivado: EBIT / ingresos del último año'; }
    if (v('incomeTax') != null && (v('ebt') ?? 0) > 0) { a.taxF = +((v('incomeTax') as number) / (v('ebt') as number) * 100).toFixed(2); hints.taxF = 'Derivado: tasa efectiva del archivo'; } else hints.taxF = 'Requerido';
    if (rev && v('da') != null) { a.daPct = +((v('da') as number) / rev * 100).toFixed(2); hints.daPct = 'Derivado: D&A / ingresos'; }
    if (rev && v('capex') != null) { a.capexPct = +((v('capex') as number) / rev * 100).toFixed(2); hints.capexPct = 'Derivado: capex / ingresos'; }
    if (v('beta') != null) { a.betaL = v('beta'); hints.betaL = 'Detectado en el archivo (apalancada)'; } else hints.betaL = 'Si la conoces; se desapalanca con D/E de mercado';
    hints.rf = 'Requerido · bono gubernamental del país'; hints.prm = 'Requerido · prima de riesgo de mercado'; hints.g = 'Requerido · debe ser menor que el WACC'; hints.betaU = 'Beta desapalancada (o captura la apalancada)';
    return { a, hints };
  }
  async findLogo(name?: string) {
    const imp = this.state.imp as ImpState;
    const nm = name || imp.id.name; if (!nm) return;
    this.setImp({ logoTxt: 'Buscando logo en Wikidata…' });
    const r = await findLogo(nm);
    if (!this.state.imp) return; // el usuario salió del asistente
    const cur = this.state.imp;
    if (r) { const brand = await brandColor(r.url); if (!this.state.imp) return; this.setState(s => ({ imp: { ...(s.imp as ImpState), id: { ...(s.imp as ImpState).id, logo: r.url, brand: brand || (s.imp as ImpState).id.brand }, logoTxt: 'Logo encontrado · ' + r.source + (r.label ? ' (' + r.label + ')' : '') } })); }
    else if (cur.id.domain) { const dom = cur.id.domain; this.setImpId({ logo: 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(dom) + '&sz=256' }, { logoTxt: 'Ícono del sitio ' + dom }); }
    else this.setImp({ logoTxt: 'No se encontró logo. Puedes subir uno o indicar el sitio web.' });
  }
  impBlock(): string[] {
    const I = this.state.imp as ImpState, F = I.fields, out: string[] = [];
    FIELDS.filter(f => f.req).forEach(f => { if (F[f.key] == null || F[f.key] === '' || isNaN(+(F[f.key] as number))) out.push('Falta ' + f.label.toLowerCase() + '.'); });
    if (!I.id.name) out.push('Falta el nombre de la empresa.');
    if (!I.id.ticker) out.push('Falta el ticker.');
    ([['rf', 'Rf'], ['prm', 'PRM'], ['g', 'crecimiento perpetuo (g)'], ['growth', 'crecimiento de ventas'], ['margin', 'margen EBIT'], ['taxF', 'tasa de impuestos'], ['daPct', 'D&A % ventas'], ['capexPct', 'capex % ventas']] as const).forEach(([k, l]) => { if (I.a[k] == null || I.a[k] === '' || isNaN(+(I.a[k] as number))) out.push('Falta ' + l + '.'); });
    if ((I.a.betaU == null || I.a.betaU === '') && (I.a.betaL == null || I.a.betaL === '')) out.push('Falta la beta (desapalancada o apalancada).');
    if (+(F.shares as number) <= 0) out.push('Las acciones en circulación deben ser mayores que cero.');
    return out;
  }
  impBuild(): Dataset {
    const I = this.state.imp as ImpState, num = (x: unknown) => (x === '' || x == null) ? null : +(x as number);
    const a: Record<string, number | null> = {}; Object.keys(I.a).forEach(k => a[k] = num(I.a[k]));
    const P: ParsedLite = I.parsed || { fields: FIELDS.map(f => ({ key: f.key, label: f.label, req: !!f.req, value: null, status: 'pending', cands: [], hist: [], period: 'Manual', srcLabel: 'Captura manual', srcSheet: '', conf: 'Manual' })), meta: {}, fileName: 'Captura manual' };
    const F: Record<string, number | null> = {}; Object.keys(I.fields).forEach(k => F[k] = num(I.fields[k]));
    return buildFromImport(P, F, { ...I.id, ...a });
  }
  createFromImp() {
    if (this.impBlock().length) return;
    const ds = this.impBuild(), test = E.run(ds, E.defaults(ds));
    if (!test.ok) { this.setImp({ error: test.errors.join(' ') }); return; }
    const list = [...this.state.companies, ds]; this.saveCompanies(list);
    store.setActive(ds.id);
    this.setState({ activeId: ds.id, A: E.defaults(ds), imp: null, annexId: null }, () => { this.go('p1'); this.flash('Valuación creada · ' + ds.profile.name); });
  }
  async importJson(file?: File | null) {
    if (!file) return;
    try {
      const j = JSON.parse(await file.text()); const ds = (j.dataset || j) as Dataset;
      const problems = checkDataset(ds);
      if (problems.length) { this.flash('Dataset incompleto: ' + problems[0]); return; }
      const copy: Dataset = { ...ds, id: 'c' + Date.now().toString(36), builtIn: false, updatedAt: new Date().toISOString() };
      if (j.assumptions) store.setA(copy.id, j.assumptions);
      const list = [...this.state.companies, copy];
      this.saveCompanies(list);
      store.setActive(copy.id);
      this.setState({ activeId: copy.id, A: { ...E.defaults(copy), ...(j.assumptions || {}) }, menu: null, fcfSel: 0, annexId: null }, () => { this.go('p1'); this.flash('Dataset importado · ' + copy.profile.name); });
    } catch { this.flash('El archivo no es un dataset ValuFlow válido'); }
  }

  // ---------- Investigación ----------
  async runResearch() {
    const ds = this.ds(), id = ds.id;
    const set = (r: Research) => { this.setState(s => ({ research: { ...s.research, [id]: r } })); store.setResearch(id, r); };
    const prev: Research = this.state.research[id] || { via: '', date: '', items: [] };
    set({ ...prev, status: 'loading', items: prev.items || [] });
    try { const r = await research(ds.profile); set({ status: 'done', ...r }); this.flash(r.items.length + ' hallazgos con fuente'); }
    catch { set({ status: 'error', items: [], via: '', date: '' }); this.flash('No fue posible completar la investigación'); }
  }
  setResearchItem(rid: string, status: 'applied' | 'discarded') {
    const id = this.state.activeId, r = this.state.research[id]; if (!r) return;
    const nr = { ...r, items: r.items.map(it => it.id === rid ? { ...it, status } : it) };
    this.setState({ research: { ...this.state.research, [id]: nr } }); store.setResearch(id, nr);
  }

  render() { return <Shell vm={buildView(this)} />; }
}
