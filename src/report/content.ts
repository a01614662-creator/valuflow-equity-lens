// Contenido del estudio como documento: secciones con tablas, gráficas y textos, todo con cifras vivas.
// Una sola fuente para la vista "Estudio", el reporte PDF, el libro de Excel y los CSV.
import { fixed, fmt, labelsOf } from '../engine';
import { AUTHOR, SOURCE } from '../config';
import type { Bundle } from './bundle';
import { chartCatalog, tornLabel, type ChartDef } from './charts';
import { studyTexts, type StudyTexts } from './context';

export type Fmt = 'mxn' | 'mdp' | 'mdp1' | 'pct' | 'pct1' | 'pct0' | 'x' | 'b4' | 'n2' | 'n3' | 'n4' | 'n5' | 'int' | 'text';
export interface NumCell { v: number | null; f: Fmt; signed?: boolean }
export type Cell = string | NumCell | null;

export interface RTable { kind: 'table'; id: string; title: string; source: string; head: string[]; rows: Cell[][]; bold?: number[]; note?: string; n?: number }
export interface RChart { kind: 'chart'; id: string; title: string; source: string; chart: ChartDef; n?: number }
export interface RText { kind: 'text'; style: 'p' | 'key' | 'question' | 'warn' | 'bullets' | 'def'; title?: string; body?: string; items?: string[]; pairs?: [string, string][] }
export type Block = RTable | RChart | RText;
export interface Section { id: string; title: string; blocks: Block[]; exec?: boolean; page?: boolean }
export interface Report { sections: Section[]; texts: StudyTexts | null; meta: ReportMeta; bundle: Bundle }
export interface ReportMeta { title: string; subtitle: string; company: string; ticker: string; priceDate: string; generated: string; changes: [string, string, string][]; keyFacts: [string, string][] }

const num = (v: number | null | undefined, f: Fmt, signed = false): NumCell => ({ v: v == null || !isFinite(v) ? null : v, f, signed });

/** Texto de una celda numérica (México: coma de miles, punto decimal; negativos con signo menos). */
export function cellText(c: Cell): string {
  if (c == null) return '';
  if (typeof c === 'string') return c;
  const v = c.v; if (v == null) return 'n.d.';
  const sgn = (s: string) => (v < 0 ? '−' : c.signed && v > 0 ? '+' : '') + s;
  const a = Math.abs(v);
  switch (c.f) {
    case 'mxn': return sgn(fixed(a, 2));
    case 'mdp': return sgn(fixed(a, 0));
    case 'mdp1': return sgn(fixed(a, 1));
    case 'pct': return sgn(fixed(a * 100, 2) + '%');
    case 'pct1': return sgn(fixed(a * 100, 1) + '%');
    case 'pct0': return sgn(fixed(a * 100, 0) + '%');
    case 'x': return sgn(fixed(a, 2) + 'x');
    case 'b4': return sgn(fixed(a, 4));
    case 'n2': return sgn(fixed(a, 2));
    case 'n3': return sgn(fixed(a, 3));
    case 'n4': return sgn(fixed(a, 4));
    case 'n5': return sgn(fixed(a, 5));
    case 'int': return sgn(fixed(a, 0));
    default: return String(v);
  }
}

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const isoToText = (iso: string) => +iso.slice(8, 10) + ' ' + MES[+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4);

