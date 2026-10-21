# Cierre para regionales · recorrido por la app (21-oct-2026)

Rama: `regional-recorrido-app`. **No se hizo merge ni despliegue.** El equipo revisa la rama, abre el Pull Request hacia `main`
y, al aceptarlo, Vercel publica en https://valuflow-equity-lens.vercel.app (la misma URL del QR).

## a) Qué cambió (en palabras sencillas)

1. **Se quitó el modo de diapositivas.** Ya no existen los botones «Modo presentación» ni «Presentar», ni las diapositivas.
   Espacio y flechas del teclado ya no cambian de página. Se conservan los PDF, Excel, CSV, JSON, ZIP, la importación,
   el Laboratorio, los Anexos y la Biblioteca.
2. **La app es la presentación.** El menú superior sigue el orden del recorrido:
   - 00 · Acerca de
   - 01 · Valor
   - 02 · Flujos
   - 03 · Riesgo
   - 04 · Múltiplos
   - 05 · Transacciones
   - 06 · Conclusión
   - 07 · ESG y Gobierno Corporativo

   Al final de cada página hay botones **Anterior / Siguiente**, sin barra de avance. Las herramientas de apoyo (Laboratorio, Anexos, Valuaciones, Importar y Equipo) están en el menú **Más**.
   - **En celular:** barra inferior con ← Anterior · Secciones · Siguiente →.
3. **Código QR en la portada.**
   - Se genera dentro de la app, sin servicios externos, y apunta a https://valuflow-equity-lens.vercel.app; debajo se muestra la dirección.
   - Para otra URL: `VITE_DEMO_URL=https://… npm run build`.
4. **00 · Acerca de** (nueva) muestra:
   - 5 cifras: precio de referencia, valor de mercado, tiendas, ingresos 2T26 y colaboradores.
   - La gráfica mensual del precio, de nov-24 a sep-26, con el cierre del 30-jun-2026 marcado.
   - Las tiendas por formato en dos cortes, sin mezclarlos: cierre 2025 = 820 y 2T26 = 812.
   - Sodimac, el negocio digital y el inmobiliario.
   - Las presiones competitivas: Tiendas 3B, Bara, Bodega Aurrera Express y lo digital.
   - Dos hallazgos del equipo y un panel de fuentes.
   - El único logo que existe en `public/assets` es el de Soriana; los formatos se muestran con su nombre escrito.
5. **Precio de referencia: MXN $30.25, cierre del 30-jun-2026**, por indicación del profesor.
   - Entra por el Excel: `WACC!B13 = Inflación!B183`, después el extractor y luego `src/data/soriana.excel.ts`.
   - Cambia el valor de mercado del capital (E) y el WACC de mercado con el que arranca la iteración.
   - Se ve igual en la portada, las páginas 00, 01 y 06, el Laboratorio y las exportaciones.
   - Las cifras técnicas que siguen siendo del 25-sep-2026 (rango de 52 semanas, variación a 1 año, RSI) ahora llevan esa fecha.
6. **04 · Múltiplos.**
   - La muestra seleccionada (7 emisoras) aparece una sola vez, con la etiqueta «S&P Capital IQ, corte 30-jun-2026».
   - Las 3 cadenas de cálculo solo dicen «Muestra seleccionada · 7 emisoras».
   - La selección del Excel no cambió.
7. **06 · Conclusión** (antes «Combinada»; se cambió el nombre en la app, los PDF y la hoja del Excel exportado).
   - Arriba: el precio objetivo grande, el precio de referencia con su fecha, el potencial y la recomendación con la regla de ±5%.
   - Después, la metodología: 50% DCF + 50% Trading Comps, y Precedent Transactions de $23.74 solo como referencia, con peso 0%.
   - Luego, dos rangos de sensibilidad con su etiqueta: el del DCF y el del precio objetivo.
   - Al final, el detalle y el contraste externo en secciones desplegables.
8. **07 · ESG y Gobierno Corporativo** (nueva).
   - Tres bloques (Ambiental, Social y Gobierno), con 3 indicadores cada uno. Cada indicador trae su periodo, su fuente y una «Lectura» del equipo, separada del dato.
   - El Consejo se compara en dos cortes: FY2025 con 14 consejeros (4 independientes, 28.6%) y 2T26 con 13 (9 patrimoniales, 1 relacionado y 3 independientes, 23.08%).
   - También muestra los comités, la ética y un panel de fuentes con enlaces.
   - No hay calificaciones ESG inventadas.
