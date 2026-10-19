# Cierre del proyecto de equipo · auditoría, reconciliación, transacciones y QA

Valuación de Organización Soriana (SORIANA B) · Tecnológico de Monterrey · Valuación de Empresas · 2026.
Equipo: Adrián Fermín Rodríguez Valades, Saúl González Loredo, Miguel Emilio Pérez García, Mauricio Fernandez Juarez y Francisco Aarón Ponce Flores.
Rama de trabajo: `cierre-equipo-pro` (parte de `main` 58e620f). No se hizo merge ni despliegue.

## 1. Fuentes y versiones

| Archivo | Papel | Estado |
|---|---|---|
| `excel/original/EXCEL FINAL PRO DEFINITIVO SORIANA.xlsx` | Excel PRO del equipo tal como se entregó | Sin cambios (SHA-256 idéntico al adjunto: `ab030e2f26dcfee6…`) |
| `excel/EXCEL FINAL PRO DEFINITIVO SORIANA - AUDITADO.xlsx` | Fuente maestra de la app | Generado por `tools/excel/audit_pro.py` y recalculado en LibreOffice; hojas nuevas *Contraste externo* y *Auditoría*; Validación: **49 PASS de 49** |
| `excel/historico/…MODELO INTEGRADO.xlsx` | Excel anterior del equipo | Solo histórico |
| GridExport_October_19_2026_9_29_57.pdf (LSEG/SDC) | Pantalla de transacciones | 166 operaciones; 23 evaluadas |
| Soriana_Reporte_Valuacion_CapitalIQ_Refinitiv.pdf | Reporte comparativo CIQ / Refinitiv | Solo contraste externo |
| App individual | Patrón de calidad de exportaciones | No se modificó su repositorio ni se importaron sus datos o nombres |

Reproducir: `python3 -I tools/excel/audit_pro.py <original.xlsx> <sdc_grid.json> <auditado.xlsx>` → recalcular → `python3 tools/excel/extract_dataset.py` → `src/data/soriana.excel.ts` (generado) → `npm test`.

## 2. Qué estaba mal y qué se corrigió (registro de cambios del Excel)

La hoja *Auditoría* del Excel auditado contiene este registro. "Revisado, sin cambio" = se auditó y se conserva.

