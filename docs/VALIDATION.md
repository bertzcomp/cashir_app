# Catatan validasi lingkungan workspace

Tanggal pemeriksaan: 18 November 2026.

## Yang berhasil diperiksa di workspace ini

- Node.js `v22.19.0` dan npm `10.9.3` tersedia.
- JDK 21 tersedia; kedua source Java desktop berhasil dikompilasi ke direktori sementara `/tmp` dan file source aslinya tidak berubah.
- `npm test`: **16/16 test lulus**, termasuk keselarasan katalog web dengan project Java fondasi baru, identitas source Java desktop, kontrak transaksi, CTA unduh APK, lockfile, kesamaan artifact web untuk job Android, dan urutan deploy.
- `node --check` lulus untuk `app/src/main.js`, seluruh modul domain, Service Worker, dan script preview.
- `npm run build:preview` berhasil menyalin seluruh sumber web menjadi `web-preview/`; smoke test HTTP terakhir berhasil mengambil index, JS utama, dan Service Worker. Semua 13 entri precache menunjuk ke file yang tersedia.
- SHA-256 `KasirAlfamidi.java/src/KasirAlfamidi.java` dan `desktop/src/KasirAlfamidi.java` identik: `034ca6cb427848b82ca3ad5eecce377315c89700f30a024a9a3e2f23527cd7f6`.
- `package-lock.json` lockfile v3 sudah tersedia dan `npm install --package-lock-only --offline` berhasil memvalidasi kecocokannya dengan `package.json`.
- JSON `package.json`, `capacitor.config.json`, dan manifest PWA valid.

## Yang terhalang dalam workspace ini

- Instalasi dependency penuh belum dapat dilakukan di workspace lokal karena DNS menuju `registry.npmjs.org` gagal dengan `ENOTFOUND`; akibatnya `npm run build` lokal belum dapat dijalankan dengan Vite 8.3.8.
- Android SDK (`sdkmanager`), Gradle, dan `adb` tidak tersedia di workspace ini; `assembleDebug` tidak dapat dijalankan secara lokal.
- Pengujian browser otomatis dengan Chromium pada loopback diblokir kebijakan runtime (`ERR_BLOCKED_BY_ADMINISTRATOR`), sehingga tidak saya laporkan sebagai uji browser/offline end-to-end.

## Perbaikan CI yang sudah disiapkan

Workflow `.github/workflows/publish.yml` menjalankan `npm ci` dari lockfile ter-commit sebelum `npm run build`. Job website membangun dan memverifikasi `dist/` satu kali. Job Android mengunduh **hasil Vite yang sama**, menjalankan `npm ci`, menambahkan Capacitor Android, lalu membungkus artifact itu ke APK dengan Android SDK + Gradle. Pages baru dideploy setelah APK dirilis dan URL unduhan publiknya berhasil diuji.

## Hasil publikasi GitHub

- Workflow GitHub Actions pada repository `bertzcomp/cashir_app` sudah berhasil menjalankan `npm ci`, 16 unit test, Vite production build, verifikasi `dist/`, Capacitor sync, dan Gradle `assembleDebug`.
- Release `prototype-latest` sudah berisi `KasirAlfamidi.apk` beserta checksum SHA-256, dan workflow berhasil mengakses URL unduhan publik sebelum Pages dideploy.
- GitHub Pages berhasil dideploy ke `https://bertzcomp.github.io/cashir_app/`.
- Job Pages melakukan smoke test HTTPS terhadap halaman utama, manifest PWA, konfigurasi tombol APK, Service Worker, precache manifest, dan seluruh asset yang tercantum dalam precache.
- Pengujian instalasi/perilaku pada perangkat Android nyata belum dilakukan dan tidak diklaim berhasil.
- Pengujian browser interaktif/offline end-to-end tidak dapat dilakukan dari sesi ini karena alat browser dan cloud desktop tidak tersedia. Validasi PWA saat ini terdiri dari verifikasi build, precache manifest, dan deployment pipeline.

Konfigurasi CI bukan bukti bahwa build/deployment telah berhasil; status ini harus diperbarui hanya setelah workflow berhasil dijalankan pada repository tujuan.
