// ValuFlow · Tipos del modelo. Un "Dataset" describe una empresa (solo datos);
// el motor (engine/*) no conoce a ninguna empresa en particular.

/** Un número o una razón escrita como 'r:numerador/denominador' (se conserva la precisión del Excel). */
export type Ratio = number | string;
export type Series = Ratio | Ratio[];

export interface Profile {
  name: string;
  short?: string;
  legalName?: string;
  ticker?: string;
  exchange?: string;
  country?: string;
  currency: string;
  /** 'mdp' (millones de pesos) o 'mm' (millones de la moneda). */
  units?: string;
  sector?: string;
  industry?: string;
  founded?: string;
  hq?: string;
  listed?: string;
  stores?: number;
  employees?: number;
  formats?: string[];
  logo?: string | null;
  brand?: string | null;
  brand2?: string;
  domain?: string;
  description?: string;
}

export interface Dates {
  base: string;
  balance?: string;
  valuation: string;
  price: string;
  nextReport?: string;
}

export interface Market {
  price: number | null;
  shares: number | null;
  marketCap?: number | null;
  consensus?: number | null;
  consensusLabel?: string;
  low52?: number;
  high52?: number;
  pe?: number;
  pbv?: number;
  bvps?: number;
  divYield?: number;
  lastDiv?: number;
  chg1y?: number;
  rating?: string;
  rsi?: number;
  macd?: number;
  ma50?: number;
  ma200?: number;
  technical?: string;
  [k: string]: unknown;
}

export interface Drivers {
  growth: Series;
  margin: Series;
  tax: Series;
  da: Series;
  capex: Series;
  nwcPct: Series;
}

export interface ForecastBase {
  revenue: number | null;
  ebit: number | null;
  da: number | null;
  capex: number | null;
  nwc?: number | null;
  fcf?: number | null;
  ebitda?: number | null;
}

/** Filas de una proyección explícita (p. ej. hoja "Proyección final" del Excel). Los drivers se derivan de ellas. */
export interface ForecastRows {
  revenue: number[];
  ebit: number[];
  taxEbit: number[];
  da: number[];
  capex: number[];
  nwcRelease: number[];
}

export interface Forecast {
  baseYear: string;
  years: string[];
  base: ForecastBase;
  rows?: ForecastRows;
  drivers?: Drivers;
  /** Proyección construida desde sus drivers (réplica de la hoja de proyección del Excel). Tiene prioridad sobre rows. */
  build?: BuildSpec;
}

/** Un ajuste por año con su etiqueta y celda de origen. */
export interface LabeledSeries { label: string; cell?: string; values: number[] }

/**
 * Drivers de la proyección por variables externas + mínimos cuadrados (hoja "Proyección Final" del Excel).
 * Todos los porcentajes son fracciones (0.035 = 3.5%). Un valor por año proyectado salvo donde se indica.
 */
export interface BuildSpec {
  source?: string;
  /** Peso de variables externas; el de mínimos cuadrados es 1 − peso. */
  weightsExternal: number[];
  sales: {
    gdp: number[]; elasticity: number[]; consumptionAdj: number[];
    adjustments: LabeledSeries[];
    /** Ventas por mínimos cuadrados: año base + un valor por año proyectado. */
    lsSales: number[];
  };
  margin: { base: number; adjustments: LabeledSeries[]; ls: number[] };
  da: { ext: number[]; ls: number[] };
  /** Capex: monto guía (mdp) si existe para el año; si no, basePct × (1 + extAdj) + add. */
  capex: { guide: (number | null)[]; add: number[]; basePct: number; extAdj: number; ls: number[] };
  tax: { base: number; adj: number[]; ls: number[] };
  invDays: number[]; otherCAPct: number[]; opCLPct: number[]; costPct: number[];
  interestRate: number[]; debtAmort: number[]; payout: number[]; otherIncome: number[];
  base: { revenue: number; cash: number; inventory: number; otherCA: number; nonCurrent: number; opCL: number; debt: number; lease: number; otherLT: number; equity: number; ebit?: number; da?: number };
}

/** Escenario de inflación documentado: trayectoria por año (path) o valor constante (value). */
export interface InflationScenario { label: string; kind: string; source?: string; cell?: string; path?: number[]; value?: number; /** Referencia (p. ej. histórica): se calcula para comparar, no es escenario. */ reference?: boolean }

