// Presentación ejecutiva (7 diapositivas, 16:9). Función pura: todo sale del motor y del dataset con los supuestos activos.
// Recurso visual común: la "línea de mercado" (precio de referencia) aparece en cada gráfica de valor, para que cada
// diapositiva responda lo mismo: ¿dónde queda este resultado frente al precio?
import * as E from '../../engine';
import { fmt as f, type Assumptions, type Dataset, type RunOk } from '../../engine';

export const C = {
  paper: '#f2f2f3', ink: '#1d1f20', steel: '#5980a6', steelDk: '#416180', steelLt: '#b5d9fd', night: '#1d2d3d', nightLine: '#314457',
  gray: '#7a7a7d', grayLt: '#d4d4d7', neg: '#b4433a', pos: '#2f6b4f', market: '#1d1f20'
};
const FONT = 'Barlow, Arial, sans-serif', COND = '"Barlow Condensed", Barlow, Arial, sans-serif';
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = (x: number) => Math.round(x * 10) / 10;
const T = (x: number, y: number, s: string, o: { size?: number; c?: string; a?: 'start' | 'middle' | 'end'; w?: number; cond?: boolean; cls?: string } = {}) =>
  `<text x="${r2(x)}" y="${r2(y)}" font-family='${o.cond ? COND : FONT}' font-size="${o.size ?? 16}" fill="${o.c ?? C.ink}" text-anchor="${o.a ?? 'start'}" font-weight="${o.w ?? 400}"${o.cls ? ` class="${o.cls}"` : ''}>${esc(s)}</text>`;
