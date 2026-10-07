# ValuFlow Equity Lens — Diagnóstico v2 (decisiones metodológicas)

> **Corrección posterior (07‑oct‑2026, al integrar el modelo):** esta auditoría dijo que la inflación de la fila 10 y el Kd de 10 % no
> tenían fuente. Sí la tienen: los comentarios originales de `Proyección Final Soriana!C10` y `!C61` citan la Encuesta Citi de
> Expectativas del 22‑sep‑2026 (inflación 3.93 % / 3.83 % / 3.75 %; tasa Banxico 6.50 %) y los gastos financieros de 1S26.
> Ver `docs/MODELO_INTEGRADO.md`.

Fecha: 7-oct-2026 · **Estado: análisis. No se modificó el Excel definitivo, el motor, las fórmulas, los escenarios, la aplicación ni Vercel.**
Todas las mediciones de impacto se hicieron sobre **copias de trabajo** del Excel, recalculadas con LibreOffice (el caso sin cambios reproduce exactamente $31.16, lo que valida el método).

> **Corrección importante respecto al reporte v1.** El hallazgo B-1 del v1 ("doble conteo del FCF de 1S26, $31.16 → $29.94") **era incorrecto**. Al reconstruir el puente celda por celda, el flujo de 1S26 resultó **negativo** (−1,060.5 mdp) y el Excel ya lo **resta** correctamente. Sección B.

---

## A. Baseline recomendado

**Candidato vigente: $31.16 por acción** (`Proyección Final Soriana!B265`), sin cambios por el puente de junio.

Todavía **no** lo declaro definitivo porque quedan decisiones que pueden moverlo:

| Pendiente | Efecto si se adopta | Sección |
|---|---|---|
| Beta del WACC (fuente de βU 0.80) | Potencialmente grande: de $0 (si se confirma 0.80) a ≈ +$12 (con betas empíricas ≈ 0) | C, D3 |
| Costo de deuda de la iteración (10 % vs 13.02 %) | −$1.76 (a $29.40) | D17 |
| Interés minoritario omitido en el puente | −$0.09 | D16 |
| Definición del CFO de 1S26 (intereses dentro/fuera) | 0 a −$0.47 | B, D19 |
| Inflación en el escenario Base | −$0.33 a $0 | D5 |

Nota: la app muestra $31.16, pero su dataset guarda la proyección redondeada a 1 decimal (WACC 11.8793 % vs 11.8773 % del Excel). Debe sustituirse por valores de precisión completa para la paridad exacta (sección I).

---

## B. Puente completo del flujo de 1S26 (la corrección $31.16 → $29.94 se retira)

**1. Celda que contiene el flujo.** `Proyección Final Soriana!B257` = `−((Datos!E15+Datos!F15) − (Datos!E16+Datos!F16))`

| Insumo | Celda | Valor (mdp) |
|---|---|---|
| CFO 1T26 | `Datos!E15` | −3,565.600 |
| CFO 2T26 | `Datos!F15` | 3,916.003 |
| Capex 1T26 | `Datos!E16` | 501.0 |
| Capex 2T26 | `Datos!F16` | 909.9 |
| **CFO − Capex de 1S26** | | **−1,060.497** (Soriana consumió efectivo) |
| `B257` = −(CFO − Capex) | | **+1,060.497** |

**2. Dónde entra por primera vez.** Dentro del FCF proyectado de 2026 (`C117` = 6,047.8; VP en `C120` = 5,405.8), que forma parte del EV al cierre 2025 (`B136` Gordon, `B238` múltiplo → `B245` EV ponderado = 66,235.8). La proyección cubre 2026 completo, incluido el primer semestre.

**3. Dónde vuelve a entrar.** (i) Explícitamente en `B257` (como −FCF) dentro del EV al 2T26 (`B258`). (ii) Su efecto de caja está en el balance del 2T26 usado en el puente (`B259:B261`): la deuda neta pasa de 14,323.0 (dic-25) a 16,845.2 (2T26).

**4. Componentes afectados.** EV al 2T26 (`B258`) → Equity al 2T26 (`B262`) → Equity a la fecha de valuación (`B263`) → precio (`B265`).

**5. Fórmula actual.** `EV₂ᵀ²⁶ = EV₀ × (1 + WACC)^0.5 + B257 = EV₀ × (1 + WACC)^0.5 − FCF₁ₛ₂₆`

**6. Fórmula teóricamente correcta.** `EV₂ᵀ²⁶ = EV₀ × (1 + WACC)^t − FCF ya realizado entre 0 y t`. **Es la misma que usa el Excel**, porque `B257` es el flujo con signo invertido. No hay fórmula que corregir.

**7. Por qué se resta.** El EV al 2T26 es el valor de los flujos que **faltan** después del 2T26. Capitalizar EV₀ arrastra el valor de **todos** los flujos de 2026, incluidos los del primer semestre que ya ocurrieron. Esos flujos deben retirarse del EV, porque su efecto ya está en el efectivo y la deuda del 2T26. Retirar un flujo **negativo** (−1,060.5) **aumenta** el EV en 1,060.5. Con esto el flujo de 1S26 queda contado **una sola vez**: en la deuda neta del 2T26.
*Mi error del v1:* leí `B257 = +1,060.5` como "FCF generado sumado al EV", cuando es "FCF negativo restado al EV".

**8–10. Impacto exacto de cada alternativa** (valores del Excel a precisión completa):

