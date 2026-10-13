// Cifras vivas para los textos del estudio ({clave} → valor formateado como en el Excel, con FIXED).
import { fixed } from '../engine';
import type { TextTemplates } from '../engine';
import type { Bundle } from './bundle';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const monthYear = (iso: string) => MESES[+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4);
const pc = (x: number, d: number) => fixed(x * 100, d) + '%';
/** Con signo explícito y menos tipográfico (−0.41 / +0.46). */
const sg = (s: string) => s.startsWith('-') ? '−' + s.slice(1) : '+' + s;

export function textContext(B: Bundle): Record<string, string> {
  const { ds, A, b, scen, torn, grid, growth, checks, infl, monthly, prices, beta, rel } = B;
  const S = ds.study, W = b.W, mk = W.market, src = W.src ?? mk, C: Record<string, string> = {};
  const def = S?.scenarios.default ?? 'base', P = scen.map(s => s.params);
  const preset = (k: string) => P.find(p => p.key === k);
  const onlyScenario = B.changes.every(c => /^(Escenario|Inflación|Ajuste|Beta apalancada|Crecimiento perpetuo)/.test(c[0]));
  const active = scen.find(s => s.active);
  C.caseLabel = B.isDefault ? 'base' : (active && onlyScenario ? 'del escenario ' + active.label : 'del Laboratorio');
  C.caseName = B.isDefault ? 'Base' : (active && onlyScenario ? active.label : 'Laboratorio');
  // Precios, valor y recomendación
  C.price = fixed(b.value, 2); C.market = fixed(b.price, 2); C.diff = fixed(b.value - b.price, 2);
  C.upside1 = pc(b.upside ?? NaN, 1); C.upsideS = sg(pc(b.upside ?? NaN, 1)); C.rec = b.signal ?? '—';
  const th = b.threshold;
  C.thresholdText = Math.abs(b.upside ?? 0) <= th ? 'dentro del umbral de ±' + pc(th, 0) : (b.upside as number) > 0 ? 'arriba del umbral de ' + pc(th, 0) : 'abajo del umbral de −' + pc(th, 0);
  C.consensus = fixed(ds.market.consensus ?? NaN, 2);
  // Tasas
  C.ke = pc(b.ke, 2); C.wacc = pc(b.wacc, 2); C.g1 = pc(b.g, 1); C.g2 = pc(b.g, 2); C.rf = pc(W.rf, 2); C.prm = pc(W.prm, 2);
  C.kdPre = pc(src.kd, 2); C.kdPre1 = pc(src.kd, 1); C.kdMarket = pc(mk.kd, 2); C.keMarket = pc(mk.ke, 2); C.waccMarket = pc(mk.wacc, 2);
  C.betaMkt2 = fixed(mk.beta, 2); C.taxMarket0 = pc(mk.tax, 0); C.debt = fixed(mk.D, 0); C.marketCap = fixed(mk.E, 0); C.wDMarket = pc(mk.wD, 1); C.wEMarket = pc(mk.wE, 1);
  // Sensibilidad (tabla WACC × g: fila/columna central ± un paso)
  C.waccUp = pc(grid.ws[3] / 100, 2); C.waccUpPrice = fixed(grid.cells[3][2] as number, 2); C.waccDownPrice = fixed(grid.cells[1][2] as number, 2);
  C.gUpPrice = fixed(grid.cells[2][3] as number, 2); C.gDownPrice = fixed(grid.cells[2][1] as number, 2);
  // Tornado
  torn.slice(0, 3).forEach((t, i) => { C['torn' + (i + 1)] = t.label; C['torn' + (i + 1) + 'Range'] = fixed(t.range, 2); });
  C.tornList = torn.map((t, i) => t.label + (i === 0 ? ' (rango de ' + fixed(t.range, 2) + ' MXN)' : ' (' + fixed(t.range, 2) + ')')).join(', ');
  const tb = torn.find(t => t.key === 'beta');
  if (tb) { C.tornBetaLo = fixed(Math.min(tb.low as number, tb.high as number), 2); C.tornBetaHi = fixed(Math.max(tb.low as number, tb.high as number), 2); }
  // Valor terminal y EV
  const tvBlend = b.mult ? b.wG * b.tvG + (1 - b.wG) * (b.tvM as number) : b.tvG;
  C.tvBlend = fixed(tvBlend, 0); C.tvWeight0 = pc(b.tvWeightW, 0); C.tvWeight1 = pc(b.tvWeightW, 1);
  C.ev = fixed(b.evW, 0); C.equity = fixed(b.eqVal, 0);
  C.impliedG = growth ? pc(growth.impliedG, 2) : '—';
  // Escenarios
  const sp = scen.map(s => s.m?.price ?? NaN), sb = scen.find(s => s.key === def)?.m;
  C.scenLo = fixed(sp[0], 2); C.scenHi = fixed(sp[sp.length - 1], 2); C.scenBase = fixed(sb?.price ?? NaN, 2);
  if (sb) { C.consVsBase = pc(Math.abs(sp[0] / sb.price - 1), 1); C.optVsBase = pc(Math.abs(sp[sp.length - 1] / sb.price - 1), 1); }
  const ws = scen.map(s => s.m?.wacc ?? NaN); C.waccMin = pc(Math.min(...ws), 2); C.waccMax = pc(Math.max(...ws), 2);
  C.scenRecs = 'Por escenario: ' + scen.map(s => s.label + ' ' + (s.m ? s.m.recommendation + ' (' + sg(pc(s.m.diffPct, 1)) + ')' : '—')).join(', ');
  // Validación
  C.checksSummary = checks.filter(c => c.ok).length + ' de ' + checks.length + ' comprobaciones cuadran';
  const cb = rel?.combined?.value;
  if (typeof cb === 'number') { const up = cb / b.price - 1; C.combined = fixed(cb, 2); C.combinedUpS = sg(pc(up, 1)); C.combinedText = Math.abs(up) <= th ? 'queda dentro del umbral' : 'también pasa el umbral'; }
  // Estudio (series)
  if (S && infl && monthly && prices && beta) {
    C.weeksS = String(S.prices.weekly.filter(w => w[1] != null).length);
    C.weeksI = String(S.prices.counts?.ipcWeeks ?? S.prices.weekly.filter(w => w[2] != null).length);
    const wk = S.prices.weekly; C.pricePeriod = monthYear(wk[0][0]) + ' a ' + monthYear(wk[wk.length - 1][0]);
    C.quincenas = String(infl.n);
    const ex = infl.models.map(m => m.exp); C.inflMin = fixed(Math.min(...ex), 2) + '%'; C.inflMax = fixed(Math.max(...ex), 2) + '%';
    C.inflBase = pc(preset(def)?.inflationRate ?? NaN, 2); C.inflCons = pc(P[0]?.inflationRate ?? NaN, 2); C.inflOpt = pc(P[P.length - 1]?.inflationRate ?? NaN, 2);
    const neg = infl.models.filter(m => m.m < 0).length;
    C.slopesText = neg === infl.models.length ? 'las ' + (neg === 4 ? 'cuatro' : neg) + ' pendientes son negativas' : neg + ' de ' + infl.models.length + ' pendientes son negativas';
    const r2 = (ks: string[]) => infl.models.filter(m => ks.includes(m.key)).flatMap(m => [m.r2, m.r2exp]);
    const lg = r2(['long', 'longQ']), sh = r2(['immediate', 'medium']);
    C.r2LongMin = fixed(Math.min(...lg), 2); C.r2LongMax = fixed(Math.max(...lg), 2); C.r2ShortMin = fixed(Math.min(...sh), 2); C.r2ShortMax = fixed(Math.max(...sh), 2);
    const co = monthly.correl.map(c => c.value);
    C.corrAll = fixed(co[0], 2); C.corr12 = fixed(co[1], 2); C.corr6 = fixed(co[2], 2); C.corrRet = fixed(co[3], 2);
    C.corrAllS = sg(C.corrAll); C.corr12S = sg(C.corr12); C.corr6S = sg(C.corr6); C.corrRetS = sg(C.corrRet);
    C.monthsValid = String(monthly.valid.length); C.r2PriceLin = fixed(monthly.linear.r2, 2); C.r2PriceExp = fixed(monthly.exponential.r2, 2);
    C.priceAtBaseLin = fixed(monthly.linear.atBase, 2); C.priceAtBaseExp = fixed(monthly.exponential.atBase, 2);
    C.corrIpc = fixed(prices.correl, 2);
    C.retS = pc(prices.retSoriana.annual, 1); C.volS = pc(prices.retSoriana.volAnnual, 1); C.cumS = pc(prices.retSoriana.cumulative, 1);
    C.retI = pc(prices.retIpc.annual, 1); C.volI = pc(prices.retIpc.volAnnual, 1); C.cumI = pc(prices.retIpc.cumulative, 1);
    C.beta2 = fixed(beta.slope, 2); C.beta4 = fixed(beta.slope, 4); C.betaSE4 = fixed(beta.se, 4); C.betaT2 = fixed(beta.t, 2); C.betaP3 = fixed(beta.p, 3);
    C.betaLo3 = fixed(beta.lo, 3).replace('-', '−'); C.betaHi3 = fixed(beta.hi, 3).replace('-', '−'); C.ciZero = beta.lo < 0 && beta.hi > 0 ? ' e incluye el cero' : '';
    C.r2pct1 = pc(beta.r2, 1);
    const sig = beta.p < 0.05;
    C.betaSigText = sig ? 'Es estadísticamente significativa.' : 'No es estadísticamente significativa al 95%, así que es la parte más débil del modelo y conviene defenderla con cautela.';
    C.betaSigShort = sig ? 'es estadísticamente significativa al 95%' : 'no es estadísticamente significativa al 95%';
  }
  if (growth) {
    C.realHistAbs1 = pc(-growth.realHist, 1); C.realHist1 = sg(pc(growth.realHist, 1)).replace('+', '');
    C.nominalLT = pc(growth.nominalLT, 2); C.bond = pc(S!.growth.bondExpected, 2);
    C.reinvest = sg(fixed(growth.reinvest, 0)).replace('+', ''); C.reinvestSign = growth.reinvest < 0 ? 'negativa' : 'positiva';
    C.controlsPassed = String(growth.passed); C.controlsTotal = String(growth.controls.length);
    const infB = A.inflationRate ?? preset(def)?.inflationRate ?? NaN; C.realBase = sg(pc((1 + b.g) / (1 + infB) - 1, 2)).replace('+', '+');
  }
  C.lastYear = b.rows[b.rows.length - 1].year;
  return C;
}

/** Reemplaza {clave} por su valor; una clave sin valor queda como "—". */
export function fill(tpl: string, C: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => C[k] ?? '—');
}

export interface StudyTexts { conclusions: [string, string][]; summary: string; sensitivity: string[]; reasons: string[]; limits: string[]; wacc: string[]; questions: [string, string][] }

export function studyTexts(B: Bundle, T: TextTemplates | undefined = B.ds.texts): StudyTexts | null {
  if (!T) return null;
  const C = textContext(B), f = (s: string) => fill(s, C);
  return {
    conclusions: T.conclusions.map(([a, z]) => [a, f(z)]), summary: f(T.summary), sensitivity: T.sensitivity.map(f), reasons: T.reasons.map(f), limits: T.limits.map(f), wacc: T.wacc.map(f),
    questions: T.questions.map(([q, a]) => [f(q), f(a)])
  };
}
