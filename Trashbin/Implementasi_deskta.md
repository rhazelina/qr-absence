# Blueprint Implementasi Frontend Deskta (React TSX)

Dokumen ini adalah panduan komprehensif (Checklist & Panduan Integrasi API) khusus untuk aplikasi frontend **@deskta**. Semua _role_ dan halaman telah dipetakan terhadap endpoint backend yang tersedia beserta aturan validasi ketat yang wajib diimplementasikan di sisi UI.

**Progress Keseluruhan: `[~] 72%`**

---

### Phase 1: Core Foundation, Auth & Settings (`[x] 100% Complete`)
Fase fundamental agar aplikasi bisa berjalan, berkomunikasi dengan API, dan mengambil *state* global.

- [x] **Konfigurasi Environment:** `VITE_API_BASE_URL` didukung (fallback tetap ke `VITE_API_URL` & default localhost).
- [x] **Auth Flow (`LandingPage.tsx`, `LoginPage.tsx`):**
  - [x] Integrasi `POST /api/login`.
  - [x] Simpan token Sanctum dengan aman, manajemen *state* User & Role.
  - [x] Handle error 401 (Unauthorized) & 422 (Validasi Email/Password salah).
  - [x] _Route Guard_: Tendang ke `/login` jika belum login.
- [x] **API Utility (`services/api.ts`):** 
  - [x] Setup Axios interceptor (Auto attach `Bearer Token`).
  - [x] Handle *global logout* jika menerima 401 saat beroperasi.
  - [x] Parse error 422 agar detail validasi field terekspos ke UI (`fieldErrors`, `validationMessages`).
- [x] **Global Info Sekolah (`Sidebar.tsx`, Header):**
  - [x] Fetch setting publik saat startup app.
  - [x] Terapkan nama sekolah dan logo ke Sidebar/Header secara dinamis, tanpa _hardcode_.

---

### Phase 2: Master Data Management (Admin) (`[~] 90% Complete`)
Admin mengelola pondasi data. Semua form input harus merender error 422 dari backend dengan rapi.

- [x] **Dashboard Admin (`Admin/DashboardAdmin.tsx`):** 
  - [x] Integrasi `GET /api/admin/summary` untuk *counting* cards.
- [ ] **Data Tahun Ajaran & Semester (`Admin/TahunAjaranAdmin.tsx`):**
  - [ ] Integrasi CRUD `/api/school-years` & `/api/semesters`.
- [x] **Data Jurusan (`Admin/JurusanAdmin.tsx`):**
  - [x] Integrasi CRUD `/api/majors`.
- [ ] **Data Ruangan & Jam Pelajaran (`Admin/RuanganAdmin.tsx`):**
  - [ ] Integrasi CRUD `/api/rooms` dan `/api/time-slots`.
- [ ] **Data Mapel (`Admin/MapelAdmin.tsx`):**
  - [ ] Integrasi CRUD `/api/subjects`.
- [x] **Data Kelas (`Admin/KelasAdmin.tsx`):**
  - [x] Integrasi CRUD `/api/classes`. Load master Jurusan dan master Guru (sebagai Walikelas) untuk Dropdown.
- [x] **Data Guru (`Admin/GuruAdmin.tsx`, `TambahGuru.tsx`, `DetailGuru.tsx`):**
  - [x] Integrasi CRUD `/api/teachers`. 
  - [x] Validasi UI: NIP unik, Enum Jabatan. (frontend + mapping error 422 backend ke field form utama)
- [x] **Data Siswa (`Admin/SiswaAdmin.tsx`, `TambahSiswa.tsx`, `DetailSiswa.tsx`):**
  - [x] Integrasi CRUD `/api/students`.
  - [x] Validasi UI: NISN unik, batasi opsi gender (L/P), dropdown kelas. (frontend + mapping error 422 backend ke field form utama)

---

### Phase 3: Penjadwalan Tingkat Lanjut (Waka Staff) (`[x] 100% Complete`)
Modul paling kompleks. Memiliki **14 Files**. Tidak boleh ada data _hardcode_.

- [x] **Dashboard Waka (`WakaStaff/DashboardStaff.tsx`):**
  - [x] Integrasi `GET /api/waka/dashboard/summary`.
  - [x] *Data Binding:* Hubungkan state grafik Pie/Bar dengan data JSON asli dari backend, hapus chart statik.
- [x] **Jadwal Guru (`WakaStaff/JadwalGuruStaff.tsx`, `WakaStaff/LihatGuru.tsx`):**
  - [x] Fetch list guru & view jadwal per guru via API.
  - [x] Upload jadwal guru menampilkan pesan validasi backend (422) dengan jelas.
- [x] **Jadwal Kelas / Siswa (`WakaStaff/JadwalKelasStaff.tsx`, `WakaStaff/LihatKelas.tsx`):**
  - [x] Fetch list kelas via `GET /api/classes`.
  - [x] Detail kelas fetch by ID (`GET /api/classes/{id}`) dan render info kelas/wali/jurusan dinamis.
  - [x] Upload jadwal kelas menampilkan pesan validasi backend (422) dengan jelas.
- [x] **Pembuat Jadwal (`WakaStaff/JadwalSiswaEdit.tsx`):** *(KRUSIAL)*
  - [x] Pastikan form hanya menggunakan data dari Master (Mapel, Ruangan, Guru).
  - [x] Implementasi bulk upsert jadwal per kelas (`/api/classes/{id}/schedules/bulk`).
  - [x] **Validasi Wajib:** Error 422 _"Guru sudah ada jadwal di kelas lain"_ dan _"Waktu bentrok"_ tampil di UI tanpa me-_wipe_ form.
  - [x] Validasi frontend tambahan diekspos jelas (duplikasi hari, field item wajib, validasi rentang jam, validasi tipe/ukuran file visual).
