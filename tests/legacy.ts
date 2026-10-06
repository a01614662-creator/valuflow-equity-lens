// Carga el motor y el dataset ORIGINALES del prototipo (project/*.js) en un contexto aislado,
// para comparar resultado por resultado contra el motor nuevo.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

export function loadLegacy(extra: Record<string, unknown> = {}) {
  const ctx: Record<string, unknown> = { ...extra, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, Intl, Math, JSON, Object, Array, Number, String, isFinite, Date };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['vf-data-soriana.js', 'vf-engine.js']) vm.runInContext(readFileSync(resolve(__dirname, '../project', f), 'utf8'), ctx, { filename: f });
  const w = ctx as any;
  return { VF: w.VF, dataset: w.VF_DATASETS.soriana };
}
