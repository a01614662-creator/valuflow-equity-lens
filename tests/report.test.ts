// Reportes y exportaciones: todo sale de la misma instantánea de cálculo que la pantalla (supuestos activos).
// El PDF necesita un navegador (las gráficas se rasterizan con canvas); se prueba de punta a punta con Playwright (docs/QA).
import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import * as E from '../src/engine';
import { BUILT_IN } from '../src/data/registry';
import { PROJECT } from '../src/config';
import { snapshot } from '../src/report/snapshot';
import { buildReport, reportTables } from '../src/report/content';
import { chartCatalog } from '../src/report/charts';
import { buildXlsx, parseCell, tableCsv } from '../src/services/xlsx';
import { csvAll, valuationJson } from '../src/services/exporter';

const ds = BUILT_IN[0], D = E.defaults(ds), when = new Date(2026, 9, 19);
const S0 = snapshot(ds, D, when)!, R0 = buildReport(S0, 'full');
const cell = (R: ReturnType<typeof buildReport>, id: string, row: string) => reportTables(R).find(t => t.id === id)!.rows.find(r => r[0] === row)!;

describe('contenido del reporte', () => {
  it('caso base: identifica el caso, el equipo de cinco integrantes y las cifras del motor', () => {
    expect(S0.isBase).toBe(true); expect(S0.changes).toEqual([]);
    expect(R0.meta.team).toEqual(PROJECT.team); expect(R0.meta.team).toHaveLength(5);
    expect(R0.meta.caseLabel).toMatch(/Caso base del Excel/);
    expect(cell(R0, 'keyFacts', 'Valor DCF por acción')[1]).toContain(E.fmt.cur(S0.b.value));
    expect(cell(R0, 'keyFacts', 'Precio objetivo combinado')[1]).toContain(E.fmt.cur(S0.rel.combined!.value as number));
    expect(cell(R0, 'keyFacts', 'Recomendación')[1]).toMatch(/^MANTENER/);
  });
  it('reporte técnico: 16 secciones en orden, tablas y gráficas numeradas sin huecos', () => {
    expect(R0.sections.map(s => s.title.split('.')[0])).toEqual(Array.from({ length: 16 }, (_, i) => String(i + 1)));
    const T = reportTables(R0), G = R0.sections.flatMap(s => s.blocks.filter(b => b.kind === 'chart'));
    expect(T.map(t => t.n)).toEqual(T.map((_, i) => i + 1)); expect(G.map(g => g.n)).toEqual(G.map((_, i) => i + 1));
    T.forEach(t => { expect(t.source.length).toBeGreaterThan(5); t.rows.forEach(r => expect(r.length).toBe(t.head.length)); });
    expect(Object.keys(chartCatalog(S0)).length).toBeGreaterThanOrEqual(12);
  });
  it('transacciones: tabla definitiva por operación con monto, EV en MXN, múltiplos (NA nunca es cero) y decisión', () => {
    const t = reportTables(R0).find(x => x.id === 'sdcDefinitive')!, sd = S0.rel.sdc!;
    expect(t.rows).toHaveLength(sd.spec.deals.length);
    sd.spec.deals.forEach((d, i) => {
      expect(t.rows[i][7]).toEqual(d.evEbitda == null ? 'NA' : expect.stringMatching(/x$/));
      expect(t.rows[i][6]).toBe(d.ev == null ? 'NA' : E.fmt.m(d.ev * sd.spec.fx.rate, 0));
      expect(t.rows[i][10]).toBe(sd.checks[i].include ? 'Incluida' : 'Excluida');
    });
    expect(reportTables(R0).find(x => x.id === 'sdcExcl')!.rows).toHaveLength(sd.checks.filter(c => !c.include).length);
  });
  it('el contraste externo va separado y advierte que no entra al precio oficial', () => {
    const s = R0.sections.find(x => x.id === 'external')!;
    expect(s.blocks[0]).toMatchObject({ kind: 'text', style: 'warn' });
    expect(reportTables(R0).find(t => t.id === 'disc')!.rows.some(r => /39\.21/.test(r.join(' ')))).toBe(true);
  });
  it('resumen ejecutivo: datos clave, campo de fútbol, conclusiones, riesgos y fuentes', () => {
    const X = buildReport(S0, 'exec'), ids = X.sections.flatMap(s => s.blocks.map(b => b.kind === 'text' ? b.style : b.id));
    expect(ids).toEqual(expect.arrayContaining(['keyFacts', 'football', 'def', 'scenTab', 'combined', 'ext', 'bullets', 'p']));
  });
});

