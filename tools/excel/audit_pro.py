"""Genera el Excel PRO AUDITADO a partir del Excel PRO DEFINITIVO original (que no se modifica).

Uso:  python3 -I tools/excel/audit_pro.py <EXCEL FINAL PRO DEFINITIVO SORIANA.xlsx> <sdc_grid.json> <salida.xlsx>

<sdc_grid.json> es la transcripción campo por campo de la pantalla LSEG/SDC "GridExport_October_19_2026_9_29_57.pdf"
(166 operaciones; columnas con su nombre exacto de origen). La pantalla no se incluye en el repositorio (licencia);
el Excel auditado conserva solo el extracto de las operaciones evaluadas, con atribución.

Cambios (registro completo en la hoja "Auditoría" del libro de salida):
  1. 'Transacciones SDC' se reconstruye: datos tal como la pantalla (Rank Value y EV al anuncio por separado, USD mm,
     equivalente MXN informativo), criterios con fórmulas, juicio del analista separado, estadísticos sin FILTER
     (compatibles con Excel 2010+ y LibreOffice), atípicos por RIC, sensibilidades y precio implícito.
  2. Se corrige la identidad de la operación 4172416040 (Chengdu Hongqi Chain, no "Chongqing Department Store").
  3. Se agregan 4 operaciones de autoservicio de la pantalla que no estaban evaluadas (todas quedan excluidas con motivo).
  4. 'Valuación Combinada': Precedent Transactions de referencia = mediana SDC (peso 0%); CIQ queda como histórico.
  5. 'Proyección Final Soriana': tabla de sensibilidad del PRECIO OBJETIVO FINAL (WACC × g, Ke fijo), además de la
     tabla existente (que mide el precio Gordon al cierre de 2025).
  6. 'Validación': controles nuevos para SDC, la combinada y la nueva sensibilidad; se rotulan los controles de regresión.
  7. 'Fuentes': registro de LSEG/SDC, del reporte comparativo y del tipo de cambio; corrección de la referencia C6:C8.
  8. Hojas nuevas 'Contraste externo' (S&P Capital IQ / LSEG Refinitiv) y 'Auditoría' (hallazgos y cambios).
"""
import sys, json, datetime as dt, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.comments import Comment

SRC, GRID, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
wb = openpyxl.load_workbook(SRC)

H1 = Font(bold=True, size=14, color='00276F'); H2 = Font(bold=True, size=11, color='FFFFFF'); B = Font(bold=True)
NOTE = Font(italic=True, size=9, color='5D5D60')
FILL_H = PatternFill('solid', fgColor='0039A6'); FILL_IN = PatternFill('solid', fgColor='FFF2CC')
FILL_LINK = PatternFill('solid', fgColor='E2EFDA'); FILL_OUT = PatternFill('solid', fgColor='D8E3F8')
FILL_J = PatternFill('solid', fgColor='FCE4D6')   # naranja = juicio del analista
FILL_HDR = PatternFill('solid', fgColor='EEF3FC')
WRAP = Alignment(wrap_text=True, vertical='top')
PCT, X2, NUM1, NUM2, MXN = '0.00%', '0.00"x"', '#,##0.0', '#,##0.00', '"$"#,##0.00'
DATE = 'dd-mmm-yyyy'


def put(ws, ref, v, fmt=None, fill=None, bold=False, font=None, wrap=False):
    c = ws[ref]; c.value = v
    if fmt: c.number_format = fmt
    if fill: c.fill = fill
    if bold: c.font = B
    if font: c.font = font
    if wrap: c.alignment = WRAP
    return c


def section(ws, r, text, ncols):
    for c in range(1, ncols + 1): ws.cell(r, c).fill = FILL_H
    ws.cell(r, 1, text).font = H2


def hdr(ws, r, labels, c0=1):
    for i, l in enumerate(labels):
        cell = ws.cell(r, c0 + i, l); cell.font = B; cell.alignment = WRAP; cell.fill = FILL_HDR


def col(i):  # 1 -> A
    s = ''
    while i: i, r = divmod(i - 1, 26); s = chr(65 + r) + s
    return s


# =====================================================================================================
# 1. TRANSACCIONES SDC (se reconstruye)
# =====================================================================================================
grid = {str(r['M&A SDC Deal Number']).strip(): r for r in json.load(open(GRID, encoding='utf-8'))['rows']}
N_GRID = len(grid)

# Juicio del analista por operación (el resto de los campos sale de la pantalla).
#  sector: el objetivo opera autoservicio/supermercados/mayoreo de alimentos (Sí/No)
#  tipo: naturaleza de la operación según el anuncio  ·  juicio: Elegible / No elegible  ·  motivo
J = [
    ('4144889040', 'Sí', 'Control (OPA)', 'Elegible', 'OPA por el control de Éxito (hiper y supermercados); vendedor grupo Casino. Comprador: Cama Commercial Group (vehículo de Grupo Calleja / Super Selectos). SDC clasifica al objetivo como "Discount and Department Store Retailing". Misma operación que la muestra CIQ.', ''),
    ('4150545040', 'Sí', 'Control (100%)', 'Elegible', 'Compra del 100% de la cadena de supermercados Profi (Rumania). Múltiplo alto por crecimiento y sinergias: atípico estadístico (ver sección 3).', ''),
    ('4191742040', 'Sí', 'Estratégica (control conjunto 50%)', 'Elegible', 'OPA de KDDI; control conjunto 50/50 con Mitsubishi. Tiendas de conveniencia (formato de proximidad): comparabilidad con reserva.', ''),
    ('4234985040', 'Sí', 'Control (OPA)', 'Elegible', 'OPA de H2O Retailing para consolidar el control del supermercado.', ''),
    ('4291087040', 'Sí', 'Estratégica (~29%)', 'Elegible', 'Compra de ~29% por Guangdong Juncai (filial de Miniso); queda como mayor accionista. Participación estratégica relevante, no control pleno.', ''),
    ('4338758040', 'Sí', 'Control (empresa en dificultad)', 'Elegible', 'Compra de control a Alibaba con descuento (prima 1 día −44.4%): operación en dificultad; se conserva y se cuantifica su efecto en la sección 4.', ''),
    ('4353024040', 'Sí', 'Control (oferta y exclusión de bolsa)', 'Elegible', 'Oferta de EP Global Commerce (prima 1 día +38.8%). Mayoreo de alimentos (cash & carry), comparable con City Club.', ''),
    ('4340542040', 'Sí', 'Control (vendedor KKR/Walmart)', 'Elegible', 'Compra de control por Trial Holdings. Sin EV/EBITDA: solo aporta EV/Ventas (no usado en el precio). P/E 3.88x distorsionado.', ''),
    ('4172416040', 'Sí', 'Cambio de control (inversionista estatal)', 'Elegible', 'CORRECCIÓN: el objetivo es Chengdu Hongqi Chain (cadena de conveniencia y supermercados de Sichuan), no "Chongqing Department Store". Sichuan Shangtou Investment pasa a ser el accionista de control. La pantalla no reporta el % adquirido: decisión del analista con base en el anuncio.', 'Corregido'),
    ('4163818040', 'Sí', 'Recompra propia', 'No elegible', 'Recompra propia: no hay cambio de control.', ''),
    ('4220226040', 'Sí', 'Recompra propia', 'No elegible', 'Recompra propia: no hay cambio de control.', ''),
    ('4382315040', 'Sí', 'Recompra propia', 'No elegible', 'Recompra propia: no hay cambio de control.', ''),
    ('4488172040', 'Sí', 'Recompra propia', 'No elegible', 'Recompra propia: no hay cambio de control.', ''),
    ('4343070040', 'Sí', 'Recompra propia', 'No elegible', 'Recompra propia de YAOKO (supermercados, Japón): no hay cambio de control.', 'Agregada'),
    ('4143788040', 'Sí', 'Recompra propia', 'No elegible', 'Recompra propia en un mercado con sanciones (Rusia).', ''),
    ('4391691040', 'Sí', 'Control (Rusia)', 'No elegible', 'Rusia: valuaciones distorsionadas por sanciones; además sin EV/EBITDA.', ''),
    ('4228856040', 'Sí', 'Reestructura por insolvencia', 'No elegible', 'Better Life Commercial Chain (Bubugao, supermercados de Hunan) en reestructura judicial: EV/EBITDA 46.0x y EV/Ventas 5.6x no representan una adquisición en marcha.', 'Agregada'),
    ('4292215040', 'Sí', 'Reorganización intragrupo', 'No elegible', 'Wincommerce (WinMart, Vietnam) adquirida por otra empresa del grupo Masan: reorganización intragrupo; EV/EBITDA 323.1x por EBITDA cercano a cero.', 'Agregada'),
    ('4467353040', 'Sí', 'Control (fondo)', 'No elegible', 'Prosol (Grand Frais, alimentos frescos) adquirida por Apollo. Sin EV/EBITDA y EV/Ventas 44.5x incongruente con un minorista de alimentos: dato no confiable.', 'Agregada'),
    ('4069894040', 'Sí', 'Control', 'Elegible', 'Fuera de la ventana de 3 años.', ''),
    ('4069904040', 'Sí', 'Control (reestructura de deuda)', 'Elegible', 'Fuera de la ventana; reestructura de deuda.', ''),
    ('4115751040', 'Sí', 'Control', 'Elegible', 'Fuera de la ventana; EBITDA deprimido (46.8x).', ''),
    ('4364904040', 'Sí', 'Control', 'Elegible', 'Solo 1 múltiplo disponible.', ''),
]
assert len({d[0] for d in J}) == len(J)
for d in J: assert d[0] in grid, d[0]

