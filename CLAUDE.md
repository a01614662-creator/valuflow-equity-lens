# ValuFlow · notas para Claude Code

El dueño del proyecto no programa: explica los cambios en español sencillo y pide aprobación antes de cualquier
cambio que altere la arquitectura o el resultado financiero.

## Comandos
- `npm test` — obligatorio antes de terminar cualquier cambio. Incluye paridad contra el prototipo y validación contra el Excel.
- `npm run typecheck`, `npm run build`, `npm run dev`.

## Reglas
- **Excel = fuente maestra; ValuFlow = implementación.** Los números de Soriana salen de `src/data/soriana.excel.ts`, generado con
  `tools/excel/extract_dataset.py` desde `excel/`. No se editan a mano. `tests/excel-master.test.ts` exige Excel = app.
- Sin números mágicos, supuestos sin fuente, deslizadores sin rango documentado, conversiones de moneda sin fuente ni escenarios inventados.
- `src/engine/` es la única fuente de las fórmulas. No contiene datos de empresas ni código de interfaz.
- No cambies una fórmula sin aprobación explícita. `tests/parity.test.ts` exige resultados idénticos a `project/vf-engine.js` (con el dataset histórico de `tests/fixtures/`);
  si un cambio aprobado altera resultados, actualiza la prueba explicando por qué y vuelve a comprobar `tests/excel.test.ts`.
- Nada específico de una empresa en el motor ni en la interfaz: fechas, fuentes y textos van en el dataset (`labels`, `method`…)
  con valores por defecto en `src/engine/labels.ts`.
- `project/` es el prototipo original de Claude Design: solo referencia, no se edita (las pruebas lo leen).
- Las pantallas (`src/ui/pages/*.tsx`) solo dibujan; los textos y cálculos de presentación viven en `src/ui/viewmodel.ts`.
- Estado del importador en `App.tsx`: usa actualizaciones funcionales (`setState(s => …)`); React agrupa actualizaciones.
- Sin CDN ni Google Fonts: SheetJS (`xlsx`), jsPDF, jspdf-autotable, ExcelJS, JSZip y las fuentes (@fontsource) van en el paquete.
- Reportes: `src/report/snapshot.ts` (una instantánea por juego de supuestos) → `content.ts` (secciones; reutiliza las tablas de `src/ui/annex.ts` y `relative.ts`)
  → `src/services/pdf.ts`, `xlsx.ts`, `exporter.ts`. Pantalla y exportaciones usan los mismos supuestos activos.
- Cierre del proyecto (auditoría, reconciliación, transacciones, QA): `docs/CIERRE_PROYECTO.md`; cierre para regionales (recorrido 00–07, precio 30-jun-2026, ESG): `docs/RECORRIDO_REGIONAL.md`.
- No hay modo de diapositivas: la presentación es el recorrido por la app con Anterior/Siguiente, en este orden (`TOUR` en `App.tsx`;
  el número visible sale de la posición): 00 Acerca de · 01 ESG y Gobierno · 02 Valor · 03 Flujos · 04 Múltiplos · 05 Transacciones ·
  06 Costo de capital y sensibilidad · 07 Conclusión («Valor final»). Laboratorio es un botón aparte junto a Exportar (no numerado);
  Anexos, Valuaciones, Importar y Equipo van en «Más». Espacio y flechas no navegan.
- Logos: PNG locales en `public/assets/brands/`, registrados en `src/data/brands.json` (fuente, fecha, estado) y dibujados con
  `src/ui/components/BrandLogo.tsx` (nombre siempre visible; sin archivo → texto). Nunca hotlinks. Ver `docs/ASSETS_MARCA.md`.
- Textos de empresa para 00 y 07 viven en el dataset (`about`, `esg`) con fecha y fuente por cifra; sin calificaciones ESG inventadas.
- El QR se genera localmente (`src/services/qr.ts`, paquete `qrcode-generator`); el enlace sale de `DEMO_URL` en `src/config.ts` (`VITE_DEMO_URL` lo reemplaza).
