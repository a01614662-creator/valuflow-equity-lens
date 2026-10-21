# Logos de marca (assets locales)

Registro: `src/data/brands.json`. Archivos: `public/assets/brands/`. Componente: `src/ui/components/BrandLogo.tsx`
(espacio de tamaño fijo, `object-fit: contain`, nombre visible siempre; si no hay archivo o falla, muestra el nombre como texto).
La app **no** carga imágenes remotas: todo logo se sirve desde el propio sitio.

Los logos identifican entidades en un proyecto académico (Tecnológico de Monterrey, Campus San Luis Potosí). No implican
patrocinio, autoría ni aval de ninguna empresa. Banamex aparece solo como contexto del «Reto Banamex»; Banamex no patrocina,
no es autor ni avala esta valuación. Las marcas pertenecen a sus titulares; conservar las notas o licencias de cada fuente.

Fecha de consulta del registro: 2026-10-21.

| Entidad | Uso en la app | Archivo local | Estado | Fuente (página) | Descarga | Notas |
|---|---|---|---|---|---|---|
| Organización Soriana | Marca del caso (portada, encabezado, 00) | `public/assets/brands/soriana.png` | incluido | https://www.organizacionsoriana.com/ | repo:public/assets/soriana.svg | PNG renderizado desde el SVG que ya usaba la app (paquete del equipo). |
| Tecnológico de Monterrey | Identidad institucional | `public/assets/brands/tecnologico_de_monterrey.png` | incluido | https://tec.mx/ | repo:public/assets/tec.svg | PNG renderizado desde el SVG que ya usaba la app (paquete del equipo). |
| Banamex | Encabezado · contexto «Reto Banamex» (sin patrocinio ni aval) | `public/assets/brands/banamex.png` | provisional | https://www.banamex.com/ | https://www.banamex.com/solicita-tu-tarjeta-credito-en-linea/assets/img/ilustraciones/Banamex.svg | Provisional: PNG del paquete del equipo, extraído del Reporte Ejecutivo SORIANA - BANAMEX (320×84 de origen). Reemplazar por la variante oficial SVG al tener acceso. |
| Tiendas 3B (BBB Foods) | 00 · Presiones competitivas | — | pendiente | https://www.tiendas3b.com/ | manual (sitio oficial) | Obtener del sitio oficial. El archivo de Commons (File:3B_logo.svg) no documenta fuente: no aceptarlo automáticamente. |
| Tiendas Bara | 00 · Presiones competitivas | — | pendiente | https://bara.com.mx/ | manual (sitio oficial) | Obtener el logo del encabezado del sitio oficial. |
| Bodega Aurrera Express (Walmart de México) | 00 · Presiones competitivas | — | pendiente | https://www.walmex.mx/nosotros/formatos-de-negocio.html | manual (sitio oficial) | Referencia corporativa histórica (Flickr de Walmart de México, 2015): confirmar vigencia contra los formatos actuales de Walmex antes de usarla. |
| Grupo Comercial Chedraui | 04 · Muestra de Trading Comps (CHDRAUI B) | — | pendiente | https://www.chedraui.com.mx/ | https://commons.wikimedia.org/wiki/Special:FilePath/Chedraui2022logo.png | Commons: PNG atribuido a Chedraui. |
| Grupo Mateus S.A. | 04 · Muestra de Trading Comps (GMAT3) | — | pendiente | https://www.grupomateus.com.br/ | https://commons.wikimedia.org/wiki/Special:FilePath/Logomarca_do_grupo_mateus.png | Commons: PNG atribuido a grupomateus.com.br. |
| Walmart de México y Centroamérica | 04 · Muestra de Trading Comps (WALMEX *) | — | pendiente | https://www.walmartmexico.com/ | https://commons.wikimedia.org/wiki/Special:FilePath/Walmart_M%C3%A9xico_y_Centroam%C3%A9rica_logo_(2025).svg | Commons: logo 2025 (SVG; se rasteriza a PNG). |
| La Comer | 04 · Muestra de Trading Comps (LACOMER UBC) | — | pendiente | https://www.lacomer.com.mx/ | manual (sitio oficial) | Usar el logo renovado anunciado por La Comer (publicación oficial en LinkedIn, 2023). |
| Sendas Distribuidora S.A. (Assaí Atacadista) | 04 · Muestra de Trading Comps (ASAI3) | — | pendiente | https://www.assai.com.br/ | https://commons.wikimedia.org/wiki/Special:FilePath/Assa%C3%AD_Atacadista_logo_2024.svg | Marca comercial Assaí; en pantalla se muestra el nombre del emisor Sendas Distribuidora S.A. |
| Cencosud S.A. | 04 · Muestra de Trading Comps (CENCOSUD) | — | pendiente | https://www.cencosud.com/ | https://commons.wikimedia.org/wiki/Special:FilePath/Cencosud_logo.svg | Commons: vector basado en archivo corporativo; validar vigencia. |
| InRetail Perú Corp. | 04 · Muestra de Trading Comps (INRETC1) | — | pendiente | https://www.inretail.pe/es/inversionistas/reportes-financieros | manual (sitio oficial) | Wordmark del emisor (no de una división Consumer/Malls/Pharma). |
| Falabella S.A. | 00 · Sodimac (socio 50/50); excluida de la muestra de comparables | — | pendiente | https://investors.grupofalabella.com/ | https://commons.wikimedia.org/wiki/Special:FilePath/Falabella.svg | Commons; comprobar versión vigente. |
| Sodimac | 00 · Negocios relacionados | — | pendiente | https://investors.grupofalabella.com/english/business-units/sodimac/ | https://commons.wikimedia.org/wiki/Special:FilePath/Logotipo_Sodimac.svg | Commons; atribuido a S.A.C.I. Falabella. |

