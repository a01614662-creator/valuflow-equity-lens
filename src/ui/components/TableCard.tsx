// Tarjeta con tabla (anexos, múltiplos, inflación). Las celdas con onClick se dibujan como botones (alternar 1/0).
import { Fragment } from 'react';
import { css } from '../css';
import type { TTable } from '../tables';

export function TableCard({ t }: { t: TTable }) {
  return (
    <div className="blueprint" data-page style={css('padding:24px; display:flex; flex-direction:column; gap:14px;')}>
      <i className="corner tl"></i>
      <i className="corner tr"></i>
      <i className="corner bl"></i>
      <i className="corner br"></i>
      <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
        <div>
          <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{t.code ? t.code + ' · ' : ''}{t.unit}</div>
          <h3 style={css('margin:4px 0 0; font-size:26px;')}>{t.title}</h3>
          <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{t.question}</span></div>
        <span className="tag tag-outline">Fuente: {t.source}</span></div>
      {t.warn ? (
        <div role="note" style={css('padding:10px 14px; border:1px solid var(--neg); color:var(--neg); font-size:13px; line-height:1.5;')}>{t.warn}</div>
      ) : null}
      <div style={css('overflow:auto; max-height:640px; border-top:1px solid var(--color-text);')}>
        <table className="table" style={css(`font-size:13px; min-width:${t.minW};`)}>
          <thead>
            <tr>
              <th style={css('position:sticky; top:0; left:0; z-index:2; background:var(--color-bg);')}>Concepto</th>
              {(t.head || []).map((h, $i) => (<Fragment key={$i}>
                <th title={h.tip} style={css(`position:sticky; top:0; background:${h.bg}; text-align:${h.align}; white-space:nowrap; z-index:1;`)}>{h.t}</th>
              </Fragment>))}</tr></thead>
          <tbody>
            {(t.rows || []).map((row, $i) => (<Fragment key={$i}>
              <tr>
                <td title={row.tip} style={css(`position:sticky; left:0; background:var(--color-bg); font-weight:${row.fw}; color:${row.lc}; font-size:${row.fs}; letter-spacing:${row.ls}; text-transform:${row.tt}; min-width:220px;`)}>{row.label}</td>
                {(row.cells || []).map((c, $j) => (<Fragment key={$j}>
                  <td title={c.title} style={css(`text-align:${c.align}; white-space:${c.ws}; min-width:${c.mw}; background:${c.bg}; color:${c.color}; font-weight:${c.strong ? 600 : row.fw};`)}>
                    {c.onClick ? (
                      <button onClick={c.onClick} title={c.title} style={css(`border:1px solid var(--color-divider); background:none; color:${c.color}; cursor:pointer; font-size:12px; padding:3px 8px; font-weight:600;`)}>{String(c.t)}</button>
                    ) : String(c.t)}</td>
                </Fragment>))}</tr>
            </Fragment>))}</tbody></table></div>
      {t.hasNote ? (
        <span style={css('font-size:12px; line-height:1.5; color:var(--color-neutral-700);')}>{t.note}</span>
      ) : null}</div>
  );
}
