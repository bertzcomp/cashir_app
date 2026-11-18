# Arsitektur Kasir Alfamidi

## Satu source aplikasi

- `KasirAlfamidi.java/` adalah project NetBeans fondasi yang diberikan pengguna dan dipertahankan utuh sebagai referensi perilaku.
- `app/index.html`, `app/src/main.js`, `app/src/domain/`, dan `app/src/styles.css` adalah satu-satunya source tampilan dan alur kasir.
- Vite menghasilkan folder `dist/` satu kali pada workflow.
- Job Android mengunduh artifact `dist/` tersebut dan menyalinnya ke Android melalui `npx cap sync android`. Tidak ada UI Android terpisah.
- `desktop/` tetap menjadi proyek Java Swing yang independen dan tidak dihapus.

## Kesiapan offline

- Browser mendaftarkan `app/public/sw.js` hanya pada origin web secure/localhost.
- Plugin Vite membuat `precache-manifest.json` berdasarkan output produksi dan asset public yang dibutuhkan.
- Capacitor Android membawa build web secara lokal dalam APK; Service Worker tidak dipakai untuk runtime native.
- Katalog dan state transaksi berada di sisi klien. Keranjang disimpan sementara menggunakan `localStorage`, tanpa backend/database.

## Distribusi

Workflow `.github/workflows/publish.yml`:

1. `build-web` memasang dependency dengan `npm ci`, menjalankan test, membangun Vite, memverifikasi output/offline precache, serta mengunggah Pages artifact dan `dist` sebagai artifact transfer.
2. `build-android` menggunakan artifact build web yang sama, menjalankan `cap add`, `cap sync`, dan Gradle `assembleDebug` di GitHub-hosted runner.
3. Push ke `main` mengunggah `KasirAlfamidi.apk` ke rolling prerelease GitHub Release dengan tag `prototype-latest`.
4. Workflow memeriksa URL asset APK publik, lalu job `deploy-pages` mempublikasikan website. Tombol unduh ditautkan ke release asset rolling.
5. Push tag `v*` menghasilkan release versi bernomor dengan APK dan checksum.

## Lingkup prototype

Tidak ada API, backend, database, login, cloud sync, atau printer integration. Fitur inti yang didemonstrasikan adalah produk, keranjang, perhitungan, pembayaran, kembalian, dan preview struk.
