"""Construye el Excel maestro integrado a partir del Excel definitivo + archivos fuente.
Uso: python3 -I build_master.py <dir_fuentes> <salida.xlsx>
Todos los datos nuevos se leen de los archivos fuente (no se capturan a mano), salvo los supuestos
documentados, que llevan su fuente en la columna correspondiente.
"""
import sys, os, datetime as dt, xlrd, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment

SRC, OUT = sys.argv[1], sys.argv[2]
MASTER = os.path.join(SRC, 'EXCEL_DEFINITIVO_DE_VALUACION_DE_SORIANA_AUN_SIN_MULTIPLOS_TRANSACCIONES_Y_SIN_EFECTO_DE_LA_INFLACION.xlsx')
INFL = os.path.join(SRC, 'MODELO_DE_INFLACION_EN_LA_VALUACION_DE_EMPRESAS.xlsx')
COMPS = os.path.join(SRC, 'MULTIPLOS_DE_SORIANA_Y_COMPETIDORES.xls')
TRANS = os.path.join(SRC, 'TRANSACCIONES_INDUSTRIA_RETAIL.xls')
F_INFL, F_COMPS, F_TRANS = 'MODELO DE INFLACION EN LA VALUACION DE EMPRESAS.xlsx', 'MULTIPLOS DE SORIANA Y COMPETIDORES.xls', 'TRANSACCIONES INDUSTRIA RETAIL.xls'

wb = openpyxl.load_workbook(MASTER)
PF = "'Proyección Final Soriana'"

# ---------- estilos ----------
H1 = Font(bold=True, size=14, color='00276F'); H2 = Font(bold=True, size=11, color='FFFFFF'); B = Font(bold=True)
NOTE = Font(italic=True, size=9, color='5D5D60')
FILL_H = PatternFill('solid', fgColor='0039A6'); FILL_IN = PatternFill('solid', fgColor='FFF2CC')   # amarillo = dato/supuesto capturado
FILL_LINK = PatternFill('solid', fgColor='E2EFDA')   # verde = vínculo a otra hoja / archivo fuente
FILL_OUT = PatternFill('solid', fgColor='D8E3F8')    # azul = resultado clave
WRAP = Alignment(wrap_text=True, vertical='top')
PCT, PCT4, X2, NUM1, NUM2, MXN = '0.00%', '0.0000%', '0.00"x"', '#,##0.0', '#,##0.00', '"$"#,##0.00'

def title(ws, text, sub):
    ws['A1'] = text; ws['A1'].font = H1
    ws['A2'] = sub; ws['A2'].font = NOTE; ws['A2'].alignment = Alignment(wrap_text=False)
    ws['A3'] = 'Convención de colores: amarillo = dato o supuesto capturado (con fuente) · verde = vínculo a otra hoja o archivo fuente · azul = resultado clave · blanco = cálculo.'
    ws['A3'].font = NOTE

def section(ws, r, text, ncols=8):
    for c in range(1, ncols + 1): ws.cell(r, c).fill = FILL_H
    ws.cell(r, 1, text).font = H2

def hdr(ws, r, labels, c0=1):
    for i, l in enumerate(labels):
        cell = ws.cell(r, c0 + i, l); cell.font = B; cell.alignment = WRAP; cell.fill = PatternFill('solid', fgColor='EEF3FC')

def put(ws, r, c, v, fmt=None, fill=None, bold=False):
    cell = ws.cell(r, c, v)
    if fmt: cell.number_format = fmt
    if fill: cell.fill = fill
    if bold: cell.font = B
    return cell

def name(n, ref):
    wb.defined_names[n] = DefinedName(n, attr_text=ref)

def widths(ws, w):
    for col, x in w.items(): ws.column_dimensions[col].width = x

# =====================================================================
# 1. INFLACIÓN
# =====================================================================
iv = openpyxl.load_workbook(INFL, data_only=True); IS, SS = iv['INFLACION'], iv['SORIANA']
ws = wb.create_sheet('Inflación')
title(ws, 'INFLACIÓN — datos, modelos de clase, escenarios y transmisión al modelo',
      f'Fuente de datos: Banco de México, serie SP74833 (INPC, variación anual, quincenal), consulta 07/10/2026, tomada de "{F_INFL}" hoja INFLACION. Unidades: % anual.')
widths(ws, {'A': 46, 'B': 14, 'C': 14, 'D': 14, 'E': 14, 'F': 14, 'G': 14, 'H': 62, 'I': 14, 'J': 14, 'K': 14, 'L': 14})

# --- 1.1 escenario aplicado (arriba, para que sea lo primero que se ve) ---
section(ws, 5, '1. ESCENARIO DE INFLACIÓN APLICADO AL MODELO (entra a Proyección Final Soriana, fila 10)', 12)
put(ws, 6, 1, 'Selector de escenario (0 = trayectoria Citi heredada · 1 = Cautela · 2 = Base · 3 = Alcista)', bold=True)
put(ws, 6, 2, 2, fill=FILL_IN, bold=True)
dv = DataValidation(type='list', formula1='"0,1,2,3"', allow_blank=False); ws.add_data_validation(dv); dv.add('B6')
put(ws, 6, 3, '=CHOOSE(B6+1,"Trayectoria Citi (heredada)","Cautela","Base","Alcista")', bold=True)
ws['H6'] = 'Decisión del proyecto: escenario Base por defecto. El selector 0 reproduce el modelo anterior ($31.16, baseline histórico).'; ws['H6'].font = NOTE
name('VF_INF_SELECTOR', "'Inflación'!$B$6")
hdr(ws, 8, ['Concepto', '2026E', '2027E', '2028E', '2029E', '2030E', '', 'Fuente / naturaleza'])
# filas 9-12: trayectorias por escenario; fila 13: aplicada
put(ws, 9, 1, '0 · Trayectoria Citi (insumo heredado del Excel definitivo)')
for i, v in enumerate([0.0393, 0.0383, 0.0375, 0.0375, 0.0375]): put(ws, 9, 2 + i, v, PCT, FILL_IN)
ws['H9'] = 'Encuesta Citi de Expectativas, 22-sep-2026: cierre 2026 3.93%, 2027 3.83%, promedio 2028–32 3.75% (comentario original de Proyección Final!C10). Pronóstico de consenso por año.'
put(ws, 10, 1, '1 · Cautela (constante)')
put(ws, 11, 1, '2 · Base (constante)')
put(ws, 12, 1, '3 · Alcista (constante)')
for r, src in [(10, '$B$47'), (11, '$B$48'), (12, '$B$49')]:
    for i in range(5): put(ws, r, 2 + i, f'={src}', PCT)
ws['H10'] = 'Ver sección 4: escenario/referencia derivado de la tendencia larga (no es pronóstico de modelo).'
ws['H11'] = 'Ver sección 4: resultado de modelo (pronóstico exponencial trimestral de clase).'
ws['H12'] = 'Ver sección 4: supuesto de escenario (no es pronóstico).'
put(ws, 13, 1, 'INFLACIÓN APLICADA AL MODELO', bold=True)
for i in range(5):
    col = 'BCDEF'[i]
    put(ws, 13, 2 + i, f'=CHOOSE($B$6+1,{col}9,{col}10,{col}11,{col}12)', PCT, FILL_OUT, True)
ws['H13'] = 'Proyección Final Soriana!C10:G10 = esta fila. Los escenarios constantes extienden a 2026–2030 un pronóstico de un periodo: es un supuesto documentado.'
name('VF_INF_APLICADA', "'Inflación'!$B$13:$F$13")
for r in range(9, 14): ws[f'H{r}'].alignment = WRAP

# --- 1.2 cadena de transmisión ---
section(ws, 15, '2. CADENA DE TRANSMISIÓN DOCUMENTADA (solo relaciones sustentadas en el Excel)', 12)
chain = [
    ('Inflación (fila 13) → Proyección Final!C10:G10', 'Vínculo directo', 'Antes: valores capturados de la Encuesta Citi.'),
    ('→ Crecimiento nominal del mercado (C14)', 'Crec. mercado = Inflación + PIB × elasticidad + ajuste de consumo', 'Coeficiente 1.0 sobre la inflación (fórmula existente del Excel).'),
    ('→ Crecimiento por variables externas (C23)', 'C23 = C14 + Σ ajustes (filas 15–22)', 'Ajustes documentados en comentarios de cada celda.'),
    ('→ Crecimiento final de ventas (C28)', 'C28 = peso externo × C23 + peso MC × C27', 'Traspaso a ventas = 70% / 70% / 75% / 80% / 85% (pesos de la fila 6).'),
    ('→ Costo de ventas, gastos, D&A, capital de trabajo', '% de ventas / días sobre costo', "Variables Externas!E6: 'eleva ventas nominales y costo de mercancía en proporción similar; efecto casi neutral en margen'."),
    ('→ Margen EBIT', 'Sin término de inflación', 'Margen neutral (documentado).'),
    ('→ Capex', '2026 = 4,000 mdp (guía de Soriana, monto fijo); 2027–30 = % de ventas', 'El capex 2026 no escala con la inflación.'),
    ('→ FCFF → EV → Equity → precio', 'Fórmulas existentes', 'El WACC solo cambia por la iteración (peso del equity).'),
    ('NO transmitido (sin sustento documental)', 'Rf / WACC, beta, g, traspaso diferencial a costos', 'Limitación documentada: con WACC nominal fijo, mayor inflación eleva el valor (menor WACC real).'),
]
hdr(ws, 16, ['Eslabón', 'Fórmula / regla', '', '', '', '', '', 'Sustento'])
for k, (a, b, c) in enumerate(chain):
    r = 17 + k; ws.cell(r, 1, a).alignment = WRAP; ws.cell(r, 2, b).alignment = WRAP; ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=7)
    ws.cell(r, 8, c).alignment = WRAP

