// Punto de entrada del motor. Todo lo que la interfaz necesita del cálculo sale de aquí.
export * from './types';
export { fmt, fin } from './format';
export { labelsOf, unitsOf, yearIn } from './labels';
export { defaults, drivers, project, wacc, run, isDefault } from './model';
export { grid, tornado, scenarios, methods } from './analysis';
export type { Grid, TornadoRow, Scenario, MethodRow } from './analysis';
export { validate, insights, SOURCE_GROUP } from './validate';
export type { Check, CheckStatus, Insight } from './validate';
