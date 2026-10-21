// Logo local de una marca dentro de un espacio de tamaño fijo (object-fit: contain). Si no hay archivo o la imagen
// no carga, deja el nombre como texto: el logo nunca sustituye al nombre ni rompe la tarjeta.
import { useState } from 'react';
import { css } from '../css';

export interface Brand { src: string | null; alt: string; name: string }

export function BrandLogo({ b, w = 140, h = 52, pad = 6, bg = '#ffffff' }: { b: Brand | null | undefined; w?: number; h?: number; pad?: number; bg?: string }) {
  const [failed, setFailed] = useState(false);
  const box = `flex:0 0 auto; width:${w}px; height:${h}px; padding:${pad}px; box-sizing:border-box; display:grid; place-items:center; background:${bg}; border:1px solid var(--color-divider);`;
  if (!b) return null;
  if (!b.src || failed) {
    return <span role="img" aria-label={b.name} title={b.name + ' · logo no disponible en el paquete local'} style={css(box + 'font-family:var(--font-heading); font-weight:600; font-size:' + Math.max(12, Math.round(h * 0.3)) + 'px; line-height:1.05; text-align:center; color:var(--color-neutral-700); overflow:hidden;')}>{b.name}</span>;
  }
  return (
    <span style={css(box.replace('display:grid; place-items:center;', 'display:block;'))}>
      <img src={b.src} alt={b.alt} decoding="async" onError={() => setFailed(true)} style={css('width:100%; height:100%; object-fit:contain; object-position:center; display:block;')} />
    </span>
  );
}
