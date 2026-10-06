# ValuFlow · notas para Claude Code

El dueño del proyecto no programa: explica los cambios en español sencillo y pide aprobación antes de cualquier
cambio que altere la arquitectura o el resultado financiero.

## Comandos
- `npm test` — obligatorio antes de terminar cualquier cambio. Incluye paridad contra el prototipo y validación contra el Excel.
- `npm run typecheck`, `npm run build`, `npm run dev`.

## Reglas
- `src/engine/` es la única fuente de las fórmulas. No contiene datos de empresas ni código de interfaz.
- No cambies una fórmula sin aprobación explícita. `tests/parity.test.ts` exige resultados idénticos a `project/vf-engine.js`;
  si un cambio aprobado altera resultados, actualiza la prueba explicando por qué y vuelve a comprobar `tests/excel.test.ts`.
- Nada específico de una empresa en el motor ni en la interfaz: fechas, fuentes y textos van en el dataset (`labels`, `method`…)
  con valores por defecto en `src/engine/labels.ts`.
- `project/` es el prototipo original de Claude Design: solo referencia, no se edita (las pruebas lo leen).
- Las pantallas (`src/ui/pages/*.tsx`) solo dibujan; los textos y cálculos de presentación viven en `src/ui/viewmodel.ts`.
- Estado del importador en `App.tsx`: usa actualizaciones funcionales (`setState(s => …)`); React agrupa actualizaciones.
- SheetJS se carga desde su CDN en `index.html` (versión 0.20.3); el paquete `xlsx` de npm solo se usa en pruebas.
