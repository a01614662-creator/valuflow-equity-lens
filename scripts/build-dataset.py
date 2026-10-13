"""Genera src/data/soriana.final.ts a partir de SORIANA_FINAL.xlsx (fuente de verdad del estudio).

Uso:  python3 -I scripts/build-dataset.py [excel/SORIANA_FINAL.xlsx] [src/data/soriana.final.ts]

Qué se lee (siempre de celdas del Excel, con precisión completa; nada se teclea a mano):
  - Series crudas: inflación quincenal (Inflación!AF:AG), precios semanales de Soriana B e IPC (Rendimientos!B:D),
    estados financieros (Datos), comparables (Multiplos) y transacciones (Transacciones).
  - Supuestos del modelo: drivers de la proyección (Proyección Final Soriana), WACC, puente, escenarios, g.
  - Resultados del Excel (valores calculados por Excel) para comprobar que la app los reproduce (expected.*).
Los cálculos estadísticos (modelos de inflación, correlaciones, regresión de la beta) los repite el motor de la app
con las series crudas; los resultados del Excel solo se usan para validar.
"""
import sys, os, json, datetime as dt, openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'excel', 'SORIANA_FINAL.xlsx')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, '..', 'src', 'data', 'soriana.final.ts')
wb = openpyxl.load_workbook(SRC, data_only=True)
PF, INF, ESC, WA, BR, CP, RE, PI, VA, MU, TR, VC, GE, DA, CO = ('Proyección Final Soriana', 'Inflación', 'Escenarios', 'WACC', 'Beta Regresión',
    'Crecimiento Perpetuo', 'Rendimientos', 'Precio e IPC', 'Validación', 'Multiplos', 'Transacciones', 'Valuación Combinada', 'Generales', 'Datos', 'Conclusiones')
COLS = 'CDEFG'


def j(x):
    if isinstance(x, dt.datetime): return x.date().isoformat()
    if isinstance(x, dt.date): return x.isoformat()
    if isinstance(x, float) and x == int(x) and abs(x) < 1e15: return x
    return x


def v(sh, ref): return j(wb[sh][ref].value)


def num(sh, ref):
    x = wb[sh][ref].value
    assert isinstance(x, (int, float)) and not isinstance(x, bool), (sh, ref, x)
    return float(x)


def row(sh, r, cols=COLS, blank=None):
    return [blank if wb[sh][f'{c}{r}'].value is None else j(wb[sh][f'{c}{r}'].value) for c in cols]


def find(sh, text, col='A', start=1, end=600):
    ws = wb[sh]
    for r in range(start, end):
        if str(ws[f'{col}{r}'].value or '').strip().startswith(text): return r
    raise KeyError((sh, text))


# ------------------------------------------------------------------ empresa y mercado
company = {
    'ticker': v(GE, 'B5'), 'founded': v(GE, 'B6'), 'hq': v(GE, 'B7'), 'business': v(GE, 'B8'), 'stores': v(GE, 'B9'), 'employees': v(GE, 'B10'),
    'news': [[v(GE, f'A{r}'), v(GE, f'B{r}')] for r in range(15, 20) if wb[GE][f'A{r}'].value],
    'rating': v(GE, 'B22'), 'consensus': v(GE, 'B23'), 'consensusTarget': num(GE, 'B24'), 'consensusDetail': v('Comparativo', 'B19'),
    'sssg2T26': v(GE, 'B66'), 'nextReport': v(GE, 'B73'), 'hrRevenue2027': v(GE, 'B75'),
    'range52w': v(GE, 'B79'), 'chg1y': v(GE, 'B80'), 'technical': v(GE, 'B81'), 'rsi': v(GE, 'B82'), 'macd': v(GE, 'B83'), 'ma50': v(GE, 'B84'), 'ma200': v(GE, 'B85'),
    'lastDividend': v(GE, 'B62'),
}
market = {
    'price': num(RE, 'H5'), 'priceDate': v(RE, 'H6'), 'priceSource': v(RE, 'H7'), 'valuationDate': v(PF, 'B252'),
    'shares': num(WA, 'B17'), 'marketCap': num(WA, 'B18'), 'pe': num(GE, 'B56'), 'bvps': num(GE, 'B57'), 'pbv': num(GE, 'B58'), 'divYield': num(GE, 'B63'),
    'peers': [{'name': v(WA, f'{c}3'), 'price': num(WA, f'{c}13'), 'pe': num(GE, f'{c2}90')} for c, c2 in zip('CDE', 'CDE')],
}