old = wb['Transacciones SDC']; pos = wb.sheetnames.index('Transacciones SDC'); wb.remove(old)
ws = wb.create_sheet('Transacciones SDC', pos)
NC = 33
ws['A1'] = 'VALUACIÓN POR TRANSACCIONES PRECEDENTES — muestra LSEG/SDC (pantalla del 19-oct-2026) · versión auditada'; ws['A1'].font = H1
ws['A2'] = ('Fuente: LSEG/SDC (Refinitiv), "GridExport_October_19_2026_9_29_57.pdf", Current Screen Template del 19-oct-2026 09:29:57, '
            f'{N_GRID} operaciones, 23 columnas. Montos en USD mm tal como la pantalla; múltiplos en veces (x); precios en MXN por acción.')
ws['A2'].font = NOTE
ws['A3'] = ('Colores: amarillo = dato copiado de la pantalla (nombre de columna de origen en el encabezado) · naranja = juicio del analista · '
            'blanco = fórmula · azul = resultado. "NA" = dato no disponible en la fuente (nunca se trata como cero).')
ws['A3'].font = NOTE

section(ws, 5, '1. PARÁMETROS Y PROCEDIMIENTO DE SELECCIÓN (metodología S&P, art. 000045604, p. 9)', 12)
P = {}
rows = [
    ('Fecha de valuación (fin de la ventana)', "='Proyección Final Soriana'!B252", DATE, 'fval'),
    ('Ventana (años)', '=Transacciones!C5', '0', 'win'),
    ('Inicio de la ventana', '=Transacciones!C6', DATE, 'wstart'),
    ('Mínimo de múltiplos de valor por operación', '=Transacciones!C8', '0', 'minm'),
    ('Tipo de cambio de referencia (MXN por USD)', 18.48, '0.00', 'fx'),
    ('Fecha y fuente del tipo de cambio', 'Implícito en S&P Capital IQ: capitalización 59,580 mdp / 3,223.7 USD mm al cierre del 7-oct-2026 (reporte comparativo, p. 1 y 25). Equivalente MXN solo informativo: los múltiplos no requieren conversión.', None, 'fxsrc'),
]
r = 6
for lab, v, fmt, k in rows:
    ws.cell(r, 1, lab); c = ws.cell(r, 3, v)
    if fmt: c.number_format = fmt
    c.fill = FILL_IN if k in ('fx', 'fxsrc') else FILL_LINK
    if k == 'fxsrc': c.alignment = Alignment(wrap_text=False)
    P[k] = f'$C${r}'; r += 1
# Embudo de selección
r += 1
hdr(ws, r, ['Paso', '', 'Criterio', '', '', '', '', 'Resultado con la base SDC'])
steps = [
    ('Búsqueda inicial', 'M&A de los últimos 3 años, autoservicio en México', '0 operaciones con múltiplos: solo FEMSA como comprador (Delek, objetivo en EE.UU.) y Nutrisa, sin múltiplos.'),
    ('Primera ampliación', 'Subir un nivel en la industria (Retail: Food & Beverage + Discount and Department Store)', 'Sigue sin operaciones mexicanas con múltiplos.'),
    ('Segunda ampliación', 'Eliminar el filtro geográfico → pantalla global', f'{N_GRID} operaciones en la pantalla (Retail: Food & Beverage Retailing 130, Discount and Department Store Retailing 34, Food & Beverage 2). La subindustria de SDC mezcla restaurantes, servicios de alimentos y departamentales.'),
    ('Filtro del analista', 'Objetivo que opera autoservicio, supermercados o mayoreo de alimentos', f'{len(J)} operaciones evaluadas abajo (19 de la versión original + 4 agregadas en la auditoría).'),
    ('Criterios objetivos', 'Ventana de 3 años, ≥ 2 múltiplos, no recompra propia', 'Columnas X–Z (fórmulas).'),
    ('Juicio del analista', 'Adquisición real con control o participación estratégica relevante; calidad del dato; sin sanciones ni reestructura judicial', 'Columna AA (naranja) y motivo.'),
]
for i, (a, b, c_) in enumerate(steps):
    rr = r + 1 + i; ws.cell(rr, 1, a).font = B; ws.cell(rr, 3, b); ws.cell(rr, 8, c_)
r = r + 1 + len(steps) + 1

section(ws, r, '2. OPERACIONES EVALUADAS: DATOS DE LA PANTALLA LSEG/SDC Y CRITERIOS', NC)
r += 1
HEAD = ['M&A SDC Deal Number', 'Date Announced', 'Target Full Name', 'Target Nation', 'Target Mid Industry', 'Target Public Status',
        'Acquiror Full Name', 'Acquiror Nation', 'Deal Status',
        'Rank Value inc. Net Debt of Target (USD mm) — valor de la operación', 'Enterprise Value at Announcement (USD mm)',
        'Valor de la operación (MXN mm, informativo)', 'EV al anuncio (MXN mm, informativo)',
        'Ratio of EV to EBITDA (x)', 'Ratio of Offer Price to EPS (x)', 'Ratio of EV to Sales (x)',
        'Premium Paid 1 Day Prior (%)', 'Premium Paid 4 Weeks Prior (%)', 'Target Net Sales LTM (USD mm)',
        '# múltiplos disponibles', '¿Ventana?', '¿≥ 2 múltiplos?',
        'Autoservicio / alimentos (juicio)', '¿Recompra propia?', '¿Dentro de la ventana y ≥ 2 múlt.?',
        'Naturaleza de la operación (juicio)', 'Juicio del analista', 'Incluir (1/0)', 'Motivo / observaciones', 'Cambio en la auditoría',
        'EV/EBITDA elegible', 'EV/Ventas elegible', 'P/E elegible']
