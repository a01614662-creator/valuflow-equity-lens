// ValuFlow · Dataset del caso Soriana. Fuente maestra: Excel "EXCEL FINAL PRO DEFINITIVO SORIANA - AUDITADO"
// (carpeta excel/; el original sin cambios está en excel/original/). Los números del modelo (drivers, WACC, puente, inflación, múltiplos, transacciones, pesos y
// resultados esperados) se leen de src/data/soriana.excel.ts, generado desde el Excel con tools/excel/extract_dataset.py.
// Este archivo es solo DATOS. El motor (src/engine) no conoce a Soriana.
// El dataset original del prototipo ($31.16, filas redondeadas) vive en tests/fixtures/soriana-legacy.ts.
import type { BetaSpec, BuildSpec, CompsSpec, Dataset, Expected, ExternalRef, InflationSpec, SdcSpec, TransactionsSpec } from '../engine/types';
import { SORIANA_XL as XL } from './soriana.excel';

type XLExp = typeof XL.expected.dcf.base;
const pts = (x: number) => x * 100;
/** Resultados del Excel (un escenario de inflación) en el formato de la capa de validación. */
const expectedOf = (e: XLExp): Expected => ({
  fcf: [...e.fcf], pvFcf: e.pvFcf, tvG: e.tvG, pvTvG: e.pvTvG, evG: e.evG, tvM: e.tvM, pvTvM: e.pvTvM, evM: e.evM, evW: e.evW, ev2: e.ev2, eq2: e.eq2, eqVal: e.eqVal,
  price: e.price, upside: e.upside, wacc: e.wacc, ke: e.ke, priceG: e.priceG, priceM: e.priceM, priceW: e.priceW, tvWeight: e.tvWeight,
  waccMarket: e.waccMarket, keMarket: e.keMarket, betaMarket: e.betaMarket,
  comps: XL.expected.comps.value, transactions: XL.expected.sdc.prices.median, combined: e.combined,
  sensRow: [...e.sensFinal.grid[2]]
});
const XE = XL.expected.dcf;
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
/** '2026-06-30' → '30-jun-2026' (formato de fechas del dataset). */
const isoDate = (iso: string) => iso.slice(8, 10) + '-' + MES[+iso.slice(5, 7) - 1] + '-' + iso.slice(0, 4);

