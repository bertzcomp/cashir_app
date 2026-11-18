# Kasir Alfamidi — Web + Android APK

Prototype aplikasi kasir dengan **satu source UI dan logika web**. Website dibangun dengan Vite dan dapat digunakan langsung melalui browser. Build web yang sama disalin oleh Capacitor ke APK Android. Tidak ada backend, database, API, login, cloud, atau sinkronisasi.

## Yang tersedia

- Katalog 10 produk contoh yang diambil dari source Java desktop.
- Menambah barang dengan kuantitas 1–100; produk berkode sama digabung ke baris yang sama.
- Menghapus barang dan mengosongkan transaksi.
- Menghitung subtotal, total belanja, validasi pembayaran, serta uang kembalian.
- Membuat preview struk setelah pembayaran berhasil.
- Mencetak struk melalui dialog cetak browser/PWA atau dialog cetak native Android.
- Menyimpan isi keranjang sementara di `localStorage` pada browser. APK memakai local storage WebView yang terpisah di perangkat Android.
- PWA menggunakan Service Worker dan Cache Storage agar website dapat dibuka offline setelah cache awal selesai. Cache diberi identitas commit sehingga deployment baru memicu pembaruan cache aplikasi.
- APK membawa hasil build web di dalam paket sehingga aplikasi Android dapat dibuka offline tanpa mengakses website.
- Website menyediakan satu tombol **INSTALL APK KE HP ANDA** yang menuju asset APK di GitHub Releases.
- Tombol instalasi APK otomatis disembunyikan saat source yang sama berjalan di dalam aplikasi Android.

Database, backend, autentikasi, serta sinkronisasi cloud tidak termasuk ruang lingkup prototype ini.

> **Status publikasi:** source tersedia di `bertzcomp/cashir_app`. GitHub Actions membangun website dan debug APK dari source web yang sama. Website, APK, checksum, dan ZIP lengkap diterbitkan otomatis setelah seluruh job berhasil.

## Struktur repository

```text
KasirAlfamidi/
├── KasirAlfamidi.java/             # Project NetBeans fondasi yang diberikan pengguna
│   ├── src/
│   ├── nbproject/
│   ├── build.xml
│   └── manifest.mf
├── desktop/                       # Aplikasi Java Swing asli, tetap terpisah
│   ├── src/
│   ├── nbproject/
│   ├── build.xml
│   └── manifest.mf
├── app/                           # Satu source UI web dan Android
│   ├── index.html
│   ├── public/
│   │   ├── icons/
│   │   ├── manifest.webmanifest
│   │   ├── site-config.js         # Diisi workflow dengan repository GitHub
│   │   └── sw.js
│   └── src/
│       ├── domain/                # Katalog, transaksi, pembayaran, struk
│       ├── main.js                # UI dan event handler
│       └── styles.css
├── tests/                         # Unit test menggunakan node:test
├── native/android/                # Bridge PrintManager; bukan UI Android kedua
├── scripts/
├── .github/workflows/publish.yml # Build, Release APK, dan GitHub Pages
├── capacitor.config.json
├── package.json
├── package-lock.json              # Dependency terkunci untuk npm ci
├── vite.config.js
└── README.md
```

Folder `KasirAlfamidi.java/` adalah project fondasi yang diberikan pengguna. Folder `desktop/` mempertahankan salinan aplikasi desktop yang siap ditempatkan bersama source publikasi. Test otomatis memastikan kedua file `src/KasirAlfamidi.java` identik dan katalog web tetap cocok dengan source Java. Migrasi tidak mengganti file Java; UI web menerapkan ulang aturan kasir yang ada karena Swing bukan UI browser/Android.

## Menjalankan website lokal

Persyaratan: Node.js 22.12+ dan npm 10+.

```bash
npm ci
npm test
npm run dev
```

Buka alamat lokal yang ditampilkan Vite, biasanya `http://localhost:5173`.

Build produksi Vite:

```bash
npm run build
```

Hasil produksi ada di folder `dist/`. Vite disetel dengan `base: './'` agar asset relatif dapat dimuat di GitHub Pages berbasis subpath dan di dalam Capacitor.

