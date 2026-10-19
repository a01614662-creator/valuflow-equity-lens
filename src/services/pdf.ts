// Reportes PDF generados por código con jsPDF + jspdf-autotable (no son capturas ni impresiones del tablero):
// texto seleccionable, tablas reales numeradas, gráficas PNG 2x dibujadas por las mismas funciones SVG de la app.
// jsPDF corre en el navegador sin servidor ni CDN; autotable parte las tablas largas y repite el encabezado.
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { LOGO_SVG } from '../assets/logos';
import type { Block, RChart, RTable, Report, Section } from '../report/content';
import { svgSize, svgToPng } from './raster';

type RGB = [number, number, number];
const ACC: RGB = [65, 97, 128], ACC_DK: RGB = [29, 45, 61], TXT: RGB = [29, 31, 32], MUT: RGB = [93, 93, 96], LIGHT: RGB = [236, 242, 248], WARN: RGB = [161, 92, 7];
const PAGE_W = 215.9, PAGE_H = 279.4, M = 15.5, CW = PAGE_W - 2 * M, TOP = 24, BOTTOM = PAGE_H - 17;

/** Helvetica estándar usa WinAnsi: se sustituyen los pocos símbolos que no tiene. */
export const pdfText = (s: string) => String(s)
  .replace(/−/g, '-').replace(/–/g, '-').replace(/β/g, 'beta ').replace(/→/g, '->').replace(/Δ/g, 'Delta ').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/×/g, 'x').replace(/÷/g, '/')
  .replace(/Σ/g, 'Suma ').replace(/·/g, '·').replace(/✓/g, '').replace(/⚠/g, '!').replace(/[   ]/g, ' ').replace(/²/g, '2').replace(/[^\x00-\xff·•—’‘“”…€]/g, '');

export type PdfVariant = 'full' | 'exec';
export interface PdfResult { bytes: Uint8Array; pages: number }

const colsOf = (t: RTable) => t.pdfCols && t.pdfCols.length ? t.pdfCols.filter(i => i < t.head.length) : t.head.map((_, i) => i);

