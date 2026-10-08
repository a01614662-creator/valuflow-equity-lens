# ValuFlow · Equity Lens

Plataforma de valuación empresarial (DCF, inflación, Trading Comps, Precedent Transactions y valuación combinada) del proyecto de **Valuación de Empresas · Tecnológico de Monterrey**.
El caso inicial es **Organización Soriana**, pero el motor no tiene nada específico de Soriana: cualquier empresa se puede valuar
cargando un archivo de Capital IQ / Excel / CSV, capturando datos a mano o importando un dataset `.json`.

## Cómo usarla

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install        # una sola vez
npm run dev        # abre la app en http://localhost:5173
npm test           # comprueba el motor contra el Excel y contra el prototipo original
npm run build      # genera la versión publicable en dist/
```

La carpeta `dist/` es un sitio estático: se puede publicar tal cual en GitHub Pages, Netlify, Vercel o cualquier servidor.

## Cómo está organizada

```
src/
  engine/      Motor de valuación (solo cálculo, sin pantallas, sin datos de empresas)
    model.ts     drivers → proyección FCFF → WACC (mercado / iterado / manual) → valor terminal → EV → Equity → valor por acción
    build.ts     proyección por drivers (réplica de la hoja Proyección Final): inflación → ventas → estados → balance → FCF
    inflation.ts modelos exponenciales de inflación de clase y escenarios documentados
    multiples.ts Trading Comps, Precedent Transactions y valuación combinada
    analysis.ts  sensibilidad WACC×g, tornado, escenarios de inflación, comparación de métodos
    validate.ts  comprobaciones internas + comparación contra resultados de referencia (Excel)
    labels.ts    etiquetas que dependen de la empresa (fechas, fuentes), con valores por defecto
    types.ts     forma exacta de un "dataset" de empresa y de los supuestos
  data/        Empresas incluidas
    soriana.ts   dataset de Soriana conectado al Excel maestro
    soriana.excel.ts  GENERADO desde el Excel maestro (tools/excel/extract_dataset.py)
    registry.ts  lista de empresas incluidas + revisión de estructura de un dataset
  services/    Importador (Capital IQ/XLSX/CSV), exportación (Excel/CSV/JSON/PDF), almacenamiento local, logo e investigación
  ui/          Pantallas (React). viewmodel.ts prepara lo que se muestra; pages/*.tsx solo dibuja
  config.ts    Equipo e institución
tests/         Pruebas automáticas (ver abajo)
excel/         Excel maestro integrado (fuente maestra del modelo)
tools/excel/   Scripts que construyen el Excel maestro y extraen sus datos para la app
project/       Prototipo original de Claude Design (referencia; las pruebas lo usan para comparar)
docs/          Guías: cómo agregar una empresa, notas del traspaso del diseño
```

## Garantías de precisión

`npm test` ejecuta 68 pruebas:

- **Excel maestro = app** (`tests/excel-master.test.ts`): en los cuatro escenarios de inflación la app reproduce la proyección
  (estados, balance, FCF), el WACC iterado, el EV, el equity y el precio del Excel con tolerancias de 1e‑9 a 1e‑12; también los modelos de
  inflación, la beta (Damodaran reapalancada), Trading Comps, Precedent Transactions y la valuación combinada. El baseline histórico
  **$31.164416** sale con la trayectoria Citi y la beta heredada 0.80. El Excel maestro pasa sus 39 controles.
- **Contra el prototipo original** (dataset histórico en `tests/fixtures/`): motor idéntico al de `project/vf-engine.js` en 3,000
  combinaciones aleatorias. Única diferencia aprobada: se retiraron los escenarios inventados pesimista/optimista.
- **Identidades financieras** y pruebas aleatorias de los métodos nuevos.

Resultados oficiales y decisiones: ver [docs/MODELO_INTEGRADO.md](docs/MODELO_INTEGRADO.md).

## Agregar otra empresa

Ver [docs/DATASET.md](docs/DATASET.md).
