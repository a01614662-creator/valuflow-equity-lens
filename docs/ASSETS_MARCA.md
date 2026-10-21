# Logos de marca (assets locales)

Registro: `src/data/brands.json`. Archivos: `public/assets/brands/`. Componente: `src/ui/components/BrandLogo.tsx`
(espacio de tamaño fijo, `object-fit: contain`, nombre visible siempre; si no hay archivo o falla, muestra el nombre como texto).
La app **no** carga imágenes remotas: todo logo se sirve desde el propio sitio.

Los logos identifican entidades en un proyecto académico (Tecnológico de Monterrey, Campus San Luis Potosí). No implican
patrocinio, autoría ni aval de ninguna empresa. Banamex aparece solo como contexto del «Reto Banamex»; Banamex no patrocina,
no es autor ni avala esta valuación. Las marcas pertenecen a sus titulares; conservar las notas o licencias de cada fuente.

Fecha de consulta del registro: 2026-10-21.

| Entidad | Uso en la app | Archivo local | Estado | Fuente (página) | Notas |
|---|---|---|---|---|---|
| Organización Soriana | Marca del caso (portada, encabezado, 00) | `public/assets/brands/soriana.png` | incluido | https://www.organizacionsoriana.com/ | PNG renderizado desde el SVG que ya usaba la app (paquete del equipo). |
| Tecnológico de Monterrey | Identidad institucional | `public/assets/brands/tecnologico_de_monterrey.png` | incluido | https://tec.mx/ | PNG renderizado desde el SVG que ya usaba la app (paquete del equipo). |
| Banamex | Encabezado · contexto «Reto Banamex» (sin patrocinio ni aval) | `public/assets/brands/banamex.png` | provisional | https://www.banamex.com/ | Provisional: PNG del paquete del equipo, extraído del Reporte Ejecutivo SORIANA - BANAMEX (320×84 de origen). Reemplazar por la variante oficial SVG al tener acceso. El 21-oct-2026 el equipo envió otra imagen (variante anterior, letras azules, con fondo de cuadros incrustado): no se usó. |
| Tiendas 3B (BBB Foods) | 00 · Presiones competitivas | `public/assets/brands/tiendas_3b.png` | incluido | https://www.tiendas3b.com/ | PNG proporcionado por el equipo (logotipo circular «BBB»). Origen exacto no documentado: confirmar contra tiendas3b.com. |
| Tiendas Bara | 00 · Presiones competitivas | `public/assets/brands/bara.png` | incluido | https://bara.com.mx/ | PNG proporcionado por el equipo (carrito con la marca Bara). |
| Bodega Aurrera Express (Walmart de México) | 00 · Presiones competitivas | `public/assets/brands/bodega_aurrera_express.png` | incluido | https://www.walmex.mx/nosotros/formatos-de-negocio.html | SVG proporcionado por el equipo: logo de la marca Aurrera (Bodega Aurrera, Walmart de México); no muestra la palabra «Express». Se usa como identificador de la familia de formatos; la tarjeta dice «Bodega Aurrera Express». |
| Grupo Comercial Chedraui | 04 · Muestra de Trading Comps (CHDRAUI B) | `public/assets/brands/chedraui.png` | incluido | https://www.chedraui.com.mx/ | Imagen proporcionada por el equipo (logotipo con «cuesta menos»), equivalente al archivo de Commons Chedraui2022logo.png. |
| Grupo Mateus S.A. | 04 · Muestra de Trading Comps (GMAT3) | `public/assets/brands/grupo_mateus.png` | incluido | https://www.grupomateus.com.br/ | PNG proporcionado por el equipo, equivalente al archivo de Commons Logomarca_do_grupo_mateus.png. Trae fondo blanco propio (se usa sobre tarjeta blanca). |
| Walmart de México y Centroamérica | 04 · Muestra de Trading Comps (WALMEX *) | `public/assets/brands/walmart_mexico.png` | incluido | https://www.walmartmexico.com/ | SVG de Commons «Walmart México y Centroamérica logo (2025)» proporcionado por el equipo; rasterizado a PNG transparente (1000 px). |
| La Comer | 04 · Muestra de Trading Comps (LACOMER UBC) | `public/assets/brands/la_comer.png` | incluido | https://www.lacomer.com.mx/ | PNG proporcionado por el equipo: símbolo del pelícano de La Comer en su versión de ícono (fondo verde). No incluye el nombre; la tarjeta lo muestra en texto. |
| Sendas Distribuidora S.A. (Assaí Atacadista) | 04 · Muestra de Trading Comps (ASAI3) | `public/assets/brands/sendas_assai.png` | incluido | https://www.assai.com.br/ | SVG de Commons «Assaí Atacadista logo 2024» proporcionado por el equipo; en pantalla se muestra el emisor Sendas Distribuidora S.A. |
| Cencosud S.A. | 04 · Muestra de Trading Comps (CENCOSUD) | `public/assets/brands/cencosud.png` | incluido | https://www.cencosud.com/ | SVG de Commons «Cencosud logo» (licencia indicada en el archivo: CC BY-SA 3.0) proporcionado por el equipo; rasterizado a PNG transparente. |
| InRetail Perú Corp. | 04 · Muestra de Trading Comps (INRETC1) | `public/assets/brands/inretail_peru.png` | incluido | https://www.inretail.pe/es/inversionistas/reportes-financieros | PNG proporcionado por el equipo: wordmark del emisor InRetail (no de una división). |
| Falabella S.A. | 00 · Sodimac (socio 50/50); excluida de la muestra de comparables | `public/assets/brands/falabella.png` | incluido | https://investors.grupofalabella.com/ | SVG de Commons «Falabella» proporcionado por el equipo; rasterizado a PNG transparente. |
| Sodimac | 00 · Negocios relacionados | `public/assets/brands/sodimac.png` | incluido | https://investors.grupofalabella.com/english/business-units/sodimac/ | SVG de Commons «Logotipo Sodimac» proporcionado por el equipo; rasterizado a PNG transparente. |

