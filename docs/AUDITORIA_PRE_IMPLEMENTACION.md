# ValuFlow Equity Lens — Audit Report pre-implementación

Fecha: 7-oct-2026 · Alcance: Excel maestro, modelo de inflación, datos de Capital IQ (múltiplos y transacciones), presentación de clase, dossier, avances, instrucciones de la tarea y aplicación (repositorio `a01614662-creator/valuflow-equity-lens`, commit `4944316`).
Estado: **diagnóstico. No se modificó código, Excel ni datos.**

Archivos revisados (todos completos, celda por celda en los Excel):

| Archivo | Qué es | Hallazgo clave |
|---|---|---|
| EXCEL DEFINITIVO (10 hojas) | Modelo maestro | Contiene **tres** DCF distintos; el marcado como final da **$31.16** |
| MODELO DE INFLACIÓN (2 hojas) | Inflación, correlaciones, beta, IPC | Beta ×10, un pronóstico con exponente redondeado, un "3.26%" que no sale de un modelo |
| MÚLTIPLOS (CIQ, 7 hojas) | 10 pares + Soriana, USD, as-of 30-jun-2026 | Múltiplos redondeados a 1 decimal; precio de Soriana vacío |
| TRANSACCIONES (CIQ) | 3 operaciones | Solo 1 dentro de la ventana de 3 años; ninguna en México |
| VALUACIÓN POR MÚLTIPLOS (previo) | Intento anterior (solo referencia) | Convierte USD→MXN con un tipo de cambio implícito de 19.20 no defendible |
| Presentación de clase (22 diapositivas) | Metodología CIQ Valuations | Reglas claras: media por múltiplo → precio; promedio simple; pesos iguales; NM/NA |
| Dossier, Avances, Instrucciones | Contexto | "Avances" es en buena parte una **propuesta** (no resultados del estudio) |

---

## 1. Reconciliación $31.16 vs $34.44

**Conclusión: ambos valores son cálculos correctos dentro del mismo Excel, pero corresponden a modelos distintos. El propio Excel designa como resultado final $31.16** (`Proyección Final Soriana!B265`, rotulado "PRECIO OBJETIVO FINAL POR ACCIÓN"). $34.44 es el DCF preliminar de la hoja `Valuación`.

| # | Concepto | $34.44 — `Valuación!B41` | $31.16 — `Proyección Final Soriana!B265` |
|---|---|---|---|
| 1 | Insumos | Ventas 2025A, margen, D&A, capex constantes (% de 2025) | Proyección integrada (EdoRes + balance), ponderando variables externas y mínimos cuadrados |
| 2 | Fecha de valuación | Cierre 2025 (implícita) | 01-oct-2026 (llevada desde el cierre 2025 vía 2T26) |
| 3 | Precio de mercado | 33.48 (25-sep-2026) | 33.48 (25-sep-2026) |
| 4 | WACC | **12.50 %** (a valor de mercado) | **11.88 %** (iterado al valor DCF) |
| 5 | Beta | βU 0.80 → βL 1.019 | βU 0.80 → βL 1.048 (D/E del DCF) |
| 6 | Rf | 9.517 % (Bono M 10a) | igual |
| 7 | PRM | 4.23 % | igual |
| 8 | Deuda | 23,618 (bancaria 11,500 + arrend. 12,118, dic-25) | Cierre: 23,618; puente final: 11,500 + 12,220.6 (2T26) |
| 9 | Efectivo | 9,295 (dic-25) | 9,295 (cierre) / 6,875.4 (2T26) |
| 10 | Acciones | 1,800 mm | 1,800 mm |
| 11 | Crecimiento ventas | 3.5 % constante | −4.21 %, −1.32 %, +1.01 %, +2.20 %, +2.94 % |
| 12 | FCFF 2026E–2030E | 6,869 → 7,882 | 6,048 → 6,470 |
| 13 | Capex | 1.62 % de ventas | 2.26 % → 1.97 % |
| 14 | Capital de trabajo | 2.08 % del incremento en ventas | Días de inventario y % de ventas (balance) |
| 15 | Valor terminal | Gordon, g 3.5 % → 90,637 | 50 % Gordon (79,935) + 50 % múltiplo 5.81x EBITDA (72,004) |
| 16 | Descuento | Fin de año, n = 1…5 | Fin de año; luego ×(1+WACC)^0.5 y ×(1+Ke)^0.2528 |
| 17 | Periodo/escala | mdp, MXN | mdp, MXN (sin diferencias de escala) |
| 18 | Resultado | EV 76,314 → Equity 61,991 → **$34.44** | EV pond. 66,236 → EV 2T26 71,119 → Equity 56,096 → **$31.16** |

