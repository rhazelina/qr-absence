# Panduan Implementasi web-fe (Frontend)

Dokumen ini berisi pemetaan lengkap mengenai **alur (flow)**, **endpoint API Backend**, dan **aturan validasi wajib** untuk setiap role (Admin, Waka, Wali Kelas, Guru, Pengurus Kelas, dan Siswa) yang harus diterapkan di aplikasi React `web-fe`.

---

## 🔐 1. Authentication & Global Rules
**Endpoint:** `POST /api/auth/login`
- **Alur Login:** User memasukkan Username dan Password.
- **Validasi Frontend:**
  - Username dan password wajib diisi.
  - Tangani response error (contoh: 401 Unauthorized jika kredensial salah).
- **Penyimpanan:** Token (`Bearer {token}`) dan identitas user (beserta Role) wajib disimpan di `localStorage` atau React Context. Semua request CRUD ke endpoint ber-prefix `/api/` (kecuali login/settings public) WAJIB menyertakan Header `Authorization: Bearer {token}`.

---

## 👑 2. Role: Admin
**Tugas Utama:** Mengelola data Master (Master Data Management).

### A. Data Master Jurusan (`/api/majors`)
- **GET:** Menampilkan seluruh jurusan.
- **POST/PUT Data:** `name` (string), `code` (string), `group` (string, misal: TI, Bisnis).
- **Validasi Frontend:**
  - Field nama dan kode tidak boleh kosong. Tangkap *Error 422* jika kode jurusan sudah terdaftar (Unique constraint dari backend).

### B. Data Master Kelas (`/api/classes`)
- **GET:** Menampilkan kelas beserta data Wali Kelas.
- **POST/PUT Data:** `class_name` (otomatis gabungan grade, jurusan, label - e.g. XII RPL 1), `major_id` (foreign), `grade` (10/11/12), `homeroom_teacher_id` (foreign - guru).
- **Validasi Frontend:**
  - `grade` wajib diisi `[10, 11, 12]`.
  - Hanya user dengan `user_type = teacher` yang boleh menjadi `homeroom_teacher_id`.

### C. Data Master Guru (`/api/teachers`)
- **GET:** Menampilkan list Guru.
- **POST/PUT Data:** `name`, `nip`, `email`, `kode_guru`, `jabatan` (array).
- **Validasi Frontend (PENTING!):**
  - **Uniqueness:** NIP dan Kode Guru harus unik! Jika Backend mengembalikan 422 (Unique Constraint Violation), beritahu user.
  - **Enumeration:** Jabatan `[Guru, Waka, Kapro, Wali Kelas]`. Wajib pakai Select Dropdown (tidak boleh Text Input bebas).

### D. Data Master Siswa (`/api/students`)
- **GET:** Menampilkan list Siswa.
- **POST/PUT Data:** `name`, `nisn`, `nis`, `gender`, `class_id`.
- **Validasi Frontend:**
  - `nisn` dan `nis` harus unik (tangkap error 422).
  - Validasi Gender hanya: `['L', 'P']`. Wajib pakai Dropdown Select atau Radio Button.

---

## 👔 3. Role: Siswa
**Tugas Utama:** Melihat jadwal hari ini dan rekap absensi.

### A. Dashboard Siswa
- **Endpoint:** `GET /api/me/dashboard/summary` ATAU `GET /api/me/dashboard/schedule-today`.
- **Alur:** 
  1. Frontend fetch endpoint dashboard siswa.
  2. Render data diri Siswa (Nama, NIS, Kelas) dari object `student`.
  3. Render Jadwal Hari ini dari object `schedule_today`. Tampilkan jam, mapel, guru, dan **Status Absensi** (Hadir/Alpha/Terlambat dll).

### B. Riwayat Kehadiran (Siswa)
- **Endpoint:** `GET /api/me/attendance/summary` dan `GET /api/me/attendance`.
- **Alur:** Render rekap total (Berapa Hadir, Sakit, Izin) dan list absensi historis di sebuah Data Table.

---

## 👨‍🏫 4. Role: Guru
**Tugas Utama:** Melihat jadwal mengajar pribadinya dan Input absen siswa di kelas tersebut.

### A. Dashboard Guru
- **Endpoint:** `GET /api/me/teacher/dashboard`
- **Output:** `statistik` absen untuk mapel yang ia ajar, `trend` bulanan, dan jadwal mengajar hari ini.