hdr(ws, r, HEAD)
ws.row_dimensions[r].height = 60
HR = r
D0 = r + 1


def num(x):
    if x in (None, '', 'NA'): return 'NA'
    return float(str(x).replace(',', ''))


for i, (did, sector, tipo, juicio, motivo, cambio) in enumerate(J):
    g = grid[did]; rr = D0 + i
    d = dt.datetime.strptime(g['Date Announced'], '%d/%m/%Y')
    vals = [int(did), d, g['Target Full Name'], g['Target Nation'], g['Target Mid Industry'], g['Target Public Status'],
            g['Acquiror Full Name'], g['Acquiror Nation'], g['Deal Status'],
            num(g['Rank Value inc. Net Debt of Target (USD, Millions)']), num(g["Enterprise Value at Announcement (USD, Millions, '|')"])]
    for j, v in enumerate(vals):
        c = ws.cell(rr, 1 + j, v); c.fill = FILL_IN
        if j == 1: c.number_format = DATE
        if j in (9, 10) and v != 'NA': c.number_format = NUM2
    J_, K_ = f'J{rr}', f'K{rr}'
    ws.cell(rr, 12, f'=IF(ISNUMBER({J_}),{J_}*{P["fx"]},"NA")').number_format = NUM1
    ws.cell(rr, 13, f'=IF(ISNUMBER({K_}),{K_}*{P["fx"]},"NA")').number_format = NUM1
    for j, k in enumerate(['Ratio of Enterprise Value to EBITDA', 'Ratio of Offer Price to Earnings per Share', 'Ratio of Enterprise Value to Sales',
                           'Premium Paid - 1 Day Prior to Announcement', 'Premium Paid - 4 Weeks Prior to Announcement', 'Target Net Sales Last 12 Months (USD, Millions)']):
        v = num(g[k]); c = ws.cell(rr, 14 + j, v); c.fill = FILL_IN
        if v != 'NA': c.number_format = X2 if j < 3 else (NUM2 if j < 5 else NUM2)
    ws.cell(rr, 20, f'=COUNT(N{rr}:P{rr})')
    ws.cell(rr, 21, f'=IF(AND(B{rr}>={P["wstart"]},B{rr}<={P["fval"]}),"Sí","No")')
    ws.cell(rr, 22, f'=IF(T{rr}>={P["minm"]},"Sí","No")')
    c = ws.cell(rr, 23, sector); c.fill = FILL_J
    ws.cell(rr, 24, f'=IF(UPPER(TRIM(C{rr}))=UPPER(TRIM(G{rr})),"Sí","No")')
    ws.cell(rr, 25, f'=IF(AND(U{rr}="Sí",V{rr}="Sí"),"Sí","No")')
    c = ws.cell(rr, 26, tipo); c.fill = FILL_J
    c = ws.cell(rr, 27, juicio); c.fill = FILL_J
    ws.cell(rr, 28, f'=IF(AND(U{rr}="Sí",V{rr}="Sí",W{rr}="Sí",X{rr}="No",AA{rr}="Elegible"),1,0)').font = B
    c = ws.cell(rr, 29, motivo); c.fill = FILL_J
    ws.cell(rr, 30, cambio)
    ws.cell(rr, 31, f'=IF(AND(AB{rr}=1,ISNUMBER(N{rr})),N{rr},"")').number_format = X2
    ws.cell(rr, 32, f'=IF(AND(AB{rr}=1,ISNUMBER(P{rr})),P{rr},"")').number_format = X2
    ws.cell(rr, 33, f'=IF(AND(AB{rr}=1,ISNUMBER(O{rr})),O{rr},"")').number_format = X2
D1 = D0 + len(J) - 1
rng = lambda c: f'${c}${D0}:${c}${D1}'
EB, ES, EP = rng('AE'), rng('AF'), rng('AG')
r = D1 + 1
ws.cell(r, 1, f'=COUNTIF({rng("AB")},1)&" de "&COUNTA({rng("A")})&" operaciones evaluadas cumplen todos los criterios"').font = NOTE
r += 2

# ---------------------------------------------------------------- 3. Estadísticos
section(ws, r, '3. ESTADÍSTICOS (operaciones con Incluir = 1; NA excluido) Y PRECIO IMPLÍCITO — mismo puente EV → capital que Trading Comps', 12)
r += 1
hdr(ws, r, ['Estadístico', '', 'EV/EBITDA (x)', 'EV/Ventas (x)', 'P/E (x)', 'Precio implícito EV/EBITDA (MXN)', 'Potencial vs. mercado', 'Precio implícito EV/Ventas (MXN, referencia)'])
r += 1
S = {}
price = lambda m: f'=IF(ISNUMBER({m}),IF({m}*Multiplos!$B$21+Multiplos!$B$30>0,({m}*Multiplos!$B$21+Multiplos!$B$30)/Multiplos!$B$23,"NM"),"NA")'
priceS = lambda m: f'=IF(ISNUMBER({m}),IF({m}*Multiplos!$B$18+Multiplos!$B$30>0,({m}*Multiplos!$B$18+Multiplos!$B$30)/Multiplos!$B$23,"NM"),"NA")'
stats = [('min', 'Mínimo', 'MIN({})'), ('p25', 'Percentil 25', 'PERCENTILE({},0.25)'), ('mean', 'Media', 'AVERAGE({})'), ('median', 'Mediana', 'MEDIAN({})'),
         ('p75', 'Percentil 75', 'PERCENTILE({},0.75)'), ('max', 'Máximo', 'MAX({})')]
for k, lab, fx in stats:
    ws.cell(r, 1, lab)
    for j, R_ in enumerate([EB, ES, EP]):
        ws.cell(r, 3 + j, f'=IF(COUNT({R_})>0,{fx.format(R_)},"NA")').number_format = X2
    ws.cell(r, 6, price(f'C{r}')).number_format = MXN
    ws.cell(r, 7, f'=IFERROR(F{r}/\'Valuación Combinada\'!$B$10-1,"NM")').number_format = PCT
    ws.cell(r, 8, priceS(f'D{r}')).number_format = MXN
    S[k] = r; r += 1
ws.cell(r, 1, 'n (observaciones)')
for j, R_ in enumerate([EB, ES, EP]): ws.cell(r, 3 + j, f'=COUNT({R_})')
S['n'] = r; r += 1
ws.cell(r, 1, 'Límite inferior de atípicos (P25 − 1.5 × RIC)')
for j in range(3): cc = col(3 + j); ws.cell(r, 3 + j, f'=IF(ISNUMBER({cc}{S["p25"]}),{cc}{S["p25"]}-1.5*({cc}{S["p75"]}-{cc}{S["p25"]}),"NA")').number_format = X2
S['lo'] = r; r += 1
ws.cell(r, 1, 'Límite superior de atípicos (P75 + 1.5 × RIC)')
for j in range(3): cc = col(3 + j); ws.cell(r, 3 + j, f'=IF(ISNUMBER({cc}{S["p75"]}),{cc}{S["p75"]}+1.5*({cc}{S["p75"]}-{cc}{S["p25"]}),"NA")').number_format = X2
S['hi'] = r; r += 1
ws.cell(r, 1, 'Atípicos detectados (n)')
for j, R_ in enumerate([EB, ES, EP]):
    cc = col(3 + j); ws.cell(r, 3 + j, f'=IF(ISNUMBER({cc}{S["hi"]}),COUNTIF({R_},">"&{cc}{S["hi"]})+COUNTIF({R_},"<"&{cc}{S["lo"]}),0)')