# --- 1.3 datos Banxico ---
q = [(IS.cell(r, 17).value, IS.cell(r, 18).value) for r in range(5, 118)]   # 2022-01-01 .. 2026-09-01 (113)
assert len(q) == 113 and q[0][0] == dt.datetime(2022, 1, 1) and q[-1][0] == dt.datetime(2026, 9, 1)
DR0 = 60
section(ws, DR0 - 2, '5. DATOS: INPC variación anual quincenal (Banxico SP74833) y columnas auxiliares de los modelos', 12)
hdr(ws, DR0 - 1, ['Quincena', 'Inflación %', 'x (2023–26)', 'ln (2023–26)', 'x (último año)', 'ln (último año)', 'Bloque trimestral', ''])
first23 = next(i for i, (d, _) in enumerate(q) if d.year >= 2023)
last25 = len(q) - 25
for i, (d, v) in enumerate(q):
    r = DR0 + i
    put(ws, r, 1, d, 'dd-mmm-yyyy', FILL_LINK); put(ws, r, 2, v, '0.00', FILL_LINK)
    if i >= first23: put(ws, r, 3, i - first23 + 1); put(ws, r, 4, f'=LN(B{r})', '0.00000')
    if i >= last25: put(ws, r, 5, i - last25 + 1); put(ws, r, 6, f'=LN(B{r})', '0.00000')
    if last25 <= i < last25 + 24: put(ws, r, 7, (i - last25) // 6 + 1)
DRN = DR0 + len(q) - 1
r23a, r23b, rya, ryb = DR0 + first23, DRN, DR0 + last25, DRN
rb = lambda k: (DR0 + last25 + 6 * (k - 1), DR0 + last25 + 6 * k - 1)

# --- 1.4 modelos ---
section(ws, 30, '3. MODELOS EXPONENCIALES DE CLASE  y = a·e^(b·x)  (calculados en esta hoja: b = SLOPE(ln y, x), a = EXP(INTERCEPT(ln y, x)))', 12)
hdr(ws, 31, ['Modelo', 'n', 'a', 'b', 'R²', 'x siguiente', 'Proyección', 'Lectura'])
# bloques trimestrales (promedios de 6 quincenas, como en el libro de clase D19:D37)
put(ws, 38, 1, 'Promedios trimestrales (6 quincenas) — libro de clase D19, D25, D31, D37', bold=True)
for k in range(1, 5):
    a, b = rb(k); put(ws, 38, 1 + k, f'=AVERAGE(B{a}:B{b})', '0.0000')
put(ws, 39, 1, 'x del promedio trimestral'); [put(ws, 39, 1 + k, k) for k in range(1, 5)]
put(ws, 40, 1, 'ln del promedio trimestral'); [put(ws, 40, 1 + k, f'=LN({"BCDE"[k-1]}38)', '0.00000') for k in range(1, 5)]
models = [
    (32, 'Inmediata (quincenal, último año: sep-25 a sep-26)', f'F{rya}:F{ryb}', f'E{rya}:E{ryb}', '=COUNT(B{}:B{})'.format(rya, ryb), 26, 'Resultado de modelo. R² bajo (tendencia de corto plazo).'),
    (33, 'Trimestral (4 promedios trimestrales del último año)', 'B40:E40', 'B39:E39', '=COUNT(B38:E38)', 5, 'Resultado de modelo → define el escenario BASE. Solo 4 puntos.'),
    (34, 'Ventana larga quincenal 2023–2026', f'D{r23a}:D{r23b}', f'C{r23a}:C{r23b}', '=COUNT(C{}:C{})'.format(r23a, r23b), 90, 'Resultado de modelo de tendencia larga.'),
]
for r, lab, ly, x, n, xn, read in models:
    put(ws, r, 1, lab); put(ws, r, 2, n)
    put(ws, r, 3, f'=EXP(INTERCEPT({ly},{x}))', '0.0000'); put(ws, r, 4, f'=SLOPE({ly},{x})', '0.000000')
    put(ws, r, 5, f'=RSQ({ly},{x})', '0.000'); put(ws, r, 6, xn); put(ws, r, 7, f'=C{r}*EXP(D{r}*F{r})/100', PCT4, FILL_OUT)
    ws.cell(r, 8, read).alignment = WRAP
put(ws, 35, 1, 'Libro de clase, ventana quincenal (coeficientes redondeados 5.8812, −0.006)')
put(ws, 35, 3, 5.8812, '0.0000', FILL_LINK); put(ws, 35, 4, -0.006, '0.000000', FILL_LINK); put(ws, 35, 6, 90); put(ws, 35, 7, '=C35*EXP(D35*F35)/100', PCT4)
ws['H35'] = 'Reproduce INFLACION!T28 = 3.427%. El exponente redondeado sobrestima la proyección frente a la fila 34.'; ws['H35'].alignment = WRAP
put(ws, 36, 1, 'Construcción de clase INFLACION!S113 (5 quincenas jul–sep 2026 + proyección de la fila 35)')
put(ws, 36, 7, f'=AVERAGE(B{DRN-4}:B{DRN},G35*100)/100', PCT4)
ws['H36'] = 'Es un promedio aritmético que mezcla datos observados y una proyección, no un modelo. Es la construcción más cercana al 3.26% documentado.'; ws['H36'].alignment = WRAP
name('VF_INF_MODELO_TRIM', "'Inflación'!$G$33")

# --- 1.5 escenarios ---
section(ws, 43, '4. ESCENARIOS DOCUMENTADOS Y SU NATURALEZA', 12)
hdr(ws, 44, ['Escenario', 'Valor', 'Naturaleza', '', '', '', '', 'Origen y trazabilidad'])
put(ws, 47, 1, 'Cautela', bold=True); put(ws, 47, 2, 0.0326, PCT, FILL_IN)
put(ws, 47, 3, 'Escenario / referencia derivado de la tendencia larga (no es pronóstico de modelo)')
ws['H47'] = 'Valor documentado en el Dossier ("ventana 2023-2026, trimestral 3.26%") y en Avances (escenario Cautela). Construcción de clase más cercana: fila 36 (3.268%). Modelos de tendencia larga calculados aquí: fila 34.'
put(ws, 48, 1, 'Base', bold=True); put(ws, 48, 2, '=ROUND(G33,4)', PCT, FILL_OUT)
put(ws, 48, 3, 'Resultado de modelo (forecast): modelo exponencial trimestral de clase')
ws['H48'] = 'Fila 33 redondeada a 2 decimales en %. Reproduce el 3.51% del Dossier ("4.0327e^(−0.028x) → 3.51%") y de Avances. Horizonte: siguiente trimestre; su extensión a 2026–30 es un supuesto.'
put(ws, 49, 1, 'Alcista', bold=True); put(ws, 49, 2, 0.04, PCT, FILL_IN)
put(ws, 49, 3, 'Supuesto de escenario (no es pronóstico estadístico)')
ws['H49'] = 'Avances de valuación intrínseca: "Alcista: inflación 4.0%". No proviene de ningún modelo. Referencia de contexto: el promedio trimestral máximo del último año fue 4.33% (fila 38).'
for r in (47, 48, 49):
    ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=7); ws.cell(r, 3).alignment = WRAP; ws.cell(r, 8).alignment = WRAP; ws.row_dimensions[r].height = 48
ws['A51'] = 'Nota: el selector no admite valores libres. Solo existen los escenarios documentados de esta tabla y la trayectoria Citi heredada.'; ws['A51'].font = NOTE

# --- 1.6 estudio de mercado (referencia) ---
MR = DRN + 4
section(ws, MR, '6. ESTUDIO DE MERCADO DE CLASE (referencia; NO alimenta el DCF) — correlaciones y beta histórica', 12)
hdr(ws, MR + 1, ['Mes', 'Cierre mensual Soriana B (MXN)', 'Inflación mensual %'])
mon = [(SS.cell(r, 5).value, SS.cell(r, 6).value, SS.cell(r, 7).value) for r in range(2, 25)]
m0 = MR + 2
for i, (d, p, inf) in enumerate(mon):
    put(ws, m0 + i, 1, d, 'mmm-yyyy', FILL_LINK); put(ws, m0 + i, 2, p, '0.00', FILL_LINK); put(ws, m0 + i, 3, inf, '0.000', FILL_LINK)