| # | Hoja / área | Tipo | Hallazgo | Impacto | Corrección / decisión | Prueba |
|---|---|---|---|---|---|---|
| 1 | Transacciones SDC | Compatibilidad | Estadísticos con FILTER (Excel 365): en LibreOffice/Excel anterior dan #NAME? y n = 0. | El modelo de transacciones no se recalcula fuera de Excel 365. | Columnas auxiliares AE:AG y MIN/PERCENTILE/AVERAGE/MEDIAN. | Validación: controles SDC (fila 62 en adelante). |
| 2 | Transacciones SDC | Dato | La columna "EV (USD mm)" es el Enterprise Value at Announcement; la pantalla también trae el Rank Value (valor de la operación), que no estaba. | No se podía distinguir el tamaño de la operación de su EV. | Se muestran ambos por separado (USD mm) con equivalente MXN informativo. | Cotejo campo por campo contra la pantalla (19 + 4 operaciones). |
| 3 | Transacciones SDC | Error de dato | Operación 4172416040 rotulada "Chongqing Department Store / inversionista financiero". En la pantalla es Chengdu Hongqi Chain Co Ltd adquirida por Sichuan Shangtou Investment (Food & Beverage Retailing). | El motivo de exclusión ("formato departamental") no correspondía a la operación. | Se corrige la identidad y se reaplican los criterios: elegible (cambio de control). Efecto cuantificado en la sección 4. | Sección 4 de la hoja. |
| 4 | Transacciones SDC | Criterios | "Incluir" era un 1/0 capturado a mano, sin comprobar contra las columnas de criterios. | Riesgo de inconsistencia entre criterio y decisión. | Incluir = fórmula: ventana + ≥2 múltiplos + autoservicio + no recompra + juicio del analista (columna separada). | Controles de criterios en Validación. |
| 5 | Transacciones SDC | Cobertura | Cuatro operaciones de autoservicio de la pantalla no estaban evaluadas (YAOKO, Better Life/Bubugao, Wincommerce/WinMart, Prosol/Grand Frais). | Embudo de selección incompleto. | Se agregan con su motivo de exclusión (recompra, reestructura judicial, reorganización intragrupo, dato no confiable). | Filas marcadas "Agregada". |
| 6 | Transacciones SDC | Criterios | La ventana solo verificaba el inicio; no el fin (fecha de valuación). | Sin efecto en esta muestra. | Ventana = [inicio, fecha de valuación]. | Control de ventana. |
| 7 | Transacciones SDC | Estadística | El límite de atípicos solo era superior; la media sin atípicos no tenía mediana equivalente. | Tratamiento estadístico incompleto. | Límites inferior y superior (RIC) y mediana sin atípicos. | Sección 3. |
| 8 | Valuación Combinada | Metodología | La referencia de Precedent Transactions seguía siendo la muestra CIQ (3 operaciones, declarada no defendible). | El rango y la regla de ⅓ usaban un dato no defendible. | Referencia = mediana SDC auditada (peso 0%); CIQ como memo histórico. El precio combinado oficial no cambia. | Control "Combinada · PT = mediana SDC". |
| 9 | Proyección Final | Presentación | La tabla de sensibilidad (sección 7) mide el precio Gordon al cierre de 2025 (centro $29.19), no el precio objetivo final ($31.62). | Lectura equivocada del rango del precio objetivo. | Se rotula y se agrega la sección 12: sensibilidad del precio objetivo final (Ke fijo), igual a la de ValuFlow. | Control "centro = B265". |
| 10 | Validación | Validación | Filas 33–35 comparan contra valores registrados; la 34 compara un valor registrado consigo mismo (tautológica). | Aparentan ser pruebas independientes. | Se rotulan como controles de regresión. La tabla A se re-verificó recalculando las 6 combinaciones en LibreOffice: coinciden. | tools/excel/audit_checks.py. |
| 11 | Inflación | Presentación | Las etiquetas de ventana (C189:C192) usan TEXT(fecha,"mmm-yy"): en Excel en español el código "yy" no existe y se muestra literal ("nov-yy a sep-yy"). | Etiqueta ilegible; no afecta cálculos. | Se sustituye por una fórmula independiente del idioma (CHOOSE(MONTH) & año). | Recálculo: "nov-24 a sep-26". |
| 12 | Fuentes | Referencia | La fila de pesos apuntaba a "Valuación Combinada!C6:C8" (los pesos están en C4:C6) y no había registro de LSEG/SDC ni del contraste externo. | Trazabilidad incompleta. | Se corrige y se agregan 3 registros. | — |
| 13 | WACC / Beta | Cambio de supuesto (decisión del equipo, 19-oct-2026) | La βU oficial pasa de Damodaran 0.69 (corregida por caja) a la beta desapalancada de la regresión semanal de Soriana B contra el IPC: βL observada 0.2178 (p = 0.087, no significativa al 95%) desapalancada con D/E 23,618 / 59,580 y t 30% → βU 0.1705 (fórmula en Beta y Kd §2). Se reapalanca con la estructura de capital de este libro (WACC!B23 a mercado; D/E del DCF en la iteración), sin volver a usar la βL observada. | Resultados anteriores con βU 0.69 (para trazabilidad): DCF $31.62, Ke 13.35%, WACC iterado 11.38%, precio combinado $32.55, MANTENER. Los nuevos resultados salen de las fórmulas (tabla A, columna F). | Selector 'Beta y Kd'!B18 = 2 (regresión, oficial); 1 = Damodaran 0.69 (referencia, tabla A columna H); 0 = heredada 0.80 (histórico). | Tabla A recalculada en LibreOffice con cada combinación; control βU usada = selector. |
| 14 | DCF | Revisado, sin cambio | Secuencia ventas → EBIT → NOPAT → FCFF → WACC → VT (Gordon con FCF normalizado capex = D&A; múltiplo 5.81x) → EV → puente al 2T26 → Equity a la fecha de valuación. FCFF descontado al WACC (no se mezclan flujos al accionista). Balance cuadra; iteración converge. | — | Sin cambios. | Recálculo independiente y controles 23–32. |
| 15 | Fechas | Revisado, sin cambio | Fecha de valuación 01-oct-2026; precio 33.48 MXN del 25-sep-2026 (último cierre antes de la valuación); balance 2T26; comparables CIQ al 30-jun-2026; pantalla SDC 19-oct-2026; reporte comparativo 19-oct-2026 con precio 33.10 MXN del 7-oct-2026. | Cada fecha cumple una función distinta. | Se rotulan en cada salida; el precio nunca se presenta como "del día". | — |

**Qué se conservó:** la metodología del equipo (DCF FCFF con WACC iterado, valor terminal 50/50 Gordon–múltiplo, puente al 2T26, escenarios de inflación, Trading Comps CIQ y pesos 50/50 DCF–Comps). La auditoría de transacciones no cambió el precio objetivo. El único cambio de supuesto fue la beta (sección 10).

## 3. Transacciones precedentes (LSEG/SDC): tabla definitiva

Criterios: ventana de 3 años [01-oct-2023, 01-oct-2026], ≥ 2 múltiplos (EV/EBITDA, P/E, EV/Ventas), autoservicio/alimentos, sin recompra propia y juicio del analista "Elegible".
"Valor de la operación" = Rank Value de LSEG (incluye deuda neta del objetivo; no es la contraprestación). EV en MXN con 18.48 MXN/USD (el mismo tipo de cambio del reporte comparativo, capitalización 59,580 mdp ÷ 3,223.7 USD mm). **NA nunca se trata como cero.**