# Estados financieros (hoja Datos): trimestres 2T25..2T26 (C..F) y FY2025 (G)
statements = {'cols': [v(DA, f'{c}5') for c in 'BCDEFG'],
              'rows': [[v(DA, f'A{r}')] + row(DA, r, 'BCDEFG') for r in range(6, 30) if wb[DA][f'A{r}'].value]}

# Razones financieras trimestrales de Soriana (hoja Razones, filas 7-19; G = promedio de 5 trimestres)
ratios = {'periods': row('Razones', 6, 'BCDEF'), 'rows': [[v('Razones', f'A{r}')] + row('Razones', r, 'BCDEFG') for r in range(7, 20)]}

# ------------------------------------------------------------------ proyección por drivers (Proyección Final Soriana)
build = {
    'weightsExternal': row(PF, 6),
    'sales': {'gdp': row(PF, 11), 'elasticity': row(PF, 12), 'consumptionAdj': row(PF, 13),
              'adjustments': [{'label': v(PF, f'A{r}'), 'cell': f'C{r}:G{r}', 'values': row(PF, r)} for r in range(15, 23)],
              'lsSales': [num(PF, 'B26')] + row(PF, 26)},
    'margin': {'base': num(PF, 'B31'), 'adjustments': [{'label': v(PF, f'A{r}'), 'cell': f'C{r}:G{r}', 'values': row(PF, r)} for r in range(32, 40)], 'ls': row(PF, 40)},
    'da': {'ext': row(PF, 44), 'ls': row(PF, 45)},
    'capex': {'guide': row(PF, 47), 'add': row(PF, 48, blank=0.0), 'basePct': num('Valuación', 'B12'), 'extAdj': num('Variables Externas', 'J22'), 'ls': row(PF, 50)},
    'tax': {'base': num(WA, 'B10'), 'adj': row(PF, 52), 'ls': row(PF, 54)},
    'invDays': row(PF, 56), 'otherCAPct': row(PF, 57), 'opCLPct': row(PF, 58), 'costPct': row(PF, 59),
    'interestRate': row(PF, 61), 'debtAmort': row(PF, 62), 'payout': row(PF, 63), 'otherIncome': row(PF, 75),
    'base': {k: num(PF, ref) for k, ref in dict(revenue='B67', cash='B84', inventory='B85', otherCA='B86', nonCurrent='B88', opCL='B90',
                                                debt='B91', lease='B92', otherLT='B93', equity='B95', ebit='B73', da='B72', ebitda='B71').items()},
}
build['base']['da'] = -build['base']['da']
base2025 = {'revenue': num(PF, 'B67'), 'ebit': num(PF, 'B73'), 'da': -num(PF, 'B72'), 'ebitda': num(PF, 'B230'), 'capex': num(GE, 'B52'),
            'nwc': num(PF, 'B85') + num(PF, 'B86') - num(PF, 'B90'), 'fcf': num(GE, 'B53')}

wacc = {'rf': num(WA, 'B5'), 'prm': num(WA, 'B8'), 'prmMature': num(WA, 'B6'), 'countryRisk': num(WA, 'B7'), 'taxMarket': num(WA, 'B10'),
        'kdPre': num(PF, 'C61'), 'taxShield': num(PF, 'B207'), 'debt': num(PF, 'B209'), 'kdMarket': num(WA, 'B31'), 'interestFY': num(WA, 'B30'),
        'cashClose': num(WA, 'B22'), 'iterations': 6, 'iterStart': num(WA, 'B33')}
