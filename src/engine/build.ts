// Proyección construida desde drivers: réplica 1:1 de la hoja "Proyección Final" del Excel
// (variables externas + mínimos cuadrados → estado de resultados, balance, conciliación de efectivo y FCF).
// La inflación entra SOLO por el crecimiento nominal del mercado, como en el Excel (fila 14).
// El orden de las operaciones sigue al de las celdas para reproducir el resultado del Excel.
import type { BuildResult, BuildSpec, BuildYear, Dataset, InflationSpec } from './types';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Trayectoria de inflación (una fracción por año) del escenario indicado. */
export function inflationPath(spec: InflationSpec, key: string | undefined, n: number): number[] {
  const s = spec.scenarios[key ?? spec.default] ?? spec.scenarios[spec.default];
  if (!s) throw new Error('Escenario de inflación desconocido: ' + key);
  if (s.path) return s.path.slice(0, n);
  return Array(n).fill(s.value as number);
}

export function buildForecast(B: BuildSpec, years: string[], inflation: number[], scenario: string | null = null): BuildResult {
  const n = years.length, out: BuildYear[] = [];
  let p = {
    revenue: B.base.revenue, cash: B.base.cash, inventory: B.base.inventory, otherCA: B.base.otherCA, nonCurrent: B.base.nonCurrent,
    opCL: B.base.opCL, debt: B.base.debt, lease: B.base.lease, otherLT: B.base.otherLT, equity: B.base.equity, marginExternal: B.margin.base
  };
  for (let i = 0; i < n; i++) {
    const w = B.weightsExternal[i], wl = 1 - w, S = B.sales;
    // B. Crecimiento de ventas (filas 10–28)
    const marketGrowth = inflation[i] + S.gdp[i] * S.elasticity[i] + S.consumptionAdj[i];
    const growthExternal = marketGrowth + sum(S.adjustments.map(a => a.values[i]));
    const growthLS = S.lsSales[i + 1] / S.lsSales[i] - 1;
    const growth = w * growthExternal + wl * growthLS;
    // D. Margen EBIT (filas 31–41) y E. otros supuestos (44–55)
    const marginExternal = p.marginExternal + sum(B.margin.adjustments.map(a => a.values[i]));
    const margin = w * marginExternal + wl * B.margin.ls[i];
    const daPct = w * B.da.ext[i] + wl * B.da.ls[i];
    const revenue = p.revenue * (1 + growth);
    const guide = B.capex.guide[i];
    const capexPctExternal = guide != null ? guide / revenue : B.capex.basePct * (1 + B.capex.extAdj) + B.capex.add[i];
    const capexPct = w * capexPctExternal + wl * B.capex.ls[i];
    const taxRate = w * (B.tax.base + B.tax.adj[i]) + wl * B.tax.ls[i];
    // 1.1 Estado de resultados (filas 67–79)
    const cogs = -revenue * B.costPct[i], gross = revenue + cogs;
    const opex = -revenue * (1 - B.costPct[i] - daPct - margin);
    const ebitda = gross + opex, da = -revenue * daPct, ebit = ebitda + da;
    const interest = -B.interestRate[i] * (p.debt + p.lease), otherIncome = B.otherIncome[i];
    const ebt = ebit + interest + otherIncome, taxes = -ebt * taxRate, netIncome = ebt + taxes, dividends = -netIncome * B.payout[i];
    // 1.2 Balance y 1.3 conciliación de efectivo (filas 84–108)
    const inventory = -cogs * B.invDays[i] / 365, otherCA = revenue * B.otherCAPct[i], opCL = revenue * B.opCLPct[i];
    const debt = Math.max(0, p.debt + B.debtAmort[i]), lease = p.lease, otherLT = p.otherLT;
    const capex = -revenue * capexPct;
    const nonCurrent = p.nonCurrent - capex + da;
    const dInventory = -(inventory - p.inventory), dOtherCA = -(otherCA - p.otherCA), dOpCL = opCL - p.opCL, dDebt = debt - p.debt;
    const cashChange = sum([netIncome, -da, dInventory, dOtherCA, capex, dOpCL, dividends, dDebt]);
    const cash = p.cash + cashChange, equity = p.equity + netIncome + dividends;
    const currentAssets = sum([cash, inventory, otherCA]), totalAssets = currentAssets + nonCurrent;
    const totalLiabilities = sum([opCL, debt, lease, otherLT]), liabEquity = totalLiabilities + equity;
    // 2. FCF (filas 111–117)
    const taxEbitNeg = -ebit * taxRate, nopat = ebit + taxEbitNeg, nwcRelease = dInventory + dOtherCA + dOpCL;
    const fcf = sum([nopat, -da, capex, nwcRelease]);
    out.push({
      year: years[i], inflation: inflation[i], marketGrowth, growthExternal, growthLS, growth, marginExternal, margin, daPct, capexPctExternal, capexPct, taxRate,
      revenue, cogs, gross, opex, ebitda, da: -da, ebit, interest, otherIncome, ebt, taxes, netIncome, dividends,
      cash, inventory, otherCA, currentAssets, nonCurrent, totalAssets, opCL, debt, lease, otherLT, totalLiabilities, equity, liabEquity, check: totalAssets - liabEquity,
      dInventory, dOtherCA, capex: -capex, dOpCL, dDebt, cashChange, taxEbit: -taxEbitNeg, nopat, nwcRelease, fcf
    });
    p = { revenue, cash, inventory, otherCA, nonCurrent, opCL, debt, lease, otherLT, equity, marginExternal };
  }
  return {
    scenario, inflation: inflation.slice(0, n), years: out,
    rows: { revenue: out.map(y => y.revenue), ebit: out.map(y => y.ebit), taxEbit: out.map(y => y.taxEbit), da: out.map(y => y.da), capex: out.map(y => y.capex), nwcRelease: out.map(y => y.nwcRelease) }
  };
}

/** Proyección del dataset con el escenario de inflación indicado (null si el dataset no se construye por drivers). */
export function buildFor(ds: Dataset, scenario?: string): BuildResult | null {
  const B = ds.forecast.build;
  if (!B) return null;
  const n = ds.forecast.years.length;
  if (!ds.inflation) throw new Error('La proyección por drivers requiere escenarios de inflación (dataset.inflation).');
  const key = scenario && ds.inflation.scenarios[scenario] ? scenario : ds.inflation.default;
  return buildForecast(B, ds.forecast.years, inflationPath(ds.inflation, key, n), key);
}