| Objetivo | Anuncio | País | Comprador | Valor operación (USD mm) | EV (USD mm) | EV (MXN mm) | EV/EBITDA | EV/Ventas | P/E | Decisión |
|---|---|---|---|---|---|---|---|---|---|---|
| Almacenes Exito SA | 2023-10-16 | Colombia | Cama Commercial Group Corp | 1,020.0 | 1,744.5 | 32,238 | 4.98x | 0.34x | NA | Incluida |
| Profi Rom Food Srl | 2023-10-30 | Romania | Koninklijke Ahold Delhaize NV | 1,703.4 | 1,711.7 | 31,632 | 21.3x | 0.69x | NA | Incluida |
| Lawson Inc | 2024-02-06 | Japan | KDDI CORP | 3,339.6 | 11,027.1 | 203,780 | 3.24x | 0.90x | 13.7x | Incluida |
| KANSAI FOOD MARKET LTD | 2024-05-15 | Japan | H2O RETAILING CORP | 234.3 | 700.3 | 12,941 | 7.64x | 0.28x | 18.5x | Incluida |
| Yonghui Superstores Co Ltd | 2024-09-23 | China (Mainland) | Guangdong Juncai International Trading Co Ltd | 889.3 | 5,614.1 | 103,748 | 12.8x | 0.53x | NA | Incluida |
| Sun Art Retail Group Ltd | 2025-01-01 | Hong Kong | Paragon Shine Ltd | 1,333.8 | 824.1 | 15,229 | 2.20x | 0.08x | NA | Incluida |
| METRO AG | 2025-02-05 | Germany | EP Global Commerce GmbH | 294.1 | 5,048.6 | 93,298 | 5.11x | 0.16x | NA | Incluida |
| Seiyu Co Ltd | 2025-03-05 | Japan | Trial Holdings Inc | 2,536.7 | 2,552.4 | 47,168 | NA | 0.69x | 3.88x | Incluida |
| Chengdu Hongqi Chain Co Ltd | 2023-12-21 | China (Mainland) | Sichuan Shangtou Investment Co Ltd | 182.3 | 957.3 | 17,692 | 4.97x | 0.67x | 13.4x | Incluida |
| Seven & i Holdings Co Ltd | 2023-11-30 | Japan | Seven & i Holdings Co Ltd | 747.1 | 23,898.3 | 441,640 | 3.36x | 0.31x | 11.1x | Excluida |
| Carrefour SA | 2024-03-26 | France | Carrefour SA | 395.5 | 25,430.6 | 469,957 | 5.16x | 0.28x | 11.6x | Excluida |
| Seven & i Holdings Co Ltd | 2025-04-09 | Japan | Seven & i Holdings Co Ltd | 4,101.7 | 57,481.8 | 1,062,264 | 8.74x | 0.78x | 17.4x | Excluida |
| J Sainsbury PLC | 2025-11-07 | United Kingdom | J Sainsbury PLC | 120.9 | 13,917.3 | 257,191 | 4.71x | 0.32x | 17.5x | Excluida |
| YAOKO Co Ltd | 2025-01-14 | Japan | YAOKO Co Ltd | 2,412.7 | 2,864.3 | 52,932 | 10.7x | 0.73x | 20.8x | Excluida |
| Magnit PJSC | 2023-10-10 | Russia | Magnit PJSC | 180.4 | 7,977.5 | 147,424 | 3.63x | 0.32x | 6.67x | Excluida |
| Gorodskoi Supermarket OOO | 2025-04-30 | Russia | Tander AO | 361.7 | 478.1 | 8,835 | NA | 0.45x | 44.8x | Excluida |
| Better Life Commercial Chain Share Co Ltd | 2024-04-09 | China (Mainland) | Investor Group | 345.7 | 2,318.3 | 42,841 | 46.0x | 5.64x | NA | Excluida |
| Wincommerce General Commercial Services JSC | 2024-09-04 | Vietnam | Masan Consumer Holdings Co Ltd | 200.0 | 2,951.1 | 54,537 | 323.1x | 2.45x | NA | Excluida |
| Prosol Gestion SAS | 2025-12-16 | France | Apollo Global Management Inc | 1,727.5 | 2,464.1 | 45,537 | NA | 44.5x | 33.8x | Excluida |
| Inageya Co Ltd | 2023-04-25 | Japan | AEON CO LTD | 170.1 | 463.8 | 8,570 | 10.3x | 0.24x | NA | Excluida |
| Casino Guichard-Perrachon SA | 2023-04-24 | France | Investor Group | 1,347.2 | 12,843.1 | 237,341 | 6.38x | 0.40x | NA | Excluida |
| Dia Portugal Supermercados SA | 2023-08-03 | Portugal | Auchan Retail Portugal Sa | 186.0 | 186.2 | 3,440 | 46.8x | 0.29x | NA | Excluida |
| Rimi Baltic AB | 2025-03-05 | Latvia | Salling Group A/S | 1,381.1 | NA | NA | NA | NA | 27.8x | Excluida |

### Exclusiones

| Objetivo | Ventana | ≥2 múlt. | Recompra | Motivo |
|---|---|---|---|---|
| Seven & i Holdings Co Ltd | Sí | Sí | Sí | Recompra propia: no hay cambio de control. |
| Carrefour SA | Sí | Sí | Sí | Recompra propia: no hay cambio de control. |
| Seven & i Holdings Co Ltd | Sí | Sí | Sí | Recompra propia: no hay cambio de control. |
| J Sainsbury PLC | Sí | Sí | Sí | Recompra propia: no hay cambio de control. |
| YAOKO Co Ltd | Sí | Sí | Sí | Recompra propia de YAOKO (supermercados, Japón): no hay cambio de control. |
| Magnit PJSC | Sí | Sí | Sí | Recompra propia en un mercado con sanciones (Rusia). |
| Gorodskoi Supermarket OOO | Sí | Sí | No | Rusia: valuaciones distorsionadas por sanciones; además sin EV/EBITDA. |
| Better Life Commercial Chain Share Co Ltd | Sí | Sí | No | Better Life Commercial Chain (Bubugao, supermercados de Hunan) en reestructura judicial: EV/EBITDA 46.0x y EV/Ventas 5.6x no representan una adquisición en marcha. |
| Wincommerce General Commercial Services JSC | Sí | Sí | No | Wincommerce (WinMart, Vietnam) adquirida por otra empresa del grupo Masan: reorganización intragrupo; EV/EBITDA 323.1x por EBITDA cercano a cero. |
| Prosol Gestion SAS | Sí | Sí | No | Prosol (Grand Frais, alimentos frescos) adquirida por Apollo. Sin EV/EBITDA y EV/Ventas 44.5x incongruente con un minorista de alimentos: dato no confiable. |
| Inageya Co Ltd | No | Sí | No | Fuera de la ventana de 3 años. |
| Casino Guichard-Perrachon SA | No | Sí | No | Fuera de la ventana; reestructura de deuda. |
| Dia Portugal Supermercados SA | No | Sí | No | Fuera de la ventana; EBITDA deprimido (46.8x). |
| Rimi Baltic AB | Sí | No | No | Solo 1 múltiplo disponible. |