valuation = {'g': num(PF, 'B123'), 'exitMultiple': num(PF, 'B234'), 'peerMultiples': row(PF, 231, 'CDE'), 'peerNames': row(PF, 225, 'CDE'),
             'multipleDiscount': num(PF, 'B233'), 'wGordon': num(PF, 'B243'), 'threshold': num(PF, 'B155'),
             'bridge': {'debt': num(PF, 'B91'), 'lease': num(PF, 'B92'), 'cash': num(PF, 'B84')},
             'roll': {'t1': num(PF, 'B253'), 't2': num(PF, 'B254'), 'fcfGenerated': num(PF, 'B257'),
                      'debt': -num(PF, 'B259'), 'lease': -num(PF, 'B260'), 'cash': num(PF, 'B261'),
                      'dateClose': v(PF, 'B250'), 'dateBalance': v(PF, 'B251'), 'dateValuation': v(PF, 'B252')}}

# ------------------------------------------------------------------ series crudas
infl_series = []
for r in range(10, 310):
    d, x = wb[INF][f'AF{r}'].value, wb[INF][f'AG{r}'].value
    if isinstance(d, dt.datetime) and isinstance(x, (int, float)): infl_series.append([j(d), float(x)])
assert len(infl_series) == int(num(INF, 'B5'))
weekly = []
for r in range(13, 413):
    d = wb[RE][f'B{r}'].value
    if not isinstance(d, dt.datetime): continue
    s, i = wb[RE][f'C{r}'].value, wb[RE][f'D{r}'].value
    weekly.append([j(d), float(s) if isinstance(s, (int, float)) else None, float(i) if isinstance(i, (int, float)) else None])
inflation = {
    'source': 'Banco de México, SP74833 (inflación general anual, quincenal)', 'series': infl_series,
    'longWindowStart': v(INF, 'B7'),
    'scenarioConservative': num(INF, 'B20'), 'why': {'conservador': v(INF, 'C20'), 'base': v(INF, 'C21'), 'optimista': v(INF, 'C22')},
    'references': [[v(INF, f'A{r}'), num(INF, f'B{r}')] for r in (23, 24, 25)],
    'fallback': {'base': 0.0351, 'optimista': 0.0326},
}
prices = {'source': 'Investing.com (Soriana B y S&P/BMV IPC, semanal)', 'weekly': weekly,
          'counts': {'sorianaWeeks': int(num(RE, 'D5')), 'ipcWeeks': int(num(RE, 'E5')), 'first': v(RE, 'D6'), 'last': v(RE, 'D7')},
          'betaWindowWeeks': int(num(BR, 'B5')), 'betaMinObs': int(num(BR, 'B6'))}

# ------------------------------------------------------------------ escenarios y g
gref = [[v(CP, f'A{r}'), num(CP, f'B{r}') if isinstance(wb[CP][f'B{r}'].value, (int, float)) else None, v(CP, f'C{r}'), v(CP, f'D{r}'), v(CP, f'E{r}')] for r in range(6, 16)]
growth = {'references': gref, 'scenarios': {'conservador': num(CP, 'B31'), 'base': num(CP, 'B32'), 'optimista': num(CP, 'B33')},
          'why': {'conservador': v(CP, 'D31'), 'base': v(CP, 'D32'), 'optimista': v(CP, 'D33')},
          'sales2023': num(CP, 'B13'), 'declineVs2024': 0.009, 'bondExpected': num(CP, 'B12'), 'inflLT': num(CP, 'B9'), 'gdpLT': num(CP, 'B10'),
          'banxicoTarget': num(CP, 'B6'), 'intro': v(CP, 'A2')}
scenarios = {
    'order': ['conservador', 'base', 'optimista'], 'labels': {'conservador': 'Conservador', 'base': 'Base', 'optimista': 'Optimista'}, 'default': 'base',
    'salesAdj': {'conservador': num(ESC, 'B8'), 'base': num(ESC, 'C8'), 'optimista': num(ESC, 'D8')},
    'marginAdj': {'conservador': num(ESC, 'B9'), 'base': num(ESC, 'C9'), 'optimista': num(ESC, 'D9')},
    'betaShiftSE': {'conservador': 1, 'base': 0, 'optimista': -1},
    'why': [v(ESC, f'A{r}') for r in range(65, 71)],
}

