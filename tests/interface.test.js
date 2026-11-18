import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../app/index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../app/src/main.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../app/src/styles.css', import.meta.url), 'utf8');
const printerPlugin = await readFile(new URL('../native/android/ReceiptPrinterPlugin.java', import.meta.url), 'utf8');
const nativeInstaller = await readFile(new URL('../scripts/install-native-android.mjs', import.meta.url), 'utf8');
const previewBuilder = await readFile(new URL('../scripts/build-preview.mjs', import.meta.url), 'utf8');

test('main UI contains all workflow controls and receipt output', () => {
  for (const id of [
    'product-select', 'quantity-input', 'add-form', 'cart-body', 'clear-cart',
    'total-amount', 'payment-input', 'change-amount', 'pay-button',
    'receipt-content', 'receipt-status', 'print-receipt', 'apk-download'
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
    assert.match(app, new RegExp(`#${id}`), `script does not bind #${id}`);
  }
});

test('the UI has mobile viewport, PWA manifest and offline worker registration', () => {
  assert.match(html, /name="viewport"/);
  assert.match(html, /rel="manifest"/);
  assert.match(app, /serviceWorker\.register/);
  assert.match(html, /INSTALL APK KE HP ANDA/);
  assert.match(styles, /\.download-button span \{ display: inline; \}/);
  assert.match(app, /import \{ Capacitor, registerPlugin \} from '@capacitor\/core'/);
});

test('APK hides its own install link while the website keeps the public download', () => {
  assert.match(html, /class="download-button web-only"/);
  assert.match(app, /elements\.apkDownload\.hidden = isNative/);
  assert.match(styles, /\.native-app \.web-only \{ display: none !important; \}/);
  assert.match(app, /if \(!isNative\) configureDownloadLink\(\)/);
});

test('receipt printing matches the web and native Android platforms', () => {
  assert.match(html, /> Cetak Struk\s*</);
  assert.match(app, /elements\.printReceipt\.disabled = !state\.paid/);
  assert.match(app, /window\.print\(\)/);
  assert.match(app, /ReceiptPrinter\.printReceipt/);
  assert.match(printerPlugin, /@CapacitorPlugin\(name = "ReceiptPrinter"\)/);
  assert.match(printerPlugin, /PrintManager/);
  assert.match(printerPlugin, /createPrintDocumentAdapter/);
  assert.match(nativeInstaller, /registerPlugin\(ReceiptPrinterPlugin\.class\)/);
  assert.match(previewBuilder, /const registerPlugin = \(\) => \(\{\}\)/);
});