export interface InflationModel { a: number | null; b: number | null; r2: number | null; xNext: number | null; forecast: number | null; n: number | null }

export interface InflationSpec {
  source?: string;
  default: string;
  /** Escenarios oficiales (seleccionables). */
  order: string[];
  /** Trayectorias de referencia (se muestran para comparar; no son escenarios). */
  references?: string[];
  scenarios: Record<string, InflationScenario>;
  /** Serie observada [fecha ISO, % anual]. */
  series?: [string, number][];
  /** Resultados de los modelos en el Excel (para validar el cálculo propio de la app). */
  models?: Record<string, InflationModel>;
  quarterlyAverages?: number[];
  chain?: [string, string, string][];
  beta?: { historical: number; r2: number; n: number; reported: number; wacc: number };
}

/** Beta sectorial de referencia externa y su tratamiento en el WACC. */
export interface BetaSpec {
  source: string; url?: string; date: string; industry: string; firms?: number;
  levered: number; de: number; effTax?: number; marginalTax: number; unlevered: number; cashFirm?: number; unleveredCash?: number;
  /** βU recalculada = βL / [1 + (1 − t) × D/E] con los datos publicados. */
  check?: number;
  /** Beta del modelo anterior (solo para reproducir el baseline histórico). */
  inherited?: number;
  used: number; treatment: string[];
  kd?: { value: number; check: number; fy2025?: number; source: string; checkNote?: string };
}

/** Múltiplos de un comparable (null = NA). */
export interface PeerMultiples { evSales: number | null; evEbitda: number | null; evEbit: number | null; pe: number | null; ptbv?: number | null; evEbitdaNtm?: number | null; peNtm?: number | null }

export interface Peer {
  name: string; country?: string; industry?: string; model?: string; tevUsd?: number | null; salesUsd?: number | null;
  ebitdaMargin?: number | null; growth?: number | null; leverage?: number | null;
  classification: string; include: number; reason: string; multiples: PeerMultiples;
}

export type MultipleKey = 'evSales' | 'evEbitda' | 'evEbit' | 'pe' | 'ptbv' | 'evEbitdaNtm' | 'peNtm';
export type MetricKey = 'revenue' | 'ebitda' | 'ebit' | 'eps';

export interface MultipleDef { key: MultipleKey; label: string; kind?: string; metric: MetricKey | null; use: number; status: string; reason: string }

/** Métricas de la empresa objetivo y puente EV → capital (misma fecha que los múltiplos). */
export interface CompsTarget {
  revenue: number; ebit: number; da?: number; ebitda: number; netIncome?: number; shares: number; eps: number;
  cash: number; debt: number; lease: number; minority: number; preferred: number; sources?: Record<string, string>;
}

export interface CompsSpec {
  source?: string; asOf?: string; note?: string;
  peers: Peer[]; ciqMean?: Partial<Record<MultipleKey, number>>;
  target: CompsTarget; multiples: MultipleDef[];
}

export interface Deal {
  date: string; id: string; target: string; buyer?: string; seller?: string; tev?: number; size?: number;
  evSales: number | null; evEbitda: number | null; country?: string; industry?: string; control?: string; include: number; note?: string;
}

export interface TransactionsSpec {
  source?: string; warning?: string;
  criteria: { valuationDate: string; windowYears: number; geography: string; minMultiples: number };
  deals: Deal[]; ciqMean?: { evSales?: number; evEbitda?: number };
  multiples: MultipleDef[];
}

export interface CombinedSpec { weights: { dcf: number; comps: number; transactions: number }; reasons?: Record<string, string>; classRule?: string }

export interface WaccInputs {
  rf: number;
  prm: number;
  prmMature?: number;
  countryRisk?: number;
  betaU: number;
  taxMarket?: number;
  taxShield: number;
  kdPre: number;
  kdMarket?: number;
  interestFY?: number;
  /** Deuda total usada en la estructura de capital (si falta: deuda + arrendamientos del puente). */
  debt?: number;
  equityMarket?: number | null;
  mode?: WaccMode;
  start?: number;
  /** Número fijo de iteraciones del WACC (el Excel usa 6 filas). Por defecto: hasta converger (máx. 14). */
  iterations?: number;
  /**
   * Relación de Fisher (Excel, hoja Escenarios filas 12-15): la tasa real implícita sale de Rf y la inflación base;
   * con la inflación de los supuestos: Rf = (1 + real) × (1 + inflación) − 1, y el mismo cambio se suma al Kd.
   * baseInflation: inflación del escenario base (fracción); si falta, sale del estudio (dataset.study).
   */
  fisher?: { baseInflation?: number };
}

