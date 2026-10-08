# Modelo integrado de Soriana: DCF + inflación + Trading Comps + Precedent Transactions

**Fuente maestra:** `excel/EXCEL DEFINITIVO DE VALUACION DE SORIANA - MODELO INTEGRADO.xlsx` (39 de 39 controles PASS).
ValuFlow implementa el mismo modelo. Las pruebas (`tests/excel-master.test.ts`) exigen Excel = app con tolerancias de 1e‑9 a 1e‑12.

Cadena trazable: **datos → metodología → fórmula → cálculo → resultado → validación**.

## 1. Resultados oficiales (inflación Base 3.51 %, βU Damodaran 0.65; precio de mercado $33.48 al 25‑sep‑2026)

| Método | Precio por acción (MXN) | Peso | Rango | vs. precio |
|---|---|---|---|---|
| DCF (precio objetivo al 01‑oct‑2026) | **$32.41** | 50 % | $32.13 – $32.98 (Cautela – Alcista) | −3.2 % |
| Trading Comps (7 comparables · EV/EBITDA, EV/EBIT, P/U) | **$33.49** | 50 % | $27.03 – $40.07 (P25 – P75) | +0.0 % |
| Precedent Transactions (referencia) | $40.73 | 0 % | $24.76 – $65.44 (mín – máx) | +21.6 % |
| **Valuación combinada (valor oficial)** | **$32.95** | 100 % | | **−1.6 %** |

| DCF por escenario de inflación | Precio |
|---|---|
| Cautela 3.26 % (escenario derivado de la tendencia larga) | $32.13 |
| **Base 3.51 % (forecast / resultado de modelo)** | **$32.41** |
| Alcista 4.00 % (supuesto de escenario, no es pronóstico estadístico) | $32.98 |
| Trayectoria Citi — Referencia (no es escenario) | $32.76 |
| Baseline histórico (Citi + βU 0.80) | $31.16 (se reproduce exactamente: $31.164416) |

Memo con la regla de clase de pesos iguales (⅓ cada método): $35.55 (incluye la muestra de transacciones no defendible).

**Del baseline $31.16 al DCF oficial $32.41:** inflación Base en lugar de Citi −$0.33 ($31.16 → $30.83 con βU 0.80) y beta
Damodaran +$1.58 ($30.83 → $32.41). WACC iterado 11.87 % → 11.35 %; Ke 13.96 % → 13.06 %; βL iterada 1.051 → 0.838.

## 2. Qué cambió en el Excel

Hojas nuevas: **Inflación**, **Beta y Kd**, **Trading Comps**, **Precedent Transactions**, **Valuación Combinada**, **Validación**, **Fuentes**.

- **Inflación:** serie Banxico SP74833 (113 quincenas), modelos exponenciales de clase con fórmulas (`SLOPE`/`INTERCEPT`/`RSQ` sobre ln y),
  tres escenarios oficiales (selector 1–3; Base por defecto) y la trayectoria Citi como referencia (selector 0). La fila 13 alimenta
  `Proyección Final Soriana!C10:G10`. Estudio de mercado con la beta histórica (sin el factor ×10).
- **Beta y Kd:** datos de Damodaran (Betas by Sector, Global, enero 2026, Retail (Grocery and Food): 215 empresas, βL 0.87, D/E 45.96 %,
  t marginal 25.37 %, βU 0.65; corregida por caja 0.69), control de desapalancamiento, selector de beta (1 = Damodaran oficial,
  0 = heredada 0.80 solo para el histórico), reapalancamiento con la estructura de Soriana, impacto registrado y sección de Kd.
- **Trading Comps / Precedent Transactions:** muestra, criterios, múltiplos publicados por CIQ, 6 estadísticos, precio implícito,
  detalle múltiplo → EV → Equity → precio, NM/NA y valor del método. Transactions con industria y evaluación de criterios.
- **Valuación Combinada:** pesos 50/50/0 editables; **deben sumar 100 %** (si no, el resultado muestra el mensaje); columna "¿Contribuye?".
- **Validación:** tabla A con 6 combinaciones recalculadas (Histórico, Referencia Citi, Cautela, Base, Alcista, Base con βU 0.80) y 39 controles.
- **Fuentes:** registro de insumos (Observado / Modelo / Supuesto / Referencia / Pendiente) y notas metodológicas.

### Fórmulas que cambiaron en hojas existentes
| Celda | Antes | Ahora |
|---|---|---|
| `Proyección Final Soriana!C10:G10` | valores de la Encuesta Citi | `='Inflación'!B13:F13` (escenario seleccionado) |
| `WACC!B9` | 0.80 capturado | `='Beta y Kd'!B28` (βU seleccionada: Damodaran 0.65) |
| Etiquetas `Proyección Final!A10`, `A257`, `WACC!A9` | — | Texto corregido (A257: el FCF de 1S26 fue −1,060.5; restarlo aumenta el EV) |

