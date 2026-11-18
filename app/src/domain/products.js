/** Product catalog transcribed from the original Java desktop application. */
export const PRODUCTS = Object.freeze([
  { code: '001', name: 'Indomie Goreng', price: 3500 },
  { code: '002', name: 'Aqua 600ml', price: 4000 },
  { code: '003', name: 'Beras 5 Kg', price: 75000 },
  { code: '004', name: 'Minyak Goreng 1L', price: 18000 },
  { code: '005', name: 'Gula Pasir 1 Kg', price: 17000 },
  { code: '006', name: 'Susu UHT', price: 6500 },
  { code: '007', name: 'Roti Tawar', price: 15000 },
  { code: '008', name: 'Sabun Mandi', price: 5000 },
  { code: '009', name: 'Teh Botol', price: 5000 },
  { code: '010', name: 'Telur 1 Kg', price: 29000 }
]);

export function findProduct(code) {
  return PRODUCTS.find((product) => product.code === String(code)) ?? null;
}