### B. Pengisiian Absensi / Presensi Siswa
- **Alur & Endpoint:** 
  1. Saat guru membuka menu absensi di salah satu jadwal:
     - Gunakan endpoint `GET /api/me/schedules/{schedule_id}/students` untuk mendapat daftar murid di kelas tersebut.
  2. Guru Input Absensi manual (Sakit/Izin/Alpha/Terlambat/Pulang):
     - Gunakan `POST /api/attendance/scan-student` ATAU `POST /api/me/schedules/{schedule}/students/{student}/leave` untuk menandai ketidakhadiran spesifik.
  3. **Penutupan Kelas:** Jika sudah selesai mengajar, panggil `POST /api/me/schedules/{schedule}/close`.
- **Validasi Frontend:**
  - Hapus mekanisme penyimpanan di `localStorage` / `dataManager.js`.
  - Pastikan semua perubahan status absen tertembak ke POST backend secara live.

---

## 🎓 5. Role: Waka (Wakil Kepala Sekolah)
**Tugas Utama:** Monitoring, Analytics, Dashboard Keseluruhan, Pengelolaan Jadwal.

### A. Dashboard Waka (Dashboard Eksekutif)
- **Endpoint:** `GET /api/waka/dashboard/summary`
- **Alur:** Tangkap 3 komponen utama response:
  - `statistik`: Tampilkan di **Pie Chart** (Persentase absen hari ini).
  - `daily_stats`: Tampilkan di **Bar Chart** (Kehadiran breakdown Senin-Jumat).
  - `trend`: Tampilkan di **Line Chart** (Tren 6 bulan terakhir).

### B. Rekap Kehadiran
- Waka dapat melihat rekap absensi siapapun melalui:
  - `GET /api/waka/attendance/teachers/daily` (Guru)
  - `GET /api/waka/classes/{class}/attendance` (Siswa se-sekolah per kelas)

### C. Pengelolaan Jadwal Guru & Siswa
- **Endpoint Utama:** Integrasi dengan `GET /api/schedules` dan `/api/classes/{class}/schedules/bulk`.
- **Validasi Frontend:** Waka dilarang dilarang menggunakan endpoint _mock_ (cth. `localhost:5000`). Komponen React di folder `src/pages/Waka/` wajib direfactor untuk menunjuk ke Backend Laravel.

---

## 🏛️ 6. Role: Wali Kelas
**Tugas Utama:** Monitoring kelas asuhannya.

### A. Dashboard Wali Kelas
- **Endpoint:** `GET /api/me/homeroom/dashboard`
- **Output & Alur:** Menampilkan summary statistik kelas, total murid, dan jadwal pelajaran kelas tersebut *hari ini*. Frontend perlu memvisualisasikannya di card atau chart sederhana.

### B. Daftar Siswa & Rekap Absen Kelas Asuhan
- Menggunakan endpoint `GET /api/me/homeroom/students` dan `GET /api/me/homeroom/attendance/summary` untuk menampilkan performa kehadiran kelas di tabel.

---

## 📝 7. Role: Pengurus Kelas
**Tugas Utama:** (Optional/Bila diaktifkan) Perwakilan Siswa (e.g. Ketua Kelas) yang dapat melihat statistik seluruh kelasnya.

### A. Dashboard Pengurus Kelas
- **Endpoint:** `GET /api/me/class/dashboard`
- Mengakses statistik dan tren khusus bagi kelas_id tempat siswa tersebut berada.
- **Validasi:** Hanya siswa dengan field `is_class_officer = 1` yang akan diloloskan oleh Middleware Backend. Tangani tampilan Error 403 Forbidden di Frontend jika akses ditolak.

---

---

## 🚀 Phase Implementation Checklist (Urutan Pengerjaan)

Gunakan checklist ini untuk memantau progres migrasi dari data *mock* ke API *real*.

### Phase 1: Core Foundation & Auth (`[x] 100%`)
- [x] **Config API:** Pastikan `API_BASE_URL` di `.env` frontend menunjuk ke `http://localhost:8000/api`.
- [x] **Auth Flow (`Auth/LoginPage.jsx`, `Auth/LandingPage.jsx`):** Refactor login untuk simpan Bearer token & validasi role.
- [x] **Global API Wrapper (`utils/api.js`):** Buat/Update interceptors (Auto-inject token & handle 401).

### Phase 2: Master Data & Admin (`[x] 100%`)
- [x] **Dashboard Admin (`Admin/Dashboard.jsx`):** 
  - [x] Integrasi `GET /api/admin/summary` (Counts).
  - [x] Menampilkan **Kehadiran Hari Ini** (Live Stats).