### Estadísticos (percentiles inclusivos; atípicos fuera de P25 − 1.5·RIC y P75 + 1.5·RIC)

| Estadístico | EV/EBITDA | EV/Ventas | P/E | Precio EV/EBITDA (usado) | Precio EV/Ventas (referencia) |
|---|---|---|---|---|---|
| Mínimo | 2.20x | 0.08x | 3.88x | $5.08 | NM |
| Percentil 25 | 4.54x | 0.28x | 11.0x | $20.41 | $17.75 |
| Media | 7.78x | 0.48x | 12.4x | $41.67 | $37.33 |
| Mediana | 5.05x | 0.53x | 13.6x | $23.74 | $41.96 |
| Percentil 75 | 8.92x | 0.69x | 14.9x | $49.19 | $57.45 |
| Máximo | 21.3x | 0.90x | 18.5x | $130.47 | $77.78 |
| n | 8 | 9 | 4 |  |  |
| Límites de atípicos | -2.04x a 15.5x | -0.33x a 1.30x | 5.19x a 20.8x |  |  |
| Atípicos detectados | 1 | 0 | 1 |  |  |
| Media sin atípicos | 5.84x | 0.48x | 15.2x | $28.99 |  |
| Mediana sin atípicos | 4.98x | 0.53x | 13.7x | $23.32 |  |

Puente del múltiplo al precio: (múltiplo × EBITDA LTM 11,810.9 + ajuste neto −16,845.2) ÷ 1,800 mm de acciones. Mediana 5.05x → **$23.74**.

### Sensibilidad a las operaciones de juicio

| Muestra | n | Mediana EV/EBITDA | Precio (mediana) | Media sin atípicos | Precio (media sin atípicos) | Operaciones retiradas |
|---|---|---|---|---|---|---|
| Muestra auditada (oficial) | 8 | 5.05x | $23.74 | 5.84x | $28.99 | — |
| Sin Sun Art (empresa en dificultad) | 7 | 5.11x | $24.17 | 6.45x | $32.97 | Sun Art Retail Group Ltd |
| Sin participaciones no de control (Lawson 50%, Yonghui ~29%) | 6 | 5.05x | $23.74 | 4.98x | $23.32 | Lawson Inc, Yonghui Superstores Co Ltd |
| Sin Chengdu Hongqi (control no verificable en la pantalla) | 7 | 5.11x | $24.17 | 5.99x | $29.95 | Chengdu Hongqi Chain Co Ltd |

**Decisión de peso: 0% (referencia).** La muestra es global (sin operaciones mexicanas), de control mixto (Lawson 50%, Yonghui ~29%) y dispersa (P25–P75 $20.41–$49.19). Se calcula, se muestra y entra al rango de valor razonable, pero no al precio objetivo.

## 4. Reconciliación con S&P Capital IQ y LSEG Refinitiv

Cada fuente se compara contra su propio precio de referencia (el equipo: $33.48 del 25-sep-2026; el reporte comparativo: $33.10 del 7-oct-2026). Ninguna referencia externa entra al precio oficial.

| Fuente | Método | Fecha | Precio por acción | Rango | Precio de referencia | Diferencia | ¿Entra al precio oficial? |
|---|---|---|---|---|---|---|---|
| Modelo del equipo (este libro) | DCF (FCFF, 50% Gordon / 50% múltiplo, a la fecha de valuación) | 01-oct-2026 | $38.34 | $37.93 – $39.14 | $33.48 (25-sep-2026) | +14.5% | Sí (50%) |
| Modelo del equipo (este libro) | Trading Comps (7 pares CIQ, promedio de 3 múltiplos a la media) | 30-jun-2026 | $33.49 | $27.03 – $40.07 | $33.48 (25-sep-2026) | +0.0% | Sí (50%) |
| Modelo del equipo (este libro) | Precedent Transactions LSEG/SDC (mediana EV/EBITDA) | 19-oct-2026 | $23.74 | $20.41 – $49.19 | $33.48 (25-sep-2026) | −29.1% | No (0%, referencia) |
| Modelo del equipo (este libro) | Precedent Transactions CIQ (3 operaciones, media) | — | $40.73 | $24.76 – $65.44 | $33.48 (25-sep-2026) | +21.6% | No (histórico) |
| Modelo del equipo (este libro) | Valuación combinada (DCF 50% / Comps 50%) | 01-oct-2026 | $35.92 | — | $33.48 (25-sep-2026) | +7.3% | Sí (precio objetivo) |
| Modelo individual del autor del reporte (SORIANA_FINAL) | DCF | 07-oct-2026 | $39.21 | $32.12 – $47.74 | $33.10 (07-oct-2026) | +18.5% | No (otro modelo) |
| Modelo individual del autor del reporte | Valuación combinada (50% DCF / 50% comps) | 07-oct-2026 | $36.35 | — | $33.10 (07-oct-2026) | +9.8% | No |
| ValuFlow (app del equipo, versión anterior) | DCF | 01-oct-2026 | $31.16 | $25.91 – $37.56 | $33.48 (25-sep-2026) | −6.9% | No (histórico) |
| S&P Capital IQ (estimados de consenso; DCF construido por el autor) | DCF con estimados CIQ | 19-oct-2026 | $38.27 | $34.80 – $43.00 | $33.10 (07-oct-2026) | +15.6% | No |
| S&P Capital IQ | Múltiplos (Implied Valuation: promedio de medianas de 4 múltiplos, 10 pares) | 19-oct-2026 | $29.70 | $25.30 – $33.80 | $33.10 (07-oct-2026) | −10.3% | No |
| S&P Capital IQ | Transacciones (mediana 6.3x EV/EBITDA) | 19-oct-2026 | $28.54 | $21.91 – $59.30 | $33.10 (07-oct-2026) | −13.8% | No |
| S&P Capital IQ | Combinada (50% DCF consenso / 50% múltiplos) | 19-oct-2026 | $33.98 | — | $33.10 (07-oct-2026) | +2.7% | No |
| S&P Capital IQ | Precio objetivo de analistas (media; 7 analistas) | 19-oct-2026 | $23.36 | $18.50 – $30.00 | $33.10 (07-oct-2026) | −29.4% | No |
| LSEG Refinitiv | Precio objetivo de analistas (media; 7 analistas) | 19-oct-2026 | $22.42 | — | $33.10 (07-oct-2026) | −32.3% | No |
| LSEG Refinitiv · StarMine | Valor intrínseco StarMine (aprox.) | 19-oct-2026 | $51.00 | $49.50 – $52.50 | $33.10 (07-oct-2026) | +54.1% | No |

