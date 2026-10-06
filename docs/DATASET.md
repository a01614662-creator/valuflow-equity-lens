# Cómo valuar otra empresa

Hay tres caminos. Los tres usan el mismo motor; ninguno requiere programar fórmulas.

## 1. Desde la aplicación (recomendado)

**+ Nueva valuación** → arrastra la exportación de Capital IQ (XLS/XLSX/CSV) → revisa el mapeo de cada campo →
captura Rf, PRM, beta y g (nunca se infieren) → **Crear valuación**. La valuación queda guardada en el navegador y
se puede exportar como `.json` (botón **Exportar → Dataset ValuFlow**) para abrirla en otra computadora.

Las valuaciones importadas usan supuestos constantes por año (crecimiento, margen, tasa, D&A y capex como % de ventas)
y todo se puede ajustar en el **Laboratorio**.

## 2. Importar un dataset `.json`

**Mis valuaciones → Importar dataset (.json)**. Antes de aceptarlo, la app revisa que tenga lo mínimo que el motor
necesita (`checkDataset` en `src/data/registry.ts`) y explica qué falta.

## 3. Incluirla "de fábrica" (como Soriana)

Útil cuando se tiene un Excel completo con proyección por año, anexos y resultados de referencia.

1. Copia `src/data/soriana.ts` a `src/data/<empresa>.ts` y reemplaza los datos.
2. Agrégala a `BUILT_IN` en `src/data/registry.ts`.
3. Si incluyes `expected` (resultados del Excel), la pestaña **Anexos → Validación** comparará el motor contra ellos.
4. Ejecuta `npm test`.

### Campos principales del dataset

| Campo | Qué es | ¿Obligatorio? |
| --- | --- | --- |
| `profile` | Nombre, ticker, moneda, unidades (`mdp` o `mm`), sector, logo | nombre y moneda |
| `dates` | Fecha base, de valuación y del precio | sí |
| `market` | Precio y acciones en circulación; opcionales: consenso, rango 52 semanas… | precio y acciones |
| `forecast` | `baseYear`, `years` y **una** de dos formas de proyectar: `rows` (filas por año del Excel; los drivers se derivan) o `drivers` (porcentajes constantes o por año) | sí |
| `wacc` | Rf, PRM, βU, Kd, tasa del escudo fiscal (en puntos: 9.52 = 9.52 %), deuda | sí |
| `valuation` | `g`, múltiplo de salida y peso Gordon, puente (`bridge`: deuda, arrendamientos, efectivo), `roll` para llevar el valor a la fecha de valuación | `g` y `bridge` |
| `labels` | Textos que dependen de la empresa: `closeDate` ("cierre de 2025"), `rollDate` ("2T26"), `rollFcf` ("1S26"), `rfSource` ("Bono M 10 años"), `sourceShort` ("Excel") | no (hay valores por defecto) |
| `altForecasts` | Proyecciones alternativas (p. ej. supuestos constantes) | no |
| `expected` | Resultados de referencia para la validación | no |
| `method`, `annex`, `ratios`, `governance`, `timeline`, `dividends`, `discrepancies`, `sources` | Contenido de los anexos y de la ficha de empresa; cada sección aparece solo si el dato existe | no |

Los porcentajes de supuestos se escriben en puntos (12.5 = 12.5 %); los drivers de proyección, como fracción (0.035 = 3.5 %).
Una razón exacta del Excel se puede escribir como texto `'r:7552/177515'` para no perder precisión.
