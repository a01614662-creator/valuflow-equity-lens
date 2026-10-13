// Logos incluidos en el paquete (sin depender de archivos externos): sirven en la app, el PDF y el HTML independiente.
import soriana from './soriana.svg?raw';
import tec from './tec.svg?raw';

const uri = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
export const LOGO_SVG = { soriana, tec };
export const LOGO_URI = { soriana: uri(soriana), tec: uri(tec) };