export interface Roll {
  enabled: boolean;
  t1?: number;
  t2?: number;
  fcfGenerated?: number;
  debt?: number;
  lease?: number;
  cash?: number;
  /** Fechas ISO del cierre y del balance intermedio: con ellas t₁ y t₂ salen de DAYS360 (como el Excel) y la fecha de valuación es editable. */
  dateClose?: string; dateBalance?: string; dateValuation?: string;
}

export interface Valuation {
  g: number;
  exitMultiple?: number | null;
  comparablesMedian?: number;
  multipleDiscount?: number;
  wGordon?: number;
  bridge: { debt: number; lease: number; cash: number };
  roll?: Roll;
  signalThreshold?: number;
}

/** Resultados de referencia (Excel) para la capa de validación. */
export interface Expected {
  fcf: number[];
  pvFcf: number; tvG: number; pvTvG: number; evG: number;
  tvM?: number; pvTvM?: number; evM: number; evW: number; ev2: number; eq2?: number; eqVal: number;
  price: number; upside: number; wacc: number; ke: number; priceG: number; priceM: number; priceW: number; tvWeight: number;
  waccMarket: number; keMarket: number; betaMarket?: number;
  /** Valor terminal ponderado (sin descontar) y g implícita en el múltiplo de salida (fracción). */
  tvBlend?: number; impliedG?: number;
  /** Valuación relativa y combinada (precio por acción). */
  comps?: number; transactions?: number; combined?: number;
}

/** Resultados del Excel por escenario (fracciones; montos en la unidad del dataset). */
export interface ExpectedScenario {
  inflation: number; salesCagr: number; marginAvg: number; betaIter: number; rf: number; ke: number; wacc: number; g: number; fcf2030: number;
  pvFcf: number; tvG: number; tvBlend: number; ev: number; equity: number; price: number; diff: number; diffPct: number; recommendation: string; betaLevered: number;
}

/** Textos del estudio con marcadores {clave} que se llenan con cifras vivas del motor. */
export interface TextTemplates {
  conclusions: [string, string][]; summary: string; sensitivity: string[]; reasons: string[]; limits: string[]; wacc: string[];
  /** Preguntas de análisis: [pregunta, respuesta]. */
  questions: [string, string][];
}

/**
 * Etiquetas que dependen de la empresa y de sus fechas. Antes estaban escritas
 * a mano en la interfaz ("2T26", "1S26", "Bono M 10 años"…); ahora vienen del dataset.
 */
export interface Labels {
  /** Fecha del valor al cierre del año base, p. ej. "cierre 2025". */
  closeDate?: string;
  /** Fecha del balance intermedio usado al llevar el valor a la fecha de valuación, p. ej. "2T26". */
  rollDate?: string;
  /** Periodo del FCF ya generado entre el cierre y el balance intermedio, p. ej. "1S26". */
  rollFcf?: string;
  /** Fuente de la tasa libre de riesgo, p. ej. "Bono M 10 años". */
  rfSource?: string;
  /** Nombre corto de la fuente primaria de los números ("Excel", "Archivo"…). */
  sourceShort?: string;
  /** Fuente del múltiplo de salida. */
  multipleSource?: string;
}

export interface Ratio5 { cat: string; name: string; unit: string; v: number[]; avg: number; read?: string }

export interface Governance {
  board: number; patrimonial: number; related: number; independent: number; independencePct: number; bestPractice: number;
  chair: string; ceo: string; committees: [string, string][]; controls: string[];
}

export type AnnexRow = (string | number | null)[] | { section: string };

export interface SensTable { label: string; rowsLabel: string; colsLabel: string; cols: string[]; rowHeads: string[]; grid: number[][] }

export interface Annex {
  statements: { cols: string[]; rows: (string | number)[][] };
  projected: { cols: string[]; rows: AnnexRow[] };
  sensitivity: Record<string, SensTable>;
}

export interface ImportedField {
  key: string; label: string; value: number | null; period?: string | null; srcLabel?: string | null; srcSheet?: string | null; conf?: string;
}

