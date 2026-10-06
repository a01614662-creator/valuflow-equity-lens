// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** Mis valuaciones. */
export function LibraryPage({ vm }: { vm: VM }) {
  const { goImport, libCards, onJsonFile, v } = vm;
  return (<>
    {v.library ? (<>
      <section data-screen-label="Mis valuaciones" style={css('display:flex; flex-direction:column; gap:24px;')}>
        <div style={css('display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end; justify-content:space-between;')}>
          <div style={css('display:flex; flex-direction:column; gap:8px;')}>
            <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>Plataforma</span>
            <h1 style={css('margin:0; font-size:clamp(36px, 4.4vw, 56px); line-height:.95; text-transform:uppercase;')}>Mis valuaciones</h1></div>
          <div style={css('display:flex; gap:8px; flex-wrap:wrap;')}>
            <label className="btn btn-secondary" style={css('cursor:pointer;')}>Importar dataset (.json)
              <input type="file" accept=".json" onChange={onJsonFile} style={css('display:none;')} /></label>
            <button className="btn btn-primary blueprint" onClick={goImport}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>+ Nueva valuación</button></div></div>
        <div style={css('display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:24px;')}>
          {(libCards || []).map((c: any, $i: number) => (<Fragment key={$i}>
            <div className="blueprint" style={css(`padding:24px; display:flex; flex-direction:column; gap:14px; border-color:${c.border};`)}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('display:flex; justify-content:space-between; align-items:center; gap:12px; height:44px;')}>
                {c.hasLogo ? (<>
                  <img src={c.logo} alt={c.name} style={css('max-height:40px; max-width:160px; object-fit:contain;')} />
                </>) : null}
                {c.noLogo ? (<>
                  <span style={css(`width:44px; height:44px; display:grid; place-items:center; border:1px solid var(--color-divider); font-family:var(--font-heading); font-size:20px; font-weight:600; color:${c.brand};`)}>{c.initials}</span>
                </>) : null}
                <span className={cx(`tag ${c.tagCls}`)}>{c.tag}</span></div>
              <div>
                <div style={css('font-family:var(--font-heading); font-size:22px; font-weight:600;')}>{c.name}</div>
                <div style={css('font-size:13px; color:var(--color-neutral-700);')}>{c.meta}</div></div>
              <div style={css('display:flex; gap:20px; align-items:baseline; border-top:1px solid var(--color-divider); padding-top:12px;')}>
                <div style={css('display:flex; flex-direction:column;')}>
                  <span style={css('font-size:11px; color:var(--color-neutral-700);')}>Valor intrínseco</span>
                  <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600; color:var(--color-accent);')}>{c.valTxt}</span></div>
                <div style={css('display:flex; flex-direction:column;')}>
                  <span style={css('font-size:11px; color:var(--color-neutral-700);')}>Potencial</span>
                  <span style={css(`font-family:var(--font-heading); font-size:22px; font-weight:600; color:${c.upColor};`)}>{c.upTxt}</span></div></div>
              <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{c.created}</span>
              <div style={css('display:flex; gap:6px; flex-wrap:wrap;')}>
                <button className="btn btn-primary" onClick={c.onOpen}>Abrir →</button>
                <button className="btn btn-secondary" onClick={c.onDup}>Duplicar</button>
                <button className="btn btn-ghost" onClick={c.onJson}>Exportar</button>
                {c.canDel ? (<>
                  <button className="btn btn-ghost" onClick={c.onDel} style={css('color:var(--neg);')}>Eliminar</button>
                </>) : null}</div></div>
          </Fragment>))}</div></section>
    </>) : null}
  </>);
}
