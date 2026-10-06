// Importador (Capital IQ / XLS / XLSX / CSV) → dataset ValuFlow. Lógica idéntica al prototipo.
import type { Dataset } from '../engine/types';

/** Subconjunto de la API de SheetJS que usa el importador. */
export interface XlsxLike {
  utils: { sheet_to_json: (ws: unknown, o: { header: 1; raw: false; defval: string }) => unknown[][] };
}
export interface WorkbookLike { SheetNames: string[]; Sheets: Record<string, unknown> }

const norm = (s: unknown) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\[[^\]]*\]/g, '').replace(/[^a-z0-9&%/ ]+/g, ' ').replace(/\s+/g, ' ').trim();

export interface FieldDef { key: string; label: string; req?: boolean; sheet?: RegExp; abs?: boolean; syn: string[] }

export const FIELDS: FieldDef[] = [
  { key: 'revenue', label: 'Ingresos', req: true, sheet: /income|resultados/i, syn: ['total revenue', 'revenue', 'total revenues', 'net revenue', 'net sales', 'sales', 'ingresos totales', 'ventas netas', 'ventas', 'ingresos'] },
  { key: 'ebit', label: 'EBIT', req: true, sheet: /income|resultados/i, syn: ['operating income', 'ebit', 'operating profit', 'utilidad de operacion', 'resultado de operacion'] },
  { key: 'ebitda', label: 'EBITDA', sheet: /income|key|multiples/i, syn: ['ebitda'] },
  { key: 'da', label: 'Depreciación y amortización', req: true, sheet: /cash|flujo|income/i, syn: ['depreciation & amort total', 'depreciation & amort', 'depreciation & amortization', 'depreciation and amortization', 'total depreciation & amortization', 'd&a', 'depreciacion y amortizacion'] },
  { key: 'capex', label: 'Capex', req: true, sheet: /cash|flujo/i, abs: true, syn: ['capital expenditure', 'capital expenditures', 'capex', 'purchase of property plant and equipment', 'inversiones en activo fijo'] },
  { key: 'netIncome', label: 'Utilidad neta', sheet: /income|resultados/i, syn: ['net income', 'net income to company', 'net income to common', 'utilidad neta'] },
  { key: 'ebt', label: 'Utilidad antes de impuestos', sheet: /income|resultados/i, syn: ['ebt incl unusual items', 'ebt excl unusual items', 'earnings before taxes', 'pretax income', 'income before taxes', 'utilidad antes de impuestos'] },
  { key: 'incomeTax', label: 'Impuestos a la utilidad', sheet: /income|resultados/i, abs: true, syn: ['income tax expense', 'income taxes', 'provision for income taxes', 'impuestos a la utilidad'] },
  { key: 'interest', label: 'Gastos financieros', sheet: /income|resultados/i, abs: true, syn: ['interest expense', 'total interest expense', 'gastos financieros'] },
  { key: 'cash', label: 'Efectivo y equivalentes', req: true, sheet: /balance/i, syn: ['cash and equivalents', 'cash & equivalents', 'total cash & st investments', 'cash and cash equivalents', 'efectivo y equivalentes', 'cash'] },
  { key: 'debt', label: 'Deuda total', req: true, sheet: /balance|capital structure/i, syn: ['total debt', 'deuda total', 'total borrowings'] },
  { key: 'currentAssets', label: 'Activo circulante', sheet: /balance/i, syn: ['total current assets', 'activo circulante'] },
  { key: 'currentLiabilities', label: 'Pasivo circulante', sheet: /balance/i, syn: ['total current liabilities', 'pasivo circulante'] },
  { key: 'totalAssets', label: 'Activo total', sheet: /balance/i, syn: ['total assets', 'activo total'] },
  { key: 'equity', label: 'Capital contable', sheet: /balance/i, syn: ['total equity', 'total common equity', 'capital contable'] },
  { key: 'shares', label: 'Acciones en circulación', req: true, sheet: /key|capitalization|balance|income/i, syn: ['total shares out on filing date', 'shares outstanding', 'total shares outstanding', 'shares out', 'weighted average diluted shares outstanding', 'weighted avg diluted shares out', 'acciones en circulacion'] },
  { key: 'price', label: 'Precio por acción', req: true, sheet: /key|capitalization|market|multiples/i, syn: ['share price', 'last close price', 'closing price', 'stock price', 'price close', 'precio'] },
  { key: 'marketCap', label: 'Capitalización de mercado', sheet: /key|capitalization|market|multiples/i, syn: ['market capitalization', 'market cap'] },
  { key: 'beta', label: 'Beta', sheet: /key|market/i, syn: ['beta 5 year', '5y beta', 'beta 5y', 'beta'] }
];

