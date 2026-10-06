// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** Pantalla de carga. */
export function Splash({ vm }: { vm: VM }) {
  const { loading } = vm;
  return (<>
    {loading ? (<>
      <div style={css('min-height:100vh; display:grid; place-items:center;')}>
        <div style={css('display:flex; flex-direction:column; align-items:center; gap:12px;')}>
          <img src="assets/tec.svg" alt="Tecnológico de Monterrey" style={css('width:48px; height:48px;')} />
          <div style={css('font-family:var(--font-heading); font-size:20px; font-weight:600;')}>Cargando modelo de valuación…</div></div></div>
    </>) : null}
  </>);
}

/** Portada. */
export function Cover({ vm }: { vm: VM }) {
  const { co, cv, goImport, r, startPresent, startTour, team, v } = vm;
  return (<>
    {v.cover ? (<>
      <section data-screen-label="00 Portada" style={css('position:relative; min-height:100vh; overflow:hidden; background-image:linear-gradient(var(--color-divider) 1px, transparent 1px), linear-gradient(90deg, var(--color-divider) 1px, transparent 1px); background-size:56px 56px; background-position:-1px -1px;')}>
        <div style={css('position:absolute; inset:0; background:radial-gradient(ellipse at 70% 40%, transparent 0%, var(--color-bg) 78%); pointer-events:none;')}></div>
        <div style={css('position:relative; max-width:1360px; margin:0 auto; padding:40px 32px 32px; min-height:100vh; display:flex; flex-direction:column; gap:40px;')}>
          <div style={css(`display:flex; align-items:center; gap:16px; flex-wrap:wrap; opacity:${cv.o1}; transform:${cv.t1}; transition:all .7s cubic-bezier(.2,.7,.2,1);`)}>
            <img src="assets/tec.svg" alt="Tecnológico de Monterrey" style={css('width:56px; height:56px;')} />
            <div style={css('display:flex; flex-direction:column;')}>
              <span style={css('font-family:var(--font-heading); font-weight:600; font-size:22px; letter-spacing:.01em;')}>Tecnológico de Monterrey</span>
              <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Valuación de Empresas · 2026</span></div>
            <div style={css('margin-left:auto; display:flex; align-items:center; gap:8px; font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--color-accent-700);')}>
              <span style={css('width:8px; height:8px; background:var(--color-accent);')}></span>ValuFlow · Motor de valuación</div></div>
          <div style={css('flex:1; display:flex; flex-wrap:wrap; gap:48px; align-items:center;')}>
            <div style={css(`flex:7 1 520px; min-width:0; display:flex; flex-direction:column; gap:28px; opacity:${cv.o2}; transform:${cv.t2}; transition:all .9s cubic-bezier(.2,.7,.2,1) .1s;`)}>
              <div style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>Plataforma de Valuación Empresarial</div>
              <h1 style={css('margin:0; font-family:var(--font-heading); font-weight:600; font-size:clamp(56px, 8.4vw, 132px); line-height:.9; letter-spacing:-.025em; text-transform:uppercase; text-wrap:balance;')}>Valor intrínseco,
                <br />
                <span style={css('color:var(--color-accent);')}>paso a paso.</span></h1>
              <p style={css('margin:0; max-width:560px; font-size:17px; line-height:1.55; color:var(--color-neutral-800); text-wrap:pretty;')}>Un motor DCF reutilizable: proyección de flujos, costo de capital iterado, valor terminal por dos métodos y sensibilidad, con trazabilidad hasta el dato de origen.</p>
              <div style={css('display:flex; gap:12px; flex-wrap:wrap; align-items:center;')}>
                <button className="btn btn-primary blueprint" onClick={startTour} style={css('font-size:17px; padding:14px 24px; gap:10px;')}>
                  <i className="corner tl"></i>
                  <i className="corner tr"></i>
                  <i className="corner bl"></i>
                  <i className="corner br"></i>Explorar valuación{' '}
                  <span style={css('font-family:var(--font-body);')}>→</span></button>
                <button className="btn btn-secondary" onClick={startPresent} style={css('font-size:15px; padding:13px 18px;')}>Modo presentación</button>
                <button className="btn btn-ghost" onClick={goImport} style={css('font-size:15px;')}>+ Nueva valuación</button></div></div>
            <div style={css(`flex:5 1 380px; min-width:0; opacity:${cv.o3}; transform:${cv.t3}; transition:all .9s cubic-bezier(.2,.7,.2,1) .25s;`)}>
              <div className="blueprint" style={css('padding:28px; background:color-mix(in srgb, var(--color-bg) 82%, transparent); display:flex; flex-direction:column; gap:22px;')}>
                <i className="corner tl"></i>
                <i className="corner tr"></i>
                <i className="corner bl"></i>
                <i className="corner br"></i>
                <div style={css('display:flex; justify-content:space-between; align-items:center; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>
                  <span>Caso de estudio</span>
                  <span>{co.ticker} · {co.exchange}</span></div>
                <div style={css('height:72px; display:flex; align-items:center;')}>
                  {co.hasLogo ? (<>
                    <img src={co.logo} alt={co.name} style={css('max-height:72px; max-width:300px; object-fit:contain;')} />
                  </>) : null}
                  {co.noLogo ? (<>
                    <div style={css(`width:72px; height:72px; display:grid; place-items:center; border:1px solid var(--color-divider); font-family:var(--font-heading); font-size:30px; font-weight:600; color:${co.brand};`)}>{co.initials}</div>
                  </>) : null}</div>
                <div style={css('display:flex; flex-direction:column; gap:2px;')}>
                  <div style={css('font-family:var(--font-heading); font-weight:600; font-size:26px; line-height:1.1;')}>{co.legalName}</div>
                  <div style={css('font-size:14px; color:var(--color-neutral-700);')}>{co.sector}</div></div>
                <div style={css('display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); border-top:1px solid var(--color-divider);')}>
                  <div style={css('padding:14px 12px 0 0; display:flex; flex-direction:column; gap:4px;')}>
                    <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-neutral-700);')}>Valor intrínseco</span>
                    <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600; color:var(--color-accent);')}>{r.value}</span></div>
                  <div style={css('padding:14px 12px 0; border-left:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
                    <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-neutral-700);')}>Precio</span>
                    <span style={css('font-family:var(--font-heading); font-size:30px; font-weight:600;')}>{r.price}</span></div>
                  <div style={css('padding:14px 0 0 12px; border-left:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
                    <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-neutral-700);')}>Potencial</span>
                    <span style={css(`font-family:var(--font-heading); font-size:30px; font-weight:600; color:${r.upColor};`)}>{r.upside}</span></div></div></div></div></div>
          <div style={css(`display:flex; flex-direction:column; gap:14px; opacity:${cv.o4}; transition:opacity 1s ease .45s;`)}>
            <div style={css('display:flex; align-items:baseline; gap:12px; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-neutral-700);')}>
              <span>Equipo</span>
              <span style={css('flex:1; height:1px; background:var(--color-divider);')}></span></div>
            <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0;')}>
              {(team || []).map((m: any, $i: number) => (<Fragment key={$i}>
                <div style={css('padding:10px 16px 10px 0; display:flex; gap:12px; align-items:baseline;')}>
                  <span style={css('font-family:var(--font-heading); font-size:14px; color:var(--color-accent);')}>{m.n}</span>
                  <div style={css('display:flex; flex-direction:column;')}>
                    <span style={css('font-weight:500; font-size:14px; line-height:1.3;')}>{m.name}</span>
                    <span style={css('font-size:12px; color:var(--color-neutral-700); letter-spacing:.04em;')}>{m.id}</span></div></div>
              </Fragment>))}</div></div></div></section>
    </>) : null}
  </>);
}

/** Barra superior: empresa, navegación y exportación. */
export function Header({ vm }: { vm: VM }) {
  const { co, companyList, exportItems, goCover, goImport, goLibrary, navItems, resetA, startPresent, toggleCompanyMenu, toggleExportMenu, ui } = vm;
  return (<>
    <header data-noprint style={css(`position:sticky; top:0; z-index:40; background:color-mix(in srgb, var(--color-bg) 90%, transparent); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-bottom:1px solid var(--color-divider); transform:${ui.headerT}; transition:transform .3s;`)}>
      <div style={css('max-width:1360px; margin:0 auto; padding:0 24px; height:64px; display:flex; align-items:center; gap:14px;')}>
        <button onClick={goCover} title="Portada" style={css('display:flex; align-items:center; gap:10px; background:none; border:0; cursor:pointer; padding:0; color:var(--color-text);')}>
          <img src="assets/tec.svg" alt="Tecnológico de Monterrey" style={css('height:32px; width:32px;')} />
          <span style={css('font-family:var(--font-heading); font-weight:600; font-size:20px; letter-spacing:.02em;')}>ValuFlow</span></button>
        <span style={css('width:1px; height:28px; background:var(--color-divider);')}></span>
        <div style={css('position:relative;')}>
          <button className={cx(hv('border-color:var(--color-divider);'))} onClick={toggleCompanyMenu} style={css('display:flex; align-items:center; gap:10px; background:none; border:1px solid transparent; cursor:pointer; padding:6px 10px 6px 6px; color:var(--color-text);')}>
            <span style={css('width:44px; height:28px; display:grid; place-items:center;')}>
              {co.hasLogo ? (<>
                <img src={co.logo} alt={co.name} style={css('max-width:44px; max-height:28px; object-fit:contain;')} />
              </>) : null}
              {co.noLogo ? (<>
                <span style={css(`font-family:var(--font-heading); font-weight:600; font-size:16px; color:${co.brand};`)}>{co.initials}</span>
              </>) : null}</span>
            <span style={css('display:flex; flex-direction:column; align-items:flex-start; line-height:1.15;')}>
              <span style={css('font-weight:600; font-size:14px;')}>{co.name}</span>
              <span style={css('font-size:11px; color:var(--color-neutral-700); letter-spacing:.06em;')}>{co.ticker} · {co.exchange}</span></span>
            <span style={css('font-size:10px; color:var(--color-neutral-700);')}>▼</span></button>
          {ui.companyMenu ? (<>
            <div className="blueprint" style={css('position:absolute; top:52px; left:0; width:320px; background:var(--color-bg); box-shadow:var(--shadow-lg); padding:8px; display:flex; flex-direction:column; gap:2px; z-index:60;')}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>
              <div style={css('padding:8px 10px; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--color-neutral-700);')}>Empresa actual</div>
              {(companyList || []).map((c: any, $i: number) => (<Fragment key={$i}>
                <button className={cx(hv('background:var(--color-accent-100);'))} onClick={c.onClick} style={css(`display:flex; align-items:center; gap:10px; padding:10px; background:${c.bg}; border:0; cursor:pointer; text-align:left; color:var(--color-text);`)}>
                  <span style={css('flex:1; display:flex; flex-direction:column;')}>
                    <span style={css('font-weight:600; font-size:14px;')}>{c.name}</span>
                    <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{c.meta}</span></span>
                  <span style={css('font-family:var(--font-heading); font-size:16px;')}>{c.value}</span></button>
              </Fragment>))}
              <div style={css('height:1px; background:var(--color-divider); margin:6px 0;')}></div>
              <button className="btn btn-ghost" onClick={goLibrary} style={css('justify-content:flex-start; padding:8px 10px;')}>Mis valuaciones</button>
              <button className="btn btn-ghost" onClick={goImport} style={css('justify-content:flex-start; padding:8px 10px;')}>+ Nueva valuación</button></div>
          </>) : null}</div>
        {ui.desktop ? (<>
          <nav style={css('display:flex; align-items:stretch; height:64px; margin-left:12px;')}>
            {(navItems || []).map((it: any, $i: number) => (<Fragment key={$i}>
              <button className={cx(hv('color:var(--color-accent);'))} onClick={it.onClick} style={css(`display:flex; align-items:center; gap:6px; padding:0 14px; background:none; border:0; border-bottom:2px solid ${it.border}; cursor:pointer; font-family:var(--font-heading); font-size:16px; font-weight:600; color:${it.color}; transition:color .2s, border-color .2s;`)}>
                <span style={css('font-size:12px; font-family:var(--font-body); font-weight:500; opacity:.7;')}>{it.num}</span>{it.label}</button>
            </Fragment>))}</nav>
        </>) : null}
        <div style={css('margin-left:auto; display:flex; align-items:center; gap:8px;')}>
          {ui.modified ? (<>
            <button className="tag tag-accent" onClick={resetA} style={css('border:0; cursor:pointer; gap:6px;')} title="Restaurar valores base">● Modelo modificado · Restaurar</button>
          </>) : null}
          {ui.desktop ? (<>
            <button className="btn btn-secondary" onClick={startPresent}>Presentar</button>
          </>) : null}
          <div style={css('position:relative;')}>
            <button className="btn btn-primary blueprint" onClick={toggleExportMenu}>
              <i className="corner tl"></i>
              <i className="corner tr"></i>
              <i className="corner bl"></i>
              <i className="corner br"></i>Exportar ▾</button>
            {ui.exportMenu ? (<>
              <div className="blueprint" style={css('position:absolute; top:48px; right:0; width:300px; background:var(--color-bg); box-shadow:var(--shadow-lg); padding:8px; display:flex; flex-direction:column; z-index:60;')}>
                <i className="corner tl"></i>
                <i className="corner tr"></i>
                <i className="corner bl"></i>
                <i className="corner br"></i>
                <div style={css('padding:8px 10px; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--color-neutral-700);')}>Exportar valuación · {co.short}</div>
                {(exportItems || []).map((e: any, $i: number) => (<Fragment key={$i}>
                  <button className={cx(hv('background:var(--color-accent-100);'))} onClick={e.onClick} style={css('display:flex; flex-direction:column; align-items:flex-start; gap:2px; padding:10px; background:none; border:0; cursor:pointer; text-align:left; color:var(--color-text);')}>
                    <span style={css('font-weight:600; font-size:14px;')}>{e.label}</span>
                    <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{e.desc}</span></button>
                </Fragment>))}</div>
            </>) : null}</div></div></div></header>
  </>);
}

/** Pie de página. */
export function Footer({ vm }: { vm: VM }) {
  const { co, project, teamNames } = vm;
  return (<>
    <footer data-noprint style={css('border-top:1px solid var(--color-divider);')}>
      <div style={css('max-width:1360px; margin:0 auto; padding:24px 24px 96px; display:flex; flex-wrap:wrap; gap:12px 32px; font-size:12px; color:var(--color-neutral-700);')}>
        <span style={css('font-weight:600; color:var(--color-text);')}>{project.institution} · {project.course} · {project.year}</span>
        <span>Caso de estudio: {co.legalName}</span>
        <span>Equipo: {teamNames}</span></div></footer>
  </>);
}

/** Navegación inferior en pantallas angostas. */
export function MobileNav({ vm }: { vm: VM }) {
  const { mobileNav, ui } = vm;
  return (<>
    {ui.mobile ? (<>
      <nav data-noprint style={css('position:fixed; left:0; right:0; bottom:0; z-index:45; display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); background:var(--color-bg); border-top:1px solid var(--color-divider);')}>
        {(mobileNav || []).map((it: any, $i: number) => (<Fragment key={$i}>
          <button onClick={it.onClick} style={css(`height:60px; background:none; border:0; border-top:2px solid ${it.border}; color:${it.color}; font-family:var(--font-heading); font-size:14px; font-weight:600; cursor:pointer;`)}>{it.label}</button>
        </Fragment>))}</nav>
    </>) : null}
  </>);
}

/** Panel lateral "¿Cómo se calculó?". */
export function Drawer({ vm }: { vm: VM }) {
  const { closeDrawer, drawer } = vm;
  return (<>
    {drawer.open ? (<>
      <div data-noprint onClick={closeDrawer} style={css('position:fixed; inset:0; z-index:80; background:color-mix(in srgb, var(--color-neutral-900) 40%, transparent);')}></div>
      <aside data-noprint style={css('position:fixed; top:0; right:0; bottom:0; z-index:81; width:min(520px, 100%); background:var(--color-bg); border-left:1px solid var(--color-divider); box-shadow:var(--shadow-lg); padding:28px; overflow-y:auto; display:flex; flex-direction:column; gap:18px;')}>
        <div style={css('display:flex; justify-content:space-between; align-items:flex-start; gap:12px;')}>
          <div>
            <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>¿Cómo se calculó?</div>
            <h3 style={css('margin:4px 0 0; font-size:28px;')}>{drawer.title}</h3></div>
          <button className="btn btn-secondary btn-icon" onClick={closeDrawer} aria-label="Cerrar">✕</button></div>
        <div style={css('display:flex; flex-direction:column;')}>
          {(drawer.steps || []).map((s: any, $i: number) => (<Fragment key={$i}>
            <div style={css('display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px 12px; padding:12px 0; border-top:1px solid var(--color-divider);')}>
              <strong style={css(`font-size:14px; font-weight:${s.fw};`)}>{s.k}</strong>
              <span style={css(`font-family:var(--font-heading); font-size:20px; font-weight:600; color:${s.color}; text-align:right;`)}>{s.v}</span>
              <span style={css('font-size:12px; color:var(--color-neutral-700); grid-column:1 / -1;')}>{s.f}</span></div>
          </Fragment>))}</div>
        <span style={css('font-size:12px; color:var(--color-neutral-700); line-height:1.5;')}>{drawer.note}</span>
        <button className="btn btn-secondary" onClick={drawer.goAnnex}>Ver tabla completa en anexos →</button></aside>
    </>) : null}
  </>);
}

/** Controles del modo presentación. */
export function PresentationBar({ vm }: { vm: VM }) {
  const { pres } = vm;
  return (<>
    {pres.on ? (<>
      <div data-noprint style={css('position:fixed; bottom:20px; left:50%; transform:translateX(-50%); z-index:90; display:flex; align-items:center; gap:4px; padding:6px; background:var(--color-accent-900); color:#fff; box-shadow:var(--shadow-lg);')}>
        <button onClick={pres.prev} style={css('width:40px; height:40px; background:none; border:0; color:#fff; cursor:pointer; font-size:18px;')} aria-label="Anterior">←</button>
        <span style={css('font-family:var(--font-heading); font-size:15px; font-weight:600; padding:0 10px; min-width:170px; text-align:center;')}>{pres.label}</span>
        <button onClick={pres.next} style={css('width:40px; height:40px; background:none; border:0; color:#fff; cursor:pointer; font-size:18px;')} aria-label="Siguiente">→</button>
        <button onClick={pres.exit} style={css('height:40px; padding:0 12px; background:none; border:0; border-left:1px solid rgba(255,255,255,.25); color:#fff; cursor:pointer; font-size:13px;')}>Salir</button></div>
      <div data-noprint style={css(`position:fixed; top:0; left:0; height:3px; z-index:91; background:var(--color-accent); width:${pres.progress}; transition:width .5s;`)}></div>
    </>) : null}
  </>);
}

/** Aviso breve. */
export function Toast({ vm }: { vm: VM }) {
  const { toast } = vm;
  return (<>
    {toast.show ? (<>
      <div data-noprint style={css('position:fixed; bottom:88px; right:24px; z-index:95; padding:12px 18px; background:var(--color-text); color:var(--color-bg); font-size:14px; box-shadow:var(--shadow-lg);')}>✓ {toast.t}</div>
    </>) : null}
  </>);
}

/** Aviso cuando los supuestos no permiten calcular. */
export function ErrorBanner({ vm }: { vm: VM }) {
  const { resetA, ui } = vm;
  return (<>
    {ui.errorsShow ? (<>
      <div className="blueprint" style={css('padding:16px 20px; margin-bottom:24px; border-color:var(--neg); display:flex; gap:12px; align-items:flex-start;')}>
        <i className="corner tl"></i>
        <i className="corner tr"></i>
        <i className="corner bl"></i>
        <i className="corner br"></i>
        <span style={css('color:var(--neg); font-weight:700;')}>✕</span>
        <div style={css('display:flex; flex-direction:column; gap:4px;')}>
          <strong style={css('font-size:14px;')}>No es posible calcular la valuación con los supuestos actuales</strong>
          {(ui.errors || []).map((e: any, $i: number) => (<Fragment key={$i}>
            <span style={css('font-size:14px;')}>{e}</span>
          </Fragment>))}</div>
        <button className="btn btn-secondary" onClick={resetA} style={css('margin-left:auto;')}>Restaurar valores base</button></div>
    </>) : null}
  </>);
}
