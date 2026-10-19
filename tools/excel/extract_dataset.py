"""Genera src/data/soriana.excel.ts a partir del Excel PRO AUDITADO (excel/EXCEL FINAL PRO DEFINITIVO SORIANA - AUDITADO.xlsx).

Uso:  python3 -I tools/excel/extract_dataset.py <excel_pro_auditado.xlsx> <salida.ts> [<perfil_libreoffice>]

- Todos los insumos se leen de celdas del Excel con precisión completa (sin redondear) y se guardan con la referencia
  de la celda de origen cuando aplica.
- Los resultados esperados se obtienen recalculando el libro en LibreOffice con cada combinación de selectores
  (Inflación!E6 = escenario; 'Beta y Kd'!B18 = beta: 2 regresión oficial, 1 Damodaran referencia, 0 heredada), igual que la tabla A de la hoja Validación.
  La app debe reproducirlos (tests/excel-master.test.ts).
"""
import sys, os, json, subprocess, tempfile, datetime as dt, openpyxl

SRC, OUT = sys.argv[1], sys.argv[2]
PROF = sys.argv[3] if len(sys.argv) > 3 else os.path.join(tempfile.gettempdir(), 'vf-lo-profile')
PF, INF, MU, TR, SDC, VC, WA, BK = ('Proyección Final Soriana', 'Inflación', 'Multiplos', 'Transacciones', 'Transacciones SDC',
                                     'Valuación Combinada', 'WACC', 'Beta y Kd')
COLS = 'CDEFG'


def recalc(path, outdir):
    os.makedirs(outdir, exist_ok=True)
    subprocess.run(['soffice', f'-env:UserInstallation=file://{PROF}', '--headless', '--calc', '--convert-to', 'xlsx', '--outdir', outdir, path],
                   check=True, capture_output=True, timeout=300)
    return os.path.join(outdir, os.path.basename(path))


def with_selector(sel, beta, wd):
    wb = openpyxl.load_workbook(SRC)
    wb[INF]['E6'] = sel
    wb[BK]['B18'] = beta
    p = os.path.join(wd, f'sel{sel}{beta}.xlsx')
    wb.save(p)
    return openpyxl.load_workbook(recalc(p, os.path.join(wd, f'r{sel}{beta}')), data_only=True)


# Combinaciones (escenario de inflación, selector de beta): igual que la tabla A de la hoja Validación.
COMBOS = {'historico': (0, 0), 'citi': (0, 2), 'cautela': (1, 2), 'base': (2, 2), 'alcista': (3, 2), 'base_beta080': (2, 0), 'base_damodaran': (2, 1)}
wd = tempfile.mkdtemp(prefix='vf-extract-')
books = {k: with_selector(i, b, wd) for k, (i, b) in COMBOS.items()}
X = books['base']                          # escenario Base con la beta oficial (por defecto)
F = openpyxl.load_workbook(SRC)            # fórmulas (para trazabilidad)


def find_row(ws, text, col='A', start=1, end=400):
    for r in range(start, end):
        if str(ws[f'{col}{r}'].value or '').startswith(text): return r
    raise KeyError(text)


def v(wb, sh, ref):
    x = wb[sh][ref].value
    if isinstance(x, dt.datetime): return x.date().isoformat()
    return x


def row(wb, sh, r, cols=COLS, blank=None):
    return [blank if wb[sh][f'{c}{r}'].value is None else v(wb, sh, f'{c}{r}') for c in cols]


def num(x):
    assert isinstance(x, (int, float)), x
    return float(x)


def na(x):
    return float(x) if isinstance(x, (int, float)) else None


