// "¿De dónde salió este número?": cadena de pasos (concepto → valor → fórmula / origen).
import { Fragment } from 'react';
import { css } from '../css';
import type { Chain } from '../relative';

export function TraceCard({ c, label }: { c: Chain; label?: string }) {
  return (
    <div className="blueprint" style={css('flex:1 1 360px; min-width:0; padding:20px 22px; display:flex; flex-direction:column; gap:10px;')}>
      <i className="corner tl"></i>
      <i className="corner tr"></i>
      <i className="corner bl"></i>
      <i className="corner br"></i>
      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{label || '¿De dónde salió este número?'}</div>
      <h4 style={css('margin:0; font-size:20px;')}>{c.title}</h4>
      <ol style={css('margin:0; padding:0; list-style:none; display:flex; flex-direction:column;')}>
        {c.steps.map((s, i) => (<Fragment key={i}>
          <li style={css('display:grid; grid-template-columns:22px minmax(0,1fr) auto; gap:4px 10px; padding:8px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent); align-items:baseline;')}>
            <span style={css('font-family:var(--font-heading); font-size:13px; color:var(--color-accent-700);')}>{i + 1}</span>
            <span style={css(`font-size:13px; font-weight:${s.strong ? 700 : 500};`)}>{s.k}</span>
            <span style={css(`font-family:var(--font-heading); font-size:${s.strong ? 20 : 15}px; font-weight:600; text-align:right; color:${s.strong ? 'var(--color-accent)' : 'var(--color-text)'};`)}>{s.v}</span>
            <span></span>
            <span style={css('grid-column:2 / 4; font-size:11px; line-height:1.45; color:var(--color-neutral-700);')}>{s.f}</span></li>
        </Fragment>))}</ol></div>
  );
}