# ------------------------------------------------------------------ comparables y transacciones
mk = {'EV/Ventas LTM': 'evSales', 'EV/EBITDA LTM': 'evEbitda', 'EV/EBIT LTM': 'evEbit', 'P/U LTM': 'pe', 'P/VL tangible': 'ptbv', 'EV/EBITDA NTM': 'evEbitdaNtm', 'P/U NTM': 'peNtm'}
metric = {'evEbitda': 'ebitda', 'evEbit': 'ebit', 'pe': 'eps', 'evSales': 'revenue', 'ptbv': None, 'evEbitdaNtm': None, 'peNtm': None}
peers = []
for r in range(5, 15):
    mult = {k: (float(wb[MU][f'{c}{r}'].value) if isinstance(wb[MU][f'{c}{r}'].value, (int, float)) else None) for c, k in zip('MNOPQRS', ['evSales', 'evEbitda', 'evEbit', 'pe', 'ptbv', 'evEbitdaNtm', 'peNtm'])}
    peers.append({'name': v(MU, f'A{r}'), 'country': v(MU, f'B{r}'), 'industry': v(MU, f'C{r}'), 'model': v(MU, f'D{r}'), 'tevUsd': v(MU, f'E{r}'), 'salesUsd': v(MU, f'F{r}'),
                  'ebitdaMargin': v(MU, f'G{r}'), 'growth': v(MU, f'H{r}'), 'leverage': v(MU, f'I{r}'), 'classification': v(MU, f'J{r}'), 'include': int(num(MU, f'K{r}')),
                  'reason': v(MU, f'L{r}'), 'multiples': mult})
comps = {
    'source': 'S&P Capital IQ, Quick Comparable Analysis (múltiplos publicados, as-of 30-jun-2026)', 'asOf': '2026-06-30', 'peers': peers,
    'target': {'revenue': num(MU, 'B18'), 'ebit': num(MU, 'B19'), 'da': num(MU, 'B20'), 'ebitda': num(MU, 'B21'), 'netIncome': num(MU, 'B22'), 'shares': num(MU, 'B23'),
               'eps': num(MU, 'B24'), 'cash': num(MU, 'B25'), 'debt': -num(MU, 'B26'), 'lease': -num(MU, 'B27'), 'minority': num(MU, 'B28'), 'preferred': num(MU, 'B29'),
               'sources': {'revenue': 'Datos!C6:F6', 'ebit': 'Datos!C9:F9', 'ebitda': 'EBIT + D&A', 'eps': 'Utilidad neta LTM / acciones', 'shares': 'WACC!B17',
                           'cash': 'Datos!F17', 'debt': 'Datos!F25:F26', 'lease': 'Datos!F27:F28', 'minority': 'NA en MXN', 'preferred': 'Sin capital preferente'}},
    'multiples': [{'key': mk[v(MU, f'A{r}')], 'label': v(MU, f'A{r}'), 'kind': v(MU, f'B{r}'), 'metric': metric[mk[v(MU, f'A{r}')]], 'use': int(num(MU, f'D{r}')),
                   'status': v(MU, f'E{r}'), 'reason': v(MU, f'F{r}') or v(MU, f'E{r}')} for r in range(34, 41)],
}
deals = []
for r in range(12, 15):
    deals.append({'date': v(TR, f'A{r}'), 'id': v(TR, f'B{r}'), 'target': v(TR, f'C{r}'), 'buyer': v(TR, f'D{r}'), 'seller': v(TR, f'E{r}'), 'tev': v(TR, f'F{r}'), 'size': v(TR, f'G{r}'),
                  'evSales': num(TR, f'H{r}'), 'evEbitda': num(TR, f'I{r}'), 'country': v(TR, f'J{r}'), 'control': v(TR, f'N{r}'), 'include': int(num(TR, f'O{r}')),
                  'note': v(TR, f'P{r}'), 'industry': v(TR, f'Q{r}')})
transactions = {'source': 'S&P Capital IQ, Comparable M&A Transactions',
                'criteria': {'valuationDate': v(TR, 'C4'), 'windowYears': num(TR, 'C5'), 'geography': v(TR, 'C7'), 'minMultiples': num(TR, 'C8')},
                'deals': deals,
                'multiples': [{'key': 'evEbitda', 'label': 'EV/EBITDA', 'metric': 'ebitda', 'use': int(num(TR, 'C46')), 'status': v(TR, 'D46'), 'reason': v(TR, 'E46')},
                              {'key': 'evSales', 'label': 'EV/Ventas', 'metric': 'revenue', 'use': int(num(TR, 'C47')), 'status': v(TR, 'D47'), 'reason': v(TR, 'E47')}],
                'warning': v(TR, 'A52')}