# ---------------------------------------------------------------- proyección por drivers (filas 5–117)
build = {
    'source': "Excel PRO auditado · hoja 'Proyección Final Soriana' (filas 5–117)",
    'weightsExternal': row(X, PF, 6),
    'sales': {
        'gdp': row(X, PF, 11), 'elasticity': row(X, PF, 12), 'consumptionAdj': row(X, PF, 13),
        'adjustments': [{'label': X[PF][f'A{r}'].value, 'cell': f'C{r}:G{r}', 'values': row(X, PF, r)} for r in range(15, 23)],
        # Fila 26: regresión de mínimos cuadrados solo para 2026E (C26); 2027E–2030E crecen con la inflación del escenario (D26 = C26 × (1 + D10)).
        'lsSales': [num(v(X, PF, 'B26'))] + row(X, PF, 26),
        'lsGrowWithInflation': True,
    },
    'margin': {
        'base': num(v(X, PF, 'B31')),
        'adjustments': [{'label': X[PF][f'A{r}'].value, 'cell': f'C{r}:G{r}', 'values': row(X, PF, r)} for r in range(32, 40)],
        'ls': row(X, PF, 40),
    },
    'da': {'ext': row(X, PF, 44), 'ls': row(X, PF, 45)},
    'capex': {
        'guide': row(X, PF, 47), 'add': row(X, PF, 48, blank=0.0),
        'basePct': num(v(X, 'Valuación', 'B12')), 'extAdj': num(v(X, 'Variables Externas', 'J22')), 'ls': row(X, PF, 50),
    },
    'tax': {'base': num(v(X, WA, 'B10')), 'adj': row(X, PF, 52), 'ls': row(X, PF, 54)},
    'invDays': row(X, PF, 56), 'otherCAPct': row(X, PF, 57), 'opCLPct': row(X, PF, 58), 'costPct': row(X, PF, 59),
    'interestRate': row(X, PF, 61), 'debtAmort': row(X, PF, 62), 'payout': row(X, PF, 63), 'otherIncome': row(X, PF, 75),
    'base': {k: num(v(X, PF, ref)) for k, ref in dict(revenue='B67', cash='B84', inventory='B85', otherCA='B86', nonCurrent='B88', opCL='B90',
                                                       debt='B91', lease='B92', otherLT='B93', equity='B95', ebit='B73', da='B72').items()},
}
build['base']['da'] = -build['base']['da']
assert F[PF]['D26'].value.replace(' ', '') == '=C26*(1+D10)', F[PF]['D26'].value
assert F[PF]['B127'].value.replace(' ', '') == '=G113+G116', F[PF]['B127'].value

# ---------------------------------------------------------------- inflación
series = []
r = find_row(X[INF], 'Quincena') + 1
while X[INF][f'A{r}'].value is not None and isinstance(X[INF][f'B{r}'].value, (int, float)):
    series.append([v(X, INF, f'A{r}'), num(X[INF][f'B{r}'].value)]); r += 1
CHAIN = [
    ('Inflación aplicada (Inflación!B13:F13)', 'Proyección Final!C10:G10', 'Escenario elegido; misma tasa los 5 años.'),
    ('→ Crecimiento nominal del mercado', 'Proyección Final!C14', 'Inflación + PIB real × elasticidad + ajuste por consumo.'),
    ('→ Crecimiento por variables externas', 'Proyección Final!C23', 'Mercado + 8 ajustes documentados.'),
    ('→ Ventas por mínimos cuadrados 2027E–2030E', 'Proyección Final!D26:G26', 'La tendencia crece con la misma inflación.'),
    ('→ Crecimiento final de ventas', 'Proyección Final!C28', 'Ponderado: variables externas / mínimos cuadrados.'),
    ('→ Ventas, costos, EBIT, impuestos, capital de trabajo', 'Proyección Final!C67:G117', 'Estado de resultados, balance y FCF.'),
    ('→ Valor (WACC no cambia con la inflación)', 'Proyección Final!B265', 'Limitación documentada: Rf y Kd no se ajustan por Fisher en el Excel.'),
]
inflation = {
    'source': 'Banco de México, serie SP74833 (INPC, variación anual, quincenal); hoja Inflación del Excel PRO.',
    'default': 'base',
    'order': ['cautela', 'base', 'alcista'],
    'references': ['citi'],
    'scenarios': {
        'citi': {'label': 'Trayectoria Citi — Referencia', 'kind': 'Referencia histórica (no es escenario)', 'path': row(X, INF, 9, 'BCDEF'), 'source': X[INF]['H9'].value, 'cell': 'Inflación!B9:F9', 'reference': True},
        'cautela': {'label': 'Cautela', 'kind': 'Escenario derivado de la tendencia larga', 'value': num(v(X, INF, 'B33')), 'source': X[INF]['H33'].value, 'cell': 'Inflación!B33'},
        'base': {'label': 'Base', 'kind': 'Forecast / resultado de modelo', 'value': num(v(X, INF, 'B34')), 'source': X[INF]['H34'].value, 'cell': 'Inflación!B34 = ROUND(G21, 4)'},
        'alcista': {'label': 'Alcista', 'kind': 'Supuesto de escenario (no es pronóstico estadístico)', 'value': num(v(X, INF, 'B35')), 'source': X[INF]['H35'].value, 'cell': 'Inflación!B35'},
    },
    'series': series,
    'models': {k: {'a': X[INF][f'C{r}'].value, 'b': X[INF][f'D{r}'].value, 'r2': X[INF][f'E{r}'].value, 'xNext': X[INF][f'F{r}'].value, 'forecast': X[INF][f'G{r}'].value, 'n': X[INF][f'B{r}'].value}
               for k, r in dict(immediate=20, quarterly=21, long=22, classRounded=23, classS113=24).items()},
    'quarterlyAverages': row(X, INF, 26, 'BCDE'),
    'chain': [list(c) for c in CHAIN],
}
bs = find_row(X[INF], 'BETA HISTÓRICA')
inflation['beta'] = {'historical': X[INF][f'B{bs+1}'].value, 'r2': X[INF][f'B{bs+2}'].value, 'n': X[INF][f'B{bs+3}'].value, 'reported': X[INF][f'B{bs+4}'].value,
                     'wacc': X[INF][f'B{bs+7}'].value}
