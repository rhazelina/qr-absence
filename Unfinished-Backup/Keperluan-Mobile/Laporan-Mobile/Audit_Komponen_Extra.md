# Audit Komponen "Tersembunyi" (Hidden Dependencies)

Selain file MVC (Model-View-Controller) dan UI (Activity/Fragment) reguler yang telah diekstrak sebelumnya, hasil *deep-scanning* membuktikan terdapat file-file "Pengatur Sistem Belakang Layar" (Infrastruktur Framework) yang **sangat krusial** untuk dicantumkan jika Anda akan menyusun **Perencanaan Implementasi (*Implementation Plan*)** di Laporan/Skripsi nanti.

Berikut adalah daftarnya (Penting hingga Opsional):

## 1. Sangat Krusial (Pengunci Keamanan & Nyawa Aplikasi)
Tanpa file-file ini, Sistem API anda rawan diretas dan Android anda tidak bisa mengakses internet/kamera.

*   **`backend/app/Http/Middleware/` (Filter Keamanan API Laravel)**
    *   `EnsureUserType.php` & `EnsureAdminType.php`: Menjaga agar siswa tidak bisa menembak URL absensi milik Guru.
    *   `EnforceWakaAccess.php`: Menjaga kerahasiaan data global sekolah hanya untuk level pimpinan (Waka).
    *   `LogActivity.php`: Jika ada pencatatan histori siapa yang terakhir login/ubah data.
*   **`meyzha-rendra/app/src/main/AndroidManifest.xml` (Pondasi Android)**
    *   Mengatur izin (*Permissions*) mutlak: `INTERNET` (koneksi ke Laravel), `CAMERA` (untuk pemindai kode QR), dan *Push Notifications*. Menentukan layar mana (`LoginActivity` atau `Splash`) yang pertama kali jalan saat ikon diklik.

## 2. Krusial (Pengatur Pustaka & Database Dasar)
Tanpa ini, kode Kotlin/PHP yang Anda tulis akan dipenuhi garis merah (Error *Class Not Found*).

*   **`meyzha-rendra/app/build.gradle.kts` (Library Android)**
    *   Pusat pendaftaran segala *Library* luar: Retrofit (untuk API), Gson (untuk JSON), CameraX (untuk QR Scanner), Firebase (Notifikasi), serta konfigurasi pemanjaan programmer seperti *ViewBinding*.
*   **`backend/database/migrations/` (Arsitek Tabel Database)**
    *   Meski kita sudah punya `db_mobile.sql`, secara keilmuan *Software Engineering* Laravel, tabel fisik itu dibuat dari barisan file konfigurasi migrasi ini (misalnya `..._create_attendances_table.php`).
*   **`backend/.env` dan `config/sanctum.php` (Konfigurasi Server)**
    *   Mengunci kunci rahasia (*Secret Key*) Token untuk login agar *session* JWT presensi tidak bentrok.

## 3. Pendukung Implementasi Lanjut
Komponen yang mengatur estetika sistem dan penanganan jika error terjadi.

*   **`backend/app/Exceptions/Handler.php`**
    *   Penerjemah jika terjadi `Error 500 (Server Mati)` atau `404 (Data Tidak Ditemukan)` agar dibalas ke Android menggunakan teks JSON yang rapi, bukan halaman HTML putih berantakan yang membuat Crash Android.
*   **`meyzha-rendra/app/src/main/res/` (Modul Resource XML Khusus)**
    *   Terutama folder `values/themes.xml` (pengatur mode malam/siang pewarnaan aplikasi resminya) dan `navigation/nav_graph.xml` (jika aplikasi Anda menggunakan jalur transisi arsitektur *Navigation Component* resmi dari Google).

---
### Rekomendasi untuk Bab Implementasi (Skripsi/Laporan)
Jika Anda mulai menulis Bab Implementasi nanti, saran saya: **Jangan abaikan poin nomor 1 (Keamanan Middleware & Manifest)**. 
Dosen penguji / pembaca teknis sangat suka membaca bagaimana seorang mahasiswa memikirkan masalah otorisasi (Role/Hak Akses) di Middleware, dan izin perangkat (*Device Capabilities*) di Android Manifest, karena itu menandakan Anda paham ekosistemnya dari akar!