combined = {'weights': {'dcf': num(VC, 'C4'), 'comps': num(VC, 'C5'), 'transactions': num(VC, 'C6')},
            'reasons': {'dcf': v(VC, 'F4'), 'comps': v(VC, 'F5'), 'transactions': v(VC, 'F6')}}

# ------------------------------------------------------------------ resultados del Excel (para validar)
def f(sh, ref):
    x = wb[sh][ref].value
    return float(x) if isinstance(x, (int, float)) and not isinstance(x, bool) else j(x)


E = {}
E['dcf'] = {
    'revenue': row(PF, 67), 'ebit': row(PF, 73), 'taxEbit': [-x for x in row(PF, 112)], 'nopat': row(PF, 113), 'da': row(PF, 114), 'capex': [-x for x in row(PF, 115)],
    'nwc': row(PF, 116), 'fcf': row(PF, 117), 'df': row(PF, 119), 'pv': row(PF, 120), 'margin': row(PF, 41), 'growth': row(PF, 28), 'ebitda': row(PF, 71), 'balanceCheck': row(PF, 97),
    'pvFcf': f(PF, 'B134'), 'tvG': f(PF, 'B129'), 'pvTvG': f(PF, 'B131'), 'evG': f(PF, 'B136'), 'tvM': f(PF, 'B236'), 'pvTvM': f(PF, 'B237'), 'evM': f(PF, 'B238'),
    'evW': f(PF, 'B245'), 'priceG': f(PF, 'B150'), 'priceM': f(PF, 'B240'), 'priceW': f(PF, 'B246'), 'evCap': f(PF, 'B256'), 'ev2': f(PF, 'B258'), 'eq2': f(PF, 'B262'),
    'eqVal': f(PF, 'B263'), 'price': f(PF, 'B265'), 'upside': f(PF, 'B267'), 'recommendation': f(PF, 'B268'), 'wacc': f(PF, 'B126'), 'ke': f(PF, 'B221'),
    'betaIter': f(PF, 'E219'), 'deIter': f(PF, 'D219'), 'kdAT': f(PF, 'B208'), 'impliedG': f(PF, 'B242'), 'impliedMultiple': f(PF, 'B241'), 'tvWeightGordon': f(PF, 'B137'),
    'tvBlend': f(VA, 'B12'), 'tvWeight': f(VA, 'B13'), 'iterations': [[f(PF, f'{c}{r}') for c in 'BCDEFG'] for r in range(214, 220)], 'lastIterBp': f(PF, 'B222'),
    'waccMarket': f(WA, 'B33'), 'keMarket': f(WA, 'B29'), 'betaMarket': f(WA, 'B28'), 'deMarket': f(WA, 'B23'), 'betaU': f(WA, 'B9'),
    'consensusDiff': f(PF, 'B270'),
}
E['sensitivity'] = {'waccs': [f(PF, f'A{r}') for r in range(163, 168)], 'gs': row(PF, 162, 'BCDEF'), 'grid': [row(PF, r, 'BCDEF') for r in range(163, 168)]}
sc_cols = {'conservador': 'B', 'base': 'C', 'optimista': 'D'}
labels = {22: 'inflation', 23: 'salesCagr', 24: 'marginAvg', 25: 'betaIter', 26: 'rf', 27: 'ke', 28: 'wacc', 29: 'g', 30: 'fcf2030', 31: 'pvFcf', 32: 'tvG', 33: 'tvBlend',
          34: 'ev', 35: 'equity', 36: 'price', 37: 'market', 38: 'diff', 39: 'diffPct', 40: 'recommendation'}
E['scenarios'] = {k: {name: f(ESC, f'{c}{r}') for r, name in labels.items()} for k, c in sc_cols.items()}
for k, c in sc_cols.items():
    E['scenarios'][k].update({'betaLevered': f(ESC, f'{c}10'), 'betaU': f(ESC, f'{c}16'), 'rfScenario': f(ESC, f'{c}13'), 'rfShift': f(ESC, f'{c}14'), 'realRate': f(ESC, f'{c}12')})