# Estudio de mercado de clase (no alimenta el DCF): cierres mensuales vs inflación y correlaciones.
ms0 = find_row(X[INF], 'Mes', start=150) + 1
monthly = []
r = ms0
while isinstance(X[INF][f'B{r}'].value, (int, float)):
    monthly.append([v(X, INF, f'A{r}'), num(X[INF][f'B{r}'].value), num(X[INF][f'C{r}'].value)]); r += 1
cr = find_row(X[INF], 'Correlación precio–inflación') + 1
corr = [[X[INF][f'A{rr}'].value, X[INF][f'B{rr}'].value, X[INF][f'C{rr}'].value] for rr in range(cr, cr + 4)]
inflation['study'] = {'monthly': monthly, 'correlations': corr, 'note': X[INF][f'A{cr+4}'].value}

# ---------------------------------------------------------------- beta (hoja Beta y Kd)
BKs = X[BK]
beta = {
    'source': BKs['B3'].value, 'date': BKs['B4'].value, 'industry': BKs['B5'].value, 'firms': BKs['B6'].value,
    'levered': BKs['B7'].value, 'de': BKs['B8'].value, 'effTax': BKs['B9'].value, 'marginalTax': BKs['B10'].value, 'unlevered': BKs['B11'].value,
    'cashFirm': BKs['B12'].value, 'unleveredCash': BKs['B13'].value, 'check': BKs['B14'].value, 'inherited': BKs['B17'].value, 'used': BKs['B19'].value,
    'regression': {'levered': BKs['H3'].value, 'debt': BKs['H4'].value, 'equity': BKs['H5'].value, 'de': BKs['H6'].value, 'tax': BKs['H7'].value,
                   'unlevered': BKs['H8'].value, 'source': BKs['I3'].value, 'note': BKs['A15'].value},
    'treatment': [BKs['A19'].value, BKs['E36'].value, BKs['A32'].value],
    'kd': {'value': BKs['B48'].value, 'check': BKs['B49'].value, 'fy2025': BKs['B51'].value, 'source': BKs['E48'].value, 'checkNote': BKs['E49'].value},
}
assert beta['used'] == beta['regression']['unlevered'] and abs(beta['used'] - 0.1705) < 5e-5 and beta['unleveredCash'] == 0.69, beta

# ---------------------------------------------------------------- WACC / valuación
wacc = {'rf': num(v(X, PF, 'B210')), 'prm': num(v(X, PF, 'B211')), 'betaU': num(v(X, PF, 'B212')), 'kdPre': num(v(X, PF, 'B206')), 'taxShield': num(v(X, PF, 'B207')),
        'debt': num(v(X, PF, 'B209')), 'kdMarket': num(v(X, WA, 'B31')), 'taxMarket': num(v(X, WA, 'B10')), 'start': num(v(X, WA, 'B33')),
        'iterations': 6, 'prmMature': num(v(X, WA, 'B6')), 'countryRisk': num(v(X, WA, 'B7')), 'interestFY': num(v(X, WA, 'B30'))}