mN = m0 + len(mon) - 1
cr = mN + 2
hdr(ws, cr, ['Correlación precio–inflación', 'Valor', 'Ventana'])
for k, (lab, a) in enumerate([('Toda la muestra (23 meses)', m0), ('Anual (ene–sep 2026)', m0 + 14), ('Semestral (abr–sep 2026)', m0 + 17), ('Trimestral (jul–sep 2026)', m0 + 20)]):
    put(ws, cr + 1 + k, 1, lab); put(ws, cr + 1 + k, 2, f'=CORREL(B{a}:B{mN},C{a}:C{mN})', '0.000')
    put(ws, cr + 1 + k, 3, f'=TEXT(A{a},"mmm-yy")&" a "&TEXT(A{mN},"mmm-yy")')
ws.cell(cr + 5, 1, 'El Dossier reporta 0.26 / 0.61 / 0.65 / 0.70; el libro de clase da los valores de esta tabla (diferencias documentadas en la auditoría).').font = NOTE
# beta diaria
br = cr + 7
hdr(ws, br, ['Fecha', 'Rend. diario Soriana B', 'Rend. diario IPC'])
dd = [(SS.cell(r, 17).value, SS.cell(r, 19).value, SS.cell(r, 23).value) for r in range(3, 65)]
b0 = br + 1
for i, (d, s, w) in enumerate(dd):
    put(ws, b0 + i, 1, d, 'dd-mmm-yyyy', FILL_LINK); put(ws, b0 + i, 2, s, '0.0000', FILL_LINK); put(ws, b0 + i, 3, w, '0.0000', FILL_LINK)
bN = b0 + len(dd) - 1
bs = bN + 2
put(ws, bs, 1, 'BETA HISTÓRICA DEL ESTUDIO (regresión de rendimientos diarios Soriana vs IPC)', bold=True)
put(ws, bs + 1, 1, 'Pendiente (beta) = SLOPE'); put(ws, bs + 1, 2, f'=SLOPE(B{b0}:B{bN},C{b0}:C{bN})', '0.0000', FILL_OUT)
put(ws, bs + 2, 1, 'R²'); put(ws, bs + 2, 2, f'=RSQ(B{b0}:B{bN},C{b0}:C{bN})', '0.0000')
put(ws, bs + 3, 1, 'Observaciones'); put(ws, bs + 3, 2, f'=COUNT(B{b0}:B{bN})')
put(ws, bs + 4, 1, 'Beta reportada en el libro de clase / Dossier'); put(ws, bs + 4, 2, 0.4146195661093146, '0.0000', FILL_LINK)
ws.cell(bs + 4, 3, 'SORIANA!Y2 = SLOPE(...)*10: el factor ×10 no tiene sustento; la regresión real es la fila anterior.').font = NOTE
put(ws, bs + 6, 1, 'BETA USADA EN EL WACC (distinta de la beta histórica)', bold=True)
put(ws, bs + 7, 1, 'Beta desapalancada sectorial (input heredado)'); put(ws, bs + 7, 2, '=WACC!B9', '0.00', FILL_LINK)
ws.cell(bs + 7, 3, 'Fuente pendiente: aparece en el Excel y en el Material Maestro ("Sesión 2"), sin fuente, fecha ni metodología.').font = NOTE
put(ws, bs + 8, 1, 'Referencia Damodaran (global, ene-2026, Retail Grocery & Food)'); put(ws, bs + 8, 2, 0.65, '0.00', FILL_IN)
ws.cell(bs + 8, 3, 'βU 0.65 (0.69 corregida por caja), según resumen de búsqueda de pages.stern.nyu.edu/~adamodar/.../BetasGlobal.html. NO verificada en la fuente (acceso bloqueado); no se usa. Pendiente: tabla de mercados emergentes.').font = NOTE
name('VF_BETA_HISTORICA', f"'Inflación'!$B${bs+1}")
INF_BETA_ROW = bs + 1

# =====================================================================
# 2. TRADING COMPS
# =====================================================================
cb = xlrd.open_workbook(COMPS, ignore_workbook_corruption=True)
FD, TM, OS, BD, CH = (cb.sheet_by_name(n) for n in ('Financial Data', 'Trading Multiples', 'Operating Statistics', 'Business Description', 'Credit Health Panel'))
asof = xlrd.xldate_as_datetime(FD.cell_value(9, 1), cb.datemode)
def fnum(x): return x if isinstance(x, float) else None
ch_ind = {CH.cell_value(r, 0): (CH.cell_value(r, 10), CH.cell_value(r, 11)) for r in range(14, 27) if CH.cell_value(r, 0)}
CLASS = {   # clasificación del análisis de comparabilidad (auditoría v2, sección F)
 'CHDRAUI': ('Incluir', 1, 'Autoservicio multiformato', 'Par más cercano: mismo formato y país; margen EBITDA (6.4%) y crecimiento (−3.4%) casi iguales a los de Soriana.'),
 'GMAT3': ('Incluir con reserva', 1, 'Supermercados y mayoreo', 'Formato comparable; geografía (Brasil) y crecimiento (18.7%) distintos; P/U 4.7x atípico.'),
 'LIVEPOL': ('Excluir', 0, 'Departamentales + crédito + inmobiliario', 'Industria distinta (Broadline Retail); negocio financiero; margen EBITDA del doble (14.2%).'),
 'WALMEX': ('Incluir con reserva', 1, 'Autoservicio, descuento y club', 'Competidor directo; 12 veces el tamaño de Soriana y líder del mercado (prima de múltiplo).'),
 'LACOMER': ('Incluir con reserva', 1, 'Autoservicio premium', 'Competidor directo; más pequeña, formato premium, más rentable (10.0%) y sin deuda neta.'),
 'ASAI3': ('Incluir con reserva', 1, 'Mayoreo cash & carry', 'Formato comparable a City Club; Brasil; apalancamiento alto (4.0x) distorsiona P/U.'),
 'CENCOSUD': ('Incluir con reserva', 1, 'Supermercados + mejoramiento del hogar + departamentales + centros comerciales', 'Diversificada (Chile); EBITDA LTM −29.5% infla EV/EBITDA y EV/EBIT.'),
 'INRETC1': ('Incluir con reserva', 1, 'Supermercados, farmacias, centros comerciales', 'Multiformato (Perú) con negocios no comparables (farmacia, inmobiliario).'),
 'FEMSA': ('Excluir', 0, 'Embotellador Coca-Cola + OXXO + salud + combustible', 'Industria distinta (Soft Drinks); P/U 25.9x.'),
 'FALABELLA': ('Excluir', 0, 'Departamentales, mejoramiento del hogar, banca', 'Industria distinta (Broadline Retail); negocio financiero.'),
}
def key_of(name): return next(k for k in CLASS if k in name.replace(' ', '').upper().replace('LIVEPOLC-1', 'LIVEPOL').replace('LACOMERUBC', 'LACOMER'))
ws = wb.create_sheet('Trading Comps')
title(ws, 'TRADING COMPS — múltiplos de empresas públicas comparables (metodología de clase: CIQ Valuations, diap. 4–9 y 20)',
      f'Fuente: S&P Capital IQ, "{F_COMPS}" (Quick Comparable Analysis, plantilla Capital IQ Default Comps), as-of {asof:%d-%b-%Y}, USD al tipo de cambio del día de exportación. Los múltiplos no tienen unidades; las métricas de Soriana son MXN (mdp) del Excel.')
widths(ws, {'A': 34, 'B': 11, 'C': 22, 'D': 26, 'E': 11, 'F': 11, 'G': 10, 'H': 10, 'I': 10, 'J': 16, 'K': 8, 'L': 48, 'M': 10, 'N': 10, 'O': 10, 'P': 10, 'Q': 10, 'R': 10, 'S': 10})
section(ws, 5, '1. GRUPO COMPARABLE: datos CIQ y revisión de comparabilidad', 19)
hdr(ws, 6, ['Empresa (CIQ)', 'País', 'Industria primaria (CIQ)', 'Modelo de negocio', 'TEV USD mm', 'Ventas LTM USD mm', 'Mg EBITDA', 'Crec. ventas', 'Deuda/ EBITDA', 'Clasificación', 'Incluir (1/0)', 'Razón',
            'EV/Ventas LTM', 'EV/EBITDA LTM', 'EV/EBIT LTM', 'P/U LTM', 'P/VL tangible', 'EV/EBITDA NTM', 'P/U NTM'])
peers = []
for r in range(14, 24):
    nm = FD.cell_value(r, 0); k = key_of(nm); cls = CLASS[k]
    rr = 7 + len(peers); peers.append(rr)
    ind = ch_ind.get(nm, ('', ''))
    put(ws, rr, 1, nm, fill=FILL_LINK); put(ws, rr, 2, ind[0], fill=FILL_LINK); put(ws, rr, 3, ind[1], fill=FILL_LINK); ws.cell(rr, 4, cls[2]).alignment = WRAP
    put(ws, rr, 5, fnum(FD.cell_value(r, 7)), '#,##0', FILL_LINK); put(ws, rr, 6, fnum(FD.cell_value(r, 10)), '#,##0', FILL_LINK)
    put(ws, rr, 7, fnum(OS.cell_value(r, 2)), '0.0%', FILL_LINK); put(ws, rr, 8, fnum(OS.cell_value(r, 5)), '0.0%', FILL_LINK); put(ws, rr, 9, fnum(OS.cell_value(r, 10)), '0.0', FILL_LINK)
    put(ws, rr, 10, cls[0], fill=FILL_IN, bold=True); put(ws, rr, 11, cls[1], fill=FILL_IN, bold=True); ws.cell(rr, 12, cls[3]).alignment = WRAP
    for j, c in enumerate([1, 2, 3, 4, 5, 7, 8]):
        v = TM.cell_value(r, c); put(ws, rr, 13 + j, v if isinstance(v, float) else 'NA', X2, FILL_LINK)
    ws.row_dimensions[rr].height = 42