describe('escenario modificado', () => {
  const A = { ...D, betaU: 0.9, g: 4 }, S = snapshot(ds, A, when)!, R = buildReport(S, 'full'), b = E.run(ds, A) as E.RunOk;
  it('usa los supuestos activos y lo declara', () => {
    expect(S.isBase).toBe(false);
    expect(S.changes).toEqual([['Beta desapalancada (βU)', D.betaU.toFixed(4), '0.9000'], ['Crecimiento perpetuo g', '3.50%', '4.00%']]);
    expect(R.meta.modified).toBe(true); expect(R.meta.caseLabel).toMatch(/modificado/);
    expect(cell(R, 'keyFacts', 'Valor DCF por acción')[1]).toContain(E.fmt.cur(b.value));
    expect(cell(R, 'changes', 'Crecimiento perpetuo g')).toEqual(['Crecimiento perpetuo g', '3.50%', '4.00%']);
    expect(R.sections[0].blocks[0]).toMatchObject({ kind: 'text', style: 'warn' });
  });
  it('cambiar la muestra de transacciones o los pesos también cuenta como modificado', () => {
    expect(snapshot(ds, { ...D, sdcInclude: { [S0.rel.sdc!.spec.deals[0].id]: 1 } })!.isBase).toBe(false);
    expect(snapshot(ds, { ...D, weights: { dcf: 1, comps: 0, transactions: 0 } })!.changes.map(c => c[0])).toContain('Pesos DCF / Comps / Transacciones');
  });
  it('JSON reabrible: dataset + supuestos activos + resultados', () => {
    const j = JSON.parse(valuationJson(S));
    expect(j.format).toBe('valuflow/2'); expect(j.dataset.id).toBe(ds.id); expect(j.assumptions).toEqual(A);
    expect(j.results.dcf).toBeCloseTo(b.value, 5); expect(j.case.isBase).toBe(false);
    expect((E.run(j.dataset, j.assumptions) as E.RunOk).value).toBeCloseTo(b.value, 10);
  });
});

describe('archivos', () => {
  it('CSV: UTF-8 con BOM, una fila por celda de cada tabla', () => {
    const c = csvAll(R0);
    expect(c.charCodeAt(0)).toBe(0xfeff);
    expect(c).toContain('tabla,titulo,concepto,columna,valor');
    const n = reportTables(R0).reduce((a, t) => a + t.rows.length * (t.head.length - 1), 0);
    expect(c.trim().split('\r\n').length).toBe(5 + n);
    expect(tableCsv(reportTables(R0)[0]).charCodeAt(0)).toBe(0xfeff);
  });
  it('números del reporte a celdas numéricas de Excel', () => {
    expect(parseCell('$31.62')).toEqual({ v: 31.62, fmt: '$#,##0.00' });
    expect(parseCell('11.38%').v).toBeCloseTo(0.1138, 10); expect(parseCell('−5.6%').v).toBeCloseTo(-0.056, 10);
    expect(parseCell('5.81x')).toEqual({ v: 5.81, fmt: '0.00"x"' }); expect(parseCell('(1,234.5)').v).toBe(-1234.5);
    expect(parseCell('67,198').v).toBe(67198); expect(parseCell('NA').v).toBe('NA'); expect(parseCell('4338758040').v).toBe('4338758040');
    expect(parseCell('01-oct-2026').v).toBe('01-oct-2026');
  });
  it('libro de Excel: hojas con fórmulas que apuntan a Supuestos y los valores de la app para comparar', async () => {
    const bytes = await buildXlsx(R0, {}), wb = new ExcelJS.Workbook();
    await wb.xlsx.load(bytes.buffer as ArrayBuffer);
    const names = wb.worksheets.map(w => w.name);
    expect(names.slice(0, 7)).toEqual(['Portada', 'Supuestos', 'WACC', 'FCFF y valuación', 'Transacciones SDC', 'Combinada', '01 Resumen ejecutivo']);
    expect(names).toHaveLength(7 + 14); // secciones 1 a 15 (la 16 solo tiene tablas si hay supuestos modificados)
    const F = wb.getWorksheet('FCFF y valuación')!;
    expect((F.getCell('B32').value as { formula: string }).formula).toBe('B31/Supuestos!$B$22');
    expect(F.getCell('B36').value).toBeCloseTo(S0.b.value, 10);
    expect((wb.getWorksheet('Combinada')!.getCell('B11').value as { formula: string }).formula).toMatch(/COMPRAR/);
    const P = wb.getWorksheet('Portada')!, col = Array.from({ length: 20 }, (_, i) => P.getCell(i + 1, 1).value);
    PROJECT.team.forEach(([n]) => expect(col).toContain(n));
  });
});