## Fork, clone, dan alamat website sendiri

Repository ini bersifat publik sehingga dapat dikembangkan melalui fork ataupun clone:

```bash
git clone https://github.com/bertzcomp/cashir_app.git
cd cashir_app
npm ci
npm test
```

Jika repository di-fork, workflow otomatis memakai `${{ github.repository }}` sehingga tombol APK akan mengarah ke Release milik fork, bukan ke `bertzcomp/cashir_app`.

Alamat gratis GitHub Pages mengikuti pemilik dan nama repository:

- Repository `charleshalawa08-source.github.io` → `https://charleshalawa08-source.github.io/`
- Repository lain, misalnya `cashir_app` → `https://charleshalawa08-source.github.io/cashir_app/`

`charleshalawa08-source.io` adalah custom domain tersendiri dan hanya dapat dipakai jika domain tersebut telah didaftarkan. Karena proyek ini dideploy memakai GitHub Actions, konfigurasikan domain di **Settings → Pages → Custom domain**, verifikasi kepemilikan domain, lalu arahkan record DNS sesuai petunjuk GitHub Pages. File `CNAME` di source tidak diperlukan untuk metode deployment Actions ini.

### Preview browser tanpa dependency (opsional)

Untuk memeriksa tampilan sumber web di browser tanpa instalasi npm, jalankan:

```bash
npm run build:preview
python -m http.server 8000 --directory web-preview
```

Buka `http://localhost:8000`. Preview ini menyalin HTML/CSS/JS sumber dan membuat daftar cache offline; ini bukan hasil bundling produksi Vite dan tidak menghasilkan APK. Build produksi tetap `npm ci` lalu `npm run build`.

### Mengapa `vite: not found` bisa muncul?

Pesan `sh: vite: not found` berarti dependency belum dipasang atau folder `node_modules` tidak tersedia. Dari folder root repository, jalankan `npm ci` dahulu, lalu `npm run build`. Versi langsung dan transitif dikunci di `package-lock.json`.

## Build APK secara lokal (opsional)

