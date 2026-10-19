// Modo presentación: 7 diapositivas 16:9 construidas por present/deck.ts con los supuestos activos.
// Estado propio (diapositiva actual); no muestra controles del modelo ni modifica supuestos. Escape vuelve a la app.
import { useEffect, useRef, useState } from 'react';
import type { DeckData, Slide } from './deck';
import { C } from './deck';

const W = 1600, H = 900;

export function Deck({ deck, index, onIndex, onExit, onLive, team }: { deck: DeckData; index: number; onIndex: (i: number) => void; onExit: () => void; onLive: () => void; team: string }) {
  const n = deck.slides.length, i = Math.max(0, Math.min(n - 1, index)), s = deck.slides[i];
  const [scale, setScale] = useState(1);
  const touch = useRef<number | null>(null);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, (window.innerHeight - 56) / H));
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); onIndex(Math.min(n - 1, i + 1)); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); onIndex(Math.max(0, i - 1)); }
      else if (e.key === 'Home') { e.preventDefault(); onIndex(0); }
      else if (e.key === 'End') { e.preventDefault(); onIndex(n - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); onExit(); }
      else if (e.key === 'f' || e.key === 'F') toggleFs();
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [i, n, onIndex, onExit]);
  const toggleFs = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch { /* no permitido */ } };
  const dark = s.theme === 'dark';
  return (
    <div className="deck" role="dialog" aria-modal="true" aria-label={'Presentación · diapositiva ' + (i + 1) + ' de ' + n}
      onTouchStart={e => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const x0 = touch.current; touch.current = null; if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) onIndex(dx < 0 ? Math.min(n - 1, i + 1) : Math.max(0, i - 1)); }}>
      <div className="deck-viewport">
        <div className={'deck-stage ' + (dark ? 'is-dark' : 'is-light')} style={{ width: W, height: H, transform: `scale(${scale})` }}>
          <SlideView key={s.key + '|' + i} s={s} deck={deck} i={i} n={n} team={team} onLive={onLive} />
        </div>
      </div>
      <nav className="deck-bar" aria-label="Navegación de la presentación">
        <div className="deck-progress" aria-hidden="true"><span style={{ width: ((i + 1) / n * 100) + '%' }} /></div>
        <button onClick={() => onIndex(Math.max(0, i - 1))} disabled={i === 0} aria-label="Diapositiva anterior">Anterior</button>
        <span className="deck-count">{i + 1} / {n}</span>
        <button onClick={() => onIndex(Math.min(n - 1, i + 1))} disabled={i === n - 1} aria-label="Diapositiva siguiente">Siguiente</button>
        <span className="deck-spacer" />
        {deck.modified ? <span className="deck-flag">Supuestos modificados en el Laboratorio</span> : null}
        <button onClick={toggleFs} aria-label="Pantalla completa">Pantalla completa</button>
        <button onClick={onExit} className="deck-exit" aria-label="Salir de la presentación">Salir (Esc)</button>
      </nav>
    </div>
  );
}

function Side({ s }: { s: Slide }) {
  if (!s.side || !s.side.length) return null;
  return (
    <dl className="deck-side">
      {s.side.map((x, k) => (
        <div key={k} className={'deck-kv' + (x.tone ? ' tone-' + x.tone : '')}>
          <dt>{x.k}</dt><dd>{x.v}</dd>{x.s ? <span>{x.s}</span> : null}
        </div>))}
    </dl>
  );
}

function SlideView({ s, deck, i, n, team, onLive }: { s: Slide; deck: DeckData; i: number; n: number; team: string; onLive: () => void }) {
  const fig = s.figure ? <div className="deck-fig" dangerouslySetInnerHTML={{ __html: s.figure }} /> : null;
  const notes = s.notes && s.notes.length ? <ul className="deck-notes">{s.notes.map((x, k) => <li key={k}>{x}</li>)}</ul> : null;
  const head = (cls = '') => (<header className={'deck-head ' + cls}><p className="deck-kicker">{s.kicker}</p><h1 className="deck-title">{s.title}</h1>{s.lede ? <p className="deck-lede">{s.lede}</p> : null}</header>);
  const foot = <footer className="deck-foot"><span>{s.source}</span><span>{deck.company} · {i + 1}/{n}</span></footer>;
  let body;
  switch (s.key) {
    case 'conclusion':
      body = (<>
        <div className="deck-brand"><img src="assets/soriana.svg" alt="Soriana" /><img src="assets/tec.svg" alt="Tecnológico de Monterrey" /></div>
        {head('is-cover')}
        <div className="deck-cover-fig">{fig}</div>
        <p className="deck-team">{team}</p>
      </>); break;
    case 'flujos':
      body = (<>{head()}<div className="deck-row is-swap"><div className="deck-col">{fig}</div><aside className="deck-aside"><Side s={s} />{notes}</aside></div></>); break;
    case 'valor':
      body = (<>{head()}<div className="deck-fig-wide">{fig}</div><Side s={s} /></>); break;
    case 'metodos':
      body = (<>{head()}<div className="deck-row"><div className="deck-col">{fig}</div><aside className="deck-aside is-narrow">{notes}</aside></div></>); break;
    case 'cierre':
      body = (<>{head()}<div className="deck-row"><div className="deck-col">{fig}</div><aside className="deck-aside"><Side s={s} />
        <button className="deck-live" onClick={onLive}>Ver el modelo en vivo en ValuFlow</button></aside></div></>); break;
    default:
      body = (<>{head()}<div className="deck-row"><div className="deck-col">{fig}</div><aside className="deck-aside"><Side s={s} />{notes}</aside></div></>);
  }
  return <section className={'deck-slide slide-' + s.key}>{body}{foot}</section>;
}

export const deckColors = C;
