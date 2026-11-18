const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 2, maximumFractionDigits: 2
});

export function formatRupiah(value) {
  // Match java.text.NumberFormat used in the desktop app (Rp3.500,00).
  return rupiahFormatter.format(Number(value)).replace(/[\u00a0\u202f]/g, '');
}