| Alternativa | Ajuste al EV | EV 2T26 | Equity 2T26 | Equity a la fecha de valuación | Precio |
|---|---|---|---|---|---|
| **Excel actual (correcto)** | +1,060.50 | **71,119.48** | **54,274.28** | **56,095.95** | **$31.1644** |
| Mi propuesta del v1 (incorrecta) | −1,060.50 | 68,998.49 | 52,153.28 | 53,903.77 | $29.9465 |
| Ignorar 1S26 | 0 | 70,058.98 | 53,213.78 | 54,999.86 | $30.5555 |

La diferencia de $1.22 entre $31.16 y $29.94 es exactamente 2 × 1,060.5 = 2,121.0 mdp de EV × (1 + Ke)^0.2528 / 1,800. Aplicar mi "corrección" habría **introducido** un error.

**Verificación independiente con la deuda neta.** Aumento de deuda neta en 1S26 = 2,522.2 mdp. Explicado por: FCF negativo 1,060.5 + intereses del periodo 1,170 (588 + 582, estado de resultados) = 2,230.5. Residuo de 291.7 (remedición de arrendamientos y otros). El residuo es pequeño y consistente con que los intereses se pagan fuera del CFO (ver D19).

**Riesgos residuales (no son errores de fórmula):**
- **Definición del CFO (D19).** Si el CFO del reporte ya restara intereses pagados, el FCFF de 1S26 sería ≈ −241.5, no −1,060.5, y el precio ≈ **$30.69** (−$0.47). La conciliación anterior apoya que los intereses están fuera del CFO, pero hay que confirmarlo con el estado de flujos de Soriana.
- **Etiquetas engañosas.** El Excel dice "(−/+) FCF ya generado en 1S26". La app dice "FCF generado 1S26 **+1,061**" y "(+) FCF ya generado 1S26". El flujo real fue **−1,060.5**. Se propone corregir **solo las etiquetas**.
- **Estacionalidad.** El FCF implícito del 2S26 = 6,047.8 − (−1,060.5) = 7,108.3 mdp. Es coherente con la estacionalidad de Soriana (CFO 4T25 = 13,017).

---

## C. Auditoría de beta y WACC

### C.1 ¿Existe fuente para βU = 0.80?

**No.** Búsqueda en los 13 documentos (los 9 de esta etapa más el Material Maestro, el Excel anotado y los extractos de la etapa inicial):

| Documento | Lo que dice | ¿Fuente, fecha o metodología? |
|---|---|---|
| Excel definitivo `WACC!B9` | "Beta desapalancada del sector" = 0.80 | No |
| Material Maestro §12 | "Sesión 2 / DCF: Rf 9.52 %; PRM 4.2 %; beta U 0.80; … WACC 12.50 %" | No: solo registra que se usó |
| Presentación de clase (notas, diap. 12 y 14) | "El WACC combina datos CIQ con entradas de mercado de Damodaran"; el caso de clase usa β = 1.2 hipotética | Metodología sí (Damodaran); valor para Soriana no |

### C.2 Betas disponibles en los documentos

| Beta | Valor | Fuente | Calidad |
|---|---|---|---|
| βU del sector (Excel) | 0.80 | Sin fuente | Desconocida |
| Regresión diaria Soriana vs IPC (libro de inflación) | **0.0415** (reportada como 0.41 por un factor ×10) | `SORIANA!Y2` | 62 días (jul–oct 2026), correlación 0.015, R² ≈ 0.0002: no significativa |
| Beta 5 años de Soriana (CIQ) | −0.23 | Archivo de múltiplos | Negativa |
| "Beta de regresión (referencia)" | Soriana −0.24 · Walmex 0.03 · Chedraui −0.06 · La Comer 0.17 | `Generales!B93:E93`, sin fuente | Cercanas a cero |
| Betas 5 años de los 7 pares de autoservicio (CIQ) | −0.06, 0.51, 0.03, 0.17, 0.22, 0.10, 0.20 → mediana 0.17 | Archivo de múltiplos | Apalancadas, cercanas a cero |

**Lectura financiera.** Todas las betas empíricas de autoservicio mexicano y latinoamericano son ≈ 0. Con ellas, Ke ≈ Rf ≈ 9.5–10.2 %, **por debajo del costo de la deuda** antes de impuestos (13.02 %). Eso es económicamente inconsistente: el accionista es residual y no puede exigir menos que el acreedor. Las betas locales bajas suelen reflejar baja correlación con un índice concentrado (IPC) y periodos cortos, no bajo riesgo. Esa es la razón estándar para usar betas sectoriales "de abajo hacia arriba", como las de Damodaran que cita la presentación de clase.

### C.3 Alternativas e impacto (Excel/motor con las mismas demás variables)

| Alternativa | Ke aprox. | Precio aprox. | Comentario |
|---|---|---|---|
| (1) Mantener βU 0.80 hasta obtener fuente | 13.95 % | **$31.16** | Valor vigente |
| (2) βU sectorial de Damodaran (retail de alimentos, mercados emergentes) con fecha | Depende del dato | — | **Recomendada**: coherente con la metodología de clase (CIQ usa Damodaran). Necesito el dato y su fecha; no tengo acceso desde aquí |
| (3) βL = 0.0415 (regresión corregida) | 9.69 % | ~$43.6 | Ke < Kd; R² ≈ 0 |
| (4) βL = 0.17 (mediana de pares CIQ) | 10.24 % | ~$41 | Mismo problema |
| (5) βU = 0.41 (error ×10) | — | $35.77 | Descartada: es un error aritmético |

**Recomendación (D3):** no sustituir el 0.80 hasta tener la fuente. Obtener la beta sectorial de Damodaran con fecha: si coincide, se documenta; si difiere, se reemplaza con tu aprobación. Además, presentar en el Excel la regresión **corregida** (0.04, sin el ×10), porque la tarea exige beta por regresión. Explicar por qué no se usa en el WACC (R² ≈ 0 y Ke < Kd).

