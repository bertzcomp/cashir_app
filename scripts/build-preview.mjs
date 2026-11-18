import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'app');
const output = path.join(root, 'web-preview');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(source, 'index.html'), path.join(output, 'index.html'));
await cp(path.join(source, 'src'), path.join(output, 'src'), { recursive: true });
const previewMain = path.join(output, 'src', 'main.js');
const previewMainSource = await readFile(previewMain, 'utf8');
await writeFile(previewMain, previewMainSource.replace(
  "import { Capacitor } from '@capacitor/core';",
  'const Capacitor = { isNativePlatform: () => false };'
));
await cp(path.join(source, 'public'), output, { recursive: true });

const assetPaths = ['.', './index.html', './manifest.webmanifest', './site-config.js', './sw.js'];
async function walk(directory, relative = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const nextRelative = path.posix.join(relative, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute, nextRelative);
    else if (/\.(?:js|css|png|svg|webmanifest|woff2?)$/i.test(entry.name)) assetPaths.push(`./${nextRelative}`);
  }
}
await walk(path.join(source, 'src'), 'src');
await walk(path.join(source, 'public'));
const uniqueAssets = [...new Set(assetPaths)];
await writeFile(path.join(output, 'precache-manifest.json'), JSON.stringify(uniqueAssets, null, 2));
console.log(`Static browser preview created: ${path.relative(root, output)} (${uniqueAssets.length} offline assets)`);
