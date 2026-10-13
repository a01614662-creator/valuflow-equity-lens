import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base './' permite publicar la carpeta dist/ en cualquier ruta (Vercel, GitHub Pages, un servidor estático).
// `vite build --mode standalone` genera un solo archivo HTML (dist-standalone/index.html) con todo incluido:
// funciona sin servidor y sin internet (librerías, logos y datos van dentro).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'standalone' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'standalone' ? { outDir: 'dist-standalone', assetsInlineLimit: 100000000, chunkSizeWarningLimit: 6000 } : { chunkSizeWarningLimit: 4000 },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
}));
