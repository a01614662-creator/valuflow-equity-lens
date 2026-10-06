// ValuFlow · Motor de valuación reutilizable. No contiene datos de ninguna empresa.
// Capas: drivers → proyección FCFF → WACC (CAPM + iteración) → valor terminal (Gordon / múltiplo) → EV → Equity → valor por acción.
(function () {
  const VF = (window.VF = window.VF || {});
  const fin = v => typeof v === 'number' && isFinite(v);
  const ratio = s => (typeof s === 'string' && s.startsWith('r:')) ? (s.slice(2).split('/').map(Number).reduce((a, b) => a / b)) : s;
  const arr = (v, n) => { v = ratio(v); return Array.isArray(v) ? v.slice(0, n).map(ratio) : Array(n).fill(v); };

  // ---------- Formato ----------
  const nf = (d) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  VF.fmt = {
    m: (v, d = 0) => fin(v) ? (v < 0 ? '(' + nf(d).format(-v) + ')' : nf(d).format(v)) : '—',
    n: (v, d = 0) => fin(v) ? nf(d).format(v) : '—',
    p: (v, d = 2) => fin(v) ? nf(d).format(v * 100) + '%' : '—',
    pp: (v, d = 1) => fin(v) ? (v >= 0 ? '+' : '−') + nf(d).format(Math.abs(v * 100)) + '%' : '—',
    x: (v, d = 2) => fin(v) ? nf(d).format(v) + 'x' : '—',
    cur: (v, d = 2) => fin(v) ? (v < 0 ? '−$' : '$') + nf(d).format(Math.abs(v)) : '—'
  };

  // ---------- Supuestos por defecto (vienen del dataset) ----------
  VF.defaults = function (ds) {
    const w = ds.wacc || {}, v = ds.valuation || {}, m = ds.market || {}, b = v.bridge || {}, r = v.roll || {};
    return {
      forecastKey: 'final', dGrowth: 0, dMargin: 0, dCapex: 0, dTax: 0,
      g: v.g, waccMode: w.mode || 'iterated', waccManual: w.start ?? 12, keFixed: null,
      rf: w.rf, prm: w.prm, betaU: w.betaU, kdPre: w.kdPre, kdMarket: w.kdMarket ?? w.kdPre, taxShield: w.taxShield, taxMarket: w.taxMarket ?? w.taxShield,
      exitMultiple: v.exitMultiple ?? null, wGordon: Math.round((v.wGordon ?? 1) * 100),
      price: m.price, shares: m.shares, rollEnabled: !!r.enabled,
      bridgeDebt: b.debt ?? 0, bridgeLease: b.lease ?? 0, bridgeCash: b.cash ?? 0
    };
  };

  // ---------- Drivers de proyección ----------
  VF.drivers = function (ds, key) {
    const f = ds.forecast, n = f.years.length, rev0 = f.base.revenue;
    const alt = key && key !== 'final' && ds.altForecasts && ds.altForecasts[key];
    if (alt || !f.rows) {
      const d = alt ? alt.drivers : f.drivers;
      const nwcPct = arr(d.nwcPct, n);
      return { years: f.years, n, rev0, nwc0: f.base.nwc ?? nwcPct[0] * rev0, growth: arr(d.growth, n), margin: arr(d.margin, n), tax: arr(d.tax, n), da: arr(d.da, n), capex: arr(d.capex, n), nwcPct, derived: false };
    }
    const R = f.rows, out = { years: f.years, n, rev0, nwc0: f.base.nwc, growth: [], margin: [], tax: [], da: [], capex: [], nwcPct: [], derived: true };
    let prev = rev0, nwc = f.base.nwc;
    for (let i = 0; i < n; i++) {
      const rv = R.revenue[i];
      out.growth.push(rv / prev - 1); prev = rv;
      out.margin.push(R.ebit[i] / rv); out.tax.push(R.taxEbit[i] / R.ebit[i]);
      out.da.push(R.da[i] / rv); out.capex.push(R.capex[i] / rv);
      nwc = nwc - R.nwcRelease[i]; out.nwcPct.push(nwc / rv);
    }
    return out;
  };

  VF.project = function (ds, A) {
    const D = VF.drivers(ds, A.forecastKey), rows = [];
    let rev = D.rev0, nwcPrev = D.nwc0;
    for (let i = 0; i < D.n; i++) {
      const gr = D.growth[i] + A.dGrowth / 100;
      rev = rev * (1 + gr);
      const margin = D.margin[i] + A.dMargin / 100, taxRate = D.tax[i] + A.dTax / 100;
      const ebit = rev * margin, tax = ebit * taxRate, nopat = ebit - tax;
      const da = rev * D.da[i], capex = rev * (D.capex[i] + A.dCapex / 100);
      const nwc = rev * D.nwcPct[i], dNwc = nwc - nwcPrev; nwcPrev = nwc;
      const fcf = nopat + da - capex - dNwc;
      rows.push({ year: D.years[i], n: i + 1, growth: gr, revenue: rev, margin, ebit, taxRate, tax, nopat, da, capex, capexPct: D.capex[i] + A.dCapex / 100, nwc, dNwc, fcf, ebitda: ebit + da });
    }
    return { rows, drivers: D };
  };

  function evGordon(rows, w, g) {
    let s = 0; rows.forEach((r, i) => { s += r.fcf / Math.pow(1 + w, i + 1); });
    const last = rows[rows.length - 1];
    return s + last.fcf * (1 + g) / (w - g) / Math.pow(1 + w, rows.length);
  }

  // ---------- WACC: mercado, iterado al valor DCF, o manual ----------
  VF.wacc = function (ds, A, rows) {
    const W = ds.wacc || {}, g = A.g / 100, rf = A.rf / 100, prm = A.prm / 100, bu = A.betaU;
    const D = W.debt ?? (A.bridgeDebt + A.bridgeLease);
    const nd = A.bridgeDebt + A.bridgeLease - A.bridgeCash;
    const tm = A.taxMarket / 100, Em = A.price * A.shares;
    const deM = D / Em, betaM = bu * (1 + (1 - tm) * deM), keM = rf + betaM * prm, kdM = A.kdMarket / 100;
    const market = { E: Em, D, de: deM, beta: betaM, ke: keM, kd: kdM, kdAT: kdM * (1 - tm), wE: Em / (D + Em), wD: D / (D + Em), tax: tm };
    market.wacc = market.wE * keM + market.wD * market.kdAT;
    const t = A.taxShield / 100, kdAT = A.kdPre / 100 * (1 - t);
    const iters = []; let w = fin(market.wacc) ? market.wacc : 0.12, conv = null;
    for (let k = 0; k < 14; k++) {
      if (!(w > g)) break;
      const E = evGordon(rows, w, g) - nd; if (!(E > 0)) break;
      const de = D / E, beta = bu * (1 + (1 - t) * de), ke = rf + beta * prm;
      const wout = E / (D + E) * ke + D / (D + E) * kdAT;
      iters.push({ k, win: w, E, de, beta, ke, wout, wE: E / (D + E), wD: D / (D + E) });
      conv = iters[iters.length - 1];
      if (Math.abs(wout - w) < 1e-10) break; w = wout;
    }
    const iterated = conv ? { wacc: conv.wout, ke: conv.ke, beta: conv.beta, de: conv.de, E: conv.E, D, wE: conv.wE, wD: conv.wD, kd: A.kdPre / 100, kdAT, tax: t, converged: iters.length > 1 && Math.abs(conv.wout - conv.win) < 1e-6 } : null;
    let wacc, ke, src;
    if (A.waccMode === 'market') { wacc = market.wacc; ke = market.ke; src = market; }
    else if (A.waccMode === 'manual') { wacc = A.waccManual / 100; ke = A.keFixed != null ? A.keFixed / 100 : (iterated ? iterated.ke : market.ke); src = iterated || market; }
    else { wacc = iterated ? iterated.wacc : NaN; ke = iterated ? iterated.ke : NaN; src = iterated; }
    return { wacc, ke, mode: A.waccMode, market, iterated, iters, src, rf, prm, betaU: bu };
  };

  // ---------- Ejecución completa ----------
  VF.run = function (ds, A) {
    const errors = [], warnings = [];
    const P = VF.project(ds, A), rows = P.rows, n = rows.length;
    const g = A.g / 100, shares = +A.shares, price = +A.price;
    if (!fin(A.g)) errors.push('Falta el crecimiento perpetuo (g).');
    if (!(shares > 0)) errors.push('No fue posible calcular el valor intrínseco porque falta el número de acciones en circulación.');
    if (!(price > 0)) warnings.push('No hay precio de mercado: no se puede calcular el upside/downside.');
    if (!rows.every(r => fin(r.fcf))) errors.push('Faltan datos necesarios para proyectar el FCFF.');
    const W = VF.wacc(ds, A, rows);
    if (!fin(W.wacc)) errors.push('No fue posible calcular el WACC con los insumos actuales.');
    else if (!(W.wacc > g)) errors.push('El crecimiento perpetuo debe ser menor que el WACC.');
    if (errors.length) return { ok: false, errors, warnings, rows, W, drivers: P.drivers };
    const w = W.wacc; let pvSum = 0;
    rows.forEach((r, i) => { r.df = 1 / Math.pow(1 + w, i + 1); r.pv = r.fcf * r.df; pvSum += r.pv; });
    const last = rows[n - 1], dfN = last.df;
    const fcfN1 = last.fcf * (1 + g), tvG = fcfN1 / (w - g), pvTvG = tvG * dfN, evG = pvSum + pvTvG;
    const mult = A.exitMultiple > 0 ? A.exitMultiple : null;
    const tvM = mult ? last.ebitda * mult : null, pvTvM = mult ? tvM * dfN : null, evM = mult ? pvSum + pvTvM : null;
    const wG = mult ? Math.min(1, Math.max(0, A.wGordon / 100)) : 1;
    const evW = mult ? wG * evG + (1 - wG) * evM : evG;
    const nd = A.bridgeDebt + A.bridgeLease - A.bridgeCash;
    const eqClose = evW - nd, priceClose = eqClose / shares;
    const priceG = (evG - nd) / shares, priceM = mult ? (evM - nd) / shares : null;
    const R = (ds.valuation && ds.valuation.roll) || {};
    let roll = null, eqVal = eqClose, value = priceClose;
    if (A.rollEnabled && R.enabled !== undefined) {
      const cap = Math.pow(1 + w, R.t1), evCap = evW * cap, ev2 = evCap + R.fcfGenerated;
      const eq2 = ev2 - R.debt - R.lease + R.cash, keCap = Math.pow(1 + W.ke, R.t2), eq3 = eq2 * keCap;
      roll = { t1: R.t1, t2: R.t2, cap, evCap, capGain: evCap - evW, fcfGenerated: R.fcfGenerated, ev2, debt: R.debt, lease: R.lease, cash: R.cash, eq2, keCap, keGain: eq3 - eq2, eq3 };
      eqVal = eq3; value = eq3 / shares;
    }
    const upside = price > 0 ? value / price - 1 : null;
    const th = ((ds.valuation && ds.valuation.signalThreshold) ?? 15) / 100;
    const signal = upside == null ? null : (Math.abs(upside) <= th ? 'Mantener' : (upside > 0 ? 'Valor por encima del umbral' : 'Valor por debajo del umbral'));
    return {
      ok: true, errors, warnings, rows, drivers: P.drivers, W, wacc: w, ke: W.ke, g,
      pvSum, fcfN1, tvG, pvTvG, evG, mult, tvM, pvTvM, evM, wG, evW, nd, eqClose, priceClose, priceG, priceM,
      pvTvW: wG * pvTvG + (1 - wG) * (pvTvM || 0), tvWeightG: pvTvG / evG, tvWeightW: (wG * pvTvG + (1 - wG) * (pvTvM || 0)) / evW,
      roll, eqVal, ev: roll ? roll.ev2 : evW, value, price, shares, upside, signal, threshold: th,
      impliedMultiple: tvG / last.ebitda
    };
  };

  // ---------- Sensibilidad, tornado y escenarios ----------
  VF.grid = function (ds, A, base, stepW = 0.5, stepG = 0.5) {
    const ws = [-2, -1, 0, 1, 2].map(k => base.wacc * 100 + k * stepW), gs = [-2, -1, 0, 1, 2].map(k => A.g + k * stepG);
    const cells = ws.map(wv => gs.map(gv => { const r = VF.run(ds, { ...A, waccMode: 'manual', waccManual: wv, g: gv, keFixed: base.ke * 100 }); return r.ok ? r.value : null; }));
    return { ws, gs, cells };
  };
  VF.tornado = function (ds, A, base) {
    const fix = { waccMode: 'manual', waccManual: base.wacc * 100, keFixed: base.ke * 100 };
    const F = [
      ['WACC', 'pp', 1.0, (d) => ({ waccManual: base.wacc * 100 + d })],
      ['Crecimiento perpetuo (g)', 'pp', 1.0, (d) => ({ g: A.g + d })],
      ['Crecimiento de ventas', 'pp', 2.0, (d) => ({ dGrowth: A.dGrowth + d })],
      ['Margen EBIT', 'pp', 0.5, (d) => ({ dMargin: A.dMargin + d })],
      ['Capex (% ventas)', 'pp', 0.5, (d) => ({ dCapex: A.dCapex + d })],
      ['Tasa de impuestos', 'pp', 4.0, (d) => ({ dTax: A.dTax + d })]
    ];
    if (base.mult) F.push(['Múltiplo EV/EBITDA', 'x', 1.0, (d) => ({ exitMultiple: A.exitMultiple + d })]);
    return F.map(([label, unit, step, fn]) => {
      const lo = VF.run(ds, { ...A, ...fix, ...fn(-step) }), hi = VF.run(ds, { ...A, ...fix, ...fn(step) });
      const l = lo.ok ? lo.value : null, h = hi.ok ? hi.value : null;
      return { label, unit, step, low: l, high: h, range: (l != null && h != null) ? Math.abs(h - l) : 0 };
    }).sort((a, b) => b.range - a.range);
  };
  VF.scenarios = function (ds, A, base) {
    const fix = { waccMode: 'manual', keFixed: base.ke * 100 };
    const mk = (s) => ({ ...A, ...fix, waccManual: base.wacc * 100 + s * 0.5, g: A.g - s * 0.5, dGrowth: A.dGrowth - s * 1.0, dMargin: A.dMargin - s * 0.25 });
    const p = VF.run(ds, mk(1)), o = VF.run(ds, mk(-1));
    return [
      { key: 'pes', label: 'Pesimista', desc: 'WACC +0.5 pp · g −0.5 pp · ventas −1 pp · margen −0.25 pp', value: p.ok ? p.value : null, upside: p.ok ? p.upside : null },
      { key: 'base', label: 'Base', desc: 'Supuestos activos del modelo', value: base.value, upside: base.upside },
      { key: 'opt', label: 'Optimista', desc: 'WACC −0.5 pp · g +0.5 pp · ventas +1 pp · margen +0.25 pp', value: o.ok ? o.value : null, upside: o.ok ? o.upside : null }
    ];
  };
  VF.methods = function (ds, A, base) {
    const fix = { waccMode: 'manual', keFixed: base.ke * 100 };
    const lo = VF.run(ds, { ...A, ...fix, waccManual: base.wacc * 100 + 0.5, g: A.g - 0.5 });
    const hi = VF.run(ds, { ...A, ...fix, waccManual: base.wacc * 100 - 0.5, g: A.g + 0.5 });
    const out = [];
    out.push({ key: 'gordon', label: 'DCF · crecimiento perpetuo', sub: 'Gordon, al cierre de 2025', value: base.priceG, lo: lo.ok ? lo.priceG : null, hi: hi.ok ? hi.priceG : null });
    if (base.mult) {
      const ml = VF.run(ds, { ...A, exitMultiple: A.exitMultiple - 0.5 }), mh = VF.run(ds, { ...A, exitMultiple: A.exitMultiple + 0.5 });
      out.push({ key: 'mult', label: 'DCF · múltiplo de salida', sub: 'EV/EBITDA ' + VF.fmt.x(A.exitMultiple), value: base.priceM, lo: ml.ok ? ml.priceM : null, hi: mh.ok ? mh.priceM : null });
      out.push({ key: 'w', label: 'Ponderado', sub: Math.round(base.wG * 100) + '% Gordon · ' + Math.round((1 - base.wG) * 100) + '% múltiplo', value: base.priceClose, lo: lo.ok ? lo.priceClose : null, hi: hi.ok ? hi.priceClose : null });
    }
    if (base.roll) out.push({ key: 'final', label: 'Precio objetivo', sub: 'A la fecha de valuación', value: base.value, lo: lo.ok ? lo.value : null, hi: hi.ok ? hi.value : null, main: true });
    else out[out.length - 1].main = true;
    if (ds.altForecasts) Object.keys(ds.altForecasts).forEach(k => {
      const af = ds.altForecasts[k], r = VF.run(ds, { ...A, ...af.overrides, forecastKey: k, dGrowth: 0, dMargin: 0, dCapex: 0, dTax: 0 });
      if (r.ok) out.push({ key: k, label: 'Proyección base anterior', sub: 'Supuestos constantes', value: r.value, lo: null, hi: null, ref: true });
    });
    const m = ds.market || {};
    if (m.consensus) out.push({ key: 'cons', label: 'Consenso de analistas', sub: m.consensusLabel || '', value: m.consensus, lo: null, hi: null, ref: true });
    if (m.low52 && m.high52) out.push({ key: '52w', label: 'Rango 52 semanas', sub: 'Mercado', value: null, lo: m.low52, hi: m.high52, ref: true });
    return out;
  };

  // ---------- Validación ----------
  VF.validate = function (ds, A, base, isBase) {
    const E = ds.expected, checks = [];
    const add = (group, label, ok, detail, calc, exp) => checks.push({ group, label, status: ok === null ? 'na' : (ok ? 'pass' : 'review'), detail, calc, exp });
    const m = ds.market || {};
    add('Datos', 'Acciones en circulación > 0', A.shares > 0, 'Acciones: ' + VF.fmt.n(A.shares, 1) + ' mm');
    add('Datos', 'Precio de mercado disponible', A.price > 0, 'Precio: ' + VF.fmt.cur(A.price));
    add('Datos', 'Proyección completa (' + ds.forecast.years.length + ' años)', base.ok && base.rows.every(r => fin(r.fcf)), ds.forecast.years.join(' · '));
    if (!base.ok) { base.errors.forEach(e => add('Modelo', e, false, '')); return checks; }
    add('Modelo', 'WACC > g', base.wacc > base.g, VF.fmt.p(base.wacc) + ' > ' + VF.fmt.p(base.g));
    if (base.W.iterated) add('Modelo', 'Iteración del WACC convergió', base.W.iterated.converged, base.W.iters.length + ' iteraciones');
    const b = base.rows.reduce((s, r) => s + r.pv, 0);
    add('Modelo', 'Σ VP de FCF = VPN explícito', Math.abs(b - base.pvSum) < 1e-6, VF.fmt.m(base.pvSum, 1));
    add('Modelo', 'EV = VPN FCF + VP valor terminal', Math.abs(base.evG - base.pvSum - base.pvTvG) < 1e-6, VF.fmt.m(base.evG, 1));
    add('Modelo', 'Equity = EV − deuda neta', Math.abs(base.eqClose - (base.evW - base.nd)) < 1e-6, VF.fmt.m(base.eqClose, 1));
    const s = VF.scenarios(ds, A, base);
    add('Modelo', 'Escenarios ordenados (pesimista < base < optimista)', s[0].value < s[1].value && s[1].value < s[2].value, s.map(x => VF.fmt.cur(x.value)).join(' · '));
    if (E && isBase) {
      const tol = (c, e, t) => Math.abs(c - e) <= t;
      base.rows.forEach((r, i) => add('Excel', 'FCF ' + r.year, tol(r.fcf, E.fcf[i], 1.0), '', VF.fmt.m(r.fcf, 1), VF.fmt.m(E.fcf[i], 1)));
      [['WACC iterado', base.wacc * 100, E.wacc, 0.01, v => v.toFixed(2) + '%'], ['Ke', base.ke * 100, E.ke, 0.01, v => v.toFixed(2) + '%'],
       ['VPN FCF 2026E–2030E', base.pvSum, E.pvFcf, 3, v => VF.fmt.m(v, 1)], ['Valor terminal (Gordon)', base.tvG, E.tvG, 25, v => VF.fmt.m(v, 1)],
       ['VP valor terminal (Gordon)', base.pvTvG, E.pvTvG, 15, v => VF.fmt.m(v, 1)], ['EV Gordon', base.evG, E.evG, 25, v => VF.fmt.m(v, 1)],
       ['EV múltiplos', base.evM, E.evM, 15, v => VF.fmt.m(v, 1)], ['EV ponderado', base.evW, E.evW, 15, v => VF.fmt.m(v, 1)],
       ['EV al 2T26', base.roll && base.roll.ev2, E.ev2, 15, v => VF.fmt.m(v, 1)], ['Equity a la fecha de valuación', base.eqVal, E.eqVal, 15, v => VF.fmt.m(v, 1)],
       ['Precio Gordon', base.priceG, E.priceG, 0.02, v => VF.fmt.cur(v)], ['Precio múltiplos', base.priceM, E.priceM, 0.02, v => VF.fmt.cur(v)],
       ['Precio ponderado (cierre 2025)', base.priceClose, E.priceW, 0.02, v => VF.fmt.cur(v)], ['Valor intrínseco por acción', base.value, E.price, 0.02, v => VF.fmt.cur(v)],
       ['Potencial vs. precio', base.upside * 100, E.upside, 0.1, v => v.toFixed(1) + '%'], ['Peso del valor terminal (Gordon)', base.tvWeightG * 100, E.tvWeight, 0.1, v => v.toFixed(1) + '%'],
       ['WACC a valor de mercado', base.W.market.wacc * 100, E.waccMarket, 0.01, v => v.toFixed(2) + '%'], ['Ke a valor de mercado', base.W.market.ke * 100, E.keMarket, 0.01, v => v.toFixed(2) + '%']
      ].forEach(([l, c, e, t, f]) => add('Excel', l, fin(c) ? tol(c, e, t) : null, '', fin(c) ? f(c) : '—', f(e)));
      const gr = VF.grid(ds, A, base);
      add('Excel', 'Sensibilidad · fila WACC base', gr.cells[2].every((v, i) => tol(v, E.sensRow[i], 0.02)), '', gr.cells[2].map(v => v.toFixed(2)).join(' · '), E.sensRow.map(v => v.toFixed(2)).join(' · '));
      if (ds.altForecasts) Object.keys(ds.altForecasts).forEach(k => {
        const af = ds.altForecasts[k], r = VF.run(ds, { ...VF.defaults(ds), ...af.overrides, forecastKey: k });
        add('Excel', af.label, r.ok ? tol(r.value, af.expected.price, 0.02) : false, '', r.ok ? VF.fmt.cur(r.value) : '—', VF.fmt.cur(af.expected.price));
      });
    } else if (E) add('Excel', 'Comparación contra el Excel', null, 'Disponible solo con los supuestos base');
    return checks;
  };

  // ---------- Lectura rápida (derivada del modelo) ----------
  VF.insights = function (ds, A, base, tornado) {
    if (!base.ok) return [];
    const f = VF.fmt, out = [], cur = ds.profile.currency;
    if (base.upside != null) out.push({ k: 'Valor vs. precio', v: f.pp(base.upside), t: 'El valor intrínseco (' + f.cur(base.value) + ') se ubica ' + f.p(Math.abs(base.upside), 1) + (base.upside < 0 ? ' por debajo' : ' por encima') + ' del precio de mercado (' + f.cur(base.price) + ').' });
    out.push({ k: 'Peso del valor terminal', v: f.p(base.tvWeightG, 1), t: 'El valor terminal explica ' + f.p(base.tvWeightG, 1) + ' del EV (Gordon); el resultado es sensible a WACC y g.' });
    if (base.W.iterated && base.W.market && A.waccMode === 'iterated') out.push({ k: 'Costo de capital', v: f.p(base.wacc), t: 'El WACC iterado al valor DCF es ' + f.p(Math.abs(base.W.market.wacc - base.wacc)) + (base.wacc < base.W.market.wacc ? ' menor' : ' mayor') + ' que el WACC a valor de mercado (' + f.p(base.W.market.wacc) + ').' });
    else out.push({ k: 'Costo de capital', v: f.p(base.wacc), t: 'Los flujos se descuentan a un WACC de ' + f.p(base.wacc) + ' con Ke de ' + f.p(base.ke) + '.' });
    const r0 = base.rows[0], rN = base.rows[base.rows.length - 1], cagr = Math.pow(rN.fcf / r0.fcf, 1 / (base.rows.length - 1)) - 1;
    out.push({ k: 'Flujo libre', v: f.pp(cagr), t: 'El FCF pasa de ' + f.m(r0.fcf) + ' (' + r0.year + ') a ' + f.m(rN.fcf) + ' (' + rN.year + '): crecimiento anual compuesto de ' + f.p(cagr, 1) + '.' });
    if (tornado && tornado[0]) out.push({ k: 'Supuesto más sensible', v: f.cur(tornado[0].range), t: tornado[0].label + ' genera el mayor rango de valor por acción entre sus escenarios extremos.' });
    return out;
  };

  // ---------- Persistencia ----------
  const KEY = 'vf.v1.companies', AKEY = 'vf.v1.assump.', ACT = 'vf.v1.active';
  VF.store = {
    list() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } },
    save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { } },
    getA(id) { try { return JSON.parse(localStorage.getItem(AKEY + id) || 'null'); } catch (e) { return null; } },
    setA(id, a) { try { a ? localStorage.setItem(AKEY + id, JSON.stringify(a)) : localStorage.removeItem(AKEY + id); } catch (e) { } },
    active() { return localStorage.getItem(ACT) || 'soriana'; },
    setActive(id) { try { localStorage.setItem(ACT, id); } catch (e) { } }
  };

  // ---------- Importador (Capital IQ / XLS / XLSX / CSV) ----------
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\[[^\]]*\]/g, '').replace(/[^a-z0-9&%/ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  VF.FIELDS = [
    { key: 'revenue', label: 'Ingresos', req: true, sheet: /income|resultados/i, syn: ['total revenue', 'revenue', 'total revenues', 'net revenue', 'net sales', 'sales', 'ingresos totales', 'ventas netas', 'ventas', 'ingresos'] },
    { key: 'ebit', label: 'EBIT', req: true, sheet: /income|resultados/i, syn: ['operating income', 'ebit', 'operating profit', 'utilidad de operacion', 'resultado de operacion'] },
    { key: 'ebitda', label: 'EBITDA', sheet: /income|key|multiples/i, syn: ['ebitda'] },
    { key: 'da', label: 'Depreciación y amortización', req: true, sheet: /cash|flujo|income/i, syn: ['depreciation & amort total', 'depreciation & amort', 'depreciation & amortization', 'depreciation and amortization', 'total depreciation & amortization', 'd&a', 'depreciacion y amortizacion'] },
    { key: 'capex', label: 'Capex', req: true, sheet: /cash|flujo/i, abs: true, syn: ['capital expenditure', 'capital expenditures', 'capex', 'purchase of property plant and equipment', 'inversiones en activo fijo'] },
    { key: 'netIncome', label: 'Utilidad neta', sheet: /income|resultados/i, syn: ['net income', 'net income to company', 'net income to common', 'utilidad neta'] },
    { key: 'ebt', label: 'Utilidad antes de impuestos', sheet: /income|resultados/i, syn: ['ebt incl unusual items', 'ebt excl unusual items', 'earnings before taxes', 'pretax income', 'income before taxes', 'utilidad antes de impuestos'] },
    { key: 'incomeTax', label: 'Impuestos a la utilidad', sheet: /income|resultados/i, abs: true, syn: ['income tax expense', 'income taxes', 'provision for income taxes', 'impuestos a la utilidad'] },
    { key: 'interest', label: 'Gastos financieros', sheet: /income|resultados/i, abs: true, syn: ['interest expense', 'total interest expense', 'gastos financieros'] },
    { key: 'cash', label: 'Efectivo y equivalentes', req: true, sheet: /balance/i, syn: ['cash and equivalents', 'cash & equivalents', 'total cash & st investments', 'cash and cash equivalents', 'efectivo y equivalentes', 'cash'] },
    { key: 'debt', label: 'Deuda total', req: true, sheet: /balance|capital structure/i, syn: ['total debt', 'deuda total', 'total borrowings'] },
    { key: 'currentAssets', label: 'Activo circulante', sheet: /balance/i, syn: ['total current assets', 'activo circulante'] },
    { key: 'currentLiabilities', label: 'Pasivo circulante', sheet: /balance/i, syn: ['total current liabilities', 'pasivo circulante'] },
    { key: 'totalAssets', label: 'Activo total', sheet: /balance/i, syn: ['total assets', 'activo total'] },
    { key: 'equity', label: 'Capital contable', sheet: /balance/i, syn: ['total equity', 'total common equity', 'capital contable'] },
    { key: 'shares', label: 'Acciones en circulación', req: true, sheet: /key|capitalization|balance|income/i, syn: ['total shares out on filing date', 'shares outstanding', 'total shares outstanding', 'shares out', 'weighted average diluted shares outstanding', 'weighted avg diluted shares out', 'acciones en circulacion'] },
    { key: 'price', label: 'Precio por acción', req: true, sheet: /key|capitalization|market|multiples/i, syn: ['share price', 'last close price', 'closing price', 'stock price', 'price close', 'precio'] },
    { key: 'marketCap', label: 'Capitalización de mercado', sheet: /key|capitalization|market|multiples/i, syn: ['market capitalization', 'market cap'] },
    { key: 'beta', label: 'Beta', sheet: /key|market/i, syn: ['beta 5 year', '5y beta', 'beta 5y', 'beta'] }
  ];
  const isPeriod = s => { s = String(s || '').trim(); return s.length > 0 && s.length < 48 && (/\b(19|20)\d{2}\b/.test(s) || /\b(LTM|NTM|FY|CY)\b/i.test(s) || /\b[1-4]T\d{2}\b/.test(s) || /\bQ[1-4]\b/.test(s)); };
  const isEst = s => /(\d{4}|\d{2})\s*E\b|\bEst|Estimate|Proj|Forecast|\bNTM\b|\bE\)$/i.test(String(s)) || (+((String(s).match(/\b(19|20)\d{2}\b/) || [])[0]) > new Date().getFullYear());
  const yearOf = s => { const m = String(s).match(/\b((19|20)\d{2})\b/); return m ? +m[1] : null; };
  const num = s => {
    if (typeof s === 'number') return s; s = String(s || '').trim(); if (!s || /^(-|—|NA|NM|N\/A|n\.d\.)$/i.test(s)) return null;
    let neg = /^\(.*\)$/.test(s) || /^-/.test(s); s = s.replace(/[()$,\s]/g, '').replace(/^-/, '');
    let pct = /%$/.test(s); s = s.replace(/[%x]$/i, ''); if (!/^\d*\.?\d+(e[-+]?\d+)?$/i.test(s)) return null;
    let v = parseFloat(s); if (neg) v = -v; return pct ? v / 100 : v;
  };
  VF.SECTIONS = ['Key Stats', 'Income Statement', 'Balance Sheet', 'Cash Flow', 'Multiples', 'Historical Capitalization', 'Capital Structure', 'Ratios', 'Supplemental', 'Industry Specific', 'Estimates'];

  VF.parseWorkbook = function (wb, fileName) {
    const meta = { name: null, ticker: null, exchange: null, currency: null, units: null }, rowsIdx = [], sheets = [], periodSet = new Set();
    wb.SheetNames.forEach(sn => {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, defval: '' });
      aoa.slice(0, 16).forEach(r => r.forEach(c => {
        const t = String(c || '');
        if (!meta.name) { const m = t.match(/^(.+?)\s*\(\s*([A-Z]{2,8})\s*:\s*([A-Z0-9.\-]+)\s*\)/); if (m) { meta.name = m[1].trim(); meta.exchange = m[2]; meta.ticker = m[3]; } }
        if (!meta.currency) { const m = t.match(/\b(USD|MXN|HKD|CNY|RMB|EUR|GBP|JPY|BRL|CAD|CHF|KRW|INR)\b/); if (m) meta.currency = m[1] === 'RMB' ? 'CNY' : m[1]; }
        if (!meta.units) { if (/in millions|millions|millones|\(mm\)/i.test(t)) meta.units = 'millones'; else if (/in thousands|thousands|miles/i.test(t)) meta.units = 'miles'; else if (/in billions|billions/i.test(t)) meta.units = 'miles de millones'; }
      }));
      let hIdx = -1, best = 0;
      for (let r = 0; r < Math.min(60, aoa.length); r++) { const c = aoa[r].filter(isPeriod).length; if (c > best) { best = c; hIdx = r; } }
      const sec = VF.SECTIONS.find(s => norm(sn).includes(norm(s))) || null;
      if (best < 1) { sheets.push({ name: sn, section: sec, rows: aoa.length, periods: 0 }); return; }
      const head = aoa[hIdx], prevHead = aoa[hIdx - 1] || [];
      const periods = [];
      head.forEach((c, ci) => { if (isPeriod(c)) { const label = (String(prevHead[ci] || '').trim() + ' ' + String(c).trim()).trim(); periods.push({ ci, label: String(c).trim(), full: label, est: isEst(label), ltm: /LTM|NTM/i.test(label), year: yearOf(label) }); } });
      const firstCol = periods[0].ci;
      for (let r = hIdx + 1; r < aoa.length; r++) {
        const row = aoa[r]; let label = '';
        for (let c = 0; c < firstCol; c++) { const t = String(row[c] || '').trim(); if (t && num(t) === null) { label = t; break; } }
        if (!label) continue;
        const vals = periods.map(p => ({ p, v: num(row[p.ci]) })).filter(x => x.v !== null);
        if (!vals.length) continue;
        rowsIdx.push({ sheet: sn, section: sec, label, n: norm(label), vals });
      }
      periods.forEach(p => periodSet.add(p.label));
      sheets.push({ name: sn, section: sec, rows: aoa.length, periods: periods.length, actual: periods.filter(p => !p.est).length, est: periods.filter(p => p.est).length });
    });
    if (!meta.name && fileName) {
      const m = fileName.replace(/\.(xlsx?|csv)$/i, '').match(/^(.*?)\s+([A-Z]{2,6})\s+([A-Z0-9.]+)\s+Financials/i);
      if (m) { meta.name = m[1].trim(); meta.exchange = m[2]; meta.ticker = m[3]; } else meta.name = fileName.replace(/\.(xlsx?|csv)$/i, '').replace(/[_]+/g, ' ');
    }
    const pick = (row) => {
      const act = row.vals.filter(x => !x.p.est && !x.p.ltm), ltm = row.vals.filter(x => !x.p.est && x.p.ltm), any = row.vals;
      const pool = act.length ? act : (ltm.length ? ltm : any);
      return pool.reduce((a, b) => ((b.p.year || 0) > (a.p.year || 0) || ((b.p.year || 0) === (a.p.year || 0) && b.p.ci > a.p.ci)) ? b : a);
    };
    const fields = VF.FIELDS.map(F => {
      const cands = [];
      rowsIdx.forEach(row => {
        let sc = 0; F.syn.forEach(s => { if (row.n === s) sc = Math.max(sc, 1); else if (row.n.startsWith(s + ' ') || row.n.startsWith(s)) sc = Math.max(sc, 0.82); else if ((' ' + row.n + ' ').includes(' ' + s + ' ')) sc = Math.max(sc, 0.68); });
        if (!sc) return;
        if (F.sheet && !F.sheet.test(row.sheet)) sc -= 0.12;
        if (/%|margin|growth|per share|yoy|margen|crecimiento/i.test(row.label) && F.key !== 'price') sc -= 0.4;
        if (sc > 0.3) cands.push({ row, sc });
      });
      cands.sort((a, b) => b.sc - a.sc);
      const top = cands[0];
      let value = null, period = null, conf = 'Sin dato', status = 'pending';
      if (top) { const p = pick(top.row); value = F.abs ? Math.abs(p.v) : p.v; period = p.p.label; conf = top.sc >= 0.95 ? 'Alta' : (top.sc >= 0.7 ? 'Media' : 'Baja'); status = top.sc >= 0.7 ? 'ok' : 'review'; }
      const hist = top ? top.row.vals.filter(x => !x.p.est && !x.p.ltm).map(x => ({ year: x.p.year, label: x.p.label, v: F.abs ? Math.abs(x.v) : x.v })) : [];
      return { key: F.key, label: F.label, req: !!F.req, value, period, conf, status, srcLabel: top ? top.row.label : null, srcSheet: top ? top.row.sheet : null, hist, cands: cands.slice(0, 8).map((c, i) => ({ id: i, label: c.row.label, sheet: c.row.sheet, value: (F.abs ? Math.abs(pick(c.row).v) : pick(c.row).v), period: pick(c.row).p.label, sc: c.sc })) };
    });
    const mapped = fields.filter(f => f.status === 'ok').length;
    const detected = VF.SECTIONS.map(s => ({ name: s, found: sheets.some(sh => sh.section === s) || (s === 'Income Statement' && fields.find(f => f.key === 'revenue').value != null && sheets.length === 1) }));
    return { meta, sheets, fields, rowsCount: rowsIdx.length, periods: Array.from(periodSet), coverage: mapped / fields.length, mapped, total: fields.length, detected, fileName };
  };

  VF.buildFromImport = function (P, F, I) {
    const v = k => (F[k] != null && F[k] !== '' ? +F[k] : null);
    const rev = v('revenue'), ebit = v('ebit'), da = v('da'), capex = v('capex');
    const taxRate = (v('incomeTax') != null && v('ebt') > 0) ? v('incomeTax') / v('ebt') : (I.tax != null ? I.tax / 100 : 0.30);
    const nwc = (v('currentAssets') != null && v('currentLiabilities') != null) ? (v('currentAssets') - v('cash') - v('currentLiabilities')) : 0;
    const debt = v('debt') || 0, cash = v('cash') || 0, shares = v('shares'), price = v('price');
    const kd = (v('interest') != null && debt > 0) ? v('interest') / debt * 100 : (I.kd ?? null);
    const baseYear = (P.fields.find(f => f.key === 'revenue') || {}).period || 'Último';
    const y0 = yearOf(baseYear) || new Date().getFullYear() - 1;
    const years = [1, 2, 3, 4, 5].map(k => (y0 + k) + 'E');
    const E = (price && shares) ? price * shares : v('marketCap');
    let betaU = I.betaU; if (betaU == null && I.betaL != null && E) betaU = I.betaL / (1 + (1 - taxRate) * debt / E);
    const ebitda = v('ebitda') ?? ((ebit ?? 0) + (da ?? 0));
    const evMkt = E ? E + debt - cash : null;
    const mult = I.exitMultiple != null ? I.exitMultiple : (evMkt && ebitda > 0 ? evMkt / ebitda : null);
    const id = 'c' + Date.now().toString(36);
    return {
      id, builtIn: false, version: 'Importado · ' + (P.fileName || 'archivo'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      source: { kind: 'Archivo importado', file: P.fileName },
      profile: { name: I.name, short: I.short || I.name.split(' ')[0], legalName: I.name, ticker: I.ticker, exchange: I.exchange, country: I.country || '', currency: I.currency || 'USD', units: 'mm', sector: I.sector || '', industry: I.industry || '', logo: I.logo || null, brand: I.brand || null, domain: I.domain || '', description: '' },
      dates: { base: baseYear, valuation: new Date().toISOString().slice(0, 10), price: 'Archivo importado' },
      market: { price, shares, marketCap: E, consensus: null },
      forecast: { baseYear: y0 + 'A', years, base: { revenue: rev, ebit, da, capex, nwc, ebitda }, drivers: { growth: I.growth / 100, margin: I.margin / 100, tax: I.taxF / 100, da: I.daPct / 100, capex: I.capexPct / 100, nwcPct: rev ? nwc / rev : 0 } },
      wacc: { rf: I.rf, prm: I.prm, betaU, taxMarket: taxRate * 100, taxShield: taxRate * 100, kdPre: kd, kdMarket: kd, debt, equityMarket: E, mode: 'iterated', start: 12 },
      valuation: { g: I.g, exitMultiple: mult, wGordon: mult ? 0.5 : 1, bridge: { debt, lease: 0, cash }, roll: { enabled: false }, signalThreshold: 15 },
      history: { revenue: (P.fields.find(f => f.key === 'revenue') || {}).hist || [], ebit: (P.fields.find(f => f.key === 'ebit') || {}).hist || [], netIncome: (P.fields.find(f => f.key === 'netIncome') || {}).hist || [] },
      imported: P.fields.map(f => ({ key: f.key, label: f.label, value: F[f.key] ?? null, period: f.period, srcLabel: f.srcLabel, srcSheet: f.srcSheet, conf: f.conf })),
      sources: [['Archivo importado', P.fileName || '', 'Datos financieros (' + (P.meta.units || 'unidades del archivo') + ')'], ['Supuestos', 'Captura manual en ValuFlow', 'Rf, PRM, beta, g y drivers de proyección']],
      research: null
    };
  };

  // ---------- Exportación ----------
  // Algunos entornos publicados bloquean descargas; siempre se ofrece un panel con alternativas (abrir, copiar).
  function copyText(t) {
    const done = () => true;
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(done, () => legacyCopy(t));
    return Promise.resolve(legacyCopy(t));
  }
  function legacyCopy(t) {
    const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { } ta.remove(); return ok;
  }
  VF.exportPanel = function (o) {
    const old = document.getElementById('vf-export-panel'); if (old) old.remove();
    const bd = document.createElement('div'); bd.id = 'vf-export-panel'; bd.className = 'dialog-backdrop'; bd.setAttribute('data-noprint', '');
    bd.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;background:color-mix(in srgb, var(--color-text) 35%, transparent);';
    const d = document.createElement('div'); d.className = 'dialog blueprint';
    d.style.cssText = 'position:relative;width:min(560px,100%);max-height:90vh;overflow:auto;background:var(--color-bg);border:1px solid var(--color-divider);padding:28px;display:flex;flex-direction:column;gap:16px;font-family:var(--font-body);color:var(--color-text);';
    d.innerHTML = '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' +
      '<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-accent-700);">Exportar</div>' +
      '<h3 style="margin:0;font-family:var(--font-heading);font-size:26px;font-weight:600;"></h3>' +
      '<p style="margin:0;font-size:14px;line-height:1.55;color:var(--color-neutral-700);"></p>' +
      '<div data-acts style="display:flex;flex-direction:column;gap:8px;"></div>' +
      '<div data-msg style="font-size:13px;min-height:18px;color:var(--pos);"></div>' +
      '<div style="display:flex;justify-content:flex-end;"><button class="btn btn-ghost" data-close>Cerrar</button></div>';
    d.querySelector('h3').textContent = o.title; d.querySelector('p').textContent = o.note;
    const acts = d.querySelector('[data-acts]'), msg = d.querySelector('[data-msg]');
    o.actions.forEach((ac, i) => {
      const btn = document.createElement('button'); btn.className = 'btn ' + (i === 0 ? 'btn-primary blueprint' : 'btn-secondary');
      btn.style.cssText = 'justify-content:flex-start;text-align:left;position:relative;height:auto;min-height:44px;padding:10px 14px;white-space:normal;line-height:1.3;width:100%;';
      btn.innerHTML = (i === 0 ? '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>' : '') + '<span style="flex:1;min-width:0;"></span>';
      btn.querySelector('span').textContent = ac.label;
      btn.onclick = async () => { msg.style.color = 'var(--pos)'; msg.textContent = ''; try { const r = await ac.run(); if (r) msg.textContent = r; } catch (e) { msg.style.color = 'var(--neg)'; msg.textContent = 'No se pudo completar: ' + (e && e.message || e); } };
      acts.appendChild(btn);
    });
    const close = () => bd.remove();
    d.querySelector('[data-close]').onclick = close; bd.onclick = e => { if (e.target === bd) close(); };
    bd.appendChild(d); document.body.appendChild(bd);
  };
  function tryDownload(name, blob) {
    try { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000); } catch (e) { }
  }
  function openBlob(blob) {
    const url = URL.createObjectURL(blob); const w = window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    if (!w) throw new Error('el navegador bloqueó la ventana nueva');
    return 'Abierto en una pestaña nueva. Usa Guardar como (Ctrl/⌘ + S).';
  }
  VF.download = function (name, content, type, extra) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    tryDownload(name, blob);
    const actions = [{ label: 'Descargar de nuevo', run: () => { tryDownload(name, blob); return 'Descarga solicitada.'; } }];
    if (extra && extra.copy) actions.push({ label: extra.copyLabel || 'Copiar contenido al portapapeles', run: async () => (await copyText(extra.copy)) ? (extra.copyDone || 'Copiado. Pégalo en un editor y guárdalo como ' + name + '.') : 'No se pudo copiar automáticamente.' });
    if (!(extra && extra.noOpen)) actions.push({ label: 'Abrir en pestaña nueva', run: () => openBlob(blob) });
    VF.exportPanel({ title: name, note: 'Si la descarga no inició (algunos sitios publicados bloquean descargas), usa una de estas alternativas.', actions });
  };
  VF.printPanel = function (doPrint) {
    VF.exportPanel({ title: 'Reporte PDF', note: 'Se abrió el diálogo de impresión: elige "Guardar como PDF". Si no apareció, el sitio donde está publicada la app bloquea la impresión; usa Ctrl/⌘ + P o abre la app directamente en su propia pestaña.', actions: [
      { label: 'Abrir diálogo de impresión', run: () => { document.getElementById('vf-export-panel')?.remove(); setTimeout(doPrint, 150); } },
      { label: 'Abrir la app en pestaña nueva', run: () => { const w = window.open(location.href, '_blank', 'noopener'); if (!w) throw new Error('el navegador bloqueó la ventana nueva'); return 'Abierta. Exporta el PDF desde esa pestaña.'; } }
    ] });
  };
  VF.fileBase = ds => (ds.profile.short || ds.profile.name).replace(/[^A-Za-z0-9]+/g, '_') + '_Valuacion_' + new Date().toISOString().slice(0, 10);
  VF.exportXLSX = function (ds, A, base) {
    const f = VF.fmt, wb = XLSX.utils.book_new(), sheets = [], add = (n, a) => { sheets.push([n, a]); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(a), n); };
    add('Resumen', [['ValuFlow · ' + ds.profile.legalName], ['Ticker', ds.profile.ticker + ' · ' + ds.profile.exchange], ['Fecha de valuación', ds.dates.valuation], [],
      ['Valor intrínseco por acción', base.value], ['Precio de mercado', base.price], ['Potencial', base.upside], ['WACC', base.wacc], ['g', base.g], ['Enterprise Value', base.ev], ['Equity Value', base.eqVal], ['Peso valor terminal (Gordon)', base.tvWeightG]]);
    add('Supuestos', [['Supuesto', 'Valor']].concat(Object.entries(A).map(([k, v]) => [k, v])));
    add('Proyección FCF', [['Concepto'].concat(base.rows.map(r => r.year))].concat([['Ventas', 'revenue'], ['Crecimiento', 'growth'], ['EBIT', 'ebit'], ['Tasa', 'taxRate'], ['NOPAT', 'nopat'], ['D&A', 'da'], ['Capex', 'capex'], ['ΔNWC', 'dNwc'], ['FCF', 'fcf'], ['Factor de descuento', 'df'], ['VP FCF', 'pv']].map(([l, k]) => [l].concat(base.rows.map(r => r[k])))));
    const W = base.W; add('WACC', [['Concepto', 'Valor'], ['Rf', W.rf], ['PRM', W.prm], ['Beta desapalancada', W.betaU], ['Modo', W.mode], ['WACC', base.wacc], ['Ke', base.ke], [], ['Iteración', 'WACC entrada', 'Equity DCF', 'D/E', 'Beta', 'Ke', 'WACC salida']].concat(W.iters.map(i => [i.k, i.win, i.E, i.de, i.beta, i.ke, i.wout])));
    const g = VF.grid(ds, A, base); add('Sensibilidad', [['WACC \\ g'].concat(g.gs.map(x => x / 100))].concat(g.ws.map((w, i) => [w / 100].concat(g.cells[i]))));
    add('Validación', [['Grupo', 'Comprobación', 'Estado', 'Calculado', 'Excel']].concat(VF.validate(ds, A, base, false).map(c => [c.group, c.label, c.status, c.calc || c.detail || '', c.exp || ''])));
    add('Fuentes', [['Fuente', 'Documento', 'Uso']].concat(ds.sources || []));
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const tsv = sheets.map(([n, a]) => '### ' + n + '\n' + a.map(r => r.map(x => x == null ? '' : String(x)).join('\t')).join('\n')).join('\n\n');
    VF.download(VF.fileBase(ds) + '.xlsx', new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), null, { copy: tsv, copyLabel: 'Copiar tablas para pegar en Excel', copyDone: 'Copiado. Pégalo en una hoja de Excel (Ctrl/⌘ + V).', noOpen: true });
  };
  VF.exportCSV = function (ds, base) {
    const lines = [['field', 'period', 'value', 'unit', 'type', 'source']];
    const u = ds.profile.currency + ' ' + (ds.profile.units || '');
    Object.entries(ds.forecast.base).forEach(([k, v]) => lines.push([k, ds.forecast.baseYear, v, u, 'Actual', ds.source.kind]));
    base.rows.forEach(r => ['revenue', 'ebit', 'nopat', 'da', 'capex', 'dNwc', 'fcf', 'pv'].forEach(k => lines.push([k, r.year, r[k].toFixed(4), u, 'Estimado', 'ValuFlow engine'])));
    const csv = lines.map(l => l.map(x => '"' + String(x ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
    VF.download(VF.fileBase(ds) + '.csv', '\ufeff' + csv, 'text/csv;charset=utf-8', { copy: csv });
  };
  VF.exportJSON = function (ds, A) { const t = JSON.stringify({ format: 'valuflow/1', dataset: ds, assumptions: A }, null, 2); VF.download(VF.fileBase(ds) + '.valuflow.json', t, 'application/json', { copy: t }); };

  // ---------- Identidad: logo y color de marca ----------
  VF.findLogo = async function (name) {
    try {
      const s = await (await fetch('https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' + encodeURIComponent(name) + '&language=en&type=item&limit=5&format=json&origin=*')).json();
      for (const it of (s.search || [])) {
        const c = await (await fetch('https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=' + it.id + '&property=P154&format=json&origin=*')).json();
        const cl = c.claims && c.claims.P154 && c.claims.P154[0];
        if (cl) { const file = cl.mainsnak.datavalue.value; return { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=480', source: 'Wikidata ' + it.id + ' · Wikimedia Commons', page: 'https://www.wikidata.org/wiki/' + it.id, label: it.label, description: it.description || '' }; }
      }
    } catch (e) { }
    return null;
  };
  VF.brandColor = function (url) {
    return new Promise(res => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { try {
        const c = document.createElement('canvas'), w = 64, h = Math.max(8, Math.round(64 * img.height / img.width)); c.width = w; c.height = h;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data, bins = {};
        for (let i = 0; i < d.length; i += 4) { const [r, g, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]]; if (a < 128) continue; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx - mn < 40 || mx < 40) continue; const k = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4); bins[k] = (bins[k] || 0) + 1; }
        const top = Object.entries(bins).sort((a, b) => b[1] - a[1])[0]; if (!top) return res(null);
        const [r, g, b] = top[0].split(',').map(v => v * 16 + 8); res('#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''));
      } catch (e) { res(null); } };
      img.onerror = () => res(null); img.src = url;
    });
  };

  // ---------- Investigación cualitativa (fuentes abiertas + IA) ----------
  async function wikiSearch(q, lang) { const j = await (await fetch('https://' + lang + '.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(q) + '&srlimit=5&format=json&origin=*')).json(); return (j.query.search || []).map(s => s.title); }
  async function wikiPage(title, lang) {
    const j = await (await fetch('https://' + lang + '.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&explaintext=1&redirects=1&titles=' + encodeURIComponent(title) + '&format=json&origin=*')).json();
    const p = Object.values(j.query.pages)[0]; return { title: p.title, url: p.fullurl, text: (p.extract || '').slice(0, 9000) };
  }
  VF.research = async function (profile) {
    const today = new Date().toISOString().slice(0, 10), name = profile.legalName || profile.name;
    if (window.claude && window.claude.complete) {
      try {
        const txt = await window.claude.complete({
          model: 'claude-haiku-4-5', max_tokens: 2500,
          system: 'Eres un analista que documenta información CUALITATIVA de empresas con fuentes verificables. Usa las herramientas para buscar y leer Wikipedia (es y en). Nunca reportes cifras financieras (ingresos, EBIT, deuda, efectivo, acciones, beta, WACC). Responde SOLO con JSON válido.',
          messages: [{ role: 'user', content: 'Investiga la empresa "' + name + '" (' + (profile.ticker || '') + ' ' + (profile.exchange || '') + '). Devuelve JSON: {"items":[{"section":"Perfil|Historia|Gobierno","field":"...","value":"...","date":"(para Historia: año)","url":"URL exacta de la página usada","confidence":"Alta|Media|Baja"}]} con 4-6 datos de Perfil (modelo de negocio, sede, fundación, industria, productos/segmentos), 4-8 eventos de Historia y 2-4 de Gobierno (CEO, presidente del consejo). Español, frases breves.' }],
          tools: [
            { name: 'wiki_search', description: 'Busca títulos en Wikipedia', input_schema: { type: 'object', properties: { query: { type: 'string' }, lang: { type: 'string', enum: ['es', 'en'] } }, required: ['query'] }, run: async (i) => JSON.stringify(await wikiSearch(i.query, i.lang || 'en')) },
            { name: 'wiki_page', description: 'Lee el texto y URL de una página de Wikipedia', input_schema: { type: 'object', properties: { title: { type: 'string' }, lang: { type: 'string', enum: ['es', 'en'] } }, required: ['title'] }, run: async (i) => JSON.stringify(await wikiPage(i.title, i.lang || 'en')) }
          ]
        });
        const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
        return { via: 'IA + Wikipedia', date: today, items: (j.items || []).map((x, i) => ({ id: 'r' + i, ...x, source: 'Wikipedia', status: 'pending' })) };
      } catch (e) { /* cae a fuentes abiertas */ }
    }
    const items = [];
    for (const lang of ['es', 'en']) {
      try {
        const t = (await wikiSearch(name, lang))[0]; if (!t) continue;
        const p = await wikiPage(t, lang);
        const first = p.text.split('\n').filter(Boolean)[0] || '';
        items.push({ id: 'w' + lang, section: 'Perfil', field: 'Descripción (' + lang + ')', value: first.slice(0, 420), url: p.url, source: 'Wikipedia', confidence: 'Media', status: 'pending' });
      } catch (e) { }
    }
    return { via: 'Fuentes abiertas (Wikipedia)', date: today, items };
  };
})();
