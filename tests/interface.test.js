import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../app/index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../app/src/main.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../app/src/styles.css', import.meta.url), 'utf8');

test('main UI contains all workflow controls and receipt output', () => {
  for (const id of [
    'product-select', 'quantity-input', 'add-form', 'cart-body', 'clear-cart',
    'total-amount', 'payment-input', 'change-amount', 'pay-button',
    'receipt-content', 'receipt-status', 'apk-download'
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
  assert.match(app, /import \{ Capacitor \} from '@capacitor\/core'/);
  assert.doesNotMatch(app, /capgo\/capacitor-printer|printReceipt|print-receipt/);
});
