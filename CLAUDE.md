# ValuFlow · notas para Claude Code

Estudio individual (autor único: Francisco Aarón Ponce Flores · A01614662). No agregues a otras personas en ninguna parte.
El dueño del proyecto no programa: explica los cambios en español sencillo.

## Reglas
- **El Excel manda.** Las cifras salen de `excel/SORIANA_FINAL.xlsx` vía `scripts/build-dataset.py` → `src/data/soriana.final.ts`
  (generado; no se edita a mano). Si cambia el Excel: `npm run dataset` y `npm test`.
- `src/engine/` no conoce a Soriana: fórmulas y estadística genéricas. Datos y textos van en `src/data/`.
- Tolerancias de paridad: precio ±0.01 MXN, tasas ±0.01 pp, montos ±1 mdp (`tests/final.test.ts`, `tests/texts.test.ts`).
- Los textos con cifras viven en `src/data/soriana.texts.ts` con marcadores `{clave}` (`src/report/context.ts`).
- Pantalla, PDF, Excel y CSV salen del mismo contenido (`src/report/content.ts`) y de las mismas gráficas (`src/charts/svg.ts`).
- Sin CDN: jsPDF, jspdf-autotable, ExcelJS, JSZip y SheetJS van en el paquete.
- `tests/residue.test.ts` prohíbe residuos del Excel anterior y nombres de otros integrantes.

## Comandos
`npm test` (obligatorio), `npm run typecheck`, `npm run build`, `npm run build:standalone`, `npm run dataset`.
