// Punto de entrada del motor. Todo lo que la interfaz necesita del cálculo sale de aquí.
export * from './types';
export { fmt, fin } from './format';
export { labelsOf, unitsOf, yearIn } from './labels';
export { defaults, drivers, project, wacc, run, isDefault, recommendation, days360 } from './model';
export { grid, tornado, scenarios, methods, sensTables, sensCharts, growthStudy, impliedGrowth, formulaChecks, appVsExcel, metricsOf } from './analysis';
export type { Grid, TornadoRow, Scenario, ScenarioMetrics, MethodRow, SensCharts, GrowthStudy, GrowthControl, FormulaCheck, ParityRow } from './analysis';
export { inflationStudy, monthlyStudy, pricesStudy, betaStudy, betaPairs, scenarioPresets, presetPatch, baseInflation, fixed } from './study';
export type { TrendModel, InflationStudy, MonthlyStudy, PricesStudy, BetaStudy, ScenarioParams, SeriesModel, ReturnStats } from './study';
export * as stats from './stats';
export { validate, insights, SOURCE_GROUP } from './validate';
export type { Check, CheckStatus, Insight } from './validate';
export { buildForecast, buildFor, inflationPath } from './build';
export { comps, transactions, combine, relative, impliedPrice, stats as multipleStats, percentile, bridgeAdj, minusYears, isNum, STAT_KEYS, STAT_LABELS } from './multiples';
export type { Price, Stats, StatKey, MultipleResult, CompsResult, TransactionsResult, CombinedResult, CombinedRow, RelativeResult, DealCheck } from './multiples';
