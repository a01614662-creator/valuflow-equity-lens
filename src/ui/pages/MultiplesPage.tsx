// 04 · Valuación relativa: Trading Comps y Precedent Transactions (mismo lenguaje visual que el resto del diseño).
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';
import { TableCard } from '../components/TableCard';

function Stat({ k, v, s, color }: { k: string; v: string; s?: string; color?: string }) {
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
  const T = mult.trans;
  return (
    <section data-page data-screen-label="04 Múltiplos" style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>04 · Valuación relativa</span>
          <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Cuánto vale frente a sus pares?</h1></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:8px;')}>
          {mult.has ? <span className="tag tag-neutral">Múltiplos as-of {mult.asOf}</span> : null}
          <span className="tag tag-neutral">Precio al {co.priceDate}: {r.price}</span>
          {mult.modified ? <button className="tag tag-accent" onClick={mult.reset} style={css('border:0; cursor:pointer;')}>● Muestra modificada · Restaurar</button> : null}</div></div>
      {!mult.has ? (
        <div className="blueprint" style={css('padding:24px;')}>Este dataset no documenta comparables ni transacciones; no se generan múltiplos.</div>
      ) : (<>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:1 1 420px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:10px;')}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:8px; align-items:center;')}>
              <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Trading Comps · {co.currency} por acción</span>
              <span className="tag tag-accent">Complementario</span></div>
            <span style={css('font-family:var(--font-heading); font-size:clamp(64px, 7vw, 104px); font-weight:600; line-height:.9; color:var(--color-accent);')}>{mult.value}</span>
            <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${mult.upColor};`)}>{mult.up} vs. precio</span>
            <div style={css('display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); border-top:1px solid var(--color-divider);')}>
              <Stat k="Rango P25 – P75" v={mult.p25 + ' – ' + mult.p75} />
              <Stat k="Comparables incluidos" v={mult.n + ' de ' + mult.total} />
              <Stat k="Múltiplos usados" v={String(mult.used)} s="promedio a la media" /></div>
            <span style={css('font-size:12px; line-height:1.5; color:var(--color-neutral-700);')}>{mult.note}</span></div>
          {T ? (
            <div className="blueprint" style={css('flex:1 1 420px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:10px;')}>
              <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
              <div style={css('display:flex; justify-content:space-between; gap:8px; align-items:center;')}>
                <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Precedent Transactions · {co.currency} por acción</span>
                <span className="tag tag-neutral">Referencia · peso 0%</span></div>
              <span style={css('font-family:var(--font-heading); font-size:clamp(64px, 7vw, 104px); font-weight:600; line-height:.9; color:var(--color-neutral-700);')}>{T.value}</span>
              <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${T.upColor};`)}>{T.up} vs. precio</span>
              <div style={css('display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); border-top:1px solid var(--color-divider);')}>
                <Stat k="Rango mín – máx" v={T.lo + ' – ' + T.hi} />
                <Stat k="Operaciones" v={String(T.n)} s={T.inWindow + ' dentro de la ventana'} />
                <Stat k="Misma geografía" v={String(T.inGeo)} /></div>
              <span role="note" style={css('font-size:12px; line-height:1.5; color:var(--neg);')}>{T.warning}</span></div>
          ) : null}</div>
        <div style={css('display:flex; flex-direction:column; gap:6px;')}>
          <h2 style={css('margin:0; font-size:32px;')}>Trading Comps</h2>
          <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Metodología de clase: 6 estadísticos, puente EV → capital y promedio de los precios implícitos a la media. Usa los botones Sí/No para cambiar la muestra o los múltiplos; todo se recalcula.</span></div>
        {(mult.tables || []).map((t: any, $i: number) => (<Fragment key={$i}><TableCard t={t} /></Fragment>))}
        {T ? (<>
          <div style={css('display:flex; flex-direction:column; gap:6px;')}>
            <h2 style={css('margin:0; font-size:32px;')}>Precedent Transactions</h2>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Operaciones de M&A del export de CIQ con su evaluación contra los criterios de clase. Método de referencia: se calcula y se muestra, pero no pesa en la valuación combinada.</span></div>
          {(mult.ttables || []).map((t: any, $i: number) => (<Fragment key={$i}><TableCard t={t} /></Fragment>))}
        </>) : null}
        <div style={css('display:flex; justify-content:flex-end;')}>
          <button className="btn btn-primary blueprint" onClick={goP5}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>05 · Valuación combinada →</button></div>
      </>)}
    </section>
  );
}