P0, PN = peers[0], peers[-1]
sr = PN + 1
put(ws, sr, 1, FD.cell_value(26, 0) + ' — empresa objetivo (no forma parte de la muestra)', bold=True)
for j, c in enumerate([1, 2, 3, 4, 5, 7, 8]): put(ws, sr, 13 + j, TM.cell_value(26, c), X2, FILL_LINK)
put(ws, sr, 5, FD.cell_value(26, 7), '#,##0', FILL_LINK); put(ws, sr, 6, FD.cell_value(26, 10), '#,##0', FILL_LINK)
put(ws, sr, 7, OS.cell_value(26, 2), '0.0%', FILL_LINK); put(ws, sr, 8, OS.cell_value(26, 5), '0.0%', FILL_LINK); put(ws, sr, 9, OS.cell_value(26, 10), '0.0', FILL_LINK)
ws.cell(sr + 1, 1, 'Industria primaria CIQ: hoja Credit Health Panel. Múltiplos: hoja Trading Multiples (publicados por CIQ, 1–2 decimales). No se recalculan: el EBITDA de la hoja Financial Data no reproduce el múltiplo LTM publicado (p. ej., Chedraui 7.24x vs 5.7x); el múltiplo publicado de Soriana (6.3x) es consistente con el EBITDA reportado con arrendamientos (~11,900 mdp), el mismo del Excel.').font = NOTE
# control con el resumen CIQ (10 empresas)
cr = sr + 3
put(ws, cr, 1, 'Control de transcripción: media de CIQ (10 empresas, hoja Trading Multiples, fila Mean)', bold=True)
for j, c in enumerate([1, 2, 3, 4, 5, 7, 8]): put(ws, cr, 13 + j, TM.cell_value(31, c), X2, FILL_LINK)
put(ws, cr + 1, 1, 'Media recalculada de los 10 múltiplos publicados')
for j in range(7):
    col = openpyxl.utils.get_column_letter(13 + j); put(ws, cr + 1, 13 + j, f'=AVERAGE({col}{P0}:{col}{PN})', X2)
CTRL = cr

# --- 2. métricas de Soriana y puente ---
mr = cr + 4
section(ws, mr, '2. MÉTRICAS DE SORIANA (MXN, LTM 3T25–2T26 = mismo corte que el as-of de CIQ) Y PUENTE EV → CAPITAL AL 2T26', 19)
met = [
    ('Ventas LTM (mdp)', '=SUM(Datos!C6:F6)', NUM1), ('EBIT LTM (mdp)', '=SUM(Datos!C9:F9)', NUM1), ('D&A LTM (mdp)', '=SUM(Datos!C14:F14)', NUM1),
    ('EBITDA LTM (mdp) = EBIT + D&A', f'=B{mr+2}+B{mr+3}', NUM1), ('Utilidad neta LTM (mdp)', '=SUM(Datos!C13:F13)', NUM1),
    ('Acciones en circulación (millones)', '=WACC!B17', NUM1), ('UPA LTM (MXN)', f'=B{mr+5}/B{mr+6}', '0.0000'),
    ('(+) Efectivo y equivalentes 2T26', '=Datos!F17', NUM1), ('(−) Deuda bursátil y bancaria 2T26', '=-(Datos!F25+Datos!F26)', NUM1),
    ('(−) Pasivo por arrendamiento 2T26', '=-(Datos!F27+Datos!F28)', NUM1), ('(−) Interés minoritario', 0, NUM1), ('(−) Capital preferente', 0, NUM1),
    ('Ajuste neto EV → capital (mdp)', f'=SUM(B{mr+8}:B{mr+12})', NUM1),
]
srcs = ['Datos!C6:F6', 'Datos!C9:F9', 'Datos!C14:F14', 'Cálculo (mismo EBITDA que el Excel: incluye D&A de arrendamientos)', 'Datos!C13:F13', 'WACC!B17', 'Cálculo',
        'Datos!F17', 'Datos!F25:F26', 'Datos!F27:F28 (arrendamientos como deuda, igual que el DCF y el TEV de CIQ)',
        'NA en MXN: no está en el Excel. CIQ reporta 8.4 USD mm (≈0.3% del capital); convertirlo requeriría un tipo de cambio sin fuente. Se omite, igual que en el puente del DCF.',
        'Soriana no tiene capital preferente (CIQ: "-")', 'Diap. 7: caja + inversiones CP − deuda − minoritarios − preferentes']
for k, ((lab, f, fm), s) in enumerate(zip(met, srcs)):
    r = mr + 1 + k; put(ws, r, 1, lab, bold=(k in (3, 12))); put(ws, r, 2, f, fm, FILL_LINK if isinstance(f, str) and '!' in f else (FILL_IN if not isinstance(f, str) else None))
    ws.cell(r, 3, s).font = NOTE
M_REV, M_EBIT, M_EBITDA, M_EPS, M_SH, M_ADJ = (f'$B${mr+1}', f'$B${mr+2}', f'$B${mr+4}', f'$B${mr+7}', f'$B${mr+6}', f'$B${mr+13}')

# --- 3. selección de múltiplos ---
xr = mr + 16
section(ws, xr, '3. MÚLTIPLOS: selección (NM = calculable pero sin utilidad analítica · NA = falta el dato)', 19)
hdr(ws, xr + 1, ['Múltiplo', 'Tipo', 'Métrica de Soriana', 'Usar (1/0)', 'Estado', 'Justificación'])
mults = [  # (nombre, col en tabla, tipo, métrica, usar, estado, razón)
    ('EV/EBITDA LTM', 'N', 'EV', M_EBITDA, 1, 'Usado', 'Múltiplo central de retail; EBITDA comparable (con arrendamientos).'),
    ('EV/EBIT LTM', 'O', 'EV', M_EBIT, 1, 'Usado', 'Incorpora la intensidad de capital (D&A).'),
    ('P/U LTM', 'P', 'P', M_EPS, 1, 'Usado', 'Múltiplo de precio sobre UPA diluida (CIQ "P/Diluted EPS Before Extra").'),
    ('EV/Ventas LTM', 'M', 'EV', M_REV, 0, 'Excluido', 'No es NM ni NA: se excluye porque ignora el margen; los pares van de 5.6% a 11.0% de margen EBITDA y Soriana es de los más bajos, lo que sobrevaloraría el resultado.'),
    ('P/VL tangible', 'Q', 'P', None, 0, 'NA', 'El valor en libros tangible por acción de Soriana en MXN no está en el Excel; además el valor contable no explica el valor en retail (Sendas 17.1x).'),
    ('EV/EBITDA NTM', 'R', 'EV', None, 0, 'NA', 'No existe EBITDA NTM de consenso para Soriana en MXN (CIQ lo da en USD; convertirlo requiere un tipo de cambio sin fuente).'),
    ('P/U NTM', 'S', 'P', None, 0, 'NA', 'Ídem: UPA NTM de consenso solo en USD.'),
]
MX0 = xr + 2
for k, (n, col, t, m, use, st, why) in enumerate(mults):
    r = MX0 + k; put(ws, r, 1, n, bold=True); put(ws, r, 2, t); put(ws, r, 3, f'={m}' if m else 'NA', NUM2); put(ws, r, 4, use, fill=FILL_IN, bold=True)
    put(ws, r, 5, st, bold=True); ws.cell(r, 6, why).alignment = WRAP; ws.merge_cells(start_row=r, start_column=6, end_row=r, end_column=12); ws.row_dimensions[r].height = 30

# --- 4. estadísticos y precios implícitos ---
tr = MX0 + len(mults) + 2
section(ws, tr, '4. ESTADÍSTICOS DE LA MUESTRA (solo empresas con Incluir = 1) Y PRECIO IMPLÍCITO POR ACCIÓN (MXN)', 19)
put(ws, tr + 1, 1, 'Muestra filtrada (helper): múltiplo si Incluir = 1, vacío si no', bold=True)
hdr(ws, tr + 2, ['Empresa', 'EV/Ventas', 'EV/EBITDA', 'EV/EBIT', 'P/U'])
F0 = tr + 3
for k, pr in enumerate(peers):
    r = F0 + k; put(ws, r, 1, f'=A{pr}')
    for j, col in enumerate('MNOP'): put(ws, r, 2 + j, f'=IF(AND($K${pr}=1,ISNUMBER({col}{pr})),{col}{pr},"")', X2)
