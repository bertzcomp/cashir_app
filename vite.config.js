import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const offlineManifestPlugin = {
  name: 'kasir-offline-manifest',
  generateBundle(_options, bundle) {
    const assets = Object.keys(bundle)
      .filter((fileName) => /\.(?:js|css|png|svg|webmanifest|woff2?)$/i.test(fileName))
      .map((fileName) => `./${fileName}`);

    const manifest = ['./', './index.html', './manifest.webmanifest', './site-config.js', './sw.js', './icons/icon-192.png', './icons/icon-512.png', ...assets];
    this.emitFile({
      type: 'asset',
      fileName: 'precache-manifest.json',
      source: JSON.stringify([...new Set(manifest)], null, 2)
    });
  }
};

export default defineConfig({
  root: 'app',
  base: './',
  publicDir: 'public',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  plugins: [offlineManifestPlugin],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020'
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
});
