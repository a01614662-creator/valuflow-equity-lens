// 00 · Acerca de: quién es la empresa valuada (perfil, precio, formatos y presiones competitivas). Solo dibuja; los datos vienen de ds.about.
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';
import { Sources } from './EsgPage';
import { BrandLogo } from '../components/BrandLogo';

function Corners() { return <><i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i></>; }

export function AboutPage({ vm }: { vm: VM }) {
  const { about: a, co, ui, v } = vm;
  if (!v.p0 || !a.has) return null;
  const c = a.chart;
  return (
    <section data-page data-screen-label={vm.nums.p0 + ' Acerca de'} style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px; min-width:0;')}>
          <span style={css('font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>{vm.nums.p0} · Acerca de</span>
          <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Quién es {co.short}?</h1>
          <span style={css('font-size:16px; color:var(--color-neutral-800);')}>{co.legalName} · {co.ticker} en la {co.exchange} · {co.sector}</span></div>
        {co.hasLogo ? <img src={co.logo} alt={co.name} style={css('height:56px; max-width:220px; object-fit:contain;')} /> : null}</div>

      <dl style={css('margin:0; display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); border-top:2px solid var(--color-text); border-bottom:1px solid var(--color-divider);')}>
        {(a.kpis || []).map((k: any, i: number) => (
          <div key={i} style={css(ui.mobile ? `padding:14px 0; display:flex; flex-direction:column; gap:4px; border-top:${i ? '1px solid var(--color-divider)' : '0'};` : `padding:16px 18px 16px ${i ? '18px' : '0'}; display:flex; flex-direction:column; gap:4px; border-left:${i ? '1px solid var(--color-divider)' : '0'};`)}>
            <dt style={css('font-size:14px; color:var(--color-neutral-700);')}>{k.k}</dt>
            <dd style={css(`margin:0; font-family:var(--font-heading); font-weight:600; font-size:clamp(28px, 2.6vw, 36px); line-height:1.05; color:${k.accent ? 'var(--color-accent)' : 'var(--color-text)'};`)}>{k.v}</dd>
            <span style={css('font-size:14px; line-height:1.4; color:var(--color-neutral-700);')}>{k.s}</span></div>))}
      </dl>

      <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:flex-start;')}>
        <figure className="blueprint" style={css('flex:7 1 520px; min-width:0; margin:0; padding:24px 24px 18px; display:flex; flex-direction:column; gap:10px;')}>
          <Corners />
          <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
            <h2 style={css('margin:0; font-size:24px;')}>Precio de la acción</h2>
            <span style={css('font-size:14px; color:var(--color-neutral-700);')}>{a.currency} por acción · cierre mensual{c ? ' · ' + c.range : ''}</span></div>
          {c ? (
            <svg viewBox={`0 0 ${c.W} ${c.H}`} role="img" aria-label={c.summary} style={css('width:100%; height:auto; display:block; overflow:visible;')}>
              {c.yTicks.map((t: any, i: number) => (<Fragment key={i}>
                <line x1={c.L} x2={c.W - c.R} y1={t.y} y2={t.y} stroke="var(--color-divider)" strokeWidth="1" />
                <text x={c.L - 8} y={t.y + 4} textAnchor="end" fontSize="13" fill="var(--color-neutral-700)">{t.t}</text></Fragment>))}
              {c.xTicks.map((t: any, i: number) => <text key={i} x={t.x} y={c.H - 10} textAnchor="middle" fontSize="13" fill="var(--color-neutral-700)">{t.t}</text>)}
              <path d={c.line} fill="none" stroke="var(--color-text)" strokeWidth="2" strokeLinejoin="round" />
              {c.ref ? (<g>
                <line x1={c.ref.x} x2={c.ref.x} y1={c.ref.box.y + c.ref.box.h} y2={c.H - c.B} stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="4 4" />
                <rect x={c.ref.box.x} y={c.ref.box.y} width={c.ref.box.w} height={c.ref.box.h} fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="1.5" />
                <text x={c.ref.box.x + c.ref.box.w / 2} y={c.ref.box.y + 20} textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--color-accent)">{c.ref.txt}</text>
                <circle cx={c.ref.x} cy={c.ref.y} r="6" fill="var(--color-accent)" stroke="var(--color-bg)" strokeWidth="2" /></g>) : null}
              <circle cx={c.last.x} cy={c.last.y} r="4" fill="var(--color-text)" />
              <text x={c.last.x - 8} y={c.last.y - 10} textAnchor="end" fontSize="13" fill="var(--color-neutral-800)">{c.last.v}</text>
            </svg>) : <p style={css('margin:0; font-size:15px;')}>El dataset no incluye una serie de precios.</p>}
          <figcaption style={css('font-size:14px; line-height:1.5; color:var(--color-neutral-700);')}>{a.note}</figcaption></figure>

        <div className="blueprint" style={css('flex:5 1 360px; min-width:0; padding:24px; display:flex; flex-direction:column; gap:12px;')}>
          <Corners />
          <h2 style={css('margin:0; font-size:24px;')}>Formatos y tiendas</h2>
          <div style={css('overflow-x:auto;')}>
            <table className="table" style={css('font-size:15px;')}>
              <thead><tr><th>Formato</th>{a.formats.periods.map((p: any, i: number) => <th key={i} style={css('text-align:right;')}>{p.label}</th>)}</tr></thead>
              <tbody>
                {a.formats.rows.map((r: any, i: number) => (
                  <tr key={i}><td><strong style={css('font-family:var(--font-heading); font-size:17px;')}>{r.name}</strong><br /><span style={css('font-size:14px; color:var(--color-neutral-700);')}>{r.desc}</span></td>
                    {r.cells.map((x: string, j: number) => <td key={j} style={css('text-align:right; font-family:var(--font-heading); font-size:18px;')}>{x}</td>)}</tr>))}
                <tr><td style={css('font-weight:700;')}>Total</td>{a.formats.totals.map((x: string, j: number) => <td key={j} style={css('text-align:right; font-family:var(--font-heading); font-size:20px; font-weight:600;')}>{x}</td>)}</tr>
              </tbody></table></div>
          <ul style={css('margin:0; padding-left:18px; font-size:14px; line-height:1.5; color:var(--color-neutral-700);')}>
            {a.formats.periods.map((p: any, i: number) => <li key={i}><strong>{p.label}:</strong> {p.src}</li>)}</ul>
          <div style={css('display:flex; flex-direction:column; gap:8px; padding-top:10px; border-top:1px solid var(--color-divider);')}>
            {a.related.map((x: any, i: number) => (
              <div key={i} style={css('display:flex; gap:12px; align-items:center;')}>
                {x.b ? <BrandLogo b={x.b} w={96} h={40} pad={4} /> : null}
                <div style={css('display:flex; flex-direction:column; gap:1px; min-width:0;')}>
                <span style={css('font-size:15px;')}><strong>{x.name}:</strong> {x.v}</span>
                <span style={css('font-size:14px; color:var(--color-neutral-700);')}>{x.src}</span></div></div>))}</div></div></div>

      <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:stretch;')}>
        <div style={css('flex:7 1 520px; min-width:0; display:flex; flex-direction:column; gap:12px;')}>
          <h2 style={css('margin:0; font-size:28px;')}>Presiones competitivas</h2>
          <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:0; border-top:1px solid var(--color-divider);')}>
            {a.threats.map((t: any, i: number) => (
              <div key={i} style={css('padding:14px 18px 14px 0; border-bottom:1px solid var(--color-divider); display:flex; flex-direction:column; gap:6px;')}>
                {t.b ? <BrandLogo b={t.b} w={150} h={56} /> : <span aria-hidden="true" style={css('width:150px; height:56px; display:grid; place-items:center; border:1px dashed var(--color-neutral-400); font-family:var(--font-heading); font-size:15px; font-weight:600; color:var(--color-accent-700);')}>Factor de mercado</span>}
                <span style={css('font-family:var(--font-heading); font-weight:600; font-size:22px;')}>{t.name}</span>
                <span style={css('font-size:15px; line-height:1.5;')}>{t.desc}</span>
                <span style={css('font-size:14px; color:var(--color-neutral-700);')}>{t.src}</span></div>))}</div></div>
        <div style={css('flex:5 1 360px; min-width:0; display:flex; flex-direction:column; gap:12px;')}>
          <h2 style={css('margin:0; font-size:28px;')}>Lo que encontró el equipo</h2>
          {a.insights.map((x: any, i: number) => (
            <blockquote key={i} style={css('margin:0; padding:4px 0 4px 16px; border-left:3px solid var(--color-accent); display:flex; flex-direction:column; gap:4px;')}>
              <span style={css('font-size:16px; line-height:1.5;')}>{x.t}</span>
              <span style={css('font-size:14px; color:var(--color-neutral-700);')}>{x.src}</span></blockquote>))}</div></div>

      <Sources items={a.sources} />
    </section>
  );
}