valuation = {'g': num(v(X, PF, 'B123')), 'exitMultiple': num(v(X, PF, 'B234')), 'comparablesMedian': num(v(X, PF, 'B232')), 'multipleDiscount': num(v(X, PF, 'B233')),
             'wGordon': num(v(X, PF, 'B243')), 'tvFcf': 'normalized', 'signalThreshold': num(v(X, PF, 'B155')) * 100,
             'bridge': {'debt': num(v(X, PF, 'B91')), 'lease': num(v(X, PF, 'B92')), 'cash': num(v(X, PF, 'B84'))},
             'roll': {'enabled': True, 't1': num(v(X, PF, 'B253')), 't2': num(v(X, PF, 'B254')), 'fcfGenerated': num(v(X, PF, 'B257')),
                      'debt': -num(v(X, PF, 'B259')), 'lease': -num(v(X, PF, 'B260')), 'cash': num(v(X, PF, 'B261'))}}
market = {'price': num(v(X, WA, 'B13')), 'shares': num(v(X, WA, 'B17')), 'priceDate': v(X, WA, 'B14'), 'consensus': num(v(X, 'Generales', 'B24'))}
peersMkt = [{'name': X[WA][f'{c}3'].value, 'price': X[WA][f'{c}13'].value, 'date': v(X, WA, f'{c}14'), 'ev': X[PF][f'{c2}229'].value, 'ebitda': X[PF][f'{c2}230'].value, 'evEbitda': X[PF][f'{c2}231'].value}
            for c, c2 in zip('CDE', 'CDE')]


def expected(b):
    g = lambda ref: num(v(b, PF, ref))
    R0 = find_row(b[PF], '12. SENSIBILIDAD DEL PRECIO OBJETIVO FINAL')
    return {
        'inflation': row(b, PF, 10),
        'revenue': row(b, PF, 67), 'ebit': row(b, PF, 73), 'taxEbit': [-x for x in row(b, PF, 112)], 'da': [-x for x in row(b, PF, 72)],
        'capex': [-x for x in row(b, PF, 104)], 'nwcRelease': row(b, PF, 116), 'fcf': row(b, PF, 117), 'netIncome': row(b, PF, 78),
        'cash': row(b, PF, 84), 'equityBook': row(b, PF, 95), 'balanceCheck': row(b, PF, 97), 'growthExternal': row(b, PF, 23), 'growthFinal': row(b, PF, 28),
        'marginFinal': row(b, PF, 41), 'ebitda': row(b, PF, 71), 'lsSales': [g('B26')] + row(b, PF, 26),
        'fcfTv': g('B127'), 'pvFcf': g('B134'), 'tvG': g('B129'), 'pvTvG': g('B131'), 'evG': g('B136'), 'tvM': g('B236'), 'pvTvM': g('B237'), 'evM': g('B238'), 'evW': g('B245'),
        'ev2': g('B258'), 'eq2': g('B262'), 'eqVal': g('B263'), 'price': g('B265'), 'upside': (g('B265') / g('B151') - 1) * 100,
        'wacc': g('B126') * 100, 'ke': g('B221') * 100, 'priceG': g('B150'), 'priceM': g('B240'), 'priceW': g('B246'), 'tvWeight': g('B137') * 100,
        'impliedMultiple': g('B241'), 'impliedG': g('B242'), 'signal': v(b, PF, 'B268'),
        'waccMarket': num(v(b, WA, 'B33')) * 100, 'keMarket': num(v(b, WA, 'B29')) * 100, 'betaMarket': num(v(b, WA, 'B28')),
        'waccIterations': [[num(b[PF][f'{c}{r}'].value) for c in 'BCDEFG'] for r in range(214, 220)],
        'betaU': num(b[BK]['B19'].value), 'betaLMarket': num(v(b, WA, 'B28')), 'betaLIter': num(b[PF]['E219'].value),
        'sensGordonClose': {'waccs': [num(b[PF][f'A{r}'].value) for r in range(163, 168)], 'gs': [num(b[PF][f'{c}162'].value) for c in 'BCDEF'],
                            'grid': [[num(b[PF][f'{c}{r}'].value) for c in 'BCDEF'] for r in range(163, 168)]},
        'sensFinal': {'waccs': [num(b[PF][f'A{r}'].value) for r in range(R0 + 2, R0 + 7)], 'gs': [num(b[PF][f'{c}{R0+1}'].value) for c in 'BCDEF'],
                      'grid': [[num(b[PF][f'{c}{r}'].value) for c in 'BCDEF'] for r in range(R0 + 2, R0 + 7)]},
        'combined': num(v(b, VC, 'B9')),
    }


