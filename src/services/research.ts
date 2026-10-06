// Identidad (logo, color de marca) e investigación cualitativa con fuentes abiertas.
// Nunca modifica datos financieros: solo perfil, historia y gobierno corporativo.
import type { Profile } from '../engine/types';

export interface LogoHit { url: string; source: string; page: string; label: string; description: string }

export async function findLogo(name: string): Promise<LogoHit | null> {
  try {
    const s = await (await fetch('https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' + encodeURIComponent(name) + '&language=en&type=item&limit=5&format=json&origin=*')).json();
    for (const it of (s.search || [])) {
      const c = await (await fetch('https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=' + it.id + '&property=P154&format=json&origin=*')).json();
      const cl = c.claims && c.claims.P154 && c.claims.P154[0];
      if (cl) {
        const file = cl.mainsnak.datavalue.value;
        return { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=480', source: 'Wikidata ' + it.id + ' · Wikimedia Commons', page: 'https://www.wikidata.org/wiki/' + it.id, label: it.label, description: it.description || '' };
      }
    }
  } catch { /* sin red o API no disponible */ }
  return null;
}

/** Color dominante (saturado) de un logo, para el monograma y acentos de la empresa. */
export function brandColor(url: string): Promise<string | null> {
  return new Promise(res => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas'), w = 64, h = Math.max(8, Math.round(64 * img.height / img.width)); c.width = w; c.height = h;
        const x = c.getContext('2d')!; x.drawImage(img, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data, bins: Record<string, number> = {};
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3]; if (a < 128) continue;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx - mn < 40 || mx < 40) continue;
          const k = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4); bins[k] = (bins[k] || 0) + 1;
        }
        const top = Object.entries(bins).sort((a, b) => b[1] - a[1])[0]; if (!top) return res(null);
        const [r, g, b] = top[0].split(',').map(v => +v * 16 + 8); res('#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''));
      } catch { res(null); }
    };
    img.onerror = () => res(null); img.src = url;
  });
}

export interface ResearchItem { id: string; section: string; field: string; value: string; date?: string; url?: string; source?: string; confidence?: string; status: 'pending' | 'applied' | 'discarded' }
export interface Research { via: string; date: string; items: ResearchItem[]; status?: 'loading' | 'done' | 'error' }

async function wikiSearch(q: string, lang: string): Promise<string[]> {
  const j = await (await fetch('https://' + lang + '.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(q) + '&srlimit=5&format=json&origin=*')).json();
  return (j.query.search || []).map((s: { title: string }) => s.title);
}
async function wikiPage(title: string, lang: string) {
  const j = await (await fetch('https://' + lang + '.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&explaintext=1&redirects=1&titles=' + encodeURIComponent(title) + '&format=json&origin=*')).json();
  const p = Object.values(j.query.pages)[0] as { title: string; fullurl: string; extract?: string };
  return { title: p.title, url: p.fullurl, text: (p.extract || '').slice(0, 9000) };
}

interface ClaudeHost { complete: (o: unknown) => Promise<string> }

export async function research(profile: Profile): Promise<Research> {
  const today = new Date().toISOString().slice(0, 10), name = profile.legalName || profile.name;
  // Dentro de un artefacto de Claude existe window.claude.complete: se usa IA + Wikipedia.
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  if (host && host.complete) {
    try {
      const txt = await host.complete({
        model: 'claude-haiku-4-5', max_tokens: 2500,
        system: 'Eres un analista que documenta información CUALITATIVA de empresas con fuentes verificables. Usa las herramientas para buscar y leer Wikipedia (es y en). Nunca reportes cifras financieras (ingresos, EBIT, deuda, efectivo, acciones, beta, WACC). Responde SOLO con JSON válido.',
        messages: [{ role: 'user', content: 'Investiga la empresa "' + name + '" (' + (profile.ticker || '') + ' ' + (profile.exchange || '') + '). Devuelve JSON: {"items":[{"section":"Perfil|Historia|Gobierno","field":"...","value":"...","date":"(para Historia: año)","url":"URL exacta de la página usada","confidence":"Alta|Media|Baja"}]} con 4-6 datos de Perfil (modelo de negocio, sede, fundación, industria, productos/segmentos), 4-8 eventos de Historia y 2-4 de Gobierno (CEO, presidente del consejo). Español, frases breves.' }],
        tools: [
          { name: 'wiki_search', description: 'Busca títulos en Wikipedia', input_schema: { type: 'object', properties: { query: { type: 'string' }, lang: { type: 'string', enum: ['es', 'en'] } }, required: ['query'] }, run: async (i: { query: string; lang?: string }) => JSON.stringify(await wikiSearch(i.query, i.lang || 'en')) },
          { name: 'wiki_page', description: 'Lee el texto y URL de una página de Wikipedia', input_schema: { type: 'object', properties: { title: { type: 'string' }, lang: { type: 'string', enum: ['es', 'en'] } }, required: ['title'] }, run: async (i: { title: string; lang?: string }) => JSON.stringify(await wikiPage(i.title, i.lang || 'en')) }
        ]
      });
      const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
      return { via: 'IA + Wikipedia', date: today, items: (j.items || []).map((x: Omit<ResearchItem, 'id' | 'status'>, i: number) => ({ id: 'r' + i, ...x, source: 'Wikipedia', status: 'pending' as const })) };
    } catch { /* cae a fuentes abiertas */ }
  }
  const items: ResearchItem[] = [];
  for (const lang of ['es', 'en']) {
    try {
      const t = (await wikiSearch(name, lang))[0]; if (!t) continue;
      const p = await wikiPage(t, lang);
      const first = p.text.split('\n').filter(Boolean)[0] || '';
      items.push({ id: 'w' + lang, section: 'Perfil', field: 'Descripción (' + lang + ')', value: first.slice(0, 420), url: p.url, source: 'Wikipedia', confidence: 'Media', status: 'pending' });
    } catch { /* sin red */ }
  }
  return { via: 'Fuentes abiertas (Wikipedia)', date: today, items };
}
