# Herramientas del Excel maestro

- `build_master.py`: construye el Excel maestro integrado a partir del Excel definitivo anterior y de los archivos fuente
  (modelo de inflación de clase, exports de S&P Capital IQ). Los exports de CIQ no se incluyen en el repositorio (licencia);
  el Excel maestro contiene solo los extractos necesarios, con atribución.
- `scenarios.py`: recalcula el libro en LibreOffice con cada escenario de inflación y llena la tabla de la hoja Validación.
- `extract_dataset.py`: lee el Excel maestro (y lo recalcula por escenario) y genera `src/data/soriana.excel.ts`.

Todos se ejecutan con `python3 -I` y requieren `openpyxl`, `xlrd` y LibreOffice (`soffice`).
