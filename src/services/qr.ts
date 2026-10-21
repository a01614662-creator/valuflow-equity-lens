// Código QR generado localmente (sin servicios externos): devuelve un SVG listo para insertar.
import qrcode from 'qrcode-generator';

/** SVG cuadrado del QR de `text` (corrección de errores M, zona de silencio de 4 módulos). */
export function qrSvg(text: string, opts: { size?: number; fg?: string; bg?: string; label?: string } = {}): string {
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), m = 4, N = n + 2 * m, size = opts.size || 160;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + N + ' ' + N + '" width="' + size + '" height="' + size + '" shape-rendering="crispEdges" role="img" aria-label="' + esc(opts.label || 'Código QR: ' + text) + '">'
    + '<rect width="' + N + '" height="' + N + '" fill="' + (opts.bg || '#ffffff') + '"/><path d="' + d + '" fill="' + (opts.fg || '#1d1f20') + '"/></svg>';
}
