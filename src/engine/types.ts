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
}

export interface AltForecast {
  label: string;
  /** Nombre corto para botones (p. ej. "Supuestos constantes"). */
  short?: string;
  source?: string;
  drivers: Drivers;
  overrides: Partial<Assumptions>;
  expected?: { price: number; ev?: number; equity?: number };
}

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
}

export interface Roll {
  enabled: boolean;
  t1?: number;
  t2?: number;
  fcfGenerated?: number;
  debt?: number;
  lease?: number;
  cash?: number;
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
  sensRow: number[];
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

export interface LeastSquaresSeries {
  key: string; label: string; unit: string; y: number[]; a: number; b: number; r2: number; fc: number[];
}

/** Metodología de proyección documentada (opcional; solo si la empresa la trae). */
export interface Method {
  weightsExternal: number[];
  growthExternal: number[]; growthLS: number[]; growthFinal: number[];
  marginExternal: number[]; marginLS: number[]; marginFinal: number[];
  capexFinal: number[]; taxFinal: number[]; daFinal: number[];
  salesLS: number[]; salesConst: number[]; salesLTM: number;
  salesConstLabel?: string; salesLSLabel?: string;
  externalNet: { sales: number; costs: number; capex: number };
  leastSquares: LeastSquaresSeries[];
  lsQuarters: string[]; lsForecastQuarters: string[];
  fcffLTM: { projected: number; actual: number; adjusted: number };
  /** [categoría, variable, dato observado, partida, efecto, Δventas, Δcostos, Δcapex] */
  external: [string, string, string, string, string, number, number, number][];
}

export interface Ratio5 { cat: string; name: string; unit: string; v: number[]; avg: number; read: string }

export interface Governance {
  board: number; patrimonial: number; related: number; independent: number; independencePct: number; bestPractice: number;
  chair: string; ceo: string; committees: [string, string][]; controls: string[];
}

export interface Discrepancy { topic: string; a: [string, string]; b: [string, string]; used: string; note: string }

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
  altForecasts?: Record<string, AltForecast>;
  wacc: WaccInputs;
  valuation: Valuation;
  labels?: Labels;
  expected?: Expected;
  waccIterationExcel?: number[][];
  method?: Method;
  quarterly?: { periods: string[]; [k: string]: string[] | number[] };
  ratios?: Ratio5[];
  governance?: Governance;
  timeline?: [string, string, string, string][];
  dividends?: [string, string, number][];
  news?: [string, string][];
  discrepancies?: Discrepancy[];
  sources?: [string, string, string][];
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
}

export interface DriverSet {
  years: string[]; n: number; rev0: number; nwc0: number;
  growth: number[]; margin: number[]; tax: number[]; da: number[]; capex: number[]; nwcPct: number[];
  derived: boolean;
}

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
