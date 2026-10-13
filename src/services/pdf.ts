// Reporte PDF generado por código con jsPDF + jspdf-autotable (no es una captura de pantalla):
// texto seleccionable, tablas reales, gráficas PNG 2x dibujadas por las mismas funciones de la app.
// Elegimos jsPDF + autotable porque corre 100% en el navegador sin servidor ni CDN, pesa poco, permite
// controlar página, márgenes, encabezados y pies, y autotable parte las tablas largas entre páginas.
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { AUTHOR, FOOTER } from '../config';
import { LOGO_SVG } from '../assets/logos';
import { cellText, execSections, numberBlocks, type Block, type Report, type Section } from '../report/content';
import { svgSize, svgToPng } from './raster';

const ACC: [number, number, number] = [0, 57, 166], TXT: [number, number, number] = [29, 31, 32], MUT: [number, number, number] = [93, 93, 96];
const PAGE_W = 215.9, PAGE_H = 279.4, M = 15.5, CW = PAGE_W - 2 * M, TOP = 24, BOTTOM = PAGE_H - 17;

/** Helvetica estándar usa WinAnsi: se sustituyen los pocos símbolos que no tiene. */
export const pdfText = (s: string) => String(s)
  .replace(/−/g, '-').replace(/β/g, 'beta ').replace(/→/g, '->').replace(/Δ/g, 'Delta ').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/ₙ₊₁/g, 'n+1').replace(/ₙ/g, 'n').replace(/ₜ/g, 't').replace(/₁/g, '1').replace(/₂/g, '2')
  .replace(/ᵗ/g, '^t').replace(/ⁿ/g, '^n').replace(/✓/g, 'OK').replace(/⚠/g, '!').replace(/●/g, '*').replace(/■/g, '-').replace(/ /g, ' ').replace(/ /g, ' ');

export type PdfVariant = 'full' | 'exec';
export interface PdfResult { bytes: Uint8Array; pages: number; fileName?: string }

