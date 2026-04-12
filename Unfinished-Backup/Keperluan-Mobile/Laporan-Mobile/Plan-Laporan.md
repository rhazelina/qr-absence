# Rencana Kerja: Penyusunan Berkas Laporan-Mobile

Dokumen ini adalah cetak biru (Blueprint) tahapan ekstraksi *source code* murni yang digunakan khusus untuk aplikasi mobile `meyzha-rendra`.

## 1. Persiapan Folder Dasar (Selesai)
- [x] Membuat folder induk `/root/full/qr-absence/Laporan-Mobile`.
- [x] Membuat sub-folder `Backend-Mobile/`.
- [x] Membuat sub-folder `Komponen-Mobile/`.

## 2. Kurasi & Verifikasi Backend untuk Mobile (Selesai)
- Menarik 11 Controllers, 6 Models, dan `routes/api.php` beserta penanaman file `Penjelasan_*.txt`.

## 3. Ekstraksi Komponen Android (Selesai Terbatas)
- Telah menarik Activity Dashboards, ApiService, Model dan ApiClient.

## 4. CROSSCHECK ULANG ANDROID (Tahap Berjalan)
Ternyata Android menganut arsitektur pola repositori (MVVM/Repository pattern), sehingga masih ada "kerangka tulang" (*codebase*) yang bolong jika belum dimasukkan, yakni:
- [ ] **`Result.kt`** (Class pembungkus status keberhasilan: Success/Error/Loading untuk setiap tembakan API).
- [ ] **`api/repositories/`**: Memindahkan folder Repositori Kotlin (seperti `AuthRepository`, `AttendanceRepository`). Ini urat nadi perantara antara ApiService (Retrofit) dengan UI Activity.
- [ ] **`adapter/`**: Adapter (RecyclerView) Kotlin di luar file utama yang bertugas merajut list per-baris desain murid/jadwal menjadi antarmuka responsif.
- [ ] Action: Melakukan salin paksa (*copy*) sisa file vital ke struktur `Laporan-Mobile/Komponen-Mobile/`.
- [ ] Action: Membuat `.txt` keterangan fungsi untuk file Repositori (Pattern Repository) dan File *Adapter* / UI List agar materi laporan penulisan program menjadi lengkap dan solid dengan standar *"Clean Architecture"*.