E['tornado'] = [{'label': v(ESC, f'A{r}'), 'low': f(ESC, f'B{r}'), 'high': f(ESC, f'C{r}'), 'priceLow': f(ESC, f'D{r}'), 'priceHigh': f(ESC, f'E{r}'), 'range': f(ESC, f'H{r}')} for r in range(49, 54)]
E['tornadoOrder'] = [v(ESC, f'A{r}') for r in range(59, 64)]
E['sensCharts'] = {'inflation': [[f(ESC, f'T{r}'), f(ESC, f'U{r}')] for r in range(30, 33)], 'betaKe': [[f(ESC, f'T{r}'), f(ESC, f'U{r}')] for r in range(36, 44)],
                   'gEv': [[f(ESC, f'T{r}'), f(ESC, f'U{r}')] for r in range(47, 52)]}
E['combined'] = {'value': f(VC, 'B9'), 'diff': f(VC, 'B11'), 'upside': f(VC, 'B12'), 'classRule': f(VC, 'B14'),
                 'ranges': {k: [f(VC, f'{c}{r}') for c in 'BCD'] for k, r in (('dcf', 18), ('comps', 19), ('transactions', 20))}}
E['comps'] = {'value': f(MU, 'D73'), 'p25': f(MU, 'D74'), 'p75': f(MU, 'D75'), 'adjustment': f(MU, 'B30'),
              'stats': {k: [f(MU, f'{c}{r}') for r in range(58, 65)] for c, k in zip('BCDE', ['evSales', 'evEbitda', 'evEbit', 'pe'])},
              'prices': {k: [f(MU, f'{c}{r}') for r in range(58, 64)] for c, k in zip('GHIJ', ['evSales', 'evEbitda', 'evEbit', 'pe'])}}
E['transactions'] = {'value': f(TR, 'E49'), 'lo': f(TR, 'E50'), 'hi': f(TR, 'F50'), 'windowStart': v(TR, 'C6'),
                     'stats': {k: [f(TR, f'{c}{r}') for r in range(28, 35)] for c, k in zip('BC', ['evSales', 'evEbitda'])},
                     'prices': {k: [f(TR, f'{c}{r}') for r in range(28, 34)] for c, k in zip('DE', ['evSales', 'evEbitda'])}}
E['inflation'] = {'models': [{'label': v(INF, f'A{r}'), 'n': f(INF, f'B{r}'), 'm': f(INF, f'C{r}'), 'b': f(INF, f'D{r}'), 'r2': f(INF, f'E{r}'), 'x': f(INF, f'F{r}'),
                              'lin': f(INF, f'G{r}'), 'a': f(INF, f'H{r}'), 'k': f(INF, f'I{r}'), 'r2exp': f(INF, f'J{r}'), 'exp': f(INF, f'K{r}')} for r in range(12, 16)],
                  'scenarios': {'conservador': f(INF, 'B20'), 'base': f(INF, 'B21'), 'optimista': f(INF, 'B22')},
                  'monthsValid': f(INF, 'B28'), 'correl': [[v(INF, f'A{r}'), f(INF, f'B{r}'), f(INF, f'C{r}')] for r in range(30, 35)],
                  'priceRegression': [{'model': v(INF, f'A{r}'), 'n': f(INF, f'B{r}'), 'a': f(INF, f'C{r}'), 'b': f(INF, f'D{r}'), 'r2': f(INF, f'E{r}'), 'atBase': f(INF, f'F{r}')} for r in (38, 39)],
                  'moves': [[v(INF, f'A{r}'), v(INF, f'B{r}'), f(INF, f'C{r}'), f(INF, f'D{r}'), f(INF, f'E{r}')] for r in range(43, 49)],
                  'avgReturnUp': [f(INF, 'B49'), f(INF, 'C49')], 'avgReturnDown': [f(INF, 'B50'), f(INF, 'C50')],
                  'longWindow': [f(INF, 'B8'), f(INF, 'C8')]}
