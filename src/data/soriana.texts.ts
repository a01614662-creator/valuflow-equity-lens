// Textos del estudio de Soriana con marcadores {clave} que se llenan con cifras vivas del motor (src/report/context.ts).
// Con los supuestos del Excel, cada texto reproduce palabra por palabra el de la hoja Conclusiones / Validación / WACC
// (tests/texts.test.ts lo comprueba). Al cambiar supuestos en el Laboratorio, las cifras se recalculan solas.
import type { TextTemplates } from '../engine/types';

export const SORIANA_TEXTS: TextTemplates = {
  conclusions: [
    ['Datos', 'Se usaron {weeksS} semanas de precios de Soriana B y {weeksI} del IPC ({pricePeriod}), {quincenas} quincenas de inflación de Banxico y los estados financieros de Soriana al segundo trimestre de 2026.'],
    ['Inflación', 'Los modelos de tendencia proyectan una inflación de entre {inflMin} y {inflMax}. La inflación viene bajando desde el pico de 2022; el escenario base usa {inflBase}.'],
    ['Inflación y precio de Soriana', 'La relación no es estable: en toda la muestra la correlación es {corrAll}, en los últimos 12 meses {corr12} y en los últimos 6 meses {corr6}. Con rendimientos contra cambios de inflación es solo {corrRet}: la inflación por sí sola no explica el precio, porque sube las ventas de Soriana pero también sus costos y las tasas.'],
    ['Soriana y el mercado (IPC)', 'Soriana se mueve poco con el mercado: la correlación semanal con el IPC es {corrIpc} y la beta es {beta2}. El mercado explica solo {r2pct1} de sus movimientos; el resto es riesgo propio de la empresa.'],
    ['Beta', 'Una beta de {beta2} describe una acción defensiva (vende productos básicos). {betaSigText}'],
    ['WACC', 'El costo del capital es {ke} y el WACC que descuenta los flujos es {wacc}. Es la tasa que más pesa en el valor: medio punto más de WACC baja el valor a {waccUpPrice} pesos y medio punto menos lo sube a {waccDownPrice}.'],
    ['Crecimiento perpetuo', 'El g base es {g1}, casi igual a la inflación esperada: Soriana es una empresa madura que no crece en términos reales (sus ventas reales bajaron {realHistAbs1} al año en 2023 a 2025) y reinvierte menos de lo que se desgasta.'],
    ['Valuación', 'El valor terminal (promedio de Gordon y múltiplo) es {tvBlend} mdp y pesa {tvWeight0} del valor de la empresa. El Enterprise Value es {ev} mdp al cierre de 2025, el Equity Value {equity} mdp y el valor por acción {price} pesos.'],
    ['Escenarios', 'El valor va de {scenLo} pesos (conservador) a {scenHi} (optimista), con el base en {scenBase}. Las variables que más mueven el valor son {torn1}, {torn2} y {torn3}.'],
    ['Validación', 'Contra un precio de mercado de {market} pesos, el modelo da una diferencia de {upside1} y recomienda {rec}. {checksSummary}.'],
    ['Conclusión final', 'Con los supuestos {caseLabel}, Soriana vale {price} pesos por acción contra {market} del mercado. El resultado depende sobre todo del WACC (y por lo tanto de la beta), del margen de operación y del crecimiento perpetuo. Como la beta es baja y poco significativa, una beta más alta acercaría el valor al precio de mercado; por eso la recomendación debe leerse junto con la tabla de sensibilidad y los escenarios.']
  ],
  summary: 'Con el escenario {caseName}, el modelo estima {price} pesos por acción contra {market} del mercado: una diferencia de {diff} pesos ({upside1}). La recomendación es {rec}. En los tres escenarios el valor va de {scenLo} a {scenHi} pesos.',
  sensitivity: [
    'Si el WACC sube medio punto (a {waccUp}), el valor baja a {waccUpPrice} pesos; si baja medio punto, sube a {waccDownPrice}. Si g sube medio punto, el valor pasa a {gUpPrice}; si baja medio punto, a {gDownPrice}.',
    'Moviendo una variable a la vez (hoja Escenarios, tornado), la que más cambia el valor es {torn1} (rango de {torn1Range} pesos), seguida de {torn2} ({torn2Range}) y {torn3} ({torn3Range}).'
  ],
  reasons: [
    'La beta salió baja ({beta2}) y el mercado explica muy poco de los movimientos de Soriana (R cuadrada de {r2pct1}). Con ella el costo del capital queda en {ke}, muy cerca del costo de la deuda ({kdPre1}). Un inversionista probablemente pide más rendimiento a una acción, y eso explicaría por qué el mercado paga distinto de lo que dice el modelo.',
    'El valor terminal pesa {tvWeight0} del valor de la empresa: lo que se supone para después de 2030 (g y múltiplo de salida) mueve mucho el resultado.',
    'Los analistas que siguen a Soriana tienen un precio objetivo promedio de {consensus} pesos con recomendación de venta: el mercado es más pesimista que el escenario base sobre ventas y márgenes.',
    'El mercado puede estar descontando riesgos que el modelo no capta del todo: pérdida de clientes frente a las tiendas de descuento, cierre de tiendas y poca liquidez de la acción (se negocia poco).',
    'El precio de un día se mueve por noticias de corto plazo; el DCF mide el valor de largo plazo con información pública al 30 de junio de 2026.'
  ],
  limits: [
    'Las proyecciones de 2026 a 2030 dependen de supuestos de ventas y márgenes que pueden no cumplirse.',
    'La beta depende del periodo y la frecuencia de los datos. Con datos semanales de 5 años {betaSigShort} (probabilidad de {betaP3}); con otra ventana podría cambiar.',
    'La inflación se supone igual para todos los años dentro de cada escenario.',
    'El valor terminal promedia dos métodos que no coinciden: con el WACC actual, el múltiplo de salida implica un crecimiento perpetuo de solo {impliedG}, contra {g1} en Gordon.',
    'El flujo libre del primer semestre de 2026 fue negativo (inversión mayor que el flujo de operación) y se ajusta en el puente al 30 de junio.',
    'La tasa libre de riesgo y la prima de mercado vienen del modelo anterior; conviene confirmarlas con una fuente fechada.',
    'Los precios de Soriana y del IPC vienen de Investing.com.'
  ],
  wacc: [
    'Fórmula: WACC = (peso del capital x costo del capital) + (peso de la deuda x costo de la deuda x (1 - tasa de impuestos)).',
    'Costo del capital: tasa libre de riesgo + beta x prima de riesgo de mercado (modelo CAPM).',
    'Tasa libre de riesgo = {rf}: lo que paga el bono del gobierno a 10 años (Bono M). Es lo mínimo que se gana sin riesgo.',
    'Prima de riesgo de mercado = {prm}: el rendimiento extra que se pide por invertir en acciones en lugar de bonos.',
    'Beta = {betaMkt2}: qué tanto se mueve Soriana con el mercado (sale de la regresión semanal, ajustada a la deuda de Soriana).',
    'Costo del capital = {keMarket}: el rendimiento que exigen los accionistas.',
    'Costo de la deuda antes de impuestos = {kdMarket}: intereses de 2025 entre la deuda. En el DCF se usa {kdPre}, la tasa que se espera pagar.',
    'Tasa de impuestos = {taxMarket0}: los intereses se deducen de impuestos, por eso la deuda cuesta menos después de impuestos.',
    'Deuda = {debt} mdp (bancos, bolsa y arrendamientos) y capital a valor de mercado = {marketCap} mdp (precio por número de acciones).',
    'Estructura financiera: {wDMarket} deuda y {wEMarket} capital.',
    'WACC a valor de mercado = {waccMarket}.',
    'WACC que usa el DCF = {wacc}. Es el WACC iterado: los pesos de deuda y capital se calculan con el valor del capital que sale del propio DCF (hoja Proyección Final, filas 205 a 222), hasta que el resultado ya no cambia.',
    'Interpretación: el WACC es la tasa con la que se traen a valor de hoy los flujos futuros de Soriana. Es el rendimiento mínimo que piden juntos los accionistas y los bancos. Entre más alto es el WACC, menos valen hoy los flujos futuros y menor es el valor de la empresa.'
  ],
  // Las 9 preguntas de análisis del documento de la Sesión 3, con respuestas redactadas sobre cifras vivas.
  questions: [
    ['¿Hacia dónde va la inflación y qué modelo la explica mejor?', 'A la baja: {slopesText}. La tendencia larga explica mejor la serie (R² de {r2LongMin} a {r2LongMax}) porque capta la bajada desde 2022; los modelos de un año tienen R² de {r2ShortMin} a {r2ShortMax}. Las proyecciones exponenciales van de {inflMin} a {inflMax}; el escenario base usa {inflBase}, el conservador {inflCons} y el optimista {inflOpt}.'],
    ['¿Qué relación hay entre la inflación y el precio de Soriana?', 'No es estable: {corrAllS} en toda la muestra de {monthsValid} meses, {corr12S} en los últimos 12 meses, {corr6S} en los últimos 6 y {corrRetS} en rendimientos contra cambios de inflación. La inflación sube las ventas, pero también los costos y las tasas; sola explica poco (R² de {r2PriceLin} lineal y {r2PriceExp} exponencial). Con la inflación base, la regresión daría un precio de {priceAtBaseLin} MXN (lineal) y {priceAtBaseExp} MXN (exponencial).'],
    ['¿Cómo se mueve Soriana frente al mercado (IPC)?', 'Poco: la correlación semanal es {corrIpc} y el mercado explica {r2pct1} de sus movimientos. En {weeksS} semanas Soriana rindió {retS} anual con volatilidad de {volS}, contra {retI} y {volI} del IPC; acumulado {cumS} contra {cumI}. El resto del movimiento es riesgo propio de la empresa.'],
    ['¿Qué tan confiable es la beta?', 'Poco. La beta de la regresión es {beta4} con error típico de {betaSE4}; el estadístico t es {betaT2} y el valor p {betaP3}, {betaSigShort}. El intervalo de confianza de 95% va de {betaLo3} a {betaHi3}{ciZero}. Un error típico arriba o abajo mueve el valor entre {tornBetaLo} y {tornBetaHi} MXN. Es el eslabón más débil del modelo.'],
    ['¿Qué pasa con el valor si cambia el WACC o g?', '±0.5 pp de WACC lo mueve de {waccDownPrice} a {waccUpPrice} MXN; ±0.5 pp de g, de {gDownPrice} a {gUpPrice} MXN. El WACC pesa más que g. El WACC usado es {wacc} (Ke de {ke}) y g es {g2}.'],
    ['¿Por qué se eligió g = {g2}?', 'Da un crecimiento real casi nulo ({realBase}), coherente con ventas reales a la baja ({realHist1} anual en 2023 a 2025) y una reinversión neta {lastYear} {reinvestSign} ({reinvest} mdp). Es menor que el WACC ({wacc}), que el Bono M esperado ({bond}) y que el PIB nominal de largo plazo ({nominalLT}); cumple {controlsPassed} de {controlsTotal} controles.'],
    ['¿Qué variables explican la diferencia entre escenarios?', 'En orden: {tornList}. El Conservador vale {consVsBase} menos que el Base y el Optimista {optVsBase} más; el WACC va de {waccMin} a {waccMax}.'],
    ['¿Por qué el valor estimado es distinto del precio de mercado?', 'La beta baja abarata el costo de capital (Ke de {ke}, cerca del Kd de {kdPre}); el valor terminal pesa {tvWeight1}; el mercado es más pesimista sobre ventas y márgenes (consenso {consensus} MXN, venta); hay riesgos que el modelo no capta (descuento, cierre de tiendas, poca liquidez) y el precio de un día refleja noticias de corto plazo.'],
    ['¿Se compra, se mantiene o se vende?', '{caseName}: {rec} ({price} contra {market} MXN, {upsideS}, {thresholdText}). {scenRecs}. El precio combinado con múltiplos, {combined} MXN ({combinedUpS}), {combinedText}; la recomendación debe leerse junto con los escenarios y la debilidad de la beta.']
  ]
};
