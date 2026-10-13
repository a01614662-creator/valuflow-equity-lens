// Prueba de extremo a extremo de las exportaciones (Playwright + Chromium). Uso:
//   node tests/e2e/export.cjs <url> <carpeta de salida> [--offline] [--lab]
// Descarga PDF completo, resumen ejecutivo, XLSX y ZIP desde el menú Exportar y los deja en la carpeta.
const path = require('path');
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
const [url, out] = process.argv.slice(2), offline = process.argv.includes('--offline'), lab = process.argv.includes('--lab');
(async () => {
  const b = await pw.chromium.launch({ args: ['--no-proxy-server'] });
  const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 1000 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(1200);
  if (offline) await ctx.setOffline(true);
  await p.click('text=Explorar valuación'); await p.waitForTimeout(500);
  if (lab) {
    await p.click('header nav button:has-text("Laboratorio")'); await p.waitForTimeout(400);
    const g = p.locator('label:has-text("Crecimiento perpetuo (g)") input'); await g.fill('4'); await g.dispatchEvent('input'); await p.waitForTimeout(800);
  }
  const results = {};
  const grab = async (label, key) => {
    await p.click('header button:has-text("Exportar")'); await p.waitForTimeout(200);
    const [d] = await Promise.all([p.waitForEvent('download', { timeout: 120000 }), p.click('header button:has-text("' + label + '")')]);
    const f = path.join(out, (lab ? 'lab_' : '') + d.suggestedFilename()); await d.saveAs(f); results[key] = f;
    await p.waitForTimeout(600);
  };
  await grab('PDF · Reporte completo', 'pdf');
  await grab('PDF · Resumen ejecutivo', 'exec');
  await grab('Excel (.xlsx)', 'xlsx');
  if (!lab) await grab('Paquete completo (.zip)', 'zip');
  const toast = await p.locator('text=Archivo descargado').count();
  console.log(JSON.stringify({ results, toast, errors: errs, offline }));
  await b.close();
})().catch(e => { console.error('FALLÓ', e.message); process.exit(1); });