// Año de 4 dígitos aunque venga pegado a letras ("FY2024", "2025E"). El prototipo usaba \b…\b y no
// reconocía "FY2024" como periodo (tomaba la columna LTM). Formatos como "Dec-31-2024" funcionan igual que antes.
const YEAR = /(?<![0-9])((19|20)\d{2})(?![0-9])/;
const isPeriod = (x: unknown) => { const s = String(x || '').trim(); return s.length > 0 && s.length < 48 && (YEAR.test(s) || /\b(LTM|NTM|FY|CY)(?![a-z])/i.test(s) || /\b[1-4]T\d{2}\b/.test(s) || /\bQ[1-4]\b/.test(s)); };
const isEst = (s: string) => /(\d{4}|\d{2})\s*E\b|\bEst|Estimate|Proj|Forecast|\bNTM\b|\bE\)$/i.test(String(s)) || (+((String(s).match(YEAR) || [])[1]) > new Date().getFullYear());
const yearOf = (s: unknown) => { const m = String(s).match(YEAR); return m ? +m[1] : null; };
export const num = (x: unknown): number | null => {
  if (typeof x === 'number') return x;
  let s = String(x || '').trim(); if (!s || /^(-|—|NA|NM|N\/A|n\.d\.)$/i.test(s)) return null;
  const neg = /^\(.*\)$/.test(s) || /^-/.test(s); s = s.replace(/[()$,\s]/g, '').replace(/^-/, '');
  const pct = /%$/.test(s); s = s.replace(/[%x]$/i, ''); if (!/^\d*\.?\d+(e[-+]?\d+)?$/i.test(s)) return null;
  let v = parseFloat(s); if (neg) v = -v; return pct ? v / 100 : v;
};
export const SECTIONS = ['Key Stats', 'Income Statement', 'Balance Sheet', 'Cash Flow', 'Multiples', 'Historical Capitalization', 'Capital Structure', 'Ratios', 'Supplemental', 'Industry Specific', 'Estimates'];

interface Period { ci: number; label: string; full: string; est: boolean; ltm: boolean; year: number | null }
interface RowIdx { sheet: string; section: string | null; label: string; n: string; vals: { p: Period; v: number }[] }
export interface Candidate { id: number; label: string; sheet: string; value: number; period: string; sc: number }
export interface ParsedField {
  key: string; label: string; req: boolean; value: number | null; period: string | null; conf: string; status: string;
  srcLabel: string | null; srcSheet: string | null; hist: { year: number | null; label: string; v: number }[]; cands: Candidate[];
}
export interface Parsed {
  meta: { name: string | null; ticker: string | null; exchange: string | null; currency: string | null; units: string | null };
  sheets: { name: string; section: string | null; rows: number; periods: number; actual?: number; est?: number }[];
  fields: ParsedField[]; rowsCount: number; periods: string[]; coverage: number; mapped: number; total: number;
  detected: { name: string; found: boolean }[]; fileName: string;
}

