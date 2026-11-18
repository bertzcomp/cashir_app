import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/publish.yml', import.meta.url), 'utf8');
const app = await readFile(new URL('../app/src/main.js', import.meta.url), 'utf8');
const siteConfig = await readFile(new URL('../app/public/site-config.js', import.meta.url), 'utf8');

test('website and Android pipeline share the same Vite build artifact', () => {
  assert.match(workflow, /name: kasir-web-build/);
  assert.match(workflow, /actions\/download-artifact@v8/);
  assert.match(workflow, /path: dist/);
  assert.match(workflow, /npx cap sync android/);
  assert.match(workflow, /needs: build-web/);
});

test('CI installs the committed lockfile and verifies the production output', () => {
  assert.doesNotMatch(workflow, /npm install/);
  assert.match(workflow, /npm ci --no-audit --no-fund --no-progress/);
  assert.match(workflow, /npm run verify:dist/);
});

test('website deployment waits for a successful Android release', () => {
  assert.match(workflow, /needs: \[build-web, build-android\]/);
  assert.match(workflow, /actions\/deploy-pages@v5/);
  assert.match(workflow, /softprops\/action-gh-release@v3/);
});

test('download button and CI use the same rolling release asset path', () => {
  assert.match(siteConfig, /releaseTag: 'prototype-latest'/);
  assert.match(workflow, /tag_name: prototype-latest/);
  assert.match(workflow, /artifacts\/KasirAlfamidi\.apk/);
  assert.match(app, /releases\/download\/\$\{releaseTag\}\/KasirAlfamidi\.apk/);
  assert.match(workflow, /Verify the public APK download before Pages deployment/);
  assert.match(workflow, /curl --fail --location/);
});

test('each publication changes the PWA cache version', () => {
  assert.match(workflow, /BUILD_ID: \$\{\{ github\.sha \}\}/);
  assert.match(workflow, /buildId: process\.env\.BUILD_ID/);
  assert.match(app, /const BUILD_ID = globalThis\.KASIR_APP_CONFIG\?\.buildId/);
  assert.match(app, /sw\.js\?v=\$\{encodeURIComponent\(BUILD_ID\)\}/);
});