Puente de $34.44 a $31.16 (aproximado, por efecto): proyección final de flujos y WACC iterado llevan Gordon a **$30.10**; el múltiplo de salida baja a **$28.84** (ponderado al cierre 2025); llevar el valor a la fecha de valuación lo sube a **$31.16**.

La aplicación reproduce $31.16 con 34/34 comprobaciones y también reproduce $34.44 (escenario "supuestos constantes"). La aplicación no estaba mal respecto al Excel; **sin embargo, la auditoría encontró un error en el paso que lleva el valor a la fecha de valuación** (sección B-1), presente en ambos.

**Baseline oficial propuesto** (sujeto a la decisión D2): estructura de `Proyección Final Soriana`. Con la corrección del doble conteo, el valor pasa de **$31.16 a $29.94** por acción. No se adopta hasta tu aprobación.

---

## A. Lo que está correcto

1. **Mecánica DCF del modelo final**: FCFF = EBIT(1−t) + D&A − Capex − ΔNWC; descuento 1/(1+WACC)^n; Gordon con FCF₂₀₃₁ = FCF₂₀₃₀(1+g); CAPM; beta de Hamada; WACC con pesos D/(D+E). Verificado celda por celda.
2. **Iteración del WACC**: sin referencias circulares (6 iteraciones desenrolladas), converge a 11.8773 % (variación final 0.0009 pb).
3. **Balance proyectado cuadra** (activo − pasivo − capital = 0 en 2025A–2030E) y la conciliación de efectivo es consistente.
4. **Sensibilidad del Excel** es coherente con el resultado central (`D165 = B150`).
5. **`#NAME?` no son errores del modelo.** Recalculé ambos libros con un motor distinto (LibreOffice, recálculo forzado): 3,889 celdas numéricas idénticas y cero errores. Causas probables al verlo en otros visores: (a) las 31 fórmulas matriciales con `SUMPRODUCT` del maestro (iteración y sensibilidad), (b) `_xlfn.STDEV.S` y `_xlfn.NORM.S.DIST` del libro de inflación, funciones de Excel 2010+ que algunos lectores no reconocen. No hay referencias rotas ni circularidades.
6. **La aplicación** reproduce el Excel final (34/34) y es idéntica al prototipo en 3,000 combinaciones de supuestos.
7. **Inflación 3.51 %** es reproducible: modelo quincenal 3.9951e^(−0.005x) → 3.504 %; modelo trimestral 4.0302e^(−0.0277x) → 3.509 %.
8. **Datos de Capital IQ** internamente consistentes: las estadísticas excluyen a Soriana; el TEV de CIQ incluye arrendamientos, igual que el puente del DCF (deuda total CIQ 1,320.1 USD mm ≈ 23,7xx mdp).
9. **Metodología de clase** clara y completa para implementar (selección, 6 estadísticos, puente, media por múltiplo, promedio simple, pesos iguales, NM/NA, filtros de transacciones).

## B. Lo que está incorrecto

