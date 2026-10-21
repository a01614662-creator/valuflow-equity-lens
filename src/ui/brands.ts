// Resolución de logos locales (public/assets/brands) a partir del registro src/data/brands.json.
import BRANDS from '../data/brands.json';

/** Logo local registrado en src/data/brands.json (null si la marca no está registrada). */
export function brandOf(id: string | undefined, name?: string): { src: string | null; alt: string; name: string } | null {
  const reg = (BRANDS as { brands: Record<string, { entity: string; file: string | null }> }).brands;
  const e = id ? reg[id] : undefined; if (!e) return null;
  const nm = name || e.entity;
  return { src: e.file ? 'assets/brands/' + e.file : null, alt: 'Logo de ' + e.entity, name: nm };
}