## Estado al 21-oct-2026

- **Incluidos:** Soriana y Tecnológico de Monterrey (PNG del paquete del equipo, renderizados desde los SVG que ya usaba la app)
  y Banamex (**provisional**: PNG del paquete del equipo, extraído del Reporte Ejecutivo SORIANA - BANAMEX; reemplazar por la
  variante oficial SVG de banamex.com en cuanto se pueda descargar).
- **Pendientes:** 3B, Bara, Bodega Aurrera Express, Chedraui, Grupo Mateus, Walmart de México, La Comer, Sendas/Assaí, Cencosud,
  InRetail, Falabella y Sodimac. El entorno donde se preparó la rama no tiene permiso de red hacia `upload.wikimedia.org`,
  `commons.wikimedia.org` ni los sitios oficiales (el proxy responde 403), así que **no se descargó ni se dibujó ningún logo**.
  Mientras tanto, cada tarjeta muestra el nombre en el espacio reservado del logo.
- El Puerto de Liverpool, FEMSA y Falabella están **excluidos** de la muestra activa de Trading Comps (selección del Excel), por eso
  no llevan tarjeta de logo en 04 · Múltiplos.

## Cómo completarlos

1. Con acceso a Internet: `python3 -m pip install requests pillow cairosvg` y `python3 tools/brands/fetch_logos.py`
   (descarga las marcas con URL registrada, convierte SVG a PNG transparente y actualiza `brands.json`).
2. Para las marcas sin URL directa (3B, Bara, Bodega Aurrera Express, La Comer, InRetail): guardar el PNG oficial como
   `public/assets/brands/<id>.png` y registrar con `python3 tools/brands/fetch_logos.py --manual <id> <url_de_la_página_fuente>`.
3. Revisar cada PNG a ojo (marca correcta, versión vigente, proporción, transparencia). Para Bodega Aurrera Express, contrastar la
   pieza corporativa de 2015 con los formatos actuales de Walmex antes de usarla.
4. `npm test` y `npm run build`; revisar la vista previa de Vercel.
