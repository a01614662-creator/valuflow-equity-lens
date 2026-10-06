// Registro de empresas incluidas en la aplicación.
// Para agregar otra empresa "de fábrica": crea src/data/<empresa>.ts con la misma forma que soriana.ts
// (ver docs/DATASET.md) y agrégala a BUILT_IN. Las empresas importadas por el usuario se guardan en el navegador.
import type { Dataset } from '../engine/types';
import { soriana } from './soriana';

export const BUILT_IN: Dataset[] = [soriana];
export const DEFAULT_ID = BUILT_IN[0].id;

const isNum = (v: unknown) => typeof v === 'number' && isFinite(v);

/**
 * Revisa que un dataset tenga lo mínimo que el motor necesita. Devuelve la lista de problemas
 * (vacía si es válido). Se usa al importar un .json para no dejar entrar archivos incompletos.
 */
export function checkDataset(ds: unknown): string[] {
  const out: string[] = [];
  const d = ds as Partial<Dataset> | null;
  if (!d || typeof d !== 'object') return ['El archivo no contiene un objeto de datos.'];
  if (!d.profile || !d.profile.name) out.push('Falta profile.name (nombre de la empresa).');
  if (!d.profile || !d.profile.currency) out.push('Falta profile.currency (moneda).');
  const f = d.forecast;
  if (!f || !Array.isArray(f.years) || !f.years.length) out.push('Falta forecast.years (años de proyección).');
  else {
    if (!f.base || !isNum(f.base.revenue)) out.push('Falta forecast.base.revenue (ventas del año base).');
    if (!f.rows && !f.drivers) out.push('La proyección necesita forecast.rows o forecast.drivers.');
    if (f.rows) (['revenue', 'ebit', 'taxEbit', 'da', 'capex', 'nwcRelease'] as const).forEach(k => {
      if (!Array.isArray(f.rows![k]) || f.rows![k].length < f.years.length) out.push('forecast.rows.' + k + ' debe tener ' + f.years.length + ' valores.');
    });
  }
  const w = d.wacc;
  if (!w) out.push('Faltan los insumos del WACC (wacc).');
  else (['rf', 'prm', 'betaU', 'kdPre', 'taxShield'] as const).forEach(k => { if (!isNum(w[k])) out.push('Falta wacc.' + k + '.'); });
  const v = d.valuation;
  if (!v) out.push('Faltan los supuestos de valuación (valuation).');
  else {
    if (!isNum(v.g)) out.push('Falta valuation.g (crecimiento perpetuo).');
    if (!v.bridge) out.push('Falta valuation.bridge (deuda, arrendamientos y efectivo).');
  }
  if (!d.market) out.push('Faltan los datos de mercado (market).');
  if (!d.dates) out.push('Faltan las fechas (dates).');
  return out;
}