export function buildReport(B: Bundle, now = new Date()): Report {
  const { ds, A, b, scen, torn, grid, growth, checks, parity, infl, monthly, prices, beta, rel } = B;
  const T = studyTexts(B), CH = chartCatalog(B), L = labelsOf(ds), P = ds.profile, S = ds.study, M = ds.market;
  const src = (s: string) => SOURCE + ' (' + s + ').';
  const tbl = (id: string, title: string, source: string, head: string[], rows: Cell[][], o: { bold?: number[]; note?: string } = {}): RTable => ({ kind: 'table', id, title, source: src(source), head, rows, ...o });
  const ch = (id: string): RChart[] => CH[id] ? [{ kind: 'chart', id, title: CH[id].title, source: src(CH[id].source), chart: CH[id] }] : [];
  const p = (body: string, title?: string): RText => ({ kind: 'text', style: 'p', body, title });
  const key = (body: string): RText => ({ kind: 'text', style: 'key', title: 'Resultado clave', body });
  const q = (i: number): RText[] => T && T.questions[i] ? [{ kind: 'text', style: 'question', title: T.questions[i][0], body: T.questions[i][1] }] : [];
  const sb = scen.map(s => s.m), last = b.rows[b.rows.length - 1], R = b.rows;
  const scLo = sb[0]?.price ?? NaN, scHi = sb[sb.length - 1]?.price ?? NaN;
  const recBase = b.signal ?? '—', act = scen.find(s => s.active);
  const caseName = B.isDefault ? 'Base' : act ? act.label + (B.changes.length > 1 ? ' (con cambios)' : '') : 'Laboratorio';
  const tvBlend = b.mult ? b.wG * b.tvG + (1 - b.wG) * (b.tvM as number) : b.tvG;
  const combined = rel?.combined && typeof rel.combined.value === 'number' ? rel.combined.value : null;
  const mxn = (v: number | null | undefined) => v == null ? 'n.d.' : fixed(v, 2) + ' MXN';
  const pct = (v: number, d = 2) => fixed(v * 100, d) + '%';
  const sections: Section[] = [];

  const keyFacts: [string, string][] = [
    ['Precio de mercado (' + isoToText(A.valuationDate ?? M.priceDate as string) + ')', mxn(b.price)],
    ['Valor por acción, escenario ' + caseName + ' (DCF)', mxn(b.value) + ' (' + (b.upside! >= 0 ? '+' : '−') + fixed(Math.abs(b.upside!) * 100, 1) + '%)'],
    ['Rango de escenarios', fixed(scLo, 2) + ' a ' + fixed(scHi, 2) + ' MXN'],
    ['Precio combinado (' + (rel?.combined?.rows.filter(r => r.weight > 0).map(r => Math.round(r.weight * 100) + '% ' + (r.key === 'dcf' ? 'DCF' : r.key === 'comps' ? 'múltiplos' : 'transacciones')).join(', ') ?? '') + ')', combined != null ? mxn(combined) + ' (' + (combined >= b.price ? '+' : '−') + fixed(Math.abs(combined / b.price - 1) * 100, 1) + '%)' : 'n.d.'],
    ['WACC / Ke / g', pct(b.wacc) + ' / ' + pct(b.ke) + ' / ' + pct(b.g)],
    ['Beta (regresión semanal)', beta ? fixed(A.betaLevered ?? beta.slope, 4) + (beta.p < 0.05 ? ' (significativa al 95%)' : ' (no significativa al 95%)') : fixed(b.W.market.beta, 4)],
    ['Enterprise Value / Equity Value', fixed(b.evW, 0) + ' mdp / ' + fixed(b.eqVal, 0) + ' mdp'],
    ['Peso del valor terminal', pct(b.tvWeightW, 1) + ' del Enterprise Value'],
    ['Recomendación', recBase + ' (' + caseName + ')' + scen.filter(s => !s.active && s.m && s.m.recommendation !== recBase).map(s => ', ' + s.m!.recommendation + ' (' + s.label + ')').join('')]
  ];

  // ---------- Resumen ejecutivo
  const exec: Block[] = [
    p('Se valuó ' + P.name + ' (' + (P.ticker || '').replace(' ', '') + ') con un modelo de flujos de efectivo descontados (DCF): se proyectan los flujos libres de la empresa de ' + R[0].year + ' a ' + last.year + ' y se traen a valor presente con el costo promedio ponderado de capital (WACC) de ' + pct(b.wacc) + ', más un valor terminal con crecimiento perpetuo (g) de ' + pct(b.g) + '. El resultado se probó con tres escenarios que mueven inflación, ventas, margen, beta y g, y se comparó con el precio observado.'),
    p('En el escenario ' + caseName + ' el valor por acción es ' + mxn(b.value) + ', ' + fixed(Math.abs(b.upside!) * 100, 1) + '% ' + (b.upside! >= 0 ? 'arriba' : 'abajo') + ' del precio de ' + mxn(b.price) + '; los escenarios van de ' + fixed(scLo, 2) + ' a ' + fixed(scHi, 2) + ' MXN. La recomendación es ' + recBase + '.' + (combined != null ? ' El precio combinado con múltiplos de competidores es ' + mxn(combined) + '.' : '') + (beta ? ' El principal riesgo es la beta: ' + fixed(beta.slope, 4) + (beta.p < 0.05 ? ', significativa al 95%' : ', no significativa al 95% (valor p de ' + fixed(beta.p, 3) + ')') + '; además, el valor terminal pesa ' + pct(b.tvWeightW, 1) + ' del Enterprise Value.' : '')),
    tbl('keyFacts', 'Ficha de datos clave', 'hojas Validación, Escenarios, Valuación Combinada y Beta Regresión', ['Dato', 'Valor'], keyFacts),
    ...ch('football'),
    key('El precio de mercado (' + mxn(b.price) + ') ' + (b.price >= scLo && b.price <= scHi ? 'queda dentro del rango DCF de los escenarios (' + fixed(scLo, 2) + ' a ' + fixed(scHi, 2) + ' MXN)' : 'queda fuera del rango DCF de los escenarios') + '. ' + (T ? T.summary : ''))
  ];
  sections.push({ id: 'exec', title: 'Resumen ejecutivo', blocks: exec, exec: true, page: true });

  // ---------- 1. Introducción y 2. Empresa
  sections.push({ id: 'intro', title: '1. Introducción', blocks: [
    p('Una valuación es defendible si cada supuesto se rastrea hasta un dato. Este estudio sigue una cadena lógica: la inflación observada se modela y proyecta; la relación de Soriana con el mercado (el Índice de Precios y Cotizaciones, IPC) da la beta; la beta alimenta el costo de capital y el WACC; la inflación esperada acota el crecimiento perpetuo; con eso se descuentan los flujos, se construyen escenarios y el resultado se valida contra el precio observado. Cuando un eslabón es débil, el documento lo señala.'),
    ...ch('chain')
  ] });
  const st = ds.annex?.statements, rowOf = (re: RegExp) => st?.rows.find(r => re.test(String(r[0])));
  const sales25 = (rowOf(/^Ingresos totales/)?.[6] as number) ?? (ds.forecast.base.revenue as number);
  const company: Cell[][] = [
    ['Clave de cotización', (P.ticker || '') + ' (' + (P.exchange || '') + ', ' + (P.listed || '').replace('BMV ', '') + ')'],
    ['Tiendas en operación (2T26)', fixed(P.stores ?? NaN, 0)], ['Colaboradores (jun 2026)', fixed(P.employees ?? NaN, 0)],
    ['Acciones en circulación', fixed(A.shares ?? NaN, 0) + ' millones'], ['Capitalización a precio actual', fixed((A.price ?? 0) * (A.shares ?? 0), 0) + ' mdp'],
    ['Ventas 2025', fixed(sales25, 0) + ' mdp'], ['Margen de operación 2025', pct((ds.forecast.base.ebit as number) / (ds.forecast.base.revenue as number))],
    ['Ventas mismas tiendas 2T26', String(M.sssg ?? 'n.d.').replace('-', '−')], ['P/U (precio / utilidad por acción)', fixed(M.pe ?? NaN, 2) + 'x'],
    ['Consenso de analistas', String(M.consensusLabel ?? '') + '; objetivo ' + mxn(M.consensus)], ['Calificación (HR Ratings)', String(M.rating ?? '')]
  ];
  const peers = (M.peers as { name: string; pe: number }[] | undefined) || [];
  sections.push({ id: 'company', title: '2. Descripción del problema, empresa y objetivo del estudio', blocks: [
    { kind: 'text', style: 'key', title: 'Pregunta central', body: '¿Cuál es el valor estimado de Soriana bajo distintos escenarios, qué variables explican los cambios y qué tan sensible es el resultado a los supuestos?' },
    p('Organización Soriana es una de las mayores cadenas de autoservicio de México: opera tiendas de autoservicio y clubes de membresía en varios formatos, fue fundada en ' + (P.founded || '') + ' y tiene su sede en ' + (P.hq || '') + '. Compite con ' + peers.map(x => x.name).join(', ').replace(/, ([^,]*)$/, ' y $1') + ', los comparables del Excel. Tiene ' + fixed(A.shares ?? NaN, 0) + ' millones de acciones en circulación y un precio de mercado de ' + mxn(b.price) + '.', 'Empresa'),
    p('El mercado y los analistas no coinciden: la acción subió ' + fixed(+(M.chg1y ?? 0), 1) + '% en un año mientras el consenso recomienda venta con un precio objetivo promedio de ' + mxn(M.consensus) + ', ' + fixed(Math.abs((M.consensus ?? 0) / b.price - 1) * 100, 1) + '% debajo del precio actual. Al mismo tiempo, las ventas mismas tiendas cayeron ' + String(M.sssg ?? '').replace('-', '') + ' en el 2T26 y Soriana cotiza a ' + fixed(M.pe ?? NaN, 2) + 'x utilidades, ' + (peers.length ? 'más que ' + peers.map(x => x.name + ' (' + fixed(x.pe, 2) + 'x)').join(', ') : '') + '. Hace falta un valor intrínseco propio, construido con supuestos explícitos.', 'Problema'),
    p('Estimar el valor por acción de Soriana con un DCF a 5 años (' + R[0].year + ' a ' + last.year + '), probarlo con tres escenarios (' + scen.map(s => s.label).join(', ').replace(/, ([^,]*)$/, ' y $1') + ') y compararlo con el precio observado de ' + mxn(b.price) + '.', 'Objetivo'),
    tbl('company', 'Datos generales de Soriana y contexto de mercado', 'hojas Generales, Datos y Comparativo', ['Dato', 'Valor'], company)
  ] });

  // ---------- 3. Variables
  if (S && infl && prices && beta) {
    const ser = S.inflation.series, lq = ser[ser.length - 1], wk = S.prices.weekly;
    sections.push({ id: 'vars', title: '3. Variables: identificación de las principales variables', blocks: [tbl('vars', 'Variables del modelo', 'hojas Inflación, Precio e IPC, Rendimientos, Beta Regresión, WACC y Crecimiento Perpetuo', ['Variable', 'Qué es', 'Fuente (hoja)', 'Valor actual', 'Uso en el modelo'], [
      ['Inflación', 'Inflación general anual quincenal de Banxico; ' + infl.n + ' quincenas (' + isoToText(ser[0][0]) + ' a ' + isoToText(lq[0]) + ')', 'Inflación', fixed(lq[1], 2) + '% (' + isoToText(lq[0]) + '); escenario ' + pct(A.inflationRate ?? NaN), 'Escenarios, Rf (Fisher) y ventas'],
      ['IPC', 'Índice de la BMV; ' + (S.prices.counts?.ipcWeeks ?? '') + ' observaciones semanales', 'Precio e IPC', pct(prices.retIpc.annual, 1) + ' anual; volatilidad ' + pct(prices.retIpc.volAnnual, 1), 'Variable x de la beta'],
      ['Precio de Soriana B', 'Cierre semanal; ' + wk.filter(w => w[1] != null).length + ' observaciones (' + isoToText(wk[0][0]) + ' a ' + isoToText(wk[wk.length - 1][0]) + ')', 'Precio e IPC', mxn(b.price) + ' (' + isoToText(A.valuationDate ?? '') + ')', 'Contraste con el valor estimado'],
      ['Rendimientos', beta.n + ' pares semanales Soriana e IPC', 'Precio e IPC', 'Soriana ' + pct(prices.retSoriana.annual, 1) + ' (vol. ' + pct(prices.retSoriana.volAnnual, 1) + '), IPC ' + pct(prices.retIpc.annual, 1) + ' (' + pct(prices.retIpc.volAnnual, 1) + '); correlación ' + fixed(prices.correl, 2), 'Insumo de la beta'],
      ['Beta', 'Sensibilidad de Soriana a los movimientos del IPC', 'Beta Regresión', fixed(beta.slope, 4) + ' (desapalancada ' + fixed(b.W.betaU, 4) + ')', 'Costo de capital (CAPM), sección 5.1'],
      ['WACC', 'Costo promedio ponderado de deuda y capital', 'WACC, Proyección Final Soriana', pct(b.wacc) + ' (iterado)', 'Tasa de descuento de los flujos, sección 5.2'],
      ['Crecimiento perpetuo (g)', 'Crecimiento de los flujos después de ' + last.year.slice(0, 4), 'Crecimiento Perpetuo', pct(b.g), 'Valor terminal (Gordon), sección 5.3']
    ])] });

    // ---------- 4. Modelos
    const mr = infl.models.map(m => [m.label, num(m.n, 'int'), num(m.m, 'n5'), num(m.b, 'n4'), num(m.r2, 'n4'), m.lin.toFixed(2) + '%', num(m.a, 'n4'), num(m.k, 'n5'), num(m.r2exp, 'n4'), m.exp.toFixed(2) + '%'] as Cell[]);
    const MP = monthly!;
    sections.push({ id: 'models', title: '4. Modelos: descripción de los modelos lineales y exponenciales', blocks: [
      p('La variable cambia la misma cantidad cada periodo: m (pendiente) es ese cambio y b (ordenada) el nivel de partida. Proyectado lejos puede dar valores sin sentido, como inflación negativa.', 'Modelo lineal, y = m·x + b'),
      p('La variable cambia el mismo porcentaje cada periodo: b es la tasa de cambio continua y a el nivel inicial. Describe una inflación que baja cada vez más despacio sin llegar a cero.', 'Modelo exponencial, y = a·e^(b·x)'),
      p('Se estiman los dos con mínimos cuadrados (el exponencial sobre el logaritmo de y) y se comparan con la R² (parte de la variación que explica la línea). La proyección usa el siguiente periodo (x = n + 1). La app recalcula todo desde la serie cruda.'),
      tbl('inflModels', 'Modelos de tendencia de la inflación (x = número de periodo; inflación en %)', 'hoja Inflación, filas 11 a 15', ['Modelo', 'n', 'm', 'b', 'R² lin.', 'Proy. lin.', 'a', 'b (exp.)', 'R² exp.', 'Proy. exp.'], mr,
        { note: 'Escenarios de inflación: Base ' + pct(infl.rates.base) + ' (exponencial trimestral del último año), Conservador ' + pct(infl.rates.conservador) + ' (techo del rango de Banxico), Optimista ' + pct(infl.rates.optimista) + ' (proyección más baja).' }),
      ...ch('inflSeries'), ...ch('inflModels'), ...ch('infl_immediate_lin'), ...ch('infl_immediate_exp'),
      tbl('trends', 'Tendencia de Soriana B y del IPC (' + prices.soriana.n + ' semanas)', 'hoja Precio e IPC (Investing.com)', ['Serie', 'Ecuación lineal', 'R² lin.', 'Ecuación exponencial', 'R² exp.', 'Crec. anual implícito', 'Proy. exp. a 52 semanas'], [
        ['Soriana B (MXN)', prices.soriana.eqLin, num(prices.soriana.r2, 'n4'), prices.soriana.eqExp, num(prices.soriana.r2exp, 'n4'), num(prices.soriana.growth, 'pct1'), num(prices.soriana.exp52, 'mxn')],
        ['IPC (puntos)', prices.ipc.eqLin, num(prices.ipc.r2, 'n4'), prices.ipc.eqExp, num(prices.ipc.r2exp, 'n4'), num(prices.ipc.growth, 'pct1'), num(prices.ipc.exp52, 'mdp')]
      ]),
      tbl('returns', 'Rendimientos semanales de Soriana B y del IPC', 'hoja Precio e IPC', ['Serie', 'Semanas', 'Promedio semanal', 'Anualizado', 'Volatilidad semanal', 'Volatilidad anual', 'Acumulado'], [
        ['Soriana B', num(prices.retSoriana.n, 'int'), num(prices.retSoriana.mean, 'pct'), num(prices.retSoriana.annual, 'pct1'), num(prices.retSoriana.vol, 'pct'), num(prices.retSoriana.volAnnual, 'pct1'), num(prices.retSoriana.cumulative, 'pct1')],
        ['IPC', num(prices.retIpc.n, 'int'), num(prices.retIpc.mean, 'pct'), num(prices.retIpc.annual, 'pct1'), num(prices.retIpc.vol, 'pct'), num(prices.retIpc.volAnnual, 'pct1'), num(prices.retIpc.cumulative, 'pct1')]
      ], { note: 'Correlación semanal Soriana–IPC: ' + fixed(prices.correl, 4) + '.' }),
      ...ch('base100'),
      tbl('inflPrice', 'Inflación frente al precio de Soriana B: correlaciones y regresión (datos mensuales)', 'hoja Inflación, filas 29 a 39 (' + MP.valid.length + ' meses con inflación y precio)', ['Concepto', 'Coeficiente / ecuación', 'n (meses)', 'R²', 'Precio con inflación base'],
        MP.correl.map(c => [c.label, num(c.value, 'n2', true), num(c.n, 'int'), '', ''] as Cell[]).concat([
          ['Regresión lineal del precio', MP.linear.eq, num(MP.linear.n, 'int'), num(MP.linear.r2, 'n4'), num(MP.linear.atBase, 'mxn')],
          ['Regresión exponencial del precio', MP.exponential.eq, num(MP.exponential.n, 'int'), num(MP.exponential.r2, 'n4'), num(MP.exponential.atBase, 'mxn')]
        ])),
      tbl('moves', 'Meses de mayor alza y mayor baja de la inflación', 'hoja Inflación', ['Mes', 'Fecha', 'Cambio de inflación (pp)', 'Inflación del mes', 'Rendimiento de Soriana'],
        MP.moves.map(m => [m.label, isoToText(m.month).slice(2), num(m.dInfl, 'n3', true), m.infl.toFixed(2) + '%', num(m.ret, 'pct1', true)] as Cell[]),
        { note: 'Rendimiento promedio de Soriana en meses en que sube la inflación: ' + pct(MP.avgUp.value) + ' (' + MP.avgUp.n + ' meses); en meses en que baja: ' + pct(MP.avgDown.value) + ' (' + MP.avgDown.n + ' meses).' }),
      ...ch('inflPrice'), ...ch('priceVsInfl'),
    ] });

    // ---------- 5. Resultados
    sections.push({ id: 'beta', title: '5. Resultados y valuación · 5.1 Beta', blocks: [
      ...ch('beta'),
      tbl('beta', 'Regresión de la beta', 'hoja Beta Regresión', ['Estadístico', 'Valor'], [
        ['Observaciones (semanas)', num(beta.n, 'int')], ['Beta (pendiente)', num(beta.slope, 'b4')], ['Intercepto (alfa)', num(beta.intercept, 'n4')], ['Error típico de la beta', num(beta.se, 'b4')],
        ['Estadístico t / valor p', fixed(beta.t, 2) + ' / ' + fixed(beta.p, 3)], ['Intervalo de confianza 95%', fixed(beta.lo, 3).replace('-', '−') + ' a ' + fixed(beta.hi, 3)],
        ['R múltiple (correlación)', num(beta.r, 'n4')], ['R² (parte explicada por el mercado)', fixed(beta.r2, 4) + ' (' + pct(beta.r2, 1) + ')'], ['R² ajustada', num(beta.r2adj, 'n4')],
        ['Error típico de la regresión', num(beta.steyx, 'n4')], ['F / valor crítico de F', fixed(beta.F, 3) + ' / ' + fixed(beta.pF, 4)],
        ['Comprobación: covarianza / varianza del IPC', num(beta.covVar, 'b4')],
        ['D/E a mercado (deuda / capitalización)', num(b.W.market.de, 'n4')], ['Beta desapalancada βU = β / (1 + (1 − t)·D/E)', num(b.W.betaU, 'b4')],
        ['Beta usada (escenario activo, apalancada a mercado)', num(A.betaLevered ?? beta.slope, 'b4')], ['Beta reapalancada e iterada en el DCF', num(b.W.src?.beta, 'b4')]
      ]),
      key('La beta mide cuánto se mueve la acción cuando el mercado se mueve 1%. Beta = ' + fixed(beta.slope, 4) + ': si el IPC sube 1%, Soriana sube en promedio ' + fixed(beta.slope, 2) + '%. ' + (beta.slope < 1 ? 'Menor que 1 indica una acción defensiva. ' : '') + 'El mercado explica solo ' + pct(beta.r2, 1) + ' de sus movimientos y la beta ' + (beta.p < 0.05 ? 'es' : 'no es') + ' significativa al 95% (p = ' + fixed(beta.p, 3) + ').'),
    ] });
  }

  const W = b.W, mk = W.market, it = W.src ?? mk;
  sections.push({ id: 'wacc', title: '5.2 WACC', blocks: [
    p('Rendimiento mínimo que piden accionistas y acreedores: WACC = E/(D+E)·Ke + D/(D+E)·Kd·(1−T), con Ke = Rf + β·Prima (CAPM; Rf es la tasa libre de riesgo).'),
    tbl('wacc', 'Construcción del WACC paso a paso', 'hojas WACC y Proyección Final Soriana (filas 205 a 222)', ['Concepto', 'Valor', 'Qué significa'], [
      ['Tasa libre de riesgo, Rf (' + L.rfSource + ')', num(W.rf, 'pct'), W.kdShift ? 'Ajustada por la inflación del escenario (Fisher, tasa real ' + pct((1 + (W.rfBase ?? W.rf)) / (1 + (B.scen.find(s => s.key === ds.study?.scenarios.default)?.params.inflationRate ?? 0)) - 1) + ')' : 'Lo mínimo que se gana sin riesgo'],
      ['Prima de riesgo de mercado', num(W.prm, 'pct'), 'Rendimiento extra que se pide a las acciones'],
      ['Beta desapalancada', num(W.betaU, 'b4'), 'Riesgo del negocio sin deuda'],
      ['Beta a mercado (D/E ' + fixed(mk.de, 4) + ')', num(mk.beta, 'b4'), 'βU × [1 + (1 − t) × D/E]'],
      ['Ke a mercado', num(mk.ke, 'pct'), 'Rf + β × prima'],
      ['Kd antes de impuestos a mercado', num(mk.kd, 'pct'), 'Intereses del último año / deuda'],
      ['Deuda total (D) / capital a mercado (E)', fixed(mk.D, 0) + ' / ' + fixed(mk.E, 0) + ' mdp', 'Estructura a mercado: ' + pct(mk.wD, 1) + ' / ' + pct(mk.wE, 1)],
      ['WACC a valor de mercado', num(mk.wacc, 'pct'), 'Punto de partida de la iteración'],
      ['Beta reapalancada e iterada', num(it.beta, 'b4'), 'Con D/E del capital del DCF (' + pct(it.de) + ')'],
      ['Ke = Rf + β × Prima (iterado)', num(b.ke, 'pct'), 'Costo del capital del DCF'],
      ['Kd antes de impuestos (tasa esperada)', num(it.kd, 'pct'), 'Tasa que se espera pagar'],
      ['Tasa de impuestos (T)', num(it.tax, 'pct'), 'Tasa efectiva proyectada'],
      ['Kd después de impuestos = Kd × (1 − T)', num(it.kdAT, 'pct'), 'La deuda cuesta menos por el escudo fiscal'],
      ['WACC iterado usado en el DCF', num(b.wacc, 'pct'), A.waccMode === 'iterated' ? 'Pesos con el capital del propio DCF hasta que ya no cambia' : 'Modo ' + A.waccMode]
    ], { bold: [13] }),
    tbl('waccIter', 'Iteración del WACC', 'hoja Proyección Final Soriana, filas 214 a 219', ['Iteración', 'WACC entrada', 'Equity DCF (mdp)', 'D/E', 'Beta', 'Ke', 'WACC salida'],
      W.iters.map(x => [String(x.k + 1), num(x.win, 'pct'), num(x.E, 'mdp'), num(x.de, 'n4'), num(x.beta, 'b4'), num(x.ke, 'pct'), num(x.wout, 'pct')] as Cell[])),
    ...ch('iter'),
    key('WACC usado en el DCF = ' + pct(b.wacc) + ', con Ke de ' + pct(b.ke) + ' y Kd después de impuestos de ' + pct(it.kdAT) + '. Medio punto más de WACC baja el valor a ' + fixed(grid.cells[3][2] as number, 2) + ' MXN.')
  ] });

  if (growth && S) {
    sections.push({ id: 'growth', title: '5.3 Crecimiento perpetuo (g)', blocks: [
      p(S.growth.intro ?? ''),
      p('El escenario activo usa g = ' + pct(b.g) + ' (' + scen.map(s => s.label + ' ' + pct(s.params.g / 100)).join(', ') + '). ' + (S.growth.why?.[A.scenario ?? 'base'] ?? '')),
      tbl('gRefs', 'Referencias del crecimiento perpetuo', 'hoja Crecimiento Perpetuo', ['Referencia', 'Valor', 'Fecha', 'Fuente', 'Para qué se usa'], S.growth.references.map(r => [r[0], r[1] > 1 ? num(r[1], 'mdp') : num(r[1], 'pct'), r[2], r[3], r[4]] as Cell[])),
      tbl('gCalcs', 'Cálculos de soporte de g', 'hoja Crecimiento Perpetuo, filas 18 a 27', ['Cálculo', 'Valor'], [
        ['CAGR de ventas 2023–2025 (nominal)', num(growth.cagr, 'pct')], ['Inflación promedio 2024–2025', num(growth.inflAvg, 'pct')], ['Crecimiento real histórico de ventas', num(growth.realHist, 'pct')],
        ['Crecimiento nominal de largo plazo de la economía', num(growth.nominalLT, 'pct')], ['Crecimiento de ventas del último año proyectado', num(growth.growthLast, 'pct')],
        ['Reinversión neta ' + last.year + ' (mdp)', num(growth.reinvest, 'mdp1')], ['Tasa de reinversión', num(growth.reinvestRate, 'pct')], ['ROIC ' + last.year, num(growth.roic, 'pct')],
        ['Crecimiento real sostenible', num(growth.sustainable, 'pct')], ['g implícita en el múltiplo de salida', num(growth.impliedG, 'pct')]
      ]),
      tbl('gScen', 'g por escenario y crecimiento real implícito', 'hoja Crecimiento Perpetuo, filas 31 a 33', ['Escenario', 'g', 'Inflación', 'Crecimiento real implícito'], growth.scenarios.map(s => [s.label, num(s.g, 'pct'), num(s.inflation, 'pct'), num(s.real, 'pct', true)] as Cell[])),
      tbl('gControls', 'Controles de razonabilidad de g', 'hoja Crecimiento Perpetuo, filas 37 a 41', ['Control', 'Valor', 'Límite', 'Estado'], growth.controls.map(c => [c.label, c.kind === 'order' ? (c.ok ? 'En orden' : 'Fuera de orden') : num(c.value, 'pct'), c.kind === 'order' ? '' : num(c.limit, 'pct'), c.ok ? 'Cumple' : 'No cumple'] as Cell[]), { note: 'Cumplen ' + growth.passed + ' de ' + growth.controls.length + ' controles.' }),
      ...ch('gRefs'),
    ] });
  }

  // ---------- 5.4 FCFF
  const B0 = ds.forecast.base, bd = b.drivers.build;
  const yrs = [ds.forecast.baseYear].concat(R.map(r => r.year));
  const rowF = (label: string, base: Cell, f: (r: typeof R[0], i: number) => Cell): Cell[] => [label, base, ...R.map(f)];
  sections.push({ id: 'fcff', title: '5.4 Flujos de efectivo libre para la empresa (FCFF)', blocks: [
    p('El FCFF es el efectivo de la operación después de impuestos e inversiones: NOPAT (utilidad de operación después de impuestos) más depreciación y amortización, menos capex e inversión en capital de trabajo. Las ventas pasan de ' + fixed(B0.revenue as number, 0) + ' a ' + fixed(last.revenue, 0) + ' mdp (CAGR de ' + pct(Math.pow(last.revenue / (B0.revenue as number), 1 / R.length) - 1) + ') y el margen EBIT promedio es ' + pct(R.reduce((s, r) => s + r.margin, 0) / R.length) + '.'),
    tbl('fcff', 'Flujo libre de efectivo proyectado (mdp, salvo indicación)', 'hoja Proyección Final Soriana, secciones 1.1 y 2', ['Concepto', ...yrs], [
      rowF('Ventas', num(B0.revenue, 'mdp'), r => num(r.revenue, 'mdp')),
      rowF('Crecimiento de ventas', '', r => num(r.growth, 'pct', true)),
      rowF('Margen EBIT (%)', num((B0.ebit as number) / (B0.revenue as number), 'pct'), r => num(r.margin, 'pct')),
      rowF('Utilidad de operación (EBIT)', num(B0.ebit, 'mdp'), r => num(r.ebit, 'mdp')),
      rowF('(−) Impuestos sobre EBIT', 'n.a.', r => num(-r.tax, 'mdp')),
      rowF('NOPAT = EBIT × (1 − T)', 'n.a.', r => num(r.nopat, 'mdp')),
      rowF('(+) Depreciación y amortización', num(B0.da, 'mdp'), r => num(r.da, 'mdp')),
      rowF('(−) Capex', 'n.a.', r => num(-r.capex, 'mdp')),
      rowF('(−) Inversión en capital de trabajo', 'n.a.', r => num(-r.dNwc, 'mdp')),
      rowF('FCF', 'n.a.', r => num(r.fcf, 'mdp')),
      rowF('Factor de descuento 1/(1 + WACC)^n', 'n.a.', r => num((r as any).df, 'n4')),
      rowF('Valor presente del FCF', 'n.a.', r => num((r as any).pv, 'mdp'))
    ], { bold: [9, 11], note: 'Factor de descuento con WACC de ' + pct(b.wacc) + '. Suma de valores presentes: ' + fixed(b.pvSum, 0) + ' mdp.' + (bd ? ' Inflación ' + pct(bd.inflation[0]) + ' en todos los años; ajuste a ventas ' + pct(A.salesAdj ?? 0) + ' y al margen ' + pct(A.marginAdj ?? 0) + '.' : '') }),
    ...ch('fcf'),
    ...(bd ? [tbl('balance', 'Estado de resultados y balance proyectados (mdp)', 'hoja Proyección Final Soriana, secciones 1.1 a 1.3', ['Concepto', ...R.map(r => r.year)], [
      ['Inflación', ...bd.years.map(y => num(y.inflation, 'pct'))], ['Crecimiento por variables externas', ...bd.years.map(y => num(y.growthExternal, 'pct', true))], ['Crecimiento por mínimos cuadrados', ...bd.years.map(y => num(y.growthLS, 'pct', true))],
      ['Ventas', ...bd.years.map(y => num(y.revenue, 'mdp'))], ['EBITDA', ...bd.years.map(y => num(y.ebitda, 'mdp'))], ['Gastos financieros', ...bd.years.map(y => num(y.interest, 'mdp'))], ['Utilidad neta', ...bd.years.map(y => num(y.netIncome, 'mdp'))],
      ['Efectivo', ...bd.years.map(y => num(y.cash, 'mdp'))], ['Activo total', ...bd.years.map(y => num(y.totalAssets, 'mdp'))], ['Pasivo total', ...bd.years.map(y => num(y.totalLiabilities, 'mdp'))], ['Capital contable', ...bd.years.map(y => num(y.equity, 'mdp'))],
      ['Comprobación (A − P − C)', ...bd.years.map(y => num(y.check, 'mdp1'))]
    ])] : [])
  ] });

  // ---------- 5.5 Valor terminal y 5.6 puente
  if (b.mult) sections.push({ id: 'tv', title: '5.5 Valor terminal', blocks: [
    p('Se promedian dos métodos (' + Math.round(b.wG * 100) + '% Gordon y ' + Math.round((1 - b.wG) * 100) + '% múltiplo). Gordon: FCF siguiente año / (WACC − g). Múltiplo de salida: EBITDA ' + last.year + ' por un EV/EBITDA de ' + fixed(b.mult, 2) + 'x (' + L.multipleSource + '). ' + (growth ? 'Los métodos no coinciden: el múltiplo implica un crecimiento perpetuo de solo ' + pct(growth.impliedG) + ', contra ' + pct(b.g) + ' en Gordon.' : '')),
    tbl('tv', 'Valor terminal por los dos métodos (mdp)', 'hoja Proyección Final Soriana, secciones 3 y 10', ['Concepto', 'Gordon', 'Múltiplo de salida'], [
      ['Base del cálculo', 'FCF ' + (+last.year.slice(0, 4) + 1) + 'E: ' + fixed(b.fcfN1, 0), 'EBITDA ' + last.year + ': ' + fixed(last.ebitda, 0)],
      ['Parámetro', 'WACC − g = ' + pct(b.wacc) + ' − ' + pct(b.g), 'EV/EBITDA ' + fixed(b.mult, 2) + 'x'],
      ['Valor terminal al cierre de ' + last.year.slice(0, 4), num(b.tvG, 'mdp'), num(b.tvM, 'mdp')],
      ['Valor presente', num(b.pvTvG, 'mdp'), num(b.pvTvM, 'mdp')],
      ['EV/EBITDA implícito / g implícita', fixed(b.impliedMultiple, 2) + 'x / ' + pct(b.g), fixed(b.mult, 2) + 'x / ' + (growth ? pct(growth.impliedG) : 'n.d.')],
      ['Peso en el valor terminal ponderado (' + fixed(tvBlend, 0) + ')', pct(b.wG, 0), pct(1 - b.wG, 0)]
    ]),
    ...ch('tv'), ...ch('evComp'),
    key('Valor terminal ponderado: ' + fixed(tvBlend, 0) + ' mdp; su valor presente (' + fixed(b.pvTvW, 0) + ' mdp) es ' + pct(b.tvWeightW, 1) + ' del EV.')
  ] });
  const ro = b.roll;
  sections.push({ id: 'bridge', title: '5.6 Enterprise Value, Equity Value y valor por acción', blocks: [
    p(ro ? 'El EV al ' + L.closeDate + ' se lleva al ' + L.rollDate + ' con el WACC y se ajusta por el flujo libre del ' + L.rollFcf + '; se restan deuda y arrendamientos, se suma el efectivo y el Equity Value se lleva a la fecha de valuación (' + isoToText(A.valuationDate ?? '') + ') con el Ke.' : 'Equity Value = EV − deuda neta.'),
    tbl('bridge', 'Del Enterprise Value al valor por acción', 'hoja Proyección Final Soriana, secciones 3 y 11', ['Concepto', 'Valor (mdp)'], ([
      ['Valor presente de los FCF', num(b.pvSum, 'mdp1')], ['Valor presente del valor terminal ponderado', num(b.pvTvW, 'mdp1')], ['Enterprise Value al ' + L.closeDate, num(b.evW, 'mdp1')]
    ] as Cell[][]).concat(ro ? [
      ['× (1 + WACC)^' + fixed(ro.t1, 4) + ' → EV llevado al ' + L.rollDate, num(ro.evCap, 'mdp1')], ['(−) FCF del ' + L.rollFcf + ' (fue negativo, restarlo suma)', num(ro.fcfGenerated, 'mdp1', true)], ['Enterprise Value al ' + L.rollDate, num(ro.ev2, 'mdp1')],
      ['(−) Deuda bursátil y bancaria', num(-ro.debt, 'mdp1')], ['(−) Pasivo por arrendamiento', num(-ro.lease, 'mdp1')], ['(+) Efectivo', num(ro.cash, 'mdp1')], ['Equity Value al ' + L.rollDate, num(ro.eq2, 'mdp1')],
      ['× (1 + Ke)^' + fixed(ro.t2, 4) + ' → Equity Value a la fecha de valuación', num(ro.eq3, 'mdp1')]
    ] : [['Deuda neta', num(-b.nd, 'mdp1')], ['Equity Value', num(b.eqClose, 'mdp1')]]).concat([
      ['Acciones en circulación (millones)', num(b.shares, 'mdp1')], ['Valor por acción (MXN)', num(b.value, 'mxn')], ['Precio de mercado (MXN)', num(b.price, 'mxn')], ['Diferencia', num(b.upside, 'pct1', true)]
    ]), { bold: [2] }),
    ...ch('bridge'),
    key('EV ' + fixed(b.evW, 0) + ' mdp (' + L.closeDate + ')' + (ro ? ' y ' + fixed(ro.ev2, 0) + ' mdp (' + L.rollDate + ')' : '') + '; Equity Value ' + fixed(b.eqVal, 0) + ' mdp a la fecha de valuación; valor por acción ' + mxn(b.value) + ', ' + (b.upside! >= 0 ? '+' : '−') + pct(Math.abs(b.upside!), 1) + ' sobre el precio de mercado.')
  ] });

  // ---------- 5.7 Valuación complementaria
  if (rel?.combined) {
    const K = rel.combined, rng: Record<string, [number | null, number | null]> = {
      dcf: [scLo, scHi], comps: [typeof rel.comps?.p25 === 'number' ? rel.comps.p25 : null, typeof rel.comps?.p75 === 'number' ? rel.comps.p75 : null], transactions: [typeof rel.transactions?.lo === 'number' ? rel.transactions.lo : null, typeof rel.transactions?.hi === 'number' ? rel.transactions.hi : null]
    };
    const lab = (k: string) => k === 'dcf' ? 'DCF (escenarios)' : k === 'comps' ? 'Múltiplos de competidores' : 'Transacciones comparables' + (K.rows.find(r => r.key === k)?.weight ? '' : ' (referencia)');
    sections.push({ id: 'combined', title: '5.7 Valuación complementaria', blocks: [
      tbl('combined', 'Valuación combinada por método (MXN por acción)', 'hoja Valuación Combinada', ['Método', 'Bajo', 'Central', 'Alto', 'Peso', 'Aporte'], K.rows.map(r => [lab(r.key), num(rng[r.key][0], 'mxn'), num(typeof r.price === 'number' ? r.price : null, 'mxn'), num(rng[r.key][1], 'mxn'), num(r.weight, 'pct0'), num(r.contribution, 'mxn')] as Cell[]).concat([['Precio combinado', '', '', '', num(K.weightSum, 'pct0'), num(typeof K.value === 'number' ? K.value : null, 'mxn')]]), { bold: [K.rows.length] }),
      p((rel.comps && typeof rel.comps.value === 'number' ? 'Los múltiplos de competidores dan ' + mxn(rel.comps.value) + '. ' : '') + (rel.transactions && typeof rel.transactions.value === 'number' ? 'Las transacciones comparables (' + mxn(rel.transactions.value) + ') se calculan pero pesan ' + pct(K.rows.find(r => r.key === 'transactions')?.weight ?? 0, 0) + ' porque la muestra no es defendible.' : '')),
      ...(combined != null ? [key('Precio combinado: ' + mxn(combined) + ', ' + pct(Math.abs(combined / b.price - 1), 1) + (combined >= b.price ? ' arriba' : ' abajo') + ' del precio.')] : [])
    ] });
  }

  // ---------- 6. Escenarios
  const SR = (label: string, f: (m: NonNullable<typeof sb[0]>, i: number) => Cell): Cell[] => [label, ...scen.map((s, i) => s.m ? f(s.m, i) : 'n.d.')];
  sections.push({ id: 'scen', title: '6. Escenarios', exec: true, blocks: [
    p('Cada escenario corre el modelo completo, con el WACC iterado. ' + (S?.scenarios.why ? S.scenarios.why.join(' ') : '')),
    tbl('scen', 'Comparativo de escenarios', 'hoja Escenarios, filas 6 a 16 y 21 a 40', ['Variable', ...scen.map(s => s.label + (s.active ? ' (activo)' : ''))], [
      SR('Inflación ' + R[0].year + ' a ' + last.year, m => num(m.inflation, 'pct')),
      SR('Ajuste al crecimiento de ventas (pp por año)', m => num(m.salesAdj * 100, 'n2', true)),
      SR('Ajuste al margen EBIT (pp)', m => num(m.marginAdj * 100, 'n2', true)),
      SR('Beta de regresión ± 1 error típico (x)', m => num(m.betaLevered, 'b4')),
      SR('Crecimiento de ventas (CAGR 2025 a ' + last.year + ')', m => num(m.salesCagr, 'pct')),
      SR('Margen EBIT promedio', m => num(m.marginAvg, 'pct')),
      SR('Beta apalancada, iterada en el DCF (x)', m => num(m.betaIter, 'b4')),
      SR('Tasa libre de riesgo', m => num(m.rf, 'pct')),
      SR('Ke (iterado)', m => num(m.ke, 'pct')), SR('WACC (iterado)', m => num(m.wacc, 'pct')), SR('Crecimiento perpetuo g', m => num(m.g, 'pct')),
      SR('FCF ' + last.year + ' (mdp)', m => num(m.fcfLast, 'mdp')), SR('Suma VP de FCF (mdp)', m => num(m.pvFcf, 'mdp')),
      SR('Valor terminal Gordon (mdp)', m => num(m.tvG, 'mdp')), SR('Valor terminal ponderado (mdp)', m => num(m.tvBlend, 'mdp')),
      SR('Enterprise Value, ' + L.closeDate + ' (mdp)', m => num(m.ev, 'mdp')), SR('Equity Value, fecha de valuación (mdp)', m => num(m.equity, 'mdp')),
      SR('Valor por acción (MXN)', m => num(m.price, 'mxn')), SR('Precio de mercado (MXN)', m => num(m.market, 'mxn')),
      SR('Diferencia (MXN)', m => num(m.diff, 'mxn', true)), SR('Diferencia (%)', m => num(m.diffPct, 'pct1', true)),
      SR('Recomendación (umbral ±' + pct(b.threshold, 0) + ')', m => m.recommendation)
    ], { bold: [17, 21] }),
    ...ch('scenPrice'),
    tbl('tornado', 'Tornado: valor por acción moviendo una variable a la vez (MXN)', 'hoja Escenarios, filas 47 a 63', ['Variable', 'Valor bajo', 'Valor alto', 'Precio bajo', 'Precio alto', 'Rango'], torn.map(t => [tornLabel(t), t.lowInput != null ? (t.key === 'beta' ? fixed(t.lowInput, 4) : pct(t.lowInput)) : '', t.highInput != null ? (t.key === 'beta' ? fixed(t.highInput, 4) : pct(t.highInput)) : '', num(t.low, 'mxn'), num(t.high, 'mxn'), num(t.range, 'mxn')] as Cell[])),
    ...ch('tornado'),
    key('Rango de ' + fixed(scLo, 2) + ' a ' + fixed(scHi, 2) + ' MXN. Con el umbral de ±' + pct(b.threshold, 0) + ': ' + scen.map(s => s.m ? s.m.recommendation + ' en el ' + s.label + ' (' + (s.m.diffPct >= 0 ? '+' : '−') + pct(Math.abs(s.m.diffPct), 1) + ')' : '').join(', ') + '.')
  ] });

  // ---------- 7. Validación
  const sens = tbl('sens', 'Sensibilidad del valor por acción a WACC y g (MXN)', 'hoja Proyección Final Soriana (A162:F167); flujos y Ke fijos', ['WACC \\ g', ...grid.gs.map(g => pct(g / 100))], grid.ws.map((w, i) => [pct(w / 100), ...grid.cells[i].map(v => num(v, 'mxn'))] as Cell[]), { bold: [2], note: 'Caso activo en la fila y columna centrales. Filas: WACC; columnas: g.' });
  sections.push({ id: 'valid', title: '7. Validación', blocks: [
    tbl('valueVsPrice', 'Valor estimado frente a valor observado (MXN)', 'hojas Validación (sección 1) y Valuación Combinada', ['Caso', 'Valor', 'Precio', 'Dif. MXN', 'Dif. %', 'Recomendación'], scen.map(s => [s.label + (s.active ? ' (activo)' : ''), num(s.m?.price, 'mxn'), num(s.m?.market, 'mxn'), num(s.m?.diff, 'mxn', true), num(s.m?.diffPct, 'pct1', true), s.m?.recommendation ?? ''] as Cell[]).concat(combined != null ? [['Combinado (DCF y múltiplos)', num(combined, 'mxn'), num(b.price, 'mxn'), num(combined - b.price, 'mxn', true), num(combined / b.price - 1, 'pct1', true), 'Referencia']] : [])),
    sens,
    ...(T ? [p(T.sensitivity.join(' '))] : []),
    tbl('checks', 'Comprobaciones de fórmulas (cada resultado se recalcula por otro camino)', 'hoja Validación, sección 6', ['Comprobación', 'Modelo', 'Otro camino', 'Diferencia', 'Estado'], checks.map(c => [c.label, c.kind === 'bool' ? (c.model ? 'Sí' : 'No') : c.kind === 'count' ? String(c.model) : c.kind === 'bp' ? fixed(c.model, 5) : num(c.model, Math.abs(c.model) > 100 ? 'mdp' : Math.abs(c.model) < 1 ? 'n4' : 'mxn'), c.kind === 'bool' ? (c.other ? 'Sí' : 'No') : c.kind === 'count' ? String(c.other) : c.kind === 'bp' ? fixed(c.other, 0) : num(c.other, Math.abs(c.other) > 100 ? 'mdp' : Math.abs(c.other) < 1 ? 'n4' : 'mxn'), fixed(c.diff, 6), c.ok ? 'Cuadra' : 'Revisar'] as Cell[]), { note: checks.filter(c => c.ok).length + ' de ' + checks.length + ' comprobaciones cuadran.' }),
    tbl('parity', 'Validación contra el Excel (mismos supuestos que el Excel)', 'hoja Validación, sección 7; Excel = dataset SORIANA_FINAL, App = motor', ['Resultado', 'Excel', 'App', 'Diferencia', 'Diferencia %', 'Semáforo'], parity.map(r => [r.label, num(r.excel, r.unit === '%' ? 'pct' : r.unit === 'mdp' ? 'mdp1' : 'mxn'), num(B.isDefault ? r.app : null, r.unit === '%' ? 'pct' : r.unit === 'mdp' ? 'mdp1' : 'mxn'), B.isDefault && r.diff != null ? fixed(r.diff, 6) : '', B.isDefault && r.app != null ? fixed((r.app / r.excel - 1) * 100, 6) + '%' : '', B.isDefault ? (r.ok ? 'Verde' : 'Rojo') : 'n.a.'] as Cell[]),
      { note: B.isDefault ? 'Tolerancias: precio ±0.01 MXN, tasas ±0.01 pp, montos ±1 mdp. ' + parity.filter(r => r.ok).length + ' de ' + parity.length + ' en verde.' : 'Con supuestos modificados la columna App no es comparable con el Excel; restablezca los supuestos del Excel para validar.' }),
    ...(T ? [{ kind: 'text', style: 'bullets', title: 'Posibles razones de la diferencia entre el valor y el precio', items: T.reasons } as RText] : [])
  ] });

  // ---------- 8. Conclusiones
  if (T) sections.push({ id: 'concl', title: '8. Conclusiones, interpretación y riesgos', exec: true, blocks: [
    { kind: 'text', style: 'def', pairs: T.conclusions },
    { kind: 'text', style: 'bullets', title: 'Riesgos y limitaciones', items: T.limits },
  ] });
  if (T) sections.push({ id: 'questions', title: 'Preguntas de análisis', blocks: T.questions.map(([a, z], i) => ({ kind: 'text', style: 'question', title: (i + 1) + '. ' + a, body: z } as RText)) });
  sections.push({ id: 'refs', title: 'Referencias', blocks: [{ kind: 'text', style: 'bullets', items: [
    'Banco de México. Inflación general anual, serie quincenal SP74833.',
    'Banco de México. Encuesta sobre las Expectativas de los Especialistas en Economía del Sector Privado, septiembre 2026.',
    'Investing.com. Precios históricos de Soriana B y del S&P/BMV IPC, semanales.',
    'Organización Soriana. Reportes de resultados 4T25 y 2T26 a la BMV.',
    'Fondo Monetario Internacional. World Economic Outlook, abril 2026.',
    'S&P Capital IQ. Quick Comparable Analysis y Comparable M&A Transactions.',
    AUTHOR.name.split(' ').slice(-2).join(' ') + ', ' + AUTHOR.name.split(' ').slice(0, 2).map(x => x[0] + '.').join(' ') + ' (' + AUTHOR.year + '). Excel del estudio de valuación de Soriana (SORIANA_FINAL.xlsx).'
  ] }] });

  // ---------- Apéndices
  const appendixCharts = ['infl_medium_lin', 'infl_medium_exp', 'infl_long_lin', 'infl_long_exp', 'infl_longQ_lin', 'infl_longQ_exp', 'retVsDInfl', 'trend_soriana_lin', 'trend_soriana_exp', 'trend_ipc_lin', 'trend_ipc_exp'].flatMap(ch);
  sections.push({ id: 'appA', title: 'Apéndice A. Gráficas complementarias', page: true, blocks: appendixCharts });
  const assumptions: Cell[][] = [
    ['Inflación anual ' + R[0].year + ' a ' + last.year, num(A.inflationRate, 'pct'), 'Modelos de tendencia de la inflación (escenario activo)'],
    ['Ajuste al crecimiento de ventas', num(A.salesAdj, 'pct', true), 'Escenario activo'], ['Ajuste al margen EBIT', num(A.marginAdj, 'pct', true), 'Escenario activo'],
    ['Tasa libre de riesgo', num(W.rf, 'pct'), L.rfSource + ', ajustado por la inflación del escenario'], ['Prima de riesgo de mercado', num(W.prm, 'pct'), 'Rendimiento extra de acciones sobre bonos'],
    ['Beta de regresión (apalancada a mercado)', num(A.betaLevered ?? null, 'b4'), 'Hoja Beta Regresión'], ['Beta iterada en el DCF', num(it.beta, 'b4'), 'Con la deuda del DCF'],
    ['Costo del capital', num(b.ke, 'pct'), 'Rf + beta × prima'], ['Costo de la deuda antes de impuestos', num(it.kd, 'pct'), 'Tasa esperada'], ['Tasa de impuestos', num(it.tax, 'pct'), 'Tasa efectiva proyectada'],
    ['Deuda total (mdp)', num(mk.D, 'mdp'), 'Bancaria, bursátil y arrendamientos'], ['WACC usado en el DCF', num(b.wacc, 'pct'), A.waccMode === 'iterated' ? 'WACC iterado' : 'Modo ' + A.waccMode],
    ['Crecimiento perpetuo (g)', num(b.g, 'pct'), 'Hoja Crecimiento Perpetuo'], ['Múltiplo de salida EV/EBITDA', num(b.mult, 'x'), L.multipleSource],
    ['Peso Gordon / múltiplo', pct(b.wG, 0) + ' / ' + pct(1 - b.wG, 0), 'Promedio de los dos métodos'], ['Acciones en circulación (millones)', num(b.shares, 'mdp'), 'Hoja WACC'],
    ['Precio de mercado (MXN)', num(b.price, 'mxn'), String(M.priceSource ?? '')], ['Fecha de valuación', isoToText(A.valuationDate ?? ''), 'Fecha del último precio']
  ];
  sections.push({ id: 'appB', title: 'Apéndice B. Supuestos utilizados', blocks: [
    tbl('assumptions', 'Supuestos del modelo principal', 'hoja Validación, sección 2', ['Supuesto', 'Valor', 'De dónde sale'], assumptions),
    ...(B.changes.length ? [tbl('changes', 'Supuestos modificados respecto al Excel', 'Laboratorio de la app', ['Supuesto', 'Excel', 'Actual'], B.changes)] : [])
  ] });
  sections.push({ id: 'appD', title: 'Apéndice C. Sensibilidades adicionales', blocks: ['priceWacc', 'evEqScen', 'inflValue', 'betaKe', 'gEv'].flatMap(ch) });

  return {
    sections, texts: T, bundle: B,
    meta: {
      title: 'Estudio financiero y valuación de Soriana: de la inflación al valor por acción', subtitle: 'Resumen técnico y ejecutivo (DCF, WACC, beta, crecimiento perpetuo y escenarios)',
      company: P.legalName || P.name, ticker: P.ticker || '', priceDate: isoToText(A.valuationDate ?? (M.priceDate as string)),
      generated: now.getDate() + ' de ' + ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][now.getMonth()] + ' de ' + now.getFullYear(),
      changes: B.changes, keyFacts
    }
  };
}