export function parseWorkbook(wb: WorkbookLike, fileName: string, X: XlsxLike): Parsed {
  const meta: Parsed['meta'] = { name: null, ticker: null, exchange: null, currency: null, units: null };
  const rowsIdx: RowIdx[] = [], sheets: Parsed['sheets'] = [], periodSet = new Set<string>();
  wb.SheetNames.forEach(sn => {
    const aoa = X.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, defval: '' }) as unknown[][];
    aoa.slice(0, 16).forEach(r => r.forEach(c => {
      const t = String(c || '');
      if (!meta.name) { const m = t.match(/^(.+?)\s*\(\s*([A-Z]{2,8})\s*:\s*([A-Z0-9.\-]+)\s*\)/); if (m) { meta.name = m[1].trim(); meta.exchange = m[2]; meta.ticker = m[3]; } }
      if (!meta.currency) { const m = t.match(/\b(USD|MXN|HKD|CNY|RMB|EUR|GBP|JPY|BRL|CAD|CHF|KRW|INR)\b/); if (m) meta.currency = m[1] === 'RMB' ? 'CNY' : m[1]; }
      if (!meta.units) { if (/in millions|millions|millones|\(mm\)/i.test(t)) meta.units = 'millones'; else if (/in thousands|thousands|miles/i.test(t)) meta.units = 'miles'; else if (/in billions|billions/i.test(t)) meta.units = 'miles de millones'; }
    }));
    let hIdx = -1, best = 0;
    for (let r = 0; r < Math.min(60, aoa.length); r++) { const c = aoa[r].filter(isPeriod).length; if (c > best) { best = c; hIdx = r; } }
    const sec = SECTIONS.find(s => norm(sn).includes(norm(s))) || null;
    if (best < 1) { sheets.push({ name: sn, section: sec, rows: aoa.length, periods: 0 }); return; }
    const head = aoa[hIdx], prevHead = aoa[hIdx - 1] || [];
    const periods: Period[] = [];
    head.forEach((c, ci) => { if (isPeriod(c)) { const label = (String(prevHead[ci] || '').trim() + ' ' + String(c).trim()).trim(); periods.push({ ci, label: String(c).trim(), full: label, est: isEst(label), ltm: /LTM|NTM/i.test(label), year: yearOf(label) }); } });
    const firstCol = periods[0].ci;
    for (let r = hIdx + 1; r < aoa.length; r++) {
      const row = aoa[r]; let label = '';
      for (let c = 0; c < firstCol; c++) { const t = String(row[c] || '').trim(); if (t && num(t) === null) { label = t; break; } }
      if (!label) continue;
      const vals = periods.map(p => ({ p, v: num(row[p.ci]) })).filter((x): x is { p: Period; v: number } => x.v !== null);
      if (!vals.length) continue;
      rowsIdx.push({ sheet: sn, section: sec, label, n: norm(label), vals });
    }
    periods.forEach(p => periodSet.add(p.label));
    sheets.push({ name: sn, section: sec, rows: aoa.length, periods: periods.length, actual: periods.filter(p => !p.est).length, est: periods.filter(p => p.est).length });
  });
  if (!meta.name && fileName) {
    const m = fileName.replace(/\.(xlsx?|csv)$/i, '').match(/^(.*?)\s+([A-Z]{2,6})\s+([A-Z0-9.]+)\s+Financials/i);
    if (m) { meta.name = m[1].trim(); meta.exchange = m[2]; meta.ticker = m[3]; } else meta.name = fileName.replace(/\.(xlsx?|csv)$/i, '').replace(/[_]+/g, ' ');
  }
  const pick = (row: RowIdx) => {
    const act = row.vals.filter(x => !x.p.est && !x.p.ltm), ltm = row.vals.filter(x => !x.p.est && x.p.ltm), any = row.vals;
    const pool = act.length ? act : (ltm.length ? ltm : any);
    return pool.reduce((a, b) => ((b.p.year || 0) > (a.p.year || 0) || ((b.p.year || 0) === (a.p.year || 0) && b.p.ci > a.p.ci)) ? b : a);
  };
  const fields: ParsedField[] = FIELDS.map(F => {
    const cands: { row: RowIdx; sc: number }[] = [];
    rowsIdx.forEach(row => {
      let sc = 0; F.syn.forEach(s => { if (row.n === s) sc = Math.max(sc, 1); else if (row.n.startsWith(s + ' ') || row.n.startsWith(s)) sc = Math.max(sc, 0.82); else if ((' ' + row.n + ' ').includes(' ' + s + ' ')) sc = Math.max(sc, 0.68); });
      if (!sc) return;
      if (F.sheet && !F.sheet.test(row.sheet)) sc -= 0.12;
      if (/%|margin|growth|per share|yoy|margen|crecimiento/i.test(row.label) && F.key !== 'price') sc -= 0.4;
      if (sc > 0.3) cands.push({ row, sc });
    });
    cands.sort((a, b) => b.sc - a.sc);
    const top = cands[0];
    let value: number | null = null, period: string | null = null, conf = 'Sin dato', status = 'pending';
    if (top) { const p = pick(top.row); value = F.abs ? Math.abs(p.v) : p.v; period = p.p.label; conf = top.sc >= 0.95 ? 'Alta' : (top.sc >= 0.7 ? 'Media' : 'Baja'); status = top.sc >= 0.7 ? 'ok' : 'review'; }
    const hist = top ? top.row.vals.filter(x => !x.p.est && !x.p.ltm).map(x => ({ year: x.p.year, label: x.p.label, v: F.abs ? Math.abs(x.v) : x.v })) : [];
    return { key: F.key, label: F.label, req: !!F.req, value, period, conf, status, srcLabel: top ? top.row.label : null, srcSheet: top ? top.row.sheet : null, hist, cands: cands.slice(0, 8).map((c, i) => ({ id: i, label: c.row.label, sheet: c.row.sheet, value: (F.abs ? Math.abs(pick(c.row).v) : pick(c.row).v), period: pick(c.row).p.label, sc: c.sc })) };
  });
  const mapped = fields.filter(f => f.status === 'ok').length;
  const detected = SECTIONS.map(s => ({ name: s, found: sheets.some(sh => sh.section === s) || (s === 'Income Statement' && fields.find(f => f.key === 'revenue')!.value != null && sheets.length === 1) }));
  return { meta, sheets, fields, rowsCount: rowsIdx.length, periods: Array.from(periodSet), coverage: mapped / fields.length, mapped, total: fields.length, detected, fileName };
}