export async function buildPdf(R: Report, variant: PdfVariant, onProgress?: (p: number, msg: string) => void): Promise<PdfResult> {
  const doc = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait', compress: true });
  doc.setProperties({ title: pdfText(R.meta.title), author: AUTHOR.name + ' (' + AUTHOR.id + ')', subject: AUTHOR.activity, creator: 'ValuFlow' });
  // El PDF completo deja fuera lo que ya cuenta una gráfica o un anexo de la app (siguen en pantalla, Excel y ZIP).
  const SKIP = new Set(['balance', 'gRefs', 'moves', 'waccIter', 'evComp', 'inflPrice', 'chain', 'evEqScen']);
  const sections: Section[] = variant === 'exec' ? execSections(R) : R.sections.filter(s => s.id !== 'appA').map(s => ({ ...s, blocks: s.blocks.filter(b => !((b.kind === 'table' || b.kind === 'chart') && SKIP.has(b.id))) }));
  numberBlocks(sections);
  // Logos y gráficas a PNG 2x
  const logo = async (svg: string, hmm: number) => { const s = svgSize(svg); const p = await svgToPng(svg, s.w, s.h, Math.min(4, 600 / s.w * 2)); return { url: p.dataUrl, w: hmm * s.w / s.h, h: hmm }; };
  const L1 = await logo(LOGO_SVG.soriana, 7), L2 = await logo(LOGO_SVG.tec, 10);
  const charts = sections.flatMap(s => s.blocks.filter(b => b.kind === 'chart')) as Extract<Block, { kind: 'chart' }>[];
  const png: Record<string, { url: string; w: number; h: number }> = {};
  for (let i = 0; i < charts.length; i++) {
    const c = charts[i].chart; onProgress?.(0.1 + 0.6 * i / charts.length, 'Dibujando gráfica ' + (i + 1) + ' de ' + charts.length);
    const p = await svgToPng(c.svg.svg, c.svg.w, c.svg.h, 2); png[c.id] = { url: p.dataUrl, w: c.svg.w, h: c.svg.h };
  }
  onProgress?.(0.75, 'Armando páginas');
  let y = TOP;
  const font = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal', color = TXT) => { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor(...color); };
  const newPage = () => { doc.addPage(); y = TOP; };
  const ensure = (h: number) => { if (y + h > BOTTOM) newPage(); };
  const lines = (s: string, w = CW, size = 9.5) => { doc.setFontSize(size); return doc.splitTextToSize(pdfText(s), w) as string[]; };
  const para = (s: string, o: { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: [number, number, number]; x?: number; w?: number; gap?: number } = {}) => {
    const size = o.size ?? 9, lh = size * 0.42, ls = lines(s, o.w ?? CW, size);
    ls.forEach(l => { ensure(lh); font(size, o.style ?? 'normal', o.color ?? TXT); doc.text(l, o.x ?? M, y + lh * 0.8); y += lh; });
    y += o.gap ?? 2;
  };
  const box = (title: string, body: string, fill: [number, number, number], o: { titleColor?: [number, number, number] } = {}) => {
    const tl = title ? lines(title, CW - 8, 9.5) : [], bl = lines(body, CW - 8, 9), h = 4 + tl.length * 4.2 + bl.length * 3.9 + 2;
    ensure(h + 2); doc.setFillColor(...fill); doc.setDrawColor(...ACC); doc.setLineWidth(0.3); doc.rect(M, y, CW, h, 'FD');
    let yy = y + 4.5;
    tl.forEach(l => { font(9.5, 'bold', o.titleColor ?? ACC); doc.text(l, M + 4, yy); yy += 4.2; });
    bl.forEach(l => { font(9, 'normal'); doc.text(l, M + 4, yy); yy += 3.9; });
    y += h + 3;
  };
  const caption = (label: string, title: string) => { ensure(10); font(9, 'bold', ACC); const ls = lines(label + '. ' + title, CW, 9); ls.forEach(l => { doc.text(l, M, y + 3.5); y += 4; }); y += 0.5; };
  const sourceLine = (s: string, x = M, w = CW) => { font(8, 'italic', MUT); const ls = lines(s, w, 8); ls.forEach(l => { ensure(3.6); doc.text(l, x, y + 3); y += 3.4; }); y += 2; };

  const table = (t: Extract<Block, { kind: 'table' }>) => {
    caption('Tabla ' + t.n, t.title);
    const numeric = (c: unknown) => c != null && typeof c === 'object';
    const ncols = t.head.length;
    autoTable(doc, {
      startY: y, margin: { left: M, right: M, top: TOP, bottom: PAGE_H - BOTTOM + 2 }, theme: 'grid',
      head: [t.head.map(pdfText)], body: t.rows.map(r => r.map(c => pdfText(cellText(c)))),
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 0.85, textColor: TXT, lineColor: [210, 214, 222], lineWidth: 0.15, overflow: 'linebreak', valign: 'middle' },
      headStyles: { fillColor: ACC, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: [244, 247, 252] },
      columnStyles: { 0: { halign: 'left', cellWidth: ncols <= 2 ? CW * 0.55 : ncols >= 7 ? 46 : 'auto' } },
      didParseCell: (d) => {
        if (d.section !== 'body') return;
        const c = t.rows[d.row.index]?.[d.column.index];
        if (d.column.index > 0) d.cell.styles.halign = numeric(c) || /^[−\-+]?[\d,.]+(%|x| MXN| mdp)?$/.test(String(d.cell.raw)) ? 'right' : (ncols <= 3 ? 'left' : 'center');
        if (t.bold?.includes(d.row.index)) d.cell.styles.fontStyle = 'bold';
        if (/^(Cuadra|Cumple|Verde)$/.test(String(d.cell.raw))) d.cell.styles.textColor = [22, 121, 74];
        if (/^(Revisar|No cumple|Rojo)$/.test(String(d.cell.raw))) d.cell.styles.textColor = [180, 35, 24];
      }
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 1.5;
    if (t.note) { font(8.5, 'normal', TXT); lines(t.note, CW, 8.5).forEach(l => { ensure(3.8); doc.text(l, M, y + 3); y += 3.7; }); }
    sourceLine(t.source);
  };
  const chartPair = (cs: Extract<Block, { kind: 'chart' }>[]) => {
    const n = cs.length, gap = 5, w = n === 1 ? CW * (cs[0].chart.svg.w > 660 ? 0.78 : 0.56) : (CW - gap * (n - 1)) / n;
    const hs = cs.map(c => w * png[c.chart.id].h / png[c.chart.id].w), h = Math.max(...hs);
    const capH = Math.max(...cs.map(c => lines('Gráfica ' + c.n + '. ' + c.title, w, 9).length)) * 4 + 1;
    const srcH = Math.max(...cs.map(c => lines(c.source, w, 8).length)) * 3.4 + 2;
    ensure(capH + h + srcH);
    const y0 = y;
    cs.forEach((c, i) => {
      const x = n === 1 ? M + (CW - w) / 2 : M + i * (w + gap); y = y0;
      font(9, 'bold', ACC); lines('Gráfica ' + c.n + '. ' + c.title, w, 9).forEach(l => { doc.text(l, x, y + 3.5); y += 4; });
      y = y0 + capH; doc.addImage(png[c.chart.id].url, 'PNG', x, y, w, hs[i], c.chart.id, 'FAST');
      y = y0 + capH + h + 1; sourceLine(c.source, x, w);
    });
    y = y0 + capH + h + srcH + 1;
  };

  // ---------- Portada
  onProgress?.(0.8, 'Portada');
  const meta = R.meta, kf = Object.fromEntries(meta.keyFacts);
  font(9, 'normal', MUT); doc.text(pdfText(AUTHOR.context), M, y + 3); y += 10;
  font(12, 'bold', ACC); lines(meta.title, CW, 12).forEach(l => { doc.text(l, M, y + 4); y += 5.4; });
  font(10, 'normal', TXT); doc.text(pdfText(meta.subtitle), M, y + 4); y += 7;
  font(10, 'bold', TXT); doc.text(pdfText(meta.company + ', serie B (' + meta.ticker.replace(' ', '') + ')'), M, y + 4); y += 10;
  // Ficha de resultados
  const b = R.bundle.b, sc = R.bundle.scen.map(s => s.m?.price ?? NaN);
  const cards: [string, string][] = [
    ['Valor por acción (' + (R.bundle.isDefault ? 'Base' : 'escenario activo') + ')', b.value.toFixed(2) + ' MXN'], ['Precio de mercado (' + meta.priceDate + ')', b.price.toFixed(2) + ' MXN'],
    ['Rango de escenarios', Math.min(...sc).toFixed(2) + ' a ' + Math.max(...sc).toFixed(2) + ' MXN'], ['Recomendación', (b.signal ?? '') + ' (' + (b.upside! >= 0 ? '+' : '-') + Math.abs(b.upside! * 100).toFixed(1) + '%)']
  ];
  const cw = (CW - 9) / 4;
  cards.forEach(([k, v], i) => {
    const x = M + i * (cw + 3); doc.setFillColor(i === 0 ? ACC[0] : 238, i === 0 ? ACC[1] : 243, i === 0 ? ACC[2] : 252); doc.rect(x, y, cw, 20, 'F');
    font(8, 'normal', i === 0 ? [255, 255, 255] : MUT); lines(k, cw - 4, 8).slice(0, 2).forEach((l, j) => doc.text(l, x + 2.5, y + 5 + j * 3.4));
    font(12, 'bold', i === 0 ? [255, 255, 255] : ACC); doc.text(pdfText(v), x + 2.5, y + 16.5);
  });
  y += 27;
  autoTable(doc, {
    startY: y, margin: { left: M, right: M }, theme: 'plain', styles: { fontSize: 9.5, cellPadding: 1.3, textColor: TXT },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 48, textColor: ACC } },
    body: [['Autor', AUTHOR.name], ['Matrícula', AUTHOR.id], ['Programa', AUTHOR.program], ['Institución', AUTHOR.institution + ', ' + AUTHOR.campus], ['Materia', AUTHOR.course], ['Actividad', AUTHOR.activity],
      ['Profesor', AUTHOR.professor], ['Contexto', AUTHOR.context + '. Rol del autor: ' + AUTHOR.role + '.'], ['Fecha de generación', meta.generated], ['Fecha del precio de mercado', meta.priceDate],
      ['Escenario del reporte', R.bundle.isDefault ? 'Base (supuestos del Excel)' : (R.bundle.scen.find(s => s.active)?.label ?? 'Laboratorio') + ' (supuestos modificados)'],
      ['Tipo de reporte', variant === 'full' ? 'Reporte completo' : 'Resumen ejecutivo']].map(r => r.map(pdfText))
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  if (meta.changes.length) box('Supuestos modificados respecto al Excel', meta.changes.map(c => c[0] + ': ' + (c[1] ? c[1] + ' en el Excel -> ' : '') + c[2]).join('; ') + '. Valor por acción con los supuestos del Excel: ' + R.bundle.b0.value.toFixed(2) + ' MXN; con los supuestos actuales: ' + b.value.toFixed(2) + ' MXN.', [255, 246, 230], { titleColor: [161, 92, 7] });
  font(8.5, 'italic', MUT); lines('Todas las cifras provienen del motor ValuFlow con el dataset del Excel SORIANA_FINAL y se recalculan con los supuestos activos. Montos en millones de pesos (mdp) salvo indicación.', CW, 8.5).forEach(l => { doc.text(l, M, y + 3); y += 3.6; });
  y += 4;
  const tocY = y, tocPage = 1;

  // ---------- Contenido
  const secPages: [string, number][] = [];
  sections.forEach(s => {
    if (s.page || y > BOTTOM - 40) newPage(); else y += 2;
    secPages.push([s.title, doc.getNumberOfPages()]);
    ensure(14); font(12, 'bold', ACC); doc.text(pdfText(s.title), M, y + 5); doc.setDrawColor(...ACC); doc.setLineWidth(0.4); doc.line(M, y + 7, M + CW, y + 7); y += 11;
    const bl = s.blocks;
    for (let i = 0; i < bl.length; i++) {
      const k = bl[i];
      if (k.kind === 'table') table(k);
      else if (k.kind === 'chart') {
        // Apéndices: tres gráficas por fila; resumen ejecutivo: todas en pares; resto: pares salvo las anchas.
        const per = s.id.startsWith('app') ? 3 : 2, row = [k];
        while (row.length < per && bl[i + 1] && bl[i + 1].kind === 'chart' && (variant === 'exec' || per === 3 || (pairable(k) && pairable(bl[i + 1] as typeof k)))) row.push(bl[++i] as typeof k);
        chartPair(row);
      }
      else if (k.style === 'p') { if (k.title) para(k.title, { style: 'bold', gap: 0.5 }); para(k.body ?? ''); }
      else if (k.style === 'key') box(k.title ?? 'Resultado clave', k.body ?? '', [238, 243, 252]);
      else if (k.style === 'question') box('Pregunta de análisis: ' + (k.title ?? ''), k.body ?? '', [248, 248, 249]);
      else if (k.style === 'warn') box(k.title ?? '', k.body ?? '', [255, 246, 230]);
      else if (k.style === 'bullets') { if (k.title) para(k.title, { style: 'bold', gap: 0.5 }); (k.items || []).forEach(it => { const ls = lines(it, CW - 5, 9); ls.forEach((l, j) => { ensure(4); font(9); if (j === 0) doc.text('-', M + 1, y + 3.2); doc.text(l, M + 5, y + 3.2); y += 3.9; }); y += 0.8; }); y += 1.5; }
      else if (k.style === 'def') (k.pairs || []).forEach(([a, z]) => { para(a, { style: 'bold', size: 9, gap: 0.2, color: ACC }); para(z, { size: variant === 'exec' ? 8.5 : 9, gap: 1.2 }); });
    }
  });

  // Índice en la portada (con número de página real)
  doc.setPage(tocPage); y = tocY;
  font(11, 'bold', ACC); doc.text('Índice', M, y + 4); y += 7;
  const half = Math.ceil(secPages.length / 2), colW = (CW - 8) / 2;
  secPages.forEach(([t, pg], i) => {
    const x = M + (i < half ? 0 : colW + 8), yy = y + (i % half) * 4.3;
    if (yy > BOTTOM - 4) return;
    font(8.5, 'normal'); const tt = lines(t, colW - 10, 8.5)[0]; doc.text(tt, x, yy + 3); doc.text(String(pg), x + colW, yy + 3, { align: 'right' });
  });

  // Encabezado y pie en todas las páginas
  const total = doc.getNumberOfPages();
  for (let pg = 1; pg <= total; pg++) {
    doc.setPage(pg);
    doc.addImage(L1.url, 'PNG', M, 8, L1.w, L1.h, 'logoS', 'FAST');
    doc.addImage(L2.url, 'PNG', PAGE_W - M - L2.w, 6.5, L2.w, L2.h, 'logoT', 'FAST');
    font(8, 'normal', MUT); doc.text(pdfText('ValuFlow · Estudio individual de Soriana'), PAGE_W / 2, 12.5, { align: 'center' });
    doc.setDrawColor(200, 204, 212); doc.setLineWidth(0.2); doc.line(M, 19, PAGE_W - M, 19); doc.line(M, PAGE_H - 13, PAGE_W - M, PAGE_H - 13);
    font(8, 'normal', MUT); doc.text(pdfText(FOOTER), M, PAGE_H - 8.5);
    doc.text('Página ' + pg + ' de ' + total, PAGE_W - M, PAGE_H - 8.5, { align: 'right' });
  }
  onProgress?.(0.95, 'Guardando PDF');
  const bytes = new Uint8Array(doc.output('arraybuffer'));
  return { bytes, pages: total };
}

/** Las gráficas apaisadas de más de 600 px de ancho ocupan toda la línea. */
function pairable(c: Extract<Block, { kind: 'chart' }>) { return c.chart.svg.w <= 660 && !['football', 'bridge', 'chain'].includes(c.chart.id); }
