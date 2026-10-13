// El libro de Excel exportado: hojas pedidas y fórmulas vivas en la Proyección FCFF.
import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import ExcelJS from 'exceljs';
import * as E from '../src/engine';
import { soriana as ds } from '../src/data/soriana';
import { bundle } from '../src/report/bundle';
import { buildReport, numberBlocks } from '../src/report/content';
import { buildXlsx, tableCsv } from '../src/services/xlsx';

const SHEETS = ['Resumen', 'Supuestos', 'Inflación', 'Inflación vs precio', 'Precio e IPC', 'Beta', 'WACC', 'Proyección FCFF', 'Escenarios', 'Sensibilidad', 'Validación', 'Conclusiones', 'Fuentes'];

describe('Excel exportado', async () => {
  const R = buildReport(bundle(ds, E.defaults(ds))!); numberBlocks(R.sections);
  const bytes = await buildXlsx(R, {});
  if (process.env.XLSX_OUT) writeFileSync(process.env.XLSX_OUT, bytes);
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(bytes.buffer as ArrayBuffer);
  it('trae las 13 hojas', () => expect(wb.worksheets.map(w => w.name)).toEqual(SHEETS));
  it('la Proyección FCFF usa fórmulas que leen Supuestos', () => {
    const ws = wb.getWorksheet('Proyección FCFF')!;
    expect((ws.getCell('B31').value as any).formula).toBe('B30/Supuestos!$B$18');
    expect((ws.getCell('B14').value as any).formula).toContain('Supuestos!');
  });
  it('CSV con BOM y punto decimal', () => { const t = R.sections.flatMap(s => s.blocks).find(b => b.kind === 'table' && b.id === 'scen') as any; const c = tableCsv(t); expect(c.charCodeAt(0)).toBe(0xfeff); expect(c).toContain('39.2103'); });
});