### C.4 Otros insumos del WACC

| Insumo | Valor | Estado |
|---|---|---|
| Rf (Bono M 10 años) | 9.517 % | Sin fecha ni fuente exacta → requiere registro |
| PRM "madura" | 4.23 % | Probablemente Damodaran; sin fecha → requiere registro |
| Prima país México | 2.46 % | Listada como "referencia", no aplicada. Defendible si Rf es en pesos, pero no está escrito |
| Kd (iteración) | 10.00 % (`C61`, "tasa implícita proyectada") | **Inconsistente** con el Kd de mercado de 13.02 % (`WACC!B31`); sin fuente → D17 |
| Tasa del escudo fiscal | 28.80 % (tasa 2030E ponderada) | Distinta de la tasa legal de 30 %; consistente internamente |
| Pesos D/E | Valor DCF (iterado) | Correcto |

---

## D. Auditoría completa de inflación

### D.1 Datos y modelos del libro de clase

Fuente de datos: Banxico, serie SP74833 (INPC, variación anual, quincenal), consultada el 07/10/2026, 1Q ene-2022 a 1Q sep-2026 (113 observaciones).

| Modelo | Datos | Parámetros del Excel | Reajuste independiente (MCO de ln y) | Proyección | Estado |
|---|---|---|---|---|---|
| Inmediata (quincenal) | 25 quincenas, sep-25 a sep-26 | 3.9951·e^(−0.005x), x = 26 | a = 3.9951, b = −0.0050, R² 0.10 | 3.508 % (3.504 % sin redondeo) | Reproducible |
| Trimestral | 4 promedios trimestrales (3.71, 3.84, 4.33, 3.25) | 4.0327·e^(−0.028x), x = 5 | a = 4.0302, b = −0.0277, R² 0.09 | 3.506 % (3.509 %) | Reproducible; **solo 4 puntos** |
| Ventana quincenal 2023–26 | 89 quincenas | Fórmula 5.8812·e^(−0.006x); **etiqueta** 6.0882·e^(−0.008x) | a = 5.8812, b = **−0.0063**, R² 0.62 | Excel 3.427 % · real **3.326 %** | Error de redondeo y etiqueta inconsistente |
| Ventana trimestral | 19 promedios | Etiqueta 8.1183·e^(−0.049x) | a = 8.1183, b = −0.0486, R² 0.82 | **3.07 %** (x = 20) | La hoja nunca calcula esta proyección |
| Correlaciones precio–inflación | 23 cierres mensuales | 0.19 / 0.66 / 0.60 / 0.695 | Reproducidas | — | El dossier reporta 0.26 / 0.61 / 0.65 / 0.70 (difiere) |
| Beta vs IPC | 62 rendimientos diarios | `SLOPE × 10` | 0.0415 | — | **Error ×10** |
| Recta IPC–precio | Cierres | IPC = 7.8141·P + 65,283 (de gráfico) | R² ≈ 0.0002 | Precio "objetivo" 33.17 = spot × (1 + rendimiento diario promedio) | Causalidad invertida en el dossier |

**Advertencia de horizonte.** Los modelos de clase proyectan **un periodo adelante** (la siguiente quincena o trimestre). No son pronósticos a 5 años. Usarlos para 2026–2030 es un **supuesto** y debe rotularse así.

### D.2 Cadena de transmisión que el Excel sí documenta

| Eslabón | Celda | Fórmula | Documento que lo sustenta | ¿Sustentado? |
|---|---|---|---|---|
| Inflación esperada 2026–2030 | `Proyección Final!C10:G10` | 3.93 / 3.83 / 3.75 / 3.75 / 3.75 % (capturados) | **Sin fuente rotulada** (`Variables Externas` cita 3.42 % y convergencia a 3 % al 4T27, que no lleva a esos valores) | **No (falta fuente)** |
| Crecimiento nominal del mercado | `C14` | `= Inflación + PIB × 0.5 + ajuste de consumo` | `Proyección Final` filas 10–14 | Sí: coeficiente **1.0** sobre la inflación |
| Crecimiento por variables externas | `C23` | `= C14 + Σ ajustes` | Matriz de factores y `Variables Externas` | Sí |
| Crecimiento final | `C28` | `= w_ext × C23 + w_MC × C27` | Ponderación de métodos (filas 6–7) | Sí → **traspaso a ventas = 70 / 70 / 75 / 80 / 85 %** |
| Ventas | `C67` | `= ventas previas × (1 + C28)` | — | Sí |
| Costo de ventas | `C68` | `= ventas × % fijo` | `Variables Externas` fila 6: "eleva ventas nominales y costo de mercancía en proporción similar; efecto casi neutral en margen" | Sí → costos **proporcionales** |
| Margen EBIT | `C41` | Variables externas + MC, sin término de inflación | Ídem | Sí → **margen neutral** |
| D&A | `C72` | % de ventas | — | Sí (escala) |
| Capex | `C104` | **2026 = 4,000 mdp fijos** (guía de Soriana); 2027–30 = % de ventas | Guía 2026 | Sí; 2026 no escala con la inflación |
| Capital de trabajo | `C85:C86`, `C90` | Días de inventario sobre costo; % de ventas | — | Sí (escala) |
| WACC | `B126` | Iteración (solo cambia por el peso del equity) | — | Rf no cambia (ver gap 1) |
| Valor terminal | `B129`, `B236` | Gordon con g fijo 3.5 %; múltiplo × EBITDA 2030 | — | g no ligado a la inflación (ver gap 2) |

### D.3 Impacto medido (copias recalculadas)

