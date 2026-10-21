// 07 · ESG y Gobierno Corporativo: indicadores reportados por la empresa (dato) separados de la lectura del equipo. Sin calificaciones inventadas.
import { css } from '../css';
import type { VM } from '../viewmodel';

function Corners() { return <><i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i></>; }

/** Panel desplegable de fuentes con enlaces externos. */
export function Sources({ items, title }: { items: { n: string; u: string; d: string; link: boolean }[]; title?: string }) {
  return (
    <details className="blueprint" style={css('padding:16px 22px;')}>
      <summary style={css('cursor:pointer; font-family:var(--font-heading); font-weight:600; font-size:18px;')}>{title || 'Fuentes'} ({items.length})</summary>
      <ul style={css('margin:12px 0 0; padding-left:18px; display:flex; flex-direction:column; gap:8px; font-size:15px; line-height:1.45;')}>
        {items.map((s, i) => (
          <li key={i}>{s.link ? <a href={s.u} target="_blank" rel="noopener noreferrer">{s.n}</a> : <strong>{s.n}</strong>}
            <span style={css('color:var(--color-neutral-700);')}> · {s.d}</span></li>))}</ul>
    </details>
  );
}

export function EsgPage({ vm }: { vm: VM }) {
  const { co, esg: g, v } = vm;
  if (!v.p7 || !g.has) return null;
  return (
    <section data-page data-screen-label={vm.nums.p7 + ' ESG y Gobierno Corporativo'} style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-direction:column; gap:8px;')}>
        <span style={css('font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>{vm.nums.p7} · ESG y Gobierno Corporativo</span>
        <h1 style={css('margin:0; max-width:1200px; font-size:clamp(36px, 4.4vw, 60px); line-height:1; text-transform:uppercase; letter-spacing:-.02em; text-wrap:balance;')}>“Lo que no está en el balance”: ESG y Gobierno Corporativo</h1>
        <span style={css('font-size:16px; color:var(--color-neutral-800);')}>{co.legalName} · indicadores no financieros y estructura de gobierno</span>
        <p style={css('margin:4px 0 0; max-width:920px; font-size:15px; line-height:1.55; color:var(--color-neutral-800);')}>{g.note}</p></div>

      <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;')}>
        {g.pillars.map((p: any) => (
          <div key={p.key} className="blueprint" style={css('padding:22px 22px 18px; display:flex; flex-direction:column; gap:4px;')}>
            <Corners />
            <h2 style={css('margin:0 0 6px; font-size:28px;')}>{p.title}</h2>
            {p.items.map((x: any, i: number) => (
              <div key={i} style={css('padding:12px 0; border-top:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
                <span style={css('font-size:15px; font-weight:600;')}>{x.k}</span>
                <span style={css('font-family:var(--font-heading); font-weight:600; font-size:30px; line-height:1.05; color:var(--color-accent);')}>{x.v}</span>
                <span style={css('font-size:14px; color:var(--color-neutral-700);')}>Dato {x.period} · {x.src}{x.team ? ' · ' : ''}{x.team ? <span className="tag tag-neutral" style={css('font-size:12.5px; padding:1px 6px;')}>Equipo</span> : null}</span>
                <span style={css('font-size:14px; line-height:1.5;')}><strong style={css('font-weight:600; color:var(--color-neutral-800);')}>Lectura: </strong>{x.reading}</span></div>))}</div>))}</div>

      <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:stretch;')}>
        <div className="blueprint" style={css('flex:6 1 460px; min-width:0; padding:24px; display:flex; flex-direction:column; gap:14px;')}>
          <Corners />
          <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
            <h2 style={css('margin:0; font-size:24px;')}>Consejo de Administración</h2>
            <span style={css('font-size:14px; color:var(--color-neutral-700);')}>Línea = {g.board.bestPractice} de independientes (Mejor Práctica 18)</span></div>
          <div style={css('overflow-x:auto;')}>
            <table className="table" style={css('font-size:15px; min-width:460px;')}>
              <thead><tr><th>Corte</th><th style={css('text-align:right;')}>Total</th><th style={css('text-align:right;')}>Patrimoniales</th><th style={css('text-align:right;')}>Relacionados</th><th style={css('text-align:right;')}>Independientes</th></tr></thead>
              <tbody>{g.board.rows.map((r: any, i: number) => (
                <tr key={i}><td style={css('font-weight:700;')}>{r.cut}</td><td style={css('text-align:right;')}>{r.tot}</td><td style={css('text-align:right;')}>{r.pat}</td><td style={css('text-align:right;')}>{r.rel}</td><td style={css('text-align:right; font-weight:600;')}>{r.ind} ({r.pct})</td></tr>))}</tbody></table></div>
          {g.board.rows.map((r: any, i: number) => (
            <div key={i} style={css('display:grid; grid-template-columns:64px minmax(0,1fr) 64px; gap:10px; align-items:center;')}>
              <span style={css('font-size:14px; font-weight:600;')}>{r.cut}</span>
              <div style={css('position:relative; height:14px; background:var(--color-neutral-200);')} aria-hidden="true">
                <div style={css(`position:absolute; inset:0 auto 0 0; width:${r.w}; background:${r.below ? 'var(--warn)' : 'var(--color-accent)'};`)}></div>
                <div style={css(`position:absolute; top:-5px; bottom:-5px; left:${g.board.bestPractice}; border-left:2px solid var(--color-text);`)}></div></div>
              <span style={css(`font-family:var(--font-heading); font-size:18px; font-weight:600; text-align:right; color:${r.below ? 'var(--warn)' : 'var(--color-text)'};`)}>{r.pct}</span></div>))}
          <ul style={css('margin:0; padding-left:18px; font-size:14px; line-height:1.5; color:var(--color-neutral-700);')}>
            {g.board.rows.map((r: any, i: number) => <li key={i}><strong>{r.cut}:</strong> {r.src}</li>)}</ul>
          <p style={css('margin:0; font-size:14px; line-height:1.55;')}>{g.board.note}</p></div>

        <div style={css('flex:5 1 380px; min-width:0; display:flex; flex-direction:column; gap:12px;')}>
          <h2 style={css('margin:0; font-size:24px;')}>Comités y ética</h2>
          {g.committees.map((x: any, i: number) => (
            <div key={i} style={css('padding:12px 0; border-top:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
              <span style={css('font-family:var(--font-heading); font-weight:600; font-size:19px;')}>{x.name}</span>
              <span style={css('font-size:15px; line-height:1.5;')}>{x.v}</span>
              <span style={css('font-size:14px; color:var(--color-neutral-700);')}>{x.src}</span></div>))}</div></div>

      <Sources items={g.sources} />
    </section>
  );
}