S['nout'] = r; r += 1
ws.cell(r, 1, 'Media sin atípicos')
for j, R_ in enumerate([EB, ES, EP]):
    cc = col(3 + j); ws.cell(r, 3 + j, f'=IF(ISNUMBER({cc}{S["hi"]}),AVERAGEIFS({R_},{R_},"<="&{cc}{S["hi"]},{R_},">="&{cc}{S["lo"]}),"NA")').number_format = X2
ws.cell(r, 6, price(f'C{r}')).number_format = MXN
ws.cell(r, 7, f'=IFERROR(F{r}/\'Valuación Combinada\'!$B$10-1,"NM")').number_format = PCT
ws.cell(r, 8, priceS(f'D{r}')).number_format = MXN
S['meanx'] = r; r += 1
ws.cell(r, 1, 'Mediana sin atípicos')
for j, R_ in enumerate([EB, ES, EP]):
    cc = col(3 + j)
    # Mediana sin atípicos sin fórmulas de matriz: columna auxiliar AH:AJ (abajo).
    ws.cell(r, 3 + j, f'=IF(COUNT(${col(34 + j)}${D0}:${col(34 + j)}${D1})>0,MEDIAN(${col(34 + j)}${D0}:${col(34 + j)}${D1}),"NA")').number_format = X2
ws.cell(r, 6, price(f'C{r}')).number_format = MXN
ws.cell(r, 7, f'=IFERROR(F{r}/\'Valuación Combinada\'!$B$10-1,"NM")').number_format = PCT
S['medx'] = r; r += 1
for j, (srcc, nm) in enumerate([('AE', 'EV/EBITDA sin atípicos'), ('AF', 'EV/Ventas sin atípicos'), ('AG', 'P/E sin atípicos')]):
    cc = col(34 + j); ws.cell(HR, 34 + j, nm).font = B; ws.cell(HR, 34 + j).fill = FILL_HDR; ws.cell(HR, 34 + j).alignment = WRAP
    for rr in range(D0, D1 + 1):
        ws.cell(rr, 34 + j, f'=IF(ISNUMBER({srcc}{rr}),IF(AND({srcc}{rr}<={col(3 + j)}${S["hi"]},{srcc}{rr}>={col(3 + j)}${S["lo"]}),{srcc}{rr},""),"")').number_format = X2
ws.cell(r, 1, 'P/E: no se usa en el precio (pocas observaciones y utilidades distorsionadas en operaciones de control); se muestra para trazabilidad.').font = NOTE
r += 1
ws.cell(r, 1, 'EV/Ventas: excluido del precio por el mismo criterio que Trading Comps (ignora el margen). Se muestra como referencia.').font = NOTE
r += 2

# ---------------------------------------------------------------- 4. Sensibilidad de la muestra
section(ws, r, '4. SENSIBILIDAD DE LA MUESTRA (efecto de las operaciones que requieren juicio) — EV/EBITDA', 12)
r += 1
hdr(ws, r, ['Caso', '', 'n', 'Mediana (x)', 'Precio implícito mediana (MXN)', 'Media sin atípicos (x)', 'Precio implícito media sin atípicos (MXN)', 'Operaciones retiradas'])
r += 1
SENS = [
    ('Muestra auditada (oficial)', []),
    ('Sin Sun Art (empresa en dificultad)', ['4338758040']),
    ('Sin participaciones no de control (Lawson 50%, Yonghui ~29%)', ['4191742040', '4291087040']),
    ('Sin Chengdu Hongqi (control no verificable en la pantalla)', ['4172416040']),
    ('Versión original del libro (sin Hongqi; Chongqing excluido)', ['4172416040']),
]
for k, (lab, drop) in enumerate(SENS[:4]):
    cc = col(37 + k)
    ws.cell(HR, 37 + k, 'Sens.: ' + lab).font = B; ws.cell(HR, 37 + k).fill = FILL_HDR; ws.cell(HR, 37 + k).alignment = WRAP
    for rr in range(D0, D1 + 1):
        did = J[rr - D0][0]
        ws.cell(rr, 37 + k, '=""' if did in drop else f'=AE{rr}').number_format = X2
    R_ = f'${cc}${D0}:${cc}${D1}'
    ws.cell(r, 1, lab)
    ws.cell(r, 3, f'=COUNT({R_})')
    ws.cell(r, 4, f'=MEDIAN({R_})').number_format = X2
    ws.cell(r, 5, price(f'D{r}')).number_format = MXN
    hi = f'(PERCENTILE({R_},0.75)+1.5*(PERCENTILE({R_},0.75)-PERCENTILE({R_},0.25)))'
    lo = f'(PERCENTILE({R_},0.25)-1.5*(PERCENTILE({R_},0.75)-PERCENTILE({R_},0.25)))'
    ws.cell(r, 6, f'=AVERAGEIFS({R_},{R_},"<="&{hi},{R_},">="&{lo})').number_format = X2
    ws.cell(r, 7, price(f'F{r}')).number_format = MXN
    ws.cell(r, 8, ', '.join(grid[x]['Target Full Name'] for x in drop) or '—')
    if k == 0: S['sens0'] = r
    r += 1
ws.cell(r, 1, 'Versión original del libro PRO (EV/EBITDA, n = 7, sin Hongqi)'); ws.cell(r, 3, 7); ws.cell(r, 4, 5.11).number_format = X2
ws.cell(r, 5, price(f'D{r}')).number_format = MXN; ws.cell(r, 6, 5.99).number_format = X2; ws.cell(r, 7, price(f'F{r}')).number_format = MXN
ws.cell(r, 8, 'Valores registrados del libro original (mediana 5.11x → $24.17; media sin atípicos 5.99x → $29.95)')
for c_ in (4, 6): ws.cell(r, c_).fill = FILL_IN
r += 2

# ---------------------------------------------------------------- 5. Conclusión
section(ws, r, '5. VALOR DE PRECEDENT TRANSACTIONS (referencia) Y PESO EN LA VALUACIÓN COMBINADA', 12)
r += 1
concl = [
    ('Estadístico oficial', 'Mediana de EV/EBITDA', None),
    ('PRECEDENT TRANSACTIONS — precio de referencia (MXN por acción)', f'=F{S["median"]}', MXN),
    ('Rango (P25 – P75 de EV/EBITDA) — bajo', f'=F{S["p25"]}', MXN),
    ('Rango (P25 – P75 de EV/EBITDA) — alto', f'=F{S["p75"]}', MXN),
    ('Alternativa: media sin atípicos (MXN)', f'=F{S["meanx"]}', MXN),
    ('Peso en la valuación combinada', "='Valuación Combinada'!C6", '0%'),
]
for k_, (lab, v, fmt) in enumerate(concl):
    ws.cell(r, 1, lab).font = B; c = ws.cell(r, 6, v); c.fill = FILL_OUT
    if fmt: c.number_format = fmt
    if k_ == 1: S['ref'] = r
    r += 1
ws.cell(r, 1, ('Decisión: peso 0%. La muestra es global (ninguna operación mexicana), mezcla control pleno con participaciones estratégicas, '
               'incluye una operación en dificultad y un atípico, y su dispersión es muy amplia (P25–P75 de EV/EBITDA). '
               'El EBITDA de SDC no es homogéneo (normas locales; tratamiento de arrendamientos no verificable). '
               'Se usa como referencia de mercado y método de contraste; su conclusión (precio por debajo del mercado) es coherente '
               'con el consenso de analistas, pero no se incorpora al precio objetivo.'))