### Diferencias explicadas

| Tema | Fuente A | Fuente B | Se usa | Explicación |
|---|---|---|---|---|
| Beta del WACC (cambio del 19-oct-2026) | Antes: βU Damodaran 0.69 (corregida por caja), hoy referencia: $31.62 · WACC 11.38% | Ahora: βU 0.1705 (regresión semanal: βL observada 0.2178 desapalancada): $38.34 · WACC 9.56% | Regresión semanal desapalancada | Decisión del equipo. La βL observada se desapalanca con la estructura de la propia regresión (D/E 0.3964, t 30%) y se reapalanca con la del modelo; no se usa directamente. La pendiente no es significativa al 95% (p ≈ 0.09). |
| Valor por acción (DCF), versiones anteriores | ValuFlow anterior (Excel integrado, βU 0.65) · baseline histórico (Citi + βU 0.80): $32.41 · $31.16 | Excel PRO auditado con βU Damodaran 0.69 (oficial hasta el 19-oct-2026): $31.62 | Histórico (trazabilidad) | El PRO corrige la beta por caja (0.65 → 0.69), deja la tendencia de mínimos cuadrados crecer con la inflación y normaliza el FCF del valor terminal (capex = D&A). |
| DCF del reporte comparativo ($39.21) | Modelo individual (SORIANA_FINAL, 7-oct-2026): βU 0.1705 (regresión) · WACC 9.63% · $39.21 | Modelo del equipo (Excel PRO auditado): βU 0.1705 (regresión) · WACC 9.56% · $38.34 | Modelo del equipo | Misma beta desapalancada; la diferencia restante viene de la proyección, la fecha y el precio de referencia (33.48 del 25-sep vs. 33.10 del 7-oct-2026). |
| Precedent Transactions | Muestra S&P Capital IQ (3 operaciones, media): $40.73 | Muestra LSEG/SDC auditada (mediana EV/EBITDA): $23.74 | LSEG/SDC como referencia (peso 0%) | La muestra CIQ no es defendible (1 de 3 en la ventana). La SDC es global, de control mixto y dispersa: se muestra como contraste, no entra al precio combinado. |
| Precio de mercado de referencia | Modelo del equipo: $33.48 · cierre 25-sep-2026 (fecha de valuación 01-oct-2026) | Reporte comparativo (CIQ / Refinitiv): $33.10 · cierre 7-oct-2026 | Modelo: $33.48 | Cada fuente se compara contra su propio precio y fecha; ningún cierre se presenta como precio del día. |
| WACC | A valor de mercado (Kd histórico FY2025 13.0%): 10.06% | Iterado al valor DCF (Kd prospectivo 10%): 9.56% | Iterado (6 iteraciones) | El de mercado es solo el punto de partida de la iteración. |
| Deuda total | Cierre 2025: 23,618 mdp | 2T26: 23,720.6 mdp | Cierre 2025 para el EV; 2T26 para el puente a la fecha de valuación | El modelo usa ambos saldos en etapas distintas. |
| Capitalización de mercado | Reportada (precio $30.10): 54,180 mdp | Precio de referencia × acciones: 60,264 mdp | Precio de referencia × 1,800 mm de acciones para el WACC de mercado | El Excel recalcula E con el precio de referencia. |

**38.34 frente a 39.21.** Desde el 19-oct-2026 el equipo usa la misma βU de regresión (0.1705) que el modelo individual. La brecha restante de $0.87 es proyección, fecha y precio de referencia. Con la beta anterior (Damodaran 0.69), el DCF del equipo era $31.62; la diferencia de $6.72 se explica solo por la beta.

## 5. Cifras finales de la app (caso base del Excel, βU de regresión)