/** Series crudas y parámetros del estudio de soporte (inflación, precios, crecimiento perpetuo y escenarios). */
export interface StudySpec {
  inflation: {
    source?: string;
    /** Serie quincenal [fecha ISO, % anual]. */
    series: [string, number][];
    /** Inicio de la ventana larga de los modelos de tendencia (fecha ISO). */
    longWindowStart: string;
    /** Inflación del escenario conservador (fracción; techo del rango de la meta). */
    scenarioConservative: number;
    why?: Record<string, string>;
    references?: [string, number][];
  };
  prices: {
    source?: string;
    /** Precios semanales [fecha ISO, empresa, índice de mercado] (null = sin dato). */
    weekly: [string, number | null, number | null][];
    counts?: Record<string, number | string>;
    betaWindowWeeks: number;
    betaMinObs: number;
  };
  growth: {
    references: [string, number, string, string, string][];
    scenarios: Record<string, number>;
    why?: Record<string, string>;
    /** Ventas de dos años antes del año base (mdp) para la CAGR histórica. */
    sales2023: number;
    bondExpected: number; inflLT: number; gdpLT: number; banxicoTarget: number;
    intro?: string;
  };
  scenarios: {
    order: string[]; labels: Record<string, string>; default: string;
    salesAdj: Record<string, number>; marginAdj: Record<string, number>;
    /** Desplazamiento de la beta en errores típicos de la regresión. */
    betaShiftSE: Record<string, number>;
    why?: string[];
  };
}

export interface Dataset {
  id: string;
  builtIn: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  source: { kind: string; file?: string };
  profile: Profile;
  dates: Dates;
  market: Market;
  forecast: Forecast;
  wacc: WaccInputs;
  valuation: Valuation;
  labels?: Labels;
  expected?: Expected;
  /** Resultados de referencia por escenario (la clave es el escenario del estudio). */
  expectedScenarios?: Record<string, ExpectedScenario>;
  texts?: TextTemplates;
  inflation?: InflationSpec;
  beta?: BetaSpec;
  /** Estudio de soporte (series crudas): el motor calcula inflación, beta, escenarios y controles. */
  study?: StudySpec;
  /** Notas metodológicas del modelo (p. ej. referencia del DCF de Capital IQ). */
  notes?: string[];
  comps?: CompsSpec;
  transactions?: TransactionsSpec;
  combined?: CombinedSpec;
  quarterly?: { periods: string[]; [k: string]: string[] | number[] };
  ratios?: Ratio5[];
  governance?: Governance;
  timeline?: [string, string, string, string][];
  dividends?: [string, string, number][];
  news?: [string, string][];
  sources?: [string, string, string][];
  /** Registro de insumos: [insumo, dónde se usa, valor, fecha, unidad, tipo (Observado/Supuesto/Modelo/Pendiente), fuente]. */
  inputs?: [string, string, string, string, string, string, string][];
  annex?: Annex;
  history?: Record<string, { year: number | null; label: string; v: number }[]>;
  imported?: ImportedField[];
  research?: unknown;
}

export type WaccMode = 'iterated' | 'market' | 'manual';

/** Supuestos editables. Los porcentajes se capturan en puntos (12.5 = 12.5%). */
export interface Assumptions {
  forecastKey: string;
  dGrowth: number; dMargin: number; dCapex: number; dTax: number;
  g: number;
  waccMode: WaccMode;
  waccManual: number;
  keFixed: number | null;
  rf: number; prm: number; betaU: number;
  kdPre: number; kdMarket: number;
  taxShield: number; taxMarket: number;
  exitMultiple: number | null;
  wGordon: number;
  price: number | null; shares: number | null;
  rollEnabled: boolean;
  bridgeDebt: number; bridgeLease: number; bridgeCash: number;
  /** Escenario de inflación documentado (solo si el dataset trae inflation). */
  inflation?: string;
  /** Inclusión de comparables / operaciones y uso de múltiplos (solo cambios respecto al dataset). */
  compsInclude?: Record<string, number>; compsUse?: Record<string, number>;
  dealsInclude?: Record<string, number>; dealsUse?: Record<string, number>;
  /** Pesos de la valuación combinada (fracciones). */
  weights?: { dcf: number; comps: number; transactions: number };
  /** Escenario activo (preset del dataset) y sus parámetros, editables uno por uno en el Laboratorio. */
  scenario?: string;
  /** Inflación anual constante 2026E–2030E (fracción). Mueve ventas y, con Fisher, Rf y Kd. */
  inflationRate?: number;
  /** Ajuste al crecimiento de ventas por variables externas y al margen EBIT (fracciones; Excel Escenarios filas 8 y 9). */
  salesAdj?: number; marginAdj?: number;
  /** Beta apalancada a la estructura de mercado (regresión); el motor la desapalanca con el D/E de mercado. */
  betaLevered?: number;
  /** Fecha de valuación (ISO). Mueve t₂ = DAYS360(balance intermedio, fecha) / 360. */
  valuationDate?: string;
}