ws.cell(r, 1).alignment = Alignment(wrap_text=False); ws.cell(r, 1).font = NOTE
r += 1
ws.cell(r, 1, 'Mediana (estadístico central robusto) en lugar de la media: con n pequeño y un atípico (Profi 21.3x) la media se desplaza al alza.').font = NOTE

for c_, w in {'A': 14, 'B': 12, 'C': 30, 'D': 14, 'E': 20, 'F': 12, 'G': 30, 'H': 14, 'I': 11, 'J': 16, 'K': 16, 'L': 15, 'M': 15,
              'AC': 70, 'Z': 26, 'AA': 13, 'W': 13}.items():
    ws.column_dimensions[c_].width = w
ws.freeze_panes = ws.cell(HR + 1, 4)

# Nombres definidos
for nm, ref in {'VF_SDC_VALOR': f"'Transacciones SDC'!$F${S['ref']}", 'VF_SDC_P25': f"'Transacciones SDC'!$F${S['p25']}",
                'VF_SDC_P75': f"'Transacciones SDC'!$F${S['p75']}", 'VF_SDC_MEDIANA': f"'Transacciones SDC'!$C${S['median']}"}.items():
    wb.defined_names[nm] = DefinedName(nm, attr_text=ref)

# =====================================================================================================
# 2. VALUACIÓN COMBINADA: Precedent Transactions = mediana SDC (referencia, peso 0%)
# =====================================================================================================
VC = wb['Valuación Combinada']
VC['A6'] = 'Precedent Transactions (LSEG/SDC, mediana EV/EBITDA)'
VC['B6'] = f"='Transacciones SDC'!F{S['ref']}"
VC['F6'] = ('Transacciones SDC (auditada): mediana de EV/EBITDA de las operaciones elegibles. Peso 0%: muestra global, sin operaciones mexicanas, '
            'control mixto y dispersión amplia. Se calcula y se muestra como referencia. La muestra CIQ (3 operaciones) queda como histórico.')
VC['A20'] = 'Precedent Transactions (referencia SDC · P25–P75)'
VC['B20'] = f"='Transacciones SDC'!F{S['p25']}"; VC['C20'] = '=B6'; VC['D20'] = f"='Transacciones SDC'!F{S['p75']}"
VC['A21'] = 'Memo · Precedent Transactions CIQ (histórico, no defendible; 3 operaciones, media)'
VC['B21'] = '=Transacciones!E28'; VC['C21'] = '=Transacciones!E49'; VC['D21'] = '=Transacciones!E33'
for c_ in ('B21', 'C21', 'D21', 'B20', 'C20', 'D20'): VC[c_].number_format = MXN
VC['F14'] = 'Solo como referencia de la regla de pesos iguales (⅓): incluye Precedent Transactions SDC (mediana), que no forma parte del precio oficial.'

# =====================================================================================================
# 3. PROYECCIÓN FINAL: sensibilidad del PRECIO OBJETIVO FINAL (WACC × g, Ke fijo)
# =====================================================================================================
PF = wb['Proyección Final Soriana']
PF['A160'] = '7. SENSIBILIDAD — PRECIO GORDON AL CIERRE DE 2025 (MXN; centro = B150, no es el precio objetivo final: ver sección 12)'
R0 = 273
PF[f'A{R0}'] = '12. SENSIBILIDAD DEL PRECIO OBJETIVO FINAL (MXN) — WACC × g, Ke fijo en el convergido (B221), 50/50 Gordon/múltiplo, puente a la fecha de valuación'
PF[f'A{R0}'].font = B
PF[f'A{R0+1}'] = 'WACC ↓ / g →'
for j in range(5):
    PF.cell(R0 + 1, 2 + j, f'=$B$123+({j}-2)*$B$161').number_format = PCT
for i in range(5):
    rr = R0 + 2 + i
    PF.cell(rr, 1, f'=$B$126+({i}-2)*$B$161').number_format = PCT
    for j in range(5):
        cc = col(2 + j)
        w, g = f'$A{rr}', f'{cc}${R0+1}'
        pv = f'SUMPRODUCT($C$117:$G$117,1/(1+{w})^$C$118:$G$118)'
        evg = f'({pv}+$B$127*(1+{g})/({w}-{g})/(1+{w})^$G$118)'
        evm = f'({pv}+$B$234*$G$71/(1+{w})^$G$118)'
        f = f'=(($B$243*{evg}+$B$244*{evm})*(1+{w})^$B$253+$B$257+$B$259+$B$260+$B$261)*(1+$B$221)^$B$254/$B$264'
        PF.cell(rr, 2 + j, f).number_format = NUM2
PF[f'A{R0+7}'] = 'Diferencia centro vs. precio objetivo final (B265)'
PF[f'B{R0+7}'] = f'=D{R0+4}-B265'
SENS_CENTER = f'D{R0+4}'

# Etiquetas de ventana de la hoja Inflación: TEXT(fecha,"mmm-yy") depende del idioma (en Excel en español muestra "yy" literal).
INF = wb['Inflación']
MES = '"ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"'
lab = lambda c: f'CHOOSE(MONTH({c}),{MES})&"-"&RIGHT(YEAR({c}),2)'
for rr, a in [(189, 'A164'), (190, 'A178'), (191, 'A181'), (192, 'A184')]:
    INF[f'C{rr}'] = f'={lab(a)}&" a "&{lab("A186")}'

# =====================================================================================================
# 4. VALIDACIÓN: rótulo de controles de regresión + controles nuevos
# =====================================================================================================
V = wb['Validación']
for rr, txt in [(33, 'Control de REGRESIÓN (no independiente): compara el resultado activo con el valor registrado en la tabla A.'),
                (34, 'Control de REGRESIÓN (tautológico: compara el valor registrado consigo mismo); se conserva solo como registro histórico.'),
                (35, 'Control de REGRESIÓN sobre valores registrados (la tabla A se re-verificó en la auditoría recalculando las 6 combinaciones).')]:
    V[f'H{rr}'] = txt
