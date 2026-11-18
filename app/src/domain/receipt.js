import { calculateTotal } from './cashier.js';
import { formatRupiah } from './format.js';

const line = '--------------------------------';

export function createReceipt(cart, payment, now = new Date()) {
  const total = calculateTotal(cart);
  const change = payment - total;
  const pad = (value) => String(value).padStart(2, '0');
  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const rows = [
    '       ALFAMIDI MINI MARKET',
    '     STRUK PEMBAYARAN KASIR',
    line,
    `Tanggal : ${date}`,
    'Kasir   : Admin',
    line
  ];

  for (const item of cart) {
    rows.push(
      item.name,
      `${item.quantity} x ${formatRupiah(item.price)}`,
      `Subtotal: ${formatRupiah(item.price * item.quantity)}`
    );
  }

  rows.push(
    line,
    `TOTAL     : ${formatRupiah(total)}`,
    `BAYAR     : ${formatRupiah(payment)}`,
    `KEMBALIAN : ${formatRupiah(change)}`,
    line,
    '     TERIMA KASIH TELAH BELANJA',
    '          DI ALFAMIDI',
    line
  );

  return { text: rows.join('\n'), total, payment, change, createdAt: now.toISOString() };
}
