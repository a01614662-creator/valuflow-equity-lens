// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';
import { TableCard } from '../components/TableCard';

/** 03 · Costo de capital y sensibilidad. */
export function RiskPage({ vm }: { vm: VM }) {
  const { betaT, co, goAnnexBeta, goLab, goAnnexInfl, hasBeta, hasScen, heat, iter, openDrawerWacc, r, scen, scenNote, torn, v, wb } = vm;
  return (<>
    {v.p3 ? (<>
      <section data-page data-screen-label="03 Riesgo" style={css('display:flex; flex-direction:column; gap:28px;')}>
        <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
          <div style={css('display:flex; flex-direction:column; gap:8px;')}>
            <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>03 · Costo de capital y sensibilidad</span>
            <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Qué tan estable es el valor?</h1></div>
          <span className="tag tag-outline">WACC: {wb.modeLabel}</span></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:7 1 620px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:22px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
              <div>
                <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>WACC · CAPM</div>
                <h3 style={css('margin:4px 0 0; font-size:26px;')}>¿Cuál es el costo de capital?</h3></div>
              <button className="btn btn-ghost" onClick={openDrawerWacc}>Ver cálculo</button></div>
            <div style={css('display:flex; flex-direction:column; gap:8px;')}>
              <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Costo del capital propio · Ke = Rf + βL × PRM</span>
              <div style={css('display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-family:var(--font-heading);')}>
                {(wb.keBlocks || []).map((b: any, $i: number) => (<Fragment key={$i}>
                  <div style={css(`display:flex; flex-direction:column; padding:10px 14px; min-width:96px; background:${b.bg}; color:${b.color}; border:1px solid ${b.border};`)}>
                    <span style={css('font-family:var(--font-body); font-size:11px; opacity:.8;')}>{b.k}</span>
                    <span style={css('font-size:26px; font-weight:600; line-height:1.05;')}>{b.v}</span>
                    <span style={css('font-family:var(--font-body); font-size:11px; opacity:.8;')}>{b.s}</span></div>
                  <span style={css('font-size:24px; color:var(--color-neutral-700);')}>{b.op}</span>
                </Fragment>))}</div></div>
            <div style={css('display:flex; flex-direction:column; gap:8px;')}>
              <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Costo de la deuda después de impuestos · Kd × (1 − t)</span>
              <div style={css('display:flex; flex-wrap:wrap; align-items:center; gap:8px; font-family:var(--font-heading);')}>
                {(wb.kdBlocks || []).map((b: any, $i: number) => (<Fragment key={$i}>
                  <div style={css(`display:flex; flex-direction:column; padding:10px 14px; min-width:96px; background:${b.bg}; color:${b.color}; border:1px solid ${b.border};`)}>
                    <span style={css('font-family:var(--font-body); font-size:11px; opacity:.8;')}>{b.k}</span>
                    <span style={css('font-size:26px; font-weight:600; line-height:1.05;')}>{b.v}</span>
                    <span style={css('font-family:var(--font-body); font-size:11px; opacity:.8;')}>{b.s}</span></div>
                  <span style={css('font-size:24px; color:var(--color-neutral-700);')}>{b.op}</span>
                </Fragment>))}</div></div>
            <div style={css('display:flex; flex-direction:column; gap:8px;')}>
              <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Estructura de capital · {wb.structLabel}</span>
              <div style={css('display:flex; height:40px; font-size:13px; font-weight:600;')}>
                <span style={css(`width:${wb.wEW}; background:var(--color-accent); color:var(--color-bg); display:flex; align-items:center; padding:0 12px; white-space:nowrap; transition:width .9s cubic-bezier(.2,.7,.2,1);`)}>Capital E/(D+E) {wb.wE} · Ke {wb.ke}</span>
                <span style={css('flex:1; background:var(--color-accent-200); color:var(--color-accent-800); display:flex; align-items:center; justify-content:flex-end; padding:0 12px; white-space:nowrap;')}>Deuda {wb.wD} · Kd(1−t) {wb.kdat}</span></div></div>
            <div style={css('display:flex; align-items:center; justify-content:space-between; gap:16px; padding-top:16px; border-top:1px solid var(--color-divider); flex-wrap:wrap;')}>
              <span style={css('font-size:14px; color:var(--color-neutral-800);')}>WACC = E/(D+E) × Ke + D/(D+E) × Kd(1−t)</span>
              <span style={css('font-family:var(--font-heading); font-size:52px; font-weight:600; line-height:1; color:var(--color-accent);')}>{wb.wacc}</span></div></div>
          <div className="blueprint" style={css('flex:5 1 380px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:14px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div>
              <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Iteración del WACC</div>
              <h3 style={css('margin:4px 0 0; font-size:24px;')}>Del valor de mercado al valor DCF</h3></div>
            <span style={css('font-size:13px; line-height:1.5; color:var(--color-neutral-800);')}>El equity que resulta del DCF redefine D/E, la beta apalancada y Ke; el proceso se repite hasta que el WACC deja de cambiar.</span>
            <svg viewBox="0 0 360 180" style={css('width:100%; height:auto; overflow:visible;')} role="img" aria-label="Convergencia del WACC">
              {(iter.yl || []).map((y: any, $i: number) => (<Fragment key={$i}>
                <line x1="44" x2="350" y1={y.y} y2={y.y} stroke="currentColor" strokeOpacity=".1"></line>
                <text x="38" y={y.ty} textAnchor="end" fontSize="10" fill="currentColor" fillOpacity=".65">{y.t}</text>
              </Fragment>))}
              <polyline points={iter.poly} fill="none" stroke="var(--color-accent)" strokeWidth="2"></polyline>
              {(iter.pts || []).map((p: any, $i: number) => (<Fragment key={$i}>
                <circle cx={p.x} cy={p.y} r="4" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2"></circle>
                <text x={p.x} y={p.ty} textAnchor="middle" fontSize="10" fill="currentColor">{p.t}</text>
                <text x={p.x} y="176" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity=".65">{p.k}</text>
              </Fragment>))}</svg>
            <div style={css('display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); border-top:1px solid var(--color-divider);')}>
              {(iter.stats || []).map((s: any, $i: number) => (<Fragment key={$i}>
                <div style={css('padding:12px 8px 0 0; display:flex; flex-direction:column;')}>
                  <span style={css('font-size:11px; color:var(--color-neutral-700);')}>{s.k}</span>
                  <span style={css('font-family:var(--font-heading); font-size:22px; font-weight:600;')}>{s.v}</span></div>
              </Fragment>))}</div></div></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px;')}>
          <div className="blueprint" style={css('flex:7 1 620px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:16px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
              <div>
                <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Sensibilidad · valor por acción ({co.currency})</div>
                <h3 style={css('margin:4px 0 0; font-size:26px;')}>WACC vs. crecimiento perpetuo</h3></div>
              <div style={css('display:flex; gap:8px; align-items:center; font-size:12px; color:var(--color-neutral-700);')}>Paso
                <div className="seg">
                  {(heat.steps || []).map((s: any, $i: number) => (<Fragment key={$i}>
                    <button onClick={s.onClick} style={css(`padding:6px 10px; border:0; border-left:1px solid var(--color-divider); background:${s.bg}; color:${s.color}; cursor:pointer; font-size:12px;`)}>{s.t}</button>
                  </Fragment>))}</div></div></div>
            <div style={css('overflow-x:auto;')}>
              <div style={css('display:grid; grid-template-columns:84px repeat(5, minmax(72px, 1fr)); min-width:480px;')}>
                <div style={css('padding:8px; font-size:11px; color:var(--color-neutral-700); display:flex; align-items:flex-end;')}>WACC ↓ · g →</div>
                {(heat.cols || []).map((c: any, $i: number) => (<Fragment key={$i}>
                  <div style={css('padding:8px; text-align:center; font-family:var(--font-heading); font-size:15px; font-weight:600; border-bottom:1px solid var(--color-text);')}>{c}</div>
                </Fragment>))}
                {(heat.rows || []).map((row: any, $i: number) => (<Fragment key={$i}>
                  <div style={css('padding:8px; font-family:var(--font-heading); font-size:15px; font-weight:600; display:flex; align-items:center; border-right:1px solid var(--color-text);')}>{row.head}</div>
                  {(row.cells || []).map((c: any, $i: number) => (<Fragment key={$i}>
                    <div style={css(`height:56px; display:grid; place-items:center; background:${c.bg}; outline:${c.outline}; outline-offset:-2px; font-family:var(--font-heading); font-size:19px; font-weight:${c.weight}; color:var(--color-text); transition:background .4s;`)}>{c.t}</div>
                  </Fragment>))}
                </Fragment>))}</div></div>
            <div style={css('display:flex; gap:18px; flex-wrap:wrap; font-size:12px; color:var(--color-neutral-700);')}>
              <span style={css('display:flex; gap:6px; align-items:center;')}>
                <span style={css('width:12px; height:12px; background:color-mix(in srgb, var(--pos) 30%, transparent);')}></span>Valor ≥ precio de mercado</span>
              <span style={css('display:flex; gap:6px; align-items:center;')}>
                <span style={css('width:12px; height:12px; background:color-mix(in srgb, var(--neg) 26%, transparent);')}></span>Valor &lt; precio de mercado</span>
              <span style={css('display:flex; gap:6px; align-items:center;')}>
                <span style={css('width:12px; height:12px; outline:2px solid var(--color-text);')}></span>Escenario base</span></div></div>
          <div className="blueprint" style={css('flex:5 1 380px; min-width:0; padding:28px; display:flex; flex-direction:column; gap:14px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div>
              <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Tornado · un factor a la vez</div>
              <h3 style={css('margin:4px 0 0; font-size:24px;')}>¿Qué supuesto mueve más el valor?</h3></div>
            <div style={css('display:flex; flex-direction:column; gap:10px;')}>
              {(torn.rows || []).map((t: any, $i: number) => (<Fragment key={$i}>
                <div style={css('display:flex; flex-direction:column; gap:4px;')}>
                  <div style={css('display:flex; justify-content:space-between; font-size:13px;')}>
                    <span style={css('font-weight:500;')}>{t.label}</span>
                    <span style={css('color:var(--color-neutral-700);')}>± {t.stepTxt} · rango {t.rangeTxt}</span></div>
                  <div style={css('position:relative; height:20px;')}>
                    <span style={css('position:absolute; left:50%; top:-3px; bottom:-3px; width:1px; background:var(--color-text);')}></span>
                    <span style={css(`position:absolute; top:2px; bottom:2px; right:50%; width:${t.lW}; background:color-mix(in srgb, var(--neg) 60%, white); transition:width .8s cubic-bezier(.2,.7,.2,1) ${t.delay};`)}></span>
                    <span style={css(`position:absolute; top:2px; bottom:2px; left:50%; width:${t.rW}; background:var(--color-accent); transition:width .8s cubic-bezier(.2,.7,.2,1) ${t.delay};`)}></span>
                    <span style={css(`position:absolute; right:calc(50% + ${t.lW} + 6px); top:1px; font-size:11px; font-weight:600;`)}>{t.lowTxt}</span>
                    <span style={css(`position:absolute; left:calc(50% + ${t.rW} + 6px); top:1px; font-size:11px; font-weight:600;`)}>{t.highTxt}</span></div></div>
              </Fragment>))}</div>
            <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Centro: valor base {r.value}. Rojo: dirección que reduce el valor; azul: dirección que lo aumenta.</span></div></div>
        {hasBeta ? (
          <div style={css('display:flex; flex-direction:column; gap:14px;')}>
            <div style={css('display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; justify-content:space-between;')}>
              <h3 style={css('margin:0; font-size:28px;')}>Beta del WACC: fuente, tratamiento e impacto</h3>
              <button className="btn btn-ghost" onClick={goAnnexBeta} style={css('font-size:13px;')}>Beta histórica y Kd →</button></div>
            {(betaT || []).slice(0, 3).map((t: any, $i: number) => (<Fragment key={$i}><TableCard t={t} /></Fragment>))}</div>
        ) : null}
        <div style={css('display:flex; flex-direction:column; gap:14px;')}>
          <div style={css('display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;')}>
            <h3 style={css('margin:0; font-size:28px;')}>Escenarios de inflación</h3>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{scenNote}</span></div>
          <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px;')}>
            {(scen || []).map((s: any, $i: number) => (<Fragment key={$i}>
              <div className="blueprint" style={css(`padding:24px; display:flex; flex-direction:column; gap:10px; background:${s.bg};`)}>
                <i className="corner tl"></i>
                <i className="corner tr"></i>
                <i className="corner bl"></i>
                <i className="corner br"></i>
                <span style={css('display:flex; justify-content:space-between; gap:8px; align-items:baseline;')}>
                  <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>{s.label}</span>
                  <span className="tag tag-neutral" style={css('font-size:10px; padding:1px 6px;')} title={s.source}>{s.kind}</span></span>
                <span style={css(`font-family:var(--font-heading); font-size:56px; font-weight:600; line-height:.95; color:${s.vColor};`)}>{s.valTxt}</span>
                <span style={css(`font-family:var(--font-heading); font-size:20px; font-weight:600; color:${s.upColor};`)}>{s.upTxt} vs. precio</span>
                <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{s.desc}</span>
                <button className="btn btn-ghost" onClick={s.onClick} disabled={!s.canUse} style={css('align-self:flex-start; font-size:13px; padding:4px 0;')}>{s.btnTxt}</button></div>
            </Fragment>))}</div>
          {hasScen ? (
            <button className="btn btn-ghost" onClick={goAnnexInfl} style={css('align-self:flex-start; font-size:13px;')}>Ver modelos y fuentes de la inflación →</button>
          ) : null}
          <div style={css('display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:center; padding-top:8px;')}>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Riesgos / sensibilidades del modelo: peso del valor terminal {r.tvWeight}; el WACC y la proyección de capex y margen concentran el rango de valor.</span>
            <button className="btn btn-primary blueprint" onClick={goLab}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>Modificar supuestos →</button></div></div></section>
    </>) : null}
  </>);
}