const Ln = (x1: number, y1: number, x2: number, y2: number, c: string, w = 1, dash = '', cls = '') => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}${cls ? ` class="${cls}"` : ''}/>`;
const Rc = (x: number, y: number, w: number, h: number, fill: string, extra = '') => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(Math.max(0, w))}" height="${r2(Math.max(0, h))}" fill="${fill}" ${extra}/>`;
const svg = (w: number, h: number, body: string, bg = 'none') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${bg !== 'none' ? Rc(0, 0, w, h, bg) : ''}${body}</svg>`;
/** Separa etiquetas verticales para que no se encimen (mínimo `gap` px entre centros). */
function spread(ys: number[], gap: number): number[] {
  const idx = ys.map((y, i) => [y, i] as [number, number]).sort((a, b) => a[0] - b[0]), out = [...ys];
  for (let k = 1; k < idx.length; k++) { const prev = out[idx[k - 1][1]]; if (out[idx[k][1]] - prev < gap) out[idx[k][1]] = prev + gap; }
  return out;
}
const cur = (v: number | null | undefined, d = 2) => v == null || !isFinite(v) ? 'NA' : f.cur(v, d);
const num = (p: E.Price) => E.isNum(p) ? p : null;

export interface Slide {
  key: string; theme: 'light' | 'dark'; kicker: string; title: string; lede?: string;
  figure?: string; side?: { k: string; v: string; s?: string; tone?: 'neg' | 'pos' | 'muted' }[]; notes?: string[];
  /** Cifras clave en franja (portada). */
  kpis?: { k: string; v: string; s?: string; tone?: 'pos' | 'neg' | 'accent' }[];
  /** Distintivo de la recomendación (cierre). */
  badge?: { v: string; s: string; tone: 'pos' | 'neg' | 'neutral' };
  cta?: boolean;
}

export interface DeckData { slides: Slide[]; company: string; ticker: string; market: string; marketDate: string; modified: boolean; logo?: string | null }

/** Construye las 7 diapositivas con los supuestos activos. */
export function buildDeck(ds: Dataset, A: Assumptions, b: RunOk, team: string[], institution: string, modified: boolean): DeckData {
  const P = ds.profile, L = E.labelsOf(ds), price = b.price, mkt = cur(price), mktDate = ds.dates.price;
  const RV = E.relative(ds, A, b.value), Rec = E.recommendation(ds, A, b);
  const sc = E.scenarios(ds, A, b), off = sc.filter(s => !s.reference && s.value != null);
  const torn = E.tornado(ds, A, b);
  const target = Rec && Rec.target != null ? Rec.target : (num(RV.combined ? RV.combined.value : 'NA') ?? b.value);
  const pot = target / price - 1;
  const slides: Slide[] = [];
  // Regla del precio objetivo con los pesos activos (pueden cambiar en el Laboratorio).
  const wRows = RV.combined ? RV.combined.rows.filter(r => r.weight > 0) : [];
  const wTxt = (r: E.CombinedRow) => Math.round(r.weight * 100) + '% ' + (r.key === 'dcf' ? 'DCF' : r.key === 'comps' ? 'Trading Comps' : 'Transacciones');
  const ruleShort = wRows.length ? wRows.map(wTxt).join(' + ') : 'DCF';
  const ruleLong = wRows.length ? wRows.map(r => wTxt(r) + ' (' + cur(num(r.price)) + ')').join(' + ') : 'DCF (' + cur(b.value) + ')';
  const rating = Rec?.rating || (b.signal ? b.signal.toUpperCase() : '—'), th = Rec ? Rec.buy : b.threshold;
  const tone = rating === 'COMPRAR' ? 'pos' : rating === 'VENDER' ? 'neg' : 'neutral';

  // ---------- 1. Conclusión ----------
  {
    const W = 1420, H = 250, x0 = Math.min(b.value, target, price, num(RV.comps?.value ?? 'NA') ?? price) * 0.86, x1 = Math.max(b.value, target, price, num(RV.comps?.value ?? 'NA') ?? price) * 1.12;
    const X = (v: number) => 40 + (v - x0) / (x1 - x0) * (W - 80);
    let s = Ln(40, 150, W - 40, 150, C.nightLine, 2);
    for (let v = Math.ceil(x0); v <= x1; v += 1) s += Ln(X(v), 144, X(v), 156, C.nightLine, 1) + (v % 2 === 0 ? T(X(v), 182, '$' + v, { size: 15, c: '#9ebbd8', a: 'middle' }) : '');
    const marks: [number, string, string, number][] = [[b.value, 'DCF', '#9ebbd8', 92], [num(RV.comps?.value ?? 'NA') ?? NaN, 'Trading Comps', '#9ebbd8', 66], [target, 'Precio objetivo combinado', '#ffffff', 34]];
    marks.filter(m => isFinite(m[0])).forEach(([v, l, c, y]) => {
      // Si la etiqueta cae sobre la línea de mercado, se alinea hacia el lado contrario.
      const a = Math.abs(X(v) - X(price)) < 160 ? (v >= price ? 'start' : 'end') : 'middle', dx = a === 'start' ? 10 : a === 'end' ? -10 : 0;
      s += Ln(X(v), y + 10, X(v), 150, c, 2, '', 'draw') + `<circle cx="${r2(X(v))}" cy="150" r="7" fill="${c}"/>` + T(X(v) + dx, y, l + ' ' + cur(v), { size: 18, c, a, w: 600 });
    });
    s += Ln(X(price), 60, X(price), 214, '#ffffff', 2, '6 5') + T(X(price), 236, 'Precio de mercado ' + mkt + ' (' + mktDate + ')', { size: 16, c: '#ffffff', a: 'middle' });
    slides.push({
      key: 'conclusion', theme: 'dark', kicker: 'Valuación de ' + P.name + ' (' + (P.ticker || '') + ')',
      title: 'Precio objetivo de ' + cur(target) + ' por acción: ' + f.p(Math.abs(pot), 1) + (pot >= 0 ? ' arriba' : ' abajo') + ' del mercado',
      lede: 'Precio objetivo = ' + ruleLong + '. Recomendación con umbral de ±' + f.p(th, 0) + ' sobre el precio de mercado.',
      kpis: [
        { k: 'Precio objetivo', v: cur(target), s: ruleShort, tone: 'accent' },
        { k: 'Precio de mercado', v: mkt, s: 'cierre ' + mktDate },
        { k: 'Potencial', v: f.pp(pot), s: 'umbral ±' + f.p(th, 0), tone: pot >= 0 ? 'pos' : 'neg' },
        { k: 'Recomendación', v: rating, s: Rec ? 'precio objetivo vs. mercado' : 'DCF vs. mercado', tone: tone === 'neutral' ? undefined : tone }
      ],
      figure: svg(W, H, s)
    });
  }

  // ---------- 2. Inflación ----------
  if (ds.inflation && ds.inflation.series) {
    const I = ds.inflation, S = I.series!.filter(x => x[0] >= '2022-01-01'), W = 980, H = 470, L0 = 64, R0 = 230, T0 = 30, B0 = 50;
    const t0 = Date.parse(S[0][0]), tEnd = Date.parse('2030-12-31'), tLast = Date.parse(S[S.length - 1][0]);
    const vals = S.map(x => x[1]), yMax = Math.ceil(Math.max(...vals) + 0.5), yMin = 0;
    const X = (t: number) => L0 + (t - t0) / (tEnd - t0) * (W - L0 - R0), Y = (v: number) => T0 + (yMax - v) / (yMax - yMin) * (H - T0 - B0);
    let s = Rc(L0, Y(4), X(tEnd) - L0, Y(2) - Y(4), '#e7eef6') + T(L0 + 8, Y(4) + 18, 'Meta de Banxico 3% ± 1 pp', { size: 14, c: C.steelDk });
    for (let v = 0; v <= yMax; v += 2) s += Ln(L0, Y(v), X(tEnd), Y(v), C.grayLt, 1) + T(L0 - 10, Y(v) + 5, v + '%', { size: 14, c: C.gray, a: 'end' });
    for (let y = 2022; y <= 2030; y++) s += T(X(Date.parse(y + '-07-01')), H - 18, String(y), { size: 14, c: C.gray, a: 'middle' });
    s += `<path class="draw" d="${S.map((x, i) => (i ? 'L' : 'M') + r2(X(Date.parse(x[0]))) + ' ' + r2(Y(x[1]))).join(' ')}" fill="none" stroke="${C.ink}" stroke-width="2.4"/>`;
    s += Ln(X(tLast), T0, X(tLast), H - B0, C.gray, 1, '4 4') + T(X(tLast) + 6, T0 + 14, 'Proyección 2026–2030', { size: 14, c: C.gray });
    const sc0 = I.order.map(k => ({ k, s: I.scenarios[k], v: (I.scenarios[k].value ?? (I.scenarios[k].path ? I.scenarios[k].path![0] : 0)) * 100 }));
    const ly = spread(sc0.map(x => Y(x.v) + 5), 20);
    sc0.forEach(({ k, s: x, v }, j) => {
      const on = (A.inflation ?? I.default) === k;
      s += Ln(X(tLast), Y(v), X(tEnd), Y(v), on ? C.steelDk : C.steel, on ? 3.5 : 1.5, on ? '' : '6 5') + T(X(tEnd) + 10, ly[j], x.label + ' ' + v.toFixed(2) + '%', { size: 16, c: on ? C.steelDk : C.gray, w: on ? 600 : 400 });
    });
    const last = S[S.length - 1], corr = ds.study && ds.study.correlations[0];
    slides.push({
      key: 'inflacion', theme: 'light', kicker: 'Contexto macroeconómico',
      title: 'La inflación bajó a ' + last[1].toFixed(2) + '% y el escenario Base la fija en ' + f.p((I.scenarios[A.inflation ?? I.default].value ?? 0), 2) + ' hasta 2030',
      figure: svg(W, H, s),
      side: [
        ...off.map(x => ({ k: x.label + ' · ' + f.p(x.inflation, 2), v: cur(x.value), s: x.active ? 'escenario activo' : 'DCF con este escenario', tone: x.active ? undefined : 'muted' as const }))
      ],
      notes: ['La inflación entra al modelo solo por el crecimiento nominal de ventas (WACC nominal fijo).',
        corr ? 'Precio de Soriana vs. inflación: correlación ' + (+corr[1]).toFixed(2) + ' en ' + String(corr[0]).replace(/^Toda la muestra\s*/i, '').replace(/[()]/g, '') + '; relación débil, no causal.' : ''].filter(Boolean)
    });
  }

  // ---------- 3. Riesgo y costo de capital ----------
  {
    const W0 = b.W, src = W0.src!, W = 980, H = 430, L0 = 220, R0 = 40, max = Math.ceil(Math.max(src.ke, b.wacc) * 100 + 2);
    const X = (pct: number) => L0 + pct / max * (W - L0 - R0);
    let s = '';
    for (let v = 0; v <= max; v += 2) s += Ln(X(v), 30, X(v), 330, C.grayLt, 1) + T(X(v), 352, v + '%', { size: 14, c: C.gray, a: 'middle' });
    const rf = W0.rf * 100, prem = src.beta * W0.prm * 100, ke = src.ke * 100, kdAT = src.kdAT * 100, w = b.wacc * 100;
    s += T(L0 - 16, 92, 'Costo del capital (Ke)', { size: 18, a: 'end', w: 600 });
    s += Rc(X(0), 70, X(rf) - X(0), 34, C.steelLt, 'class="grow"') + Rc(X(rf), 70, X(rf + prem) - X(rf), 34, C.steel, 'class="grow"');
    s += T(X(rf / 2), 92, 'Rf ' + rf.toFixed(2) + '%', { size: 15, a: 'middle', c: C.night }) + (X(rf + prem) - X(rf) > 150 ? T(X(rf + prem / 2), 92, 'βL × PRM ' + prem.toFixed(2) + '%', { size: 15, a: 'middle', c: '#fff' }) : T(X(rf + prem), 126, 'βL × PRM ' + prem.toFixed(2) + '%', { size: 15, a: 'end', c: C.steelDk }));
    s += T(X(ke) + 10, 93, f.p(src.ke, 2), { size: 22, w: 600, cond: true });
    s += T(L0 - 16, 182, 'Costo de la deuda Kd(1−t)', { size: 18, a: 'end', w: 600 });
    s += Rc(X(0), 160, X(kdAT) - X(0), 34, C.grayLt, 'class="grow"') + T(X(kdAT) + 10, 183, f.p(src.kdAT, 2) + ' (Kd ' + f.p(src.kd, 1) + ', t ' + f.p(src.tax, 0) + ')', { size: 18, cond: true });
    s += T(L0 - 16, 272, 'WACC', { size: 20, a: 'end', w: 700 });
    s += Rc(X(0), 250, X(w) - X(0), 40, C.steelDk, 'class="grow"') + T(X(w) + 10, 278, f.p(b.wacc, 2), { size: 30, w: 600, cond: true });
    s += T(X(0) + 10, 276, f.p(src.wE, 0) + ' capital × Ke + ' + f.p(src.wD, 0) + ' deuda × Kd(1−t)', { size: 15, c: '#fff' });
    const H2 = 430;
    // Sensibilidad a la beta (motor): βU documentadas
    const Bt = ds.beta, Rg = Bt && Bt.regression, D0 = E.defaults(ds).betaU;
    const betas: [number, string][] = [[A.betaU, Math.abs(A.betaU - D0) < 1e-9 ? (Rg && Math.abs(Rg.unlevered - D0) < 1e-9 ? 'regresión semanal · usada' : 'usada') : 'Laboratorio · usada']];
    if (Rg) betas.push([Rg.unlevered, 'regresión semanal (oficial)']);
    if (Bt && Bt.unleveredCash != null) betas.push([Bt.unleveredCash, 'Damodaran · referencia']);
    const uniq = betas.filter((x, i) => betas.findIndex(y => Math.abs(y[0] - x[0]) < 1e-9) === i).sort((a, z) => a[0] - z[0]);
    const side = uniq.map(([bu, lab]) => { const r = E.run(ds, { ...A, betaU: bu }); return { k: 'βU ' + (Math.abs(bu * 100 - Math.round(bu * 100)) > 1e-9 ? bu.toFixed(4) : bu.toFixed(2)) + ' · ' + lab, v: r.ok ? cur(r.value) : 'NA', tone: (Math.abs(bu - A.betaU) < 1e-9 ? undefined : 'muted') as 'muted' | undefined }; });
    const hb = ds.inflation && ds.inflation.beta;
    slides.push({
      key: 'riesgo', theme: 'light', kicker: 'Riesgo y costo de capital',
      title: 'Los accionistas exigen ' + f.p(src.ke, 1) + '; con la deuda, el flujo se descuenta al ' + f.p(b.wacc, 2),
      figure: svg(W, H2, s), side,
      notes: ['βU ' + A.betaU.toFixed(4) + (Rg && Math.abs(A.betaU - Rg.unlevered) < 1e-9 ? ' (regresión semanal: βL observada ' + Rg.levered.toFixed(4) + ' desapalancada)' : '') + ' reapalancada con D/E ' + src.de.toFixed(2) + ' → βL ' + src.beta.toFixed(3) + '.',
        Rg ? 'La pendiente de la regresión no es significativa al 95% (p ≈ 0.09); con Damodaran (βU ' + (Bt!.unleveredCash ?? Bt!.unlevered).toFixed(2) + ') el valor sería el de la tabla.' : (hb ? 'La regresión propia de Soriana da β ' + (+hb.historical).toFixed(3) + ' con R² ' + (+hb.r2).toFixed(4) + '.' : '')].filter(Boolean)
    });
  }

  // ---------- 4. Generación de efectivo ----------
  {
    const R = b.rows, W = 980, H = 440, L0 = 70, B0 = 56, T0 = 40, max = Math.max(...R.map(r => r.fcf)) * 1.18, bw = 70;
    const Y = (v: number) => T0 + (1 - v / max) * (H - T0 - B0), step = (W - L0 - 40) / R.length;
    let s = '';
    for (let v = 0; v <= max; v += 2000) s += Ln(L0, Y(v), W - 20, Y(v), C.grayLt, 1) + T(L0 - 10, Y(v) + 5, f.m(v), { size: 14, c: C.gray, a: 'end' });
    R.forEach((r, i) => {
      const x = L0 + i * step + step / 2;
      s += Rc(x - bw - 4, Y(r.fcf), bw, Y(0) - Y(r.fcf), C.steel, 'class="grow"') + Rc(x + 4, Y(r.pv), bw, Y(0) - Y(r.pv), C.steelLt, 'class="grow"');
      s += T(x - bw / 2 - 4, Y(r.fcf) - 8, f.m(r.fcf), { size: 15, a: 'middle', w: 600 }) + T(x + bw / 2 + 4, Y(r.pv) - 8, f.m(r.pv), { size: 13, a: 'middle', c: C.gray });
      s += T(x, H - 30, r.year, { size: 16, a: 'middle', w: 600 }) + T(x, H - 10, 'ventas ' + f.m(r.revenue / 1000, 0) + ' mil · margen ' + f.p(r.margin, 1), { size: 12, a: 'middle', c: C.gray });
    });
    s += Rc(L0, 8, 14, 14, C.steel) + T(L0 + 20, 20, 'FCFF (mdp)', { size: 14 }) + Rc(L0 + 140, 8, 14, 14, C.steelLt) + T(L0 + 160, 20, 'Valor presente al WACC', { size: 14 });
    const first = R[0].fcf, lastR = R[R.length - 1].fcf;
    slides.push({
      key: 'flujos', theme: 'light', kicker: 'Generación de efectivo',
      title: 'El flujo libre crece de ' + f.m(first) + ' a ' + f.m(lastR) + ' mdp, pero ' + f.p(b.tvWeightW, 0) + ' del valor está después de ' + R[R.length - 1].year,
      figure: svg(W, H, s),
      side: [{ k: 'VP de los flujos ' + R[0].year + '–' + R[R.length - 1].year, v: f.m(b.pvSum) + ' mdp' }, { k: 'VP del valor terminal (50% Gordon, 50% múltiplo ' + f.x(b.mult ?? 0, 2) + ')', v: f.m(b.pvTvW) + ' mdp' }, { k: 'Crecimiento perpetuo g', v: f.p(b.g, 2), s: 'g implícita en el múltiplo: ' + (b.impliedG != null ? f.p(b.impliedG, 2) : 'NA') }],
      notes: ['FCFF = NOPAT + D&A − Capex − ΔNWC; valor terminal con FCF normalizado (capex = D&A).']
    });
  }

  // ---------- 5. Construcción del valor (cascada) ----------
  {
    type St = { l: string; v?: number; t?: number };
    const st: St[] = [{ l: 'VP flujos', v: b.pvSum }, { l: 'VP valor terminal', v: b.pvTvW }, { l: 'EV ' + L.closeDate, t: b.evW }];
    if (b.roll) st.push({ l: 'Capitalización y FCF ' + L.rollFcf, v: b.roll.capGain + b.roll.fcfGenerated }, { l: 'EV ' + L.rollDate, t: b.roll.ev2 }, { l: 'Deuda', v: -b.roll.debt }, { l: 'Arrendamientos', v: -b.roll.lease }, { l: 'Efectivo', v: b.roll.cash }, { l: 'Capitalización a Ke', v: b.roll.keGain }, { l: 'Equity', t: b.roll.eq3 });
    else st.push({ l: 'Deuda neta', v: -b.nd }, { l: 'Equity', t: b.eqClose });
    const W = 1400, H = 440, L0 = 20, T0 = 36, B0 = 70, n = st.length, step = (W - L0 * 2) / n, bw = step * 0.62;
    let acc = 0; const segs = st.map(x => { if (x.t != null) { acc = x.t; return { ...x, a: 0, z: x.t }; } const a = acc; acc += x.v!; return { ...x, a, z: acc }; });
    const max = Math.max(...segs.map(x => Math.max(x.a, x.z))) * 1.1, Y = (v: number) => T0 + (1 - v / max) * (H - T0 - B0);
    let s = '';
    segs.forEach((x, i) => {
      const xx = L0 + i * step + (step - bw) / 2, top = Y(Math.max(x.a, x.z)), bot = Y(Math.min(x.a, x.z)), tot = x.t != null, neg = !tot && (x.v ?? 0) < 0;
      s += Rc(xx, top, bw, bot - top, tot ? C.steelDk : neg ? '#d9a39e' : C.steelLt, 'class="grow"');
      if (i < segs.length - 1) s += Ln(xx + bw, Y(x.z), xx + step, Y(x.z), C.gray, 1, '3 3');
      s += T(xx + bw / 2, top - 8, (tot ? '' : (neg ? '−' : '+')) + f.m(Math.abs(tot ? x.t! : x.v!)), { size: 15, a: 'middle', w: tot ? 700 : 400, c: neg ? C.neg : C.ink });
      const words = x.l.split(' '), half = Math.ceil(words.length / 2), l1 = words.length > 2 ? words.slice(0, half).join(' ') : x.l, l2 = words.length > 2 ? words.slice(half).join(' ') : '';
      s += T(xx + bw / 2, H - 46, l1, { size: 14, a: 'middle', c: tot ? C.ink : C.gray, w: tot ? 600 : 400 }) + (l2 ? T(xx + bw / 2, H - 28, l2, { size: 14, a: 'middle', c: tot ? C.ink : C.gray, w: tot ? 600 : 400 }) : '');
    });
    s += T(W - L0, 22, '÷ ' + f.n(b.shares, 0) + ' millones de acciones = ' + cur(b.value) + ' por acción', { size: 18, a: 'end', w: 600 });
    slides.push({
      key: 'valor', theme: 'light', kicker: 'Construcción del valor',
      title: 'De ' + f.m(b.evW) + ' mdp de valor operativo a ' + cur(b.value) + ' por acción',
      figure: svg(W, H, s),
      side: [{ k: 'Enterprise Value ' + (b.roll ? 'al ' + L.rollDate : ''), v: f.m(b.ev) + ' mdp' }, { k: 'Equity Value a la fecha de valuación', v: f.m(b.eqVal) + ' mdp' }, { k: 'Valor DCF por acción', v: cur(b.value), s: (b.upside ?? 0) >= 0 ? '+' + f.p(b.upside, 1) + ' vs. precio' : '−' + f.p(Math.abs(b.upside ?? 0), 1) + ' vs. precio', tone: (b.upside ?? 0) < 0 ? 'neg' : 'pos' }]
    });
  }

  // ---------- 6. Contraste de metodologías (football field) ----------
  {
    type Row = { l: string; s: string; lo: number | null; hi: number | null; v: number | null; kind: 'main' | 'ref' | 'target' };
    const rows: Row[] = [];
    const scV = off.map(x => x.value as number);
    rows.push({ l: 'DCF', s: 'rango: escenarios de inflación', lo: Math.min(...scV), hi: Math.max(...scV), v: b.value, kind: 'main' });
    if (RV.comps) rows.push({ l: 'Trading Comps', s: RV.comps.n + ' pares · P25–P75', lo: num(RV.comps.p25), hi: num(RV.comps.p75), v: num(RV.comps.value), kind: 'main' });
    if (RV.sdc) rows.push({ l: 'Precedent Transactions', s: 'LSEG/SDC · ' + (RV.sdc.stats.evEbitda?.n ?? 0) + ' operaciones · P25–P75 · peso 0%', lo: num(RV.sdc.lo), hi: num(RV.sdc.hi), v: num(RV.sdc.value), kind: 'ref' });
    rows.push({ l: 'Precio objetivo combinado', s: ruleShort, lo: null, hi: null, v: target, kind: 'target' });
    const ex = (k: string) => (ds.external || []).find(x => x.key === k);
    const cons = ex('ciq_consensus'), star = ex('starmine_iv');
    if (cons) rows.push({ l: 'Consenso de analistas', s: 'S&P Capital IQ · 12 meses · referencia', lo: cons.lo, hi: cons.hi, v: cons.value, kind: 'ref' });
    if (star) rows.push({ l: 'StarMine (aprox.)', s: 'LSEG Refinitiv · leído de gráfica · referencia', lo: star.lo, hi: star.hi, v: star.value, kind: 'ref' });
    const all = rows.flatMap(r => [r.lo, r.hi, r.v]).filter((x): x is number => x != null).concat(price);
    const x0 = Math.floor(Math.min(...all) / 5) * 5, x1 = Math.ceil(Math.max(...all) / 5) * 5;
    const W = 1100, H = 470, L0 = 300, R0 = 40, T0 = 26, rh = (H - T0 - 50) / rows.length, X = (v: number) => L0 + (v - x0) / (x1 - x0) * (W - L0 - R0);
    let s = '';
    for (let v = x0; v <= x1; v += 5) s += Ln(X(v), T0, X(v), H - 44, C.grayLt, 1) + T(X(v), H - 22, '$' + v, { size: 14, c: C.gray, a: 'middle' });
    rows.forEach((r, i) => {
      const y = T0 + i * rh + rh / 2, ref = r.kind === 'ref';
      s += T(L0 - 16, y - 2, r.l, { size: 18, a: 'end', w: ref ? 400 : 600, c: ref ? C.gray : C.ink }) + T(L0 - 16, y + 18, r.s, { size: 12, a: 'end', c: C.gray });
      if (r.lo != null && r.hi != null) s += Rc(X(r.lo), y - 12, X(r.hi) - X(r.lo), 24, ref ? 'none' : C.steelLt, ref ? `stroke="${C.gray}" stroke-width="1.5" stroke-dasharray="5 4" class="grow"` : 'class="grow"');
      if (r.v != null) s += r.kind === 'target' ? `<rect x="${r2(X(r.v) - 11)}" y="${r2(y - 11)}" width="22" height="22" fill="${C.steelDk}" transform="rotate(45 ${r2(X(r.v))} ${r2(y)})"/>` : `<circle cx="${r2(X(r.v))}" cy="${r2(y)}" r="8" fill="${ref ? C.gray : C.steelDk}"/>`;
      if (r.v != null) { const near = Math.abs(X(r.v) - X(price)) < 34, a = near ? (r.v >= price ? 'start' : 'end') : 'middle'; s += T(X(r.v) + (a === 'start' ? 14 : a === 'end' ? -14 : 0), near ? y - 14 : y - 20, cur(r.v), { size: 15, a, w: 600, c: ref ? C.gray : C.ink }); }
    });
    s += Ln(X(price), T0 - 6, X(price), H - 44, C.market, 2, '7 5') + T(X(price) + 6, H - 50, 'Mercado ' + mkt, { size: 14, w: 600 });
    const pos = (r?: Row) => !r || r.lo == null || r.hi == null ? '' : price < r.lo ? 'arriba' : price > r.hi ? 'abajo' : 'en línea';
    const dcfPos = pos(rows.find(r => r.l === 'DCF')), compsPos = pos(rows.find(r => r.l === 'Trading Comps'));
    const refsBelow = rows.filter(r => r.kind === 'ref' && r.v != null && r.l !== 'StarMine (aprox.)').every(r => (r.v as number) < price);
    const mTitle = (dcfPos ? 'El DCF queda ' + (dcfPos === 'en línea' ? 'en línea con el mercado' : dcfPos + ' del mercado') : '') + (compsPos ? (dcfPos ? ' y los múltiplos ' : 'Los múltiplos quedan ') + (compsPos === 'en línea' ? 'en línea' : compsPos) : '') + (refsBelow ? '; transacciones y analistas apuntan más abajo' : '');
    slides.push({
      key: 'metodos', theme: 'light', kicker: 'Contraste de metodologías',
      title: mTitle || 'Contraste de metodologías frente al precio de mercado',
      figure: svg(W, H, s),
      notes: ['Barra llena = forma parte del precio objetivo. Contorno punteado = referencia (no entra al precio).', 'Transacciones: muestra global sin operaciones mexicanas; detalle por operación en 05 · Transacciones.']
    });
  }

  // ---------- 7. Escenarios, riesgos y conclusión ----------
  {
    const W = 760, H = 360, L0 = 24, T0 = 30, vals = off.map(x => x.value as number).concat(price), max = Math.max(...vals) * 1.12, min = Math.min(...vals) * 0.8;
    const X = (v: number) => L0 + 150 + (v - min) / (max - min) * (W - L0 - 210);
    let s = '';
    off.forEach((x, i) => {
      const y = T0 + i * 70 + 30;
      const xv = X(x.value as number), near = Math.abs(xv - X(price)) < 70;
      s += T(L0, y + 6, x.label + ' · ' + f.p(x.inflation, 2), { size: 17, w: x.active ? 700 : 400 }) + Rc(X(min), y - 14, xv - X(min), 28, x.active ? C.steelDk : C.steelLt, 'class="grow"') + T(near ? xv - 8 : xv + 8, y + 7, cur(x.value), { size: 20, w: 600, cond: true, a: near ? 'end' : 'start', c: near ? (x.active ? '#ffffff' : C.night) : C.ink });
    });
    s += Ln(X(price), T0, X(price), T0 + off.length * 70 + 10, C.market, 2, '6 5') + T(X(price), T0 + off.length * 70 + 32, 'Mercado ' + mkt, { size: 14, a: 'middle', w: 600 });
    const top = torn.slice(0, 3);
    top.forEach((t, i) => { const y = T0 + off.length * 70 + 78 + i * 28; s += T(L0, y, t.label + ' ±' + t.step + (t.unit === 'x' ? 'x' : ' pp'), { size: 15 }) + T(W - 20, y, cur(Math.min(t.low ?? NaN, t.high ?? NaN)) + ' a ' + cur(Math.max(t.low ?? NaN, t.high ?? NaN)), { size: 15, a: 'end', w: 600 }); });
    slides.push({
      key: 'cierre', theme: 'dark', kicker: 'Escenarios, riesgos y conclusión',
      title: 'Recomendación: ' + rating.toLowerCase() + '. El precio objetivo de ' + cur(target) + ' queda ' + f.p(Math.abs(pot), 1) + (pot >= 0 ? ' arriba' : ' abajo') + ' del mercado',
      badge: { v: rating, s: f.pp(pot) + ' vs. ' + mkt + ' · umbral ±' + f.p(th, 0), tone },
      figure: svg(W, H + 90, s.replace(/fill="#1d1f20"/g, 'fill="#ffffff"').replace(/stroke="#1d1f20"/g, 'stroke="#ffffff"').replace(/fill="#1d2d3d" font/g, 'fill="#1d2d3d" font')),
      side: [
        { k: 'Rango de valor razonable', v: cur(Rec?.fairLo) + ' – ' + cur(Rec?.fairHi), s: 'DCF, Comps y transacciones sin atípicos' },
        { k: 'Variable con más impacto: ' + (top[0] ? top[0].label : ''), v: top[0] ? cur(top[0].range) : '—', s: 'de rango con ±' + (top[0] ? top[0].step : '') + (top[0] && top[0].unit === 'x' ? 'x' : ' pp') },
        { k: 'Consenso de analistas', v: cur((ds.external || []).find(x => x.key === 'ciq_consensus')?.value ?? null), s: Rec && ds.recommendation?.experts ? ds.recommendation.experts : '' }
      ],
      cta: true
    });
  }
  return { slides, company: P.name, ticker: P.ticker || '', market: mkt, marketDate: mktDate, modified, logo: P.logo };
}