| # | Dónde | Error | Evidencia | Efecto |
|---|---|---|---|---|
| B-1 | Excel `Proyección Final!B257–B258` y motor (`roll`) | **Doble conteo del FCF de 1S26.** El EV al cierre 2025 ya incluye el FCF de 2026 completo; al capitalizarlo a 2T26 hay que **restar** el flujo ya generado (ya está reflejado en el efectivo/deuda de 2T26), no sumarlo. | Fórmula actual `EV2 = EV×(1+WACC)^0.5 + 1,060.5` | $31.16 → **$29.94** (−$1.22) |
| B-2 | Libro de inflación `SORIANA!Y2` y dossier | **Beta 0.41 es 10× la regresión.** `=SLOPE(...)*10`. La pendiente real es **0.0415** (62 días, correlación 0.015, R² ≈ 0.0002). El dossier escala distinto covarianza (2.2871) y varianza (5.6067). | Recalculado desde los datos | No afecta hoy al WACC (usa βU 0.80), pero el dossier la reporta como resultado |
| B-3 | `INFLACION!T28` | **3.43 % por redondeo.** Usa exponente −0.006; el ajuste real es −0.0063 → **3.33 %**. Además la etiqueta dice `6.0882e^(−0.008x)` y la fórmula usa `5.8812e^(−0.006x)`. | Reajuste OLS de ln(y) | Escenario "ventana larga" incorrecto |
| B-4 | `INFLACION!S113` | **3.26 % no sale de un modelo**: es el promedio de 5 quincenas reales **más** el pronóstico 3.43 %. El modelo trimestral de la ventana (8.1183e^(−0.0486x)) proyecta **3.07 %**. | Fórmula `=AVERAGE(R113:R118)` con `R118=T28` | "Cautela" mal sustentado |
| B-5 | Dossier | Correlaciones no coinciden con el Excel: dossier 0.26/0.61/0.65/0.70; Excel 0.19 (23 meses) / 0.66 (ene–sep) / 0.60 (semestral) / 0.695 (trimestral): el valor de toda la ventana difiere y 6 m/9 m están invertidos. | `J4, J12, J17, J22` | Documental |
| B-6 | Dossier | "Precio objetivo 33.17 por el modelo lineal": en el Excel 33.17 = spot × (1 + rendimiento diario promedio); el IPC objetivo se **deriva** de ese precio, no al revés. | `AG6`, `AG7` | Interpretación causal invertida |
| B-7 | App, dataset | El dataset guarda las filas de la proyección **redondeadas a 1 decimal**: WACC 11.8793 % vs 11.8773 % del Excel; TV 79,916 vs 79,935. Las tolerancias de validación (±25 mdp en TV) lo ocultan. | Comparación iteración por iteración | ≤ $0.01 por acción, pero impide paridad exacta |
| B-8 | App | La proyección está **congelada** (filas fijas): ningún cambio de inflación puede llegar a ventas/costos/FCFF sin reconstruir la proyección como en el Excel. | `src/data/soriana.ts` | Bloquea el modelo de inflación |
| B-9 | App | **Escenarios pesimista/optimista inventados** (WACC ±0.5, g ±0.5, ventas ±1, margen ±0.25 combinados): no están en ningún documento. Rangos de los sliders del Laboratorio también arbitrarios. | `engine/analysis.ts`, `viewmodel.ts` | Viola el principio del proyecto |
| B-10 | Excel previo de múltiplos | Tipo de cambio 19.20 MXN/USD derivado de dividir el TEV en MXN de una transacción entre el TEV en USD de otra fecha. | `B118` | Resultado anterior (MXN 47.69) no defendible |
| B-11 | Excel `Valuación` (pares) | DCF de La Comer da $3.68 vs precio $32.08 (capex 8.1 % de ventas, D&A con decimales derivados); Walmex $22.96 vs $46.60. | Hoja `Valuación` filas 46–158 | Los DCF de pares no son confiables; no afectan a Soriana |
| B-12 | Excel `Datos` | Inconsistencia de 1 mdp: EBIT 7,552 vs 7,551 calculado; EBITDA 11,893 vs 11,894. | `Datos!G9` vs derivación | Menor |

## C. Lo que está ambiguo