exp = {k: expected(books[k]) for k in COMBOS}

# ---------------------------------------------------------------- Trading Comps (hoja Multiplos)
T = X[MU]
peers = []
for r in range(5, 15):
    mult = {}
    for c, k in zip('MNOPQRS', ['evSales', 'evEbitda', 'evEbit', 'pe', 'ptbv', 'evEbitdaNtm', 'peNtm']):
        mult[k] = na(T[f'{c}{r}'].value)
    peers.append({'name': T[f'A{r}'].value, 'country': T[f'B{r}'].value, 'industry': T[f'C{r}'].value, 'model': T[f'D{r}'].value,
                  'tevUsd': T[f'E{r}'].value, 'salesUsd': T[f'F{r}'].value, 'ebitdaMargin': T[f'G{r}'].value, 'growth': T[f'H{r}'].value, 'leverage': T[f'I{r}'].value,
                  'classification': T[f'J{r}'].value, 'include': int(T[f'K{r}'].value), 'reason': T[f'L{r}'].value, 'multiples': mult})
mkeys = {'EV/EBITDA LTM': 'evEbitda', 'EV/EBIT LTM': 'evEbit', 'P/U LTM': 'pe', 'EV/Ventas LTM': 'evSales', 'P/VL tangible': 'ptbv', 'EV/EBITDA NTM': 'evEbitdaNtm', 'P/U NTM': 'peNtm'}
metricOf = {'evEbitda': 'ebitda', 'evEbit': 'ebit', 'pe': 'eps', 'evSales': 'revenue', 'ptbv': None, 'evEbitdaNtm': None, 'peNtm': None}
REASONS = {'evEbitda': 'Múltiplo principal del sector (EV incluye arrendamientos; EBITDA post-NIIF 16).', 'evEbit': 'Complementa EV/EBITDA con la depreciación.',
           'pe': 'Múltiplo de capital; utilidades LTM.', 'evSales': 'Excluido: ignora el margen (los pares tienen márgenes EBITDA de 5.6% a 11%).',
           'ptbv': 'Sin dato en la fuente.', 'evEbitdaNtm': 'Sin dato en la fuente.', 'peNtm': 'Sin dato en la fuente.'}
multiples = []
for r in range(34, 41):
    k = mkeys[T[f'A{r}'].value]
    multiples.append({'key': k, 'label': T[f'A{r}'].value, 'kind': T[f'B{r}'].value, 'metric': metricOf[k], 'use': int(T[f'D{r}'].value), 'status': T[f'E{r}'].value, 'reason': REASONS[k]})
comps = {
    'source': 'S&P Capital IQ, "MULTIPLOS DE SORIANA Y COMPETIDORES.xls" (hoja Multiplos del Excel PRO)', 'asOf': '2026-06-30',
    'peers': peers,
    'target': {'revenue': T['B18'].value, 'ebit': T['B19'].value, 'da': T['B20'].value, 'ebitda': T['B21'].value, 'netIncome': T['B22'].value,
               'shares': T['B23'].value, 'eps': T['B24'].value, 'cash': T['B25'].value, 'debt': -T['B26'].value, 'lease': -T['B27'].value,
               'minority': T['B28'].value, 'preferred': T['B29'].value,
               'sources': {k: F[MU][f'B{r}'].value for k, r in dict(revenue=18, ebit=19, da=20, ebitda=21, netIncome=22, shares=23, eps=24, cash=25, debt=26, lease=27, minority=28, preferred=29).items()}},
    'multiples': multiples,
    'note': 'Múltiplos de los pares al 30-jun-2026 (CIQ) y puente al 2T26; la metodología de clase no prevé llevarlos a la fecha de valuación del DCF (01-oct-2026).',
}
compsExp = {
    'stats': {k: [T[f'{c}{r}'].value for r in range(58, 65)] for c, k in zip('BCDE', ['evSales', 'evEbitda', 'evEbit', 'pe'])},
    'prices': {k: [T[f'{c}{r}'].value for r in range(58, 64)] for c, k in zip('GHIJ', ['evSales', 'evEbitda', 'evEbit', 'pe'])},
    'value': T['D73'].value, 'p25': T['D74'].value, 'p75': T['D75'].value, 'adjustment': T['B30'].value,
}

