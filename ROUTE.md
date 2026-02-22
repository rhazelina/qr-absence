# 🗺️ Dokumentasi Routing & Komponen Frontend (QR Absence)

Halaman ini berisi daftar rute (routing), komponen yang digunakan, serta fitur utama dari setiap halaman di bagian frontend.

## 📂 Lokasi File
- **Routing Utama**: `frontend/src/App.jsx`
- **Direktori Halaman**: `frontend/src/pages/`
- **Direktori Komponen**: `frontend/src/components/`

---

## 🔑 Autentikasi & Halaman Publik
Halaman awal dan proses masuk ke dalam sistem.

| Path | Komponen | Fitur Utama | Keterangan |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage` | Navigasi Login, Info Aplikasi | Halaman utama / perkenalan |
| `/login/:role` | `LoginPage` | Login Multi-role, Simpan Token | Masuk sebagai Admin, Guru, Siswa, dll |
| `/login` | `Navigate` | Redirect | Otomatis kembali ke `/` jika tanpa parameter role |

---

## 🛠️ Modul Admin (`/admin`)
Digunakan oleh Administrator untuk manajemen data master sekolah.

| Path | Komponen | Fitur Utama | Keterangan |
| :--- | :--- | :--- | :--- |
| `/admin/dashboard` | `Dashboard` | Statistik Total (Siswa/Guru/Kelas), Ringkasan Data | Dashboard pusat kendali Admin |
| `/admin/siswa` | `DataSiswa` | CRUD Siswa, **Impor Excel**, Ekspor PDF/Excel | Manajemen database semua siswa |
| `/admin/guru` | `DataGuru` | CRUD Guru, Kelola Akun Pengguna | Manajemen database tenaga pengajar |
| `/admin/kelas` | `DataKelas` | CRUD Kelas, Assign Wali Kelas | Pengaturan rombongan belajar (Rombel) |
| `/admin/jurusan` | `DataJurusan`| CRUD Jurusan / Konsentrasi Keahlian | Manajemen daftar keahlian di sekolah |
| `/admin/profil-sekolah`| `ProfileSekolah`| Pengaturan Nama Sekolah, Logo, Alamat | Identitas instansi pada laporan |

---

## 👨‍🏫 Modul Guru (`/guru`)
Digunakan oleh guru mata pelajaran untuk mengelola presensi kelas.

| Path | Komponen | Fitur Utama | Keterangan |
| :--- | :--- | :--- | :--- |
| `/guru/dashboard` | `DashboardGuru`| Jadwal Hari Ini, Statistik Kehadiran Kelas | Dashboard personal guru |
| `/guru/jadwal` | `Jadwal` | List Jadwal Mengajar, Detail Jam Pelajaran | Melihat agenda mengajar per minggu |
| `/guru/presensi` | `PresensiSiswa`| Input Status Hadir/Sakit/Izin/Alfa | Melakukan absensi siswa saat KBM |

---

## 🎓 Modul Siswa (`/siswa`)
Digunakan oleh siswa untuk memantau kehadiran pribadi.

| Path | Komponen | Fitur Utama | Keterangan |
| :--- | :--- | :--- | :--- |
| `/siswa/dashboard` | `DashboardSiswa`| Status Absensi Terakhir, Profil Siswa | Ringkasan kehadiran siswa |
| `/siswa/riwayat` | `Riwayat` | Kalender Kehadiran, Filter Per Bulan | Melihat detil kapan saja siswa masuk/absen |

---

## 👥 Modul Pengurus Kelas (`/pengurus-kelas`)
Digunakan oleh ketua kelas atau sekretaris untuk membantu absensi mandiri.

| Path | Komponen | Fitur Utama | Keterangan |
| :--- | :--- | :--- | :--- |
| `/pengurus-kelas/dashboard` | `DashboardKelas`| Statistik Harian Kelas | Dashboard pengurus |
| `/pengurus-kelas/riwayat` | `RiwayatKelas`| List Absensi Kelas | Memantau kehadiran teman sekelas |
| `/pengurus-kelas/presensi` | `PresensiKelas`| Scan QR Attendance | Melakukan presensi kelas secara kolektif |

---

## 🏘️ Modul Wali Kelas (`/walikelas`)
Digunakan untuk memantau perkembangan kehadiran siswa di bawah bimbingannya.

| Path | Komponen | Fitur Utama | Keterangan |
| :--- | :--- | :--- | :--- |
| `/walikelas/dashboard` | `DashboardWakel` | Ringkasan Persentase Kehadiran Kelas | Fokus pada monitoring siswa binaan |
| `/walikelas/datasiswa` | `Data` | List Siswa Binaan | Melihat profil siswa di kelasnya |
| `/walikelas/riwayatkehadiran` | `RiwayatKehadiran` | Rekapitulasi per Siswa | Melihat total H/S/I/A per anak |
| `/walikelas/jadwalwakel` | `JadwalWakel` | Monitoring Jadwal Kelas | Memantau KBM yang sedang berlangsung |
| `/walikelas/presensi` | `Presensi` | Kontrol Real-time | Memastikan semua siswa sudah absen |

---

## 🏛️ Modul Waka / Manajemen (`/waka`)
Digunakan oleh Wakil Kepala Sekolah (Kurikulum/Kesiswaan) untuk monitoring global.

| Path | Komponen | Fitur Utama | Keterangan |
| :--- | :--- | :--- | :--- |
| `/waka/dashboard` | `DashboardWaka`| Chart Global, Statistik Seluruh Sekolah | Pantauan manajemen tingkat atas |
| `/waka/jadwal-guru` | `JadwalGuruIndex`| Monitoring Keaktifan Guru Mengajar | Pantau jadwal semua guru |
| `/waka/jadwal-siswa` | `JadwalSiswaIndex`| List Jadwal per Kelas | Monitoring KBM seluruh kelas |
| `/waka/kehadiran-siswa`| `KehadiranSiswaIndex`| Dashboard Kehadiran Siswa Global | Pantau absensi harian seluruh sekolah |
| `/waka/kehadiran-siswa/rekap`| `KehadiranSiswaRekap` | **Export Laporan (Excel/PDF)**, Filter Tanggal | Pembuatan laporan bulanan/semester |
| `/waka/kehadiran-guru` | `KehadiranGuruIndex`| Monitoring Presensi Guru | Pantau kehadiran guru di setiap jam |
| `/waka/jadwal-guru/:id` | `JadwalGuruShow`| Detail Jadwal Spesifik Guru | Lihat jam mengajar satu guru tertentu |
| `/waka/jadwal-siswa/:id` | `JadwalSiswaShow`| Detail Jadwal Spesifik Kelas | Lihat jam pelajaran satu kelas tertentu |

---

## 🛠️ Catatan Implementasi
- **Data Fetching**: Menggunakan API Service sentral di `frontend/src/utils/api.js`.
- **Export Engine**: Menggunakan `exceljs` untuk laporan Excel yang kompleks dan `jspdf` untuk PDF.
- **Styling**: Campuran antara Vanilla CSS (`.css` per halaman) dan Tailwind CSS v4.
- **Icons**: Menggunakan `react-icons/fa` (FontAwesome).

---
*Dibuat otomatis oleh Antigravity untuk dokumentasi proyek.*