FN = F0 + len(peers) - 1
st0 = FN + 2
STATS = [('Mínimo', 'MIN({r})'), ('Percentil 25', 'PERCENTILE({r},0.25)'), ('Media', 'AVERAGE({r})'), ('Mediana', 'MEDIAN({r})'), ('Percentil 75', 'PERCENTILE({r},0.75)'), ('Máximo', 'MAX({r})'), ('n', 'COUNT({r})')]
hdr(ws, st0, ['Estadístico (múltiplo)', 'EV/Ventas', 'EV/EBITDA', 'EV/EBIT', 'P/U', '', 'Precio: EV/Ventas', 'Precio: EV/EBITDA', 'Precio: EV/EBIT', 'Precio: P/U'])
# columnas: B..E múltiplos; G..J precios. Métricas: EV/Ventas→REV, EV/EBITDA→EBITDA, EV/EBIT→EBIT, P/U→EPS
metric_of = {'B': ('EV', M_REV), 'C': ('EV', M_EBITDA), 'D': ('EV', M_EBIT), 'E': ('P', M_EPS)}
for k, (lab, f) in enumerate(STATS):
    r = st0 + 1 + k; put(ws, r, 1, lab, bold=(lab == 'Media'))
    for j, col in enumerate('BCDE'):
        put(ws, r, 2 + j, '=' + f.format(r=f'{col}{F0}:{col}{FN}'), X2 if lab != 'n' else '0', FILL_OUT if lab == 'Media' else None)
        if lab == 'n': continue
        kind, m = metric_of[col]; pc = 'GHIJ'[j]
        if kind == 'EV': form = f'=IF({col}{r}*{m}+{M_ADJ}>0,({col}{r}*{m}+{M_ADJ})/{M_SH},"NM")'
        else: form = f'=IF({col}{r}*{m}>0,{col}{r}*{m},"NM")'
        put(ws, r, 7 + j, form, MXN, FILL_OUT if lab == 'Media' else None)
ST_MEAN = st0 + 3; ST_P25 = st0 + 2; ST_P75 = st0 + 5
ws.cell(st0 + 8, 1, 'Precio implícito (múltiplos EV) = (múltiplo × métrica + ajuste neto) ÷ acciones; (múltiplos de precio) = múltiplo × UPA. "NM" si el capital implícito es ≤ 0 (diap. 20). Percentiles con interpolación inclusiva (convención del ejemplo de clase, diap. 8).').font = NOTE
# detalle EV y capital a la media (trazabilidad)
dr = st0 + 10
hdr(ws, dr, ['Detalle a la MEDIA', 'EV/Ventas', 'EV/EBITDA', 'EV/EBIT', 'P/U'])
put(ws, dr + 1, 1, 'Métrica de Soriana (mdp o MXN/acción)')
put(ws, dr + 2, 1, 'EV implícito (mdp)'); put(ws, dr + 3, 1, 'Equity Value implícito (mdp)'); put(ws, dr + 4, 1, 'Precio implícito (MXN/acción)')
for j, col in enumerate('BCDE'):
    kind, m = metric_of[col]
    put(ws, dr + 1, 2 + j, f'={m}', NUM2)
    if kind == 'EV':
        put(ws, dr + 2, 2 + j, f'={col}{ST_MEAN}*{m}', NUM1); put(ws, dr + 3, 2 + j, f'={col}{dr+2}+{M_ADJ}', NUM1)
    else:
        put(ws, dr + 2, 2 + j, 'n.a. (múltiplo de precio)'); put(ws, dr + 3, 2 + j, f'={col}{ST_MEAN}*{m}*{M_SH}', NUM1)
    put(ws, dr + 4, 2 + j, f'={"GHIJ"[j]}{ST_MEAN}', MXN)

# --- 5. valor del método ---
vr = dr + 7
section(ws, vr, '5. VALOR DE TRADING COMPS (regla de clase, diap. 9: promedio simple de los precios implícitos con la MEDIA de cada múltiplo usado)', 19)
use_of = {'B': f'$D${MX0+3}', 'C': f'$D${MX0}', 'D': f'$D${MX0+1}', 'E': f'$D${MX0+2}'}   # EV/Ventas, EV/EBITDA, EV/EBIT, P/U
def agg(row):
    terms = '+'.join(f'IF(AND({use_of[c]}=1,ISNUMBER({"GHIJ"[j]}{row})),{"GHIJ"[j]}{row},0)' for j, c in enumerate('BCDE'))
    cnt = '+'.join(f'IF(AND({use_of[c]}=1,ISNUMBER({"GHIJ"[j]}{row})),1,0)' for j, c in enumerate('BCDE'))
    return f'=IF(({cnt})=0,"NA",({terms})/({cnt}))'
put(ws, vr + 1, 1, 'TRADING COMPS — precio por acción (MXN)', bold=True); put(ws, vr + 1, 2, agg(ST_MEAN), MXN, FILL_OUT, True)
put(ws, vr + 2, 1, 'Rango P25 (promedio de precios a P25 de los múltiplos usados)'); put(ws, vr + 2, 2, agg(ST_P25), MXN)
put(ws, vr + 3, 1, 'Rango P75 (promedio de precios a P75 de los múltiplos usados)'); put(ws, vr + 3, 2, agg(ST_P75), MXN)
put(ws, vr + 4, 1, 'Precio de mercado de referencia (MXN)'); put(ws, vr + 4, 2, '=Valuación!B42', MXN, FILL_LINK)
put(ws, vr + 5, 1, 'Potencial vs. precio'); put(ws, vr + 5, 2, f'=B{vr+1}/B{vr+4}-1', PCT)
put(ws, vr + 6, 1, 'Número de múltiplos usados'); put(ws, vr + 6, 2, f'=SUM(D{MX0}:D{MX0+3})')
ws.cell(vr + 7, 1, 'Fecha del valor: precios de mercado de los pares al 30-jun-2026 (as-of CIQ) y puente al 2T26. No se lleva a la fecha de valuación del DCF (01-oct-2026): la metodología de clase no lo prevé; la diferencia de fechas queda documentada.').font = NOTE
name('VF_TC_VALOR', f"'Trading Comps'!$B${vr+1}"); name('VF_TC_P25', f"'Trading Comps'!$B${vr+2}"); name('VF_TC_P75', f"'Trading Comps'!$B${vr+3}")
TC = dict(value=vr + 1, p25=vr + 2, p75=vr + 3, mean=ST_MEAN, stats0=st0, F0=F0, FN=FN, ctrl=CTRL, P0=P0, PN=PN, mx0=MX0, mr=mr, adj=mr + 13, dr=dr)

# =====================================================================
# 3. PRECEDENT TRANSACTIONS
# =====================================================================
tb = xlrd.open_workbook(TRANS, ignore_workbook_corruption=True); TS = tb.sheet_by_index(0)
ws = wb.create_sheet('Precedent Transactions')
title(ws, 'PRECEDENT TRANSACTIONS — múltiplos de operaciones de M&A (metodología de clase: CIQ Valuations, diap. 10–11 y 20)',
      f'Fuente: S&P Capital IQ, "{F_TRANS}" (Comparable M&A Transactions para Soriana). TEV y tamaño en MXN mm; múltiplos implícitos de la transacción (publicados con 1 decimal).')
widths(ws, {'A': 14, 'B': 17, 'C': 24, 'D': 26, 'E': 40, 'F': 12, 'G': 12, 'H': 10, 'I': 10, 'J': 12, 'K': 14, 'L': 11, 'M': 12, 'N': 12, 'O': 12, 'P': 50})
section(ws, 5, '1. PARÁMETROS DE SELECCIÓN (diap. 10)', 16)
put(ws, 6, 1, 'Fecha de valuación'); put(ws, 6, 3, f"={PF}!B252", 'dd-mmm-yyyy', FILL_LINK)
put(ws, 7, 1, 'Ventana (años)'); put(ws, 7, 3, 3, fill=FILL_IN); ws['D7'] = 'Diap. 10: "últimos tres años".'
put(ws, 8, 1, 'Inicio de la ventana'); put(ws, 8, 3, '=EDATE(C6,-12*C7)', 'dd-mmm-yyyy')
put(ws, 9, 1, 'Geografía de la empresa objetivo'); put(ws, 9, 3, 'México', fill=FILL_IN)
put(ws, 10, 1, 'Mínimo de múltiplos por operación'); put(ws, 10, 3, 2, fill=FILL_IN); ws['D10'] = 'Diap. 10: "al menos dos múltiplos de valor".'
ws['D9'] = 'Diap. 10: "misma geografía". La ampliación de industria y luego global requiere otra búsqueda en CIQ, que no está disponible; no se inventan operaciones.'
section(ws, 12, '2. OPERACIONES (datos CIQ) Y EVALUACIÓN DE CRITERIOS', 16)
hdr(ws, 13, ['Anunciada', 'ID CIQ', 'Objetivo', 'Comprador', 'Vendedor', 'TEV objetivo (MXN mm)', 'Tamaño (MXN mm)', 'EV/Ventas', 'EV/EBITDA', 'País del objetivo', '¿Ventana?', '¿Geografía?', '¿≥2 múltiplos?', '¿Control?', 'Incluir (1/0)', 'Observaciones'])
OBS = {  # (país, control, observación) — país: dato público del objetivo (no viene en el export CIQ)
 'IQTR1859160803': ('Colombia', 'Sí', 'Oferta por el control de Éxito; varios vendedores del grupo Casino. Única operación dentro de la ventana (por 15 días).'),
 'IQTR629442326': ('Perú', 'Dudoso', 'Comprador no identificado; tamaño 4,590 = 3.9% del TEV → probable venta minoritaria o secundaria, no de control. Fuera de la ventana.'),
 'IQTR626096522': ('Colombia', 'Dudoso', 'Vendedor Casino y comprador Sendas, ambos del grupo Casino según los datos → posible reestructura intra-grupo. Tamaño 130,645 > TEV 56,675 (dato inconsistente). Fuera de la ventana.'),
}
rows_t = []
for r in range(7, 10):
    v = [TS.cell_value(r, c) for c in range(9)]; rr = 14 + len(rows_t); rows_t.append(rr)
    put(ws, rr, 1, xlrd.xldate_as_datetime(v[0], tb.datemode), 'dd-mmm-yyyy', FILL_LINK)
    for c in range(1, 5): put(ws, rr, 1 + c, v[c], fill=FILL_LINK); ws.cell(rr, 1 + c).alignment = WRAP
    put(ws, rr, 6, v[5], '#,##0.0', FILL_LINK); put(ws, rr, 7, v[6], '#,##0.0', FILL_LINK)
    put(ws, rr, 8, float(str(v[7]).rstrip('x')), X2, FILL_LINK); put(ws, rr, 9, float(str(v[8]).rstrip('x')), X2, FILL_LINK)
    o = OBS[v[1]]
    put(ws, rr, 10, o[0], fill=FILL_IN)
    put(ws, rr, 11, f'=IF(A{rr}>=$C$8,"Sí","No")'); put(ws, rr, 12, f'=IF(J{rr}=$C$9,"Sí","No")'); put(ws, rr, 13, f'=IF(COUNT(H{rr}:I{rr})>=$C$10,"Sí","No")')
    put(ws, rr, 14, o[1], fill=FILL_IN); put(ws, rr, 15, 1, fill=FILL_IN, bold=True); ws.cell(rr, 16, o[2]).alignment = WRAP
    ws.row_dimensions[rr].height = 64
