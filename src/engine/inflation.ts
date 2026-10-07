// Modelos de inflación de clase: tendencia exponencial y = a·e^(b·x) ajustada por mínimos cuadrados sobre ln(y).
// Réplica de la hoja "Inflación" del Excel maestro (secciones 3 y 4). La serie es la variación anual
// quincenal del INPC (Banxico SP74833) en %. Las ventanas son las del libro de clase.
import type { InflationSpec } from './types';

export interface ExpFit { a: number; b: number; r2: number; n: number; xNext: number; forecast: number }

/** Ajuste exponencial (Excel: a = EXP(INTERCEPT(ln y, x)), b = SLOPE(ln y, x), R² = RSQ). Devuelve la proyección en fracción. */
export function expFit(y: number[], x: number[], xNext: number): ExpFit {
  const n = y.length, ly = y.map(Math.log);
  const mx = x.reduce((s, v) => s + v, 0) / n, my = ly.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = ly[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  const b = sxy / sxx, a = Math.exp(my - b * mx), r2 = (sxy * sxy) / (sxx * syy);
  return { a, b, r2, n, xNext, forecast: a * Math.exp(b * xNext) / 100 };
}

export interface InflationModels {
  immediate: ExpFit; quarterly: ExpFit; long: ExpFit;
  quarterlyAverages: number[];
  classRounded: number; classS113: number;
  /** Escenario Base = modelo trimestral redondeado a 2 decimales en %. */
  baseFromModel: number;
}

const avg = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;
const seq = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

export function inflationModels(spec: InflationSpec): InflationModels | null {
  const S = spec.series;
  if (!S || S.length < 30) return null;
  const v = S.map(s => s[1]);
  // Inmediata: último año (25 quincenas), x = 1..25, se proyecta x = 26.
  const last = v.slice(-25), immediate = expFit(last, seq(25), 26);
  // Trimestral: 4 promedios de 6 quincenas del último año, x = 1..4, se proyecta x = 5.
  const qa = [0, 1, 2, 3].map(k => avg(last.slice(6 * k, 6 * k + 6)));
  const quarterly = expFit(qa, seq(4), 5);
  // Ventana larga: quincenas desde 2023, x = 1..n, se proyecta x = n + 1.
  const lv = S.filter(s => s[0] >= '2023-01-01').map(s => s[1]), long = expFit(lv, seq(lv.length), lv.length + 1);
  // Libro de clase: proyección con los coeficientes redondeados que trae el dataset (models.classRounded) y la
  // construcción S113 (promedio de las últimas 5 quincenas y esa proyección). Sin coeficientes, se usan los del ajuste largo.
  const cr = spec.models && spec.models.classRounded, ca = cr && cr.a != null ? cr.a : long.a, cb = cr && cr.b != null ? cr.b : long.b;
  const classRounded = ca * Math.exp(cb * (lv.length + 1)) / 100;
  const classS113 = avg([...v.slice(-5), classRounded * 100]) / 100;
  return { immediate, quarterly, long, quarterlyAverages: qa, classRounded, classS113, baseFromModel: Math.round(quarterly.forecast * 1e4) / 1e4 };
}

export interface ScenarioInfo { key: string; label: string; kind: string; source: string; path: number[]; constant: boolean }

export function inflationScenarios(spec: InflationSpec, n: number): ScenarioInfo[] {
  return spec.order.map(k => {
    const s = spec.scenarios[k];
    return { key: k, label: s.label, kind: s.kind, source: s.source || '', path: s.path ? s.path.slice(0, n) : Array(n).fill(s.value as number), constant: !s.path };
  });
}