ref_row = [V.cell(62, c).value for c in range(1, 10)]
for c in range(1, 10): V.cell(62, c).value = None; V.cell(63, c).value = None
sdc = "'Transacciones SDC'"
newc = [
    ('SDC · n EV/EBITDA por vía independiente (SUMPRODUCT)', f'={sdc}!C{S["n"]}', f'=SUMPRODUCT(({sdc}!AB{D0}:AB{D1}=1)*ISNUMBER({sdc}!N{D0}:N{D1}))', 0, 'Cuenta solo elegibles con dato; NA no cuenta.'),
    ('SDC · media EV/EBITDA = SUMPRODUCT / n', f'={sdc}!C{S["mean"]}', f'=SUMPRODUCT(({sdc}!AB{D0}:AB{D1}=1)*ISNUMBER({sdc}!N{D0}:N{D1}),{sdc}!AE{D0}:AE{D1})/SUMPRODUCT(({sdc}!AB{D0}:AB{D1}=1)*ISNUMBER({sdc}!N{D0}:N{D1}))', 1e-9, 'Recalcula la media por otra vía.'),
    ('SDC · mediana EV/EBITDA = percentil 50', f'={sdc}!C{S["median"]}', f'=PERCENTILE({sdc}!AE{D0}:AE{D1},0.5)', 1e-9, 'Dos funciones distintas sobre la muestra elegible.'),
    ('SDC · ninguna operación incluida tiene < 2 múltiplos', f'=SUMPRODUCT(({sdc}!AB{D0}:AB{D1}=1)*({sdc}!T{D0}:T{D1}<{sdc}!{P["minm"]}))', 0, 0, 'Criterio de datos mínimos.'),
    ('SDC · ninguna operación incluida está fuera de la ventana', f'=SUMPRODUCT(({sdc}!AB{D0}:AB{D1}=1)*(({sdc}!B{D0}:B{D1}<{sdc}!{P["wstart"]})+({sdc}!B{D0}:B{D1}>{sdc}!{P["fval"]})))', 0, 0, 'Ventana de 3 años hasta la fecha de valuación.'),
    ('SDC · ninguna recompra propia incluida', f'=SUMPRODUCT(({sdc}!AB{D0}:AB{D1}=1)*({sdc}!X{D0}:X{D1}="Sí"))', 0, 0, 'Objetivo ≠ comprador.'),
    ('SDC · ningún NA se trata como cero', f'=COUNTIF({sdc}!AE{D0}:AE{D1},0)+COUNTIF({sdc}!AF{D0}:AF{D1},0)', 0, 0, 'Los NA quedan fuera de los estadísticos.'),
    ('SDC · precio mediana = (múltiplo × EBITDA + ajuste) / acciones', f'={sdc}!F{S["median"]}', f'=({sdc}!C{S["median"]}*Multiplos!B21+Multiplos!B30)/Multiplos!B23', 1e-9, 'Mismo puente EV → capital que Trading Comps.'),
    ('Combinada · Precedent Transactions = mediana SDC (peso 0%)', "='Valuación Combinada'!B6", f'={sdc}!F{S["median"]}', 1e-9, 'La referencia de transacciones es la muestra auditada.'),
    ('DCF · centro de la sensibilidad del precio final = precio objetivo', f"='Proyección Final Soriana'!{SENS_CENTER}", "='Proyección Final Soriana'!B265", 1e-6, 'La tabla nueva reproduce el precio objetivo con Ke fijo.'),
]
r = 62
for lab, b_, c_, tol, what in newc:
    V[f'A{r}'] = lab; V[f'B{r}'] = b_; V[f'C{r}'] = c_
    V[f'D{r}'] = f'=IF(AND(ISNUMBER(B{r}),ISNUMBER(C{r})),B{r}-C{r},"n/a")'; V[f'E{r}'] = tol
    V[f'G{r}'] = f'=IF(ISNUMBER(D{r}),IF(ABS(D{r})<=E{r},"PASS","FAIL"),"FAIL")'; V[f'H{r}'] = what
    r += 1
LASTC = r - 1
r += 1
V[f'A{r}'] = ref_row[0]; V[f'B{r}'] = ref_row[1]; V[f'C{r}'] = ref_row[2]; V[f'D{r}'] = f'=B{r}/C{r}-1'
V[f'G{r}'] = f'=IF(ABS(D{r})<=0.25,"RAZONABLE","REVISAR")'; V[f'H{r}'] = ref_row[7]
REFROW = r
r += 1
V[f'A{r}'] = 'RESUMEN'; V[f'A{r}'].font = B
V[f'B{r}'] = f'=COUNTIF(G23:G{LASTC},"PASS")&" PASS de "&COUNTA(A23:A{LASTC})'
V[f'H{r}'] = f'{LASTC - 22} controles internos (39 originales + {len(newc)} de la auditoría). La fila {REFROW} compara contra una referencia sectorial externa de CIQ solo como razonabilidad.'
wb.defined_names['VF_VALIDACION_RESUMEN'] = DefinedName('VF_VALIDACION_RESUMEN', attr_text=f"'Validación'!$B${r}")

# =====================================================================================================
# 5. FUENTES
# =====================================================================================================
FU = wb['Fuentes']
FU['B20'] = "Valuación Combinada!C4:C6"
FU['G20'] = ('Pesos iguales entre métodos activos (diap. 18). Precedent Transactions = 0%: la muestra CIQ (3 operaciones) no es defendible y la '
             'muestra LSEG/SDC auditada es global, de control mixto y muy dispersa; se muestra como referencia.')
FU.insert_rows(21, 3)
FU['A21'] = 'Transacciones LSEG/SDC'; FU['B21'] = 'Transacciones SDC'; FU['C21'] = f'{len(J)} evaluadas · {N_GRID} en pantalla'; FU['D21'] = '19-oct-2026'
FU['E21'] = 'USD mm / x'; FU['F21'] = 'Observado'; FU['G21'] = 'LSEG/SDC (Refinitiv), GridExport_October_19_2026_9_29_57.pdf (Current Screen Template, 19-oct-2026 09:29:57). Juicio del analista separado en columnas naranjas.'
FU['A22'] = 'Contraste S&P Capital IQ / LSEG Refinitiv'; FU['B22'] = 'Contraste externo'; FU['C22'] = '13 referencias'; FU['D22'] = '19-oct-2026'
FU['E22'] = 'MXN por acción / x'; FU['F22'] = 'Referencia'; FU['G22'] = 'Soriana_Reporte_Valuacion_CapitalIQ_Refinitiv.pdf (consulta 19-oct-2026; último cierre en CIQ 7-oct-2026). No se incorpora al precio oficial.'
FU['A23'] = 'Tipo de cambio de referencia'; FU['B23'] = 'Transacciones SDC (MXN informativo)'; FU['C23'] = 18.48; FU['D23'] = '7-oct-2026'
FU['E23'] = 'MXN por USD'; FU['F23'] = 'Observado (implícito)'; FU['G23'] = 'S&P Capital IQ: capitalización 59,580 mdp / 3,223.7 USD mm (reporte comparativo).'
for rr in (21, 22, 23):
    for c in range(1, 8): FU.cell(rr, c).fill = FILL_IN

# =====================================================================================================
# 6. CONTRASTE EXTERNO (datos del reporte comparativo; no entran al precio oficial)
# =====================================================================================================
CE = wb.create_sheet('Contraste externo', wb.sheetnames.index('Validación'))
CE['A1'] = 'CONTRASTE EXTERNO — S&P Capital IQ, LSEG Refinitiv y modelos propios (referencias; no entran al precio oficial salvo DCF y Trading Comps)'; CE['A1'].font = H1
CE['A2'] = ('Fuente: Soriana_Reporte_Valuacion_CapitalIQ_Refinitiv.pdf (19-oct-2026). Cifras tal como se reportan; las del modelo del equipo se vinculan a este libro. '
            'Potencial calculado contra el precio de referencia de cada fila.'); CE['A2'].font = NOTE
hdr(CE, 4, ['Clave', 'Fuente', 'Método', 'Fecha de referencia', 'Precio por acción (MXN)', 'Rango bajo', 'Rango alto', 'Precio de mercado de referencia (MXN)',
            'Fecha del precio', 'Diferencia vs. precio', 'Supuestos principales', 'Calidad y limitaciones', '¿Entra en la valuación oficial?', 'Página del reporte'])
