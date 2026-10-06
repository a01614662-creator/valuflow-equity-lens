// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** Acerca del proyecto. */
export function TeamPage({ vm }: { vm: VM }) {
  const { arch, goAnnexMet, goImport, team, v } = vm;
  return (<>
    {v.team ? (<>
      <section data-screen-label="Acerca del proyecto" style={css('display:flex; flex-direction:column; gap:28px;')}>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:flex-start;')}>
          <div style={css('flex:1 1 480px; display:flex; flex-direction:column; gap:16px;')}>
            <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>Acerca del proyecto</span>
            <h1 style={css('margin:0; font-size:clamp(36px, 4.4vw, 56px); line-height:.95; text-transform:uppercase;')}>Tecnológico de Monterrey · Valuación de Empresas</h1>
            <p style={css('margin:0; font-size:16px; line-height:1.6; max-width:640px;')}>Esta plataforma fue desarrollada como parte del proyecto académico de Valuación de Empresas del Tecnológico de Monterrey. El caso inicial corresponde a Organización Soriana. La plataforma fue diseñada para permitir que el modelo pueda reutilizarse para otras empresas mediante la sustitución de datos y supuestos.</p></div>
          <div style={css('flex:0 1 160px;')}>
            <img src="assets/tec.svg" alt="Tecnológico de Monterrey" style={css('width:140px; height:140px;')} /></div></div>
        <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); border-top:1px solid var(--color-divider); border-left:1px solid var(--color-divider);')}>
          {(team || []).map((m: any, $i: number) => (<Fragment key={$i}>
            <div style={css('padding:22px; border-right:1px solid var(--color-divider); border-bottom:1px solid var(--color-divider); display:flex; flex-direction:column; gap:6px;')}>
              <span style={css('font-family:var(--font-heading); font-size:28px; font-weight:600; color:var(--color-accent-300);')}>{m.n}</span>
              <span style={css('font-family:var(--font-heading); font-size:20px; font-weight:600; line-height:1.15;')}>{m.name}</span>
              <span style={css('font-size:13px; color:var(--color-neutral-700); letter-spacing:.06em;')}>Matrícula {m.id}</span></div>
          </Fragment>))}</div>
        <div className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:18px;')}>
          <i className="corner tl"></i>
          <i className="corner tr"></i>
          <i className="corner bl"></i>
          <i className="corner br"></i>
          <div>
            <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Arquitectura reutilizable</div>
            <h3 style={css('margin:4px 0 0; font-size:26px;')}>Un motor, cualquier empresa compatible</h3></div>
          <div style={css('display:flex; flex-wrap:wrap; align-items:stretch; gap:8px;')}>
            {(arch || []).map((a: any, $i: number) => (<Fragment key={$i}>
              <div style={css(`flex:1 1 150px; padding:16px; border:1px solid ${a.border}; background:${a.bg}; color:${a.color}; display:flex; flex-direction:column; gap:6px;`)}>
                <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; opacity:.8;')}>{a.n}</span>
                <strong style={css('font-family:var(--font-heading); font-size:19px;')}>{a.k}</strong>
                <span style={css('font-size:12px; line-height:1.4; opacity:.9;')}>{a.d}</span></div>
            </Fragment>))}</div>
          <div style={css('display:flex; gap:10px; flex-wrap:wrap;')}>
            <button className="btn btn-primary blueprint" onClick={goImport}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>Configurar nueva valuación</button>
            <button className="btn btn-secondary" onClick={goAnnexMet}>Metodología y fuentes</button></div></div></section>
    </>) : null}
  </>);
}