export const soriana: Dataset = {
  id: 'soriana', builtIn: true, version: 'Excel PRO auditado · DCF + inflación + múltiplos + transacciones LSEG/SDC', createdAt: '2026-10-01', updatedAt: '2026-10-19',
  source: { kind: 'Excel', file: XL.file },
  profile: {
    name: 'Organización Soriana', short: 'Soriana', legalName: 'Organización Soriana, S.A.B. de C.V.',
    ticker: 'SORIANA B', exchange: 'BMV', country: 'México', currency: 'MXN', units: 'mdp',
    sector: 'Retail · Autoservicio', industry: 'Tiendas de autoservicio y clubes de membresía (multiformato)',
    founded: '1968 · Torreón, Coahuila', hq: 'Monterrey, Nuevo León', listed: 'BMV desde 1987',
    stores: 812, employees: 82064, formats: ['Híper', 'Súper', 'Mercado', 'Express', 'City Club'],
    logo: 'assets/soriana.svg', brand: '#d52b1e', brand2: '#b6bf00', domain: 'soriana.com',
    description: 'Comercio al detalle multiformato: tiendas de autoservicio y clubes de precios. La operación incluye venta directa, comercio electrónico, servicios en establecimientos y negocios asociados, con participación en la operación de Sodimac en México.'
  },
  // Etiquetas de fechas y fuentes que la interfaz muestra (antes estaban fijas en el código).
  labels: { closeDate: 'cierre de 2025', rollDate: '2T26', rollFcf: '1S26', rfSource: 'Bono M 10 años', sourceShort: 'Excel', multipleSource: 'Excel · mediana comparables −10%' },
  // Escenarios de inflación documentados (hoja Inflación) y valuación relativa (hojas Trading Comps,
  // Precedent Transactions y Valuación Combinada del Excel maestro).
  inflation: XL.inflation as unknown as InflationSpec,
  beta: XL.beta as unknown as BetaSpec,
  notes: XL.notes,
  comps: XL.comps as unknown as CompsSpec,
  transactions: XL.transactions as unknown as TransactionsSpec,
  sdc: XL.sdc as unknown as SdcSpec,
  combined: { weights: { ...XL.combined.weights }, reasons: { ...XL.combined.reasons }, classRule: XL.combined.classRule, transactionsSource: 'sdc' },
  recommendation: { buy: XL.recommendation.buy, sell: XL.recommendation.sell, rule: XL.recommendation.rule, experts: XL.recommendation.experts },
  external: XL.external as unknown as ExternalRef[],
  externalNotes: XL.externalNotes,
  audit: XL.audit,
  study: XL.inflation.study as unknown as Dataset['study'],
  dates: { base: '31-dic-2025', balance: '30-jun-2026 (2T26)', valuation: '01-oct-2026', price: isoDate(XL.market.priceDate), nextReport: '23-oct-2026' },
  market: {
    price: XL.market.price, shares: XL.market.shares, marketCap: XL.market.price * XL.market.shares, consensus: XL.market.consensus, consensusLabel: 'Venta · 0 C / 1 M / 6 V (S&P Capital IQ)',
    low52: 23.90, high52: 42.70, pe: XL.market.pe, pbv: XL.market.pbv, bvps: XL.market.bvps, divYield: XL.market.divYield * 100, lastDiv: XL.market.lastDiv,
    chg1y: 21.3, rating: 'HR+1 (HR Ratings, corto plazo)', rsi: 75, macd: 1.154, ma50: 29.68, ma200: 29.71, technical: 'Compra fuerte',
    hrRevenue2027: 196480
  },
  // Proyección final construida desde sus drivers (hoja "Proyección Final Soriana"): la inflación del escenario
  // elegido entra al crecimiento nominal de ventas y se propaga a la proyección, el FCF y la valuación.
  forecast: {
    baseYear: '2025A', years: ['2026E', '2027E', '2028E', '2029E', '2030E'],
    base: { revenue: 177515.0, ebit: 7551.0, da: 4342.0, capex: 2867.0, nwc: 3691.0, fcf: 6761.4, ebitda: 11893.0 },
    build: XL.build as unknown as BuildSpec
  },
  // Escenario alterno documentado en el Excel (hoja "Valuación base"): supuestos constantes.
  altForecasts: {
    constante: {
      label: 'Proyección base · supuestos constantes', short: 'Supuestos constantes', source: 'Excel · DCF base (3.5% ventas)',
      drivers: { growth: [0.035, 0.035, 0.035, 0.035, 0.035], margin: 'r:7552/177515', tax: [0.30, 0.30, 0.30, 0.30, 0.30], da: 'r:4342/177515', capex: 'r:2867/177515', nwcPct: 'r:3691/177515' },
      overrides: { waccMode: 'manual', waccManual: 12.50, wGordon: 100, rollEnabled: false, bridgeDebt: 23618, bridgeLease: 0 },
      expected: { price: 34.44, ev: 76313.9, equity: 61990.9 }
    }
  },
  // Insumos del WACC con precisión completa (en puntos porcentuales para el motor). Fuentes: hoja Fuentes del Excel.
  wacc: {
    rf: pts(XL.wacc.rf), prm: pts(XL.wacc.prm), prmMature: pts(XL.wacc.prmMature), countryRisk: pts(XL.wacc.countryRisk), betaU: XL.wacc.betaU,
    taxMarket: pts(XL.wacc.taxMarket), taxShield: pts(XL.wacc.taxShield), kdPre: pts(XL.wacc.kdPre), kdMarket: pts(XL.wacc.kdMarket), interestFY: XL.wacc.interestFY,
    debt: XL.wacc.debt, equityMarket: 60264.0, mode: 'iterated', start: pts(XL.wacc.start), iterations: XL.wacc.iterations
  },
  valuation: {
    g: pts(XL.valuation.g), exitMultiple: XL.valuation.exitMultiple, comparablesMedian: XL.valuation.comparablesMedian, multipleDiscount: pts(XL.valuation.multipleDiscount), wGordon: XL.valuation.wGordon,
    bridge: { ...XL.valuation.bridge },
    roll: { ...XL.valuation.roll },
    signalThreshold: XL.valuation.signalThreshold, tvFcf: 'normalized'
  },
  // Resultados del Excel para la capa de validación: escenario por defecto (Base) y cada escenario de inflación.
  expected: expectedOf(XE.base),
  // Solo con la beta oficial (la columna "Histórico" usa βU 0.80 y se valida en las pruebas).
  expectedScenarios: { citi: expectedOf(XE.citi), cautela: expectedOf(XE.cautela), base: expectedOf(XE.base), alcista: expectedOf(XE.alcista) },
  // Iteración del WACC del Excel (filas 214–219): [k, WACC entrada %, Equity DCF, D/E, βL, Ke %, WACC salida %].
  waccIterationExcel: XE.base.waccIterations.map((r, k) => [k, pts(r[0]), r[1], r[2], r[3], pts(r[4]), pts(r[5])]),
  method: {
    // Ponderación y crecimiento del escenario Base (la pantalla usa la proyección en vivo del escenario activo).
    weightsExternal: XL.build.weightsExternal.map(pts),
    // Valores del escenario Base del Excel; las pantallas muestran la proyección en vivo del escenario activo.
    growthExternal: XE.base.growthExternal.map(pts), growthLS: XE.base.lsSales.slice(1).map((v, i) => pts(v / XE.base.lsSales[i] - 1)), growthFinal: XE.base.growthFinal.map(pts),
    marginExternal: [], marginLS: XL.build.margin.ls.map(pts), marginFinal: XE.base.marginFinal.map(pts),
    capexFinal: [], taxFinal: [], daFinal: [],
    salesLS: XE.base.lsSales.slice(1), salesConst: [183728.0, 190158.5, 196814.1, 203702.5, 210832.1], salesLTM: XE.base.lsSales[0],
    salesConstLabel: 'Supuestos constantes (3.5%)', salesLSLabel: 'Mínimos cuadrados (2026E) + inflación',
    externalNet: { sales: -0.90, costs: 0.52, capex: 2.50 },
    leastSquares: [
      { key: 'ventas', label: 'Ventas', unit: 'mdp', y: [45810.0, 42683.0, 47592.0, 40444.0, 43559.0], a: 44017.6, b: -674.1, r2: 0.148, fc: [41995.3, 41321.2, 40647.1, 39973.0] },
      { key: 'costos', label: 'Costos y gastos operativos', unit: 'mdp', y: [43901.0, 41215.0, 45106.0, 38622.0, 41704.0], a: 42109.6, b: -698.7, r2: 0.193, fc: [40013.5, 39314.8, 38616.1, 37917.4] },
      { key: 'tasa', label: 'Tasa de impuesto', unit: '%', y: [38.32, 23.43, 25.81, 37.10, 20.55], a: 29.04, b: -2.19, r2: 0.180, fc: [22.49, 20.30, 18.11, 15.93] },
      { key: 'da', label: 'Depreciación y amortización', unit: 'mdp', y: [1105.9, 1049.3, 1051.0, 1048.9, 1030.6], a: 1057.2, b: -15.1, r2: 0.702, fc: [1011.9, 996.8, 981.7, 966.6] },
      { key: 'capex', label: 'Capex', unit: 'mdp', y: [663.2, 775.2, 816.0, 501.0, 909.9], a: 733.1, b: 21.9, r2: 0.049, fc: [798.8, 820.7, 842.7, 864.6] },
      { key: 'nwc', label: 'Capital de trabajo neto', unit: 'mdp', y: [11066.0, 11577.0, 9310.0, 9712.0, 7301.9], a: 9793.4, b: -939.3, r2: 0.784, fc: [6975.4, 6036.1, 5096.8, 4157.5] }
    ],
    lsQuarters: ['2T25', '3T25', '4T25', '1T26', '2T26'], lsForecastQuarters: ['3T26', '4T26', '1T27', '2T27'],
    fcffLTM: { projected: 10301.0, actual: 10516.5, adjusted: 9510.6 },
    external: [
      ['Macroeconomía México', 'Crecimiento del PIB', 'Banxico (abr–jun 2026): PIB 2026 1.5%; 2027 2.0%', 'Ventas', '+', 0.50, 0, 0],
      ['Macroeconomía México', 'Inflación', 'General 3.42% y subyacente 3.79% (1a qna. sep-2026)', 'Ventas y costos', 'Neutral', 0, 0, 0],
      ['Política monetaria', 'Tasa Banxico / Fed', 'Banxico 6.50% (24-sep-2026); Fed +25 pb en septiembre', 'WACC / gastos financieros', '−', 0, 0, 0],
      ['Macroeconomía México', 'Tipo de cambio', '18.08 MXN/USD al 30-sep-2026', 'Costos y capex', '−', 0, 0.10, 1.00],
      ['Macroeconomía México', 'Remesas', '2025: USD 61,791 mm (−4.6%); 1T26 +1.4%', 'Ventas', '−', -0.30, 0, 0],
      ['Política laboral', 'Salario mínimo 2026 +13%', 'De 278.80 a 315.04 $/día', 'Costos y ventas', 'Mixto', 0.20, 0.15, 0],
      ['Política laboral', 'Jornada de 40 horas', 'Reducción gradual de 48 a 40 h a partir de 2027', 'Costos', '−', 0, 0.05, 0],
      ['Política fiscal', 'IEPS a bebidas y tabaco', 'Bebidas de 1.64 a 3.08 $/litro; tabaco 160% → 200%', 'Ventas', '−', -0.20, 0, 0],
      ['Política comercial', 'Aranceles a países sin tratado', 'Hasta 50% a importaciones de Asia desde 1-ene-2026', 'Costos y capex', '−', 0, 0.05, 0.50],
      ['T-MEC', 'Revisión del T-MEC', 'Revisiones anuales activadas; inversión débil', 'Ventas', '−', -0.30, 0, 0],
      ['T-MEC / EU', 'Aranceles sectoriales de EU', 'Acero, aluminio y automotriz', 'Ventas', '−', -0.20, 0, 0],
      ['Geopolítica', 'Medio Oriente / petróleo', 'Petróleo arriba de USD 100 (sep-2026)', 'Costos', '−', 0, 0.05, 0],
      ['Sector retail', 'Ventas ANTAD', 'Ago-2026: autoservicio −0.7% tiendas iguales', 'Ventas', '−', -0.50, 0, 0],
      ['Megatendencia', 'Hard discount', 'Tiendas 3B de 4% (2019) a 14% (2025) del mercado de descuento', 'Ventas y costos', '−', -0.50, 0.10, 0],
      ['Megatendencia', 'Omnicanalidad', 'Inversión en surtido en línea y última milla', 'Ventas y capex', 'Mixto', 0.20, 0, 1.00],
      ['Inmobiliario', 'Rentas comerciales', '+11.09% en 1S26; USD 28.93/m²', 'Costos y otros ingresos', 'Mixto', 0.10, 0.02, 0],
      ['Inmobiliario', 'Ocupación de FIBRAs', 'Ocupación arriba de 91% al 2T26', 'Ventas (otros ingresos)', '+', 0.10, 0, 0]
    ]
  },
  quarterly: {
    periods: ['2T25', '3T25', '4T25', '1T26', '2T26'],
    revenue: [45810, 42683, 47592, 40444, 43559], grossProfit: [10954, 10685, 11797, 9978, 10640],
    ebit: [1909, 1468, 2486, 1822, 1855], netIncome: [743, 584, 1308, 834, 1090],
    debtTotal: [30154, 30218, 23618, 23723, 23720.6], cash: [7540, 5798, 9295, 4589, 6875.4],
    cfo: [4013.1, -205.9, 13017.0, -3565.6, 3916.0], capex: [663.2, 775.2, 816.0, 501.0, 909.9]
  },
  ratios: [
    { cat: 'Liquidez', name: 'Razón circulante', unit: 'x', v: [1.27, 1.30, 1.24, 1.29, 1.17], avg: 1.25, read: 'La liquidez depende del inventario: la prueba ácida promedio es 0.35x.' },
    { cat: 'Liquidez', name: 'Prueba ácida', unit: 'x', v: [0.36, 0.35, 0.41, 0.32, 0.33], avg: 0.35, read: 'Sin inventario, los activos circulantes cubren 0.35 veces el pasivo circulante.' },
    { cat: 'Apalancamiento', name: 'Deuda / Activo total', unit: '%', v: [47.5, 46.3, 45.7, 43.3, 44.7], avg: 45.5, read: 'Baja de 47.5% a 44.7% entre 2T25 y 2T26.' },
    { cat: 'Apalancamiento', name: 'Capitalización LP', unit: '%', v: [21.8, 22.1, 20.6, 20.9, 18.0], avg: 20.7, read: 'Menor peso del pasivo de largo plazo en la estructura.' },
    { cat: 'Apalancamiento', name: 'Cobertura de intereses', unit: 'x', v: [2.30, 1.87, 4.04, 3.10, 3.19], avg: 2.90, read: 'Mejora de 2.30x a 3.19x en cinco trimestres.' },
    { cat: 'Eficiencia', name: 'Inventario en días', unit: 'd', v: [98.0, 103.8, 82.3, 97.7, 98.4], avg: 96.0, read: 'Variable operativa crítica: 96 días en promedio.' },
    { cat: 'Eficiencia', name: 'Rotación de inventario', unit: 'x', v: [0.93, 0.88, 1.11, 0.93, 0.93], avg: 0.96, read: 'Rotación trimestral.' },
    { cat: 'Eficiencia', name: 'Rotación del activo', unit: 'x', v: [0.29, 0.27, 0.31, 0.27, 0.28], avg: 0.28, read: 'Rotación trimestral.' },
    { cat: 'Rentabilidad', name: 'Margen bruto', unit: '%', v: [23.9, 25.0, 24.8, 24.7, 24.4], avg: 24.6, read: 'Estable alrededor de 24.6%.' },
    { cat: 'Rentabilidad', name: 'Margen neto', unit: '%', v: [1.6, 1.4, 2.7, 2.1, 2.5], avg: 2.1, read: 'Brecha amplia entre margen bruto y neto.' },
    { cat: 'Rentabilidad', name: 'ROA (trimestral)', unit: '%', v: [0.46, 0.37, 0.84, 0.55, 0.70], avg: 0.58, read: 'FY2025 anual: 2.14%.' },
    { cat: 'Rentabilidad', name: 'ROE (trimestral)', unit: '%', v: [0.88, 0.69, 1.54, 0.97, 1.26], avg: 1.07, read: 'FY2025 anual: 3.93%.' },
    { cat: 'Rentabilidad', name: 'ROI (trimestral)', unit: '%', v: [1.17, 0.90, 1.61, 1.17, 1.18], avg: 1.20, read: 'FY2025 anual: 4.88%.' }
  ],
  governance: {
    board: 13, patrimonial: 9, related: 1, independent: 3, independencePct: 23.08, bestPractice: 25,
    chair: 'Francisco Javier Martín Bringas', ceo: 'Ricardo Martín Bringas',
    committees: [
      ['Comité de Auditoría y Prácticas Societarias', '3 integrantes independientes'],
      ['Comité de Riesgos y Continuidad Operativa', 'Constituido en abril de 2026 · 13 miembros de alta dirección']
    ],
    controls: ['Auditoría interna', 'Código de Ética', 'Línea Directa', 'Mecanismos de conflicto de interés', '96% de la plantilla capacitada en ética (2025)']
  },
  timeline: [
    ['1968', 'Fundación en Torreón, Coahuila', 'Origen de la empresa.', 'Excel · Información general'],
    ['1987', 'Listado en la BMV', 'Inicio de la vida pública de SORIANA B.', 'AE 1'],
    ['2007', 'Adquisición de Grupo Gigante', 'Expansión relevante y aumento de deuda.', 'AE 1'],
    ['2015–16', 'Adquisición de Comercial Mexicana', 'Mayor adquisición histórica; ciclo de apalancamiento posterior.', 'AE 1'],
    ['2016', 'JV con Falabella / Sodimac y 50% de Soriban', 'Diversificación hacia mejoramiento del hogar y servicios financieros.', 'AE 1'],
    ['2020', 'Programa de CEBURES', 'Refinanciamiento y extensión de vencimientos.', 'AE 1'],
    ['2023–24', 'Mejoras de calificación · SORIANA 23 y 24', 'Menor deuda, mayor flujo y menor costo de fondeo.', 'AE 1'],
    ['2025–26', 'Desapalancamiento', 'Deuda LP y deuda neta bancaria/bursátil en descenso.', 'Sesión 2'],
    ['2026', 'Racionalización de tiendas', 'Cierre de 20 tiendas; enfoque en productividad por m² (prensa).', 'Excel · Noticias']
  ],
  dividends: [
    ['11-dic-2025', '23-dic-2025', 0.5556], ['28-abr-2023', '15-dic-2023', 0.5556], ['29-abr-2021', '15-dic-2021', 0.5556], ['2019', '2019', 0.3889]
  ],
  news: [['31-jul-2026', 'Resultados 2T26: menos ventas, más utilidad'], ['26-ago-2026', 'Cierre de 20 tiendas en 2026'], ['2-sep-2026', 'Reducción de plantilla y automatización'], ['sep-2026', 'Plan de inversión 2S26']],
  // Diferencias entre versiones y fuentes: se documentan, no se eligen en silencio. Cifras del Excel PRO auditado (XL).
  discrepancies: [
    { topic: 'Beta del WACC (cambio del 19-oct-2026)', a: ['Antes: βU Damodaran 0.69 (corregida por caja), hoy referencia', '$' + XE.base_damodaran.price.toFixed(2) + ' · WACC ' + XE.base_damodaran.wacc.toFixed(2) + '%'], b: ['Ahora: βU ' + XL.beta.regression.unlevered.toFixed(4) + ' (regresión semanal: βL observada ' + XL.beta.regression.levered.toFixed(4) + ' desapalancada)', '$' + XE.base.price.toFixed(2) + ' · WACC ' + XE.base.wacc.toFixed(2) + '%'], used: 'Regresión semanal desapalancada', note: 'Decisión del equipo. La βL observada se desapalanca con la estructura de la propia regresión (D/E ' + XL.beta.regression.de.toFixed(4) + ', t ' + (XL.beta.regression.tax * 100).toFixed(0) + '%) y se reapalanca con la del modelo; no se usa directamente. La pendiente no es significativa al 95% (p ≈ 0.09).' },
    { topic: 'Valor por acción (DCF), versiones anteriores', a: ['ValuFlow anterior (Excel integrado, βU 0.65) · baseline histórico (Citi + βU 0.80)', '$32.41 · $31.16'], b: ['Excel PRO auditado con βU Damodaran 0.69 (oficial hasta el 19-oct-2026)', '$' + XE.base_damodaran.price.toFixed(2)], used: 'Histórico (trazabilidad)', note: 'El PRO corrige la beta por caja (0.65 → 0.69), deja la tendencia de mínimos cuadrados crecer con la inflación y normaliza el FCF del valor terminal (capex = D&A).' },
    { topic: 'DCF del reporte comparativo ($39.21)', a: ['Modelo individual (SORIANA_FINAL, 7-oct-2026)', 'βU 0.1705 (regresión) · WACC 9.63% · $39.21'], b: ['Modelo del equipo (Excel PRO auditado)', 'βU ' + XL.beta.regression.unlevered.toFixed(4) + ' (regresión) · WACC ' + XE.base.wacc.toFixed(2) + '% · $' + XE.base.price.toFixed(2)], used: 'Modelo del equipo', note: 'Misma beta desapalancada; la diferencia restante viene de la proyección, la fecha y el precio de referencia (33.48 del 25-sep vs. 33.10 del 7-oct-2026).' },
    { topic: 'Precedent Transactions', a: ['Muestra S&P Capital IQ (3 operaciones, media)', '$' + XL.expected.transactions.value.toFixed(2)], b: ['Muestra LSEG/SDC auditada (mediana EV/EBITDA)', '$' + XL.expected.sdc.prices.median.toFixed(2)], used: 'LSEG/SDC como referencia (peso 0%)', note: 'La muestra CIQ no es defendible (1 de 3 en la ventana). La SDC es global, de control mixto y dispersa: se muestra como contraste, no entra al precio combinado.' },
    { topic: 'Precio de mercado de referencia', a: ['Modelo del equipo', '$' + XL.market.price.toFixed(2) + ' · cierre ' + isoDate(XL.market.priceDate) + ' (fecha de valuación 01-oct-2026)'], b: ['Reporte comparativo (CIQ / Refinitiv)', '$33.10 · cierre 7-oct-2026'], used: 'Modelo: $' + XL.market.price.toFixed(2), note: 'Precio de referencia = cierre del 30-jun-2026 (MXN 30.25), por indicación del profesor; antes se usaba 33.48 MXN del 25-sep-2026. Cada fuente se compara contra su propio precio y fecha.' },
    { topic: 'WACC', a: ['A valor de mercado (Kd histórico FY2025 13.0%)', XE.base.waccMarket.toFixed(2) + '%'], b: ['Iterado al valor DCF (Kd prospectivo 10%)', XE.base.wacc.toFixed(2) + '%'], used: 'Iterado (6 iteraciones)', note: 'El de mercado es solo el punto de partida de la iteración.' },
    { topic: 'Deuda total', a: ['Cierre 2025', '23,618 mdp'], b: ['2T26', '23,720.6 mdp'], used: 'Cierre 2025 para el EV; 2T26 para el puente a la fecha de valuación', note: 'El modelo usa ambos saldos en etapas distintas.' },
    { topic: 'Capitalización de mercado', a: ['Reportada (precio $30.10)', '54,180 mdp'], b: ['Precio de referencia × acciones', (XL.market.price * XL.market.shares).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' mdp'], used: 'Precio de referencia × 1,800 mm de acciones para el WACC de mercado', note: 'El Excel recalcula E con el precio de referencia.' }
  ],
  inputs: XL.registry.map(r => r.map(x => String(x ?? '')) as [string, string, string, string, string, string, string]),
  sources: [
    ['Excel PRO auditado', XL.file, 'Fuente maestra: DCF, inflación, Trading Comps, Precedent Transactions (CIQ y LSEG/SDC), combinada, contraste externo y validación (' + XL.expected.validation.checks.length + ' controles)'],
    ['Excel PRO original', 'EXCEL FINAL PRO DEFINITIVO SORIANA.xlsx (excel/original, sin cambios)', 'Versión del equipo antes de la auditoría; cambios en la hoja Auditoría'],
    ['LSEG/SDC (Refinitiv)', 'GridExport_October_19_2026_9_29_57.pdf · Current Screen Template, 19-oct-2026', '166 operaciones; 23 evaluadas en la hoja Transacciones SDC'],
    ['Reporte comparativo', 'Soriana_Reporte_Valuacion_CapitalIQ_Refinitiv.pdf (19-oct-2026)', 'DCF con estimados CIQ, múltiplos, transacciones, consenso CIQ y Refinitiv, StarMine (referencias)'],
    ['Banco de México', 'Serie SP74833 · INPC variación anual quincenal', 'Datos de los modelos de inflación (consulta 07-oct-2026)'],
    ['S&P Capital IQ', 'Quick Comparable Analysis (as-of 30-jun-2026)', 'Múltiplos publicados de 10 comparables (extracto con atribución)'],
    ['Regresión semanal Soriana B vs. IPC', 'Investing.com · hoja Beta y Kd §2', 'βL observada ' + XL.beta.regression.levered.toFixed(4) + ' → βU ' + XL.beta.regression.unlevered.toFixed(4) + ' (beta oficial del WACC)'],
    ['Damodaran (NYU Stern)', 'Betas by Sector (Global), enero 2026 · Retail (Grocery and Food)', 'βL 0.87, βU 0.65; corregida por caja 0.69 (referencia; beta oficial hasta el 19-oct-2026)'],
    ['S&P Capital IQ', 'Comparable M&A Transactions', '3 operaciones (histórico; no defendible)'],
    ['AE 1 · Etapa 1', 'PDF académico', 'Perfil, historia, gobierno corporativo, estructura de capital, dividendos'],
    ['Reportes trimestrales', 'Soriana 2T25–2T26 (BMV)', 'Estados financieros trimestrales capturados en el Excel']
  ],
  // Tablas de anexo (capa 2). Valores tal como aparecen en el Excel.
  annex: {
    statements: {
      cols: ['2T25', '3T25', '4T25', '1T26', '2T26', 'FY2025'],
      rows: [
        ['Ingresos totales', 45810.0, 42683.0, 47592.0, 40444.0, 43559.0, 177515.0],
        ['Costo de ventas', 34856.0, 31998.0, 35795.0, 30466.0, 32919.0, 134752.0],
        ['Utilidad bruta', 10954.0, 10685.0, 11797.0, 9978.0, 10640.0, 42764.0],
        ['Utilidad de operación (EBIT)', 1909.0, 1468.0, 2486.0, 1822.0, 1855.0, 7552.0],
        ['Gastos financieros', 829.0, 786.0, 616.0, 588.0, 582.0, 3074.0],
        ['Utilidad antes de impuestos', 1203.0, 764.0, 1763.0, 1326.0, 1372.0, 4766.0],
        ['Impuestos a la utilidad', 461.0, 179.0, 455.0, 492.0, 282.0, 1433.0],
        ['Utilidad neta consolidada', 743.0, 584.0, 1308.0, 834.0, 1090.0, 3334.0],
        ['Depreciación y amortización', 1105.9, 1049.3, 1051.0, 1048.9, 1030.6, 4342.0],
        ['Flujo neto de operación (CFO)', 4013.1, -205.9, 13017.0, -3565.6, 3916.0, 13738.0],
        ['Capex', 663.2, 775.2, 816.0, 501.0, 909.9, 2867.0],
        ['Efectivo y equivalentes', 7540.0, 5798.0, 9295.0, 4589.0, 6875.4, 9295.0],
        ['Inventarios', 37421.0, 36394.0, 32283.0, 32635.0, 35486.7, 32283.0],
        ['Activo circulante', 52131.0, 49767.0, 48529.0, 43562.0, 49259.8, 48529.0],
        ['Activo total', 159842.0, 157502.0, 156038.0, 150941.0, 156813.0, 156038.0],
        ['Pasivo circulante', 41065.0, 38190.0, 39219.0, 33850.0, 41957.9, 39219.0],
        ['Pasivo a largo plazo', 34801.0, 34753.0, 32086.0, 31527.0, 28201.1, 32086.0],
        ['Pasivo total', 75866.0, 72943.0, 71306.0, 65377.0, 70159.0, 71306.0],
        ['Capital contable', 83976.0, 84559.0, 84732.0, 85564.0, 86654.0, 84732.0],
        ['Deuda bursátil y bancaria CP', 6627.0, 6553.0, 3000.0, 3000.0, 6500.0, 3000.0],
        ['Deuda bursátil y bancaria LP', 11500.0, 11500.0, 8500.0, 8500.0, 5000.0, 8500.0],
        ['Pasivo por arrendamiento CP', 638.0, 659.0, 676.0, 683.0, 640.0, 676.0],
        ['Pasivo por arrendamiento LP', 11389.0, 11506.0, 11442.0, 11540.0, 11580.6, 11442.0],
        ['Deuda total (financiera + arrendamientos)', 30154.0, 30218.0, 23618.0, 23723.0, 23720.6, 23618.0]
      ]
    }
  }
};