| Concepto | Valor |
|---|---|
| Precio de mercado de referencia | $33.48 (cierre 25-sep-2026) |
| Fecha de valuación | 01-oct-2026 |
| Valor DCF por acción | $38.34 (+14.5% frente al mercado) |
| Rango DCF por escenario de inflación | $37.93 a $39.14 (Cautela, Base, Alcista) |
| Trading Comps | $33.49 (7 comparable(s), media) |
| Precedent Transactions LSEG/SDC (referencia) | $23.74 (mediana EV/EBITDA, 8 operaciones; peso 0%) |
| Precio objetivo combinado | $35.92 (50% DCF · 50% Trading Comps · 0% Transacciones) |
| Recomendación | MANTENER (potencial +7.3% frente a $33.48) |
| WACC / Ke / g | 9.56% / 10.40% / 3.50% |
| Beta desapalancada (βU) / apalancada (βL) | 0.1705 / 0.2097 |
| Enterprise Value (cierre de 2025 / 2T26) | 79,383 / 84,152 mdp |
| Equity Value a la fecha de valuación | 69,012 mdp |
| Peso del valor terminal en el EV | 70.3% |

### Valuación combinada y recomendación

| Método | Precio por acción | Peso | Contribución | Motivo |
|---|---|---|---|---|
| DCF | $38.34 | 50% | $19.17 | Proyección Final Soriana!B265. Metodología principal existente. Peso: con Transactions en 0%, se conserva la regla de clase de pesos iguales entre los métodos activos (50/50). |
| Trading Comps | $33.49 | 50% | $16.75 | Trading Comps (sección 5). Metodología complementaria. Peso igual al DCF por la regla de pesos iguales de la diap. 18. |
| Precedent Transactions | $23.74 | 0% | $0.00 | Transacciones SDC (auditada): mediana de EV/EBITDA de las operaciones elegibles. Peso 0%: muestra global, sin operaciones mexicanas, control mixto y dispersión amplia. Se calcula y se muestra como referencia. La muestra CIQ (3 operaciones) queda como histórico. |
| Precio objetivo combinado | $35.92 | 100% | $35.92 | Diap. 18: pesos iguales (⅓) entre métodos; aquí 50/50 entre los métodos activos y Precedent Transactions 0% (referencia LSEG/SDC). |

| Concepto | Valor |
|---|---|
| Precio objetivo | $35.92 |
| Precio de mercado | $33.48 (25-sep-2026) |
| Potencial | +7.3% |
| Umbral de compra / venta | +10% / −10% |
| Rango de valor razonable | $28.99 a $38.34 |
| Recomendación | MANTENER |

### Escenarios de inflación

| Escenario | Inflación | WACC | Ventas 2030E | FCFF 2030E | Valor por acción | vs. mercado |
|---|---|---|---|---|---|---|
| Cautela | 3.26% | 9.56% | 191,129 | 6,636 | $37.93 | +13.3% |
| Base (activo) | 3.51% | 9.56% | 193,344 | 6,704 | $38.34 | +14.5% |
| Alcista | 4.00% | 9.57% | 197,744 | 6,840 | $39.14 | +16.9% |
| Trayectoria Citi — Referencia | trayectoria | 9.57% | 195,901 | 6,785 | $38.82 | +16.0% |

Nota: la tarjeta "Lectura del modelo" de 01 · Valor aplica la regla del DCF del Excel ('Proyección Final'!B268, umbral ±15% sobre el DCF: +14.5% → Mantener); la recomendación oficial aplica la regla de la hoja Transacciones SDC §7 (±10% sobre el precio combinado: +7.3% → MANTENER).

## 6. App: qué cambió

- **Motor y dataset:** todo sale del Excel auditado (`src/data/soriana.excel.ts`, generado). FCF normalizado en el valor terminal, LS con inflación, módulo `sdc` (criterios, estadísticos, atípicos, sensibilidad), recomendación del Excel y contraste externo.
- **Transacciones (05):** búsqueda, tabla por operación con monto y múltiplos, criterios, estadísticos, exclusiones, sensibilidad e histórico CIQ. **Combinada (06):** contraste externo separado del precio oficial.
- **Laboratorio:** un solo estado de supuestos; cada control tiene deslizador y campo numérico con rango documentado; "Restaurar valores base" vuelve exactamente al Excel. Dependencias: supuesto → `E.run` (proyección → WACC iterado → TV → EV → puente) → todas las vistas, presentación y exportaciones leen ese mismo resultado.
- **Presentación:** 7 diapositivas 16:9 (`docs/PRESENTACION.md`).
- **Exportaciones:** PDF · Resumen ejecutivo (3 páginas), PDF · Reporte técnico completo (32 páginas; 16 secciones, 44 tablas y 13 gráficas numeradas, índice con página real, "Página n de total", pie con el equipo), Excel con fórmulas (Supuestos → WACC → FCFF y valuación → Transacciones SDC → Combinada, más una hoja por sección), CSV UTF-8 con BOM, JSON reabrible y ZIP con LEEME. Avance real, estado "Descargado" o error con su causa. Sin `window.print`, sin CDN y sin Google Fonts (SheetJS, jsPDF, ExcelJS, JSZip y las fuentes van en el paquete).

## 7. QA: comprobaciones ejecutadas