1. **Fecha de valuación y precio**: DCF al 01-oct-2026 con precio 33.48 (25-sep); dossier usa spot 33.11 (06-oct); múltiplos CIQ as-of 30-jun-2026.
2. **Beta del WACC**: βU 0.80 "del sector" sin fuente en el Excel; la tarea pide beta por regresión contra el IPC; CIQ reporta beta 5 años de Soriana −0.23.
3. **g = 3.5 %** sin fuente explícita; coincide con inflación de largo plazo (crecimiento real cero).
4. **Inflación explícita del Excel** (`Proyección Final!C10:G10` = 3.93/3.83/3.75 %) sin fuente rotulada (probablemente encuesta Banxico); distinta del modelo de clase (3.51 %).
5. **Prima de riesgo país 2.46 %** listada como "referencia" pero no aplicada (defendible porque el Bono M ya está en pesos, pero no está escrito).
6. **Descuento de 10 % al múltiplo de salida** (5.81x) sin sustento escrito; ahora existen comparables CIQ con mediana EV/EBITDA 7.2x.
7. **Iteración del WACC** usa el equity de Gordon, pero el valor final pondera Gordon y múltiplo.
8. **FCF de 1S26 = CFO − Capex**: el CFO puede incluir intereses e impuestos reales; no es FCFF puro.
9. **Ajustes de "Variables Externas"**: el total (ventas −0.9 %, costos +0.52 %) no está vinculado a la proyección final; esta usa ajustes año por año capturados a mano (solo el capex sí está vinculado).
10. **Mínimos cuadrados** con 5 trimestres sin desestacionalizar (R² de ventas 0.148) pesan 15–30 %.
11. Reglas que la presentación de clase deja abiertas: umbral de muestra suficiente, interpolación de percentiles, trato de NM/NA al promediar, nivel geográfico exacto.
12. **"Avances"** se presenta como contexto, pero sus escenarios (Alcista 4.0 %), rangos de sliders y la fórmula `spot × (1 + beta × ΔIPC%)` son propuestas explícitas ("Esta fórmula es una propuesta mía"), no resultados del estudio.

## D. Decisiones que necesito de ti

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| D1 | Baseline | (a) Modelo final `Proyección Final` · (b) DCF preliminar `Valuación` | **(a)**: es el que el Excel declara final |
| D2 | Error B-1 (FCF 1S26) | (a) Corregir: restar el FCF → $29.94 · (b) Mantener y documentar | **(a)**, en Excel y app a la vez |
| D3 | Beta del WACC | (a) Mantener βU 0.80 y documentar su fuente (necesito que me digas cuál es) · (b) Usar beta por regresión corregida (0.04, no significativa) · (c) Recalcular la regresión con una ventana más larga (necesito datos) | **(a)** + presentar la regresión corregida como análisis de sensibilidad al mercado, documentando el error de 0.41 |
| D4 | Transmisión de inflación a flujos | (a) Sustituir la inflación explícita del Excel (fila 10, transmisión 1:1 a ventas nominales ya documentada en `Variables Externas`; costos, capex y capital de trabajo siguen como % de ventas → margen neutral) · (b) (a) + g ligada a la inflación de largo plazo · (c) Solo g | **(a)** y decidir (b) aparte |
| D5 | ¿El escenario Base cambia el baseline? | (a) Base = inflación del Excel (3.93/3.83/3.75) y los escenarios desplazan por diferencia · (b) Base = 3.51 % reemplaza la fila 10 (cambia $31.16/$29.94) | Preguntar; **(a)** preserva el baseline auditado |
| D6 | Coherencia nominal (Fisher) | (a) WACC fijo entre escenarios y documentar la limitación · (b) Ajustar Rf por Δinflación (no está en los documentos) | **(a)** |
| D7 | Valores de escenarios | Base 3.51 % (sustentado); Cautela 3.26 % (mal derivado; modelos reales: 3.33 % quincenal / 3.07 % trimestral); Alcista 4.00 % (sin fuente) | Mantener 3.51 %; para Cautela/Alcista elegir entre corregir con los modelos o documentar como supuestos del equipo |
| D8 | Grupo comparable | (a) 10 pares CIQ (incluye FEMSA, Liverpool, Falabella) · (b) 7 de "Consumer Staples / Food Retail" según la clasificación CIQ del propio archivo · (c) 3 mexicanos | **(b)**: criterio objetivo del archivo |
| D9 | Múltiplos | TEV/EBITDA LTM y NTM, TEV/EBIT LTM, P/E LTM y NTM, TEV/Ventas, P/TBV | Incluir EV/EBITDA, EV/EBIT, P/E; excluir TEV/Ventas (márgenes 4.5–14 %) y P/TBV (Sendas 17.1x, valor contable no explica valor en retail) |
| D10 | Precisión de múltiplos | (a) Recalcular con TEV/métrica de `Financial Data` (precisión completa) · (b) Usar los redondeados de CIQ | **(a)**, con el valor CIQ como control |
| D11 | Moneda | (a) Múltiplos (sin unidades) × métricas de Soriana en MXN del Excel, puente 2T26 en MXN · (b) Métricas CIQ en USD + tipo de cambio | **(a)**: evita tipo de cambio |
| D12 | Transacciones | (a) Usar las 3 del export documentando que no cumplen ventana/geografía · (b) Solo la de 2023 (n = 1) · (c) Obtener un export CIQ ampliado (industria → global) | **(c)** si puedes; si no, **(a)** documentado. Además revisar si InRetail 2019 (sin comprador, tamaño 4 % del TEV) es operación de control |
| D13 | Pesos combinados | Iguales (⅓) según clase · otros | **⅓** por defecto, editable y visible |
| D14 | Múltiplo de salida del DCF | (a) Mantener 5.81x (mediana 3 pares −10 %) · (b) Vincular a Trading Comps | **(a)** (preservar el DCF), documentar el 10 % o pedirte la fuente |
| D15 | Escenarios Conservador/Base/Optimista | ¿Qué varía además de la inflación? | Solo variables con sustento documentado |