Persyaratan Android: Node.js 22.12+, Android Studio/Android SDK, dan JDK yang kompatibel dengan Capacitor Android. Capacitor 8 membutuhkan Android Studio 2025.2.1 atau lebih baru dan Android API 24+. Panduan: [https://capacitorjs.com/docs/getting-started/environment-setup](https://capacitorjs.com/docs/getting-started/environment-setup).

```bash
npm ci
npm run build
npx cap add android
npx cap sync android
npm run cap:install:native
```

Folder `android/` dihasilkan oleh Capacitor dan sengaja diabaikan Git; buka folder tersebut di Android Studio, atau build debug APK:

```bash
cd android
./gradlew assembleDebug
```

Di Windows gunakan `gradlew.bat assembleDebug`.

APK debug berada di `android/app/build/outputs/apk/debug/app-debug.apk`. Untuk prototype, APK debug bisa dipasang untuk pengujian. APK ini bukan rilis Play Store dan ditandatangani menggunakan debug key otomatis.

## Publikasi otomatis melalui GitHub Actions

Satu workflow `.github/workflows/publish.yml` menjalankan alur berurutan:

1. Build web sekali menggunakan Vite, menjalankan unit test, dan membuat `dist/`.
2. Memverifikasi isi `dist/` dan daftar asset offline, lalu mengunggah `dist/` sebagai artifact sementara.
3. Job Android mengunduh **hasil Vite yang sama**, memasang dependency dari lockfile ter-commit, memasangnya ke Capacitor, memasang bridge native `PrintManager`, lalu menjalankan `assembleDebug` menggunakan Android SDK dan Gradle pada GitHub-hosted runner.
4. APK diunggah sebagai workflow artifact dan ke GitHub Releases.
5. Runner membuat ZIP lengkap berisi snapshot source commit beserta APK dan checksum, tanpa `node_modules` atau output build sementara.
6. Workflow menguji URL unduhan publik APK; hanya setelah URL tersebut merespons sukses, website diterbitkan ke GitHub Pages.

### Menyiapkan repository

1. Buat repository GitHub dan jadikan **Public** agar website dan unduhan Release bisa diakses siapa saja.
2. Unggah seluruh isi folder proyek ke branch `main`.
3. Di GitHub buka **Settings → Pages → Build and deployment → Source**, pilih **GitHub Actions**.
4. Di **Settings → Actions → General**, pastikan workflow diizinkan berjalan dan `GITHUB_TOKEN` boleh melakukan write pada repository. Workflow sudah menetapkan `contents: write`, `pages: write`, dan `id-token: write`.
5. Push commit ke `main` atau jalankan workflow `Build, publish website, and release Android APK` melalui tab Actions.

Workflow berjalan pada GitHub-hosted runner yang menyiapkan Node.js, JDK 21, Android SDK API 36, Android Build Tools, dan Gradle wrapper Capacitor. Dependency Gradle disimpan dalam cache GitHub Actions dan build membatasi worker agar unduhan Maven lebih stabil.

### Alamat website dan APK

Setelah workflow pertama berhasil, GitHub Actions akan menampilkan URL website pada job deployment. Pola default GitHub Pages:

- Repository bernama `OWNER.github.io`: `https://OWNER.github.io/`
- Repository project biasa: `https://OWNER.github.io/REPOSITORY/`

Deployment repository ini tersedia di:

- Website: [https://bertzcomp.github.io/cashir_app/](https://bertzcomp.github.io/cashir_app/)
- Repository: [https://github.com/bertzcomp/cashir_app](https://github.com/bertzcomp/cashir_app)

Workflow membuat rolling pre-release dengan tag `prototype-latest`. Tombol website mengarah ke:

```text
https://github.com/bertzcomp/cashir_app/releases/download/prototype-latest/KasirAlfamidi.apk
```

ZIP lengkap source + APK:

```text
https://github.com/bertzcomp/cashir_app/releases/download/prototype-latest/KasirAlfamidi-Publication-Ready.zip
```

APK yang dihasilkan juga tersedia pada tab **Actions → workflow run → Artifacts** selama 30 hari. Asset GitHub Release menjadi tautan download publik yang stabil dan diperbarui setiap kali branch `main` berhasil dibangun.

Untuk rilis versi bernomor, push tag seperti:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Tag `v*` menghasilkan GitHub Release versi bernomor berisi APK dan file checksum. Website memakai asset rolling `prototype-latest` agar tombol unduh tidak perlu diubah setiap versi.

## Offline dan batas data

- Website perlu dibuka online sekali dari alamat HTTPS dan menyelesaikan pemasangan cache Service Worker. Sesudah itu shell aplikasi dan asset lokal dapat dibuka offline.
- APK mengemas file `dist/` di dalam aplikasi. Setelah terinstal, UI dan alur kasir berjalan tanpa membuka situs dan tanpa koneksi internet.
- Keranjang disimpan secara lokal pada perangkat/browser masing-masing; data tidak berpindah antarperangkat.
- Setelah pembayaran, struk dihasilkan sebagai preview selama sesi aplikasi. Tidak ada riwayat transaksi permanen.
- Tombol **Cetak Struk** baru aktif setelah pembayaran berhasil. Browser menggunakan dialog cetak bawaan; APK menggunakan dialog cetak Android. Printer fisik atau layanan cetak yang sesuai tetap harus dikonfigurasi pada perangkat pengguna.
- Katalog produk berisi data contoh statis dari program Java lama.

## Pengujian

```bash
npm test
```

Pengujian unit memeriksa katalog, penggabungan kuantitas, hapus barang, batas jumlah, validasi pembayaran, nilai kembalian, format rupiah, kontrak elemen UI/PWA, perbedaan CTA web/native, serta integrasi bridge cetak Android.

## Catatan rilis

Workflow menerbitkan **debug APK** untuk demonstrasi. Untuk distribusi produksi di luar prototipe, buat release keystore sendiri dan tambahkan proses signing dengan GitHub Actions Secrets. Jangan simpan keystore atau password di repository.