- [x] **Monitoring Kehadiran Guru (`WakaStaff/KehadiranGuru.tsx`, `DetailKehadiranGuru.tsx`, `Modaldetailkehadiranguru.tsx`):**
  - [x] Integrasi `GET /api/waka/attendance/teachers/daily` dan detail history `/api/teachers/{teacher}/attendance-history`.
  - [x] Validasi rentang tanggal tampil eksplisit di UI (tidak silent fail), dan aksi edit dummy dihapus agar tidak misleading.
- [x] **Monitoring Kehadiran Siswa (`WakaStaff/KehadiranSiswa.tsx`, `RekapKehadiranSiswa.tsx`, `DetailSiswaStaff.tsx`, `DaftarKetidakhadiran.tsx`):**
  - [x] Integrasi rekap global via `/api/waka/classes/{class}/attendance-summary`.
  - [x] Integrasi log harian `/api/waka/classes/{class}/attendance`.
  - [x] Integrasi daftar ketidakhadiran siswa kelas via `/api/classes/{class}/students/absences` dengan payload siswa dari rekap.

---

### Phase 4: Operasional Guru (Absensi & QR) (`[x] 100% Complete`)
Interaksi harian kritis saat kegiatan mengajar.

- [x] **Dashboard Guru (`Guru/GuruDashboard.tsx`):**
  - [x] Integrasi `GET /api/me/teacher/dashboard` dan jadwal harian via `GET /api/me/schedules/today`.
  - [x] **Logika UI Live:** Tombol/Icon "Scan" hanya aktif saat waktu lokal masuk rentang (start - 15 menit) s/d end time.
- [x] **Scanner Kamera (`component/Shared/Form/MetodeGuru.tsx`, `CameraScanner.tsx`):**
  - [x] Render modal, hidupkan kamera via `html5-qrcode`.
  - [x] **Validasi:** Handle akses kamera diblokir browser, tersedia tombol "_Fallback_ ke Mode Manual".
  - [x] Eksekusi POST scan `attendanceService.scanQrToken()`. 
  - [x] **Validasi:** Tangkap error 400 (di luar radius sekolah) dan 403 (token QR kadaluarsa) dengan feedback UI.
- [x] **Daftar Hadir Murid per Sesi (`Guru/KehadiranSiswaGuru.tsx`):**
  - [x] Input Absen Centang Manual (Fallback dari Scan QR) `GET /api/me/schedules/{schedule}/students`.
  - [x] Submit Manual via `POST /api/me/schedules/{schedule}/students/{student}/leave` (Izin/Sakit/Alfa).
  - [x] Validasi error API (422/403/dll) diekspos langsung di UI, bukan alert tersembunyi.
- [x] **Tutup Sesi (Selesai Mengajar):**
  - [x] Panggil endpoint `POST /api/me/schedules/{schedule}/close` untuk mengunci absensi. (Siswa tidak bisa absen lagi).

---

### Phase 5: Peran Pengurus Kelas (Generator QR) (`[~] 60% Complete`)
Fungsi unik jika Guru tidak ingin men-scan satu-satu.

- [x] **Dashboard Kelas (`PengurusKelas/DashboardPengurusKelas.tsx`):**
  - [x] Dashboard Monitoring Pengurus (Stats & Schedule).
  - [x] Panggil `/api/me/class/...` via `dashboardService`.
- [ ] **Generate QR (`PengurusKelas/PresensiKelas.tsx`):**
  - [ ] Hit endpoint `POST /api/qr-codes/generate`.
  - [ ] Tampilkan SVG barcode di layar laptop kelas.
- [x] **Monitoring Status Sesi:**
  - [x] Polling/Refresh list absensi real-time sudah diimplementasikan di Dashboards.

---

### Phase 6: Monitoring Wali Kelas & Siswa (`[x] 100% Complete`)

- [x] **Wali Kelas - Dashboard (`WaliKelas/DashboardWalliKelas.tsx`):**
  - [x] Fetch statistik `/api/me/homeroom/dashboard`. Binding ke donut/pie chart riil.
- [x] **Wali Kelas - Monitor & Riwayat (`WaliKelas/KehadiranSiswaWakel.tsx`, `WaliKelas/DaftarKetidakhadiranWaliKelas.tsx`):**
  - [x] Integrasi data murid kelas asuhannya `GET /api/me/homeroom/students`.
  - [x] Handle validasi pengajuan Dispensasi dari siswa (Update reason/status workflow).
- [x] **Siswa - Dashboard & Riwayat (`Siswa/DashboardSiswa.tsx`, `Siswa/AbsensiSiswa.tsx`):**
  - [x] Integrasi `/api/me/dashboard/summary` (Chart presentase kehadiran diri sendiri).
  - [x] Fetch jadwal harian dan history absensi.
  - [x] **Integration Form Izin/Sakit for Siswa (Request Leave):** (Mata Pelajaran/Sesi Specific).
- [x] **QR Code Expiration Extension:** 45 menit + Toleransi 15 menit.

---

### Phase 7: Ekstra & Finishing (`[x] 100%`)
- [x] **Sistem Peringatan Dinamis:** Hapus semua "Feature Disabled" UI, sambungkan alert ke status _server_ sebenarnya (maintenance atau error 500) via `App.tsx` global alert overlay.
- [x] **Sinkronisasi Akhir:** Uji coba end-to-end seluruh role untuk persiapan presentasi hari Rabu.
