// Ningún residuo del Excel anterior ni de otros integrantes en el código, las pruebas, la documentación o el HTML.
// Única excepción documentada: 33.48 aparece como precio de cierre real de Soriana de la semana del 20-sep-2026
// dentro de la serie semanal cruda del Excel SORIANA_FINAL (hoja Rendimientos); es un dato, no el precio de referencia.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'dist', 'dist-standalone', 'excel']);
const BANNED = ['Adrián', 'Saúl', 'Miguel', 'Mauricio', '33.48', '11.88', '31.16', 'Pesimista', 'Damodaran'];
const SELF = 'tests/residue.test.ts';

function files(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    if (SKIP.has(f)) continue;
    const p = join(dir, f), st = statSync(p);
    if (st.isDirectory()) files(p, out); else if (/\.(ts|tsx|js|cjs|mjs|json|md|html|css|py|txt|svg)$/.test(f)) out.push(p);
  }
  return out;
}

describe('Residuos del Excel anterior y de otros integrantes', () => {
  const hits: string[] = [];
  for (const f of files(ROOT)) {
    const rel = relative(ROOT, f); if (rel === SELF) continue;
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => BANNED.forEach(w => {
      if (!l.includes(w)) return;
      // Excepción: el precio semanal real del 20-sep-2026 en la serie cruda.
      if (w === '33.48' && rel === 'src/data/soriana.final.ts' && /^\s*33\.48,\s*$/.test(l) && lines[i - 1].includes('"2026-09-20"')) return;
      hits.push(rel + ':' + (i + 1) + ' → ' + w);
    }));
  }
  it('cero coincidencias', () => expect(hits).toEqual([]));
});
