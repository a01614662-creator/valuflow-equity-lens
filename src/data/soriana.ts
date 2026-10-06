// ValuFlow · Dataset del caso Soriana. Fuente primaria: Excel "VALUACIÓN DEFINITIVA SORIANA".
// Este archivo es solo DATOS. El motor (src/engine) no conoce a Soriana.
// Los números son idénticos a project/vf-data-soriana.js (tests/parity.test.ts lo comprueba).
import type { Dataset } from '../engine/types';

export const soriana: Dataset = {
  id: 'soriana', builtIn: true, version: 'Excel definitivo · Proyección final', createdAt: '2026-10-01', updatedAt: '2026-10-01',
  source: { kind: 'Excel', file: 'VALUACION DEFINITIVA SORIANA.xlsx' },
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
  dates: { base: '31-dic-2025', balance: '30-jun-2026 (2T26)', valuation: '01-oct-2026', price: '25-sep-2026', nextReport: '23-oct-2026' },
  market: {
    price: 33.48, shares: 1800, marketCap: 60264, consensus: 23.36, consensusLabel: 'Venta · 0 C / 1 M / 6 V',
    low52: 23.90, high52: 42.70, pe: 18.08, pbv: 0.71, bvps: 47.07, divYield: 1.66, lastDiv: 0.5556,
    chg1y: 21.3, rating: 'HR+1 (HR Ratings, corto plazo)', rsi: 75, macd: 1.154, ma50: 29.68, ma200: 29.71, technical: 'Compra fuerte',
    hrRevenue2027: 196480
  },
  // Proyección final (hoja "Proyección final Soriana"). Los drivers se derivan de estas filas.
  forecast: {
    baseYear: '2025A', years: ['2026E', '2027E', '2028E', '2029E', '2030E'],
    base: { revenue: 177515.0, ebit: 7551.0, da: 4342.0, capex: 2867.0, nwc: 3691.0, fcf: 6761.4, ebitda: 11893.0 },
    rows: {
      revenue: [170043.1, 167793.9, 169496.0, 173233.0, 178318.2],
      ebit: [7719.4, 7582.1, 7647.8, 7810.3, 8038.5],
      taxEbit: [2065.1, 2054.9, 2116.0, 2205.2, 2315.2],
      da: [4142.7, 4087.9, 4132.1, 4226.0, 4353.0],
      capex: [3835.2, 3318.3, 3345.7, 3413.1, 3506.7],
      nwcRelease: [86.0, 7.2, 274.6, -73.3, -99.7]
    }
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
  wacc: {
    rf: 9.52, prm: 4.23, prmMature: 4.23, countryRisk: 2.46, betaU: 0.80,
    taxMarket: 30.0, taxShield: 28.80, kdPre: 10.00, kdMarket: 13.02, interestFY: 3074.0,
    debt: 23618.0, equityMarket: 60264.0, mode: 'iterated', start: 12.50
  },
  valuation: {
    g: 3.50, exitMultiple: 5.8108, comparablesMedian: 6.4564, multipleDiscount: 10.0, wGordon: 0.50,
    bridge: { debt: 11500.0, lease: 12118.0, cash: 9295.0 },
    roll: { enabled: true, t1: 0.50, t2: 0.2528, fcfGenerated: 1060.5, debt: 11500.0, lease: 12220.6, cash: 6875.4 },
    signalThreshold: 15
  },
  // Resultados del Excel para la capa de validación.
  expected: {
    fcf: [6047.8, 6304.0, 6592.9, 6344.8, 6470.0], pvFcf: 22891.8, tvG: 79934.9, pvTvG: 45606.4, evG: 68498.1,
    tvM: 72004.4, pvTvM: 41081.7, evM: 63973.5, evW: 66235.8, ev2: 71119.5, eq2: 54274.3, eqVal: 56095.9,
    price: 31.16, upside: -6.9, wacc: 11.88, ke: 13.95, priceG: 30.10, priceM: 27.58, priceW: 28.84, tvWeight: 66.6,
    waccMarket: 12.50, keMarket: 13.83, betaMarket: 1.02,
    sensRow: [29.57, 30.32, 31.16, 32.11, 33.19]
  },
  waccIterationExcel: [
    [0, 12.50, 49499.3, 0.4771, 1.0718, 14.05, 11.81], [1, 11.81, 54706.7, 0.4317, 1.0459, 13.94, 11.88],
    [2, 11.88, 54119.2, 0.4364, 1.0486, 13.95, 11.88], [3, 11.88, 54181.1, 0.4359, 1.0483, 13.95, 11.88],
    [4, 11.88, 54174.5, 0.4360, 1.0483, 13.95, 11.88], [5, 11.88, 54175.2, 0.4360, 1.0483, 13.95, 11.88]
  ],
  method: {
    weightsExternal: [70, 70, 75, 80, 85],
    growthExternal: [-3.47, 0.93, 3.70, 4.65, 4.90], growthLS: [-5.9, -6.6, -7.0, -7.6, -8.2], growthFinal: [-4.21, -1.32, 1.01, 2.20, 2.94],
    marginExternal: [4.37, 4.34, 4.37, 4.40, 4.43], marginLS: [4.93, 4.93, 4.93, 4.93, 4.93], marginFinal: [4.54, 4.52, 4.51, 4.51, 4.51],
    capexFinal: [2.26, 1.98, 1.97, 1.97, 1.97], taxFinal: [26.75, 27.10, 27.67, 28.23, 28.80], daFinal: [2.44, 2.44, 2.44, 2.44, 2.44],
    salesLS: [163937, 153151, 142365, 131580, 120794], salesConst: [183728.0, 190158.5, 196814.1, 203702.5, 210832.1], salesLTM: 174278,
    salesConstLabel: 'Supuestos constantes (3.5%)', salesLSLabel: 'Mínimos cuadrados (LTM)',
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
  discrepancies: [
    { topic: 'Valor intrínseco por acción', a: ['Material maestro / app Base44 (DCF Sesión 2)', '$35.24 · $34.44'], b: ['Excel · Proyección final', '$31.16'], used: 'Excel · Proyección final', note: 'El caso base anterior usa supuestos constantes (3.5% ventas, WACC 12.50%, solo Gordon). La proyección final pondera métodos, itera el WACC y lleva el valor a la fecha de valuación.' },
    { topic: 'WACC', a: ['AE 1 · Sesión 2', '10.22% · 12.50%'], b: ['Excel · WACC iterado', '11.88%'], used: 'Excel · 11.88% (iterado al valor DCF)', note: '12.50% es el WACC a valor de mercado; la iteración usa el equity del propio DCF.' },
    { topic: 'Deuda total', a: ['Cierre 2025', '23,618 mdp'], b: ['2T26', '23,720.6 mdp'], used: 'Cierre 2025 para el EV; 2T26 para el puente a la fecha de valuación', note: 'El modelo usa ambos saldos en etapas distintas.' },
    { topic: 'Múltiplo P/U', a: ['Material maestro', '14.25x'], b: ['Excel · ratios de mercado', '18.08x'], used: 'Excel · 18.08x', note: 'Diferente fecha de corte de la utilidad.' },
    { topic: 'Capex 1S26', a: ['Material maestro', '1,638 mdp'], b: ['Excel · reporte 2T26', '1,411 mdp'], used: 'Excel', note: 'Sin impacto en el DCF (el modelo usa FCF 1S26 = CFO − Capex real).' },
    { topic: 'Rendimiento por dividendo', a: ['Material maestro', '1.8%'], b: ['Excel', '1.66%'], used: 'Excel · 1.66%', note: 'Distinto precio de referencia.' },
    { topic: 'Capitalización de mercado', a: ['Reportada (precio $30.10)', '54,180 mdp'], b: ['Precio actual × acciones', '60,264 mdp'], used: '60,264 mdp para el WACC de mercado', note: 'El Excel recalcula E con el precio vigente.' }
  ],
  sources: [
    ['Excel definitivo', 'VALUACIÓN DEFINITIVA SORIANA.xlsx', 'Fuente primaria de números, supuestos y resultados'],
    ['AE 1 · Etapa 1', 'PDF académico', 'Perfil, historia, gobierno corporativo, estructura de capital, dividendos'],
    ['Sesión 2', 'Valuación y comparativas de Soriana y mercado', 'DCF de la segunda entrega y razones financieras'],
    ['Material maestro', 'Material maestro de contexto (PDF)', 'Contexto consolidado, equipo y reglas de producto'],
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
    },
    projected: {
      cols: ['2025A', '2026E', '2027E', '2028E', '2029E', '2030E'],
      rows: [
        { section: 'Estado de resultados' },
        ['Ventas', 177515.0, 170043.1, 167793.9, 169496.0, 173233.0, 178318.2],
        ['Costo de ventas', -134752.0, -128552.6, -127020.0, -128477.9, -131310.6, -135165.2],
        ['Utilidad bruta', 42763.0, 41490.5, 40773.9, 41018.0, 41922.4, 43153.0],
        ['Gastos de operación (sin D&A)', -30870.0, -29628.4, -29103.9, -29238.0, -29886.1, -30761.5],
        ['EBITDA', 11893.0, 11862.1, 11670.0, 11780.0, 12036.3, 12391.5],
        ['Depreciación y amortización', -4342.0, -4142.7, -4087.9, -4132.1, -4226.0, -4353.0],
        ['Utilidad de operación (EBIT)', 7551.0, 7719.4, 7582.1, 7647.8, 7810.3, 8038.5],
        ['Gastos financieros', -3074.0, -2361.8, -2302.8, -2156.5, -2010.3, -1864.0],
        ['Utilidad antes de impuestos', 4765.0, 5357.6, 5279.3, 5491.3, 5800.0, 6174.5],
        ['Impuestos a la utilidad', -1433.0, -1433.3, -1430.8, -1519.4, -1637.6, -1778.3],
        ['Utilidad neta', 3332.0, 3924.3, 3848.5, 3972.0, 4162.4, 4396.2],
        ['Dividendos pagados', null, -1177.9, -1155.1, -1192.2, -1249.3, -1319.5],
        { section: 'Balance general' },
        ['Efectivo y equivalentes', 9295.0, 12435.0, 14405.2, 16746.1, 18898.9, 21222.2],
        ['Inventarios', 32283.0, 30993.5, 30624.0, 30623.5, 31298.7, 32217.5],
        ['Otros activos circulantes', 6951.0, 6658.4, 6570.3, 6637.0, 6783.3, 6982.5],
        ['Activo no circulante', 107509.0, 107201.5, 106431.9, 105645.4, 104832.5, 103986.2],
        ['Activo total', 156038.0, 157288.4, 158031.5, 159652.1, 161813.4, 164408.3],
        ['Pasivo circulante operativo', 35543.0, 34046.9, 33596.6, 33937.4, 34685.6, 35703.8],
        ['Deuda bursátil y bancaria', 11500.0, 11500.0, 10000.0, 8500.0, 7000.0, 5500.0],
        ['Pasivo por arrendamiento', 12118.0, 12118.0, 12118.0, 12118.0, 12118.0, 12118.0],
        ['Otros pasivos a largo plazo', 12145.0, 12145.0, 12145.0, 12145.0, 12145.0, 12145.0],
        ['Pasivo total', 71306.0, 69809.9, 67859.6, 66700.4, 65948.6, 65466.8],
        ['Capital contable', 84732.0, 87478.5, 90171.9, 92951.7, 95864.8, 98941.5],
        ['Comprobación (A − P − C)', 0, 0, 0, 0, 0, 0]
      ]
    },
    sensitivity: {
      waccG: { label: 'WACC vs. g', rowsLabel: 'WACC', colsLabel: 'g', cols: ['2.50%', '3.00%', '3.50%', '4.00%', '4.50%'], rowHeads: ['10.88%', '11.38%', '11.88%', '12.38%', '12.88%'], grid: [[32.40, 33.38, 34.50, 35.77, 37.25], [30.92, 31.78, 32.74, 33.84, 35.09], [29.57, 30.32, 31.16, 32.11, 33.19], [28.33, 28.99, 29.73, 30.56, 31.50], [27.18, 27.77, 28.43, 29.16, 29.98]] },
      salesMargin: { label: 'Δ Ventas vs. Δ Margen EBIT', rowsLabel: 'Δ ventas', colsLabel: 'Δ margen', cols: ['-0.50', '-0.25', '0.00', '+0.25', '+0.50'], rowHeads: ['-2.00', '-1.00', '0.00', '+1.00', '+2.00'], grid: [[24.82, 26.48, 28.15, 29.81, 31.47], [26.16, 27.89, 29.63, 31.36, 33.10], [27.55, 29.36, 31.16, 32.97, 34.78], [28.98, 30.87, 32.75, 34.64, 36.53], [30.47, 32.43, 34.40, 36.36, 38.33]] },
      waccMult: { label: 'WACC vs. múltiplo EV/EBITDA', rowsLabel: 'WACC', colsLabel: 'Múltiplo', cols: ['4.81x', '5.31x', '5.81x', '6.31x', '6.81x'], rowHeads: ['10.88%', '11.38%', '11.88%', '12.38%', '12.88%'], grid: [[32.26, 33.38, 34.50, 35.61, 36.73], [30.55, 31.65, 32.74, 33.84, 34.93], [29.02, 30.09, 31.16, 32.24, 33.31], [27.63, 28.68, 29.73, 30.79, 31.84], [26.37, 27.40, 28.43, 29.46, 30.49]] },
      capexTax: { label: 'Δ Capex vs. Δ Tasa de impuestos', rowsLabel: 'Δ capex', colsLabel: 'Δ tasa', cols: ['-4.00', '-2.00', '0.00', '+2.00', '+4.00'], rowHeads: ['-0.50', '-0.25', '0.00', '+0.25', '+0.50'], grid: [[36.32, 35.64, 34.95, 34.27, 33.59], [34.43, 33.74, 33.06, 32.38, 31.69], [32.53, 31.85, 31.16, 30.48, 29.80], [30.64, 29.95, 29.27, 28.59, 27.90], [28.74, 28.06, 27.37, 26.69, 26.01]] }
    }
  }
};
