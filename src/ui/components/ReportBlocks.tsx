// Dibuja bloques del reporte (tablas, gráficas y textos) en pantalla, con descarga de CSV, PNG (2x) y SVG.
// Es el mismo contenido que sale en el PDF y en el Excel.
import { Fragment } from 'react';
import { css } from '../css';
import { cellText, type Block, type RChart, type RTable, type RText } from '../../report/content';

export interface BlockActions { csv: (t: RTable) => void; png: (c: RChart) => void; svg: (c: RChart) => void }

const Corners = () => (<><i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i></>);
const isNum = (c: unknown) => c != null && typeof c === 'object';

export interface NoteField { key: string; value: string; onChange: (e: { target: { value: string } }) => void }

export function TableBlock({ t, act, extra }: { t: RTable; act: BlockActions; extra?: (row: number) => NoteField | null }) {
  return (
    <div className="blueprint" data-table={t.id} style={css('padding:22px; display:flex; flex-direction:column; gap:10px; min-width:0;')}>
      <Corners />
      <div style={css('display:flex; justify-content:space-between; gap:10px; align-items:flex-end; flex-wrap:wrap;')}>
        <h3 style={css('margin:0; font-size:22px;')}>{t.n ? 'Tabla ' + t.n + '. ' : ''}{t.title}</h3>
        <button className="btn btn-ghost" onClick={() => act.csv(t)} style={css('font-size:12px; padding:4px 8px;')} title="Descargar la tabla en CSV (UTF-8)">CSV ↓</button></div>
      <div style={css('overflow:auto; border-top:1px solid var(--color-text);')}>
        <table className="table" style={css('font-size:13px; min-width:' + Math.min(1100, 160 + t.head.length * 110) + 'px;')}>
          <thead><tr>{t.head.map((h, i) => <th key={i} style={css(`position:sticky; top:0; background:var(--color-bg); text-align:${i ? 'right' : 'left'}; z-index:1;`)}>{h}</th>)}{extra ? <th style={css('position:sticky; top:0; background:var(--color-bg);')}>Notas</th> : null}</tr></thead>
          <tbody>{t.rows.map((r, i) => (
            <tr key={i} style={css(t.bold?.includes(i) ? 'font-weight:700;' : '')}>
              {r.map((c, j) => { const s = cellText(c); const col = /^(Cuadra|Cumple|Verde|COMPRAR)$/.test(s) ? 'var(--pos)' : /^(Revisar|No cumple|Rojo|VENDER)$/.test(s) ? 'var(--neg)' : 'inherit'; return <td key={j} style={css(`text-align:${j && (isNum(c) || /^[−\-+]?[\d,.]+(%|x)?$/.test(s)) ? 'right' : 'left'}; white-space:${s.length > 40 ? 'normal' : 'nowrap'}; color:${col};${s.length > 40 ? ' min-width:260px;' : ''}`)}>{s}</td>; })}
              {extra ? <td>{(() => { const n = extra(i); return n ? <input key={n.key} defaultValue={n.value} onChange={n.onChange} placeholder="Nota" aria-label="Nota" style={css('width:220px; font:inherit; font-size:12px; padding:3px 6px; border:1px solid var(--color-divider); background:transparent; color:inherit;')} /> : null; })()}</td> : null}
            </tr>))}</tbody></table></div>
      {t.note ? <span style={css('font-size:12px; line-height:1.5;')}>{t.note}</span> : null}
      <span style={css('font-size:12px; color:var(--color-neutral-700); font-style:italic;')}>{t.source}</span></div>
  );
}

export function ChartBlock({ c, act }: { c: RChart; act: BlockActions }) {
  return (
    <div className="blueprint" data-chart={c.id} style={css('padding:22px; display:flex; flex-direction:column; gap:10px; min-width:0;')}>
      <Corners />
      <div style={css('display:flex; justify-content:space-between; gap:10px; align-items:flex-end; flex-wrap:wrap;')}>
        <h3 style={css('margin:0; font-size:20px;')}>{c.n ? 'Gráfica ' + c.n + '. ' : ''}{c.title}</h3>
        <span style={css('display:flex; gap:4px;')}>
          <button className="btn btn-ghost" onClick={() => act.png(c)} style={css('font-size:12px; padding:4px 8px;')} title="Descargar PNG a 2x">PNG ↓</button>
          <button className="btn btn-ghost" onClick={() => act.svg(c)} style={css('font-size:12px; padding:4px 8px;')} title="Descargar SVG (vectorial)">SVG ↓</button></span></div>
      <div className="vf-chart" role="img" aria-label={c.title} dangerouslySetInnerHTML={{ __html: c.chart.svg.svg }} />
      <span style={css('font-size:12px; color:var(--color-neutral-700); font-style:italic;')}>{c.source}</span></div>
  );
}

export function TextBlock({ k }: { k: RText }) {
  if (k.style === 'p') return <div style={css('display:flex; flex-direction:column; gap:4px; max-width:900px;')}>{k.title ? <strong>{k.title}</strong> : null}<p style={css('margin:0; font-size:15px; line-height:1.6;')}>{k.body}</p></div>;
  if (k.style === 'bullets') return <div style={css('display:flex; flex-direction:column; gap:6px; max-width:980px;')}>{k.title ? <strong>{k.title}</strong> : null}<ul style={css('margin:0; padding-left:20px; display:flex; flex-direction:column; gap:6px; font-size:14px; line-height:1.55;')}>{(k.items || []).map((x, i) => <li key={i}>{x}</li>)}</ul></div>;
  if (k.style === 'def') return <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px;')}>{(k.pairs || []).map(([a, z], i) => <div key={i} style={css('padding:14px 16px; border-left:3px solid var(--color-accent); background:var(--color-accent-100);')}><strong style={css('display:block; margin-bottom:4px; font-family:var(--font-heading); font-size:18px;')}>{a}</strong><span style={css('font-size:14px; line-height:1.55;')}>{z}</span></div>)}</div>;
  const q = k.style === 'question';
  return (
    <div style={css(`padding:16px 18px; border:1px solid ${q ? 'var(--color-divider)' : 'var(--color-accent)'}; background:${q ? 'transparent' : 'var(--color-accent-100)'}; display:flex; flex-direction:column; gap:6px; max-width:980px;`)}>
      <span style={css('font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{q ? 'Pregunta de análisis' : (k.title || 'Resultado clave')}</span>
      {q ? <strong style={css('font-size:16px;')}>{k.title}</strong> : null}
      <span style={css('font-size:14px; line-height:1.6;')}>{k.body}</span></div>
  );
}

/** Bloques en una cuadrícula: las gráficas consecutivas se acomodan lado a lado. */
export function ReportBlocks({ blocks, act, notes }: { blocks: Block[]; act: BlockActions; notes?: { id: string; render: (row: number) => NoteField | null } }) {
  const out: JSX.Element[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const k = blocks[i];
    if (k.kind === 'chart') {
      const group: RChart[] = [k];
      while (blocks[i + 1] && blocks[i + 1].kind === 'chart') group.push(blocks[++i] as RChart);
      out.push(<div key={'g' + i} style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 460px), 1fr)); gap:20px;')}>{group.map(c => <ChartBlock key={c.id} c={c} act={act} />)}</div>);
    } else if (k.kind === 'table') out.push(<TableBlock key={k.id + i} t={k} act={act} extra={notes && notes.id === k.id ? notes.render : undefined} />);
    else out.push(<TextBlock key={'t' + i} k={k} />);
  }
  return <>{out.map((e, i) => <Fragment key={i}>{e}</Fragment>)}</>;
}