# ---------------------------------------------------------------- Precedent Transactions CIQ (histórico; hoja Transacciones)
P = X[TR]
deals = []
for r in range(12, 15):
    deals.append({'date': v(X, TR, f'A{r}'), 'id': P[f'B{r}'].value, 'target': P[f'C{r}'].value, 'buyer': P[f'D{r}'].value, 'seller': P[f'E{r}'].value,
                  'tev': P[f'F{r}'].value, 'size': P[f'G{r}'].value, 'evSales': na(P[f'H{r}'].value), 'evEbitda': na(P[f'I{r}'].value),
                  'country': P[f'J{r}'].value, 'industry': P[f'Q{r}'].value, 'control': P[f'N{r}'].value, 'include': int(P[f'O{r}'].value), 'note': P[f'P{r}'].value})
transactions = {
    'source': 'S&P Capital IQ, "TRANSACCIONES INDUSTRIA RETAIL.xls" (hoja Transacciones del Excel PRO) · muestra histórica, no defendible',
    'criteria': {'valuationDate': v(X, TR, 'C4'), 'windowYears': P['C5'].value, 'geography': P['C7'].value, 'minMultiples': P['C8'].value},
    'deals': deals, 'ciqMean': {'evSales': P['H15'].value, 'evEbitda': P['I15'].value},
    'multiples': [{'key': 'evEbitda', 'label': 'EV/EBITDA', 'metric': 'ebitda', 'use': int(P['C46'].value), 'status': P['D46'].value, 'reason': P['E46'].value},
                  {'key': 'evSales', 'label': 'EV/Ventas', 'metric': 'revenue', 'use': int(P['C47'].value), 'status': P['D47'].value, 'reason': P['E47'].value}],
    'warning': P['A52'].value,
}
transExp = {'stats': {k: [P[f'{c}{r}'].value for r in range(28, 35)] for c, k in zip('BC', ['evSales', 'evEbitda'])},
            'prices': {k: [P[f'{c}{r}'].value for r in range(28, 34)] for c, k in zip('DE', ['evSales', 'evEbitda'])},
            'value': P['E49'].value, 'lo': P['E50'].value, 'hi': P['F50'].value, 'windowStart': v(X, TR, 'C6'),
            'detail': {k: [P[f'{c}{r}'].value for r in range(37, 43)] for c, k in zip('BC', ['evSales', 'evEbitda'])}}

# ---------------------------------------------------------------- Precedent Transactions LSEG/SDC (auditada)
S = X[SDC]; SF = F[SDC]
HR = find_row(S, 'M&A SDC Deal Number')
heads = [S.cell(HR, c).value for c in range(1, 34)]
D0 = HR + 1; D1 = D0
while isinstance(S[f'A{D1 + 1}'].value, (int, float)): D1 += 1
sdcDeals = []
for r in range(D0, D1 + 1):
    c = lambda i: S.cell(r, i).value
    sdcDeals.append({
        'id': str(int(c(1))), 'date': v(X, SDC, f'B{r}'), 'target': c(3), 'targetNation': c(4), 'targetIndustry': c(5), 'publicStatus': c(6),
        'acquiror': c(7), 'acquirorNation': c(8), 'status': c(9), 'rankValue': na(c(10)), 'ev': na(c(11)),
        'evEbitda': na(c(14)), 'pe': na(c(15)), 'evSales': na(c(16)), 'prem1d': na(c(17)), 'prem4w': na(c(18)), 'salesLtm': na(c(19)),
        'sector': c(23), 'nature': c(26), 'judgment': c(27), 'reason': c(29), 'change': c(30) or '',
        'expected': {'nMultiples': c(20), 'inWindow': c(21), 'enough': c(22), 'buyback': c(24), 'include': c(28), 'rankMxn': na(c(12)), 'evMxn': na(c(13))},
    })