9. **Legibilidad.**
   - El ancho máximo pasó de 1360 a 1560 px y los márgenes laterales se adaptan a la pantalla.
   - El texto pequeño subió de 11–12 px a 12.5–13.5 px y el de las tablas a 14.5–15 px.
   - No hay desbordamiento horizontal a 1366×768, 1280×720, 1024×768 ni 390×844.

## b) Archivos

- **Nuevos:**
  - `src/ui/pages/AboutPage.tsx`
  - `src/ui/pages/EsgPage.tsx`
  - `src/services/qr.ts`
  - `docs/RECORRIDO_REGIONAL.md`
  - La dependencia `qrcode-generator` 1.4.4 (MIT, va dentro del paquete).
- **Borrados:**
  - `src/ui/present/Deck.tsx` y `src/ui/present/deck.ts`
  - `src/styles/deck.css` (y su import en `src/main.tsx`)
  - `tests/deck.test.ts`
  - `docs/PRESENTACION.md`
- **Modificados:**
  - Controlador, estructura y modelo de vista: `src/ui/App.tsx` (recorrido, sin estado ni teclado de diapositivas), `src/ui/Shell.tsx` y `src/ui/viewmodel.ts`.
  - Componentes y páginas: `src/ui/relative.ts`, `src/ui/pages/*.tsx` y `src/ui/components/*.tsx`.
  - Estilos y configuración: `src/styles/app.css` y `src/config.ts` (DEMO_URL).
  - Datos y motor: `src/data/soriana.ts` (`about`, `esg`, `technicalDate`), `src/engine/types.ts` y `src/engine/analysis.ts` (etiquetas).
  - Reportes: `src/report/content.ts`, `src/report/charts.ts`, `src/services/xlsx.ts` y `src/services/exporter.ts`.
  - Pruebas: `tests/report.test.ts` y `tests/reactivity.test.ts`.
  - Documentación: `README.md` y `CLAUDE.md`.
- **Precio de referencia** (commit anterior de esta misma rama):
  - Scripts: `tools/excel/audit_pro.py` (sección 9) y `tools/excel/extract_dataset.py`.
  - Excel auditado: `excel/EXCEL FINAL PRO DEFINITIVO SORIANA - AUDITADO.xlsx`.
  - Datos generados: `src/data/soriana.excel.ts` (no se editó a mano).
  - Pruebas: `tests/excel-master.test.ts`.

## c) Precio y resultados del motor, antes y después

| Concepto | Antes ($33.48 · 25-sep-2026) | Ahora ($30.25 · 30-jun-2026) |
|---|---|---|
| Valor de mercado del capital (E = precio × 1,800 mm) | 60,264 mdp | 54,450 mdp |
| WACC de mercado (inicio de la iteración, motor con βU 0.1705) | 10.06% | 10.05% |
| WACC iterado (converge al valor DCF) | 9.56% | 9.56% |
| DCF por acción | $38.34 | $38.34 (diferencia < 1e‑7) |
| Trading Comps | $33.49 | $33.49 |
| Precedent Transactions LSEG/SDC (referencia, 0%) | $23.74 | $23.74 |
| Precio objetivo = 50% DCF + 50% Comps | $35.92 | $35.92 |
| Potencial frente al precio de referencia | +7.3% | **+18.7%** |
| Recomendación (umbral ±5%) | COMPRAR | **COMPRAR** |
| Señal del DCF solo | +14.5% | +26.7% |

- **Por qué casi no cambian el DCF ni el precio objetivo:** el WACC se itera con el valor intrínseco, así que el precio de mercado solo cambia el punto de partida.
- **Qué sí cambia:** el potencial, la señal y la capitalización de mercado.
- **Lo que no se tocó:**
  - βU 0.1705 de la regresión semanal: βL observada 0.2178, p ≈ 0.087, no significativa al 95%. Damodaran se muestra como referencia.
  - Pesos 50/50/0.
  - Soporte para varias empresas.
- **Validación del Excel auditado:** 49 PASS de 49.

## d) Fuentes y limitaciones

- **Precio:** serie mensual del Excel maestro, hoja Inflación; el punto de junio es el cierre del 30-jun-2026.
- **Tiendas.** No se mezclan cortes; cada columna trae su fuente.
  - Cierre 2025, por formato: reporte 4T25.
  - 2T26: el total de 812 sale de Resultados 2T26 (citado en AE 1); el desglose por formato sale de la prensa (Expansión, Líder Empresarial).
