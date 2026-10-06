import type { Dataset, Labels } from './types';

/** Año (4 dígitos) contenido en un texto como "2025A", "31-dic-2025" o "FY2025". */
export const yearIn = (s: unknown): number | null => {
  const m = String(s ?? '').match(/\b((19|20)\d{2})/);
  return m ? +m[1] : null;
};

/**
 * Etiquetas de la empresa con valores por defecto razonables, para que un
 * dataset importado (sin etiquetas) se lea bien en toda la interfaz.
 */
export function labelsOf(ds: Dataset): Required<Labels> {
  const L = ds.labels || {};
  const y = yearIn(ds.forecast.baseYear) ?? yearIn(ds.dates.base);
  return {
    closeDate: L.closeDate || (y ? 'cierre de ' + y : 'cierre del año base'),
    rollDate: L.rollDate || ds.dates.balance || 'balance intermedio',
    rollFcf: L.rollFcf || 'el periodo intermedio',
    rfSource: L.rfSource || 'Bono gubernamental',
    sourceShort: L.sourceShort || (ds.builtIn ? 'Excel' : 'Archivo'),
    multipleSource: L.multipleSource || (ds.builtIn ? 'Comparables' : 'Archivo · EV/EBITDA actual')
  };
}

/** Unidad monetaria para encabezados: "mdp" o "USD mm". */
export const unitsOf = (ds: Dataset) => ds.profile.units === 'mdp' ? 'mdp' : (ds.profile.currency + ' mm');
