// 06 · Conclusión: precio objetivo, recomendación y metodología (DCF + Trading Comps; transacciones como referencia); detalle desplegable.
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';
import { TraceCard } from '../components/TraceCard';
import { TableCard } from '../components/TableCard';

export function CombinedPage({ vm }: { vm: VM }) {
  const { ext, co, comb, concl: k, football, goLab, r, ui, v } = vm;
  const m = !!ui.mobile;
  if (!v.p6) return null;
  return (
    <section data-page data-screen-label="06 Conclusión" style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>06 · Conclusión de valuación</span>
          <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Qué valor estimamos para {co.short}?</h1></div>
        {comb.modified ? <button className="tag tag-accent" onClick={comb.reset} style={css('border:0; cursor:pointer;')}>● Pesos modificados · Restaurar</button> : null}</div>
      {k.has ? (
        <div className="blueprint" style={css('padding:clamp(20px, 3vw, 36px); display:flex; flex-wrap:wrap; gap:28px 48px; align-items:flex-end;')}>
          <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
          <div style={css('flex:1 1 320px; display:flex; flex-direction:column; gap:6px; min-width:0;')}>
            <span style={css('font-size:15px; color:var(--color-neutral-700);')}>Precio objetivo · {co.currency} por acción</span>
            <span data-target style={css('font-family:var(--font-heading); font-weight:600; font-size:clamp(84px, 10vw, 150px); line-height:.85; letter-spacing:-.03em; color:var(--color-accent);')}>{k.target}</span>
            <span style={css('font-size:15px; line-height:1.5; color:var(--color-neutral-800);')}>{k.formula}</span></div>
          <dl style={css(`flex:1 1 420px; margin:0; display:grid; grid-template-columns:${m ? '1fr' : 'repeat(3, minmax(0, 1fr))'}; border-top:2px solid var(--color-text);`)}>
            <div style={css('padding:14px 14px 0 0; display:flex; flex-direction:column; gap:4px;')}>
              <dt style={css('font-size:14px; color:var(--color-neutral-700);')}>Precio de referencia</dt>
              <dd style={css('margin:0; font-family:var(--font-heading); font-weight:600; font-size:36px; line-height:1;')}>{k.price}</dd>
              <span style={css('font-size:14px; color:var(--color-neutral-700);')}>Cierre del {k.priceDate}</span></div>
            <div style={css(m ? 'padding:14px 0 0; display:flex; flex-direction:column; gap:4px;' : 'padding:14px 14px 0; border-left:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
              <dt style={css('font-size:14px; color:var(--color-neutral-700);')}>Potencial</dt>
              <dd style={css(`margin:0; font-family:var(--font-heading); font-weight:600; font-size:36px; line-height:1; color:${k.potColor};`)}>{k.potential}</dd>
              <span style={css('font-size:14px; color:var(--color-neutral-700);')}>Precio objetivo ÷ referencia − 1</span></div>
            <div style={css(m ? 'padding:14px 0 0; display:flex; flex-direction:column; gap:4px;' : 'padding:14px 0 0 14px; border-left:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
              <dt style={css('font-size:14px; color:var(--color-neutral-700);')}>Recomendación</dt>
              <dd style={css(`margin:0; font-family:var(--font-heading); font-weight:600; font-size:36px; line-height:1; color:${k.tone};`)}>{k.rating}</dd>
              <span style={css('font-size:14px; color:var(--color-neutral-700);')}>Umbral ±{r.threshold}</span></div>
            <span style={css('grid-column:1 / -1; padding-top:12px; font-size:14px; line-height:1.5; color:var(--color-neutral-800);')}>{k.rule}</span></dl>
        </div>) : null}
      {k.has ? (
        <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:flex-start;')}>
          <div style={css('flex:7 1 520px; min-width:0; display:flex; flex-direction:column; gap:10px;')}>
            <h2 style={css('margin:0; font-size:28px;')}>Metodología</h2>
            {k.rows.map((x: any, $i: number) => (
              <div key={$i} style={css(`display:grid; grid-template-columns:${m ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr) 90px 150px'}; gap:4px 16px; align-items:center; padding:12px 0; border-top:1px solid var(--color-divider);`)}>
                <span style={css(`font-size:16px; font-weight:600; color:${x.on ? 'var(--color-text)' : 'var(--color-neutral-700)'};`)}>{x.label}</span>
                <span style={css('font-family:var(--font-heading); font-size:22px; font-weight:600; text-align:right;')}>{x.price}</span>
                <span style={css(`font-family:var(--font-heading); font-size:20px; font-weight:600; text-align:right; ${m ? 'grid-column:1 / -1; text-align:left;' : ''} color:${x.on ? 'var(--color-accent)' : 'var(--color-neutral-700)'};`)}>{x.on ? x.w + ' → ' + x.contrib : '0% · referencia'}</span>
                <div aria-hidden="true" style={css('grid-column:1 / -1; height:8px; background:var(--color-neutral-200);')}><div style={css(`height:100%; width:${x.bar}; background:var(--color-accent);`)}></div></div></div>))}
            <span style={css('font-size:14px; line-height:1.5; color:var(--color-neutral-700);')}>Precedent Transactions se reporta como contraste con peso 0%: la muestra LSEG/SDC es pequeña y heterogénea. El precio objetivo y la recomendación salen del motor con los supuestos activos.</span></div>
          <div style={css('flex:5 1 340px; min-width:0; display:flex; flex-direction:column; gap:10px;')}>
            <h2 style={css('margin:0; font-size:28px;')}>Sensibilidad</h2>
            {k.sens.map((x: any, $i: number) => (
              <div key={$i} style={css('padding:12px 0; border-top:1px solid var(--color-divider); display:flex; flex-direction:column; gap:2px;')}>
                <span style={css('font-size:15px; font-weight:600;')}>{x.k}</span>
                <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600; line-height:1.1;')}>{x.v}</span>
                <span style={css('font-size:14px; color:var(--color-neutral-700);')}>{x.s}</span></div>))}</div></div>) : null}
      {!comb.has ? (
        <div className="blueprint" style={css('padding:24px;')}>Este dataset no documenta una conclusión de valuación (pesos por método).</div>
      ) : (<>
        <details open={comb.modified || undefined} style={css('border-top:1px solid var(--color-divider); padding-top:16px;')}>
        <summary style={css('cursor:pointer; font-family:var(--font-heading); font-weight:600; font-size:22px;')}>Detalle: pesos editables, trazabilidad y comparación de métodos</summary>
        <div style={css('display:flex; flex-direction:column; gap:28px; margin-top:20px;')}>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:5 1 380px; min-width:0; padding:32px; display:flex; flex-direction:column; gap:12px;')}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <span style={css('font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Precio objetivo ponderado · {co.currency} por acción</span>
            <span style={css('font-family:var(--font-heading); font-weight:600; font-size:clamp(80px, 9vw, 140px); line-height:.85; letter-spacing:-.03em; color:var(--color-accent);')}>{comb.value}</span>
            <span style={css(`font-family:var(--font-heading); font-size:28px; font-weight:600; color:${comb.upColor};`)}>{comb.up} vs. precio {comb.price} ({comb.diff})</span>
            <span style={css('font-size:14px; font-weight:600;')}>Contribuyen: {comb.contributors}</span>
            <span style={css('font-size:14px; line-height:1.5; color:var(--color-neutral-700);')}>Precio objetivo = Σ (peso × precio del método); los pesos deben sumar 100%. Memo con la regla de clase de pesos iguales (⅓ cada método): <strong>{comb.classValue}</strong>.</span>
            {comb.hasErrors ? <span role="alert" style={css('font-size:13px; color:var(--neg);')}>{comb.errors.join(' ')}</span> : null}</div>
          <div className="blueprint" style={css('flex:7 1 600px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:14px;')}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
              <h3 style={css('margin:0; font-size:24px;')}>Pesos por método</h3>
              <span style={css(`font-size:13px; font-weight:600; color:${comb.sumOk ? 'var(--color-neutral-700)' : 'var(--neg)'};`)}>Suma de pesos: {comb.weightSum}</span></div>
            <div style={css('overflow-x:auto;')}>
              <table className="table" style={css('font-size:14.5px; min-width:640px;')}>
                <thead><tr><th>Método</th><th></th><th style={css('text-align:right;')}>Precio</th><th style={css('text-align:right;')}>Peso (%)</th><th style={css('text-align:right;')}>Regla de clase</th><th style={css('text-align:right;')}>Contribución</th></tr></thead>
                <tbody>
                  {(comb.rows || []).map((x: any, $i: number) => (<Fragment key={$i}>
                    <tr>
                      <td title={x.reason} style={css(`font-weight:600; color:${x.ref ? 'var(--color-neutral-700)' : 'var(--color-text)'};`)}>{x.label}</td>
                      <td><span className={'tag ' + x.tagCls} style={css('font-size:11.5px; padding:1px 6px; white-space:nowrap;')}>{x.tag}</span></td>
                      <td style={css('text-align:right;')}>{x.price}</td>
                      <td style={css('text-align:right;')}><input className="input" type="number" min="0" max="100" step="5" value={x.weight} onChange={x.onChange} aria-label={'Peso de ' + x.label} style={css('width:88px; text-align:right;')} /></td>
                      <td style={css('text-align:right; color:var(--color-neutral-700);')}>{x.classW}</td>
                      <td style={css('text-align:right; font-weight:600;')}>{x.contribution}</td></tr>
                  </Fragment>))}</tbody></table></div>
            <div style={css('display:flex; flex-direction:column; gap:6px; font-size:13.5px; line-height:1.5; color:var(--color-neutral-700);')}>
              {(comb.rows || []).map((x: any, $i: number) => (<Fragment key={$i}><span><strong>{x.label}:</strong> {x.reason}</span></Fragment>))}
              <span>{comb.classRule}</span></div></div></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:20px;')}><TraceCard c={comb.chain} /></div>
        <div className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:12px;')}>
          <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
          <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
            <h3 style={css('margin:0; font-size:24px;')}>Comparación de métodos</h3>
            <span style={css('font-size:13.5px; color:var(--color-neutral-700);')}>{football.scaleTxt} · línea punteada = precio de mercado {r.price}</span></div>
          {(football.rows || []).map((f: any, $i: number) => (<Fragment key={$i}>
            <div style={css('display:flex; flex-wrap:wrap; align-items:center; gap:8px 20px; padding:10px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent);')}>
              <div style={css('flex:0 0 240px; display:flex; flex-direction:column;')}>
                <span style={css(`font-weight:${f.weight}; font-size:15px;`)}>{f.label}</span>
                <span style={css('font-size:13.5px; color:var(--color-neutral-700);')}>{f.sub}</span></div>
              <div style={css('flex:1 1 300px; position:relative; height:28px;')}>
                <div style={css(`position:absolute; top:-10px; bottom:-10px; left:${football.priceLeft}; width:0; border-left:1px dashed var(--color-text); opacity:.55;`)}></div>
                {f.hasBar ? <div style={css(`position:absolute; top:7px; height:14px; left:${f.barLeft}; width:${f.barWidth}; background:${f.barBg};`)}></div> : null}
                {f.hasDot ? <div style={css(`position:absolute; top:4px; left:${f.dotLeft}; width:20px; height:20px; margin-left:-10px; background:${f.dotBg}; border:2px solid var(--color-bg); transform:rotate(45deg);`)}></div> : null}</div>
              <div style={css('flex:0 0 150px; text-align:right; display:flex; flex-direction:column;')}>
                <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${f.color};`)}>{f.valueTxt}</span>
                <span style={css('font-size:13.5px; color:var(--color-neutral-700);')}>{f.rangeTxt}</span></div></div>
          </Fragment>))}</div>
        </div></details>
        {ext && ext.has ? (<details style={css('border-top:1px solid var(--color-divider); padding-top:16px;')}>
          <summary style={css('cursor:pointer; font-family:var(--font-heading); font-weight:600; font-size:22px;')}>Contraste externo: S&amp;P Capital IQ, LSEG Refinitiv y consenso</summary>
          <div style={css('display:flex; flex-direction:column; gap:16px; margin-top:16px;')}>
          <div style={css('display:flex; flex-direction:column; gap:6px;')}>
            <span style={css('font-size:14px; color:var(--color-neutral-700); max-width:880px;')}>S&amp;P Capital IQ y LSEG Refinitiv se muestran como contraste: no reemplazan al modelo del equipo ni entran al precio objetivo. El consenso de analistas es una estimación a 12 meses, no un valor intrínseco; el valor de StarMine se leyó de una gráfica (aproximado).</span></div>
          {(ext.tables || []).map((t: any, $i: number) => (<Fragment key={$i}><TableCard t={t} /></Fragment>))}
          </div></details>) : null}
        <div style={css('display:flex; justify-content:flex-end;')}>
          <button className="btn btn-primary blueprint" onClick={goLab}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>Modificar supuestos →</button></div>
      </>)}
    </section>
  );
}