EXT = [
    ('team_dcf', 'Modelo del equipo (este libro)', 'DCF (FCFF, 50% Gordon / 50% múltiplo, a la fecha de valuación)', '01-oct-2026', "='Proyección Final Soriana'!B265", "='Valuación Combinada'!B18", "='Valuación Combinada'!D18", "='Valuación Combinada'!B10", '25-sep-2026', None,
     'βU 0.69 Damodaran (corregida por caja), WACC iterado, g 3.5%, múltiplo de salida 5.81x', 'Rango = escenarios de inflación Cautela–Alcista.', 'Sí (50%)', '—'),
    ('team_comps', 'Modelo del equipo (este libro)', 'Trading Comps (7 pares CIQ, promedio de 3 múltiplos a la media)', '30-jun-2026', "='Valuación Combinada'!B5", "='Valuación Combinada'!B19", "='Valuación Combinada'!D19", "='Valuación Combinada'!B10", '25-sep-2026', None,
     'EV/EBITDA, EV/EBIT y P/U LTM; puente al 2T26', 'Múltiplos CIQ al 30-jun-2026; precio de mercado de otra fecha.', 'Sí (50%)', '—'),
    ('team_sdc', 'Modelo del equipo (este libro)', 'Precedent Transactions LSEG/SDC (mediana EV/EBITDA)', '19-oct-2026', "='Valuación Combinada'!B6", "='Valuación Combinada'!B20", "='Valuación Combinada'!D20", "='Valuación Combinada'!B10", '25-sep-2026', None,
     'Muestra global auditada; rango P25–P75', 'Sin operaciones mexicanas; control mixto; dispersión amplia.', 'No (0%, referencia)', '—'),
    ('team_ciq_trans', 'Modelo del equipo (este libro)', 'Precedent Transactions CIQ (3 operaciones, media)', '—', '=Transacciones!E49', '=Transacciones!E28', '=Transacciones!E33', "='Valuación Combinada'!B10", '25-sep-2026', None,
     'Media de EV/EBITDA 7.63x', 'Histórico: 1 de 3 en la ventana; no defendible.', 'No (histórico)', '—'),
    ('team_combined', 'Modelo del equipo (este libro)', 'Valuación combinada (DCF 50% / Comps 50%)', '01-oct-2026', "='Valuación Combinada'!B9", None, None, "='Valuación Combinada'!B10", '25-sep-2026', None,
     'Transacciones 0%', '—', 'Sí (precio objetivo)', '—'),
    ('indiv_dcf', 'Modelo individual del autor del reporte (SORIANA_FINAL)', 'DCF', '07-oct-2026', 39.21, 32.12, 47.74, 33.10, '07-oct-2026', None,
     'βU 0.1705 (regresión, no significativa al 95%), WACC 9.63%, Ke 10.39%, g 3.5%', 'Modelo distinto del equipo: otra beta, otra fecha y otra proyección. En este libro, βU 0.1705 lleva el DCF del equipo a $38.34.', 'No (otro modelo)', '1, 5–7'),
    ('indiv_combined', 'Modelo individual del autor del reporte', 'Valuación combinada (50% DCF / 50% comps)', '07-oct-2026', 36.35, None, None, 33.10, '07-oct-2026', None, 'Transacciones 0%', 'Modelo distinto del equipo.', 'No', '8'),
    ('app_hist', 'ValuFlow (app del equipo, versión anterior)', 'DCF', '01-oct-2026', 31.16, 25.91, 37.56, 33.48, '25-sep-2026', None,
     'βU 0.80 (heredada), WACC 11.88%, Ke 13.95%', 'Salida histórica antes de esta actualización.', 'No (histórico)', '9'),
    ('ciq_dcf_author', 'S&P Capital IQ (estimados de consenso; DCF construido por el autor)', 'DCF con estimados CIQ', '19-oct-2026', 38.27, 34.8, 43.0, 33.10, '07-oct-2026', None,
     'WACC y g del modelo individual; horizonte de 4 años; sin capital de trabajo', 'No es un DCF nativo de Capital IQ.', 'No', '12–13'),
    ('ciq_multiples', 'S&P Capital IQ', 'Múltiplos (Implied Valuation: promedio de medianas de 4 múltiplos, 10 pares)', '19-oct-2026', 29.70, 25.3, 33.8, 33.10, '07-oct-2026', None,
     'EV/EBITDA y P/U, LTM y NTM; USD→MXN a 18.48', '3 de 10 pares de otra industria; selección de múltiplos del autor.', 'No', '15'),
    ('ciq_trans', 'S&P Capital IQ', 'Transacciones (mediana 6.3x EV/EBITDA)', '19-oct-2026', 28.54, 21.91, 59.30, 33.10, '07-oct-2026', None,
     'Media 7.6x → $36.58; mín–máx', 'Estadísticos calculados por el autor (CIQ los mostró vacíos).', 'No', '16'),
    ('ciq_combined', 'S&P Capital IQ', 'Combinada (50% DCF consenso / 50% múltiplos)', '19-oct-2026', 33.98, None, None, 33.10, '07-oct-2026', None, '⅓ cada método: $32.17', 'Construida por el autor.', 'No', '17'),
    ('ciq_consensus', 'S&P Capital IQ', 'Precio objetivo de analistas (media; 7 analistas)', '19-oct-2026', 23.36, 18.50, 30.00, 33.10, '07-oct-2026', None,
     'Mediana 22.00; calificación media 4.14/5 (Underperform)', 'Estimación de analistas a 12 meses, no valor intrínseco.', 'No', '11'),
    ('ref_consensus', 'LSEG Refinitiv', 'Precio objetivo de analistas (media; 7 analistas)', '19-oct-2026', 22.42, None, None, 33.10, '07-oct-2026', None,
     'Mediana 21.50; 6 venta / 1 mantener; calificación 3.86/5 (Sell)', 'Sin máximo ni mínimo reportados. No es valor intrínseco.', 'No', '18'),
    ('starmine_iv', 'LSEG Refinitiv · StarMine', 'Valor intrínseco StarMine (aprox.)', '19-oct-2026', 51.0, 49.5, 52.5, 33.10, '07-oct-2026', None,
     'WACC y g no observables (paneles sin cargar)', 'LEÍDO DE UNA GRÁFICA (±1.5): aproximado, no verificado numéricamente.', 'No', '17, 24'),
]
for i, row_ in enumerate(EXT):
    rr = 5 + i
    for j, v in enumerate(row_):
        c = CE.cell(rr, 1 + j, v)
        if j in (4, 5, 6, 7) and v is not None: c.number_format = MXN
        if isinstance(v, (int, float)) and j in (4, 5, 6, 7): c.fill = FILL_IN
        elif isinstance(v, str) and v.startswith('=') and j in (4, 5, 6, 7): c.fill = FILL_LINK
    CE.cell(rr, 10, f'=IF(AND(ISNUMBER(E{rr}),ISNUMBER(H{rr})),E{rr}/H{rr}-1,"NA")').number_format = PCT
rr = 5 + len(EXT) + 1
CE[f'A{rr}'] = 'StarMine relativo (solo puntajes): mercados emergentes 61, México 24, Consumer Staples 56, Food & Staples Retailing 33 (p. 17). No se convierten a precio.'; CE[f'A{rr}'].font = NOTE
CE[f'A{rr+1}'] = ('Lectura: las diferencias provienen sobre todo de la beta (modelo individual βU 0.1705 vs. equipo 0.69: +$6.72 por acción en este libro), '
                  'de la fecha y el precio de referencia (25-sep vs. 7-oct-2026), de la definición de EBITDA de CIQ y del estadístico usado (media vs. mediana).'); CE[f'A{rr+1}'].font = NOTE
for c_, w in {'A': 16, 'B': 30, 'C': 42, 'D': 13, 'E': 14, 'F': 11, 'G': 11, 'H': 14, 'I': 12, 'J': 12, 'K': 48, 'L': 52, 'M': 18, 'N': 10}.items():
    CE.column_dimensions[c_].width = w