statRow = {lab: find_row(S, lab, start=D1) for lab in ['Mínimo', 'Percentil 25', 'Media', 'Mediana', 'Percentil 75', 'Máximo', 'n (observaciones)',
                                                        'Límite inferior', 'Límite superior', 'Atípicos detectados', 'Media sin atípicos', 'Mediana sin atípicos']}
STK = [('min', 'Mínimo'), ('p25', 'Percentil 25'), ('mean', 'Media'), ('median', 'Mediana'), ('p75', 'Percentil 75'), ('max', 'Máximo')]
sdcExp = {
    'stats': {k: {s: na(S[f'{c_}{statRow[l]}'].value) for s, l in STK} | {'n': S[f'{c_}{statRow["n (observaciones)"]}'].value,
                                                                           'lo': na(S[f'{c_}{statRow["Límite inferior"]}'].value), 'hi': na(S[f'{c_}{statRow["Límite superior"]}'].value),
                                                                           'nOut': S[f'{c_}{statRow["Atípicos detectados"]}'].value,
                                                                           'meanEx': na(S[f'{c_}{statRow["Media sin atípicos"]}'].value), 'medianEx': na(S[f'{c_}{statRow["Mediana sin atípicos"]}'].value)}
              for c_, k in zip('CDE', ['evEbitda', 'evSales', 'pe'])},
    'prices': {s: na(S[f'F{statRow[l]}'].value) for s, l in STK} | {'meanEx': na(S[f'F{statRow["Media sin atípicos"]}'].value), 'medianEx': na(S[f'F{statRow["Mediana sin atípicos"]}'].value)},
    'pricesSales': {s: S[f'H{statRow[l]}'].value for s, l in STK},
}
s0 = find_row(S, 'Muestra auditada (oficial)', start=D1)
sens = []
for r in range(s0, s0 + 4):
    sens.append({'label': S[f'A{r}'].value, 'drop': [], 'n': S[f'C{r}'].value, 'median': S[f'D{r}'].value, 'priceMedian': S[f'E{r}'].value,
                 'meanEx': S[f'F{r}'].value, 'priceMeanEx': S[f'G{r}'].value, 'dropped': S[f'H{r}'].value})
# Operaciones retiradas en cada caso: se leen de las columnas auxiliares (AK:AN) del Excel ("" = retirada).
for k, sc in enumerate(sens):
    colIdx = 37 + k
    sc['drop'] = [str(int(S.cell(r, 1).value)) for r in range(D0, D1 + 1)
                  if isinstance(S.cell(r, 31).value, (int, float)) and S.cell(r, colIdx).value in (None, '')]
orig = s0 + 4
sensOriginal = {'label': S[f'A{orig}'].value, 'n': S[f'C{orig}'].value, 'median': S[f'D{orig}'].value, 'priceMedian': S[f'E{orig}'].value, 'meanEx': S[f'F{orig}'].value, 'priceMeanEx': S[f'G{orig}'].value}
fr = find_row(S, 'Paso') + 1
funnel = []
while S[f'A{fr}'].value:
    funnel.append([S[f'A{fr}'].value, S[f'C{fr}'].value, S[f'H{fr}'].value]); fr += 1
cr0 = find_row(S, 'Estadístico oficial', start=D1)
rr0 = find_row(S, 'Umbral para COMPRAR', start=D1)
recommendation = {'buy': S[f'C{rr0}'].value, 'sell': S[f'C{rr0+1}'].value, 'target': S[f'C{rr0+2}'].value, 'potential': S[f'C{rr0+3}'].value,
                  'rating': S[f'C{rr0+4}'].value, 'experts': S[f'C{rr0+5}'].value, 'fairLo': S[f'C{rr0+6}'].value, 'fairHi': S[f'C{rr0+7}'].value,
                  'rule': 'Precio objetivo = valuación combinada; COMPRAR si el potencial supera +10%, VENDER si es menor que −10% (hoja Transacciones SDC §7).'}
