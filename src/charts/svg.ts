// Gráficas como texto SVG puro (sin DOM ni librerías). Las mismas funciones dibujan la pantalla, el PDF (PNG 2x),
// el libro de Excel (imágenes PNG) y el paquete ZIP (SVG + PNG). Colores fijos de la paleta de la app.

export const PAL = {
  // Paleta de ValuFlow (sistema Industry): azul acero y grises.
  accent: '#416180', accent2: '#5980a6', accent3: '#94bce3', accentLight: '#d6ebff', text: '#1d1f20', muted: '#5d5d60', grid: '#d9d9dc',
  pos: '#2f6b4f', neg: '#b4433a', warn: '#a15c07', bg: '#ffffff', gray: '#9a9aa0', brand: '#d52b1e', lime: '#8a9100', ink: '#1d2d3d'
};
const FONT = 'Barlow, Arial, Helvetica, sans-serif';

const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n2 = (x: number) => (Math.round(x * 100) / 100).toString();
const txt = (x: number, y: number, s: string, o: { size?: number; anchor?: string; color?: string; weight?: number | string; rotate?: number; italic?: boolean } = {}) =>
  `<text x="${n2(x)}" y="${n2(y)}" font-family="${FONT}" font-size="${o.size ?? 11}" fill="${o.color ?? PAL.text}" text-anchor="${o.anchor ?? 'start'}"${o.weight ? ` font-weight="${o.weight}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.rotate ? ` transform="rotate(${o.rotate} ${n2(x)} ${n2(y)})"` : ''}>${esc(s)}</text>`;
const line = (x1: number, y1: number, x2: number, y2: number, c: string, w = 1, dash?: string) => `<line x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(x2)}" y2="${n2(y2)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const rect = (x: number, y: number, w: number, h: number, c: string, extra = '') => `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(Math.max(0, w))}" height="${n2(Math.max(0, h))}" fill="${c}"${extra}/>`;