T0, TN = rows_t[0], rows_t[-1]
put(ws, TN + 1, 1, 'Resumen CIQ del export (control)', bold=True); put(ws, TN + 1, 8, 0.7, X2, FILL_LINK); put(ws, TN + 1, 9, 7.6, X2, FILL_LINK); ws.cell(TN + 1, 10, 'Media publicada (export, fila Mean)').font = NOTE
ws.cell(TN + 2, 1, 'País del objetivo: dato público de las empresas (Almacenes Éxito, Colombia; InRetail Perú, Perú); el export CIQ no lo incluye. Incluir = 1 en las tres por decisión del proyecto ("usar las tres transacciones disponibles"), con sus limitaciones documentadas.').font = NOTE
put(ws, TN + 4, 1, 'Cumplen la ventana'); put(ws, TN + 4, 3, f'=COUNTIF(K{T0}:K{TN},"Sí")&" de "&COUNTA(B{T0}:B{TN})')
put(ws, TN + 5, 1, 'Cumplen la geografía'); put(ws, TN + 5, 3, f'=COUNTIF(L{T0}:L{TN},"Sí")&" de "&COUNTA(B{T0}:B{TN})')
put(ws, TN + 6, 1, 'Operaciones de control claras'); put(ws, TN + 6, 3, f'=COUNTIF(N{T0}:N{TN},"Sí")&" de "&COUNTA(B{T0}:B{TN})')
put(ws, TN + 7, 1, 'Margen EBITDA implícito del objetivo (EV/Ventas ÷ EV/EBITDA)')
for k, rr in enumerate(rows_t): put(ws, TN + 7, 3 + k, f'=H{rr}/I{rr}', '0.0%')
# estadísticos
s0 = TN + 9
section(ws, s0, '3. ESTADÍSTICOS (operaciones con Incluir = 1) Y PRECIO IMPLÍCITO (mismo puente al 2T26 que Trading Comps)', 16)
put(ws, s0 + 1, 1, 'Muestra filtrada (helper)', bold=True)
for k, rr in enumerate(rows_t):
    r = s0 + 2 + k; put(ws, r, 1, f'=C{rr}')
    put(ws, r, 8, f'=IF($O${rr}=1,H{rr},"")', X2); put(ws, r, 9, f'=IF($O${rr}=1,I{rr},"")', X2)
