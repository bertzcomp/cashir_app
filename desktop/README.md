# Aplikasi desktop KasirAlfamidi

Project Apache NetBeans dan Apache Ant ini dipertahankan terpisah dari versi web/Android.

- Source aplikasi utama: `src/KasirAlfamidi.java`.
- Template class kosong `src/kasiralfamidi/java/KasirAlfamidiJava.java` tetap disimpan dan tidak dihapus.
- `nbproject/project.properties` mengarahkan `main.class` ke `KasirAlfamidi`, karena class ini yang memiliki `main()` untuk membuka GUI.
- Versi Java pada project NetBeans tetap 26 sesuai konfigurasi sumber. Pastikan JDK 26 dipakai saat melakukan build dari NetBeans.
- Folder `build/` dan pengaturan pribadi `nbproject/private/` sengaja tidak dimasukkan ke repository.

Buka folder `desktop/` sebagai project Java with Ant di Apache NetBeans, kemudian gunakan **Clean and Build** dan **Run Project**.