### Fórmulas que NO cambiaron
Toda la mecánica del DCF: proyección por variables externas + mínimos cuadrados, estados financieros, FCFF, iteración del WACC (6 filas),
Hamada, CAPM, valor terminal 50 % Gordon / 50 % múltiplo, traslado a la fecha de valuación y el tratamiento del FCF de 1S26 (B257).

## 3. Qué cambió en la aplicación

- **Motor** (`src/engine`): proyección por drivers (réplica de Proyección Final), modelos de inflación, Trading Comps, Precedent Transactions y
  combinada (`multiples.ts`), WACC con 6 iteraciones como el Excel, datos con precisión completa generados desde el Excel
  (`src/data/soriana.excel.ts`, por `tools/excel/extract_dataset.py`).
- **Pantallas:** 04 Múltiplos (Trading Comps), 05 Transacciones, 06 Combinada; Laboratorio con el modelo de inflación (gráfica, cadena
  datos → precio, modelos y transmisión); Riesgo con la beta (fuente, reapalancamiento, impacto) y los escenarios oficiales + referencia Citi;
  anexos de inflación, beta/Kd, registro de insumos y notas metodológicas.
- **Trazabilidad:** cada resultado tiene su cadena "¿De dónde salió este número?" (comparable/transacción → múltiplo → estadístico → métrica →
  EV → Equity → precio; datos → modelo → forecast → escenario → inflación → ventas → FCF → EV → Equity → precio; contribución por método).
- **Controles de entrada:** muestra y múltiplos con Sí/No; pesos editables que deben sumar 100 %; escenarios solo documentados; deslizadores
  solo con rango del Excel; Rf, PRM, βU, Kd y escudo fiscal como números con su fuente.
- **Eliminado:** escenarios inventados pesimista/optimista y la etiqueta "FCF generado +1,061".

## 4. Metodología

- **DCF principal:** el de ValuFlow (fin de periodo, 50 % Gordon / 50 % múltiplo de salida, WACC iterado, traslado a la fecha de valuación).
  La metodología de Capital IQ (mid‑year, exit multiple) queda documentada solo como referencia.
- **Beta:** βU sectorial reapalancada con Hamada: βL = βU × [1 + (1 − t) × D/E]. Se elige la βU (no la βL 0.87) porque el modelo reapalanca
  con la estructura de Soriana; usar 0.87 aplicaría el apalancamiento dos veces. Se usa la βU sin corrección por caja porque Damodaran desapalanca
  con D/E bruta y el modelo reapalanca con deuda bruta; la caja se suma en el puente.
- **Inflación:** solo por el canal documentado inflación → crecimiento nominal de ventas → proyección → FCFF → valuación. Sin relación con WACC, beta ni g.
- **Múltiplos:** metodología de la presentación de clase (CIQ Valuations): percentiles inclusivos, puente EV → capital, NM/NA, promedio a la media.
- **Combinada:** Σ (peso × precio) con pesos que suman 100 %.

## 5. Fuentes

Banxico SP74833 (inflación) · Encuesta Citi de Expectativas 22‑sep‑2026 (referencia Citi; Kd) · Damodaran, Betas by Sector (Global), enero 2026 ·
S&P Capital IQ (múltiplos al 30‑jun‑2026 y transacciones; extractos con atribución) · Dossier y Avances de valuación (escenarios Cautela y Alcista) ·
libro de clase de inflación · reportes trimestrales de Soriana (hoja Datos) · presentación de clase de múltiplos y transacciones.

## 6. Supuestos que permanecen

g 3.5 %, Rf 9.517 %, PRM 4.23 % (inputs heredados con fecha/fuente exacta pendiente); Kd 10 % (Citi + gastos 1S26; control 9.86 %);
escenarios constantes 2026–2030; pesos 50/50/0; interés minoritario 0 (solo existe en USD; convertirlo requeriría un tipo de cambio sin fuente).

## 7. Limitaciones

- Valores de Damodaran transcritos de la fuente indicada; el sitio no fue accesible desde el entorno de construcción, por lo que se incluye
  un control de consistencia interna (0.87 desapalancada = 0.648 ≈ 0.65).
- Más inflación eleva el valor porque el WACC nominal no cambia (no hay relación documentada).
- Múltiplos al 30‑jun‑2026 vs. DCF al 01‑oct‑2026 (la metodología de clase no prevé ajustarlo).
- Transacciones: 1 de 3 dentro de la ventana, ninguna en México, 2 con control dudoso (peso 0 %).
- Beta histórica de regresión con R² ≈ 0: no se usa.

## 8. Cómo se regenera

```bash
python3 -I tools/excel/build_master.py <carpeta_fuentes> build/master.xlsx     # requiere los archivos fuente (CIQ no se redistribuye)
python3 -I tools/excel/scenarios.py build/master.xlsx build/scen <perfil_libreoffice> build/master_final.xlsx
python3 -I tools/excel/extract_dataset.py "excel/EXCEL DEFINITIVO DE VALUACION DE SORIANA - MODELO INTEGRADO.xlsx" src/data/soriana.excel.ts
npm test
```
