// Estadística básica del motor (equivalentes a las funciones de Excel que usa el estudio).
// SLOPE, INTERCEPT, RSQ, CORREL, STDEV, DEVSQ, STEYX, TDIST (dos colas), TINV, FDIST, COVAR/VARP.
// No contiene datos de ninguna empresa.

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]) => sum(xs) / xs.length;
export const devsq = (xs: number[]) => { const m = mean(xs); return xs.reduce((s, x) => s + (x - m) * (x - m), 0); };
/** Desviación estándar muestral (STDEV). */
export const stdev = (xs: number[]) => Math.sqrt(devsq(xs) / (xs.length - 1));
/** Covarianza y varianza poblacionales (COVAR, VARP). */
export const covarP = (ys: number[], xs: number[]) => { const my = mean(ys), mx = mean(xs); return ys.reduce((s, y, i) => s + (y - my) * (xs[i] - mx), 0) / ys.length; };
export const varP = (xs: number[]) => devsq(xs) / xs.length;

export function correl(a: number[], b: number[]): number {
  const ma = mean(a), mb = mean(b); let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < a.length; i++) { const da = a[i] - ma, db = b[i] - mb; sab += da * db; saa += da * da; sbb += db * db; }
  return sab / Math.sqrt(saa * sbb);
}

export interface LinFit { n: number; m: number; b: number; r2: number }
/** Mínimos cuadrados y = m·x + b (SLOPE, INTERCEPT, RSQ). */
export function linFit(y: number[], x: number[]): LinFit {
  const n = y.length, mx = mean(x), my = mean(y); let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  const m = sxy / sxx;
  return { n, m, b: my - m * mx, r2: (sxy * sxy) / (sxx * syy) };
}

export interface ExpFitR { n: number; a: number; k: number; r2: number }
/** Tendencia exponencial y = a·e^(k·x): a = EXP(INTERCEPT(ln y, x)), k = SLOPE(ln y, x), R² = RSQ(ln y, x). */
export function expFitR(y: number[], x: number[]): ExpFitR {
  const f = linFit(y.map(Math.log), x);
  return { n: f.n, a: Math.exp(f.b), k: f.m, r2: f.r2 };
}

// ---------- Distribuciones (función beta incompleta regularizada) ----------
function lgamma(z: number): number {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1; let x = c[0]; for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function betacf(a: number, b: number, x: number): number {
  const FPMIN = 1e-300; let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-16) break;
  }
  return h;
}
/** Beta incompleta regularizada I_x(a, b). */
export function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
/** TDIST(|t|, gl, 2): probabilidad de dos colas de la t de Student. */
export const tdist2 = (t: number, df: number) => ibeta(df / (df + t * t), df / 2, 0.5);
/** TINV(p, gl): valor crítico de dos colas. */
export function tinv(p: number, df: number): number {
  let lo = 0, hi = 1000;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (tdist2(mid, df) > p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
/** FDIST(F, gl1, gl2): cola derecha de la F de Fisher. */
export const fdist = (F: number, d1: number, d2: number) => ibeta(d2 / (d2 + d1 * F), d2 / 2, d1 / 2);

export interface Regression {
  n: number; df: number; slope: number; intercept: number; r: number; r2: number; r2adj: number; steyx: number;
  ssReg: number; ssRes: number; ssTot: number; F: number; pF: number;
  se: number; t: number; p: number; lo: number; hi: number;
  alphaSE: number; alphaT: number; alphaP: number;
  /** Comprobación: covarianza / varianza poblacional de x. */
  covVar: number;
}

/** Regresión lineal simple con la tabla completa de Análisis de datos de Excel (y sobre x). */
export function regression(y: number[], x: number[]): Regression {
  const n = y.length, df = n - 2, f = linFit(y, x), ssTot = devsq(y), ssReg = f.r2 * ssTot, ssRes = ssTot - ssReg, mse = ssRes / df, sxx = devsq(x);
  const se = Math.sqrt(mse / sxx), t = f.m / se, crit = tinv(0.05, df);
  const alphaSE = Math.sqrt(mse * (1 / n + mean(x) ** 2 / sxx)), alphaT = f.b / alphaSE, F = ssReg / mse;
  return {
    n, df, slope: f.m, intercept: f.b, r: Math.sqrt(f.r2), r2: f.r2, r2adj: 1 - (1 - f.r2) * (n - 1) / df, steyx: Math.sqrt(mse),
    ssReg, ssRes, ssTot, F, pF: fdist(F, 1, df), se, t, p: tdist2(Math.abs(t), df), lo: f.m - crit * se, hi: f.m + crit * se,
    alphaSE, alphaT, alphaP: tdist2(Math.abs(alphaT), df), covVar: covarP(y, x) / varP(x)
  };
}

/** Redondeo de Excel (ROUND) a d decimales. */
export const round = (x: number, d: number) => { const k = Math.pow(10, d); return Math.round((x + Math.sign(x) * 1e-12) * k) / k; };