| Comprobación | Herramienta | Resultado |
|---|---|---|
| Excel auditado: controles internos | LibreOffice (recálculo) | 49 PASS de 49 |
| Excel = motor (precio, tasas, montos, SDC, combinada, escenarios) | `npm test` (excel-master, parity) | Pasa |
| Reactividad: 19 supuestos, cambios combinados, secuencia de deslizadores, restablecer, bandera de escenario modificado | `npm test` (reactivity) | Pasa |
| Presentación (contenido y cifras) | `npm test` (deck) | Pasa |
| Reportes, CSV (BOM), JSON (reabre y reproduce el valor), libro de Excel | `npm test` (report) | Pasa |
| Total | `npm test` | 122 de 122 |
| Tipos | `npm run typecheck` | Sin errores |
| Compilación | `npm run build` | Correcta |
| Navegador (build de producción, Chromium) | Playwright | 29 de 29: pantallas = motor; beta, g (deslizador), margen y WACC manual se propagan; restablecer; presentación (flechas, espacio, Inicio, Fin, Esc, conserva el modelo); 10 descargas; JSON reabierto reproduce el escenario; **0 errores JS; 0 solicitudes externas** (todas bloqueadas y registradas) |
| Excel exportado recalculado | LibreOffice + openpyxl | Fórmula − app = 0.000000 MXN en DCF, WACC, transacciones y combinada (base y βU 0.90/g 4%); sin errores de fórmula |
| PDF | pdftotext / pdftoppm, revisión visual | Ejecutivo 3 páginas (base y modificado); técnico 32 páginas; equipo y matrículas en portada; sin títulos huérfanos |

## 8. Limitaciones

- El valor terminal pesa 70.3% del EV.
- La beta oficial sale de una regresión semanal cuya pendiente no es significativa al 95% (p = 0.087). El resultado es muy sensible a esta elección: con Damodaran 0.69 el DCF sería $31.62 y el precio objetivo $32.55.
- En el Excel exportado, cambiar un supuesto recalcula WACC, flujos y precio, pero no repite la iteración del WACC (el equity del DCF queda fijo); la app sí la repite.
- La muestra de transacciones es global; se reporta como referencia.
- StarMine es una lectura aproximada de una gráfica (el panel numérico de Refinitiv no cargó).
- La matrícula registrada para Saúl González Loredo (A016113349) tiene 10 caracteres. Se conserva tal como está en el proyecto; conviene confirmarla.
- La rama remota `development` contiene un commit del estudio individual (bbbb130). Este trabajo parte de `main` y no lo usa.

## 10. Cambio final: beta de regresión como supuesto oficial (19-oct-2026)

Decisión del equipo. Solo cambió la beta; transacciones, ponderación, diseño y demás hipótesis quedan igual.

**Cómo se obtiene la βU (hoja *Beta y Kd* §2, con fórmulas):**

| Concepto | Valor | Lectura |
|---|---|---|
| Beta apalancada observada (βL, pendiente de la regresión) | 0.2178 | Regresión semanal (Investing.com); error típico 0.1269, t 1.716, p 0.0874, IC 95% −0.032 a 0.468 |
| Deuda / capitalización de la regresión | 23,618 / 59,580 | D/E 0.3964 · tasa 30% |
| Beta desapalancada derivada (βU) | 0.1705 | βU = βL / [1 + (1 − t) × D/E] = 0.2178 / [1 + (1 − 30%) × 0.3964]. Supuesto oficial del WACC. |

- **0.2178** es la beta apalancada observada: la pendiente de la regresión semanal. No se usa directamente en el modelo.
- **0.1705** es la beta desapalancada que sale de ella: βU = 0.2178 / [1 + (1 − 0.30) × 23,618 / 59,580]. Es el supuesto oficial (`'Beta y Kd'!B18 = 2` → B19 → WACC!B9 → Proyección Final B212).
- En CAPM/WACC la βU se reapalanca con la estructura de capital del libro. Queda βL 0.2173 a mercado y 0.2097 iterada al DCF. No se mezcla con la βL observada ni se ajusta dos veces.
- **Damodaran 0.69** (corregida por caja) queda como referencia: selector 1, tabla A columna H y página Riesgo. La heredada 0.80 sigue como histórico (selector 0).

**Antes y después (caso base; todo sale de las fórmulas del Excel, recalculado en LibreOffice, y la app lo reproduce):**

| Concepto | Antes: βU Damodaran 0.69 | Ahora: βU regresión 0.1705 |
|---|---|---|
| βL iterada | 0.9071 | 0.2097 |
| Ke | 13.35% | 10.40% |
| WACC iterado | 11.38% | 9.56% |
| EV al cierre 2025 / al 2T26 (mdp) | 67,198 / 71,981 | 79,383 / 84,152 |
| Equity a la fecha de valuación (mdp) | 56,910 | 69,012 |
| Valor DCF por acción | $31.62 (−5.6%) | **$38.34 (+14.5%)** |
| Escenarios Cautela / Base / Alcista | $31.28 / $31.62 / $32.29 | $37.93 / $38.34 / $39.14 |
| Precio objetivo combinado (50% DCF + 50% Comps) | $32.55 (−2.8%) | **$35.92 (+7.3%)** |
| Recomendación | MANTENER (±10%) | **MANTENER (±10%) → COMPRAR con el umbral ±5% (§12)** |
| Rango de valor razonable | $28.99 – $33.49 | $28.99 – $38.34 |
| Controles del Excel | 49 PASS de 49 | 49 PASS de 49 |

