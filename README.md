# ValuFlow · Equity Lens

Plataforma de valuación empresarial por flujos descontados (DCF) del proyecto de **Valuación de Empresas · Tecnológico de Monterrey**.
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
    analysis.ts  sensibilidad WACC×g, tornado, escenarios, comparación de métodos
    validate.ts  comprobaciones internas + comparación contra resultados de referencia (Excel)
    labels.ts    etiquetas que dependen de la empresa (fechas, fuentes), con valores por defecto
    types.ts     forma exacta de un "dataset" de empresa y de los supuestos
  data/        Empresas incluidas
    soriana.ts   datos del Excel "VALUACIÓN DEFINITIVA SORIANA"
    registry.ts  lista de empresas incluidas + revisión de estructura de un dataset
  services/    Importador (Capital IQ/XLSX/CSV), exportación (Excel/CSV/JSON/PDF), almacenamiento local, logo e investigación
  ui/          Pantallas (React). viewmodel.ts prepara lo que se muestra; pages/*.tsx solo dibuja
  config.ts    Equipo e institución
tests/         Pruebas automáticas (ver abajo)
project/       Prototipo original de Claude Design (referencia; las pruebas lo usan para comparar)
docs/          Guías: cómo agregar una empresa, notas del traspaso del diseño
```

## Garantías de precisión

`npm test` ejecuta 24 pruebas:

- **Contra el Excel**: las 34 comprobaciones de la capa de validación pasan (valor intrínseco **$31.16**, WACC iterado 11.88 %, Ke 13.95 %,
  FCF 2026E–2030E, EV, sensibilidad, escenario de supuestos constantes $34.44).
- **Contra el prototipo original**: el motor nuevo da resultados *idénticos* al de `project/vf-engine.js` en el caso base y en
  3,000 combinaciones aleatorias de supuestos (WACC iterado/mercado/manual, múltiplo, fecha de valuación, escenarios de error).
  Lo mismo para sensibilidad, tornado, escenarios y métodos.
- **Identidades financieras**: FCF = NOPAT + D&A − Capex − ΔNWC; EV = Σ VP(FCF) + VP(TV); el WACC iterado es un punto fijo.
- **Otra empresa**: un archivo tipo Capital IQ de una empresa ficticia se importa, se valúa y pasa la validación interna.

Diferencia conocida y documentada: el WACC iterado del motor converge a 11.8793 % y el del Excel a ≈11.877 % (diferencia de 0.002 pp).
Se refleja en ≈0.03 % del EV y en ≤ $0.01 por acción; todas las cifras quedan dentro de la tolerancia de redondeo.

## Agregar otra empresa

Ver [docs/DATASET.md](docs/DATASET.md).