sdc = {
    'source': S['A2'].value,
    'screen': {'file': 'GridExport_October_19_2026_9_29_57.pdf', 'date': '2026-10-19', 'time': '09:29:57', 'count': 166, 'columns': 23, 'provider': 'LSEG/SDC (Refinitiv)'},
    'criteria': {'valuationDate': v(X, SDC, 'C6'), 'windowYears': S['C7'].value, 'windowStart': v(X, SDC, 'C8'), 'minMultiples': S['C9'].value},
    'fx': {'rate': S['C10'].value, 'source': S['C11'].value},
    'funnel': funnel,
    'headers': heads[:30],
    'deals': sdcDeals,
    'official': 'median',
    'weightNote': S[f'A{cr0 + 6}'].value,
    'statNote': S[f'A{cr0 + 7}'].value,
    'sensitivity': sens, 'original': sensOriginal,
}

# ---------------------------------------------------------------- combinada
C = X[VC]
combined = {'weights': {'dcf': C['C4'].value, 'comps': C['C5'].value, 'transactions': C['C6'].value},
            'reasons': {'dcf': C['F4'].value, 'comps': C['F5'].value, 'transactions': C['F6'].value},
            'transactionsSource': 'sdc',
            'classRule': 'Diap. 18: pesos iguales (⅓) entre métodos; aquí 50/50 entre los métodos activos y Precedent Transactions 0% (referencia LSEG/SDC).'}
combExp = {'value': C['B9'].value, 'classRule': C['B14'].value, 'dcfLo': C['B18'].value, 'dcfHi': C['D18'].value,
           'ptLo': C['B20'].value, 'ptHi': C['D20'].value, 'ciqHist': [C['B21'].value, C['C21'].value, C['D21'].value]}

# ---------------------------------------------------------------- contraste externo
CE = X['Contraste externo']
external = []
r = 5
while CE[f'A{r}'].value:
    g_ = lambda c: CE[f'{c}{r}'].value
    external.append({'key': g_('A'), 'source': g_('B'), 'method': g_('C'), 'date': g_('D'), 'value': na(g_('E')), 'lo': na(g_('F')), 'hi': na(g_('G')),
                     'refPrice': na(g_('H')), 'refDate': g_('I'), 'diff': na(g_('J')), 'assumptions': g_('K'), 'limits': g_('L'), 'official': g_('M'), 'page': g_('N')})
    r += 1
externalNotes = [CE[f'A{r + 1}'].value, CE[f'A{r + 2}'].value]

# ---------------------------------------------------------------- fuentes, validación y auditoría
FU = X['Fuentes']; NR = find_row(FU, 'NOTAS METODOLÓGICAS')
registry = [[FU.cell(r, c).value for c in range(1, 8)] for r in range(6, NR) if FU.cell(r, 1).value]
notes = [FU.cell(r, 1).value for r in range(NR + 1, NR + 10) if FU.cell(r, 1).value]
VA = X['Validación']; RS = find_row(VA, 'RESUMEN')
validation = {'summary': VA[f'B{RS}'].value,
              'checks': [[VA[f'A{r}'].value, VA[f'G{r}'].value] for r in range(23, RS) if VA[f'A{r}'].value and VA[f'G{r}'].value in ('PASS', 'FAIL')]}
AU = X['Auditoría']
audit = {'note': AU['A2'].value, 'findings': [[AU.cell(r, c).value for c in range(2, 8)] for r in range(5, 40) if AU.cell(r, 2).value]}

data = {'file': os.path.basename(SRC), 'build': build, 'inflation': inflation, 'wacc': wacc, 'valuation': valuation, 'market': market, 'peersMarket': peersMkt,
        'comps': comps, 'transactions': transactions, 'sdc': sdc, 'combined': combined, 'recommendation': recommendation, 'external': external, 'externalNotes': externalNotes,
        'registry': registry, 'beta': beta, 'notes': notes, 'audit': audit,
        'expected': {'dcf': exp, 'comps': compsExp, 'transactions': transExp, 'sdc': sdcExp, 'combined': combExp, 'validation': validation}}
n_checks = len(validation['checks'])
assert validation['summary'] == f'{n_checks} PASS de {n_checks}', (validation['summary'], n_checks)
with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('// ARCHIVO GENERADO por tools/excel/extract_dataset.py a partir del Excel PRO AUDITADO. No editar a mano.\n')
    fh.write('// Valores con precisión completa (sin redondear). Las referencias de celda viven en los campos source/cell.\n')
    fh.write('/* eslint-disable */\n')
    fh.write('export const SORIANA_XL = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print('OK', OUT, validation['summary'], 'sdc deals', len(sdcDeals), 'external', len(external))
