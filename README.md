# ValuFlow · Estudio individual de Soriana

Aplicación del estudio individual de valuación intrínseca de **Organización Soriana (SORIANA B)**.

- **Autor:** Francisco Aarón Ponce Flores · A01614662 · Licenciatura en Finanzas
- **Institución:** Tecnológico de Monterrey, Campus San Luis Potosí
- **Materia:** Valuación de Empresas (Bloque de Valuación de Empresas) · Actividad Sesión 3: Valuación Intrínseca
- **Contexto:** Reto de Valuación de Empresas, Banamex × Tec de Monterrey

**El Excel manda.** Todas las cifras salen de `excel/SORIANA_FINAL.xlsx`. El script `scripts/build-dataset.py` lo lee con
openpyxl y genera `src/data/soriana.final.ts` (nada se teclea a mano). El motor de la app recalcula todo desde las series
crudas y los supuestos; los resultados del Excel solo se usan en las pruebas para comprobar que la app los reproduce.

| Resultado (escenario Base) | Valor |
|---|---|
| Valor por acción (DCF) | 39.21 MXN (+18.5% contra 33.10 MXN del 7-oct-2026) |
| Rango de escenarios | 32.12 (Conservador) a 47.74 MXN (Optimista) |
| WACC / Ke / g | 9.63% / 10.39% / 3.50% |
| Beta por regresión | 0.2178 (error típico 0.1269, p = 0.087, 258 semanas) |
| Precio combinado (50% DCF, 50% múltiplos) | 36.35 MXN |
| Recomendación (umbral ±15%) | COMPRAR (Base) · MANTENER (Conservador) |

## Comandos

Necesitas Node.js 20 o superior (y Python 3 con openpyxl solo para regenerar el dataset).

```bash
npm install                  # una sola vez
npm run dev                  # app en http://localhost:5173
npm test                     # paridad Excel = app, textos, Excel exportado y residuos
npm run build                # sitio estático en dist/ (Vercel, GitHub Pages, cualquier servidor)
npm run build:standalone     # un solo archivo dist-standalone/index.html que funciona sin internet
npm run dataset              # regenera src/data/soriana.final.ts desde excel/SORIANA_FINAL.xlsx
node tests/e2e/export.cjs <url> <carpeta> [--lab] [--offline]   # descarga PDF, XLSX y ZIP desde el navegador
```

## Organización

```
excel/SORIANA_FINAL.xlsx     Fuente única de las cifras
scripts/build-dataset.py     Excel → src/data/soriana.final.ts (series crudas, supuestos y resultados de referencia)
src/engine/                  Motor (sin datos de empresas): proyección por drivers, WACC iterado con Fisher, Gordon y múltiplo,
                             puente a la fecha de valuación, estadística (mínimos cuadrados, regresión con t y p), estudio de
                             inflación/precios/beta, escenarios, tornado, sensibilidad, crecimiento perpetuo y 15 comprobaciones
src/data/                    soriana.ts (acomoda el dataset), soriana.texts.ts (textos con {marcadores} de cifras vivas)
src/report/                  Contenido del estudio: mismas tablas, gráficas y textos para pantalla, PDF, Excel y CSV
src/charts/svg.ts            Gráficas en SVG puro (pantalla, PDF en PNG 2x, Excel y ZIP)
src/services/                pdf.ts (jsPDF + autotable), xlsx.ts (ExcelJS con fórmulas vivas), exporter.ts (ZIP, CSV, JSON y
                             cadena de descarga a prueba de bloqueos), importer.ts
src/ui/                      Pantallas React (Valor, Flujos, Riesgo, Múltiplos, Transacciones, Combinada, Estudio, Laboratorio,
                             Anexos, Autor)
tests/                       Pruebas automáticas
```

## Exportación

Botón **Exportar**: PDF (reporte completo o resumen ejecutivo, tamaño carta, con portada, índice, logos, pie con nombre y
matrícula y número de página), Excel de 13 hojas (la hoja *Proyección FCFF* calcula con fórmulas que leen *Supuestos*),
paquete ZIP (PDF, XLSX, un CSV por tabla, JSON y gráficas PNG + SVG), CSV y JSON. Todas las librerías van empaquetadas:
no se usa ninguna CDN y la exportación funciona sin internet. Si el navegador bloquea la descarga, la app intenta
"Guardar como", luego abrir el archivo en una pestaña nueva y después copiarlo; como último recurso muestra un panel con la razón.