## E. Qué debe conservarse

- Hojas históricas del Excel y la estructura de `Proyección Final Soriana` (modelo principal).
- Motor de la app (fórmulas DCF, WACC iterado, Gordon, múltiplo, puente), arquitectura multiempresa, pruebas de paridad, diseño visual.
- Valores reproducibles: inflación 3.51 %, correlaciones del Excel, datos CIQ.

## F. Qué debe reconstruirse

- **Excel**: hoja de inflación con regresiones calculadas en la hoja (`LN` + `LINEST/LOGEST`), no coeficientes copiados de gráficos; beta por `SLOPE` sin factores; Trading Comps, Precedent Transactions, Valuación Combinada, Escenarios, Validación y un registro de fuentes de insumos.
- **App**: proyección calculada desde drivers (replicando `Proyección Final`) para que la inflación pueda propagarse; módulos de inflación, comps, transacciones y combinada; escenarios documentados en lugar de los inventados; Laboratorio de inflación con la cadena causal visible.

## G. Arquitectura propuesta

**Excel maestro** (se conservan las 10 hojas; se agregan): `Fuentes` (registro: fuente, fecha, moneda, unidad, periodo, observado/supuesto) · `Inflación` (datos Banxico + modelos) · `Beta y Mercado` (correlaciones, regresión, IPC) · `Trading Comps` · `Precedent Transactions` · `Valuación Combinada` · `Escenarios` · `Validación` (controles PASS/FAIL).

**App**: `src/engine/` con un módulo por metodología: `dcf` (existente) · `projection` (nuevo) · `inflation` · `comps` · `transactions` · `combined` · `scenarios`. Datos por empresa: `src/data/soriana/` (perfil, proyección, comps, transacciones, inflación). Pruebas de paridad leyendo un archivo de resultados extraído **automáticamente** del Excel maestro.

## H. Plan de implementación (con puntos de aprobación)

| Fase | Trabajo | Punto de aprobación |
|---|---|---|
| 1–3 | Auditoría, reconciliación, baseline (este documento) | **Tus decisiones D1–D15** |
| 4 | Excel: correcciones aprobadas, inflación, beta, comps, transacciones, combinada, escenarios | Revisión del Excel |
| 5 | Validación del Excel (controles y recálculo independiente) | Resultados de validación |
| 6 | App: proyección por drivers, módulos nuevos, escenarios | — |
| 7 | Paridad Excel ↔ App automatizada | Reporte de paridad |
| 8 | UX: secciones nuevas y Laboratorio de inflación | Preview en Vercel |
| 9 | Pruebas finales (regresión, paridad, metodología, inflación, aleatorias) | — |
| 10 | Rama `development` → preview → `main` → producción | Tu visto bueno para producción |

Notas: el repositorio no tiene configuración de Vercel en el código (Vercel detecta Vite automáticamente). Para previews por rama necesito confirmar que el proyecto de Vercel está conectado al repositorio.
