#!/usr/bin/env python3
"""Descarga los logos pendientes de src/data/brands.json, los convierte a PNG transparente y actualiza el registro.

Uso (desde la raíz del repositorio, con acceso a Internet):
    python3 -m pip install requests pillow cairosvg
    python3 tools/brands/fetch_logos.py            # solo marcas con URL de descarga y sin archivo
    python3 tools/brands/fetch_logos.py --force    # vuelve a descargar todas las que tienen URL

Reglas (prompt de pulido regional):
- Solo URLs registradas en brands.json (sitio oficial o Wikimedia Commons con fuente identificable). Nada de hotlinks en la app.
- SVG → PNG con transparencia, lado largo 1000 px, sin deformar el viewBox; raster → se conserva la resolución original.
- Se recorta solo el margen transparente vacío. Nunca se recolorea ni se redibuja la marca.
- Las marcas sin URL directa (3B, Bara, Bodega Aurrera Express, La Comer, InRetail) se obtienen a mano del sitio oficial,
  se guardan en public/assets/brands/<id>.png y se registran con --manual <id> <url_fuente>.
Después de correrlo: revisar cada PNG a ojo, `npm test`, `npm run build` y confirmar la vista previa.
"""
import datetime, hashlib, io, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REG = ROOT / 'src/data/brands.json'
OUT = ROOT / 'public/assets/brands'
UA = {'User-Agent': 'ValuFlow-academic-project/1.0 (Tecnologico de Monterrey; logo registry)'}


def trim(im):
    from PIL import Image
    im = im.convert('RGBA')
    box = im.getchannel('A').getbbox()
    return im.crop(box) if box else im


def to_png(data: bytes, is_svg: bool):
    from PIL import Image
    if is_svg:
        import cairosvg
        data = cairosvg.svg2png(bytestring=data, output_width=1000)
    im = trim(Image.open(io.BytesIO(data)))
    if max(im.size) > 1600:
        im.thumbnail((1600, 1600), Image.LANCZOS)
    return im


def main():
    import requests
    reg = json.loads(REG.read_text(encoding='utf-8'))
    today = datetime.date.today().isoformat()
    if len(sys.argv) >= 4 and sys.argv[1] == '--manual':
        bid, src = sys.argv[2], sys.argv[3]
        f = OUT / (bid + '.png'); assert f.exists(), f'falta {f}'
        e = reg['brands'][bid]; e.update(file=f.name, status='incluido', source=src, accessed=today, sha256=hashlib.sha256(f.read_bytes()).hexdigest())
    else:
        force = '--force' in sys.argv
        for bid, e in reg['brands'].items():
            url = e.get('download')
            if not url or url.startswith('repo:') or (e.get('file') and not force) or e.get('status') == 'provisional' and not force:
                continue
            try:
                r = requests.get(url, headers=UA, timeout=30, allow_redirects=True); r.raise_for_status()
                is_svg = r.url.lower().endswith('.svg') or 'svg' in r.headers.get('content-type', '')
                im = to_png(r.content, is_svg)
                f = OUT / (bid + '.png'); im.save(f, optimize=True)
                e.update(file=f.name, status='incluido', download_resolved=r.url, accessed=today, size=list(im.size), sha256=hashlib.sha256(f.read_bytes()).hexdigest())
                print('OK  ', bid, im.size, r.url)
            except Exception as x:  # se deja pendiente: la app muestra el nombre como texto
                print('FALLO', bid, x)
    reg['accessed'] = today
    REG.write_text(json.dumps(reg, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