export interface Svg { svg: string; w: number; h: number }
const wrap = (w: number, h: number, body: string): Svg => ({ w, h, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rect(0, 0, w, h, PAL.bg)}${body}</svg>` });

/** Marcas "bonitas" para un eje. */
export function ticks(lo: number, hi: number, n = 5): number[] {
  if (!(hi > lo)) { const d = Math.abs(lo) * 0.1 || 1; lo -= d; hi += d; }
  const raw = (hi - lo) / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  const out: number[] = []; for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}
const span = (vals: number[], pad = 0.06, zero = false) => {
  let lo = Math.min(...vals), hi = Math.max(...vals); if (zero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  const d = (hi - lo) || Math.abs(hi) || 1; return [zero && lo === 0 ? 0 : lo - d * pad, zero && hi === 0 ? 0 : hi + d * pad];
};

export interface XYSeries { name: string; color: string; points: [number, number][]; kind?: 'line' | 'scatter' | 'dash' | 'step'; width?: number; r?: number; labels?: (string | null)[]; axis?: 'y2' }
export interface XYOpts {
  w?: number; h?: number; series: XYSeries[]; xLabel?: string; yLabel?: string; y2Label?: string;
  xFmt?: (v: number) => string; yFmt?: (v: number) => string; y2Fmt?: (v: number) => string;
  xTicks?: number[]; xTickLabels?: string[]; yMin?: number; yMax?: number; xMin?: number; xMax?: number;
  notes?: string[]; hlines?: { y: number; label: string; color?: string }[]; legend?: boolean; zeroY?: boolean;
}

/** Gráfica XY: líneas, dispersión, rectas de ajuste y segundo eje opcional. */
export function xyChart(o: XYOpts): Svg {
  const w = o.w ?? 640, h = o.h ?? 340, hasY2 = o.series.some(s => s.axis === 'y2');
  const legendH = o.legend === false ? 0 : 22, notesH = (o.notes || []).length * 15;
  const L = 62, R = hasY2 ? 62 : 18, T = 14 + legendH + notesH, B = o.xLabel ? 46 : 32, W = w - L - R, H = h - T - B;
  const p1 = o.series.filter(s => s.axis !== 'y2').flatMap(s => s.points), p2 = o.series.filter(s => s.axis === 'y2').flatMap(s => s.points);
  const all = p1.concat(p2);
  let [x0, x1] = [o.xMin ?? Math.min(...all.map(p => p[0])), o.xMax ?? Math.max(...all.map(p => p[0]))];
  // Margen horizontal para que los puntos no queden sobre los ejes.
  if (o.xMin == null && o.xMax == null && o.series.some(se => se.kind === 'scatter' || se.labels)) { const d = (x1 - x0) * 0.03; x0 -= d; x1 += d; }
  let [y0, y1] = span(p1.map(p => p[1]).concat((o.hlines || []).map(l => l.y)), 0.08, !!o.zeroY);
  if (o.yMin != null) y0 = o.yMin; if (o.yMax != null) y1 = o.yMax;
  const yt = ticks(y0, y1, 5); y0 = Math.min(y0, yt[0]); y1 = Math.max(y1, yt[yt.length - 1]);
  const X = (v: number) => L + (x1 === x0 ? W / 2 : (v - x0) / (x1 - x0) * W), Y = (v: number) => T + H - (v - y0) / (y1 - y0) * H;
  let z0 = 0, z1 = 1, Y2 = (v: number) => v;
  if (hasY2) { [z0, z1] = span(p2.map(p => p[1]), 0.08); const zt = ticks(z0, z1, 5); z0 = Math.min(z0, zt[0]); z1 = Math.max(z1, zt[zt.length - 1]); Y2 = (v: number) => T + H - (v - z0) / (z1 - z0) * H; }
  const yf = o.yFmt ?? ((v: number) => String(v)), xf = o.xFmt ?? ((v: number) => String(v));
  let s = '';
  yt.forEach(v => { s += line(L, Y(v), L + W, Y(v), PAL.grid, 0.8) + txt(L - 6, Y(v) + 4, yf(v), { anchor: 'end', size: 10, color: PAL.muted }); });
  if (hasY2) ticks(z0, z1, 5).forEach(v => { s += txt(L + W + 6, Y2(v) + 4, (o.y2Fmt ?? String)(v), { size: 10, color: PAL.muted }); });
  const xt = o.xTicks ?? ticks(x0, x1, 6).filter(v => v >= x0 - 1e-9 && v <= x1 + 1e-9);
  xt.forEach((v, i) => { s += line(X(v), T + H, X(v), T + H + 4, PAL.muted) + txt(X(v), T + H + 16, o.xTickLabels ? o.xTickLabels[i] : xf(v), { anchor: 'middle', size: 10, color: PAL.muted }); });
  s += line(L, T + H, L + W, T + H, PAL.text, 1);
  if (y0 < 0 && y1 > 0) s += line(L, Y(0), L + W, Y(0), PAL.muted, 0.8);
  (o.hlines || []).forEach(l => { s += line(L, Y(l.y), L + W, Y(l.y), l.color ?? PAL.neg, 1.2, '5 4') + txt(L + W - 4, Y(l.y) - 5, l.label, { anchor: 'end', size: 10, color: l.color ?? PAL.neg, weight: 600 }); });
  o.series.forEach(se => {
    const YY = se.axis === 'y2' ? Y2 : Y, pts = se.points.filter(p => isFinite(p[0]) && isFinite(p[1]));
    if (se.kind === 'scatter') pts.forEach(p => { s += `<circle cx="${n2(X(p[0]))}" cy="${n2(YY(p[1]))}" r="${se.r ?? 2.6}" fill="${se.color}" fill-opacity="0.75"/>`; });
    else if (pts.length) s += `<polyline fill="none" stroke="${se.color}" stroke-width="${se.width ?? 2}"${se.kind === 'dash' ? ' stroke-dasharray="6 4"' : ''} points="${pts.map(p => n2(X(p[0])) + ',' + n2(YY(p[1]))).join(' ')}"/>`;
    if (se.labels) pts.forEach((p, i) => { const t = se.labels![i]; if (t) { const px = X(p[0]); s += `<circle cx="${n2(px)}" cy="${n2(YY(p[1]))}" r="3.2" fill="${se.color}"/>` + txt(px, YY(p[1]) - 8, t, { anchor: px > L + W * 0.9 ? 'end' : px < L + W * 0.08 ? 'start' : 'middle', size: 10, weight: 600, color: se.color }); } });
  });
  if (o.xLabel) s += txt(L + W / 2, h - 8, o.xLabel, { anchor: 'middle', size: 11, color: PAL.muted });
  if (o.yLabel) s += txt(14, T + H / 2, o.yLabel, { anchor: 'middle', size: 11, color: PAL.muted, rotate: -90 });
  if (o.y2Label) s += txt(w - 10, T + H / 2, o.y2Label, { anchor: 'middle', size: 11, color: PAL.muted, rotate: 90 });
  (o.notes || []).forEach((t, i) => { s += txt(L, 14 + legendH + 12 + i * 15, t, { size: 11, weight: 600, color: PAL.text }); });
  if (o.legend !== false) s += legend(o.series.map(x => [x.name, x.color, x.kind === 'scatter' ? 'dot' : x.kind === 'dash' ? 'dash' : 'line']), L, 14);
  return wrap(w, h, s);
}

function legend(items: [string, string, string][], x: number, y: number): string {
  let s = '', cx = x;
  items.filter(i => i[0]).forEach(([name, color, kind]) => {
    s += kind === 'dot' ? `<circle cx="${cx + 6}" cy="${y - 4}" r="4" fill="${color}"/>` : kind === 'box' ? rect(cx, y - 9, 12, 10, color) : line(cx, y - 4, cx + 14, y - 4, color, 2.4, kind === 'dash' ? '4 3' : undefined);
    s += txt(cx + 18, y, name, { size: 11, color: PAL.text }); cx += 26 + name.length * 5.6;
  });
  return s;
}

export interface BarOpts {
  w?: number; h?: number; cats: string[]; series: { name: string; color: string; values: (number | null)[] }[];
  yFmt?: (v: number) => string; valFmt?: (v: number) => string; hline?: { y: number; label: string; color?: string }; stacked?: boolean; yLabel?: string; subLabels?: string[]; zero?: boolean;
}

/** Barras verticales agrupadas o apiladas, con etiqueta de valor y línea de referencia opcional. */
export function barChart(o: BarOpts): Svg {
  const w = o.w ?? 640, h = o.h ?? 320, L = 64, R = 16, T = 36, B = o.subLabels ? 50 : 34, W = w - L - R, H = h - T - B;
  const tot = o.cats.map((_, i) => o.series.reduce((a, s) => a + (s.values[i] ?? 0), 0));
  const vals = o.stacked ? tot : o.series.flatMap(s => s.values.filter((v): v is number => v != null));
  let [y0, y1] = span(vals.concat(o.hline ? [o.hline.y] : []), 0.12, o.zero !== false);
  const yt = ticks(y0, y1, 5); y0 = Math.min(y0, yt[0]); y1 = Math.max(y1, yt[yt.length - 1]);
  const Y = (v: number) => T + H - (v - y0) / (y1 - y0) * H, yf = o.yFmt ?? String, vf = o.valFmt ?? yf;
  let s = '';
  yt.forEach(v => { s += line(L, Y(v), L + W, Y(v), PAL.grid, 0.8) + txt(L - 6, Y(v) + 4, yf(v), { anchor: 'end', size: 10, color: PAL.muted }); });
  const gw = W / o.cats.length, ns = o.stacked ? 1 : o.series.length, bw = Math.min(56, gw * 0.7 / ns);
  o.cats.forEach((c, i) => {
    const gx = L + gw * i + (gw - bw * ns) / 2; let acc = 0;
    o.series.forEach((se, k) => {
      const v = se.values[i]; if (v == null) return;
      const x = o.stacked ? gx : gx + k * bw, a = o.stacked ? acc : 0, z = a + v; acc = o.stacked ? z : 0;
      s += rect(x + 1, Y(Math.max(a, z)), bw - 2, Math.abs(Y(a) - Y(z)), se.color);
      const lbl = vf(v);
      if (o.stacked) { if (Math.abs(Y(a) - Y(z)) > 14) s += txt(x + bw / 2, (Y(a) + Y(z)) / 2 + 4, lbl, { anchor: 'middle', size: 10, color: '#fff', weight: 600 }); }
      else s += txt(x + bw / 2, v >= 0 ? Y(z) - 4 : Y(z) + 12, lbl, { anchor: 'middle', size: 10, weight: 600 });
    });
    if (o.stacked) s += txt(gx + bw / 2, Y(tot[i]) - 4, vf(tot[i]), { anchor: 'middle', size: 10, weight: 700 });
    s += txt(L + gw * i + gw / 2, T + H + 15, c, { anchor: 'middle', size: 10.5 });
    if (o.subLabels) s += txt(L + gw * i + gw / 2, T + H + 30, o.subLabels[i], { anchor: 'middle', size: 10.5, weight: 600, color: o.subLabels[i].startsWith('−') || o.subLabels[i].startsWith('-') ? PAL.neg : PAL.pos });
  });
  s += line(L, Y(Math.max(0, y0)), L + W, Y(Math.max(0, y0)), PAL.text, 1);
  // La etiqueta de la línea de referencia va como leyenda arriba a la derecha para no tapar las etiquetas de las barras.
  if (o.hline) s += line(L, Y(o.hline.y), L + W, Y(o.hline.y), o.hline.color ?? PAL.neg, 1.4, '5 4') + line(L + W - 14 - o.hline.label.length * 5.6, 12, L + W - 2 - o.hline.label.length * 5.6, 12, o.hline.color ?? PAL.neg, 1.6, '4 3') + txt(L + W, 16, o.hline.label, { anchor: 'end', size: 10.5, weight: 600, color: o.hline.color ?? PAL.neg });
  if (o.yLabel) s += txt(14, T + H / 2, o.yLabel, { anchor: 'middle', size: 11, color: PAL.muted, rotate: -90 });
  if (o.series.length > 1 || o.series[0].name) s += legend(o.series.map(x => [x.name, x.color, 'box']), L, 16);
  return wrap(w, h, s);
}

/** Barras horizontales (referencias, valores por categoría). */
export function hbarChart(o: { w?: number; rows: { label: string; value: number; color?: string }[]; fmt: (v: number) => string; min?: number }): Svg {
  const w = o.w ?? 640, rowH = 26, L = 230, R = 70, T = 12, h = T + o.rows.length * rowH + 30, W = w - L - R;
  const vals = o.rows.map(r => r.value); let [x0, x1] = span(vals, 0.05, true); if (o.min != null) x0 = o.min;
  const xt = ticks(x0, x1, 5); x0 = Math.min(x0, xt[0]); x1 = Math.max(x1, xt[xt.length - 1]);
  const X = (v: number) => L + (v - x0) / (x1 - x0) * W;
  let s = '';
  xt.forEach(v => { s += line(X(v), T, X(v), T + o.rows.length * rowH, PAL.grid, 0.8) + txt(X(v), T + o.rows.length * rowH + 16, o.fmt(v), { anchor: 'middle', size: 10, color: PAL.muted }); });
  o.rows.forEach((r, i) => {
    const y = T + i * rowH;
    s += txt(L - 8, y + rowH / 2 + 4, r.label, { anchor: 'end', size: 11 }) + rect(Math.min(X(0), X(r.value)), y + 5, Math.abs(X(r.value) - X(0)), rowH - 10, r.color ?? PAL.accent) + txt(Math.max(X(0), X(r.value)) + 6, y + rowH / 2 + 4, o.fmt(r.value), { size: 11, weight: 600 });
  });
  return wrap(w, h, s);
}

/** Tornado: rango de valor por variable alrededor del valor central. */
export function tornadoChart(o: { w?: number; center: number; rows: { label: string; low: number; high: number }[]; fmt: (v: number) => string; centerLabel: string }): Svg {
  const w = o.w ?? 640, rowH = 34, L = 190, R = 60, T = 30, h = T + o.rows.length * rowH + 34, W = w - L - R;
  const vals = o.rows.flatMap(r => [r.low, r.high]).concat([o.center]);
  let [x0, x1] = span(vals, 0.1); const xt = ticks(x0, x1, 6); x0 = Math.min(x0, xt[0]); x1 = Math.max(x1, xt[xt.length - 1]);
  const X = (v: number) => L + (v - x0) / (x1 - x0) * W;
  let s = '';
  xt.forEach(v => { s += line(X(v), T, X(v), T + o.rows.length * rowH, PAL.grid, 0.8) + txt(X(v), T + o.rows.length * rowH + 16, o.fmt(v), { anchor: 'middle', size: 10, color: PAL.muted }); });
  o.rows.forEach((r, i) => {
    const y = T + i * rowH, lo = Math.min(r.low, r.high), hi = Math.max(r.low, r.high);
    s += txt(L - 8, y + rowH / 2 + 4, r.label, { anchor: 'end', size: 11 });
    s += rect(X(lo), y + 7, X(o.center) - X(lo), rowH - 14, PAL.neg, ' fill-opacity="0.75"') + rect(X(o.center), y + 7, X(hi) - X(o.center), rowH - 14, PAL.accent);
    s += txt(X(lo) - 4, y + rowH / 2 + 4, o.fmt(lo), { anchor: 'end', size: 10.5, weight: 600 }) + txt(X(hi) + 4, y + rowH / 2 + 4, o.fmt(hi), { size: 10.5, weight: 600 });
  });
  s += line(X(o.center), T - 6, X(o.center), T + o.rows.length * rowH, PAL.text, 1.4) + txt(X(o.center), T - 10, o.centerLabel, { anchor: 'middle', size: 11, weight: 700 });
  return wrap(w, h, s);
}

/** Cascada (puente): pasos con signo y totales. */
export function waterfallChart(o: { w?: number; h?: number; steps: { label: string; value?: number; total?: number }[]; fmt: (v: number) => string; note?: string }): Svg {
  const w = o.w ?? 720, h = o.h ?? 340, L = 64, R = 12, T = o.note ? 34 : 18, B = 54, W = w - L - R, H = h - T - B;
  let cum = 0; const st = o.steps.map(x => { if (x.total != null) { cum = x.total; return { ...x, a: 0, z: x.total, tot: true }; } const a = cum; cum += x.value as number; return { ...x, a, z: cum, tot: false }; });
  let [y0, y1] = span(st.flatMap(x => [x.a, x.z]), 0.1, true); const yt = ticks(y0, y1, 5); y0 = Math.min(y0, yt[0]); y1 = Math.max(y1, yt[yt.length - 1]);
  const Y = (v: number) => T + H - (v - y0) / (y1 - y0) * H, gw = W / st.length, bw = gw * 0.62;
  let s = '';
  yt.forEach(v => { s += line(L, Y(v), L + W, Y(v), PAL.grid, 0.8) + txt(L - 6, Y(v) + 4, o.fmt(v), { anchor: 'end', size: 10, color: PAL.muted }); });
  st.forEach((x, i) => {
    const bx = L + gw * i + (gw - bw) / 2, neg = !x.tot && (x.value as number) < 0;
    s += rect(bx, Y(Math.max(x.a, x.z)), bw, Math.abs(Y(x.a) - Y(x.z)), x.tot ? PAL.accent : neg ? PAL.neg : PAL.accent3);
    if (i < st.length - 1) s += line(bx + bw, Y(x.z), bx + gw, Y(x.z), PAL.muted, 0.8, '3 2');
    s += txt(bx + bw / 2, Y(Math.max(x.a, x.z)) - 4, (x.tot ? '' : neg ? '−' : '+') + o.fmt(Math.abs(x.tot ? x.z : x.value as number)), { anchor: 'middle', size: 10, weight: 600 });
    const words = x.label.split(' '), lines: string[] = []; let cur = '';
    words.forEach(wd => { if ((cur + ' ' + wd).trim().length > 13) { lines.push(cur.trim()); cur = wd; } else cur += ' ' + wd; }); lines.push(cur.trim());
    lines.slice(0, 3).forEach((t, k) => { s += txt(L + gw * i + gw / 2, T + H + 14 + k * 12, t, { anchor: 'middle', size: 9.5 }); });
  });
  s += line(L, Y(0), L + W, Y(0), PAL.text, 1);
  if (o.note) s += txt(L, 18, o.note, { size: 11, weight: 600 });
  return wrap(w, h, s);
}

/** Campo de fútbol: rango por método, valor central y precio de mercado. */
export function footballChart(o: { w?: number; rows: { label: string; lo: number | null; hi: number | null; value: number | null; main?: boolean; ref?: boolean }[]; marks: { x: number; label: string; color: string }[]; fmt: (v: number) => string }): Svg {
  const w = o.w ?? 680, rowH = 40, L = 200, R = 40, T = 40, h = T + o.rows.length * rowH + 40, W = w - L - R;
  const vals = o.rows.flatMap(r => [r.lo, r.hi, r.value]).filter((v): v is number => v != null).concat(o.marks.map(m => m.x));
  let [x0, x1] = span(vals, 0.08); const xt = ticks(x0, x1, 6); x0 = Math.min(x0, xt[0]); x1 = Math.max(x1, xt[xt.length - 1]);
  const X = (v: number) => L + (v - x0) / (x1 - x0) * W;
  let s = '';
  xt.forEach(v => { s += line(X(v), T, X(v), T + o.rows.length * rowH, PAL.grid, 0.8) + txt(X(v), T + o.rows.length * rowH + 16, o.fmt(v), { anchor: 'middle', size: 10, color: PAL.muted }); });
  o.rows.forEach((r, i) => {
    const y = T + i * rowH;
    s += txt(L - 8, y + rowH / 2 + 4, r.label, { anchor: 'end', size: 11, weight: r.main ? 700 : 400 });
    if (r.lo != null && r.hi != null) { s += rect(X(r.lo), y + 10, X(r.hi) - X(r.lo), rowH - 20, r.ref ? PAL.gray : r.main ? PAL.accent : PAL.accent3) + txt(X(r.lo) - 4, y + rowH / 2 + 4, o.fmt(r.lo), { anchor: 'end', size: 10 }) + txt(X(r.hi) + 4, y + rowH / 2 + 4, o.fmt(r.hi), { size: 10 }); }
    if (r.value != null) s += `<circle cx="${n2(X(r.value))}" cy="${n2(y + rowH / 2)}" r="5" fill="${PAL.text}"/>` + (r.lo == null ? txt(X(r.value) + 9, y + rowH / 2 + 4, o.fmt(r.value), { size: 10.5, weight: 600 }) : '');
  });
  o.marks.forEach((m, k) => { s += line(X(m.x), T - 4, X(m.x), T + o.rows.length * rowH, m.color, 1.4, '5 4') + txt(X(m.x), 14 + k * 13, m.label, { anchor: 'middle', size: 10.5, weight: 600, color: m.color }); });
  return wrap(w, h, s);
}

/** Barra de composición (dos partes que suman 100%). */
export function compositionChart(o: { w?: number; parts: { label: string; value: number; color: string }[]; fmt: (v: number) => string; title: string }): Svg {
  const w = o.w ?? 640, h = 150, L = 20, W = w - 40, tot = o.parts.reduce((a, p) => a + p.value, 0);
  let s = txt(L, 22, o.title, { size: 12, weight: 700 }), x = L;
  o.parts.forEach(p => {
    const pw = p.value / tot * W;
    s += rect(x, 36, pw, 42, p.color) + txt(x + pw / 2, 62, (p.value / tot * 100).toFixed(1) + '%', { anchor: 'middle', size: 13, weight: 700, color: '#fff' });
    s += txt(x + 2, 98, p.label, { size: 11 }) + txt(x + 2, 114, o.fmt(p.value), { size: 11, weight: 600 }); x += pw;
  });
  return wrap(w, h, s);
}

/** Cadena lógica del estudio (cajas con flechas). */
export function chainChart(o: { w?: number; steps: [string, string][] }): Svg {
  const w = o.w ?? 720, n = o.steps.length, h = 110, gap = 16, bw = (w - 20 - gap * (n - 1)) / n;
  let s = '';
  o.steps.forEach(([a, b], i) => {
    const x = 10 + i * (bw + gap);
    s += rect(x, 30, bw, 50, i === n - 2 ? PAL.accent : '#eef3fc', ` stroke="${PAL.accent}" stroke-width="1"`) + txt(x + bw / 2, 52, a, { anchor: 'middle', size: 11, weight: 700, color: i === n - 2 ? '#fff' : PAL.text }) + txt(x + bw / 2, 68, b, { anchor: 'middle', size: 9.5, color: i === n - 2 ? '#fff' : PAL.muted });
    if (i < n - 1) s += txt(x + bw + gap / 2, 60, '→', { anchor: 'middle', size: 14, weight: 700, color: PAL.accent });
  });
  return wrap(w, h, s);
}
