// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** 02 · ¿Cuánto efectivo genera? */
export function FlowsPage({ vm }: { vm: VM }) {
  const { co, extCount, extNet, extTop, fcfChart, fcfSel, goAnnexMethod, goP3, hasMethod, methodSteps, sales, tv, v, weights } = vm;
  return (<>
    {v.p2 ? (<>
      <section data-page data-screen-label="02 Flujos" style={css('display:flex; flex-direction:column; gap:28px;')}>
        <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
          <div style={css('display:flex; flex-direction:column; gap:8px;')}>
            <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>02 · Flujos</span>
            <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Cuánto efectivo genera?</h1></div>
          <span style={css('font-size:14px; color:var(--color-neutral-700); max-width:520px;')}>FCFF = EBIT × (1 − t) + D&amp;A − Capex − ΔNWC. {co.units}. A = actual, E = estimado.</span></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:7 1 600px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:18px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; align-items:flex-end; gap:12px; flex-wrap:wrap;')}>
              <div>
                <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Flujo libre de efectivo · {co.units}</div>
                <h3 style={css('margin:4px 0 0; font-size:26px;')}>FCF proyectado y su valor presente</h3></div>
              <div style={css('display:flex; gap:16px; font-size:12px; color:var(--color-neutral-700);')}>
                <span style={css('display:flex; gap:6px; align-items:center;')}>
                  <span style={css('width:12px; height:12px; background:var(--color-accent-300);')}></span>FCF</span>
                <span style={css('display:flex; gap:6px; align-items:center;')}>
                  <span style={css('width:12px; height:12px; background:var(--color-accent);')}></span>Valor presente</span>
                <span style={css('display:flex; gap:6px; align-items:center;')}>
                  <span style={css('width:12px; height:12px; border:1px dashed var(--color-neutral-600);')}></span>Actual</span></div></div>
            <div style={css('display:flex; gap:10px; height:300px; align-items:stretch;')}>
              {(fcfChart.cols || []).map((c: any, $i: number) => (<Fragment key={$i}>
                <button className={cx(hv('background:var(--color-accent-100);'))} onClick={c.onClick} style={css(`flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:8px; background:${c.bg}; border:0; padding:6px 4px 0; cursor:pointer; color:var(--color-text); transition:background .2s;`)}>
                  <span style={css('flex:1; width:100%; position:relative; border-bottom:1px solid var(--color-text);')}>
                    <span style={css(`position:absolute; left:14%; right:14%; bottom:0; height:${c.hF}; background:${c.fBg}; border:${c.fBorder}; transition:height .9s cubic-bezier(.2,.7,.2,1) ${c.delay};`)}></span>
                    <span style={css(`position:absolute; left:30%; right:30%; bottom:0; height:${c.hP}; background:var(--color-accent); transition:height .9s cubic-bezier(.2,.7,.2,1) ${c.delay2};`)}></span>
                    <span style={css(`position:absolute; left:0; right:0; bottom:${c.hF}; padding-bottom:6px; text-align:center; font-family:var(--font-heading); font-size:16px; font-weight:600; transition:bottom .9s cubic-bezier(.2,.7,.2,1) ${c.delay};`)}>{c.fcfTxt}</span></span>
                  <span style={css('display:flex; flex-direction:column; align-items:center; padding-bottom:8px;')}>
                    <span style={css(`font-family:var(--font-heading); font-size:16px; font-weight:${c.weight};`)}>{c.label}</span>
                    <span style={css('font-size:11px; color:var(--color-neutral-700);')}>VP {c.pvTxt}</span></span></button>
              </Fragment>))}</div>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{fcfChart.note}</span></div>
          <div className="blueprint" style={css('flex:5 1 380px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:16px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div>
              <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Construcción del FCF · {fcfSel.year}</div>
              <h3 style={css('margin:4px 0 0; font-size:26px;')}>De EBIT a flujo libre</h3></div>
            <div style={css('display:flex; flex-direction:column; gap:10px;')}>
              {(fcfSel.items || []).map((it: any, $i: number) => (<Fragment key={$i}>
                <div style={css('display:grid; grid-template-columns:120px minmax(0,1fr) 84px; align-items:center; gap:10px;')}>
                  <span style={css(`font-size:13px; font-weight:${it.weight};`)}>{it.label}</span>
                  <span style={css('position:relative; height:22px;')}>
                    <span style={css(`position:absolute; top:3px; bottom:3px; left:${it.left}; width:${it.width}; background:${it.bg}; transition:all .7s cubic-bezier(.2,.7,.2,1);`)}></span></span>
                  <span style={css(`text-align:right; font-family:var(--font-heading); font-size:17px; font-weight:600; color:${it.color};`)}>{it.valTxt}</span></div>
              </Fragment>))}</div>
            <span style={css('font-size:12px; color:var(--color-neutral-700); line-height:1.5;')}>Selecciona un año en la gráfica para ver su construcción. Tasa de impuestos sobre EBIT {fcfSel.tax} · margen EBIT {fcfSel.margin} · crecimiento de ventas {fcfSel.growth}.</span></div></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:7 1 600px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:16px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
              <div>
                <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Ventas · {co.units}</div>
                <h3 style={css('margin:4px 0 0; font-size:26px;')}>¿Cómo se proyectaron las ventas?</h3></div>
              <div style={css('display:flex; gap:14px; flex-wrap:wrap;')}>
                {(sales.legend || []).map((l: any, $i: number) => (<Fragment key={$i}>
                  <span style={css('display:flex; gap:6px; align-items:center; font-size:12px; color:var(--color-neutral-800);')}>
                    <span style={css(`width:18px; height:0; border-top:2px ${l.dash} ${l.color};`)}></span>{l.label}</span>
                </Fragment>))}</div></div>
            <svg viewBox="0 0 640 280" style={css('width:100%; height:auto; overflow:visible;')} role="img" aria-label="Trayectorias de ventas">
              {(sales.yl || []).map((y: any, $i: number) => (<Fragment key={$i}>
                <line x1="56" x2="628" y1={y.y} y2={y.y} stroke="currentColor" strokeOpacity=".1"></line>
                <text x="48" y={y.ty} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity=".65">{y.t}</text>
              </Fragment>))}
              <line x1={sales.splitX} x2={sales.splitX} y1="12" y2="248" stroke="currentColor" strokeOpacity=".35" strokeDasharray="3 4"></line>
              <text x={sales.splitTx} y="20" fontSize="11" fill="currentColor" fillOpacity=".65">Proyección →</text>
              {(sales.paths || []).map((p: any, $i: number) => (<Fragment key={$i}>
                <path d={p.d} fill="none" stroke={p.color} strokeWidth={p.w} strokeDasharray={p.dash} pathLength="1000" style={css(`stroke-dashoffset:${p.off}; transition:stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1);`)}></path>
              </Fragment>))}
              {(sales.dots || []).map((d: any, $i: number) => (<Fragment key={$i}>
                <circle cx={d.x} cy={d.y} r="4" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2"></circle>
                <text x={d.x} y={d.ty} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">{d.t}</text>
              </Fragment>))}
              {(sales.xl || []).map((x: any, $i: number) => (<Fragment key={$i}>
                <text x={x.x} y="270" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight={x.fw}>{x.t}</text>
              </Fragment>))}</svg>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{sales.note}</span></div>
          <div style={css('flex:5 1 380px; min-width:0; display:flex; flex-direction:column; gap:0; border:1px solid var(--color-divider);')}>
            {(methodSteps || []).map((m: any, $i: number) => (<Fragment key={$i}>
              <div style={css('padding:22px; border-bottom:1px solid var(--color-divider); display:flex; gap:16px;')}>
                <span style={css('font-family:var(--font-heading); font-size:40px; font-weight:600; line-height:.9; color:var(--color-accent-300);')}>{m.n}</span>
                <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                  <span style={css('font-family:var(--font-heading); font-size:20px; font-weight:600;')}>{m.title}</span>
                  <span style={css('font-size:14px; line-height:1.45; color:var(--color-neutral-800);')}>{m.text}</span>
                  <span style={css('font-size:12px; color:var(--color-accent-700);')}>{m.meta}</span></div></div>
            </Fragment>))}
            <button className="btn btn-ghost" onClick={goAnnexMethod} style={css('margin:12px 16px; align-self:flex-start;')}>Ver mínimos cuadrados y variables externas →</button></div></div>
        {hasMethod ? (<>
          <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
            <div className="blueprint" style={css('flex:5 1 380px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:16px;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div>
                <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Ponderación de métodos</div>
                <h3 style={css('margin:4px 0 0; font-size:24px;')}>Peso de cada método por año</h3></div>
              <div style={css('display:flex; flex-direction:column; gap:10px;')}>
                {(weights || []).map((w: any, $i: number) => (<Fragment key={$i}>
                  <div style={css('display:grid; grid-template-columns:52px minmax(0,1fr); gap:12px; align-items:center;')}>
                    <span style={css('font-family:var(--font-heading); font-size:16px; font-weight:600;')}>{w.year}</span>
                    <span style={css('display:flex; height:26px; font-size:12px; font-weight:600;')}>
                      <span style={css(`width:${w.ext}; background:var(--color-accent); color:var(--color-bg); display:flex; align-items:center; padding-left:8px; transition:width .9s cubic-bezier(.2,.7,.2,1) ${w.delay};`)}>{w.extTxt}</span>
                      <span style={css('flex:1; background:var(--color-accent-200); color:var(--color-accent-800); display:flex; align-items:center; justify-content:flex-end; padding-right:8px;')}>{w.lsTxt}</span></span></div>
                </Fragment>))}</div>
              <div style={css('display:flex; gap:16px; font-size:12px; color:var(--color-neutral-700);')}>
                <span style={css('display:flex; gap:6px; align-items:center;')}>
                  <span style={css('width:12px; height:12px; background:var(--color-accent);')}></span>Variables externas</span>
                <span style={css('display:flex; gap:6px; align-items:center;')}>
                  <span style={css('width:12px; height:12px; background:var(--color-accent-200);')}></span>Mínimos cuadrados</span></div></div>
            <div className="blueprint" style={css('flex:7 1 600px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:16px;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
                <div>
                  <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{extCount} variables externas</div>
                  <h3 style={css('margin:4px 0 0; font-size:24px;')}>Ajuste a la proyección de ventas</h3></div>
                <div style={css('display:flex; gap:20px;')}>
                  {(extNet || []).map((e: any, $i: number) => (<Fragment key={$i}>
                    <div style={css('display:flex; flex-direction:column; align-items:flex-end;')}>
                      <span style={css('font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--color-neutral-700);')}>{e.k}</span>
                      <span style={css(`font-family:var(--font-heading); font-size:24px; font-weight:600; color:${e.color};`)}>{e.v}</span></div>
                  </Fragment>))}</div></div>
              <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                {(extTop || []).map((x: any, $i: number) => (<Fragment key={$i}>
                  <div style={css('display:grid; grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) 60px; gap:12px; align-items:center; padding:4px 0; border-bottom:1px solid color-mix(in srgb, var(--color-text) 7%, transparent);')}>
                    <span style={css('display:flex; flex-direction:column;')}>
                      <span style={css('font-size:14px; font-weight:500;')}>{x.name}</span>
                      <span style={css('font-size:11px; color:var(--color-neutral-700);')}>{x.cat}</span></span>
                    <span style={css('position:relative; height:16px;')}>
                      <span style={css('position:absolute; left:50%; top:-4px; bottom:-4px; width:1px; background:var(--color-divider);')}></span>
                      <span style={css(`position:absolute; top:3px; height:10px; left:${x.left}; width:${x.width}; background:${x.color}; transition:all .8s cubic-bezier(.2,.7,.2,1);`)}></span></span>
                    <span style={css(`text-align:right; font-family:var(--font-heading); font-size:16px; font-weight:600; color:${x.color};`)}>{x.v}</span></div>
                </Fragment>))}</div></div></div>
        </>) : null}
        <div className="blueprint" style={css('padding:28px; display:flex; flex-wrap:wrap; gap:28px; align-items:center;')}>
          <i className="corner tl"></i>
          <i className="corner tr"></i>
          <i className="corner bl"></i>
          <i className="corner br"></i>
          <div style={css('flex:1 1 320px; display:flex; flex-direction:column; gap:10px;')}>
            <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Valor terminal · Gordon</div>
            <h3 style={css('margin:0; font-size:26px;')}>Lo que vale la empresa después de {tv.lastYear}</h3>
            <span style={css('font-size:14px; line-height:1.5; color:var(--color-neutral-800);')}>Es el valor presente de todos los flujos posteriores al periodo explícito, suponiendo que crecen a una tasa constante g para siempre.</span></div>
          <div style={css('flex:2 1 520px; display:flex; flex-wrap:wrap; align-items:center; gap:10px; font-family:var(--font-heading);')}>
            <div style={css('display:flex; flex-direction:column; padding:12px 16px; border:1px solid var(--color-divider);')}>
              <span style={css('font-family:var(--font-body); font-size:11px; color:var(--color-neutral-700);')}>FCF {tv.lastYear}</span>
              <span style={css('font-size:24px; font-weight:600;')}>{tv.fcfN}</span></div>
            <span style={css('font-size:22px;')}>× (1 +{' '}</span>
            <div style={css('display:flex; flex-direction:column; padding:12px 16px; border:1px solid var(--color-divider);')}>
              <span style={css('font-family:var(--font-body); font-size:11px; color:var(--color-neutral-700);')}>g</span>
              <span style={css('font-size:24px; font-weight:600;')}>{tv.g}</span></div>
            <span style={css('font-size:22px;')}>) ÷ (</span>
            <div style={css('display:flex; flex-direction:column; padding:12px 16px; border:1px solid var(--color-divider);')}>
              <span style={css('font-family:var(--font-body); font-size:11px; color:var(--color-neutral-700);')}>WACC − g</span>
              <span style={css('font-size:24px; font-weight:600;')}>{tv.denom}</span></div>
            <span style={css('font-size:22px;')}>) =</span>
            <div style={css('display:flex; flex-direction:column; padding:12px 16px; background:var(--color-accent); color:var(--color-bg);')}>
              <span style={css('font-family:var(--font-body); font-size:11px; opacity:.85;')}>Valor terminal</span>
              <span style={css('font-size:24px; font-weight:600;')}>{tv.tv}</span></div>
            <span style={css('font-size:22px;')}>→ VP</span>
            <div style={css('display:flex; flex-direction:column; padding:12px 16px; border:1px solid var(--color-accent);')}>
              <span style={css('font-family:var(--font-body); font-size:11px; color:var(--color-neutral-700);')}>Valor presente</span>
              <span style={css('font-size:24px; font-weight:600; color:var(--color-accent);')}>{tv.pv}</span></div></div>
          <div style={css('flex:1 1 100%; display:flex; flex-direction:column; gap:8px;')}>
            <div style={css('display:flex; height:34px; font-size:13px; font-weight:600;')}>
              <span style={css(`width:${tv.wExp}; background:var(--color-accent-200); color:var(--color-accent-800); display:flex; align-items:center; padding:0 10px; white-space:nowrap; transition:width 1s cubic-bezier(.2,.7,.2,1);`)}>Flujos explícitos {tv.expTxt}</span>
              <span style={css('flex:1; background:var(--color-accent); color:var(--color-bg); display:flex; align-items:center; justify-content:flex-end; padding:0 10px; white-space:nowrap;')}>Valor terminal {tv.tvTxt}</span></div>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Peso del valor terminal en el EV (método Gordon). Una proporción alta implica que el resultado depende materialmente de WACC y g.</span></div>
          <div style={css('flex:1 1 100%; display:flex; justify-content:flex-end;')}>
            <button className="btn btn-primary blueprint" onClick={goP3}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>03 · ¿Qué tan estable es el valor? →</button></div></div></section>
    </>) : null}
  </>);
}
