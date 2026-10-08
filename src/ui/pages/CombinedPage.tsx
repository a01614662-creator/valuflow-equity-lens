// 06 · Valuación combinada: DCF + Trading Comps + Precedent Transactions con pesos visibles y trazables.
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';
import { TraceCard } from '../components/TraceCard';

export function CombinedPage({ vm }: { vm: VM }) {
  const { co, comb, football, goLab, r, v } = vm;
  if (!v.p6) return null;
  return (
    <section data-page data-screen-label="06 Combinada" style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>06 · Valuación combinada</span>
          <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Qué dicen los tres métodos juntos?</h1></div>
        {comb.modified ? <button className="tag tag-accent" onClick={comb.reset} style={css('border:0; cursor:pointer;')}>● Pesos modificados · Restaurar</button> : null}</div>
      {!comb.has ? (
        <div className="blueprint" style={css('padding:24px;')}>Este dataset no documenta una valuación combinada.</div>
      ) : (<>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:5 1 380px; min-width:0; padding:32px; display:flex; flex-direction:column; gap:12px;')}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Precio combinado · {co.currency} por acción</span>
            <span style={css('font-family:var(--font-heading); font-weight:600; font-size:clamp(80px, 9vw, 140px); line-height:.85; letter-spacing:-.03em; color:var(--color-accent);')}>{comb.value}</span>
            <span style={css(`font-family:var(--font-heading); font-size:28px; font-weight:600; color:${comb.upColor};`)}>{comb.up} vs. precio {comb.price} ({comb.diff})</span>
            <span style={css('font-size:14px; font-weight:600;')}>Contribuyen: {comb.contributors}</span>
            <span style={css('font-size:13px; line-height:1.5; color:var(--color-neutral-700);')}>Precio combinado = Σ (peso × precio del método); los pesos deben sumar 100%. Memo con la regla de clase de pesos iguales (⅓ cada método): <strong>{comb.classValue}</strong>.</span>
            {comb.hasErrors ? <span role="alert" style={css('font-size:13px; color:var(--neg);')}>{comb.errors.join(' ')}</span> : null}</div>
          <div className="blueprint" style={css('flex:7 1 600px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:14px;')}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
              <h3 style={css('margin:0; font-size:24px;')}>Pesos por método</h3>
              <span style={css(`font-size:13px; font-weight:600; color:${comb.sumOk ? 'var(--color-neutral-700)' : 'var(--neg)'};`)}>Suma de pesos: {comb.weightSum}</span></div>
            <div style={css('overflow-x:auto;')}>
              <table className="table" style={css('font-size:13px; min-width:640px;')}>
                <thead><tr><th>Método</th><th></th><th style={css('text-align:right;')}>Precio</th><th style={css('text-align:right;')}>Peso (%)</th><th style={css('text-align:right;')}>Regla de clase</th><th style={css('text-align:right;')}>Contribución</th></tr></thead>
                <tbody>
                  {(comb.rows || []).map((x: any, $i: number) => (<Fragment key={$i}>
                    <tr>
                      <td title={x.reason} style={css(`font-weight:600; color:${x.ref ? 'var(--color-neutral-700)' : 'var(--color-text)'};`)}>{x.label}</td>
                      <td><span className={'tag ' + x.tagCls} style={css('font-size:10px; padding:1px 6px; white-space:nowrap;')}>{x.tag}</span></td>
                      <td style={css('text-align:right;')}>{x.price}</td>
                      <td style={css('text-align:right;')}><input className="input" type="number" min="0" max="100" step="5" value={x.weight} onChange={x.onChange} aria-label={'Peso de ' + x.label} style={css('width:88px; text-align:right;')} /></td>
                      <td style={css('text-align:right; color:var(--color-neutral-700);')}>{x.classW}</td>
                      <td style={css('text-align:right; font-weight:600;')}>{x.contribution}</td></tr>
                  </Fragment>))}</tbody></table></div>
            <div style={css('display:flex; flex-direction:column; gap:6px; font-size:12px; line-height:1.5; color:var(--color-neutral-700);')}>
              {(comb.rows || []).map((x: any, $i: number) => (<Fragment key={$i}><span><strong>{x.label}:</strong> {x.reason}</span></Fragment>))}
              <span>{comb.classRule}</span></div></div></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:20px;')}><TraceCard c={comb.chain} /></div>
        <div className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:12px;')}>
          <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
          <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
            <h3 style={css('margin:0; font-size:24px;')}>Comparación de métodos</h3>
            <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{football.scaleTxt} · línea punteada = precio de mercado {r.price}</span></div>
          {(football.rows || []).map((f: any, $i: number) => (<Fragment key={$i}>
            <div style={css('display:flex; flex-wrap:wrap; align-items:center; gap:8px 20px; padding:10px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent);')}>
              <div style={css('flex:0 0 240px; display:flex; flex-direction:column;')}>
                <span style={css(`font-weight:${f.weight}; font-size:15px;`)}>{f.label}</span>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{f.sub}</span></div>
              <div style={css('flex:1 1 300px; position:relative; height:28px;')}>
                <div style={css(`position:absolute; top:-10px; bottom:-10px; left:${football.priceLeft}; width:0; border-left:1px dashed var(--color-text); opacity:.55;`)}></div>
                {f.hasBar ? <div style={css(`position:absolute; top:7px; height:14px; left:${f.barLeft}; width:${f.barWidth}; background:${f.barBg};`)}></div> : null}
                {f.hasDot ? <div style={css(`position:absolute; top:4px; left:${f.dotLeft}; width:20px; height:20px; margin-left:-10px; background:${f.dotBg}; border:2px solid var(--color-bg); transform:rotate(45deg);`)}></div> : null}</div>
              <div style={css('flex:0 0 150px; text-align:right; display:flex; flex-direction:column;')}>
                <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${f.color};`)}>{f.valueTxt}</span>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{f.rangeTxt}</span></div></div>
          </Fragment>))}</div>
        <div style={css('display:flex; justify-content:flex-end;')}>
          <button className="btn btn-primary blueprint" onClick={goLab}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>Modificar supuestos →</button></div>
      </>)}
    </section>
  );
}