E['prices'] = {'models': {k: {n: f(PI, f'{c}{r}') for n, c in zip(['n', 'm', 'b', 'r2', 'x', 'lin', 'a', 'k', 'r2exp', 'exp', 'growth', 'exp52'], 'BCDEFGHIJKLM')} for k, r in (('soriana', 6), ('ipc', 7))},
               'returns': {k: {n: f(PI, f'{c}{r}') for n, r in zip(['n', 'mean', 'annual', 'vol', 'volAnnual', 'cumulative'], range(12, 18))} for k, c in (('soriana', 'B'), ('ipc', 'C'))},
               'correl': f(PI, 'B18')}
E['beta'] = {'n': f(BR, 'B7'), 'r': f(BR, 'B13'), 'r2': f(BR, 'B14'), 'r2adj': f(BR, 'B15'), 'steyx': f(BR, 'B16'), 'ssReg': f(BR, 'C21'), 'ssRes': f(BR, 'C22'), 'ssTot': f(BR, 'C23'),
             'F': f(BR, 'E21'), 'pF': f(BR, 'F21'), 'alpha': f(BR, 'B26'), 'alphaSE': f(BR, 'C26'), 'alphaT': f(BR, 'D26'), 'alphaP': f(BR, 'E26'),
             'beta': f(BR, 'B27'), 'se': f(BR, 'C27'), 't': f(BR, 'D27'), 'p': f(BR, 'E27'), 'lo': f(BR, 'F27'), 'hi': f(BR, 'G27'), 'de': f(BR, 'B39'), 'tax': f(BR, 'B38'), 'betaU': f(BR, 'B40')}
E['growth'] = {'calcs': {k: f(CP, f'B{r}') for k, r in dict(cagr=18, inflAvg=19, realHist=20, nominalLT=21, growth2030=22, reinvest=23, reinvestRate=24, roic=25, sustainable=26, impliedG=27).items()},
               'realImplied': {k: f(CP, f'C{r}') for k, r in (('conservador', 31), ('base', 32), ('optimista', 33))},
               'controls': [[v(CP, f'A{r}'), f(CP, f'B{r}'), f(CP, f'C{r}'), v(CP, f'D{r}')] for r in range(37, 42)]}
E['validation'] = {'checks': [[v(VA, f'A{r}'), f(VA, f'B{r}'), f(VA, f'C{r}'), f(VA, f'D{r}'), v(VA, f'E{r}')] for r in range(67, 82)], 'summary': v(VA, 'B83'),
                   'texts': {k: v(VA, f'A{r}') for k, r in dict(summary=17, sens1=46, sens2=47).items()},
                   'reasons': [v(VA, f'A{r}') for r in range(50, 55)], 'limits': [v(VA, f'A{r}') for r in range(57, 64)],
                   'assumptions': [[v(VA, f'A{r}'), f(VA, f'B{r}'), v(VA, f'C{r}')] for r in range(21, 37)]}
E['conclusions'] = [[v(CO, f'A{r}'), v(CO, f'A{r+1}')] for r in (4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34)]
E['wacc'] = {k: f(WA, f'B{r}') for k, r in dict(rf=5, prm=8, betaU=9, tax=10, price=13, shares=17, equity=18, debt=21, cash=22, de=23, wD=24, wE=25, betaL=28, ke=29, interest=30, kd=31, kdAT=32, wacc=33).items()}
E['waccTexts'] = [v(WA, f'A{r}') for r in range(37, 50)]

data = {'file': os.path.basename(SRC), 'company': company, 'market': market, 'statements': statements, 'ratios': ratios, 'build': build, 'base2025': base2025, 'wacc': wacc,
        'valuation': valuation, 'inflation': inflation, 'prices': prices, 'growth': growth, 'scenarios': scenarios, 'comps': comps, 'transactions': transactions,
        'combined': combined, 'expected': E}
with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('// ARCHIVO GENERADO por scripts/build-dataset.py a partir de SORIANA_FINAL.xlsx. No editar a mano.\n')
    fh.write('// Series crudas y supuestos con precisión completa; "expected" guarda los resultados del Excel para validar la app.\n')
    fh.write('export const SORIANA_FINAL = ' + json.dumps(data, ensure_ascii=False, indent=1, allow_nan=False) + ';\n')
print('OK', OUT, 'precio', E['dcf']['price'], 'semanas', len(weekly), 'quincenas', len(infl_series), 'comprobaciones', E['validation']['summary'])