export async function buildPdf(R: Report, onProgress?: (p: number, msg: string) => void): Promise<PdfResult> {
  const variant: PdfVariant = R.kind, meta = R.meta, S = R.snap;
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait', compress: true });
  doc.setProperties({ title: pdfText(meta.title + ' · ' + meta.subtitle), author: pdfText(meta.team.map(t => t[0]).join(', ')), subject: pdfText(meta.course + ' · ' + meta.institution), creator: 'ValuFlow' });
  const sections: Section[] = R.sections;
  const logo = async (svg: string, hmm: number) => { const s = svgSize(svg); const p = await svgToPng(svg, s.w, s.h, Math.min(4, 600 / s.w * 2)); return { url: p.dataUrl, w: hmm * s.w / s.h, h: hmm }; };
  onProgress?.(0.04, 'Logos');
  const L1 = await logo(LOGO_SVG.soriana, 6.2), L2 = await logo(LOGO_SVG.tec, 10);
  const charts = sections.flatMap(s => s.blocks.filter((b): b is RChart => b.kind === 'chart'));
  const png: Record<string, { url: string; w: number; h: number }> = {};
  for (let i = 0; i < charts.length; i++) {
    const c = charts[i].chart; onProgress?.(0.08 + 0.6 * i / Math.max(1, charts.length), 'Dibujando gráfica ' + (i + 1) + ' de ' + charts.length);
    if (png[c.id]) continue;
    const p = await svgToPng(c.svg.svg, c.svg.w, c.svg.h, 2); png[c.id] = { url: p.dataUrl, w: c.svg.w, h: c.svg.h };
  }
  onProgress?.(0.72, 'Armando páginas');
  let y = TOP;
  const font = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal', color: RGB = TXT) => { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color); };
  const newPage = () => { doc.addPage(); y = TOP; };
  const ensure = (h: number) => { if (y + h > BOTTOM) newPage(); };
  const lines = (s: string, w = CW, size = 9.5) => { doc.setFontSize(size); return doc.splitTextToSize(pdfText(s), w) as string[]; };
  const exec = variant === 'exec', BODY = exec ? 8.6 : 9;
  const para = (s: string, o: { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: RGB; gap?: number } = {}) => {
    const size = o.size ?? BODY, lh = size * 0.42, ls = lines(s, CW, size);
    if (ls.length * lh < 60) ensure(ls.length * lh);
    ls.forEach(l => { ensure(lh); font(size, o.style ?? 'normal', o.color ?? TXT); doc.text(l, M, y + lh * 0.8); y += lh; });
    y += o.gap ?? 2;
  };
  const box = (title: string, body: string, fill: RGB, titleColor: RGB = ACC) => {
    const tl = title ? lines(title, CW - 8, 9.3) : [], bl = lines(body, CW - 8, BODY), h = 4 + tl.length * 4.1 + bl.length * BODY * 0.42 + 2;
    ensure(h + 2); doc.setFillColor(...fill); doc.setDrawColor(...titleColor); doc.setLineWidth(0.3); doc.rect(M, y, CW, h, 'FD');
    let yy = y + 4.5;
    tl.forEach(l => { font(9.3, 'bold', titleColor); doc.text(l, M + 4, yy); yy += 4.1; });
    bl.forEach(l => { font(BODY, 'normal'); doc.text(l, M + 4, yy); yy += BODY * 0.42; });
    y += h + 3;
  };
  const caption = (label: string, title: string) => { font(9, 'bold', ACC_DK); lines(label + '. ' + title, CW, 9).forEach(l => { doc.text(l, M, y + 3.5); y += 4; }); y += 0.5; };
  const sourceLine = (s: string, x = M, w = CW) => { font(7.6, 'italic', MUT); lines(s, w, 7.6).forEach(l => { ensure(3.4); doc.text(l, x, y + 3); y += 3.3; }); y += 2; };
  const fsOf = (n: number) => n <= 6 ? 8 : n <= 9 ? 7.2 : 6.3;
  const colW0 = (n: number) => n <= 2 ? CW * 0.5 : n >= 9 ? 34 : n >= 7 ? 40 : CW * 0.34;

  /** Alto estimado de una tabla (líneas reales de cada celda con anchos aproximados). */
  const tableH = (t: RTable) => {
    const cols = colsOf(t), n = cols.length, fs = fsOf(n), c0 = colW0(n), cw = (CW - c0) / Math.max(1, n - 1), rh = fs * 0.42 + 1.8;
    return 14 + lines(t.title, CW, 9).length * 4 + t.rows.reduce((h, r) => h + rh * Math.max(1, ...cols.map((j, k) => lines(r[j] ?? '', (k === 0 ? c0 : cw) - 2, fs).length)), 0) + (t.note ? lines(t.note, CW, 8).length * 3.5 + 1 : 0);
  };
  const chartW = (c: RChart, n: number) => n === 1 ? CW * (c.chart.wide ? (exec ? 0.62 : 0.92) : (exec ? 0.6 : 0.7)) : (CW - 5 * (n - 1)) / n;
  const chartH = (c: RChart, n: number) => chartW(c, n) * c.chart.svg.h / c.chart.svg.w + 16;
  const defH = (pairs: [string, string][]) => {
    if (!exec) return pairs.length ? Math.min(40, 5 + lines(pairs[0][1], CW, BODY).length * BODY * 0.42) : 0;
    const w = (CW - 6) / 2, hs = pairs.map(([, z]) => 4 + lines(z, w, 8.2).length * 8.2 * 0.42 + 1.8), tot = hs.reduce((a, h) => a + h, 0);
    let acc = 0, i = 0; while (i < hs.length && acc + hs[i] <= tot / 2 + 3) acc += hs[i++];
    return Math.max(acc, tot - acc) + 2;
  };
  /** Alto aproximado del primer bloque (para no dejar un título solo al pie de una página). */
  const firstH = (k: Block | undefined): number => !k ? 0 : k.kind === 'table' ? Math.min(tableH(k), 50) : k.kind === 'chart' ? chartH(k, 1) : k.style === 'def' ? defH(k.pairs || []) : k.style === 'p' ? Math.min(30, lines(k.body ?? '', CW, BODY).length * BODY * 0.42 + 4) : 20;

  const table = (t: RTable) => {
    // Una tabla que cabe en una página no se parte: si no cabe en lo que queda, empieza en la siguiente.
    // Las largas continúan en la página siguiente (encabezado repetido) solo si en cada página quedan al menos 5 filas.
    const cols = colsOf(t), n = cols.length, fs = fsOf(n), est = tableH(t), room = BOTTOM - y, rowH = fs * 0.42 + 1.8;
    const canSplit = t.rows.length >= 10 && room >= 22 + 5 * rowH && est - room >= 5 * rowH + 6;
    if (!canSplit) ensure(est < BOTTOM - TOP - 8 ? est : 22 + 5 * rowH);
    caption('Tabla ' + t.n, t.title);
    const hidden = t.pdfCols && t.pdfCols.length < t.head.length;
    autoTable(doc, {
      startY: y, margin: { left: M, right: M, top: TOP, bottom: PAGE_H - BOTTOM + 2 }, theme: 'grid',
      head: [cols.map(j => pdfText(t.head[j] ?? ''))], body: t.rows.map(r => cols.map(j => pdfText(r[j] ?? ''))),
      styles: { font: 'helvetica', fontSize: fs, cellPadding: 0.8, textColor: TXT, lineColor: [210, 214, 222], lineWidth: 0.15, overflow: 'linebreak', valign: 'middle' },
      headStyles: { fillColor: ACC, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: fs },
      alternateRowStyles: { fillColor: [245, 248, 251] }, rowPageBreak: 'avoid', showHead: 'everyPage',
      columnStyles: { 0: { halign: 'left', cellWidth: colW0(n) } },
      didParseCell: (d) => {
        if (d.section !== 'body') return;
        const raw = String(d.cell.raw ?? '');
        if (d.column.index > 0) d.cell.styles.halign = /^[-+−]?\$?[-−]?[\d,.]+(%|x| pp)?$|^\([\d,.]+\)$|^NA$|^—$/.test(raw) ? 'right' : 'left';
        if (t.bold?.includes(d.row.index)) d.cell.styles.fontStyle = 'bold';
        if (/^(Cuadra|Cumple|Sí|Incluida|COMPRAR)$/.test(raw)) d.cell.styles.textColor = [47, 107, 79];
        if (/^(Revisar|No cumple|Excluida|VENDER)$/.test(raw)) d.cell.styles.textColor = [180, 67, 58];
      }
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 1.5;
    if (t.note) { font(7.8, 'normal', TXT); lines(t.note, CW, 7.8).forEach(l => { ensure(3.5); doc.text(l, M, y + 3); y += 3.4; }); }
    sourceLine('Fuente: ' + t.source + (hidden ? ' Columnas completas en el libro de Excel y el CSV.' : ''));
  };
  const chartRow = (cs: RChart[]) => {
    const n = cs.length, gap = 5, w = chartW(cs[0], n);
    const hs = cs.map(c => w * png[c.chart.id].h / png[c.chart.id].w), h = Math.max(...hs);
    const capH = Math.max(...cs.map(c => lines('Gráfica ' + c.n + '. ' + c.title, w, 9).length)) * 4 + 1;
    const srcH = Math.max(...cs.map(c => lines(c.source, w, 7.6).length)) * 3.3 + 2;
    ensure(capH + h + srcH);
    const y0 = y;
    cs.forEach((c, i) => {
      const x = n === 1 ? M + (CW - w) / 2 : M + i * (w + gap); y = y0;
      font(9, 'bold', ACC_DK); lines('Gráfica ' + c.n + '. ' + c.title, w, 9).forEach(l => { doc.text(l, x, y + 3.5); y += 4; });
      y = y0 + capH; doc.addImage(png[c.chart.id].url, 'PNG', x, y, w, hs[i], c.chart.id, 'FAST');
      y = y0 + capH + h + 1; sourceLine(c.source, x, w);
    });
    y = y0 + capH + h + srcH + 1;
  };
  /** Preguntas y respuestas: título + texto juntos; en el resumen ejecutivo, a dos columnas. */
  const defBlock = (pairs: [string, string][]) => {
    if (!exec) { pairs.forEach(([a, z]) => { const h = 4 + lines(z, CW, BODY).length * BODY * 0.42 + 1.2; ensure(Math.min(h, 40)); para(a, { style: 'bold', size: 9, gap: 0.2, color: ACC_DK }); para(z, { gap: 1.4 }); }); return; }
    const gap = 6, w = (CW - gap) / 2, size = 8.2, lh = size * 0.42;
    const items = pairs.map(([a, z]) => { const ls = lines(z, w, size); return { a, ls, h: 4 + ls.length * lh + 1.8 }; });
    const total = items.reduce((t, it) => t + it.h, 0);
    let split = 0, acc = 0; while (split < items.length && acc + items[split].h <= total / 2 + 3) acc += items[split++].h;
    const cols = [items.slice(0, split), items.slice(split)], colH = cols.map(c => c.reduce((t, it) => t + it.h, 0));
    ensure(Math.max(...colH));
    const y0 = y;
    cols.forEach((c, ci) => {
      let yy = y0; const x = M + ci * (w + gap);
      c.forEach(it => { font(9, 'bold', ACC_DK); doc.text(pdfText(it.a), x, yy + 3.2); yy += 4; font(size, 'normal'); it.ls.forEach(l => { doc.text(l, x, yy + lh * 0.8); yy += lh; }); yy += 1.8; });
    });
    y = y0 + Math.max(...colH) + 2;
  };

  // ---------- Portada
  onProgress?.(0.78, 'Portada');
  font(8.5, 'normal', MUT); doc.text(pdfText(meta.institution + ' · ' + meta.course + ' · ' + meta.year + ' · Proyecto de equipo'), M, y + 3); y += 9;
  font(exec ? 15 : 17, 'bold', ACC_DK); lines(meta.title, CW, exec ? 15 : 17).forEach(l => { doc.text(l, M, y + 5); y += exec ? 6.4 : 7.2; });
  font(11, 'normal', ACC); doc.text(pdfText(meta.subtitle + ' · ' + meta.ticker), M, y + 4.5); y += 10;
  const cw4 = (CW - 9) / 4;
  meta.cards.forEach(([k, v], i) => {
    const x = M + i * (cw4 + 3); if (i === 0) doc.setFillColor(...ACC_DK); else doc.setFillColor(...LIGHT); doc.rect(x, y, cw4, 19, 'F');
    font(7.8, 'normal', i === 0 ? [214, 235, 255] : MUT); lines(k, cw4 - 4, 7.8).slice(0, 2).forEach((l, j) => doc.text(l, x + 2.5, y + 4.8 + j * 3.3));
    font(12.5, 'bold', i === 0 ? [255, 255, 255] : ACC_DK); doc.text(pdfText(v), x + 2.5, y + 15.8);
  });
  y += 24;
  const idRows: string[][] = [['Equipo', meta.team.map(t => t[0] + ' (' + t[1] + ')').join(exec ? ', ' : '\n')], ['Institución', meta.institution], ['Materia', meta.course + ' · ' + meta.year],
    ['Empresa', meta.company + ' (' + meta.ticker + ')'], ['Precio de mercado', 'Cierre ' + meta.priceDate + ' · valuación al ' + meta.valuationDate], ['Escenario del reporte', meta.caseLabel], ['Generado', meta.generated + ' · ValuFlow']];
  autoTable(doc, {
    startY: y, margin: { left: M, right: M }, theme: 'plain', styles: { fontSize: exec ? 8.3 : 9, cellPadding: exec ? 0.7 : 1.1, textColor: TXT },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, textColor: ACC } }, body: idRows.map(r => r.map(pdfText))
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
  if (meta.modified) box('Escenario modificado: no es el caso base del Excel', meta.changes.map(c => c[0] + ': ' + c[1] + ' -> ' + c[2]).join('; ') + '. DCF con supuestos del Excel: $' + S.b0.value.toFixed(2) + '; con supuestos activos: $' + S.b.value.toFixed(2) + '.', [255, 246, 230], WARN);
  font(7.8, 'italic', MUT); lines('Cifras del motor ValuFlow con el dataset generado desde el Excel PRO auditado y los supuestos activos. Montos en millones de pesos (mdp) salvo indicación; precios en MXN por acción.', CW, 7.8).forEach(l => { doc.text(l, M, y + 3); y += 3.4; });
  y += 3;
  const tocY = y;
  // En el reporte técnico, el índice ocupa el resto de la portada y el contenido empieza en la página 2.
  if (!exec) newPage();

  // ---------- Contenido
  const secPages: [string, number][] = [];
  sections.forEach((s, si) => {
    if (!exec && s.page && y > TOP + 1) newPage();
    else if (y > BOTTOM - 40) newPage();
    else if (si > 0 || exec) y += 2;
    // El título nunca queda solo al final de una página.
    ensure(12 + Math.max(18, firstH(s.blocks[0])));
    secPages.push([s.title, doc.getNumberOfPages()]);
    font(exec ? 11.5 : 12.5, 'bold', ACC_DK); doc.text(pdfText(s.title), M, y + 5); doc.setDrawColor(...ACC); doc.setLineWidth(0.4); doc.line(M, y + 7, M + CW, y + 7); y += 10.5;
    const bl = s.blocks;
    for (let i = 0; i < bl.length; i++) {
      const k = bl[i];
      if (k.kind === 'table') table(k);
      else if (k.kind === 'chart') {
        const row = [k];
        if (!k.chart.wide && bl[i + 1] && bl[i + 1].kind === 'chart' && !(bl[i + 1] as RChart).chart.wide) row.push(bl[++i] as RChart);
        chartRow(row);
      }
      else if (k.style === 'p') { if (k.title) para(k.title, { style: 'bold', gap: 0.5, color: ACC_DK }); para(k.body ?? ''); }
      else if (k.style === 'key') box(k.title ?? 'Resultado clave', k.body ?? '', LIGHT);
      else if (k.style === 'warn') box(k.title ?? '', k.body ?? '', [255, 246, 230], WARN);
      else if (k.style === 'bullets') { if (k.title) { ensure(6 + lines(k.items?.[0] ?? '', CW - 5, BODY).length * BODY * 0.42); para(k.title, { style: 'bold', gap: 0.5, color: ACC_DK }); } (k.items || []).forEach(it => { lines(it, CW - 5, BODY).forEach((l, j) => { ensure(4); font(BODY); if (j === 0) doc.text('-', M + 1, y + 3.2); doc.text(l, M + 5, y + 3.2); y += BODY * 0.42; }); y += 0.8; }); y += 1.5; }
      else if (k.style === 'def') defBlock(k.pairs || []);
    }
  });

  // Índice en la portada del reporte técnico (con número de página real)
  if (!exec) {
    doc.setPage(1); y = tocY;
    font(11, 'bold', ACC_DK); doc.text('Contenido', M, y + 4); y += 7;
    const half = Math.ceil(secPages.length / 2), colW = (CW - 8) / 2;
    secPages.forEach(([t, pg], i) => {
      const x = M + (i < half ? 0 : colW + 8), yy = y + (i % half) * 4.4;
      if (yy > BOTTOM - 4) return;
      font(8.6, 'normal'); doc.text(lines(t, colW - 10, 8.6)[0], x, yy + 3); doc.text(String(pg), x + colW, yy + 3, { align: 'right' });
    });
  }

  // Encabezado y pie en todas las páginas
  const total = doc.getNumberOfPages(), footer = pdfText('ValuFlow · ' + meta.team.map(t => t[0].split(' ')[0] + ' ' + t[0].split(' ').slice(-2, -1)[0]).join(', ') + ' · ' + meta.institution);
  for (let pg = 1; pg <= total; pg++) {
    doc.setPage(pg);
    doc.addImage(L1.url, 'PNG', M, 8.6, L1.w, L1.h, 'logoS', 'FAST');
    doc.addImage(L2.url, 'PNG', PAGE_W - M - L2.w, 6.5, L2.w, L2.h, 'logoT', 'FAST');
    font(8, 'normal', MUT); doc.text(pdfText('Valuación de ' + S.ds.profile.short + ' · ' + meta.subtitle + (meta.modified ? ' · escenario modificado' : '')), PAGE_W / 2, 12.5, { align: 'center' });
    doc.setDrawColor(200, 204, 212); doc.setLineWidth(0.2); doc.line(M, 19, PAGE_W - M, 19); doc.line(M, PAGE_H - 13, PAGE_W - M, PAGE_H - 13);
    font(7.4, 'normal', MUT); doc.text(lines(footer, CW - 30, 7.4)[0], M, PAGE_H - 8.5);
    doc.text('Página ' + pg + ' de ' + total, PAGE_W - M, PAGE_H - 8.5, { align: 'right' });
  }
  onProgress?.(0.96, 'Guardando PDF');
  return { bytes: new Uint8Array(doc.output('arraybuffer')), pages: total };
}