/** Numera tablas y gráficas en el orden en que aparecen (Tabla 1, Gráfica 1…). */
export function numberBlocks(sections: Section[]) {
  let t = 0, g = 0;
  sections.forEach(s => s.blocks.forEach(bk => { if (bk.kind === 'table') bk.n = ++t; if (bk.kind === 'chart') bk.n = ++g; }));
}

/** Variante "Resumen ejecutivo": portada + resumen, escenarios y conclusiones. */
export function execSections(r: Report): Section[] {
  const KEEP = /^(Inflación|Beta de regresión|WACC|Crecimiento perpetuo|Enterprise Value|Equity Value|Valor por acción|Precio de mercado|Diferencia \(%\)|Recomendación)/;
  return r.sections.filter(s => s.exec).map(s => {
    if (s.id === 'scen') return { ...s, blocks: s.blocks.filter(b => b.kind === 'chart' || (b.kind === 'table' && b.id === 'scen')).map(b => b.kind === 'table' ? { ...b, rows: b.rows.filter(rw => KEEP.test(String(rw[0]))), bold: [] } : b) };
    if (s.id === 'concl') return { ...s, blocks: s.blocks.filter(b => b.kind === 'text' && b.style === 'def') };
    if (s.id === 'exec') return { ...s, blocks: s.blocks.filter(b => !(b.kind === 'text' && b.style === 'p' && /^En el escenario/.test(b.body ?? ''))) };
    return s;
  });
}

export { fmt };
