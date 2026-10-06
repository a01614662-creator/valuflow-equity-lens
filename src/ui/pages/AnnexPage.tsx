// Generado a partir de project/ValuFlow.dc.html y revisado a mano. Estilos copiados tal cual del diseño.
import { Fragment } from 'react';
import { css, cx, hv } from '../css';
import type { VM } from '../viewmodel';

/** Anexos: tablas, empresa, validación y metodología. */
export function AnnexPage({ vm }: { vm: VM }) {
  const { annexNav, annexTables, ax, co, emp, formulas, res, runResearch, sources, v, val } = vm;
  return (<>
    {v.annex ? (<>
      <section data-screen-label="05 Anexos" style={css('display:flex; flex-direction:column; gap:24px;')}>
        <div style={css('display:flex; flex-direction:column; gap:8px;')}>
          <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>Anexos · Segunda capa</span>
          <h1 style={css('margin:0; font-size:clamp(36px, 4.4vw, 56px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>¿Cómo se construyó cada número?</h1></div>
        <div style={css('display:flex; flex-wrap:wrap; gap:28px; align-items:flex-start;')}>
          <nav data-noprint style={css('flex:0 1 260px; min-width:220px; display:flex; flex-direction:column; border-top:1px solid var(--color-divider); position:sticky; top:88px;')}>
            {(annexNav || []).map((a: any, $i: number) => (<Fragment key={$i}>
              <button className={cx(hv('background:var(--color-accent-100);'))} onClick={a.onClick} style={css(`display:flex; gap:10px; align-items:baseline; padding:10px 12px; text-align:left; background:${a.bg}; border:0; border-bottom:1px solid var(--color-divider); border-left:2px solid ${a.border}; cursor:pointer; color:var(--color-text);`)}>
                <span style={css('font-family:var(--font-heading); font-size:13px; color:var(--color-accent-700); min-width:28px;')}>{a.code}</span>
                <span style={css(`font-size:14px; font-weight:${a.fw};`)}>{a.title}</span></button>
            </Fragment>))}</nav>
          <div style={css('flex:1 1 640px; min-width:0; display:flex; flex-direction:column; gap:28px;')}>
            {(annexTables || []).map((t: any, $i: number) => (<Fragment key={$i}>
              <div className="blueprint" data-page style={css('padding:24px; display:flex; flex-direction:column; gap:14px;')}>
                <i className="corner tl"></i>
                <i className="corner tr"></i>
                <i className="corner bl"></i>
                <i className="corner br"></i>
                <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
                  <div>
                    <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{t.code} · {t.unit}</div>
                    <h3 style={css('margin:4px 0 0; font-size:26px;')}>{t.title}</h3>
                    <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{t.question}</span></div>
                  <span className="tag tag-outline">Fuente: {t.source}</span></div>
                <div style={css('overflow:auto; max-height:640px; border-top:1px solid var(--color-text);')}>
                  <table className="table" style={css(`font-size:13px; min-width:${t.minW};`)}>
                    <thead>
                      <tr>
                        <th style={css('position:sticky; top:0; left:0; z-index:2; background:var(--color-bg);')}>Concepto</th>
                        {(t.head || []).map((h: any, $i: number) => (<Fragment key={$i}>
                          <th style={css(`position:sticky; top:0; background:${h.bg}; text-align:${h.align}; white-space:nowrap; z-index:1;`)}>{h.t}</th>
                        </Fragment>))}</tr></thead>
                    <tbody>
                      {(t.rows || []).map((row: any, $i: number) => (<Fragment key={$i}>
                        <tr>
                          <td style={css(`position:sticky; left:0; background:var(--color-bg); font-weight:${row.fw}; color:${row.lc}; font-size:${row.fs}; letter-spacing:${row.ls}; text-transform:${row.tt}; min-width:220px;`)}>{row.label}</td>
                          {(row.cells || []).map((c: any, $i: number) => (<Fragment key={$i}>
                            <td style={css(`text-align:${c.align}; white-space:${c.ws}; min-width:${c.mw}; background:${c.bg}; color:${c.color}; font-weight:${row.fw};`)}>{c.t}</td>
                          </Fragment>))}</tr>
                      </Fragment>))}</tbody></table></div>
                {t.hasNote ? (<>
                  <span style={css('font-size:12px; line-height:1.5; color:var(--color-neutral-700);')}>{t.note}</span>
                </>) : null}</div>
            </Fragment>))}
            {ax.empresa ? (<>
              <div data-page style={css('display:flex; flex-direction:column; gap:24px;')}>
                <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:18px;')}>
                  <i className="corner tl"></i>
                  <i className="corner tr"></i>
                  <i className="corner bl"></i>
                  <i className="corner br"></i>
                  <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start;')}>
                    <div>
                      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{ax.empCode} · Perfil</div>
                      <h3 style={css('margin:4px 0 0; font-size:26px;')}>{co.legalName}</h3></div>
                    {co.hasLogo ? (<>
                      <img src={co.logo} alt={co.name} style={css('max-height:48px; max-width:200px; object-fit:contain;')} />
                    </>) : null}</div>
                  {emp.hasDesc ? (<>
                    <p style={css('margin:0; font-size:15px; line-height:1.55; max-width:820px; text-wrap:pretty;')}>{emp.desc}</p>
                  </>) : null}
                  <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); border-top:1px solid var(--color-divider); border-left:1px solid var(--color-divider);')}>
                    {(emp.facts || []).map((f: any, $i: number) => (<Fragment key={$i}>
                      <div style={css('padding:14px; border-right:1px solid var(--color-divider); border-bottom:1px solid var(--color-divider); display:flex; flex-direction:column; gap:2px;')}>
                        <span style={css('font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--color-neutral-700);')}>{f.k}</span>
                        <span style={css('font-family:var(--font-heading); font-size:20px; font-weight:600;')}>{f.v}</span></div>
                    </Fragment>))}</div>
                  {emp.hasFormats ? (<>
                    <div style={css('display:flex; gap:8px; flex-wrap:wrap; align-items:center;')}>
                      <span style={css('font-size:12px; color:var(--color-neutral-700);')}>Formatos</span>
                      {(emp.formats || []).map((f: any, $i: number) => (<Fragment key={$i}>
                        <span className="tag tag-accent">{f}</span>
                      </Fragment>))}</div>
                  </>) : null}</div>
                <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:16px;')}>
                  <i className="corner tl"></i>
                  <i className="corner tr"></i>
                  <i className="corner bl"></i>
                  <i className="corner br"></i>
                  <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
                    <div>
                      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Investigación cualitativa</div>
                      <h3 style={css('margin:4px 0 0; font-size:22px;')}>Investigar con IA</h3>
                      <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Busca perfil, historia y gobierno corporativo en fuentes abiertas con URL. Nunca modifica datos financieros.</span></div>
                    <button className="btn btn-primary blueprint" onClick={runResearch}>
                      <i className="corner tl"></i>
                      <i className="corner tr"></i>
                      <i className="corner bl"></i>
                      <i className="corner br"></i>{res.btn}</button></div>
                  {res.has ? (<>
                    <span style={css('font-size:12px; color:var(--color-neutral-700);')}>{res.meta}</span>
                    <div style={css('display:flex; flex-direction:column;')}>
                      {(res.items || []).map((it: any, $i: number) => (<Fragment key={$i}>
                        <div style={css('display:grid; grid-template-columns:110px minmax(0,1fr) auto; gap:14px; padding:12px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent); align-items:start;')}>
                          <span style={css('display:flex; flex-direction:column; gap:4px;')}>
                            <span className="tag tag-neutral" style={css('align-self:flex-start;')}>{it.section}</span>
                            <span style={css('font-size:11px; color:var(--color-neutral-700);')}>Confianza {it.confidence}</span></span>
                          <span style={css('display:flex; flex-direction:column; gap:4px;')}>
                            <strong style={css('font-size:14px;')}>{it.field}{' '}
                              <span style={css('font-weight:400; color:var(--color-neutral-700);')}>{it.date}</span></strong>
                            <span style={css('font-size:14px; line-height:1.45;')}>{it.value}</span>
                            <a href={it.url} target="_blank" rel="noopener" style={css('font-size:12px;')}>Abrir fuente ↗</a></span>
                          <span style={css('display:flex; gap:6px; align-items:center;')}>
                            <span style={css(`font-size:12px; color:${it.stColor};`)}>{it.stTxt}</span>
                            {it.pending ? (<>
                              <button className="btn btn-secondary" onClick={it.onApply} style={css('padding:4px 10px;')}>Aplicar</button>
                              <button className="btn btn-ghost" onClick={it.onDiscard} style={css('padding:4px 8px;')}>Descartar</button>
                            </>) : null}</span></div>
                      </Fragment>))}</div>
                  </>) : null}</div>
                {emp.hasTimeline ? (<>
                  <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:16px;')}>
                    <i className="corner tl"></i>
                    <i className="corner tr"></i>
                    <i className="corner bl"></i>
                    <i className="corner br"></i>
                    <div>
                      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Historia</div>
                      <h3 style={css('margin:4px 0 0; font-size:22px;')}>Hitos relevantes</h3></div>
                    <div style={css('display:flex; flex-direction:column; position:relative; padding-left:28px;')}>
                      <span style={css('position:absolute; left:6px; top:6px; bottom:6px; width:1px; background:var(--color-accent-300);')}></span>
                      {(emp.timeline || []).map((e: any, $i: number) => (<Fragment key={$i}>
                        <div style={css('position:relative; display:grid; grid-template-columns:90px minmax(0,1fr); gap:16px; padding:10px 0;')}>
                          <span style={css('position:absolute; left:-27px; top:15px; width:11px; height:11px; background:var(--color-bg); border:2px solid var(--color-accent); transform:rotate(45deg);')}></span>
                          <span style={css('font-family:var(--font-heading); font-size:18px; font-weight:600; color:var(--color-accent);')}>{e.date}</span>
                          <span style={css('display:flex; flex-direction:column; gap:2px;')}>
                            <strong style={css('font-size:15px;')}>{e.title}</strong>
                            <span style={css('font-size:14px; color:var(--color-neutral-800);')}>{e.desc}</span>
                            <span style={css('font-size:11px; color:var(--color-neutral-700);')}>Fuente: {e.src}</span></span></div>
                      </Fragment>))}</div></div>
                </>) : null}
                {emp.hasGov ? (<>
                  <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:16px;')}>
                    <i className="corner tl"></i>
                    <i className="corner tr"></i>
                    <i className="corner bl"></i>
                    <i className="corner br"></i>
                    <div>
                      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Gobierno corporativo</div>
                      <h3 style={css('margin:4px 0 0; font-size:22px;')}>Consejo de Administración · {emp.gov.board} consejeros</h3></div>
                    <div style={css('display:flex; height:36px; font-size:12px; font-weight:600;')}>
                      <span style={css(`width:${emp.gov.pW}; background:var(--color-accent-200); color:var(--color-accent-800); display:flex; align-items:center; padding-left:10px; white-space:nowrap;`)}>{emp.gov.patrimonial} patrimoniales</span>
                      <span style={css(`width:${emp.gov.rW}; background:var(--color-neutral-300); display:flex; align-items:center; justify-content:center;`)}>{emp.gov.related}</span>
                      <span style={css('flex:1; background:var(--color-accent); color:var(--color-bg); display:flex; align-items:center; justify-content:flex-end; padding-right:10px; white-space:nowrap;')}>{emp.gov.independent} independientes · {emp.gov.ind}</span></div>
                    <span style={css('font-size:13px; color:var(--color-neutral-700);')}>Independencia {emp.gov.ind} vs. referencia de mejores prácticas {emp.gov.best}. Presidente: {emp.gov.chair} · Director General: {emp.gov.ceo}.</span>
                    <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px;')}>
                      {(emp.gov.committees || []).map((c: any, $i: number) => (<Fragment key={$i}>
                        <div style={css('padding:14px; border:1px solid var(--color-divider); display:flex; flex-direction:column; gap:4px;')}>
                          <strong style={css('font-size:14px;')}>{c.k}</strong>
                          <span style={css('font-size:13px; color:var(--color-neutral-800);')}>{c.v}</span></div>
                      </Fragment>))}</div>
                    <div style={css('display:flex; gap:8px; flex-wrap:wrap;')}>
                      {(emp.gov.controls || []).map((c: any, $i: number) => (<Fragment key={$i}>
                        <span className="tag tag-neutral">✓ {c}</span>
                      </Fragment>))}</div></div>
                </>) : null}
                <div style={css('display:flex; flex-wrap:wrap; gap:24px;')}>
                  <div className="blueprint" style={css('flex:1 1 360px; padding:24px; display:flex; flex-direction:column; gap:12px;')}>
                    <i className="corner tl"></i>
                    <i className="corner tr"></i>
                    <i className="corner bl"></i>
                    <i className="corner br"></i>
                    <div>
                      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Datos de mercado · al {co.priceDate}</div>
                      <h3 style={css('margin:4px 0 0; font-size:22px;')}>Mercado (dato, no resultado)</h3></div>
                    {(emp.market || []).map((m: any, $i: number) => (<Fragment key={$i}>
                      <div style={css('display:flex; justify-content:space-between; gap:12px; padding:6px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent); font-size:14px;')}>
                        <span style={css('color:var(--color-neutral-800);')}>{m.k}</span>
                        <strong>{m.v}</strong></div>
                    </Fragment>))}</div>
                  {emp.hasDiv ? (<>
                    <div className="blueprint" style={css('flex:1 1 360px; padding:24px; display:flex; flex-direction:column; gap:12px;')}>
                      <i className="corner tl"></i>
                      <i className="corner tr"></i>
                      <i className="corner bl"></i>
                      <i className="corner br"></i>
                      <div>
                        <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>Dividendos documentados</div>
                        <h3 style={css('margin:4px 0 0; font-size:22px;')}>Monto por acción</h3></div>
                      {(emp.div || []).map((d: any, $i: number) => (<Fragment key={$i}>
                        <div style={css('display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) 80px; gap:8px; padding:6px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent); font-size:13px;')}>
                          <span>Decreto {d.a}</span>
                          <span>Pago {d.b}</span>
                          <strong style={css('text-align:right;')}>{d.c}</strong></div>
                      </Fragment>))}</div>
                  </>) : null}</div></div>
            </>) : null}
            {ax.valid ? (<>
              <div data-page style={css('display:flex; flex-direction:column; gap:24px;')}>
                <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:16px;')}>
                  <i className="corner tl"></i>
                  <i className="corner tr"></i>
                  <i className="corner bl"></i>
                  <i className="corner br"></i>
                  <div style={css('display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-end;')}>
                    <div>
                      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{ax.valCode} · Validación</div>
                      <h3 style={css('margin:4px 0 0; font-size:26px;')}>¿Los cálculos son consistentes?</h3>
                      <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{val.note}</span></div>
                    <div style={css('display:flex; gap:16px;')}>
                      {(val.summary || []).map((s: any, $i: number) => (<Fragment key={$i}>
                        <div style={css('display:flex; flex-direction:column; align-items:flex-end;')}>
                          <span style={css(`font-family:var(--font-heading); font-size:32px; font-weight:600; color:${s.color};`)}>{s.v}</span>
                          <span style={css('font-size:11px; color:var(--color-neutral-700);')}>{s.k}</span></div>
                      </Fragment>))}</div></div>
                  {(val.groups || []).map((g: any, $i: number) => (<Fragment key={$i}>
                    <div style={css('display:flex; flex-direction:column;')}>
                      <div style={css('font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--color-neutral-700); padding:10px 0 6px;')}>{g.name}</div>
                      {(g.items || []).map((c: any, $i: number) => (<Fragment key={$i}>
                        <div style={css('display:grid; grid-template-columns:110px minmax(0,1fr) minmax(0,auto) minmax(0,auto); gap:12px; padding:8px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent); font-size:13px; align-items:center;')}>
                          <span style={css(`font-weight:600; color:${c.color};`)}>{c.icon} {c.st}</span>
                          <span>{c.label}{' '}
                            <span style={css('color:var(--color-neutral-700);')}>{c.detail}</span></span>
                          <span style={css('text-align:right; font-weight:600;')}>{c.calc}</span>
                          <span style={css('text-align:right; color:var(--color-neutral-700);')}>{c.exp}</span></div>
                      </Fragment>))}</div>
                  </Fragment>))}</div>
                {val.hasDisc ? (<>
                  <div className="blueprint" style={css('padding:24px; display:flex; flex-direction:column; gap:12px;')}>
                    <i className="corner tl"></i>
                    <i className="corner tr"></i>
                    <i className="corner bl"></i>
                    <i className="corner br"></i>
                    <div>
                      <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--warn);')}>⚠ Discrepancias detectadas</div>
                      <h3 style={css('margin:4px 0 0; font-size:22px;')}>Diferencias entre fuentes</h3>
                      <span style={css('font-size:13px; color:var(--color-neutral-700);')}>{val.discNote}</span></div>
                    {(val.disc || []).map((d: any, $i: number) => (<Fragment key={$i}>
                      <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; padding:14px 0; border-top:1px solid var(--color-divider);')}>
                        <strong style={css('font-size:15px;')}>{d.topic}</strong>
                        <span style={css('display:flex; flex-direction:column; font-size:13px;')}>
                          <span style={css('color:var(--color-neutral-700);')}>Fuente A · {d.aK}</span>
                          <strong>{d.aV}</strong></span>
                        <span style={css('display:flex; flex-direction:column; font-size:13px;')}>
                          <span style={css('color:var(--color-neutral-700);')}>Fuente B · {d.bK}</span>
                          <strong>{d.bV}</strong></span>
                        <span style={css('display:flex; flex-direction:column; font-size:13px;')}>
                          <span style={css('color:var(--color-accent-700);')}>Fuente utilizada</span>
                          <strong>{d.used}</strong>
                          <span style={css('color:var(--color-neutral-700);')}>{d.note}</span></span></div>
                    </Fragment>))}</div>
                </>) : null}</div>
            </>) : null}
            {ax.method ? (<>
              <div className="blueprint" data-page style={css('padding:24px; display:flex; flex-direction:column; gap:16px;')}>
                <i className="corner tl"></i>
                <i className="corner tr"></i>
                <i className="corner bl"></i>
                <i className="corner br"></i>
                <div>
                  <div style={css('font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:var(--color-accent-700);')}>{ax.metCode} · Metodología</div>
                  <h3 style={css('margin:4px 0 0; font-size:26px;')}>Fórmulas del motor</h3></div>
                <div style={css('display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0; border-top:1px solid var(--color-divider); border-left:1px solid var(--color-divider);')}>
                  {(formulas || []).map((f: any, $i: number) => (<Fragment key={$i}>
                    <div style={css('padding:16px; border-right:1px solid var(--color-divider); border-bottom:1px solid var(--color-divider); display:flex; flex-direction:column; gap:6px;')}>
                      <span style={css('font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--color-accent-700);')}>{f.n} · {f.k}</span>
                      <code style={css('font-family:ui-monospace, Menlo, monospace; font-size:13px; background:var(--color-accent-100); padding:6px 8px;')}>{f.f}</code>
                      <span style={css('font-size:13px; color:var(--color-neutral-800);')}>{f.d}</span></div>
                  </Fragment>))}</div>
                <div style={css('font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--color-neutral-700); padding-top:8px;')}>Fuentes</div>
                {(sources || []).map((s: any, $i: number) => (<Fragment key={$i}>
                  <div style={css('display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) minmax(0,1.6fr); gap:12px; padding:8px 0; border-top:1px solid color-mix(in srgb, var(--color-text) 8%, transparent); font-size:13px;')}>
                    <strong>{s.a}</strong>
                    <span>{s.b}</span>
                    <span style={css('color:var(--color-neutral-700);')}>{s.c}</span></div>
                </Fragment>))}</div>
            </>) : null}</div></div></section>
    </>) : null}
  </>);
}
