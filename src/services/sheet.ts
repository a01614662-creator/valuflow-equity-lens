// Lector de hojas de cálculo para el importador (SheetJS, paquete npm incluido en la app; sin CDN).
import * as XLSXlib from 'xlsx';

export const getXLSX = (): any => XLSXlib;
