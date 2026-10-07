"""Genera src/data/soriana.excel.ts a partir del Excel maestro integrado.

Uso:  python3 -I tools/excel/extract_dataset.py <excel_maestro.xlsx> <salida.ts> [<perfil_libreoffice>]

- Todos los insumos se leen de celdas del Excel con precisión completa (sin redondear) y se guardan
  junto con la referencia de la celda de origen.
- Los resultados esperados por escenario de inflación se obtienen recalculando el libro en LibreOffice
  con cada valor del selector Inflación!B6 (0..3). La app debe reproducirlos (tests/excel-master.test.ts).
"""
import sys, os, json, subprocess, tempfile, datetime as dt, openpyxl

SRC, OUT = sys.argv[1], sys.argv[2]
PROF = sys.argv[3] if len(sys.argv) > 3 else os.path.join(tempfile.gettempdir(), 'vf-lo-profile')
PF, INF, TC, PT, VC, WA = 'Proyección Final Soriana', 'Inflación', 'Trading Comps', 'Precedent Transactions', 'Valuación Combinada', 'WACC'
COLS = 'CDEFG'


def recalc(path, outdir):
    os.makedirs(outdir, exist_ok=True)
    subprocess.run(['soffice', f'-env:UserInstallation=file://{PROF}', '--headless', '--calc', '--convert-to', 'xlsx', '--outdir', outdir, path],
                   check=True, capture_output=True, timeout=300)
    return os.path.join(outdir, os.path.basename(path))


def with_selector(sel, wd):
    wb = openpyxl.load_workbook(SRC)
    wb[INF]['B6'] = sel
    p = os.path.join(wd, f'sel{sel}.xlsx')
    wb.save(p)
    return openpyxl.load_workbook(recalc(p, os.path.join(wd, f'r{sel}')), data_only=True)


wd = tempfile.mkdtemp(prefix='vf-extract-')
books = {s: with_selector(s, wd) for s in range(4)}
fx = openpyxl.load_workbook(SRC)          # fórmulas (para documentar)
X = books[2]                               # escenario Base (por defecto)


def v(wb, sh, ref):
    x = wb[sh][ref].value
    if isinstance(x, dt.datetime): return x.date().isoformat()
    return x


def row(wb, sh, r, cols=COLS, blank=None):
    return [blank if wb[sh][f'{c}{r}'].value is None else v(wb, sh, f'{c}{r}') for c in cols]


def num(x):
    assert isinstance(x, (int, float)), x
    return float(x)


