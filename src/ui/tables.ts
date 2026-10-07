// Kit de tablas (formato común de anexos y páginas de detalle). Produce objetos que dibuja components/TableCard.tsx.

export interface TCell { t: unknown; align: string; ws: string; mw: string; bg: string; color: string; onClick?: () => void; title?: string; strong?: boolean }
export interface TRow { label: string; cells: TCell[]; fw: number; lc: string; fs: string; ls: string; tt: string; tip?: string }
export interface THead { t: string; bg: string; align: string; tip?: string }
export interface TTable { id: string; code: string; title: string; question: string; source: string; unit: string; head: THead[]; rows: TRow[]; minW: string; note: string; hasNote: boolean; warn?: string }

export const cell = (t: unknown, o?: Partial<TCell>): TCell => ({ t: t == null ? '—' : t, align: 'right', ws: 'nowrap', mw: 'auto', bg: 'transparent', color: 'var(--color-text)', ...(o || {}) });
export const txt = (t: unknown, mw?: string, o?: Partial<TCell>) => cell(t, { align: 'left', ws: 'normal', mw: mw || '140px', ...(o || {}) });
export const row = (label: string, cells: TCell[], o?: Partial<TRow>): TRow => ({ label, cells, fw: 400, lc: 'var(--color-text)', fs: '13px', ls: 'normal', tt: 'none', ...(o || {}) });
export const sec = (label: string, n: number) => row(label, Array(n).fill(cell('')), { fw: 600, lc: 'var(--color-accent-700)', fs: '11px', ls: '.1em', tt: 'uppercase' });
export const head = (cols: string[], estFrom?: number | null, alignLeftUntil?: number | null): THead[] =>
  cols.map((t, i) => ({ t, bg: estFrom != null && i >= estFrom ? 'var(--color-accent-100)' : 'var(--color-bg)', align: alignLeftUntil != null && i < alignLeftUntil ? 'left' : 'right' }));
export const estBg = (i: number, from?: number | null) => from != null && i >= from ? { bg: 'color-mix(in srgb, var(--color-accent-100) 55%, transparent)' } : {};
export const table = (id: string, code: string, title: string, question: string, source: string, unit: string, cols: THead[], rows: TRow[], o?: { minW?: string; note?: string; warn?: string }): TTable =>
  ({ id, code, title, question, source, unit, head: cols, rows, minW: (o && o.minW) || '720px', note: (o && o.note) || '', hasNote: !!(o && o.note), warn: o && o.warn });
/** Celda-botón para alternar un indicador 1/0 (incluir, usar). */
export const toggle = (on: number, onClick: () => void, title: string) =>
  cell(on === 1 ? '✓ Sí' : '— No', { onClick, title, color: on === 1 ? 'var(--color-accent-800)' : 'var(--color-neutral-700)', bg: on === 1 ? 'var(--color-accent-100)' : 'transparent', strong: true });
