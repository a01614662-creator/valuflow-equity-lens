// Utilidades de estilo. El diseño de Claude Design escribe estilos en línea como texto CSS;
// css() los convierte a objetos de React (con caché) para conservar el diseño exactamente.
import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();

/** Divide por ';' respetando paréntesis (p. ej. linear-gradient(a, b) o url(...)). */
function decls(s: string): string[] {
  const out: string[] = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(d => d.trim()).filter(Boolean);
}

const camel = (p: string) => p.startsWith('--') ? p : p.replace(/^-(webkit|moz|ms)-/, (_, v: string) => v.charAt(0).toUpperCase() + v.slice(1) + '-').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export function css(s: string): CSSProperties {
  let o = cache.get(s);
  if (o) return o;
  o = {};
  for (const d of decls(s)) {
    const i = d.indexOf(':'); if (i < 0) continue;
    (o as Record<string, string>)[camel(d.slice(0, i).trim())] = d.slice(i + 1).trim();
  }
  if (cache.size > 5000) cache.clear();
  cache.set(s, o);
  return o;
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// Estados :hover. Igual que el runtime del diseño: una clase por regla, con !important
// para ganar sobre los estilos en línea.
const hoverCache = new Map<string, string>();
let sheet: CSSStyleSheet | null = null;

export function hv(rule: string): string {
  let name = hoverCache.get(rule);
  if (name) return name;
  name = 'vfh' + hoverCache.size.toString(36);
  hoverCache.set(rule, name);
  if (typeof document !== 'undefined') {
    if (!sheet) { const el = document.createElement('style'); el.setAttribute('data-vf-hover', ''); document.head.appendChild(el); sheet = el.sheet; }
    const body = decls(rule).map(d => /!\s*important$/i.test(d) ? d : d + ' !important').join(';');
    sheet?.insertRule('.' + name + ':hover{' + body + '}', sheet.cssRules.length);
  }
  return name;
}
