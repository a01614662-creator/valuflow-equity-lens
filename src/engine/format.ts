// Formato numérico compartido por la interfaz, las exportaciones y la validación.
export const fin = (v: unknown): v is number => typeof v === 'number' && isFinite(v);

const cache = new Map<number, Intl.NumberFormat>();
const nf = (d: number) => {
  let f = cache.get(d);
  if (!f) { f = new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); cache.set(d, f); }
  return f;
};

export const fmt = {
  /** Montos: negativos entre paréntesis. */
  m: (v: unknown, d = 0) => fin(v) ? (v < 0 ? '(' + nf(d).format(-v) + ')' : nf(d).format(v)) : '—',
  n: (v: unknown, d = 0) => fin(v) ? nf(d).format(v) : '—',
  /** Porcentaje a partir de una fracción (0.1188 → 11.88%). */
  p: (v: unknown, d = 2) => fin(v) ? nf(d).format(v * 100) + '%' : '—',
  /** Variación con signo (+/−). */
  pp: (v: unknown, d = 1) => fin(v) ? (v >= 0 ? '+' : '−') + nf(d).format(Math.abs(v * 100)) + '%' : '—',
  x: (v: unknown, d = 2) => fin(v) ? nf(d).format(v) + 'x' : '—',
  cur: (v: unknown, d = 2) => fin(v) ? (v < 0 ? '−$' : '$') + nf(d).format(Math.abs(v)) : '—'
};
