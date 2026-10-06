// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** Laboratorio: editar supuestos. */
export function LabPage({ vm }: { vm: VM }) {
  const { co, goP1, lab, r, resetA, scen, ui, v } = vm;
  return (<>
    {v.lab ? (<>
      <section data-screen-label="04 Laboratorio" style={css('display:flex; flex-direction:column; gap:28px;')}>
        <div style={css('display:flex; flex-wrap:wrap; gap:16px 32px; align-items:flex-end; justify-content:space-between;')}>
          <div style={css('display:flex; flex-direction:column; gap:8px;')}>
            <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>Laboratorio · Editar modelo</span>
            <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Qué pasa si cambian los supuestos?</h1></div>
          <button className="btn btn-secondary" onClick={resetA}>Restaurar valores base</button></div>
        <div className="blueprint" style={css('padding:12px 16px; display:flex; gap:10px; align-items:center; font-size:14px; border-color:var(--color-accent-300);')}>
          <i className="corner tl"></i>
          <i className="corner tr"></i>
          <i className="corner bl"></i>
          <i className="corner br"></i>
          <span style={css('color:var(--color-accent); font-weight:700;')}>i</span>Modificar un supuesto actualiza todos los resultados: FCF, valor terminal, EV, Equity, valor por acción, sensibilidad y escenarios. Los cambios se guardan en esta sesión para {co.short}.</div>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:flex-start;')}>
          <div style={css('flex:7 1 600px; min-width:0; display:flex; flex-direction:column; gap:20px;')}>
            <div style={css('display:flex; flex-wrap:wrap; gap:20px;')}>
              {lab.hasAlt ? (<>
                <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                  <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Proyección</span>
                  <div className="seg">
                    {(lab.fcOpts || []).map((o: any, $i: number) => (<Fragment key={$i}>
                      <button onClick={o.onClick} style={css(`padding:8px 14px; border:0; border-right:1px solid var(--color-divider); background:${o.bg}; color:${o.color}; cursor:pointer; font-size:13px;`)}>{o.t}</button>
                    </Fragment>))}</div></div>
              </>) : null}
              <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Método de WACC</span>
                <div className="seg">
                  {(lab.waccOpts || []).map((o: any, $i: number) => (<Fragment key={$i}>
                    <button onClick={o.onClick} style={css(`padding:8px 14px; border:0; border-right:1px solid var(--color-divider); background:${o.bg}; color:${o.color}; cursor:pointer; font-size:13px;`)}>{o.t}</button>
                  </Fragment>))}</div></div>
              <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Escenario rápido</span>
                <div className="seg">
                  {(lab.scenOpts || []).map((o: any, $i: number) => (<Fragment key={$i}>
                    <button onClick={o.onClick} style={css('padding:8px 14px; border:0; border-right:1px solid var(--color-divider); background:none; color:var(--color-text); cursor:pointer; font-size:13px;')}>{o.t}</button>
                  </Fragment>))}</div></div></div>
            {(lab.groups || []).map((gr: any, $i: number) => (<Fragment key={$i}>
              <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:18px;')}>
                <i className="corner tl"></i>
                <i className="corner tr"></i>
                <i className="corner bl"></i>
                <i className="corner br"></i>
                <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
                  <h3 style={css('margin:0; font-size:22px;')}>{gr.title}</h3>
                  <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{gr.desc}</span></div>
                <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px 28px;')}>
                  {(gr.controls || []).map((c: any, $i: number) => (<Fragment key={$i}>
                    <label style={css('display:flex; flex-direction:column; gap:6px;')}>
                      <span style={css('display:flex; justify-content:space-between; align-items:baseline; gap:8px;')}>
                        <span style={css('font-size:14px; font-weight:500;')}>{c.label}{' '}
                          <span style={css('color:var(--color-accent);')}>{c.dot}</span></span>
                        <span style={css('font-family:var(--font-heading); font-size:22px; font-weight:600;')}>{c.valTxt}</span></span>
                      <input type="range" min={c.min} max={c.max} step={c.step} value={c.value} onChange={c.onChange} aria-label={c.label} />
                      <span style={css('display:flex; justify-content:space-between; gap:8px; font-size:11px; color:var(--color-neutral-700);')}>
                        <span>{c.impact}</span>
                        <span className="tag tag-neutral" style={css('padding:1px 6px; font-size:10px;')}>{c.source}</span></span></label>
                  </Fragment>))}</div></div>
            </Fragment>))}
            <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:14px;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;')}>
                <h3 style={css('margin:0; font-size:22px;')}>Mercado</h3>
                <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Datos de entrada · afectan el upside y el WACC de mercado</span></div>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px;')}>
                <div className="field">
                  <label>Precio actual ({co.currency})</label>
                  <input className="input" type="number" step="0.01" value={lab.price} onChange={lab.onPrice} /></div>
                <div className="field">
                  <label>Acciones en circulación (millones)</label>
                  <input className="input" type="number" step="0.1" value={lab.shares} onChange={lab.onShares} /></div></div></div></div>
          <div style={css('flex:4 1 340px; min-width:0; position:sticky; top:88px;')}>
            <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:16px; background:var(--color-bg);')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('display:flex; justify-content:space-between; align-items:center;')}>
                <span style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>Resultado en vivo</span>
                {ui.busy ? (<>
                  <span className="tag tag-neutral">Actualizando valuación…</span>
                </>) : null}</div>
              <span style={css('font-family:var(--font-heading); font-size:84px; font-weight:600; line-height:.85; color:var(--color-accent);')}>{r.heroDisp}</span>
              <div style={css('display:flex; gap:16px; flex-wrap:wrap; align-items:baseline;')}>
                <span style={css(`font-family:var(--font-heading); font-size:26px; font-weight:600; color:${r.upColor};`)}>{r.upside}</span>
                <span style={css('font-size:13px; color:var(--color-neutral-700);')}>vs. precio {r.price}</span></div>
              <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Cambio vs. base:{' '}
                <strong style={css(`color:${lab.deltaColor};`)}>{lab.delta}</strong></span>
              <div style={css('display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); border-top:1px solid var(--color-divider);')}>
                {(lab.stats || []).map((s: any, $i: number) => (<Fragment key={$i}>
                  <div style={css('padding:12px 8px 4px 0; display:flex; flex-direction:column;')}>
                    <span style={css('font-size:11px; color:var(--color-neutral-700);')}>{s.k}</span>
                    <span style={css('font-family:var(--font-heading); font-size:22px; font-weight:600;')}>{s.v}</span></div>
                </Fragment>))}</div>
              <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                {(scen || []).map((s: any, $i: number) => (<Fragment key={$i}>
                  <div style={css('display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent);')}>
                    <span>{s.label}</span>
                    <strong style={css('font-family:var(--font-heading); font-size:17px;')}>{s.valTxt}</strong></div>
                </Fragment>))}</div>
              <button className="btn btn-secondary" onClick={goP1}>Ver en el dashboard</button></div></div></div></section>
    </>) : null}
  </>);
}
