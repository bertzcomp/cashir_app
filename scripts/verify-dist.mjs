import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'site-config.js',
  'sw.js',
  'precache-manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

for (const relativePath of requiredFiles) {
  await access(resolve(distDir, relativePath), constants.R_OK);
}

const manifest = JSON.parse(await readFile(resolve(distDir, 'precache-manifest.json'), 'utf8'));
if (!Array.isArray(manifest) || manifest.length === 0) {
  throw new Error('precache-manifest.json must contain at least one asset.');
}

for (const asset of manifest) {
  if (typeof asset !== 'string' || !asset.startsWith('./')) {
    throw new Error(`Invalid precache entry: ${JSON.stringify(asset)}`);
  }

  const relativePath = asset === './' ? 'index.html' : asset.slice(2);
  await access(resolve(distDir, relativePath), constants.R_OK);
}

const siteConfig = await readFile(resolve(distDir, 'site-config.js'), 'utf8');
if (!/repository:\s*["'][A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+["']/.test(siteConfig) &&
    !/"repository"\s*:\s*"[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+"/.test(siteConfig)) {
  throw new Error('dist/site-config.js does not contain a valid GitHub repository.');
}

const index = await readFile(resolve(distDir, 'index.html'), 'utf8');
for (const reference of ['manifest.webmanifest', 'site-config.js']) {
  if (!index.includes(reference)) throw new Error(`dist/index.html does not reference ${reference}.`);
}

console.log(`Verified ${requiredFiles.length} required files and ${manifest.length} offline precache entries.`);