| Escenario (cómo entra) | Crec. ventas 2026 → 2030 | Ventas 2030 | Margen EBIT 2030 | FCF 2030 | WACC | Precio final |
|---|---|---|---|---|---|---|
| Actual (fila 10 sin cambios) | −4.21 → 2.94 % | 178,318 | 4.508 % | 6,470 | 11.877 % | **$31.16** |
| Desplazar fila 10 por (3.26 − 3.51) | −4.38 → 2.72 % | 176,635 | 4.508 % | 6,416 | 11.872 % | **$30.89** |
| Desplazar fila 10 por (4.00 − 3.51) | −3.87 → 3.35 % | 181,655 | 4.508 % | 6,577 | 11.889 % | **$31.71** |
| Reemplazar fila 10 por 3.26 % | −4.68 → 2.52 % | 174,700 | 4.508 % | 6,352 | 11.865 % | $30.56 |
| Reemplazar fila 10 por 3.51 % | −4.50 → 2.73 % | 176,368 | 4.508 % | 6,406 | 11.870 % | $30.83 |
| Reemplazar fila 10 por 4.00 % | −4.16 → 3.15 % | 179,676 | 4.508 % | 6,512 | 11.882 % | $31.37 |
| Reemplazar fila 10 + g = inflación (3.26 / 3.51 / 4.00) | igual | igual | 4.508 % | igual | 11.85 / 11.87 / 11.92 % | $30.20 / $30.85 / $32.21 |

### D.4 Gaps (relaciones que los documentos NO sustentan)

| # | Relación | Situación | Opciones |
|---|---|---|---|
| 1 | Inflación → Rf / WACC (consistencia nominal de Fisher) | No documentada. Con WACC fijo, más inflación sube el valor porque el WACC real baja | (a) WACC fijo y limitación documentada · (b) Rf + Δinflación (no documentado) |
| 2 | Inflación → g | Solo cualitativo (la tarea menciona la inflación como base posible de g); no hay coeficiente | (a) g independiente · (b) g = inflación de largo plazo (supuesto que tú debes aprobar) |
| 3 | Fuente de la fila 10 (3.93 / 3.83 / 3.75) | Sin cita | Necesito saber de dónde salen (¿encuesta Banxico?) |
| 4 | Traspaso diferencial a costos | No documentado (el Excel dice "proporción similar") | No implementar |
| 5 | Estudio de mercado (correlación, beta, recta IPC) → flujos | No hay vínculo documentado. Es un estudio de precio de la acción, no de flujos | Usarlo en Laboratorio y validación, no en el FCFF |

---

## E. Clasificación de 3.26 %, 3.51 % y 4.00 % (y 3.43 %)

| Valor | Tipo | Origen exacto | Horizonte | Cómo debe rotularse |
|---|---|---|---|---|
| **3.51 %** | **Resultado de modelo (forecast)** | Dos modelos exponenciales de tendencia: quincenal (n = 25, R² 0.10) y trimestral (n = 4, R² 0.09). Reproducidos: 3.504 % y 3.509 % | Siguiente quincena / trimestre | "Pronóstico de tendencia de corto plazo; extendido a 2026–30 como supuesto" |
| **3.26 %** | **Construcción aritmética (supuesto de escenario)** | `INFLACION!S113 = AVERAGE(R113:R118)`: promedio de 5 quincenas observadas (jul–sep 2026: 3.10, 3.14, 3.26, 3.26, 3.42; promedio 3.236 %) más el pronóstico 3.427 %. El dossier lo presenta como modelo de ventana trimestral, pero ese modelo da 3.07 % | Nivel reciente | "Supuesto de cautela anclado al nivel observado reciente (jul–sep 2026); no es un pronóstico" |
| **4.00 %** | **Supuesto de escenario** | Solo aparece en "Avances" como escenario sugerido ("Alcista: inflación 4.0 %"). No proviene de ningún modelo ni del dossier | — | "Supuesto de escenario alcista; no es un pronóstico". (Dentro del rango observado: el promedio trimestral máximo del último año fue 4.33 %) |
| 3.43 % | Resultado de modelo con error | Exponente redondeado (−0.006 en lugar de −0.0063) | Siguiente quincena | Corregir a **3.33 %** |

Se conservan los tres valores de trabajo con su clasificación honesta. Los resultados reales de los modelos de ventana larga (3.33 % y 3.07 %) se mostrarían como referencia.

---

## F. Selección razonada de comparables

Fuentes: CIQ "Quick Comparable Analysis" (as-of 30-jun-2026, USD convertidos al tipo de cambio del día de exportación), hojas Financial Data, Trading Multiples, Operating Statistics, Business Description y Credit Health Panel (industria primaria CIQ). Soriana: TEV 4.1 mil mm USD, ventas 9.5 mil mm, margen EBITDA 6.4 %, crecimiento −2.9 %, deuda/EBITDA 2.0x.

