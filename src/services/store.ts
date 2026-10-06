// Persistencia local (navegador). Mismas claves que el prototipo (vf.v1.*).
import type { Assumptions, Dataset } from '../engine/types';
import { DEFAULT_ID } from '../data/registry';

const KEY = 'vf.v1.companies', AKEY = 'vf.v1.assump.', ACT = 'vf.v1.active', VIEW = 'vf.v1.view', RKEY = 'vf.v1.research.';

const get = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string | null) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* almacenamiento no disponible */ } };
const json = <T>(k: string, fb: T): T => { try { return JSON.parse(get(k) || 'null') ?? fb; } catch { return fb; } };

export const store = {
  /** Empresas creadas o importadas por el usuario (las incluidas de fábrica no se guardan). */
  list: (): Dataset[] => json<Dataset[]>(KEY, []),
  save: (list: Dataset[]) => set(KEY, JSON.stringify(list)),
  getA: (id: string): Partial<Assumptions> | null => json<Partial<Assumptions> | null>(AKEY + id, null),
  setA: (id: string, a: Partial<Assumptions> | null) => set(AKEY + id, a ? JSON.stringify(a) : null),
  active: (): string => get(ACT) || DEFAULT_ID,
  setActive: (id: string) => set(ACT, id),
  view: (): string | null => get(VIEW),
  setView: (v: string) => set(VIEW, v),
  getResearch: <T>(id: string): T | null => json<T | null>(RKEY + id, null),
  setResearch: (id: string, r: unknown) => set(RKEY + id, JSON.stringify(r))
};
