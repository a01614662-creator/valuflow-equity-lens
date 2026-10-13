// ValuFlow · Dataset del estudio individual de Soriana. Fuente única: SORIANA_FINAL.xlsx (carpeta excel-final/).
// Todos los números salen de src/data/soriana.final.ts, generado desde el Excel con scripts/build-dataset.py (no se teclean).
// Este archivo solo acomoda esos datos al formato del motor y agrega textos descriptivos. El motor (src/engine) no conoce a Soriana.
import type { BuildSpec, CompsSpec, Dataset, Expected, ExpectedScenario, Ratio5, StudySpec, TransactionsSpec } from '../engine/types';
import { SORIANA_FINAL as X } from './soriana.final';
import { SORIANA_TEXTS } from './soriana.texts';
import { LOGO_URI } from '../assets/logos';

const pts = (x: number) => x * 100;
const D = X.expected.dcf, M = X.market, C = X.company;
/** Fecha ISO → "07-oct-2026". */
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dmy = (iso: string) => iso.slice(8, 10) + '-' + MES[+iso.slice(5, 7) - 1] + '-' + iso.slice(0, 4);

/** Resultados del Excel (escenario Base) en el formato de la capa de validación (porcentajes en puntos). */
const expected: Expected = {
  fcf: [...D.fcf], pvFcf: D.pvFcf, tvG: D.tvG, pvTvG: D.pvTvG, evG: D.evG, tvM: D.tvM, pvTvM: D.pvTvM, evM: D.evM, evW: D.evW, ev2: D.ev2, eq2: D.eq2, eqVal: D.eqVal,
  price: D.price, upside: pts(D.upside), wacc: pts(D.wacc), ke: pts(D.ke), priceG: D.priceG, priceM: D.priceM, priceW: D.priceW, tvWeight: pts(D.tvWeight),
  waccMarket: pts(D.waccMarket), keMarket: pts(D.keMarket), betaMarket: D.betaMarket, tvBlend: D.tvBlend, impliedG: D.impliedG,
  comps: X.expected.comps.value, transactions: X.expected.transactions.value, combined: X.expected.combined.value
};
const expectedScenarios: Record<string, ExpectedScenario> = Object.fromEntries(Object.entries(X.expected.scenarios).map(([k, s]) => [k, {
  inflation: s.inflation, salesCagr: s.salesCagr, marginAvg: s.marginAvg, betaIter: s.betaIter, rf: s.rf, ke: s.ke, wacc: s.wacc, g: s.g, fcf2030: s.fcf2030,
  pvFcf: s.pvFcf, tvG: s.tvG, tvBlend: s.tvBlend, ev: s.ev, equity: s.equity, price: s.price, diff: s.diff, diffPct: s.diffPct, recommendation: s.recommendation, betaLevered: s.betaLevered
}]));

// Categoría y unidad de cada razón (hoja Razones, filas 7 a 19, en el mismo orden).
const RATIO_META: [string, string][] = [
  ['Liquidez', 'x'], ['Liquidez', 'x'], ['Apalancamiento', '%'], ['Apalancamiento', '%'], ['Apalancamiento', 'x'], ['Eficiencia', 'x'], ['Eficiencia', 'd'],
  ['Eficiencia', 'x'], ['Rentabilidad', '%'], ['Rentabilidad', '%'], ['Rentabilidad', '%'], ['Rentabilidad', '%'], ['Rentabilidad', '%']
];
const ratios: Ratio5[] = X.ratios.rows.map((r, i) => {
  const [cat, unit] = RATIO_META[i], k = unit === '%' ? 100 : 1, v = (r.slice(1, 6) as number[]).map(x => x * k);
  return { cat, name: r[0] as string, unit, v, avg: (r[6] as number) * k };
});

