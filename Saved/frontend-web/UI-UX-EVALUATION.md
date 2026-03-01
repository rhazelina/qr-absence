# UI/UX Evaluation Web Frontend

Dokumen ini merangkum evaluasi konsistensi UI/UX untuk `frontend` (web), dengan referensi pola visual dari `Kosongan/Website-UI`.

## Ringkasan Temuan

1. Layout container antar halaman belum konsisten:
- beberapa halaman memakai `padding-left/right` fix (`3rem`, `4rem`, `5rem`)
- beberapa halaman mengunci lebar di `1200px/1280px/1300px`

2. Komponen internal tidak skala-adaptif:
- header card, filter card, table cell spacing banyak yang hardcoded
- ukuran elemen tidak proporsional pada layar besar/kecil

3. Inkonsistensi visual halaman detail:
- `Kehadiran Siswa Show` belum memiliki filter mapel seperti pola referensi
- CSS halaman detail masih bocor secara global (selector `input[type="date"]`, `tr`, dll)

## Perbaikan Yang Sudah Diterapkan

1. Standardisasi token layout global di `frontend/src/index.css`:
- `--web-content-max`
- `--web-page-pad-x`
- `--web-page-pad-top`
- `--web-sidebar-w`
- `--web-sidebar-gap`

2. Penyamaan container scalable lintas role (Admin/Waka/Guru/Siswa):
- container utama memakai max width token dan padding token
- offset sidebar memakai formula variabel, bukan angka fix

3. Penyamaan internal spacing komponen utama:
- Waka: `JadwalGuruIndex`, `KehadiranGuruIndex`, `KehadiranSiswaIndex`, `KehadiranGuruShow`, `DashboardWaka`
- Guru: `DashboardGuru`
- Siswa: `DashboardSiswa`

4. Perbaikan detail attendance (`KehadiranSiswaShow`):
- menambah filter `Semua Mata Pelajaran / per mapel`
- statistik mengikuti data hasil filter mapel
- empty-state mengikuti konteks filter mapel
- CSS di-scope ke halaman agar tidak memengaruhi komponen lain

## Prioritas Lanjutan (Disarankan)

1. Refactor `Guru/PresensiSiswa.css` dan `Waka/KehadiranSiswaRekap.css` ke token spacing yang sama.
2. Normalisasi warna status (present/late/excused/sick/absent/return) ke satu mapping global.
3. Buat komponen reusable:
- `PageHeader`
- `FilterCard`
- `StatsStrip`
- `DataTableShell`
4. Kurangi inline style di JSX agar lebih mudah maintenance.