/** Identidad y supuestos capturados en el paso 4 del asistente. Porcentajes en puntos. */
export interface ImportInputs {
  name: string; short?: string; ticker?: string; exchange?: string; country?: string; currency?: string; sector?: string; industry?: string;
  logo?: string | null; brand?: string | null; domain?: string;
  rf?: number | null; prm?: number | null; betaU?: number | null; betaL?: number | null; g?: number | null;
  growth?: number | null; margin?: number | null; taxF?: number | null; daPct?: number | null; capexPct?: number | null;
  tax?: number | null; kd?: number | null; exitMultiple?: number | null;
}

/** Parsed mínimo para una captura manual (sin archivo). */
export type ParsedLite = Pick<Parsed, 'fields' | 'fileName'> & { meta: Partial<Parsed['meta']> };

export function buildFromImport(P: ParsedLite, F: Record<string, number | null>, I: ImportInputs, nYears = 5): Dataset {
  const v = (k: string) => (F[k] != null && (F[k] as unknown) !== '' ? +(F[k] as number) : null);
  const rev = v('revenue'), ebit = v('ebit'), da = v('da'), capex = v('capex');
  const taxRate = (v('incomeTax') != null && (v('ebt') ?? 0) > 0) ? (v('incomeTax') as number) / (v('ebt') as number) : (I.tax != null ? I.tax / 100 : 0.30);
  const nwc = (v('currentAssets') != null && v('currentLiabilities') != null) ? ((v('currentAssets') as number) - (v('cash') as number) - (v('currentLiabilities') as number)) : 0;
  const debt = v('debt') || 0, cash = v('cash') || 0, shares = v('shares'), price = v('price');
  const kd = (v('interest') != null && debt > 0) ? (v('interest') as number) / debt * 100 : (I.kd ?? null);
  const baseYear = (P.fields.find(f => f.key === 'revenue') || ({} as ParsedField)).period || 'Último';
  const y0 = yearOf(baseYear) || new Date().getFullYear() - 1;
  const years = Array.from({ length: nYears }, (_, k) => (y0 + k + 1) + 'E');
  const E = (price && shares) ? price * shares : v('marketCap');
  let betaU = I.betaU; if (betaU == null && I.betaL != null && E) betaU = I.betaL / (1 + (1 - taxRate) * debt / E);
  const ebitda = v('ebitda') ?? ((ebit ?? 0) + (da ?? 0));
  const evMkt = E ? E + debt - cash : null;
  const mult = I.exitMultiple != null ? I.exitMultiple : (evMkt && ebitda > 0 ? evMkt / ebitda : null);
  const id = 'c' + Date.now().toString(36);
  const hist = (k: string) => (P.fields.find(f => f.key === k) || ({} as ParsedField)).hist || [];
  return {
    id, builtIn: false, version: 'Importado · ' + (P.fileName || 'archivo'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    source: { kind: 'Archivo importado', file: P.fileName },
    profile: { name: I.name, short: I.short || I.name.split(' ')[0], legalName: I.name, ticker: I.ticker, exchange: I.exchange, country: I.country || '', currency: I.currency || 'USD', units: 'mm', sector: I.sector || '', industry: I.industry || '', logo: I.logo || null, brand: I.brand || null, domain: I.domain || '', description: '' },
    dates: { base: baseYear, valuation: new Date().toISOString().slice(0, 10), price: 'Archivo importado' },
    market: { price, shares, marketCap: E, consensus: null },
    forecast: { baseYear: y0 + 'A', years, base: { revenue: rev, ebit, da, capex, nwc, ebitda }, drivers: { growth: (I.growth as number) / 100, margin: (I.margin as number) / 100, tax: (I.taxF as number) / 100, da: (I.daPct as number) / 100, capex: (I.capexPct as number) / 100, nwcPct: rev ? nwc / rev : 0 } },
    wacc: { rf: I.rf as number, prm: I.prm as number, betaU: betaU as number, taxMarket: taxRate * 100, taxShield: taxRate * 100, kdPre: kd as number, kdMarket: kd as number, debt, equityMarket: E, mode: 'iterated', start: 12 },
    valuation: { g: I.g as number, exitMultiple: mult, wGordon: mult ? 0.5 : 1, bridge: { debt, lease: 0, cash }, roll: { enabled: false }, signalThreshold: 15 },
    history: { revenue: hist('revenue'), ebit: hist('ebit'), netIncome: hist('netIncome') },
    imported: P.fields.map(f => ({ key: f.key, label: f.label, value: F[f.key] ?? null, period: f.period, srcLabel: f.srcLabel, srcSheet: f.srcSheet, conf: f.conf })),
    sources: [['Archivo importado', P.fileName || '', 'Datos financieros (' + (P.meta.units || 'unidades del archivo') + ')'], ['Supuestos', 'Captura manual en ValuFlow', 'Rf, PRM, beta, g y drivers de proyección']],
    research: null
  };
}
