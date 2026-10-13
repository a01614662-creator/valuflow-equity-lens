// Vista "Autor": datos del estudio individual (sin otros integrantes).
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';

/** Autor del estudio. */
export function AuthorPage({ vm }: { vm: VM }) {
  const { arch, author, goAnnexMet, logos, v } = vm;
  return (<>
    {v.author ? (<>
      <section data-screen-label="Autor" style={css('display:flex; flex-direction:column; gap:28px;')}>
        <div style={css('display:flex; flex-direction:column; gap:12px;')}>
          <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>Autor del estudio</span>
          <h1 style={css('margin:0; font-size:clamp(36px, 4.4vw, 56px); line-height:.95; text-transform:uppercase;')}>Estudio individual de Soriana</h1>
          <p style={css('margin:0; font-size:16px; line-height:1.6; max-width:720px;')}>{author.intro}</p></div>
        <div className="blueprint" style={css('padding:28px; display:flex; flex-wrap:wrap; gap:28px; align-items:center;')}>
          <i className="corner tl"></i>
          <i className="corner tr"></i>
          <i className="corner bl"></i>
          <i className="corner br"></i>
          <div style={css('flex:2 1 420px; display:flex; flex-direction:column; gap:4px;')}>
            <span style={css('font-family:var(--font-heading); font-size:34px; font-weight:600; line-height:1.05;')}>{author.name}</span>
            <span style={css('font-size:15px; color:var(--color-accent-700); letter-spacing:.06em;')}>Matrícula {author.id}</span>
            <div style={css('display:grid; grid-template-columns:minmax(120px, auto) 1fr; gap:6px 18px; margin-top:16px; font-size:14px;')}>
              {(author.rows || []).map((r: any, $i: number) => (<Fragment key={$i}>
                <span style={css('color:var(--color-neutral-700);')}>{r.k}</span>
                <span style={css('font-weight:500;')}>{r.v}</span>
              </Fragment>))}</div></div>
          <div style={css('flex:1 1 220px; display:flex; gap:28px; align-items:center; justify-content:center;')}>
            <img src={logos.soriana} alt="Soriana" style={css('max-width:180px; max-height:60px; object-fit:contain;')} />
            <img src={logos.tec} alt="Tecnológico de Monterrey" style={css('width:110px; height:110px;')} /></div></div>
        <div className="blueprint" style={css('padding:28px; display:flex; flex-direction:column; gap:18px;')}>
          <i className="corner tl"></i>
          <i className="corner tr"></i>
          <i className="corner bl"></i>
          <i className="corner br"></i>
          <div>
            <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Cómo está construido</div>
            <h3 style={css('margin:4px 0 0; font-size:26px;')}>Del Excel al motor y al reporte</h3></div>
          <div style={css('display:flex; flex-wrap:wrap; align-items:stretch; gap:8px;')}>
            {(arch || []).map((a: any, $i: number) => (<Fragment key={$i}>
              <div style={css(`flex:1 1 150px; padding:16px; border:1px solid ${a.border}; background:${a.bg}; color:${a.color}; display:flex; flex-direction:column; gap:6px;`)}>
                <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; opacity:.8;')}>{a.n}</span>
                <strong style={css('font-family:var(--font-heading); font-size:19px;')}>{a.k}</strong>
                <span style={css('font-size:12px; line-height:1.4; opacity:.9;')}>{a.d}</span></div>
            </Fragment>))}</div>
          <div style={css('display:flex; gap:10px; flex-wrap:wrap;')}>
            <button className="btn btn-secondary" onClick={goAnnexMet}>Metodología y fuentes</button></div></div></section>
    </>) : null}
  </>);
}
