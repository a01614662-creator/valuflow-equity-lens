"""Segundo paso: recalcula el libro con cada selector (0..3) en LibreOffice y escribe la tabla de escenarios en Validación C7:F13.
Uso: python3 -I scenarios.py <libro_openpyxl.xlsx> <workdir> <lo_profile_dir> <salida.xlsx>"""
import sys, os, subprocess, shutil, openpyxl
SRC, WD, PROF, OUT = sys.argv[1:5]
PF = 'Proyección Final Soriana'
ROWS = [('Inflación', 'B13'), (PF, 'B265'), (PF, 'B263'), (PF, 'B245'), (PF, 'B126'), (PF, 'G117'), (PF, 'G67')]
def recalc(path, outdir):
    os.makedirs(outdir, exist_ok=True)
    subprocess.run(['soffice', f'-env:UserInstallation=file://{PROF}', '--headless', '--calc', '--convert-to', 'xlsx', '--outdir', outdir, path], check=True, capture_output=True, timeout=300)
    return os.path.join(outdir, os.path.basename(path))
vals = {}
for s in range(4):
    wb = openpyxl.load_workbook(SRC); wb['Inflación']['B6'] = s
    p = os.path.join(WD, f'sel{s}.xlsx'); wb.save(p)
    r = openpyxl.load_workbook(recalc(p, os.path.join(WD, f'r{s}')), data_only=True)
    vals[s] = [r[sh][c].value for sh, c in ROWS]
    print(s, vals[s])
wb = openpyxl.load_workbook(SRC); ws = wb['Validación']
fmts = ['0.00%', '"$"#,##0.0000', '#,##0.0', '#,##0.0', '0.0000%', '#,##0.0', '#,##0.0']
for s in range(4):
    for k, v in enumerate(vals[s]):
        c = ws.cell(7 + k, 3 + s, v); c.number_format = fmts[k]; c.fill = openpyxl.styles.PatternFill('solid', fgColor='E2EFDA')
for k, (sh, c) in enumerate(ROWS): ws.cell(7 + k, 2, f"{sh}!{c}")
wb.calculation.fullCalcOnLoad = True
wb.save(OUT)