export const soriana: Dataset = {
  id: 'soriana', builtIn: true, version: 'Estudio individual · SORIANA_FINAL', createdAt: '2026-10-07', updatedAt: '2026-10-13',
  source: { kind: 'Excel', file: X.file },
  profile: {
    name: 'Organización Soriana', short: 'Soriana', legalName: 'Organización Soriana, S.A.B. de C.V.',
    ticker: 'SORIANA B', exchange: 'BMV', country: 'México', currency: 'MXN', units: 'mdp',
    sector: 'Retail · Autoservicio', industry: C.business,
    founded: C.founded, hq: C.hq, listed: 'BMV desde 1987',
    stores: C.stores, employees: C.employees, formats: ['Híper', 'Súper', 'Mercado', 'Express', 'City Club'],
    logo: LOGO_URI.soriana, brand: '#d52b1e', brand2: '#b6bf00',
    description: 'Comercio al detalle multiformato: tiendas de autoservicio y clubes de precios. La operación incluye venta directa, comercio electrónico, servicios en establecimientos y negocios asociados.'
  },
  labels: { closeDate: 'cierre de 2025', rollDate: '2T26', rollFcf: '1S26', rfSource: 'Bono M 10 años', sourceShort: 'Excel', multipleSource: 'Mediana de ' + X.valuation.peerNames.join(', ') + ' con ' + pts(X.valuation.multipleDiscount) + '% de descuento' },
  dates: { base: dmy(X.valuation.roll.dateClose), balance: dmy(X.valuation.roll.dateBalance) + ' (2T26)', valuation: dmy(M.valuationDate), price: dmy(M.priceDate), nextReport: C.nextReport },
  market: {
    price: M.price, shares: M.shares, marketCap: M.marketCap, consensus: C.consensusTarget, consensusLabel: C.consensusDetail,
    pe: M.pe, pbv: M.pbv, bvps: M.bvps, divYield: pts(M.divYield), lastDiv: C.lastDividend,
    chg1y: pts(C.chg1y), rating: C.rating, rsi: C.rsi, macd: C.macd, ma50: C.ma50, ma200: C.ma200, technical: C.technical,
    low52: +C.range52w.split('–')[0], high52: +C.range52w.split('–')[1], priceSource: M.priceSource, sssg: C.sssg2T26, peers: M.peers
  },
  // Proyección construida desde sus drivers (hoja "Proyección Final Soriana").
  forecast: {
    baseYear: '2025A', years: ['2026E', '2027E', '2028E', '2029E', '2030E'],
    base: { ...X.base2025 },
    build: X.build as unknown as BuildSpec
  },
  // Insumos del WACC (puntos porcentuales para el motor). La inflación del escenario mueve Rf y Kd (Fisher).
  wacc: {
    rf: pts(X.wacc.rf), prm: pts(X.wacc.prm), prmMature: pts(X.wacc.prmMature), countryRisk: pts(X.wacc.countryRisk), betaU: D.betaU,
    taxMarket: pts(X.wacc.taxMarket), taxShield: pts(X.wacc.taxShield), kdPre: pts(X.wacc.kdPre), kdMarket: pts(X.wacc.kdMarket), interestFY: X.wacc.interestFY,
    debt: X.wacc.debt, equityMarket: M.marketCap, mode: 'iterated', start: pts(X.wacc.iterStart), iterations: X.wacc.iterations, fisher: {}
  },
  valuation: {
    g: pts(X.valuation.g), exitMultiple: X.valuation.exitMultiple, multipleDiscount: pts(X.valuation.multipleDiscount), wGordon: X.valuation.wGordon,
    bridge: { ...X.valuation.bridge },
    roll: { enabled: true, t1: X.valuation.roll.t1, t2: X.valuation.roll.t2, fcfGenerated: X.valuation.roll.fcfGenerated, debt: X.valuation.roll.debt, lease: X.valuation.roll.lease, cash: X.valuation.roll.cash, dateClose: X.valuation.roll.dateClose, dateBalance: X.valuation.roll.dateBalance, dateValuation: X.valuation.roll.dateValuation },
    signalThreshold: pts(X.valuation.threshold)
  },
  study: X as unknown as StudySpec,
  comps: X.comps as unknown as CompsSpec,
  transactions: X.transactions as unknown as TransactionsSpec,
  combined: { weights: { ...X.combined.weights }, reasons: { ...X.combined.reasons } },
  expected, expectedScenarios,
  ratios,
  quarterly: { periods: [...X.ratios.periods] },
  news: C.news.map(n => [n[1], n[0]] as [string, string]),
  timeline: [
    ['1968', 'Fundación en Torreón, Coahuila', 'Origen de la empresa.', 'Excel · Generales'],
    ['1987', 'Listado en la BMV', 'Inicio de la vida pública de SORIANA B.', 'Excel · Generales'],
    ['2026', 'Racionalización de tiendas', 'Cierre de 20 tiendas; enfoque en productividad por m² (prensa).', 'Excel · Noticias']
  ],
  inputs: X.expected.validation.assumptions.map(a => [a[0], 'Modelo principal', typeof a[1] === 'number' ? String(a[1]) : a[1], dmy(M.valuationDate), '', 'Excel', a[2]] as [string, string, string, string, string, string, string]),
  sources: [
    ['Excel del estudio', X.file, 'Fuente única de las cifras: series, supuestos, DCF, escenarios, múltiplos y validación'],
    ['Banco de México', 'Serie SP74833 · inflación general anual, quincenal', 'Modelos de tendencia de la inflación (113 quincenas)'],
    ['Banco de México', 'Encuesta de Expectativas de los Especialistas del Sector Privado, septiembre 2026', 'Referencias del crecimiento perpetuo'],
    ['Investing.com', 'Precios semanales de Soriana B y del S&P/BMV IPC', 'Regresión de la beta, rendimientos y precio de mercado'],
    ['S&P Capital IQ', 'Quick Comparable Analysis y Comparable M&A Transactions', 'Trading Comps y Precedent Transactions (extracto con atribución)'],
    ['Organización Soriana', 'Reportes trimestrales 2T25 a 2T26 (BMV)', 'Estados financieros y razones'],
    ['Fondo Monetario Internacional', 'World Economic Outlook, abril 2026', 'Crecimiento real de largo plazo (referencia)']
  ],
  annex: { statements: { cols: [...X.statements.cols], rows: X.statements.rows.map(r => [...r]) as (string | number)[][] }, projected: { cols: [], rows: [] }, sensitivity: {} },
  texts: SORIANA_TEXTS
};
