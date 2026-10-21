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
    <section data-page data-screen-label={vm.nums.p6 + ' Conclusión'} style={css('display:flex; flex-direction:column; gap:28px;')}>
      <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>{vm.nums.p6} · Conclusión</span>
          <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>Valor final</h1>
          <span style={css('font-size:16px; color:var(--color-neutral-800);')}>Conclusión de valuación de {co.legalName}</span></div>
        {comb.modified ? <button className="tag tag-accent" onClick={comb.reset} style={css('border:0; cursor:pointer;')}>● Pesos modificados · Restaurar</button> : null}</div>
      {comb.has ? (
        <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:flex-start;')}>
          <div style={css('flex:8 1 600px; min-width:0; display:flex; flex-direction:column; gap:28px;')}>
            {!k.has ? (
              <div role="alert" className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:8px; border-color:var(--neg);')}>
                <strong style={css('font-family:var(--font-heading); font-size:28px; color:var(--neg);')}>Sin valor final: los pesos suman {comb.weightSum}</strong>
                <span style={css('font-size:15px; line-height:1.5;')}>Ajusta los pesos hasta que sumen 100% o usa «Restaurar {comb.baseTxt}» en el panel.</span></div>) : (<>
            <div className="blueprint" style={css('padding:clamp(20px, 3vw, 36px); display:flex; flex-direction:column; gap:22px;')}>
              <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
              <div style={css('display:flex; flex-direction:column; gap:6px; min-width:0;')}>
                <span style={css('font-size:15px; color:var(--color-neutral-700);')}>Precio objetivo · {co.currency} por acción</span>
                <span data-target style={css('font-family:var(--font-heading); font-weight:600; font-size:clamp(84px, 10vw, 150px); line-height:.85; letter-spacing:-.03em; color:var(--color-accent);')}>{k.target}</span>
                <span style={css('font-size:15px; line-height:1.5; color:var(--color-neutral-800);')}>{k.formula}</span></div>
              <dl style={css(`margin:0; display:grid; grid-template-columns:${m ? '1fr' : 'repeat(3, minmax(0, 1fr))'}; border-top:2px solid var(--color-text);`)}>
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
                <span style={css('grid-column:1 / -1; padding-top:12px; font-size:14px; line-height:1.5; color:var(--color-neutral-800);')}>{k.rule}</span></dl></div>
            <div style={css('display:flex; flex-direction:column; gap:10px;')}>
              <h2 style={css('margin:0; font-size:28px;')}>Sensibilidad</h2>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:0 28px;')}>
                {k.sens.map((x: any, $i: number) => (
                  <div key={$i} style={css('padding:12px 0; border-top:1px solid var(--color-divider); display:flex; flex-direction:column; gap:2px;')}>
                    <span style={css('font-size:15px; font-weight:600;')}>{x.k}</span>
                    <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600; line-height:1.1;')}>{x.v}</span>
                    <span style={css('font-size:14px; color:var(--color-neutral-700);')}>{x.s}</span></div>))}</div></div></>)}</div>
          <aside aria-label="Ponderación de métodos" className="blueprint" style={css(`flex:5 1 380px; min-width:0; padding:24px 26px; display:flex; flex-direction:column; gap:14px; background:var(--color-bg); ${m ? '' : 'position:sticky; top:124px;'}`)}>
            <i className="corner tl"></i><i className="corner tr"></i><i className="corner bl"></i><i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; align-items:baseline; gap:12px; flex-wrap:wrap;')}>
              <h2 style={css('margin:0; font-size:30px;')}>Ponderación de métodos</h2>
              <span data-weights style={css('font-family:var(--font-heading); font-size:24px; font-weight:600; color:var(--color-accent);')}>{(comb.rows || []).map((x: any) => Math.round(x.weight)).join(' · ')}</span></div>
            {(comb.rows || []).map((x: any, $i: number) => { const kr = (k.rows || [])[$i] || {}; return (
              <div key={$i} style={css('display:grid; grid-template-columns:minmax(0, 1fr) auto; gap:6px 14px; align-items:center; padding:12px 0; border-top:1px solid var(--color-divider);')}>
                <div style={css('display:flex; flex-direction:column; gap:2px; min-width:0;')}>
                  <span style={css(`font-size:17px; font-weight:600; color:${kr.on ? 'var(--color-text)' : 'var(--color-neutral-700)'};`)}>{kr.label || x.label}</span>
                  <span style={css('font-size:14px; color:var(--color-neutral-700);')}>Precio {x.price} · {kr.on ? 'aporta ' + x.contribution : 'solo referencia'}</span></div>
                <label style={css('display:flex; align-items:baseline; gap:4px;')}>
                  <input className="input" type="number" min="0" max="100" step="5" value={x.weight} onChange={x.onChange} aria-label={'Peso de ' + (kr.label || x.label) + ' (%)'} style={css(`width:96px; text-align:right; font-family:var(--font-heading); font-size:30px; font-weight:600; padding:4px 8px; color:${kr.on ? 'var(--color-accent)' : 'var(--color-neutral-700)'};`)} />
                  <span style={css('font-family:var(--font-heading); font-size:24px; font-weight:600;')}>%</span></label>
                <div aria-hidden="true" style={css('grid-column:1 / -1; height:10px; background:var(--color-neutral-200);')}><div style={css(`height:100%; width:${kr.bar || '0%'}; background:var(--color-accent); transition:width .4s ease;`)}></div></div></div>); })}
            <div style={css('display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; padding-top:4px; border-top:2px solid var(--color-text);')}>
              <span style={css(`font-size:15px; font-weight:600; color:${comb.sumOk ? 'var(--color-text)' : 'var(--neg)'};`)}>Suma de pesos: {comb.weightSum}</span>
              {comb.modified ? <button className="btn btn-secondary" onClick={comb.reset}>Restaurar {comb.baseTxt}</button> : <span style={css('font-size:14px; color:var(--color-neutral-700);')}>Caso base del modelo</span>}</div>
            {comb.hasErrors ? <span role="alert" style={css('font-size:14px; color:var(--neg);')}>{comb.errors.join(' ')}</span> : null}
            <span style={css('font-size:14px; line-height:1.5; color:var(--color-neutral-700);')}>Precedent Transactions se reporta como contraste con peso 0%: la muestra LSEG/SDC es pequeña y heterogénea. Al cambiar un peso, el precio objetivo, el potencial y la recomendación se recalculan con el motor.</span>
          </aside></div>) : null}
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