| Empresa | País | Industria CIQ | Modelo de negocio | TEV (USD mm) | Ventas | Mg EBITDA | Crec. | Deuda/EBITDA | Datos | Decisión | Razón |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Chedraui | MX (+EU) | Food Retail | Autoservicio multiformato | 7,429 | 16,018 | 6.4 % | −3.4 % | 2.5 | Completos | **Incluir** | Par más cercano: mismo formato, país, margen y crecimiento |
| La Comer | MX | Food Retail | Autoservicio premium | 2,140 | 2,736 | 10.0 % | 8.6 % | 0.5 | Completos (sin crec. LP de UPA) | **Incluir con reserva** | Competidor directo; más pequeña, premium, más rentable y sin deuda |
| Walmex | MX | Consumer Staples Merch. Retail | Autoservicio, descuento, club | 52,191 | 56,741 | 9.6 % | 2.9 % | 0.8 | Completos | **Incluir con reserva** | Competidor directo; 12× el tamaño de Soriana, líder con prima |
| Grupo Mateus | BR | Consumer Staples Merch. Retail | Supermercados y mayoreo | 2,854 | 8,147 | 5.9 % | 18.7 % | 2.6 | Completos | **Incluir con reserva** | Formato similar; geografía y crecimiento distintos; P/U 4.7x atípico |
| Sendas (Assaí) | BR | Consumer Staples Merch. Retail | Mayoreo cash & carry | 6,909 | 15,576 | 7.8 % | 1.7 % | 4.0 | Completos | **Incluir con reserva** | Formato comparable a City Club; apalancamiento alto distorsiona P/U y P/VL (17.1x) |
| Cencosud | CL | Consumer Staples Merch. Retail | Supermercados + mejoramiento del hogar + departamentales + centros comerciales + servicios financieros | 11,832 | 17,028 | 5.6 % | −1.6 % | 5.1 | EBITDA LTM −29.5 % | **Incluir con reserva** | Diversificada; EBITDA deprimido infla EV/EBITDA (9.3x) y EV/EBIT (14.0x, máximo) |
| InRetail | PE | Consumer Staples Merch. Retail | Supermercados, farmacias, centros comerciales | 6,093 | 6,993 | 11.0 % | 7.8 % | 3.2 | Completos | **Incluir con reserva** | Multiformato con negocios no comparables (farmacia, inmobiliario) |
| FEMSA | MX | Soft Drinks | Embotellador Coca-Cola + OXXO + salud + combustible | 49,955 | 48,576 | 11.8 % | 7.4 % | 2.1 | Completos | **Excluir** | Negocio principal distinto (bebidas); P/U 25.9x |
| Liverpool | MX | Broadline Retail | Tiendas departamentales + crédito + inmobiliario | 9,571 | 12,791 | 14.2 % | 3.0 % | 1.6 | Completos | **Excluir** | Departamentales con negocio financiero; márgenes del doble |
| Falabella | CL | Broadline Retail | Departamentales, mejoramiento del hogar, banca | 20,976 | 14,289 | 12.7 % | 8.9 % | 3.0 | Completos | **Excluir** | Mismo motivo |

Resultado: **7 comparables** (1 incluir + 6 con reserva). La clasificación de CIQ (Food Retail / Consumer Staples Merchandise Retail) coincide con el análisis financiero, pero se usa como evidencia, no como criterio único.

**Hallazgo técnico sobre los múltiplos de CIQ.** Recalcular TEV / EBITDA con la hoja Financial Data **no** reproduce el múltiplo LTM publicado por CIQ (Chedraui 7.24x vs 5.7x; Cencosud 12.5x vs 9.3x). Los múltiplos NTM sí coinciden exactamente. El múltiplo publicado de Soriana (6.3x) es consistente con el EBITDA reportado con arrendamientos (~11,900 mdp), que es el mismo del Excel. Por eso se usarán **los múltiplos publicados por CIQ** (redondeados a 1 decimal, error máximo ±0.05x), no un recálculo.

**Vista previa** (no implementada; múltiplos CIQ LTM aplicados a las métricas de Soriana en MXN, LTM 3T25–2T26, con el puente al 2T26; media de cada múltiplo → precio; promedio simple de precios):

| Muestra | EV/EBITDA → precio | EV/EBIT → precio | P/U → precio | Trading Comps (3 múltiplos) | Con EV/Ventas |
|---|---|---|---|---|---|
| 7 comparables | 7.04x → $36.85 | 9.96x → $32.85 | 14.51x → $30.77 | **$33.49** | $38.69 |
| 3 mexicanos | 7.40x → $39.20 | 10.50x → $35.16 | 15.17x → $32.15 | $35.50 | $42.04 |
| 10 de CIQ | 7.21x → $37.95 | 9.95x → $32.82 | 14.61x → $30.97 | $33.92 | $42.46 |

Métricas de Soriana (Excel `Datos`, LTM 3T25–2T26): ventas 174,278; EBITDA 11,810.9; EBIT 7,631; utilidad neta 3,816; UPA 2.120. Puente al 2T26: efectivo 6,875.4 − deuda 11,500 − arrendamientos 12,220.6 = −16,845.2 mdp. Acciones: 1,800 mm.

---

## G. Evaluación de las transacciones

Criterios de la presentación de clase (diap. 10): operaciones anunciadas o completadas, últimos 3 años, misma industria y geografía, al menos 2 múltiplos por operación. Ampliaciones: industria un nivel arriba y luego global. No define el umbral de muestra suficiente.

| Criterio | Éxito 2023 (Super Selectos; Colombia) | InRetail 2019 (Perú) | Éxito 2019 (Sendas ← Casino; Colombia) |
|---|---|---|---|
| Fecha anunciada | 16-oct-2023 | 11-jul-2019 | 26-jun-2019 |
| Ventana de 3 años (desde 01-oct-2023) | ✓ (por 15 días) | ✗ | ✗ |
| Geografía México | ✗ | ✗ | ✗ |
| Industria (autoservicio) | ✓ hipermercados y supermercados | ✓ con reservas (multiformato) | ✓ |
| ≥ 2 múltiplos | ✓ (0.3x ventas; 5.2x EBITDA) | ✓ (1.5x; 11.4x) | ✓ (0.4x; 6.3x) |
| ¿Operación de control? | ✓ (oferta por el control; varios vendedores del grupo Casino) | **Dudoso**: comprador no identificado; tamaño 4,590 = 3.9 % del TEV → probable venta minoritaria o secundaria | **Dudoso**: vendedor Casino y comprador Sendas, ambos del grupo Casino según los datos → posible reestructura intra-grupo (verificar) |
| Calidad de datos | TEV idéntico (56,675.3) en 2019 y 2023 → la columna TEV no es el TEV de la operación | Ídem | Tamaño 130,645 > TEV 56,675 → inconsistente |

