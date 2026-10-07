# Modelo integrado: DCF + inflación + múltiplos (Excel maestro = ValuFlow)

**Fuente maestra:** `excel/EXCEL DEFINITIVO DE VALUACION DE SORIANA - MODELO INTEGRADO.xlsx`.
ValuFlow implementa el mismo modelo con tecnología: cada número del Excel se reproduce en la app
(`tests/excel-master.test.ts`, tolerancias de 1e‑9 a 1e‑12 en los cuatro escenarios de inflación).

## Resultados oficiales (supuestos base, inflación Base 3.51 %)

| Método | Precio por acción (MXN) | Peso | Rango |
|---|---|---|---|
| DCF (precio objetivo al 01‑oct‑2026) | **$30.83** | 50 % | $30.56 – $31.37 (escenarios de inflación) |
| Trading Comps (7 comparables, 3 múltiplos) | **$33.49** | 50 % | $27.03 – $40.07 (P25 – P75) |
| Precedent Transactions (referencia) | $40.73 | 0 % | $24.76 – $65.44 (mín – máx) |
| **Valuación combinada** | **$32.16** | | −3.9 % vs. precio $33.48 |

Memo con la regla de clase de pesos iguales (⅓ cada método): $35.02 (incluye la muestra de transacciones no defendible).

**Escenarios de inflación (DCF):** Citi (histórico) $31.16 · Cautela 3.26 % $30.56 · Base 3.51 % $30.83 · Alcista 4.00 % $31.37.
El baseline histórico **$31.164416** se reproduce exactamente con la trayectoria Citi.

## Qué se agregó al Excel (hojas nuevas)

- **Inflación**: selector de escenario (solo 4 valores documentados), datos Banxico SP74833 (113 quincenas), modelos
  exponenciales de clase calculados con fórmulas (`SLOPE`/`INTERCEPT`/`RSQ` sobre ln y), cadena de transmisión, estudio de mercado
  (beta histórica sin el factor ×10). La fila 13 alimenta `Proyección Final Soriana!C10:G10`.
- **Trading Comps**: 10 empresas de CIQ con clasificación y razón; muestra de 7 (Chedraui incluida; Grupo Mateus, Walmex, La Comer,
  Assaí, Cencosud e InRetail con reserva; Liverpool, FEMSA y Falabella excluidas). Múltiplos publicados por CIQ (sin recalcular ni
  convertir divisas), 6 estadísticos, puente EV → capital al 2T26, NM/NA, valor = promedio de precios a la media de EV/EBITDA, EV/EBIT y P/U.
- **Precedent Transactions**: 3 operaciones de CIQ con evaluación de criterios (ventana 3 años, geografía, ≥2 múltiplos, control).
  Valor con EV/EBITDA; advertencia visible. Peso 0 %.
- **Valuación Combinada**: pesos visibles (50/50/0) y regla de clase ⅓ como memo; rangos por método.
- **Validación**: tabla de escenarios y 29 controles independientes → **29 PASS de 29**.
- **Fuentes**: registro de insumos (Observado / Supuesto / Modelo / Pendiente).

Cambios en hojas existentes: `Proyección Final!C10:G10` ahora toma la inflación de la hoja Inflación; etiquetas corregidas
(A10, A257 "(−) FCF de 1S26 … al ser negativo, restarlo aumenta el EV", WACC!A9 beta sectorial heredada). Ninguna otra fórmula cambió.

## Cómo se regenera

```bash
# 1) Excel maestro (requiere los archivos fuente originales, incluidos los exports de CIQ, que no se redistribuyen)
python3 -I tools/excel/build_master.py <carpeta_fuentes> build/master.xlsx
python3 -I tools/excel/scenarios.py build/master.xlsx build/scen <perfil_libreoffice> build/master_final.xlsx
# 2) Datos de la app a partir del Excel (recalcula los 4 escenarios con LibreOffice)
python3 -I tools/excel/extract_dataset.py "excel/EXCEL DEFINITIVO DE VALUACION DE SORIANA - MODELO INTEGRADO.xlsx" src/data/soriana.excel.ts
npm test
```

## Decisiones metodológicas tomadas (menores, documentadas)

1. **Iteración del WACC:** el Excel itera 6 veces (filas 214–219); la app usa `wacc.iterations = 6` para igualarlo (antes iteraba hasta converger).
2. **Precisión completa:** el dataset ya no usa cifras redondeadas (Rf 9.517 %, Kd de mercado 13.0155 %, escudo fiscal 28.801 %, etc.);
   por eso el WACC de la app coincide con el del Excel (antes 11.8793 % vs 11.8773 %).
3. **EV/Ventas excluido** en Comps y Transactions: ignora el margen y los márgenes del grupo varían mucho (no es NM ni NA).
4. **Interés minoritario = 0 (NA en MXN):** CIQ lo reporta en USD (8.4 mm, ≈0.3 % del capital); convertirlo requeriría un tipo de cambio sin fuente.
5. **Fechas:** los múltiplos son al 30‑jun‑2026 (as‑of CIQ) y el puente al 2T26; el DCF está al 01‑oct‑2026. La metodología de clase no prevé
   llevar los múltiplos a la fecha del DCF; la diferencia queda documentada.
6. **Pesos 50/50/0:** regla de pesos iguales de la clase entre los métodos activos; Transactions 0 % por decisión del proyecto.
7. **Escenarios constantes:** Cautela, Base y Alcista se aplican igual a 2026–2030 (un pronóstico de un periodo extendido: supuesto documentado).
8. **Sin escenarios inventados:** se eliminaron los escenarios pesimista/optimista del prototipo (±0.5 pp WACC y g, etc.).
9. **Deslizadores:** solo donde el Excel define un rango de sensibilidad (Δ ventas ±2 pp, Δ margen ±0.5 pp, Δ capex ±0.5 pp, Δ tasa ±4 pp,
   g y WACC ±1 pp, múltiplo ±1x). Rf, PRM, βU, Kd y escudo fiscal se capturan como número, con su fuente.
10. **Un método con peso y sin precio** deja la combinada en NA (no se trata como cero, a diferencia de `SUMPRODUCT`).

## Limitaciones y pendientes (visibles en la app y en la hoja Fuentes)

- **Beta 0.80**: input heredado del Excel / Material Maestro, sin fuente verificada. Damodaran (global, ene‑2026, Retail Grocery & Food)
  reportaría 0.65 según un resumen de búsqueda, pero el sitio no fue accesible para verificarlo; no se usa.
- **Rf 9.517 %, PRM 4.23 % y g 3.5 %**: inputs heredados con fecha/fuente exacta pendiente.
- **Kd 10 %**: comentario original de la celda C61 (Encuesta Citi, tasa Banxico 6.50 %, gastos financieros 1S26); intereses 1S26
  anualizados / deuda 2T26 ≈ 9.9 %.
- **Inflación → WACC/g**: no hay relación documentada; con WACC nominal fijo, más inflación eleva el valor.
- **Transacciones**: 1 de 3 dentro de la ventana, ninguna en México, 2 con control dudoso; no es estadísticamente defendible.
