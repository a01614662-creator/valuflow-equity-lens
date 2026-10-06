// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** Nueva valuación (asistente de importación). */
export function ImportPage({ vm }: { vm: VM }) {
  const { co, copyMarketParams, findLogo, imp, onDragOver, onDrop, onFile, onJsonFile, onLogoFile, startManual, v } = vm;
  return (<>
    {v.import ? (<>
      <section data-screen-label="Nueva valuación" style={css('display:flex; flex-direction:column; gap:24px; max-width:1080px; margin:0 auto; width:100%;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>Nueva valuación</span>
          <h1 style={css('margin:0; font-size:clamp(36px, 4.4vw, 56px); line-height:.95; text-transform:uppercase;')}>{imp.title}</h1></div>
        <div style={css('display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); border:1px solid var(--color-divider);')}>
          {(imp.steps || []).map((s: any, $i: number) => (<Fragment key={$i}>
            <div style={css(`padding:12px 14px; display:flex; gap:10px; align-items:center; border-right:1px solid var(--color-divider); background:${s.bg}; color:${s.color};`)}>
              <span style={css('font-family:var(--font-heading); font-size:22px; font-weight:600;')}>{s.n}</span>
              <span style={css('font-size:13px; font-weight:500;')}>{s.label}</span></div>
          </Fragment>))}</div>
        {imp.s1 ? (<>
          <label className="blueprint" onDragOver={onDragOver} onDrop={onDrop} style={css(`padding:64px 24px; display:flex; flex-direction:column; align-items:center; gap:14px; text-align:center; cursor:pointer; border-style:dashed; background:${imp.dropBg}; transition:background .2s;`)}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <path d="M14 2v6h6"></path>
              <path d="M12 18v-6"></path>
              <path d="m9 15 3-3 3 3"></path></svg>
            <span style={css('font-family:var(--font-heading); font-size:26px; font-weight:600;')}>Arrastra tu archivo aquí</span>
            <span style={css('font-size:14px; color:var(--color-neutral-700);')}>o{' '}
              <span style={css('color:var(--color-accent); text-decoration:underline;')}>selecciona un archivo</span>{' '}· XLS · XLSX · CSV</span>
            <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Compatible con exportaciones de plataformas financieras como Capital IQ (Income Statement, Balance Sheet, Cash Flow, Key Stats…).</span>
            <input type="file" accept=".xls,.xlsx,.csv" onChange={onFile} style={css('display:none;')} /></label>
          {imp.parsing ? (<>
            <span className="tag tag-neutral" style={css('align-self:flex-start;')}>Leyendo archivo…</span>
          </>) : null}
          {imp.hasError ? (<>
            <div style={css('padding:12px 16px; border:1px solid var(--neg); color:var(--neg); font-size:14px;')}>✕ {imp.error}</div>
          </>) : null}
          <div style={css('display:flex; gap:12px; flex-wrap:wrap;')}>
            <button className="btn btn-secondary" onClick={startManual}>Introducir datos manualmente</button>
            <label className="btn btn-ghost" style={css('cursor:pointer;')}>Importar dataset ValuFlow (.json)
              <input type="file" accept=".json" onChange={onJsonFile} style={css('display:none;')} /></label></div>
        </>) : null}
        {imp.s2 ? (<>
          <div style={css('display:flex; flex-wrap:wrap; gap:24px;')}>
            <div className="blueprint" style={css('flex:1 1 380px; padding:24px; display:flex; flex-direction:column; gap:10px;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Archivo detectado</div>
              {(imp.meta || []).map((m: any, $i: number) => (<Fragment key={$i}>
                <div style={css('display:flex; justify-content:space-between; gap:12px; padding:6px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent); font-size:14px;')}>
                  <span style={css('color:var(--color-neutral-700);')}>{m.k}</span>
                  <strong style={css('text-align:right;')}>{m.v}</strong></div>
              </Fragment>))}</div>
            <div className="blueprint" style={css('flex:1 1 380px; padding:24px; display:flex; flex-direction:column; gap:10px;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('display:flex; justify-content:space-between; align-items:flex-end;')}>
                <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Mapeo automático</div>
                <span style={css('font-family:var(--font-heading); font-size:48px; font-weight:600; line-height:.9; color:var(--color-accent);')}>{imp.coverage}</span></div>
              <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{imp.coverageTxt}</span>
              <div style={css('display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:4px 16px;')}>
                {(imp.sections || []).map((s: any, $i: number) => (<Fragment key={$i}>
                  <span style={css(`font-size:13px; color:${s.color};`)}>{s.icon} {s.name}</span>
                </Fragment>))}</div></div></div>
        </>) : null}
        {imp.s3 ? (<>
          <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:12px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <div>
              <h3 style={css('margin:0; font-size:24px;')}>Revisar datos antes de crear la valuación</h3>
              <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Corrige el campo de origen o el valor de cualquier concepto. Los campos marcados con * son necesarios para el DCF.</span></div>
            <div style={css('overflow-x:auto;')}>
              <table className="table" style={css('font-size:13px; min-width:860px;')}>
                <thead>
                  <tr>
                    <th>Campo interno</th>
                    <th>Campo de origen</th>
                    <th style={css('text-align:right;')}>Valor</th>
                    <th>Periodo</th>
                    <th>Confianza</th>
                    <th>Estado</th></tr></thead>
                <tbody>
                  {(imp.fields || []).map((f: any, $i: number) => (<Fragment key={$i}>
                    <tr>
                      <td style={css('font-weight:600;')}>{f.label}{f.reqMark}</td>
                      <td>
                        <select className="input" value={f.sel} onChange={f.onSel} style={css('min-height:30px; padding:4px 6px; font-size:12px; max-width:260px;')}>
                          <option value="-1">— Sin asignar —</option>
                          {(f.options || []).map((o: any, $i: number) => (<Fragment key={$i}>
                            <option value={o.id}>{o.label}</option>
                          </Fragment>))}</select></td>
                      <td style={css('text-align:right;')}>
                        <input className="input" type="number" value={f.value} onChange={f.onVal} style={css('min-height:30px; padding:4px 6px; font-size:13px; width:130px; text-align:right;')} /></td>
                      <td>{f.period}</td>
                      <td>
                        <span className={cx(`tag ${f.confCls}`)}>{f.conf}</span></td>
                      <td style={css(`color:${f.stColor}; font-weight:600;`)}>{f.st}</td></tr>
                  </Fragment>))}</tbody></table></div></div>
        </>) : null}
        {imp.s4 ? (<>
          <div style={css('display:flex; flex-wrap:wrap; gap:24px; align-items:flex-start;')}>
            <div className="blueprint" style={css('flex:1 1 420px; padding:24px; display:flex; flex-direction:column; gap:14px;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <h3 style={css('margin:0; font-size:22px;')}>Identidad de la empresa</h3>
              <div style={css('display:flex; gap:16px; align-items:center; padding:12px; border:1px solid var(--color-divider);')}>
                <span style={css('width:120px; height:56px; display:grid; place-items:center;')}>
                  {imp.hasLogo ? (<>
                    <img src={imp.logo} alt="Logo" style={css('max-width:120px; max-height:56px; object-fit:contain;')} />
                  </>) : null}
                  {imp.noLogo ? (<>
                    <span style={css('font-family:var(--font-heading); font-size:26px; font-weight:600; color:var(--color-neutral-600);')}>{imp.initials}</span>
                  </>) : null}</span>
                <div style={css('display:flex; flex-direction:column; gap:6px;')}>
                  <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{imp.logoTxt}</span>
                  <div style={css('display:flex; gap:6px; flex-wrap:wrap;')}>
                    <button className="btn btn-secondary" onClick={findLogo}>Buscar logo</button>
                    <label className="btn btn-ghost" style={css('cursor:pointer;')}>Subir logo
                      <input type="file" accept="image/*" onChange={onLogoFile} style={css('display:none;')} /></label></div></div></div>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;')}>
                {(imp.idFields || []).map((f: any, $i: number) => (<Fragment key={$i}>
                  <div className="field">
                    <label>{f.label}{f.reqMark}</label>
                    <input className="input" type="text" value={f.value} onChange={f.onChange} placeholder={f.ph} /></div>
                </Fragment>))}</div></div>
            <div className="blueprint" style={css('flex:1 1 420px; padding:24px; display:flex; flex-direction:column; gap:14px;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:baseline;')}>
                <h3 style={css('margin:0; font-size:22px;')}>Supuestos de valuación</h3>
                <button className="btn btn-ghost" onClick={copyMarketParams} style={css('font-size:12px;')}>Copiar Rf/PRM/βU de {co.short}</button></div>
              <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Los drivers de proyección se proponen a partir del archivo. Rf, PRM, beta y g no se infieren: deben capturarse.</span>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;')}>
                {(imp.aFields || []).map((f: any, $i: number) => (<Fragment key={$i}>
                  <div className="field">
                    <label>{f.label}{f.reqMark}</label>
                    <input className="input" type="number" step="any" value={f.value} onChange={f.onChange} style={css(`border-color:${f.border};`)} />
                    <span style={css('font-size:11px; color:var(--color-neutral-700);')}>{f.hint}</span></div>
                </Fragment>))}</div></div></div>
        </>) : null}
        {imp.s5 ? (<>
          <div className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:16px;')}>
            <i className="corner tl"></i>
            <i className="corner tr"></i>
            <i className="corner bl"></i>
            <i className="corner br"></i>
            <h3 style={css('margin:0; font-size:24px;')}>Confirmar</h3>
            <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); border-top:1px solid var(--color-divider); border-left:1px solid var(--color-divider);')}>
              {(imp.summary || []).map((s: any, $i: number) => (<Fragment key={$i}>
                <div style={css('padding:14px; border-right:1px solid var(--color-divider); border-bottom:1px solid var(--color-divider); display:flex; flex-direction:column; gap:2px;')}>
                  <span style={css('font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--color-neutral-700);')}>{s.k}</span>
                  <span style={css('font-family:var(--font-heading); font-size:22px; font-weight:600;')}>{s.v}</span></div>
              </Fragment>))}</div>
            {imp.hasBlock ? (<>
              <div style={css('padding:12px 16px; border:1px solid var(--neg); display:flex; flex-direction:column; gap:4px;')}>
                <strong style={css('color:var(--neg); font-size:14px;')}>✕ Faltan datos necesarios para calcular el DCF</strong>
                {(imp.block || []).map((b: any, $i: number) => (<Fragment key={$i}>
                  <span style={css('font-size:13px;')}>{b}</span>
                </Fragment>))}</div>
            </>) : null}
            {imp.hasPreview ? (<>
              <div style={css('display:flex; gap:24px; align-items:baseline; flex-wrap:wrap;')}>
                <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Vista previa del motor</span>
                <span style={css('font-family:var(--font-heading); font-size:44px; font-weight:600; color:var(--color-accent);')}>{imp.previewValue}</span>
                <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${imp.previewColor};`)}>{imp.previewUp}</span>
                <span style={css('font-size:13px; color:var(--color-neutral-700);')}>WACC {imp.previewWacc}</span></div>
            </>) : null}</div>
        </>) : null}
        <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;')}>
          <button className="btn btn-secondary" onClick={imp.onBack}>{imp.backTxt}</button>
          {imp.showNext ? (<>
            <button className="btn btn-primary blueprint" onClick={imp.onNext} disabled={imp.nextDisabled}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>{imp.nextTxt}</button>
          </>) : null}</div></section>
    </>) : null}
  </>);
}