G0, GN = s0 + 2, s0 + 1 + len(rows_t)
hs = GN + 2
hdr(ws, hs, ['Estadístico', '', '', '', '', '', '', 'EV/Ventas', 'EV/EBITDA', 'Precio EV/Ventas', 'Precio EV/EBITDA'])
TCs = "'Trading Comps'"
for k, (lab, f) in enumerate(STATS):
    r = hs + 1 + k; put(ws, r, 1, lab, bold=(lab == 'Media'))
    for col, pcol, m in (('H', 'J', f"{TCs}!{M_REV}"), ('I', 'K', f"{TCs}!{M_EBITDA}")):
        put(ws, r, ' HI'.index(col) + 7, '=' + f.format(r=f'{col}{G0}:{col}{GN}'), X2 if lab != 'n' else '0', FILL_OUT if lab == 'Media' else None)
        if lab != 'n':
            put(ws, r, 'J K'.index(pcol) // 2 + 10, f'=IF({col}{r}*{m}+{TCs}!{M_ADJ}>0,({col}{r}*{m}+{TCs}!{M_ADJ})/{TCs}!{M_SH},"NM")', MXN, FILL_OUT if lab == 'Media' else None)
TMEAN = hs + 3
# selección de múltiplo y valor
v0 = hs + 10
section(ws, v0, '4. VALOR DE PRECEDENT TRANSACTIONS (método de REFERENCIA — muestra no defendible)', 16)
hdr(ws, v0 + 1, ['Múltiplo', '', 'Usar (1/0)', 'Estado', 'Justificación'])
put(ws, v0 + 2, 1, 'EV/EBITDA'); put(ws, v0 + 2, 3, 1, fill=FILL_IN, bold=True); put(ws, v0 + 2, 4, 'Usado'); ws.cell(v0 + 2, 5, 'Mismo criterio que Trading Comps.')
put(ws, v0 + 3, 1, 'EV/Ventas'); put(ws, v0 + 3, 3, 0, fill=FILL_IN, bold=True); put(ws, v0 + 3, 4, 'Excluido')
ws.cell(v0 + 3, 5, 'Mismo criterio que Trading Comps: ignora el margen; los márgenes implícitos de los objetivos van de 5.8% a 13.2% (fila de margen implícito).')
put(ws, v0 + 5, 1, 'PRECEDENT TRANSACTIONS — precio por acción (MXN)', bold=True)
put(ws, v0 + 5, 5, f'=IF((C{v0+2}+C{v0+3})=0,"NA",(IF(C{v0+2}=1,K{TMEAN},0)+IF(C{v0+3}=1,J{TMEAN},0))/(C{v0+2}+C{v0+3}))', MXN, FILL_OUT, True)
put(ws, v0 + 6, 1, 'Rango (mín–máx del EV/EBITDA)'); put(ws, v0 + 6, 5, f'=K{hs+1}', MXN); put(ws, v0 + 6, 6, f'=K{hs+6}', MXN)
ws.cell(v0 + 8, 1, 'ADVERTENCIA: solo 1 de 3 operaciones cumple la ventana de 3 años, ninguna la geografía, y 2 tienen carácter de control dudoso. Con n = 3 (o n = 1 dentro de la ventana) el resultado no es estadísticamente defendible. El método se calcula y se muestra como referencia, con peso 0% en la valuación combinada (decisión del proyecto). Las transacciones de control incluyen una prima de control (diap. 11, nota).').font = Font(bold=True, color='B42318')
name('VF_PT_VALOR', f"'Precedent Transactions'!$E${v0+5}")
PT = dict(value=v0 + 5, lo=v0 + 6, mean=TMEAN, hs=hs, G0=G0, GN=GN, T0=T0, TN=TN)

# =====================================================================
# 4. VALUACIÓN COMBINADA
# =====================================================================
ws = wb.create_sheet('Valuación Combinada')
title(ws, 'VALUACIÓN COMBINADA — DCF + Trading Comps + Precedent Transactions (metodología de clase, diap. 3 y 18)',
      'Precio combinado = Σ (peso × precio del método) / Σ pesos. Pesos visibles y editables (celdas amarillas).')
widths(ws, {'A': 40, 'B': 16, 'C': 14, 'D': 14, 'E': 14, 'F': 70})
hdr(ws, 5, ['Método', 'Precio por acción (MXN)', 'Peso aplicado', 'Peso regla de clase', 'Contribución', 'Origen del precio y del peso'])
rowsC = [
    ('DCF (ValuFlow, precio objetivo a la fecha de valuación)', f"={PF}!B265", 0.5, '=1/3', "Proyección Final Soriana!B265. Metodología principal existente. Peso: con Transactions en 0%, se conserva la regla de clase de pesos iguales entre los métodos activos (50/50)."),
    ('Trading Comps', "='Trading Comps'!B{}".format(TC['value']), 0.5, '=1/3', 'Trading Comps (sección 5). Metodología complementaria. Peso igual al DCF por la regla de pesos iguales de la diap. 18.'),
    ('Precedent Transactions', "='Precedent Transactions'!E{}".format(PT['value']), 0, '=1/3', 'Precedent Transactions (sección 4). Peso 0% por decisión del proyecto: la muestra no es defendible. El método sigue calculándose.'),
]
for k, (lab, f, w, wc, src) in enumerate(rowsC):
    r = 6 + k; put(ws, r, 1, lab, bold=True); put(ws, r, 2, f, MXN, FILL_LINK); put(ws, r, 3, w, '0%', FILL_IN, True); put(ws, r, 4, wc, '0.0%')
    put(ws, r, 5, f'=IF(ISNUMBER(B{r}),B{r}*C{r},0)', MXN); ws.cell(r, 6, src).alignment = WRAP; ws.row_dimensions[r].height = 44
put(ws, 9, 1, 'Suma de pesos'); put(ws, 9, 3, '=SUM(C6:C8)', '0%'); put(ws, 9, 4, '=SUM(D6:D8)', '0.0%')
put(ws, 11, 1, 'PRECIO COMBINADO (MXN por acción)', bold=True); put(ws, 11, 2, '=SUMPRODUCT(B6:B8,C6:C8)/C9', MXN, FILL_OUT, True)
put(ws, 12, 1, 'Precio de mercado (MXN, 25-sep-2026)'); put(ws, 12, 2, '=Valuación!B42', MXN, FILL_LINK)
put(ws, 13, 1, 'Diferencia vs. precio (MXN)'); put(ws, 13, 2, '=B11-B12', MXN)
put(ws, 14, 1, 'Potencial / (baja)'); put(ws, 14, 2, '=B11/B12-1', PCT)
put(ws, 16, 1, 'Memo: resultado con la regla de clase (⅓ cada método)'); put(ws, 16, 2, '=SUMPRODUCT(B6:B8,D6:D8)/D9', MXN)
ws['F16'] = 'Solo como referencia de la regla de pesos iguales: incluye la muestra de transacciones no defendible.'
section(ws, 18, 'RANGO POR MÉTODO (MXN por acción)', 6)
hdr(ws, 19, ['Método', 'Bajo', 'Central', 'Alto', '', 'Definición del rango'])
put(ws, 20, 1, 'DCF'); put(ws, 20, 2, '=MIN(Validación!C8:F8)', MXN); put(ws, 20, 3, '=B6', MXN); put(ws, 20, 4, '=MAX(Validación!C8:F8)', MXN)
ws['F20'] = 'Mínimo y máximo de los escenarios de inflación (Validación, tabla de escenarios).'
put(ws, 21, 1, 'Trading Comps'); put(ws, 21, 2, "='Trading Comps'!B{}".format(TC['p25']), MXN); put(ws, 21, 3, '=B7', MXN); put(ws, 21, 4, "='Trading Comps'!B{}".format(TC['p75']), MXN)
ws['F21'] = 'Promedio de los precios a P25 y P75 de los múltiplos usados (barra central del football field, diap. 19).'
put(ws, 22, 1, 'Precedent Transactions (referencia)'); put(ws, 22, 2, "='Precedent Transactions'!E{}".format(PT['lo']), MXN); put(ws, 22, 3, '=B8', MXN); put(ws, 22, 4, "='Precedent Transactions'!F{}".format(PT['lo']), MXN)
ws['F22'] = 'Mínimo y máximo del EV/EBITDA de las 3 operaciones.'
name('VF_VC_VALOR', "'Valuación Combinada'!$B$11")

# =====================================================================
# 5. VALIDACIÓN
# =====================================================================
ws = wb.create_sheet('Validación')
title(ws, 'VALIDACIÓN — controles independientes del modelo integrado',
      'Cada control recalcula el resultado por una vía distinta y lo compara con el resultado del modelo. PASS = diferencia dentro de la tolerancia.')
widths(ws, {'A': 52, 'B': 16, 'C': 16, 'D': 16, 'E': 16, 'F': 16, 'G': 10, 'H': 60})
section(ws, 5, 'A. TABLA DE ESCENARIOS DE INFLACIÓN (resultado de recalcular el libro con cada valor del selector)', 8)
hdr(ws, 6, ['Escenario (selector)', '', '0 · Citi (histórico)', '1 · Cautela', '2 · Base', '3 · Alcista', '', 'Nota'])
SCN_ROWS = [('Inflación aplicada 2026', None), ('Precio DCF final (MXN)', "B265"), ('Equity a la fecha de valuación (mdp)', "B263"), ('EV ponderado al cierre 2025 (mdp)', "B245"),
            ('WACC iterado', "B126"), ('FCF 2030E (mdp)', "G117"), ('Ventas 2030E (mdp)', "G67")]
for k, (lab, _) in enumerate(SCN_ROWS): put(ws, 7 + k, 1, lab)
ws['H7'] = 'Valores registrados al construir el libro (se recalcula el modelo con cada selector). Control C: el escenario activo debe coincidir con su columna.'
ws['H7'].alignment = WRAP
# (los valores se escriben en un segundo paso)
section(ws, 16, 'B. CONTROLES', 8)
hdr(ws, 17, ['Control', 'Valor del modelo', 'Recalculo independiente / esperado', 'Diferencia', 'Tolerancia', '', 'Estado', 'Qué verifica'])
TCS, PTS, VCS, INF = "'Trading Comps'", "'Precedent Transactions'", "'Valuación Combinada'", "'Inflación'"
sel_col = 'CHOOSE(Inflación!$B$6+1,C8,D8,E8,F8)'.replace('Inflación!', "'Inflación'!")
checks = [
    ('DCF · balance proyectado cuadra 2025A–2030E', f'=SUMPRODUCT(ABS({PF}!B97:G97))', 0, 0.5, 'Activo − pasivo − capital = 0.'),
    ('DCF · WACC > g', f'={PF}!B126-{PF}!B123', '>0', None, 'Condición del modelo de Gordon.'),
    ('DCF · iteración del WACC convergió', f'=ABS({PF}!G219-{PF}!G218)', 0, 1e-6, 'Última variación del WACC.'),
    ('DCF · Σ VP de FCF = SUMPRODUCT(FCF, factor)', f'={PF}!B134', f'=SUMPRODUCT({PF}!C117:G117,{PF}!C119:G119)', 1e-6, 'Descuento de flujos.'),
    ('DCF · factor año 5 = 1/(1+WACC)^5', f'={PF}!G119', f'=1/(1+{PF}!B126)^5', 1e-12, 'Fórmula de descuento.'),
    ('DCF · VT Gordon = FCF2030 × (1+g) / (WACC − g)', f'={PF}!B129', f'={PF}!G117*(1+{PF}!B123)/({PF}!B126-{PF}!B123)', 1e-6, 'Valor terminal.'),
    ('DCF · FCF2030 = NOPAT + D&A − Capex − ΔNWC', f'={PF}!G117', f'={PF}!G73*(1-{PF}!G55)-{PF}!G72+{PF}!G104+({PF}!G102+{PF}!G103+{PF}!G105)', 1e-6, 'Identidad del FCFF.'),
    ('DCF · Equity 2T26 = EV 2T26 − deuda − arrend. + caja', f'={PF}!B262', f'={PF}!B258-(Datos!F25+Datos!F26)-(Datos!F27+Datos!F28)+Datos!F17', 1e-6, 'Puente EV → capital.'),
    ('DCF · FCF de 1S26 restado del EV (signo)', f'={PF}!B257', '=-((Datos!E15+Datos!F15)-(Datos!E16+Datos!F16))', 1e-9, 'B257 = −(CFO − Capex) = +1,060.5 porque el FCF de 1S26 fue negativo.'),
    ('DCF · precio = Equity / acciones', f'={PF}!B265', f'={PF}!B263/WACC!B17', 1e-9, 'Precio por acción.'),
    ('DCF · escenario activo = tabla de escenarios', f'={PF}!B265', '=' + sel_col, 1e-6, 'El modelo vivo coincide con el valor registrado del escenario seleccionado.'),
    ('DCF · baseline histórico (selector 0) = $31.1644', '=C8', 31.164416422208653, 1e-6, 'El modelo anterior se reproduce exactamente con la trayectoria Citi.'),
    ('Inflación · fila 10 del DCF = inflación aplicada', f"=SUMPRODUCT(ABS({PF}!C10:G10-{INF}!B13:F13))", 0, 1e-12, 'Vínculo de la inflación al modelo.'),
    ('Inflación · Base = modelo trimestral redondeado', f"={INF}!B48", f"=ROUND({INF}!C33*EXP({INF}!D33*5),2)/100", 1e-12, 'Base = resultado de modelo.'),
    ('Inflación · modelo trimestral reproduce el Dossier (3.51%)', f"={INF}!G33", 0.0351, 0.0001, 'Dossier: 4.0327e^(−0.028x) → 3.51%.'),
    ('Inflación · modelo inmediato reproduce el libro de clase (3.508%)', f"={INF}!G32", 0.03508079362834206, 0.0001, 'Libro de clase INFLACION!H37.'),
    ('Inflación · construcción de clase S113 (3.268%)', f"={INF}!G36", 0.03267876711125648, 1e-8, 'Libro de clase INFLACION!S113.'),
    ('Mercado · beta histórica = regresión sin ×10', f"=VF_BETA_HISTORICA", 0.04146195661093146, 1e-9, 'SORIANA!Y2 / 10.'),
    ('Comps · media de 10 empresas ≈ media publicada por CIQ (EV/EBITDA)', f"={TCS}!N{TC['ctrl']+1}", f"={TCS}!N{TC['ctrl']}", 0.051, 'Transcripción correcta (CIQ redondea a 1 decimal).'),
    ('Comps · media de 10 empresas ≈ media publicada por CIQ (P/U)', f"={TCS}!P{TC['ctrl']+1}", f"={TCS}!P{TC['ctrl']}", 0.051, 'Ídem.'),
    ('Comps · media muestra (EV/EBITDA) = SUMPRODUCT / SUM', f"={TCS}!C{TC['mean']}", f"=SUMPRODUCT({TCS}!N{TC['P0']}:N{TC['PN']},{TCS}!K{TC['P0']}:K{TC['PN']})/SUM({TCS}!K{TC['P0']}:K{TC['PN']})", 1e-9, 'Estadístico recalculado por otra vía.'),
    ('Comps · precio EV/EBITDA recalculado', f"={TCS}!H{TC['mean']}", f"=({TCS}!C{TC['mean']}*{TCS}!B{TC['mr']+4}+{TCS}!B{TC['adj']})/{TCS}!B{TC['mr']+6}", 1e-9, 'Puente al capital y división entre acciones.'),
    ('Comps · valor = promedio de 3 precios a la media', f"={TCS}!B{TC['value']}", f"=AVERAGE({TCS}!H{TC['mean']}:J{TC['mean']})", 1e-9, 'Regla de agregación de la diap. 9.'),
    ('Comps · n de la muestra = 7', f"={TCS}!C{TC['stats0']+7}", 7, 0, 'Muestra depurada.'),
    ('Transactions · media EV/EBITDA ≈ media publicada por CIQ (7.6x)', f"={PTS}!I{PT['mean']}", f"={PTS}!I{PT['TN']+1}", 0.051, 'Transcripción correcta.'),
    ('Transactions · media EV/Ventas ≈ media publicada por CIQ (0.7x)', f"={PTS}!H{PT['mean']}", f"={PTS}!H{PT['TN']+1}", 0.051, 'Ídem.'),
    ('Combinada · pesos suman 100%', f"={VCS}!C9", 1, 1e-12, 'Pesos trazables.'),
    ('Combinada · precio = Σ peso × precio (recalculo)', f"={VCS}!B11", f"=({VCS}!B6*{VCS}!C6+{VCS}!B7*{VCS}!C7+IF(ISNUMBER({VCS}!B8),{VCS}!B8*{VCS}!C8,0))/({VCS}!C6+{VCS}!C7+{VCS}!C8)", 1e-9, 'Combinación lineal.'),
    ('Combinada · Transactions con peso 0%', f"={VCS}!C8", 0, 0, 'Decisión del proyecto.'),
]
for k, (lab, model, exp, tol, what) in enumerate(checks):
    r = 18 + k; put(ws, r, 1, lab); put(ws, r, 2, model, '0.000000'); put(ws, r, 3, exp, '0.000000')
    if exp == '>0':
        put(ws, r, 4, None); put(ws, r, 7, f'=IF(B{r}>0,"PASS","FAIL")')
    else:
        put(ws, r, 4, f'=B{r}-C{r}', '0.000000000'); put(ws, r, 5, tol); put(ws, r, 7, f'=IF(ABS(D{r})<=E{r},"PASS","FAIL")')
    ws.cell(r, 7).font = B; ws.cell(r, 8, what).alignment = WRAP
CK0, CKN = 18, 18 + len(checks) - 1
put(ws, CKN + 2, 1, 'RESUMEN', bold=True); put(ws, CKN + 2, 2, f'=COUNTIF(G{CK0}:G{CKN},"PASS")&" PASS de "&COUNTA(A{CK0}:A{CKN})', bold=True)
name('VF_VALIDACION_RESUMEN', f"'Validación'!$B${CKN+2}")

# =====================================================================
# 6. FUENTES (registro de insumos)
# =====================================================================
ws = wb.create_sheet('Fuentes')
title(ws, 'FUENTES — registro de insumos del modelo integrado', 'Tipo: Observado (dato publicado) · Supuesto (decisión del analista con sustento) · Pendiente (input heredado sin fuente verificada).')
widths(ws, {'A': 36, 'B': 30, 'C': 16, 'D': 14, 'E': 14, 'F': 12, 'G': 70})
hdr(ws, 5, ['Insumo', 'Dónde se usa', 'Valor', 'Fecha', 'Unidad / moneda', 'Tipo', 'Fuente'])
reg = [
    ('Inflación INPC quincenal', 'Inflación!A60:B172', '113 obs.', '07-oct-2026', '% anual', 'Observado', 'Banco de México, serie SP74833 (vía ' + F_INFL + ')'),
    ('Escenario Base 3.51%', 'Inflación!B48', '3.51%', '07-oct-2026', '% anual', 'Modelo', 'Modelo exponencial trimestral de clase (calculado en Inflación!33)'),
    ('Escenario Cautela 3.26%', 'Inflación!B47', '3.26%', '07-oct-2026', '% anual', 'Supuesto', 'Dossier de Soriana / Avances (referencia de tendencia larga)'),
    ('Escenario Alcista 4.00%', 'Inflación!B49', '4.00%', '—', '% anual', 'Supuesto', 'Avances de valuación intrínseca (escenario alcista)'),
    ('Trayectoria Citi 2026–2030', 'Inflación!B9:F9', '3.93/3.83/3.75%', '22-sep-2026', '% anual', 'Observado', 'Encuesta Citi de Expectativas (comentario original de Proyección Final!C10)'),
    ('Beta desapalancada sectorial', 'WACC!B9', '0.80', '—', 'x', 'Pendiente', 'Input heredado (Material Maestro, "Sesión 2"); sin fuente verificada. Referencia Damodaran global ene-2026 0.65 no verificada.'),
    ('Kd antes de impuestos (iteración)', 'Proyección Final!C61', '10.00%', '22-sep-2026', '%', 'Supuesto', 'Encuesta Citi (tasa Banxico 6.50%) y gastos financieros 1S26 (comentario original de C61). Verificación: intereses 1S26 anualizados / deuda 2T26 = 9.9%.'),
    ('Rf Bono M 10 años', 'WACC!B5', '9.517%', '—', '%', 'Pendiente', 'Input heredado; fecha y fuente exacta pendientes.'),
    ('Prima de riesgo de mercado', 'WACC!B6', '4.23%', '—', '%', 'Pendiente', 'Input heredado ("madura"); fecha y fuente exacta pendientes.'),
    ('Crecimiento perpetuo g', 'Proyección Final!B123', '3.50%', '—', '%', 'Pendiente', 'Input heredado; no ligado a la inflación (sin sustento documental).'),
    ('Múltiplos de comparables', 'Trading Comps', '10 empresas', '30-jun-2026', 'x', 'Observado', 'S&P Capital IQ, ' + F_COMPS),
    ('Transacciones', 'Precedent Transactions', '3 operaciones', '—', 'x / MXN mm', 'Observado', 'S&P Capital IQ, ' + F_TRANS),
    ('Métricas LTM y balance 2T26 de Soriana', 'Trading Comps sección 2', 'mdp', '30-jun-2026', 'MXN', 'Observado', 'Hoja Datos (reportes trimestrales de Soriana)'),
    ('Pesos de la combinada', 'Valuación Combinada!C6:C8', '50/50/0', '—', '%', 'Supuesto', 'Regla de pesos iguales de la diap. 18 entre métodos activos; Transactions 0% por decisión del proyecto.'),
]
for k, row in enumerate(reg):
    for j, v in enumerate(row): ws.cell(6 + k, 1 + j, v).alignment = WRAP

# =====================================================================
# 7. INTEGRACIÓN: la inflación entra al DCF; etiquetas
# =====================================================================
pf = wb['Proyección Final Soriana']
for i, col in enumerate('CDEFG'):
    pf[f'{col}10'] = f"='Inflación'!{'BCDEF'[i]}13"
pf['A10'] = 'Inflación esperada (INPC) — escenario de la hoja Inflación'
pf['A257'] = '(−) FCF de 1S26 (CFO − Capex real = −1,060.5; al ser negativo, restarlo aumenta el EV)'
wb['WACC']['A9'] = 'Beta desapalancada del sector (input heredado; fuente pendiente — no es la beta histórica de Soriana)'
wb['WACC']['F9'] = 'Beta histórica del estudio (regresión): ver hoja Inflación, sección 6.'

# orden de hojas: nuevas al final, Fuentes primero de ellas
wb.calculation.fullCalcOnLoad = True
wb.save(OUT)
print('OK', OUT, {k: v for k, v in TC.items()}, PT, 'checks', CK0, CKN, 'beta row', INF_BETA_ROW)
