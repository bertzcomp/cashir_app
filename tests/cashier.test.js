import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PRODUCTS, findProduct } from '../app/src/domain/products.js';
import {
  addProduct, calculateItemCount, calculateTotal, clearCart,
  processPayment, removeProduct
} from '../app/src/domain/cashier.js';
import { createReceipt } from '../app/src/domain/receipt.js';
import { formatRupiah } from '../app/src/domain/format.js';

const at = new Date('2026-11-18T12:34:56');

const javaFoundation = await readFile(
  new URL('../KasirAlfamidi.java/src/KasirAlfamidi.java', import.meta.url),
  'utf8'
);
const preservedDesktopSource = await readFile(
  new URL('../desktop/src/KasirAlfamidi.java', import.meta.url),
  'utf8'
);

test('web catalog stays aligned with the newly supplied Java foundation', () => {
  const javaProducts = [...javaFoundation.matchAll(
    /new Barang\("(\d{3})",\s*"([^"]+)",\s*(\d+)\)/g
  )].map(([, code, name, price]) => ({ code, name, price: Number(price) }));

  assert.deepEqual(javaProducts, PRODUCTS);
  assert.equal(preservedDesktopSource, javaFoundation);
});

test('catalog matches all ten products from the Java desktop source', () => {
  assert.equal(PRODUCTS.length, 10);
  assert.deepEqual(findProduct('001'), { code: '001', name: 'Indomie Goreng', price: 3500 });
  assert.deepEqual(findProduct('010'), { code: '010', name: 'Telur 1 Kg', price: 29000 });
  assert.equal(findProduct('999'), null);
});

test('adding the same product merges quantity and calculates subtotal', () => {
  let cart = addProduct([], '001', 2);
  cart = addProduct(cart, '001', 3);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 5);
  assert.equal(cart[0].subtotal, 17500);
  assert.equal(calculateTotal(cart), 17500);
  assert.equal(calculateItemCount(cart), 5);
});

test('different products remain separate and can be removed', () => {
  let cart = addProduct([], '001', 2);
  cart = addProduct(cart, '002', 1);
  assert.equal(cart.length, 2);
  cart = removeProduct(cart, '001');
  assert.deepEqual(cart.map((item) => item.code), ['002']);
  assert.deepEqual(clearCart(), []);
});

test('quantity validation matches the 1–100 add control', () => {
  assert.throws(() => addProduct([], '001', 0));
  assert.throws(() => addProduct([], '001', 101));
  assert.throws(() => addProduct([], '001', 1.5));
  assert.throws(() => addProduct([], '999', 1));
});

test('payment rejects empty cart, non-digits, insufficient and unsafe amounts', () => {
  assert.equal(processPayment([], '10000').code, 'EMPTY_CART');
  const cart = addProduct([], '001', 2);
  assert.equal(processPayment(cart, 'Rp10000').code, 'INVALID_AMOUNT');
  assert.equal(processPayment(cart, '1000').code, 'INSUFFICIENT_PAYMENT');
  assert.equal(processPayment(cart, '999999999999999999999999').code, 'AMOUNT_TOO_LARGE');
});

test('successful payment returns exact total, paid amount, and change', () => {
  let cart = addProduct([], '001', 2);
  cart = addProduct(cart, '002', 1);
  const result = processPayment(cart, '20000');
  assert.deepEqual(result, { ok: true, total: 11000, paid: 20000, change: 9000 });
});

test('receipt contains date, cashier, item, total, payment, and change', () => {
  const cart = addProduct([], '001', 2);
  const receipt = createReceipt(cart, 10000, at);
  assert.match(receipt.text, /ALFAMIDI MINI MARKET/);
  assert.match(receipt.text, /Tanggal : 18-11-2026 12:34:56/);
  assert.match(receipt.text, /Kasir\s+: Admin/);
  assert.match(receipt.text, /Indomie Goreng/);
  assert.match(receipt.text, /TOTAL\s+: Rp7\.000,00/);
  assert.match(receipt.text, /BAYAR\s+: Rp10\.000,00/);
  assert.match(receipt.text, /KEMBALIAN\s+: Rp3\.000,00/);
  assert.equal(receipt.change, 3000);
});

test('rupiah formatting follows Indonesian locale with two decimal places', () => {
  assert.equal(formatRupiah(3500), 'Rp3.500,00');
});
