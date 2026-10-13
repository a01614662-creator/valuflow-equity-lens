// Vista "Estudio": inflación, precio e IPC, beta, WACC paso a paso, crecimiento perpetuo, valor terminal,
// validación (15 comprobaciones y app vs Excel), conclusiones y preguntas de análisis. Todo con cifras vivas.
import { Fragment } from 'react';
import { css } from '../css';
import type { VM } from '../viewmodel';
import { ReportBlocks } from '../components/ReportBlocks';

export function StudyPage({ vm }: { vm: VM }) {
  const { study, v } = vm;
  if (!v.study || !study) return null;
  return (
    <section data-page data-screen-label="Estudio" style={css('display:flex; flex-direction:column; gap:24px;')}>
      <div style={css('display:flex; flex-direction:column; gap:8px;')}>
        <span style={css('font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:var(--color-accent-700);')}>07 · Estudio de soporte</span>
        <h1 style={css('margin:0; font-size:clamp(40px, 5vw, 64px); line-height:.95; text-transform:uppercase; letter-spacing:-.02em;')}>De la inflación al valor</h1>
        <p style={css('margin:0; max-width:820px; font-size:15px; line-height:1.6;')}>{study.intro}</p></div>
      {study.changes ? <div role="note" style={css('padding:12px 16px; border:1px solid var(--warn); color:var(--warn); font-size:14px;')}>{study.changes}</div> : null}
      <div className="seg" style={css('display:flex; flex-wrap:wrap; align-self:flex-start;')}>
        {study.tabs.map((t: any, i: number) => (<Fragment key={i}>
          <button onClick={t.onClick} style={css(`padding:8px 12px; border:0; border-left:1px solid var(--color-divider); background:${t.on ? 'var(--color-accent)' : 'transparent'}; color:${t.on ? 'var(--color-bg)' : 'var(--color-text)'}; cursor:pointer; font-size:13px;`)}>{t.label}</button>
        </Fragment>))}</div>
      {study.sections.map((s: any) => (
        <div key={s.id} style={css('display:flex; flex-direction:column; gap:18px;')}>
          <h2 style={css('margin:8px 0 0; font-size:30px; border-bottom:1px solid var(--color-divider); padding-bottom:6px;')}>{s.title}</h2>
          <ReportBlocks blocks={s.blocks} act={study.act} notes={study.notes} />
        </div>))}
    </section>
  );
}