**Conclusión:** la muestra **no es estadísticamente defendible.** Solo 1 operación cumple la ventana y ninguna la geografía. Las ampliaciones de la metodología requieren otra búsqueda en CIQ que no podemos hacer. Con n = 1, los seis estadísticos son iguales. El resultado depende por completo de qué se incluye:

| Muestra | EV/Ventas → precio | EV/EBITDA → precio | Resultado del método |
|---|---|---|---|
| 3 operaciones | 0.73x → $61.64 | 7.63x → $40.73 | $51.19 |
| Solo dentro de la ventana (n = 1) | 0.30x → $19.69 | 5.20x → $24.76 | $22.22 |
| Sin InRetail (n = 2) | 0.35x → $24.53 | 5.75x → $28.37 | $26.45 |

Recomendación: presentar las transacciones como **referencia no concluyente**, con todos los criterios visibles, y no forzar un valor con peso en la combinada (D12/D13).

---

## H. Las decisiones D1–D15 (y cuatro nuevas, D16–D19)

**D1 — Baseline**
- **Problema:** dos modelos en el Excel ($34.44 y $31.16).
- **Hallazgo:** el Excel declara `B265` como final.
- **Evidencia:** rótulos de `Proyección Final` y de `Valuación`.
- **Opciones:** (a) modelo final; (b) DCF preliminar.
- **Recomendación:** (a) como candidato; declararlo final tras D3 y D16–D19.
- **Impacto:** ninguno por ahora.
- **¿Requiere aprobación?** Sí.

**D2 — Flujo de 1S26**
- **Problema:** sospecha de doble conteo.
- **Hallazgo:** **no hay error**. El FCF fue −1,060.5 y el Excel lo resta correctamente; mi v1 estaba equivocado.
- **Evidencia:** sección B y conciliación de deuda neta.
- **Opciones:** (a) mantener la fórmula y corregir solo las etiquetas; (b) mi propuesta del v1 ($29.95, incorrecta); (c) ignorar 1S26 ($30.56).
- **Recomendación:** (a).
- **Impacto:** $0 en el valor; etiquetas más claras.
- **¿Requiere aprobación?** Sí (cambio de etiquetas).

**D3 — Beta del WACC**
- **Problema:** βU 0.80 sin fuente.
- **Hallazgo:** no hay fuente en ningún documento; las betas empíricas son ≈ 0 y llevan a Ke < Kd.
- **Evidencia:** sección C.
- **Opciones:** (1) mantener 0.80 provisionalmente; (2) Damodaran sectorial con fecha; (3) regresión corregida 0.04; (4) mediana de pares 0.17.
- **Recomendación:** (2), manteniendo 0.80 mientras tanto; mostrar la regresión corregida como análisis requerido.
- **Impacto:** de $0 a +$12.
- **¿Requiere aprobación?** Sí, y **necesito el dato de Damodaran** (o tu indicación de dónde salió el 0.80).

**D4 — Transmisión de la inflación**
- **Problema:** cómo entra la inflación a los flujos.
- **Hallazgo:** el Excel documenta el canal: inflación (fila 10) → crecimiento nominal (coef. 1.0) → ponderado 70–85 % → ventas; costos, D&A y capital de trabajo proporcionales; margen neutral; capex 2026 fijo.
- **Evidencia:** sección D.2.
- **Opciones:** (a) solo ese canal; (b) (a) + g ligada; (c) solo g; (d) + Rf (Fisher).
- **Recomendación:** (a). Las opciones (b) y (d) no están documentadas.
- **Impacto:** −$0.27 a +$0.55.
- **¿Requiere aprobación?** Sí.

**D5 — ¿Base cambia el baseline?**
- **Problema:** la fila 10 (3.93 / 3.83 / 3.75) no es 3.51.
- **Hallazgo:** la fila 10 no tiene fuente.
- **Evidencia:** sección D.4, gap 3.
- **Opciones:** (a) Base = fila 10 actual y los escenarios desplazan por (escenario − 3.51): Cautela $30.89, Base $31.16, Alcista $31.71; (b) Base = 3.51 % plano: Cautela $30.56, Base $30.83, Alcista $31.37.
- **Recomendación:** (a) si la fila 10 tiene fuente (p. ej., encuesta Banxico); (b) si no la tiene.
- **Impacto:** $0 o −$0.33 en Base.
- **¿Requiere aprobación?** Sí, y **necesito la fuente de la fila 10**.

**D6 — Consistencia nominal (Fisher)**
- **Problema:** el WACC no cambia con la inflación.
- **Hallazgo:** no hay relación documentada inflación → Rf.
- **Evidencia:** sección D.4, gap 1.
- **Opciones:** (a) WACC fijo y limitación documentada; (b) ajustar Rf.
- **Recomendación:** (a).
- **Impacto:** sin cambio; se documenta que más inflación ↑ valor por WACC real ↓.
- **¿Requiere aprobación?** Sí.

**D7 — Valores de escenario**
- **Problema:** naturaleza distinta de 3.26 / 3.51 / 4.00.
- **Hallazgo:** 3.51 es modelo; 3.26 es construcción; 4.00 es supuesto; 3.43 tiene error.
- **Evidencia:** sección E.
- **Opciones:** (a) conservar los tres con su clasificación y mostrar 3.33 / 3.07 como referencia; (b) sustituir Cautela por un modelo.
- **Recomendación:** (a), según tu indicación.
- **Impacto:** $0.
- **¿Requiere aprobación?** Sí (confirmar rótulos).