export interface DriverSet {
  years: string[]; n: number; rev0: number; nwc0: number;
  growth: number[]; margin: number[]; tax: number[]; da: number[]; capex: number[]; nwcPct: number[];
  derived: boolean;
  /** Detalle de la proyección construida desde drivers (si aplica). */
  build?: BuildResult;
}

export interface BuildYear {
  year: string; inflation: number; marketGrowth: number; growthExternal: number; growthLS: number; growth: number;
  marginExternal: number; margin: number; daPct: number; capexPctExternal: number; capexPct: number; taxRate: number;
  revenue: number; cogs: number; gross: number; opex: number; ebitda: number; da: number; ebit: number; interest: number; otherIncome: number;
  ebt: number; taxes: number; netIncome: number; dividends: number;
  cash: number; inventory: number; otherCA: number; currentAssets: number; nonCurrent: number; totalAssets: number;
  opCL: number; debt: number; lease: number; otherLT: number; totalLiabilities: number; equity: number; liabEquity: number; check: number;
  dInventory: number; dOtherCA: number; capex: number; dOpCL: number; dDebt: number; cashChange: number;
  taxEbit: number; nopat: number; nwcRelease: number; fcf: number;
}

export interface BuildResult { scenario: string | null; inflation: number[]; years: BuildYear[]; rows: ForecastRows }

export interface ProjRow {
  year: string; n: number; growth: number; revenue: number; margin: number; ebit: number; taxRate: number; tax: number; nopat: number;
  da: number; capex: number; capexPct: number; nwc: number; dNwc: number; fcf: number; ebitda: number;
  df?: number; pv?: number;
}

export interface WaccLeg {
  E: number; D: number; de: number; beta: number; ke: number; kd: number; kdAT: number; wE: number; wD: number; tax: number; wacc: number;
  converged?: boolean;
}

export interface WaccIter { k: number; win: number; E: number; de: number; beta: number; ke: number; wout: number; wE: number; wD: number }

export interface WaccResult {
  wacc: number; ke: number; mode: WaccMode; market: WaccLeg; iterated: WaccLeg | null; iters: WaccIter[]; src: WaccLeg | null;
  rf: number; prm: number; betaU: number;
  /** Rf antes del ajuste de Fisher y cambio aplicado al Kd (0 sin Fisher). */
  rfBase?: number; kdShift?: number;
}

export interface RollResult {
  t1: number; t2: number; cap: number; evCap: number; capGain: number; fcfGenerated: number; ev2: number;
  debt: number; lease: number; cash: number; eq2: number; keCap: number; keGain: number; eq3: number;
}

export interface RunFail { ok: false; errors: string[]; warnings: string[]; rows: ProjRow[]; W: WaccResult; drivers: DriverSet }

export interface RunOk {
  ok: true; errors: string[]; warnings: string[]; rows: (ProjRow & { df: number; pv: number })[]; drivers: DriverSet; W: WaccResult;
  wacc: number; ke: number; g: number;
  pvSum: number; fcfN1: number; tvG: number; pvTvG: number; evG: number;
  mult: number | null; tvM: number | null; pvTvM: number | null; evM: number | null; wG: number; evW: number;
  nd: number; eqClose: number; priceClose: number; priceG: number; priceM: number | null;
  pvTvW: number; tvWeightG: number; tvWeightW: number;
  roll: RollResult | null; eqVal: number; ev: number; value: number; price: number; shares: number;
  upside: number | null; signal: string | null; threshold: number; impliedMultiple: number;
}

export type RunResult = RunOk | RunFail;