# ---------------------------------------------------------------- proyección por drivers
build = {
    'source': "Excel maestro · hoja 'Proyección Final Soriana' (filas 5–117)",
    'weightsExternal': row(X, PF, 6),
    'sales': {
        'gdp': row(X, PF, 11), 'elasticity': row(X, PF, 12), 'consumptionAdj': row(X, PF, 13),
        'adjustments': [{'label': X[PF][f'A{r}'].value, 'cell': f'C{r}:G{r}', 'values': row(X, PF, r)} for r in range(15, 23)],
        'lsSales': [num(v(X, PF, 'B26'))] + row(X, PF, 26),
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

# ---------------------------------------------------------------- inflación
series = []
r = 60
while X[INF][f'A{r}'].value is not None and isinstance(X[INF][f'B{r}'].value, (int, float)):
    series.append([v(X, INF, f'A{r}'), num(X[INF][f'B{r}'].value)]); r += 1
inflation = {
    'source': X[INF]['A2'].value,
    'default': 'base',
    'order': ['citi', 'cautela', 'base', 'alcista'],
    'scenarios': {
        'citi': {'label': 'Trayectoria Citi (histórico)', 'kind': 'Pronóstico de consenso (insumo heredado)', 'path': row(X, INF, 9, 'BCDEF'), 'source': X[INF]['H9'].value, 'cell': 'Inflación!B9:F9'},
        'cautela': {'label': 'Cautela', 'kind': 'Escenario / referencia de tendencia larga', 'value': num(v(X, INF, 'B47')), 'source': X[INF]['H47'].value, 'cell': 'Inflación!B47'},
        'base': {'label': 'Base', 'kind': 'Resultado de modelo (pronóstico)', 'value': num(v(X, INF, 'B48')), 'source': X[INF]['H48'].value, 'cell': 'Inflación!B48 = ROUND(G33, 4)'},
        'alcista': {'label': 'Alcista', 'kind': 'Supuesto de escenario (no es pronóstico)', 'value': num(v(X, INF, 'B49')), 'source': X[INF]['H49'].value, 'cell': 'Inflación!B49'},
    },
    'series': series,
    'models': {k: {'a': X[INF][f'C{r}'].value, 'b': X[INF][f'D{r}'].value, 'r2': X[INF][f'E{r}'].value, 'xNext': X[INF][f'F{r}'].value, 'forecast': X[INF][f'G{r}'].value, 'n': X[INF][f'B{r}'].value}
               for k, r in dict(immediate=32, quarterly=33, long=34, classRounded=35, classS113=36).items()},
    'quarterlyAverages': row(X, INF, 38, 'BCDE'),
    'chain': [[X[INF][f'A{r}'].value, X[INF][f'B{r}'].value, X[INF][f'H{r}'].value] for r in range(17, 26)],
}
bs = next(r for r in range(170, 400) if str(X[INF][f'A{r}'].value or '').startswith('BETA HISTÓRICA'))
inflation['beta'] = {'historical': X[INF][f'B{bs+1}'].value, 'r2': X[INF][f'B{bs+2}'].value, 'n': X[INF][f'B{bs+3}'].value, 'reported': X[INF][f'B{bs+4}'].value,
                     'wacc': X[INF][f'B{bs+7}'].value, 'damodaranUnverified': X[INF][f'B{bs+8}'].value}

# ---------------------------------------------------------------- WACC / valuación
wacc = {'rf': num(v(X, PF, 'B210')), 'prm': num(v(X, PF, 'B211')), 'betaU': num(v(X, PF, 'B212')), 'kdPre': num(v(X, PF, 'B206')), 'taxShield': num(v(X, PF, 'B207')),
        'debt': num(v(X, PF, 'B209')), 'kdMarket': num(v(X, WA, 'B31')), 'taxMarket': num(v(X, WA, 'B10')), 'start': num(v(X, WA, 'B33')),
        'iterations': 6, 'prmMature': num(v(X, WA, 'B6')), 'countryRisk': num(v(X, WA, 'B7')), 'interestFY': num(v(X, WA, 'B30'))}
valuation = {'g': num(v(X, PF, 'B123')), 'exitMultiple': num(v(X, PF, 'B234')), 'comparablesMedian': num(v(X, PF, 'B232')), 'multipleDiscount': num(v(X, PF, 'B233')),
             'wGordon': num(v(X, PF, 'B243')),
             'bridge': {'debt': num(v(X, PF, 'B91')), 'lease': num(v(X, PF, 'B92')), 'cash': num(v(X, PF, 'B84'))},
             'roll': {'enabled': True, 't1': num(v(X, PF, 'B253')), 't2': num(v(X, PF, 'B254')), 'fcfGenerated': num(v(X, PF, 'B257')),
                      'debt': -num(v(X, PF, 'B259')), 'lease': -num(v(X, PF, 'B260')), 'cash': num(v(X, PF, 'B261'))}}
market = {'price': num(v(X, WA, 'B13')), 'shares': num(v(X, WA, 'B17'))}


def expected(b):
    g = lambda ref: num(v(b, PF, ref))
    return {
        'inflation': row(b, PF, 10),
        'revenue': row(b, PF, 67), 'ebit': row(b, PF, 73), 'taxEbit': [-x for x in row(b, PF, 112)], 'da': [-x for x in row(b, PF, 72)],
        'capex': [-x for x in row(b, PF, 104)], 'nwcRelease': row(b, PF, 116), 'fcf': row(b, PF, 117), 'netIncome': row(b, PF, 78),
        'cash': row(b, PF, 84), 'equityBook': row(b, PF, 95), 'balanceCheck': row(b, PF, 97), 'growthExternal': row(b, PF, 23), 'growthFinal': row(b, PF, 28),
        'marginFinal': row(b, PF, 41), 'ebitda': row(b, PF, 71),
        'pvFcf': g('B134'), 'tvG': g('B129'), 'pvTvG': g('B131'), 'evG': g('B136'), 'tvM': g('B236'), 'pvTvM': g('B237'), 'evM': g('B238'), 'evW': g('B245'),
        'ev2': g('B258'), 'eq2': g('B262'), 'eqVal': g('B263'), 'price': g('B265'), 'upside': (g('B265') / g('B151') - 1) * 100,
        'wacc': g('B126') * 100, 'ke': g('B221') * 100, 'priceG': g('B150'), 'priceM': g('B240'), 'priceW': g('B246'), 'tvWeight': g('B137') * 100,
        'waccMarket': num(v(b, WA, 'B33')) * 100, 'keMarket': num(v(b, WA, 'B29')) * 100, 'betaMarket': num(v(b, WA, 'B28')),
        'waccIterations': [[num(b[PF][f'{c}{r}'].value) for c in 'BCDEFG'] for r in range(214, 220)],
        'sensGordonClose': {'waccs': [num(b[PF][f'A{r}'].value) for r in range(163, 168)], 'gs': [num(b[PF][f'{c}162'].value) for c in 'BCDEF'],
                            'grid': [[num(b[PF][f'{c}{r}'].value) for c in 'BCDEF'] for r in range(163, 168)]},
        'combined': num(v(b, VC, 'B11')),
    }


exp = {k: expected(books[s]) for s, k in enumerate(['citi', 'cautela', 'base', 'alcista'])}

# ---------------------------------------------------------------- Trading Comps
T = X[TC]
peers = []
for r in range(7, 17):
    mult = {}
    for c, k in zip('MNOPQRS', ['evSales', 'evEbitda', 'evEbit', 'pe', 'ptbv', 'evEbitdaNtm', 'peNtm']):
        x = T[f'{c}{r}'].value
        mult[k] = float(x) if isinstance(x, (int, float)) else None
    peers.append({'name': T[f'A{r}'].value, 'country': T[f'B{r}'].value, 'industry': T[f'C{r}'].value, 'model': T[f'D{r}'].value,
                  'tevUsd': T[f'E{r}'].value, 'salesUsd': T[f'F{r}'].value, 'ebitdaMargin': T[f'G{r}'].value, 'growth': T[f'H{r}'].value, 'leverage': T[f'I{r}'].value,
                  'classification': T[f'J{r}'].value, 'include': int(T[f'K{r}'].value), 'reason': T[f'L{r}'].value, 'multiples': mult})
mkeys = {'EV/EBITDA LTM': 'evEbitda', 'EV/EBIT LTM': 'evEbit', 'P/U LTM': 'pe', 'EV/Ventas LTM': 'evSales', 'P/VL tangible': 'ptbv', 'EV/EBITDA NTM': 'evEbitdaNtm', 'P/U NTM': 'peNtm'}
metricOf = {'evEbitda': 'ebitda', 'evEbit': 'ebit', 'pe': 'eps', 'evSales': 'revenue', 'ptbv': None, 'evEbitdaNtm': None, 'peNtm': None}
multiples = [{'key': mkeys[T[f'A{r}'].value], 'label': T[f'A{r}'].value, 'kind': T[f'B{r}'].value, 'metric': metricOf[mkeys[T[f'A{r}'].value]],
              'use': int(T[f'D{r}'].value), 'status': T[f'E{r}'].value, 'reason': T[f'F{r}'].value} for r in range(42, 49)]
comps = {
    'source': T['A2'].value, 'asOf': '2026-06-30',
    'peers': peers, 'ciqMean': {k: T[f'{c}20'].value for c, k in zip('MNOP', ['evSales', 'evEbitda', 'evEbit', 'pe'])},
    'target': {'revenue': T['B25'].value, 'ebit': T['B26'].value, 'da': T['B27'].value, 'ebitda': T['B28'].value, 'netIncome': T['B29'].value,
               'shares': T['B30'].value, 'eps': T['B31'].value, 'cash': T['B32'].value, 'debt': -T['B33'].value, 'lease': -T['B34'].value,
               'minority': T['B35'].value, 'preferred': T['B36'].value,
               'sources': {k: T[f'C{r}'].value for k, r in dict(revenue=25, ebit=26, da=27, ebitda=28, netIncome=29, shares=30, eps=31, cash=32, debt=33, lease=34, minority=35, preferred=36).items()}},
    'multiples': multiples,
    'note': 'Precios de los pares al 30-jun-2026 (as-of CIQ) y puente al 2T26; la metodología de clase no prevé llevarlo a la fecha de valuación del DCF (01-oct-2026).',
}
compsExp = {
    'stats': {k: [T[f'{c}{r}'].value for r in range(66, 73)] for c, k in zip('BCDE', ['evSales', 'evEbitda', 'evEbit', 'pe'])},
    'prices': {k: [T[f'{c}{r}'].value for r in range(66, 72)] for c, k in zip('GHIJ', ['evSales', 'evEbitda', 'evEbit', 'pe'])},
    'value': T['B83'].value, 'p25': T['B84'].value, 'p75': T['B85'].value, 'adjustment': T['B37'].value,
}

# ---------------------------------------------------------------- Precedent Transactions
P = X[PT]
deals = []
for r in range(14, 17):
    deals.append({'date': v(X, PT, f'A{r}'), 'id': P[f'B{r}'].value, 'target': P[f'C{r}'].value, 'buyer': P[f'D{r}'].value, 'seller': P[f'E{r}'].value,
                  'tev': P[f'F{r}'].value, 'size': P[f'G{r}'].value, 'evSales': P[f'H{r}'].value, 'evEbitda': P[f'I{r}'].value,
                  'country': P[f'J{r}'].value, 'control': P[f'N{r}'].value, 'include': int(P[f'O{r}'].value), 'note': P[f'P{r}'].value})
transactions = {
    'source': P['A2'].value,
    'criteria': {'valuationDate': v(X, PT, 'C6'), 'windowYears': P['C7'].value, 'geography': P['C9'].value, 'minMultiples': P['C10'].value},
    'deals': deals, 'ciqMean': {'evSales': P['H17'].value, 'evEbitda': P['I17'].value},
    'multiples': [{'key': 'evEbitda', 'label': 'EV/EBITDA', 'metric': 'ebitda', 'use': int(P['C43'].value), 'status': P['D43'].value, 'reason': P['E43'].value},
                  {'key': 'evSales', 'label': 'EV/Ventas', 'metric': 'revenue', 'use': int(P['C44'].value), 'status': P['D44'].value, 'reason': P['E44'].value}],
    'warning': P['A49'].value,
}
transExp = {'stats': {k: [P[f'{c}{r}'].value for r in range(32, 39)] for c, k in zip('HI', ['evSales', 'evEbitda'])},
            'prices': {k: [P[f'{c}{r}'].value for r in range(32, 38)] for c, k in zip('JK', ['evSales', 'evEbitda'])},
            'value': P['E46'].value, 'lo': P['E47'].value, 'hi': P['F47'].value, 'windowStart': v(X, PT, 'C8')}

# ---------------------------------------------------------------- combinada
C = X[VC]
combined = {'weights': {'dcf': C['C6'].value, 'comps': C['C7'].value, 'transactions': C['C8'].value},
            'reasons': {'dcf': C['F6'].value, 'comps': C['F7'].value, 'transactions': C['F8'].value},
            'classRule': 'Diap. 18: pesos iguales (⅓) entre métodos; aquí 50/50 entre los métodos activos y Transactions 0% por decisión del proyecto.'}
combExp = {'value': C['B11'].value, 'classRule': C['B16'].value, 'dcfLo': C['B20'].value, 'dcfHi': C['D20'].value}

registry = [[X['Fuentes'].cell(r, c).value for c in range(1, 8)] for r in range(6, 30) if X['Fuentes'].cell(r, 1).value]
validation = {'summary': X['Validación']['B48'].value,
              'checks': [[X['Validación'][f'A{r}'].value, X['Validación'][f'G{r}'].value] for r in range(18, 47)]}

data = {'file': os.path.basename(SRC), 'build': build, 'inflation': inflation, 'wacc': wacc, 'valuation': valuation, 'market': market,
        'comps': comps, 'transactions': transactions, 'combined': combined, 'registry': registry,
        'expected': {'dcf': exp, 'comps': compsExp, 'transactions': transExp, 'combined': combExp, 'validation': validation}}
assert validation['summary'].startswith('29 PASS'), validation['summary']
with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('// ARCHIVO GENERADO por tools/excel/extract_dataset.py a partir del Excel maestro integrado. No editar a mano.\n')
    fh.write('// Valores con precisión completa (sin redondear). Las referencias de celda viven en los campos source/cell.\n')
    fh.write('/* eslint-disable */\n')
    fh.write('export const SORIANA_XL = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print('OK', OUT, validation['summary'])
