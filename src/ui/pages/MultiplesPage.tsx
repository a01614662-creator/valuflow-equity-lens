// 04 · Trading Comps (valuación relativa por múltiplos de empresas públicas comparables).
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';
import { TableCard } from '../components/TableCard';
import { TraceCard } from '../components/TraceCard';

export function Stat({ k, v, s, color }: { k: string; v: string; s?: string; color?: string }) {
  return (
    <div style={css('display:flex; flex-direction:column; gap:2px; padding:12px 16px 0 0;')}>
      <span style={css('font-size:11px; color:var(--color-neutral-700);')}>{k}</span>
      <span style={css(`font-family:var(--font-heading); font-size:30px; font-weight:600; line-height:1.05; color:${color || 'var(--color-text)'};`)}>{v}</span>
      {s ? <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{s}</span> : null}</div>
  );
}

export function MultiplesPage({ vm }: { vm: VM }) {
  const { co, goP5, mult, r, v } = vm;
  if (!v.p4) return null;
  return (
    <section data-page data-screen-label="04 Múltiplos" style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>04 · Múltiplos · Trading Comps</span>
          <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Cuánto vale frente a sus pares?</h1></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:8px;')}>
          {mult.has ? <span className="tag tag-neutral">Múltiplos as-of {mult.asOf}</span> : null}
          <span className="tag tag-neutral">Precio al {co.priceDate}: {r.price}</span>
          {mult.modified ? <button className="tag tag-accent" onClick={mult.reset} style={css('border:0; cursor:pointer;')}>● Muestra modificada · Restaurar</button> : null}</div></div>
      {!mult.has ? (
        <div className="blueprint" style={css('padding:24px;')}>Este dataset no documenta comparables; no se generan múltiplos.</div>
      ) : (<>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:stretch;')}>
          <div className="blueprint" style={css('flex:5 1 420px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:10px;')}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:8px; align-items:center;')}>
              <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Trading Comps · {co.currency} por acción</span>
              <span className="tag tag-accent">Método complementario</span></div>
            <span style={css('font-family:var(--font-heading); font-size:clamp(64px, 7vw, 104px); font-weight:600; line-height:.9; color:var(--color-accent);')}>{mult.value}</span>
            <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${mult.upColor};`)}>{mult.up} vs. precio</span>
            <div style={css('display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); border-top:1px solid var(--color-divider);')}>
              <Stat k="Rango P25 – P75" v={mult.p25 + ' – ' + mult.p75} />
              <Stat k="Comparables incluidos" v={mult.n + ' de ' + mult.total} />
              <Stat k="Múltiplos usados" v={String(mult.used)} s="promedio a la media" /></div>
            <span style={css('font-size:12px; line-height:1.5; color:var(--color-neutral-700);')}>Metodología de clase: muestra depurada → múltiplos publicados → 6 estadísticos → métrica de la empresa → EV → Equity → precio. Usa los botones Sí/No de las tablas para cambiar la muestra o los múltiplos; todo se recalcula. {mult.note}</span></div>
          {(mult.chains || []).slice(-1).map((c: any, $i: number) => (<Fragment key={$i}><TraceCard c={c} /></Fragment>))}</div>
        <div style={css('display:flex; flex-direction:column; gap:6px;')}>
          <h2 style={css('margin:0; font-size:28px;')}>Trazabilidad por múltiplo</h2>
          <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Comparable → múltiplo → estadístico → métrica de la empresa → EV → Equity → precio.</span></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:20px;')}>
          {(mult.chains || []).slice(0, -1).map((c: any, $i: number) => (<Fragment key={$i}><TraceCard c={c} label="Cadena de cálculo" /></Fragment>))}</div>
        {(mult.tables || []).map((t: any, $i: number) => (<Fragment key={$i}><TableCard t={t} /></Fragment>))}
        <div style={css('display:flex; justify-content:flex-end;')}>
          <button className="btn btn-primary blueprint" onClick={goP5}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>05 · Transacciones precedentes →</button></div>
      </>)}
    </section>
  );
}