# =====================================================================================================
# 7. AUDITORÍA (hallazgos y registro de cambios)
# =====================================================================================================
AU = wb.create_sheet('Auditoría')
AU['A1'] = 'AUDITORÍA DEL EXCEL PRO DEFINITIVO — hallazgos, decisiones y registro de cambios'; AU['A1'].font = H1
AU['A2'] = ('Original: "EXCEL FINAL PRO DEFINITIVO SORIANA.xlsx" (se conserva sin cambios). Este libro se genera con tools/excel/audit_pro.py. '
            'Recálculo independiente en LibreOffice: todas las fórmulas del original coinciden con sus valores guardados, salvo las 16 con FILTER de la hoja SDC '
            '(#NAME? fuera de Excel 365), que se sustituyen.'); AU['A2'].font = NOTE
hdr(AU, 4, ['#', 'Hoja / área', 'Tipo', 'Hallazgo', 'Impacto', 'Corrección / decisión', 'Prueba'])
FIND = [
    ('Transacciones SDC', 'Compatibilidad', 'Estadísticos con FILTER (Excel 365): en LibreOffice/Excel anterior dan #NAME? y n = 0.', 'El modelo de transacciones no se recalcula fuera de Excel 365.', 'Columnas auxiliares AE:AG y MIN/PERCENTILE/AVERAGE/MEDIAN.', 'Validación: controles SDC (fila 62 en adelante).'),
    ('Transacciones SDC', 'Dato', 'La columna "EV (USD mm)" es el Enterprise Value at Announcement; la pantalla también trae el Rank Value (valor de la operación), que no estaba.', 'No se podía distinguir el tamaño de la operación de su EV.', 'Se muestran ambos por separado (USD mm) con equivalente MXN informativo.', 'Cotejo campo por campo contra la pantalla (19 + 4 operaciones).'),
    ('Transacciones SDC', 'Error de dato', 'Operación 4172416040 rotulada "Chongqing Department Store / inversionista financiero". En la pantalla es Chengdu Hongqi Chain Co Ltd adquirida por Sichuan Shangtou Investment (Food & Beverage Retailing).', 'El motivo de exclusión ("formato departamental") no correspondía a la operación.', 'Se corrige la identidad y se reaplican los criterios: elegible (cambio de control). Efecto cuantificado en la sección 4.', 'Sección 4 de la hoja.'),
    ('Transacciones SDC', 'Criterios', '"Incluir" era un 1/0 capturado a mano, sin comprobar contra las columnas de criterios.', 'Riesgo de inconsistencia entre criterio y decisión.', 'Incluir = fórmula: ventana + ≥2 múltiplos + autoservicio + no recompra + juicio del analista (columna separada).', 'Controles de criterios en Validación.'),
    ('Transacciones SDC', 'Cobertura', 'Cuatro operaciones de autoservicio de la pantalla no estaban evaluadas (YAOKO, Better Life/Bubugao, Wincommerce/WinMart, Prosol/Grand Frais).', 'Embudo de selección incompleto.', 'Se agregan con su motivo de exclusión (recompra, reestructura judicial, reorganización intragrupo, dato no confiable).', 'Filas marcadas "Agregada".'),
    ('Transacciones SDC', 'Criterios', 'La ventana solo verificaba el inicio; no el fin (fecha de valuación).', 'Sin efecto en esta muestra.', 'Ventana = [inicio, fecha de valuación].', 'Control de ventana.'),
    ('Transacciones SDC', 'Estadística', 'El límite de atípicos solo era superior; la media sin atípicos no tenía mediana equivalente.', 'Tratamiento estadístico incompleto.', 'Límites inferior y superior (RIC) y mediana sin atípicos.', 'Sección 3.'),
    ('Valuación Combinada', 'Metodología', 'La referencia de Precedent Transactions seguía siendo la muestra CIQ (3 operaciones, declarada no defendible).', 'El rango y la regla de ⅓ usaban un dato no defendible.', 'Referencia = mediana SDC auditada (peso 0%); CIQ como memo histórico. El precio combinado oficial no cambia.', 'Control "Combinada · PT = mediana SDC".'),
    ('Proyección Final', 'Presentación', 'La tabla de sensibilidad (sección 7) mide el precio Gordon al cierre de 2025 (centro $29.19), no el precio objetivo final ($31.62).', 'Lectura equivocada del rango del precio objetivo.', 'Se rotula y se agrega la sección 12: sensibilidad del precio objetivo final (Ke fijo), igual a la de ValuFlow.', 'Control "centro = B265".'),
    ('Validación', 'Validación', 'Filas 33–35 comparan contra valores registrados; la 34 compara un valor registrado consigo mismo (tautológica).', 'Aparentan ser pruebas independientes.', 'Se rotulan como controles de regresión. La tabla A se re-verificó recalculando las 6 combinaciones en LibreOffice: coinciden.', 'tools/excel/audit_checks.py.'),
    ('Inflación', 'Presentación', 'Las etiquetas de ventana (C189:C192) usan TEXT(fecha,"mmm-yy"): en Excel en español el código "yy" no existe y se muestra literal ("nov-yy a sep-yy").', 'Etiqueta ilegible; no afecta cálculos.', 'Se sustituye por una fórmula independiente del idioma (CHOOSE(MONTH) & año).', 'Recálculo: "nov-24 a sep-26".'),
    ('Fuentes', 'Referencia', 'La fila de pesos apuntaba a "Valuación Combinada!C6:C8" (los pesos están en C4:C6) y no había registro de LSEG/SDC ni del contraste externo.', 'Trazabilidad incompleta.', 'Se corrige y se agregan 3 registros.', '—'),
    ('WACC / Beta', 'Revisado, sin cambio', 'βU Damodaran 0.69 (corregida por caja) → βL 0.907 → Ke 13.35% → WACC iterado 11.38%. Beta de regresión del estudio 0.04 (R² bajo); la del modelo individual 0.1705 no es significativa al 95%.', 'Con βU 0.1705 el DCF sería $38.34 (+$6.72); con 0.65, $32.03; con 0.80, $30.54.', 'Se conserva la metodología del equipo (beta sectorial).', 'Recálculo en LibreOffice con cada beta.'),
    ('DCF', 'Revisado, sin cambio', 'Secuencia ventas → EBIT → NOPAT → FCFF → WACC → VT (Gordon con FCF normalizado capex = D&A; múltiplo 5.81x) → EV → puente al 2T26 → Equity a la fecha de valuación. FCFF descontado al WACC (no se mezclan flujos al accionista). Balance cuadra; iteración converge.', '—', 'Sin cambios.', 'Recálculo independiente y controles 23–32.'),
    ('Fechas', 'Revisado, sin cambio', 'Fecha de valuación 01-oct-2026; precio 33.48 MXN del 25-sep-2026 (último cierre antes de la valuación); balance 2T26; comparables CIQ al 30-jun-2026; pantalla SDC 19-oct-2026; reporte comparativo 19-oct-2026 con precio 33.10 MXN del 7-oct-2026.', 'Cada fecha cumple una función distinta.', 'Se rotulan en cada salida; el precio nunca se presenta como "del día".', '—'),
]
for i, x in enumerate(FIND):
    rr = 5 + i; AU.cell(rr, 1, i + 1)
    for j, v in enumerate(x): AU.cell(rr, 2 + j, v).alignment = WRAP
for c_, w in {'A': 4, 'B': 20, 'C': 18, 'D': 60, 'E': 40, 'F': 55, 'G': 30}.items(): AU.column_dimensions[c_].width = w

wb.save(OUT)
print('OK', OUT, 'SDC rows', D0, D1, 'stats', S)