**D8 — Grupo comparable**
- **Problema:** selección de pares.
- **Hallazgo:** 7 comparables (1 incluir + 6 con reserva); FEMSA, Liverpool y Falabella excluidos.
- **Evidencia:** sección F.
- **Opciones:** 7 / 3 mexicanos / 10.
- **Recomendación:** 7, con los 3 mexicanos como sensibilidad.
- **Impacto:** $33.49 / $35.50 / $33.92.
- **¿Requiere aprobación?** Sí.

**D9 — Múltiplos**
- **Problema:** cuáles usar.
- **Hallazgo:** EV/Ventas sobrevalúa a Soriana (margen bajo; $54); P/VL sin métrica en MXN (NA) y de poca relevancia en retail; NTM sin consenso en MXN.
- **Evidencia:** sección F.
- **Opciones:** (a) EV/EBITDA, EV/EBIT y P/U LTM; (b) + EV/Ventas; (c) + NTM vía CIQ en USD.
- **Recomendación:** (a); EV/Ventas = excluido con razón documentada; P/VL = NA; NTM = NA (o (c) si apruebas D11-b).
- **Impacto:** $33.49 vs $38.69.
- **¿Requiere aprobación?** Sí.

**D10 — Precisión de los múltiplos**
- **Problema:** CIQ redondea a 1 decimal.
- **Hallazgo:** recalcular no reproduce los múltiplos LTM de CIQ (definiciones de EBITDA distintas dentro del export).
- **Evidencia:** Chedraui 7.24x vs 5.7x.
- **Opciones:** (a) usar los múltiplos publicados; (b) recalcular.
- **Recomendación:** **(a)** (corrige mi recomendación del v1).
- **Impacto:** error máximo ±0.05x.
- **¿Requiere aprobación?** Sí.

**D11 — Moneda y métricas**
- **Problema:** CIQ en USD.
- **Hallazgo:** los múltiplos no tienen unidades; las métricas MXN del Excel son consistentes con la definición del múltiplo publicado.
- **Evidencia:** EBITDA de 6.3x de Soriana ≈ 11,900 mdp.
- **Opciones:** (a) métricas MXN LTM y puente 2T26; (b) métricas CIQ USD + tipo de cambio.
- **Recomendación:** (a).
- **Impacto:** evita un tipo de cambio sin fuente.
- **¿Requiere aprobación?** Sí.

**D12 — Transacciones**
- **Problema:** muestra débil.
- **Hallazgo:** 1/3 dentro de la ventana; 0/3 en México; 2 de control dudoso; datos de TEV inconsistentes.
- **Evidencia:** sección G.
- **Opciones:** (a) referencia no concluyente; (b) usar las 3 ($51.19); (c) solo la de la ventana ($22.22); (d) sin InRetail ($26.45).
- **Recomendación:** (a).
- **Impacto:** evita un valor no defendible.
- **¿Requiere aprobación?** Sí.

**D13 — Pesos de la combinada**
- **Problema:** la clase usa ⅓ cada uno.
- **Hallazgo:** con transacciones no defendibles, ⅓ introduce un valor débil.
- **Evidencia:** presentación diap. 18 y sección G.
- **Opciones:** (a) ⅓ cada uno (regla de clase), visible; (b) ½ DCF + ½ comps, con transacciones solo como referencia; (c) otros.
- **Recomendación:** mostrar (a) como cálculo de la regla de clase y (b) como resultado recomendado, ambos visibles.
- **Impacto:** depende de D12.
- **¿Requiere aprobación?** Sí.

**D14 — Múltiplo de salida 5.81x**
- **Problema:** descuento de 10 % sin fuente.
- **Hallazgo:** viene de la mediana de 3 pares (dic-25) × 0.9.
- **Evidencia:** `B232:B234`.
- **Opciones:** (a) mantener y pedir la fuente del 10 %; (b) vincular a Trading Comps.
- **Recomendación:** (a), para preservar el DCF.
- **Impacto:** $0.
- **¿Requiere aprobación?** Sí (fuente del 10 %).

**D15 — Escenarios Conservador / Base / Optimista**
- **Problema:** qué varía en cada uno.
- **Hallazgo:** los escenarios actuales de la app son inventados.
- **Evidencia:** `engine/analysis.ts`.
- **Opciones:** (a) solo inflación por el canal documentado; (b) + otras variables con rango documentado (necesito los rangos).
- **Recomendación:** (a), retirando los inventados.
- **Impacto:** escenarios de $30.89 a $31.71 (D5-a).
- **¿Requiere aprobación?** Sí.

**D16 (nueva) — Interés minoritario**
- **Problema:** el puente del Excel lo omite.
- **Hallazgo:** CIQ reporta 8.4 USD mm (≈154 mdp); la clase lo resta.
- **Evidencia:** diap. 7; CIQ Implied Valuation.
- **Opciones:** (a) restarlo (necesito la cifra del reporte 2T26 en MXN); (b) omitirlo por inmaterial (0.3 %).
- **Recomendación:** (a).
- **Impacto:** −$0.09.
- **¿Requiere aprobación?** Sí.

**D17 (nueva) — Kd de la iteración**
- **Problema:** 10 % (sin fuente) vs 13.02 % de mercado.
- **Hallazgo:** inconsistencia interna del Excel.
- **Evidencia:** `C61`, `B206` y `WACC!B31`.
- **Opciones:** (a) mantener 10 % y pedir la fuente; (b) usar 13.02 %.
- **Recomendación:** (a) hasta conocer la fuente del 10 %.
- **Impacto:** con 13.02 %: WACC 12.51 %, precio **$29.40** (−$1.76).
- **¿Requiere aprobación?** Sí.