- [x] **Data Jurusan (`Admin/DataJurusan.jsx`):** Integrasi CRUD `/api/majors`.
- [x] **Data Kelas (`Admin/DataKelas.jsx`):** Integrasi CRUD `/api/classes`.
- [x] **Data Guru (`Admin/DataGuru.jsx`):** Integrasi CRUD `/api/teachers` (Validasi NIP unique, Enum Jabatan).
- [x] **Data Siswa (`Admin/DataSiswa.jsx`):** Integrasi CRUD `/api/students` (Validasi NISN unique, Dropdown Gender).
- [x] **Profile Sekolah (`Admin/Profilesekolah.jsx`):** Integrasi update `/api/settings`.

### Phase 3: Teacher Core Logic (`[x] 100%`)
- [x] **Dashboard Guru (`Guru/DashboardGuru.jsx`):** Fetch `/api/me/teacher/dashboard`.
- [x] **Jadwal Mengajar (`Guru/Jadwal.jsx`):** Fetch `/api/me/schedules`.
- [x] **Sistem Presensi (`Guru/PresensiSiswa.jsx`):** 
  - [x] Hapus total file `utils/dataManager.js` (No LocalStorage).
  - [x] Implementasi Fetch Murid per Jadwal (`GET /api/me/schedules/{schedule}/students`).
  - [x] Implementasi POST Absen (Optimasi via `POST /api/attendance/bulk-manual`).
  - [x] Tutup Jadwal (`POST /api/me/schedules/{schedule}/close`).

### Phase 4: Walikelas & Siswa & Pengurus monitoring (`[x] 100%`)
- [x] **Siswa - Dashboard (`Siswa/DashboardSiswa.jsx`):** Integrasi `/api/me/dashboard/summary`.
- [x] **Siswa - Riwayat (`Siswa/Riwayat.jsx`):** Integrasi `/api/me/attendance`.
- [x] **Walikelas - Dashboard (`WaliKelas/DashboardWakel.jsx`):** Integrasi `/api/me/homeroom/dashboard`.
- [x] **Walikelas - Data Murid (`WaliKelas/Data.jsx`):** Integrasi `/api/me/homeroom/students`.
- [x] **Walikelas - Jadwal (`WaliKelas/JadwalWakel.jsx`):** Integrasi `/api/me/homeroom/schedules`.
- [x] **Walikelas - Presensi & Riwayat (`WaliKelas/Presensi.jsx`, `WaliKelas/RiwayatKehadiran.jsx`):** Integrasi `/api/me/homeroom/attendance` dan `/api/me/homeroom/attendance/summary`.
- [x] **Pengurus Kelas (`PengurusKelas/DashboardKelas.jsx`, `PresensiKelas.jsx`, `RiwayatKelas.jsx`):** Integrasi `/api/me/class/...` (Gunakan guard if role pengurus divalidasi).

### Phase 5: Waka Monitoring & Management (`[x] 100%`)
Waka memiliki 12 file komponen, wajib dipetakan secara teliti agar tidak ada yang terlewat:
- [x] **Dashboard Waka (`Waka/DashboardWaka.jsx`):** 
  - Plotting object `statistik` (Pie), `daily_stats` (Bar), dan `trend` (Line chart) via `/api/waka/dashboard/summary`.
- [x] **Jadwal Guru (`Waka/JadwalGuruIndex.jsx`, `JadwalGuruShow.jsx`, `JadwalGuruEdit.jsx`):** 
  - Ganti *mock fetch* ke `/api/teachers`. Handle upload via `POST /api/teachers/{teacher}/schedule-image`.
- [x] **Jadwal Siswa (`Waka/JadwalSiswaIndex.jsx`, `JadwalSiswaShow.jsx`, `JadwalSiswaEdit.jsx`):** 
  - Ganti *mock fetch* ke `/api/classes`. Handle upload via `POST /api/classes/{class}/schedule-image`.
- [x] **Kehadiran Guru (`Waka/KehadiranGuruIndex.jsx`, `KehadiranGuruShow.jsx`):** 
  - Rekap Harian (`GET /api/waka/attendance/teachers/daily`). Detail Riwayat (`GET /api/teachers/{teacher}/attendance-history`).
- [x] **Kehadiran Siswa (`Waka/KehadiranSiswaIndex.jsx`, `KehadiranSiswaRekap.jsx`, `KehadiranSiswaShow.jsx`):** 
  - Rekap Global via `/api/waka/classes/{class}/attendance-summary` dan detail list harian via `/api/waka/classes/{class}/attendance`.