**Qué se actualizó:**
- `tools/excel/audit_pro.py` (sección 8 y textos de Contraste externo, Auditoría y Fuentes).
- `tools/excel/scenarios.py` (selectores actuales).
- `tools/excel/extract_dataset.py` (combinaciones y la beta de regresión).
- Excel auditado regenerado.
- `src/data/soriana.excel.ts` regenerado.
- `src/data/soriana.ts` (diferencias y fuentes).
- Tipo `BetaSpec.regression`.
- Página Riesgo, anexo de beta y Laboratorio: el control de βU ahora admite 4 decimales.
- Presentación (diapositiva de riesgo).
- Textos del reporte y hoja Supuestos del Excel exportado.
- Pruebas `excel-master` y `report`.
- Para trazabilidad, `XL.expected.dcf.base_damodaran` conserva el resultado anterior.

**Pruebas repetidas:**
- `npm test`: 122 de 122.
- `npm run typecheck`: sin errores.
- `npm run build`: correcta.
- Excel auditado: 49 PASS de 49.
- Navegador: 29 de 29. Restaurar regresa a $38.34 / $35.92.
- Excel exportado recalculado: fórmula = app (DCF 38.3401, WACC 9.5628%).
- PDF ejecutivo: 3 páginas.

## 12. Ajustes finales (19-oct-2026, tras la publicación)

- **Umbral de decisión ±5%** (antes ±10% para la recomendación oficial y ±15% para la lectura del DCF). Ahora hay un solo umbral: `Transacciones SDC §7` (COMPRAR si el potencial > +5%, VENDER si < −5%). `Proyección Final!B155` queda vinculado a esa celda. Con el precio objetivo de $35.92 (+7.3% vs. $33.48), la recomendación pasa de **MANTENER a COMPRAR**. Excel: 49 PASS de 49.
- **Mismas cifras en toda la app:** la portada mostraba el valor DCF ($38.34, +14.5%) y la presentación el precio objetivo ($35.92, +7.3%). Ahora la portada, la tarjeta "Recomendación" de 01 · Valor, la presentación, los PDF, el Excel y el JSON usan la misma recomendación oficial (precio objetivo combinado, ±5%). El DCF se muestra rotulado como "Valor intrínseco DCF".
- **Presentación:** sin pies de fuente. Portada con franja de cifras (precio objetivo, mercado, potencial, recomendación), número de diapositiva, indicador de avance y distintivo de recomendación en el cierre. Los textos de pesos y del contraste de métodos se calculan con los supuestos activos.
- **Verificación:**
  - `npm test`: 122 de 122.
  - Tipos y compilación: sin errores.
  - Navegador: 29 de 29.
  - Revisión cruzada de cifras: portada, 01, 06, las 7 diapositivas y ambos PDF.
  - Excel exportado recalculado: fórmula = app y COMPRAR.

## 11. Archivos cambiados (rama `cierre-equipo-pro` frente a `main` 58e620f)

A = nuevo · M = modificado · D = eliminado · R = renombrado.

```
M	.gitignore
M	CLAUDE.md
A	docs/PRESENTACION.md
A	entregables/ValuFlow_Soriana_Modelo_2026-10-19.xlsx
A	entregables/ValuFlow_Soriana_Paquete_2026-10-19.zip
A	entregables/ValuFlow_Soriana_Reporte_tecnico_2026-10-19.pdf
A	entregables/ValuFlow_Soriana_Resumen_ejecutivo_2026-10-19.pdf
A	entregables/ValuFlow_Soriana_Resumen_ejecutivo_Escenario_modificado_2026-10-19.pdf
A	entregables/ValuFlow_Soriana_Tablas_2026-10-19.csv
A	entregables/ValuFlow_Soriana_Valuacion_2026-10-19.valuflow.json
A	excel/EXCEL FINAL PRO DEFINITIVO SORIANA - AUDITADO.xlsx
R100	excel/EXCEL DEFINITIVO DE VALUACION DE SORIANA - MODELO INTEGRADO.xlsx	excel/historico/EXCEL DEFINITIVO DE VALUACION DE SORIANA - MODELO INTEGRADO.xlsx
A	excel/original/EXCEL FINAL PRO DEFINITIVO SORIANA.xlsx
M	index.html
M	package-lock.json
M	package.json
A	src/assets/logos.ts
A	src/charts/svg.ts
M	src/data/soriana.excel.ts
M	src/data/soriana.ts
M	src/engine/analysis.ts
M	src/engine/build.ts
M	src/engine/index.ts
M	src/engine/model.ts
M	src/engine/multiples.ts
M	src/engine/types.ts
M	src/engine/validate.ts
M	src/main.tsx
A	src/report/charts.ts
A	src/report/content.ts
A	src/report/snapshot.ts
M	src/services/exporter.ts
A	src/services/images.ts
A	src/services/pdf.ts
A	src/services/raster.ts
A	src/services/sheet.ts
A	src/services/xlsx.ts
A	src/styles/deck.css
M	src/styles/industry.css
M	src/ui/App.tsx
M	src/ui/Shell.tsx
M	src/ui/annex.ts
M	src/ui/pages/CombinedPage.tsx
M	src/ui/pages/FlowsPage.tsx
M	src/ui/pages/LabPage.tsx
M	src/ui/pages/TransactionsPage.tsx
M	src/ui/pages/shell.tsx
A	src/ui/present/Deck.tsx
A	src/ui/present/deck.ts
M	src/ui/relative.ts
M	src/ui/viewmodel.ts
A	tests/deck.test.ts
M	tests/excel-master.test.ts
M	tests/parity.test.ts
A	tests/reactivity.test.ts
A	tests/report.test.ts
A	tools/excel/audit_pro.py
M	tools/excel/extract_dataset.py
M	tools/excel/scenarios.py
M	docs/CIERRE_PROYECTO.md
```
