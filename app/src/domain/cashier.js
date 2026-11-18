import { findProduct } from './products.js';

export const MAX_ADD_QUANTITY = 100;

export function addProduct(cart, productCode, quantity) {
  const product = findProduct(productCode);
  const amount = Number(quantity);

  if (!product) throw new Error('Produk tidak ditemukan.');
  if (!Number.isInteger(amount) || amount < 1 || amount > MAX_ADD_QUANTITY) {
    throw new Error(`Jumlah barang harus berupa angka bulat 1–${MAX_ADD_QUANTITY}.`);
  }

  const next = cart.map((item) => ({ ...item }));
  const existing = next.find((item) => item.code === product.code);

  if (existing) {
    existing.quantity += amount;
    existing.subtotal = existing.price * existing.quantity;
  } else {
    next.push({
      code: product.code,
      name: product.name,
      price: product.price,
      quantity: amount,
      subtotal: product.price * amount
    });
  }

  assertSafeCart(next);
  return next;
}

export function removeProduct(cart, productCode) {
  return cart.filter((item) => item.code !== String(productCode)).map((item) => ({ ...item }));
}

export function clearCart() {
  return [];
}

export function calculateTotal(cart) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(total)) throw new Error('Total transaksi melebihi batas angka yang aman.');
  return total;
}

export function calculateItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function processPayment(cart, rawPayment) {
  if (!cart.length) {
    return { ok: false, code: 'EMPTY_CART', message: 'Belum ada barang yang dibeli!' };
  }

  const input = String(rawPayment ?? '').trim();
  if (!/^\d+$/.test(input)) {
    return { ok: false, code: 'INVALID_AMOUNT', message: 'Masukkan pembayaran berupa angka bulat tanpa titik atau simbol!' };
  }

  const paid = Number(input);
  if (!Number.isSafeInteger(paid)) {
    return { ok: false, code: 'AMOUNT_TOO_LARGE', message: 'Nominal pembayaran terlalu besar!' };
  }

  const total = calculateTotal(cart);
  if (paid < total) {
    return { ok: false, code: 'INSUFFICIENT_PAYMENT', message: 'Uang pembayaran tidak mencukupi!' };
  }

  return { ok: true, total, paid, change: paid - total };
}

function assertSafeCart(cart) {
  for (const item of cart) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 ||
        !Number.isSafeInteger(item.price * item.quantity)) {
      throw new Error('Jumlah barang melebihi batas angka yang aman.');
    }
  }
  calculateTotal(cart);
}