## Estado al 21-oct-2026

- **Incluidos (15, todos los requeridos):** Soriana, Tec, Banamex (provisional, del reporte del equipo), Tiendas 3B, Bara,
  Bodega Aurrera (logo de la marca Aurrera, sin la palabra «Express»), Chedraui, Grupo Mateus, Walmart de México, La Comer
  (símbolo del pelícano), Sendas/Assaí, Cencosud, InRetail, Falabella y Sodimac. Los enviados por el equipo el 21-oct-2026
  (imágenes o SVG) se convirtieron a PNG transparente sin deformar ni recolorear, y cada PNG se revisó a ojo sobre fondo claro y oscuro.
- **No usado:** una segunda imagen de Banamex enviada por el equipo (variante anterior con letras azules y fondo de cuadros
  incrustado, no transparente).
- El Puerto de Liverpool, FEMSA y Falabella están **excluidos** de la muestra activa de Trading Comps (selección del Excel), por eso
  no llevan tarjeta de logo en 04 · Múltiplos. Falabella aparece junto a Sodimac solo como socio.

## Cómo completarlos

1. Con acceso a Internet: `python3 -m pip install requests pillow cairosvg` y `python3 tools/brands/fetch_logos.py`
   (descarga las marcas con URL registrada, convierte SVG a PNG transparente y actualiza `brands.json`).
2. Para las marcas sin URL directa (3B, Bara, Bodega Aurrera Express, La Comer, InRetail): guardar el PNG oficial como
   `public/assets/brands/<id>.png` y registrar con `python3 tools/brands/fetch_logos.py --manual <id> <url_de_la_página_fuente>`.
3. Revisar cada PNG a ojo (marca correcta, versión vigente, proporción, transparencia). Para Bodega Aurrera Express, contrastar la
   pieza corporativa de 2015 con los formatos actuales de Walmex antes de usarla.
4. `npm test` y `npm run build`; revisar la vista previa de Vercel.