**D18 (nueva) — Convención de descuento**
- **Problema:** la clase (CIQ) usa mitad de año; el Excel, fin de año.
- **Hallazgo:** no es un error; son convenciones distintas.
- **Evidencia:** diap. 15.
- **Opciones:** (a) mantener fin de año; (b) mitad de año.
- **Recomendación:** (a) (preservar el DCF).
- **Impacto:** con mitad de año: **$33.35**.
- **¿Requiere aprobación?** Sí.

**D19 (nueva) — Definición del CFO de 1S26**
- **Problema:** ¿el CFO incluye intereses pagados?
- **Hallazgo:** la conciliación de deuda neta sugiere que no.
- **Evidencia:** sección B.
- **Opciones:** (a) mantener; (b) ajustar si el CFO incluye intereses.
- **Recomendación:** (a), confirmándolo con el estado de flujos.
- **Impacto:** 0 a −$0.47.
- **¿Requiere aprobación?** Sí (confirmación).

---

## I. Cambios que propongo (todos pendientes de tu aprobación)

1. **Etiquetas del flujo de 1S26** en Excel y app ("FCF de 1S26 = −1,060.5; se resta del EV"). Sin cambio numérico.
2. **Libro de inflación integrado al maestro**, con regresiones calculadas en la hoja (`LN` + `LINEST`), sin coeficientes copiados de gráficos; sin el ×10 de la beta; con el exponente correcto (3.33 %); con 3.26 % y 4.00 % rotulados como supuestos de escenario.
3. **Registro de fuentes** de cada insumo (fuente, fecha, moneda, unidad, periodo, observado / supuesto).
4. **Dataset de la app con precisión completa**, extraído automáticamente del Excel (paridad exacta).
5. **Proyección por drivers en la app** (réplica de `Proyección Final`), necesaria para que la inflación se propague.
6. **Trading Comps** según D8–D11; **Precedent Transactions** como referencia según D12; **combinada** según D13.
7. **Escenarios documentados** (D15) en lugar de los inventados de la app; límites de los controles del Laboratorio justificados o retirados.
8. **Interés minoritario** (D16), si lo apruebas y me das la cifra.

## J. Cambios que NO propongo

- Modificar la fórmula del flujo de 1S26 (está correcta; mi propuesta v1 se retira).
- Sustituir βU 0.80 sin una fuente documentada.
- Cambiar el múltiplo de salida, la convención de fin de año, la iteración del WACC, la ponderación de métodos (variables externas / MC), Gordon o g = 3.5 %, salvo que lo decidas en D4, D14 o D18.
- Recalcular múltiplos con Financial Data, convertir con tipos de cambio sin fuente, usar EV/Ventas o P/VL.
- Agregar transacciones que no están en los datos, o ampliar la muestra con reglas que la clase no define.
- Usar la beta 0.41 o la recta IPC–precio como insumos del DCF.
- Transmitir la inflación a Rf, a g o a costos de forma diferencial sin documento que lo sustente.

## K. Lo que necesito que decidas o me proporciones

1. **Fuente del βU 0.80**, o el dato de Damodaran (retail de alimentos, mercados emergentes) con fecha (D3).
2. **Fuente de la fila 10** de inflación esperada (3.93 / 3.83 / 3.75 %) (D5).
3. Fuente del **Kd de 10 %** (D17) y del **descuento de 10 %** al múltiplo de salida (D14).
4. Cifra del **interés minoritario** al 2T26 en MXN (D16) y confirmación de si el **CFO incluye intereses pagados** (D19).
5. Fecha y fuente de **Rf 9.517 %** y **PRM 4.23 %**.
6. Tu elección en D1, D2, D4–D15 y D18.

## L. Arquitectura final propuesta

**Excel maestro.** Se conservan las 10 hojas actuales y se agregan:

| Hoja | Contenido |
|---|---|
| `Fuentes` | Registro de cada insumo: fuente, fecha, moneda, unidad, periodo, observado / supuesto, celda donde se usa |
| `Inflación` | Serie Banxico; modelos exponenciales calculados en la hoja; clasificación de escenarios |
| `Beta y Mercado` | Correlaciones, regresión corregida, recta IPC; nota de por qué no alimentan el DCF |
| `Escenarios` | Cautela / Base / Alcista: inflación → fila 10 → resultados (vía tabla de datos o copias controladas) |
| `Trading Comps` | Selección con criterio por empresa; múltiplos CIQ; 6 estadísticos; precio por múltiplo; promedio; NM / NA |
| `Precedent Transactions` | Criterios por operación; estadísticos; resultado marcado como referencia |
| `Valuación Combinada` | DCF, comps, transacciones, pesos visibles, rango y diferencia contra el precio |
| `Validación` | Controles PASS / FAIL (balance, WACC > g, Σ VP, puente, paridad de escenarios, estadísticos) |

**Aplicación.** Un módulo por metodología en `src/engine/`:

| Módulo | Función |
|---|---|
| `projection` | Nuevo: drivers → estados financieros, réplica de `Proyección Final` |
| `dcf` | Existente |
| `inflation` | Modelos y escenarios con su clasificación |
| `comps` | Trading Comps |
| `transactions` | Precedent Transactions |
| `combined` | Valuación combinada |
| `scenarios` | Escenarios documentados |

Datos por empresa en `src/data/soriana/` (perfil, proyección, comps, transacciones, inflación). Paridad automática contra un archivo de resultados **extraído del Excel maestro por script**. La interfaz solo presenta los resultados.

**Siguiente paso:** resolver contigo D1–D19. Sin implementar nada hasta entonces.
