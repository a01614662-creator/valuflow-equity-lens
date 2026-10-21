// Cierre regional: orden del recorrido, registro de logos locales y muestra activa con logo (sin cambiar el modelo).
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { TOUR } from '../src/ui/App';
import BRANDS from '../src/data/brands.json';
import { soriana } from '../src/data/soriana';
import * as E from '../src/engine';

const reg = (BRANDS as { brands: Record<string, { file: string | null; download: string | null; source: string }> }).brands;
const tick = (n: string) => (/\(([^)]*)\)\s*$/.exec(n) || [])[1] || '';

describe('Recorrido regional', () => {
  it('orden 00 Acerca de · 01 ESG · 02 Valor · 03 Flujos · 04 Múltiplos · 05 Transacciones · 06 Costo de capital · 07 Conclusión', () => {
    expect(TOUR).toEqual(['cover', 'p0', 'p7', 'p1', 'p2', 'p4', 'p5', 'p3', 'p6']);
  });
  it('Laboratorio no es parte del recorrido numerado', () => { expect(TOUR).not.toContain('lab'); });
});

describe('Logos locales', () => {
  it('todo archivo registrado existe en public/assets/brands y es PNG', () => {
    for (const [id, e] of Object.entries(reg)) if (e.file) { expect(e.file, id).toMatch(/\.png$/); expect(existsSync('public/assets/brands/' + e.file), id).toBe(true); }
  });
  it('cada logo referenciado por el dataset está registrado', () => {
    const ids = [...(soriana.about!.threats.map(t => t.logo)), ...(soriana.about!.related.map(t => t.logo)), ...Object.values(soriana.peerLogos || {})].filter(Boolean) as string[];
    for (const id of ids) expect(reg[id], id).toBeDefined();
  });
  it('cada emisora de la muestra activa de Trading Comps tiene entrada de logo (la muestra no cambia)', () => {
    const b = E.run(soriana, E.defaults(soriana)) as E.RunOk;
    const C = E.relative(soriana, E.defaults(soriana), b.value).comps!;
    const active = C.spec.peers.filter((_, i) => C.include[i] === 1);
    expect(active.length).toBe(7);
    for (const p of active) expect(soriana.peerLogos![tick(p.name)], p.name).toBeDefined();
  });
  it('los factores sin empresa (digital) no llevan logo', () => {
    expect(soriana.about!.threats.find(t => /Digital/.test(t.name))!.logo).toBeUndefined();
  });
});