- **ESG.**
  - Las cifras ambientales y sociales vienen del Informe de Responsabilidad Social 2025 y de Fundación Soriana.
  - Gobierno 2T26 y el 96% de capacitación en ética vienen de la investigación del equipo (AE 1, sección 4, con base en el Cuestionario de Mejores Prácticas de la BMV); llevan la marca «Equipo».
  - FY2025 (14 consejeros, 4 independientes) está confirmado por HR Ratings (jul-2025).
- **Limitaciones:**
  - Desde el entorno de desarrollo no se pudieron abrir organizacionsoriana.com ni bmv.com.mx: el proxy lo bloquea. Las cifras ESG se verificaron con extractos de búsqueda, sin número de página.
  - **Revisar antes de exponer:**
    - La fecha de constitución del Comité de Riesgos (abr-2026) y la salida de F. Marroquín Lavín (29-abr-2026) vienen de AE 1; en fuentes públicas solo se confirmaron parcialmente.
    - No se localizó una declaración de verificación externa del Informe RS 2025, y la app lo dice.
    - Los enlaces del panel de fuentes llevan al sitio corporativo, a la BMV, a HR Ratings y a dos PDF de Soriana: el reporte 4T25 y el Código de Ética. Esos enlaces no se pudieron abrir desde aquí.
  - Bara y Bodega Aurrera Express se mencionan por la retroalimentación del profesor y la variable «hard discount» del modelo. No se inventó ninguna cifra para ellas.

## e) Pruebas (resultados reales de esta rama)

- `npm test`: **118 de 118**.
  - Antes eran 122; las 4 de `tests/deck.test.ts` se fueron con las diapositivas.
- `npm run typecheck`: sin errores.
- `npm run build`: correcto.
- **Navegador** (Chromium con el build de producción, 1366×768): **22 de 22**.
  - Portada:
    - El QR existe y la URL está visible; al leer el QR de la captura se obtiene https://valuflow-equity-lens.vercel.app.
    - Muestra $35.92, $30.25, +18.7% y Comprar.
    - No hay botones ni elementos del modo diapositivas.
  - Navegación:
    - Están las secciones 00–07.
    - Espacio y flechas no cambian de página.
    - «Siguiente» recorre de 01 a 07.
  - Contenido:
    - 00 trae el precio, 820/812 tiendas y las amenazas.
    - 07 trae los tres bloques y el Consejo.
    - 06 trae el precio objetivo, el potencial, la recomendación, los pesos y los rangos.
    - 04 trae 7 emisoras una sola vez y el corte CIQ.
  - Laboratorio:
    - El menú «Más» abre el Laboratorio.
    - Con βU 0.90 cambia el precio objetivo, y «Restaurar» lo regresa a $35.92.
  - Generales:
    - No aparece «combinada» en el recorrido.
    - Sin errores de consola.
    - Sin solicitudes externas.
- **Exportaciones**, todas descargadas y sin errores:
  - PDF ejecutivo: 3 páginas.
  - PDF técnico: 33 páginas.
  - Excel: hoja «Conclusión».
  - CSV, JSON y ZIP.
  - Con el escenario modificado del Laboratorio: PDF ejecutivo, Excel y JSON.
- **Responsive:** sin desbordamiento horizontal en las 13 vistas a 1366×768, 1280×720, 1024×768 y 390×844.

## f) Defectos conocidos

- La tabla de discrepancias y `docs/CIERRE_PROYECTO.md` conservan, como historial, cifras con el precio anterior ($33.48) y menciones a un modelo individual del reporte comparativo. No alimentan ningún cálculo.
- El rango de 52 semanas, la variación a 1 año y el RSI siguen al 25-sep-2026 (fechados en pantalla). No hay una serie diaria en el Excel para recalcularlos al 30-jun.
- Las fuentes ESG necesitan una lectura final en el PDF oficial para citar páginas (ver d).

## g) Commits y rama

- Rama `regional-recorrido-app`, con dos commits sobre `main` (merge del PR #3):
  1. Precio de referencia del 30-jun-2026 desde el Excel.
  2. Recorrido 00–07, sin diapositivas, QR, Acerca de, ESG, Conclusión, Múltiplos y legibilidad.
- Para publicar: abrir un PR `regional-recorrido-app → main`, revisar la vista previa de Vercel y aceptar el merge.
