// 05 · Precedent Transactions (método de referencia; peso 0% en la valuación combinada oficial).
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';
import { TableCard } from '../components/TableCard';
import { TraceCard } from '../components/TraceCard';
import { Stat } from './MultiplesPage';

export function TransactionsPage({ vm }: { vm: VM }) {
  const { co, goP6, r, trans: T, v } = vm;
  if (!v.p5) return null;
  return (
    <section data-page data-screen-label="05 Transacciones" style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>05 · Transacciones precedentes</span>
          <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Cuánto se ha pagado en operaciones?</h1></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:8px;')}>
          <span className="tag tag-neutral">Precio al {co.priceDate}: {r.price}</span>
          {T.has && T.modified ? <button className="tag tag-accent" onClick={T.reset} style={css('border:0; cursor:pointer;')}>● Muestra modificada · Restaurar</button> : null}</div></div>
      {!T.has ? (
        <div className="blueprint" style={css('padding:24px;')}>Este dataset no documenta transacciones; no se inventan operaciones.</div>
      ) : (<>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:stretch;')}>
          <div className="blueprint" style={css('flex:5 1 420px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:10px;')}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:8px; align-items:center;')}>
              <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Precedent Transactions · {co.currency} por acción</span>
              <span className="tag tag-neutral">{T.contributes ? 'Peso ' + T.weightTxt : 'Referencia · peso ' + T.weightTxt}</span></div>
            <span style={css('font-family:var(--font-heading); font-size:clamp(64px, 7vw, 104px); font-weight:600; line-height:.9; color:var(--color-neutral-700);')}>{T.value}</span>
            <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${T.upColor};`)}>{T.up} vs. precio</span>
            <div style={css('display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); border-top:1px solid var(--color-divider);')}>
              <Stat k="Rango mín – máx" v={T.lo + ' – ' + T.hi} />
              <Stat k="Operaciones incluidas" v={T.n + ' de ' + T.total} s={T.inWindow + ' dentro de la ventana'} />
              <Stat k="Misma geografía" v={String(T.inGeo)} /></div>
            <span role="note" style={css('font-size:12px; line-height:1.5; color:var(--neg);')}>{T.warning}</span>
            <span style={css('font-size:12px; line-height:1.5; color:var(--color-neutral-700);')}>El método queda disponible: si se obtiene una muestra sólida, basta con actualizar las operaciones y asignarle peso en 06 · Combinada.</span></div>
          {(T.chains || []).slice(-1).map((c: any, $i: number) => (<Fragment key={$i}><TraceCard c={c} /></Fragment>))}</div>
        <div style={css('display:flex; flex-wrap:wrap; gap:20px;')}>
          {(T.chains || []).slice(0, -1).map((c: any, $i: number) => (<Fragment key={$i}><TraceCard c={c} label="Transacción → múltiplo → estadístico → métrica → EV → Equity → precio" /></Fragment>))}</div>
        {(T.tables || []).map((t: any, $i: number) => (<Fragment key={$i}><TableCard t={t} /></Fragment>))}
        <div style={css('display:flex; justify-content:flex-end;')}>
          <button className="btn btn-primary blueprint" onClick={goP6}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>06 · Valuación combinada →</button></div>
      </>)}
    </section>
  );
}
