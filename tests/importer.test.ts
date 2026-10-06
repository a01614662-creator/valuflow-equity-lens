// El flujo "Nueva valuación" para una empresa distinta de Soriana: archivo tipo Capital IQ → dataset → valuación.
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import * as E from '../src/engine';
import { buildFromImport, parseWorkbook } from '../src/services/importer';
import { checkDataset } from '../src/data/registry';
import { csvContent } from '../src/services/exporter';
import { loadLegacy } from './legacy';

// Encabezados de periodo: estilo Capital IQ ("Dec-31-2024") o estilo "FY2024".
const CIQ = ['Dec-31-2022', 'Dec-31-2023', 'Dec-31-2024', 'LTM Jun-30-2025', 'Dec-31-2025E'];
const FY = ['FY2022', 'FY2023', 'FY2024', 'LTM', 'FY2025E'];

function capitalIqWorkbook(periods = CIQ) {
  const wb = XLSX.utils.book_new();
  const head = (t: string) => [['Contoso Retail Inc. (NYSE:CTSO) > Financials > ' + t], ['In Millions of the reporting currency USD'], [], ['', ...periods]];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...head('Income Statement'),
    ['Total Revenue', '10,000', '10,800', '11,500', '11,700', '12,300'], ['Operating Income', '900', '980', '1,050', '1,060', '1,120'],
    ['EBITDA', '1,300', '1,400', '1,500', '1,510', '1,600'], ['EBT Incl. Unusual Items', '800', '860', '940', '950', '1,000'],
    ['Income Tax Expense', '(200)', '(215)', '(235)', '(238)', '(250)'], ['Net Income', '600', '645', '705', '712', '750'],
    ['Interest Expense', '(90)', '(88)', '(85)', '(85)', '(80)'], ['Gross Margin %', '25%', '25%', '25%', '25%', '25%']]), 'Income Statement');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...head('Balance Sheet'),
    ['Cash And Equivalents', '500', '550', '600', '610', ''], ['Total Current Assets', '3,000', '3,100', '3,300', '3,320', ''],
    ['Total Current Liabilities', '2,400', '2,450', '2,550', '2,560', ''], ['Total Debt', '1,200', '1,150', '1,100', '1,090', ''], ['Total Assets', '9,000', '9,300', '9,700', '9,750', '']]), 'Balance Sheet');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...head('Cash Flow'),
    ['Depreciation & Amort., Total', '400', '420', '450', '452', '480'], ['Capital Expenditure', '(500)', '(520)', '(560)', '(565)', '(600)']]), 'Cash Flow');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...head('Key Stats'),
    ['Total Shares Out. on Filing Date', '', '', '400', '400', ''], ['Last Close Price', '', '', '25.50', '25.50', ''], ['Beta 5 Year', '', '', '0.95', '0.95', '']]), 'Key Stats');
  return wb;
}

describe('importador', () => {
  const wb = capitalIqWorkbook();
  const P = parseWorkbook(wb as never, 'Contoso Retail NYSE CTSO Financials.xlsx', XLSX as never);
  const F: Record<string, number | null> = {}; P.fields.forEach(f => { F[f.key] = f.value; });

  it('detecta empresa, ticker, moneda y unidades', () => {
    expect(P.meta).toMatchObject({ name: 'Contoso Retail Inc.', exchange: 'NYSE', ticker: 'CTSO', currency: 'USD', units: 'millones' });
  });

  it('mapea los campos requeridos con el último año real (no estimados)', () => {
    expect(F.revenue).toBe(11500); expect(F.ebit).toBe(1050); expect(F.capex).toBe(560); expect(F.da).toBe(450);
    expect(F.cash).toBe(600); expect(F.debt).toBe(1100); expect(F.shares).toBe(400); expect(F.price).toBe(25.5);
    expect(P.fields.filter(f => f.req).every(f => f.value != null)).toBe(true);
  });

  it('con encabezados estilo Capital IQ es idéntico al importador original', () => {
    const { VF } = loadLegacy({ XLSX });
    const legacy = VF.parseWorkbook(wb, 'Contoso Retail NYSE CTSO Financials.xlsx');
    // Mismo valor, periodo, origen y confianza por campo. (La única diferencia: ahora también se
    // reconoce la columna estimada "Dec-31-2025E" como periodo; se sigue excluyendo de los datos reales.)
    const key = (x: typeof P) => ({ meta: x.meta, fields: x.fields.map(f => [f.key, f.value, f.period, f.srcLabel, f.srcSheet, f.conf, f.status, f.hist]) });
    expect(JSON.parse(JSON.stringify(key(P)))).toEqual(JSON.parse(JSON.stringify(key(legacy))));
  });

  it('reconoce encabezados "FY2024" (el prototipo tomaba por error la columna LTM)', () => {
    const P2 = parseWorkbook(capitalIqWorkbook(FY) as never, 'x.xlsx', XLSX as never);
    const rev = P2.fields.find(f => f.key === 'revenue')!;
    expect(rev.value).toBe(11500); expect(rev.period).toBe('FY2024');
    expect(rev.hist.map(h => h.year)).toEqual([2022, 2023, 2024]);
    const { VF } = loadLegacy({ XLSX });
    expect(VF.parseWorkbook(capitalIqWorkbook(FY), 'x.xlsx').fields[0].value).toBe(11700);
  });

  it('crea un dataset válido y el mismo motor lo valúa', () => {
    const ds = buildFromImport(P, F, { name: 'Contoso Retail Inc.', ticker: 'CTSO', exchange: 'NYSE', currency: 'USD', rf: 4.2, prm: 5.5, betaU: 0.8, g: 2.5, growth: 4, margin: 9, taxF: 25, daPct: 3.9, capexPct: 4.8 });
    expect(checkDataset(ds)).toEqual([]);
    expect(ds.forecast.years).toEqual(['2025E', '2026E', '2027E', '2028E', '2029E']);
    const A = E.defaults(ds), b = E.run(ds, A);
    expect(b.ok).toBe(true);
    if (!b.ok) return;
    expect(b.value).toBeGreaterThan(0);
    expect(b.roll).toBeNull();
    // Sin resultados de referencia, la validación solo hace comprobaciones internas y todas pasan.
    expect(E.validate(ds, A, b, true).every(c => c.status === 'pass')).toBe(true);
    // Las etiquetas se derivan solas para una empresa importada.
    expect(E.labelsOf(ds)).toMatchObject({ closeDate: 'cierre de 2024', sourceShort: 'Archivo' });
    expect(csvContent(ds, b).split('\n').length).toBeGreaterThan(40);
  });

  it('respeta un horizonte de proyección distinto a 5 años', () => {
    const ds = buildFromImport(P, F, { name: 'Contoso', rf: 4.2, prm: 5.5, betaU: 0.8, g: 2.5, growth: 4, margin: 9, taxF: 25, daPct: 3.9, capexPct: 4.8 }, 7);
    const b = E.run(ds, E.defaults(ds));
    expect(b.rows.length).toBe(7);
    expect(b.ok).toBe(true);
  });
});
