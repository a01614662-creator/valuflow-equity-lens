// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** 01 · ¿Cuánto vale la empresa? */
export function ValuePage({ vm }: { vm: VM }) {
  const { co, football, goP2, insights, kpis, openDrawerEV, openDrawerValue, r, track, ui, v, wf } = vm;
  return (<>
    {v.p1 ? (<>
      <section data-page data-screen-label="01 Valor" style={css('display:flex; flex-direction:column; gap:28px;')}>
        <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
          <div style={css('display:flex; flex-direction:column; gap:8px;')}>
            <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>01 · Valor</span>
            <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Cuánto vale {co.short}?</h1></div>
          <div style={css('display:flex; flex-wrap:wrap; gap:8px;')}>
            <span className="tag tag-outline">Modelo: {r.modelLabel}</span>
            <span className="tag tag-neutral">Valuación al {co.valDate}</span>
            <span className="tag tag-neutral">Precio al {co.priceDate}</span></div></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:7 1 600px; min-width:0; padding:32px; display:flex; flex-direction:column; gap:28px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;')}>
              <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Valor intrínseco por acción · {co.currency}</span>
              <div style={css('display:flex; gap:8px;')}>
                <span className="tag tag-accent">Resultado</span>
                <button className="btn btn-ghost" onClick={openDrawerValue} style={css('font-size:13px;')}>¿Cómo se calculó?</button></div></div>
            <div style={css('display:flex; align-items:flex-end; gap:20px; flex-wrap:wrap;')}>
              <span style={css('font-family:var(--font-heading); font-weight:600; font-size:clamp(88px, 11vw, 168px); line-height:.82; letter-spacing:-.03em; color:var(--color-accent);')}>{r.heroDisp}</span>
              <div style={css('display:flex; flex-direction:column; gap:6px; padding-bottom:10px;')}>
                <span style={css(`font-family:var(--font-heading); font-weight:600; font-size:34px; line-height:1; color:${r.upColor};`)}>{r.upside}</span>
                <span style={css('font-size:13px; color:var(--color-neutral-700);')}>vs. precio de mercado</span></div>
              {ui.busy ? (<>
                <span className="tag tag-neutral" style={css('margin-bottom:14px;')}>Actualizando valuación…</span>
              </>) : null}</div>
            <div style={css('display:flex; flex-direction:column; gap:10px;')}>
              <div style={css('position:relative; height:64px;')}>
                <div style={css('position:absolute; left:0; right:0; top:30px; height:1px; background:var(--color-divider);')}></div>
                {track.has52 ? (<>
                  <div title="Rango 52 semanas" style={css(`position:absolute; top:24px; height:13px; left:${track.lo52}; width:${track.w52}; background:var(--color-neutral-200);`)}></div>
                </>) : null}
                {track.hasCons ? (<>
                  <div style={css(`position:absolute; top:22px; left:${track.cons}; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center;`)}>
                    <span style={css('width:1px; height:17px; background:var(--color-neutral-600);')}></span>
                    <span style={css('font-size:11px; color:var(--color-neutral-700); white-space:nowrap; margin-top:4px;')}>Consenso {track.consTxt}</span></div>
                </>) : null}
                <div style={css(`position:absolute; top:30px; height:2px; margin-top:-1px; left:${track.segL}; width:${track.segW}; background:${r.upColor}; transition:all .8s cubic-bezier(.2,.7,.2,1);`)}></div>
                <div style={css(`position:absolute; top:0; left:${track.price}; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:4px; transition:left .8s cubic-bezier(.2,.7,.2,1);`)}>
                  <span style={css('font-size:11px; white-space:nowrap; font-weight:600;')}>Precio {r.price}</span>
                  <span style={css('width:13px; height:13px; border:2px solid var(--color-text); background:var(--color-bg); transform:rotate(45deg);')}></span></div>
                <div style={css(`position:absolute; top:22px; left:${track.value}; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:4px; transition:left .8s cubic-bezier(.2,.7,.2,1);`)}>
                  <span style={css('width:16px; height:16px; background:var(--color-accent); border-radius:50%; box-shadow:0 0 0 4px var(--color-accent-200);')}></span>
                  <span style={css('font-size:11px; white-space:nowrap; font-weight:600; color:var(--color-accent-700);')}>Valor {r.value}</span></div></div>
              <div style={css('display:flex; justify-content:space-between; font-size:11px; color:var(--color-neutral-700);')}>
                <span>{track.minTxt}</span>
                <span>Banda gris: rango de 52 semanas</span>
                <span>{track.maxTxt}</span></div></div>
            <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); border-top:1px solid var(--color-divider);')}>
              <div style={css('padding:16px 16px 0 0; display:flex; flex-direction:column; gap:4px;')}>
                <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-neutral-700);')}>Precio de mercado · Dato</span>
                <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600;')}>{r.price}</span>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Cierre al {co.priceDate}</span></div>
              <div style={css('padding:16px 16px 0; border-left:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
                <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-neutral-700);')}>Diferencia por acción</span>
                <span style={css(`font-family:var(--font-heading); font-size:30px; font-weight:600; color:${r.upColor};`)}>{r.diff}</span>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Valor − precio</span></div>
              <div style={css('padding:16px 0 0 16px; border-left:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
                <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-neutral-700);')}>Lectura del modelo</span>
                <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600;')}>{r.signal}</span>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Umbral ±{r.threshold} · académico</span></div></div></div>
          <div style={css('flex:5 1 380px; min-width:0; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:0; border:1px solid var(--color-divider); align-content:stretch;')}>
            {(kpis || []).map((k: any, $i: number) => (<Fragment key={$i}>
              <button className={cx(hv('background:var(--color-accent-100);'))} onClick={k.onClick} style={css('text-align:left; background:none; border:0; border-right:1px solid var(--color-divider); border-bottom:1px solid var(--color-divider); padding:20px; display:flex; flex-direction:column; gap:6px; cursor:pointer; color:var(--color-text); transition:background .2s;')}>
                <span style={css('display:flex; justify-content:space-between; gap:8px; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-neutral-700);')}>
                  <span>{k.label}</span>
                  <span style={css('color:var(--color-accent-700);')}>{k.kind}</span></span>
                <span style={css('font-family:var(--font-heading); font-size:34px; font-weight:600; line-height:1;')}>{k.value}
                  <span style={css('font-size:15px; margin-left:4px; color:var(--color-neutral-700);')}>{k.unit}</span></span>
                <span style={css('font-size:12px; line-height:1.4; color:var(--color-neutral-700);')}>{k.desc}</span></button>
            </Fragment>))}</div></div>
        <div className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:20px;')}>
          <i className="corner tl"></i>
          <i className="corner tr"></i>
          <i className="corner bl"></i>
          <i className="corner br"></i>
          <div style={css('display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-end;')}>
            <div>
              <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Métodos de valuación</div>
              <h3 style={css('margin:4px 0 0; font-size:28px;')}>¿Qué dicen los distintos métodos?</h3></div>
            <span style={css('font-size:13px; color:var(--color-neutral-700); max-width:520px;')}>Barras: rango con WACC ±0.5 pp y g ±0.5 pp (múltiplo ±0.5x). Línea vertical: precio de mercado. {co.currency} por acción.</span></div>
          <div style={css('display:flex; flex-direction:column;')}>
            {(football.rows || []).map((f: any, $i: number) => (<Fragment key={$i}>
              <div style={css('display:flex; flex-wrap:wrap; align-items:center; gap:8px 20px; padding:10px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent);')}>
                <div style={css('flex:0 0 240px; display:flex; flex-direction:column;')}>
                  <span style={css(`font-weight:${f.weight}; font-size:15px;`)}>{f.label}</span>
                  <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{f.sub}</span></div>
                <div style={css('flex:1 1 300px; position:relative; height:28px;')}>
                  <div style={css(`position:absolute; top:-10px; bottom:-10px; left:${football.priceLeft}; width:0; border-left:1px dashed var(--color-text); opacity:.55;`)}></div>
                  {f.hasBar ? (<>
                    <div style={css(`position:absolute; top:7px; height:14px; left:${f.barLeft}; width:${f.barWidth}; background:${f.barBg}; transition:all .8s cubic-bezier(.2,.7,.2,1) ${f.delay};`)}></div>
                  </>) : null}
                  {f.hasDot ? (<>
                    <div style={css(`position:absolute; top:4px; left:${f.dotLeft}; width:20px; height:20px; margin-left:-10px; background:${f.dotBg}; border:2px solid var(--color-bg); transform:rotate(45deg); transition:left .8s cubic-bezier(.2,.7,.2,1);`)}></div>
                  </>) : null}</div>
                <div style={css('flex:0 0 150px; text-align:right; display:flex; flex-direction:column;')}>
                  <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${f.color};`)}>{f.valueTxt}</span>
                  <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{f.rangeTxt}</span></div></div>
            </Fragment>))}
            <div style={css('display:flex; gap:20px; padding-top:12px; font-size:12px; color:var(--color-neutral-700); flex-wrap:wrap;')}>
              <span>Precio de mercado {r.price} (línea punteada)</span>
              <span>{football.scaleTxt}</span></div></div></div>
        <div className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:20px;')}>
          <i className="corner tl"></i>
          <i className="corner tr"></i>
          <i className="corner bl"></i>
          <i className="corner br"></i>
          <div style={css('display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-end;')}>
            <div>
              <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Puente de valuación · {co.units}</div>
              <h3 style={css('margin:4px 0 0; font-size:28px;')}>¿De dónde sale el Equity Value?</h3></div>
            <button className="btn btn-ghost" onClick={openDrawerEV}>Ver cálculo</button></div>
          <div style={css('overflow-x:auto;')}>
            <div style={css(`display:flex; align-items:stretch; gap:8px; min-width:${wf.minW}; height:340px; padding-top:8px;`)}>
              {(wf.steps || []).map((s: any, $i: number) => (<Fragment key={$i}>
                <div style={css('flex:1 1 0; min-width:64px; display:flex; flex-direction:column; gap:8px;')}>
                  <div style={css('flex:1; position:relative; border-bottom:1px solid var(--color-text);')}>
                    <div style={css(`position:absolute; left:10%; right:10%; bottom:${s.bottom}; height:${s.height}; background:${s.bg}; border:${s.border}; transition:height .9s cubic-bezier(.2,.7,.2,1) ${s.delay}, bottom .9s cubic-bezier(.2,.7,.2,1) ${s.delay};`)}></div>
                    <div style={css(`position:absolute; left:0; right:0; bottom:${s.labelBottom}; text-align:center; font-family:var(--font-heading); font-size:15px; font-weight:600; color:${s.color}; transition:bottom .9s cubic-bezier(.2,.7,.2,1) ${s.delay}, opacity .6s; opacity:${s.op}; padding-bottom:4px;`)}>{s.valTxt}</div></div>
                  <div style={css('height:44px; font-size:12px; line-height:1.25; text-align:center; color:var(--color-neutral-800); text-wrap:balance;')}>{s.label}</div></div>
              </Fragment>))}</div></div>
          <div style={css('display:flex; gap:20px; flex-wrap:wrap; font-size:12px; color:var(--color-neutral-700);')}>
            <span style={css('display:flex; gap:6px; align-items:center;')}>
              <span style={css('width:12px; height:12px; background:var(--color-accent);')}></span>Total</span>
            <span style={css('display:flex; gap:6px; align-items:center;')}>
              <span style={css('width:12px; height:12px; background:var(--color-accent-300);')}></span>Suma</span>
            <span style={css('display:flex; gap:6px; align-items:center;')}>
              <span style={css('width:12px; height:12px; background:color-mix(in srgb, var(--neg) 70%, white);')}></span>Resta</span>
            <span>{wf.note}</span></div></div>
        <div style={css('display:flex; flex-direction:column; gap:14px;')}>
          <div style={css('display:flex; align-items:baseline; gap:12px;')}>
            <h3 style={css('margin:0; font-size:28px;')}>Lectura rápida</h3>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Derivada automáticamente del modelo</span></div>
          <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0; border-top:1px solid var(--color-divider); border-left:1px solid var(--color-divider);')}>
            {(insights || []).map((i: any, $i: number) => (<Fragment key={$i}>
              <div style={css(`padding:20px; border-right:1px solid var(--color-divider); border-bottom:1px solid var(--color-divider); display:flex; flex-direction:column; gap:8px; opacity:${i.op}; transform:${i.tr}; transition:all .6s cubic-bezier(.2,.7,.2,1) ${i.delay};`)}>
                <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-accent-700);')}>{i.k}</span>
                <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600; line-height:1;')}>{i.v}</span>
                <span style={css('font-size:14px; line-height:1.45; color:var(--color-neutral-800); text-wrap:pretty;')}>{i.t}</span></div>
            </Fragment>))}</div>
          <div style={css('display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; padding-top:8px;')}>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>El valor intrínseco es una estimación dependiente de los supuestos utilizados. Uso académico; no constituye recomendación de inversión.</span>
            <button className="btn btn-primary blueprint" onClick={goP2}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>02 · ¿Cuánto efectivo genera? →</button></div></div></section>
    </>) : null}
  </>);
}
