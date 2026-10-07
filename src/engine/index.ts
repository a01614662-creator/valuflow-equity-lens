// Punto de entrada del motor. Todo lo que la interfaz necesita del cálculo sale de aquí.
export * from './types';
export { fmt, fin } from './format';
export { labelsOf, unitsOf, yearIn } from './labels';
export { defaults, drivers, project, wacc, run, isDefault } from './model';
export { grid, tornado, scenarios, methods, sensTables } from './analysis';
export type { Grid, TornadoRow, Scenario, MethodRow } from './analysis';
export { validate, insights, SOURCE_GROUP } from './validate';
export type { Check, CheckStatus, Insight } from './validate';
export { buildForecast, buildFor, inflationPath } from './build';
export { expFit, inflationModels, inflationScenarios } from './inflation';
export type { ExpFit, InflationModels, ScenarioInfo } from './inflation';
export { comps, transactions, combine, relative, impliedPrice, stats, percentile, bridgeAdj, minusYears, isNum, STAT_KEYS, STAT_LABELS } from './multiples';
export type { Price, Stats, StatKey, MultipleResult, CompsResult, TransactionsResult, CombinedResult, CombinedRow, RelativeResult, DealCheck } from './multiples';
