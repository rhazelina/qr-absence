# Fixing-UIWeb Audit Report

Tanggal: 2026-03-03
Target: Restorasi UI match backup + audit integrasi backend (`web-fe`)

## 1) Status Eksekusi
- `bun run lint`: **PASS** (0 error, warning non-blocking).
- `bun run build`: **PASS**.
- Scan larangan runtime:
  - `localhost:5000`: **tidak ditemukan**
  - `authToken`: **tidak ditemukan**
  - `absensi_history`: **tidak ditemukan**

## 2) File Utama Yang Disinkronkan/Patch
### Pages
- `web-fe/src/pages/Admin/DataGuru.jsx`
- `web-fe/src/pages/Admin/DataKelas.jsx`
- `web-fe/src/pages/Admin/Profilesekolah.jsx`
- `web-fe/src/pages/Siswa/DashboardSiswa.jsx`
- `web-fe/src/pages/Siswa/Riwayat.jsx`
- `web-fe/src/pages/Guru/DashboardGuru.jsx`
- `web-fe/src/pages/Guru/PresensiSiswa.jsx`
- `web-fe/src/pages/WaliKelas/DashboardWakel.jsx`
- `web-fe/src/pages/WaliKelas/Presensi.jsx`
- `web-fe/src/pages/Waka/DashboardWaka.jsx`
- `web-fe/src/pages/Waka/JadwalGuruIndex.jsx`
- `web-fe/src/pages/Waka/JadwalGuruShow.jsx`
- `web-fe/src/pages/Waka/JadwalGuruEdit.jsx`
- `web-fe/src/pages/Waka/JadwalSiswaIndex.jsx`
- `web-fe/src/pages/Waka/JadwalSiswaShow.jsx`
- `web-fe/src/pages/Waka/JadwalSiswaEdit.jsx`
- `web-fe/src/pages/Waka/KehadiranGuruIndex.jsx`
- `web-fe/src/pages/Waka/KehadiranGuruShow.jsx`
- `web-fe/src/pages/Waka/KehadiranSiswaIndex.jsx`
- `web-fe/src/pages/PengurusKelas/RiwayatKelas.jsx`
- `web-fe/src/pages/PengurusKelas/DashboardKelas.jsx`

### Components
- `web-fe/src/components/Waka/NavbarWaka.jsx`

### Supporting
- `web-fe/eslint.config.js`
- `web-fe/src/pages/Admin/ProfileSekolah.css` (alias file untuk case-sensitive build)

## 3) Status UI Match
- Pendekatan implementasi: **UI backup dipertahankan** (struktur tampilan, className, dan layout utama tetap), patch dilakukan pada data wiring/API dan auth flow.
- Perubahan bersifat logika integrasi backend, bukan redesign UI.

## 4) Endpoint Mapping Per Halaman
- `Admin/DataGuru`
  - `GET /teachers`
  - `POST /teachers`
  - `PUT /teachers/{id}`
  - `DELETE /teachers/{id}`
  - `POST /import/guru`
  - `GET /classes` (resolve wali kelas)
- `Admin/DataKelas`
  - `GET /classes`
  - `GET /available-homeroom-teachers`
  - `POST /classes`
  - `PUT /classes/{id}`
  - `DELETE /classes/{id}`
- `Admin/Profilesekolah`
  - `GET /settings`
  - `POST /settings`
- `Siswa/DashboardSiswa`
  - `GET /me`
  - `GET /me/class`
  - `GET /me/dashboard/schedule-today`
  - `GET /me/dashboard/attendance-stats`
- `Siswa/Riwayat`
  - `GET /me`
  - `GET /me/attendance`
  - `GET /me/attendance/summary`
- `Guru/DashboardGuru`
  - `GET /me`
  - `GET /me/schedules/today`
  - `GET /attendance/schedules/{schedule}`
- `Guru/PresensiSiswa`
  - `GET /me/schedules/{schedule}/students`
  - `GET /attendance/schedules/{schedule}`
  - `POST /attendance/bulk-manual`
- `WaliKelas/DashboardWakel`
  - `GET /me`
  - `GET /me/homeroom`
  - `GET /me/homeroom/schedules`
  - `GET /me/homeroom/students`
  - `GET /attendance/schedules/{schedule}`
- `WaliKelas/Presensi`
  - `GET /me/schedules/{schedule}/students`
  - `GET /attendance/schedules/{schedule}`
  - `POST /attendance/bulk-manual`
- `Waka/DashboardWaka`
  - `GET /waka/dashboard/summary`
  - `GET /waka/attendance/summary`
- `Waka/JadwalGuru*`
  - `GET /teachers`
  - `GET /teachers/{id}`
  - `PUT /teachers/{id}`
  - `POST /teachers/{id}/schedule-image`
  - `DELETE /teachers/{id}/schedule-image`
- `Waka/JadwalSiswa*`
  - `GET /classes`
  - `GET /classes/{id}`
  - `POST /classes/{id}/schedule-image`
  - `DELETE /classes/{id}/schedule-image`
- `Waka/KehadiranGuru*`
  - `GET /waka/attendance/teachers/daily`
  - `GET /teachers/{id}/attendance-history`
- `Waka/KehadiranSiswaIndex`
  - `GET /classes`

## 5) Hasil Uji 401/403/422
- `401`: ditangani terpusat di `utils/api` (`clearAuth()` dipanggil otomatis).
- `422`: pesan validasi backend diprioritaskan dari `errors[field][0]`.
- `403`: pesan backend diteruskan ke UI melalui `err.message`.

## 6) Residual Issue
### Low
- Masih ada string kata `dummy` pada:
  - komentar statis di `Admin/DataKelas.jsx` (komentar saja).
  - file util data cadangan `pages/data/attendanceData.js` (bukan source runtime integrasi endpoint).
- Warning lint non-blocking masih ada di beberapa file legacy backup.

## 7) Kesimpulan
- Integrasi backend aktif di role: **Admin, Guru, Wali Kelas, Siswa, Waka, Pengurus Kelas (token flow)**.
- Build/lint dengan `bun` sudah berjalan.
- Tidak ada lagi dependency runtime ke `localhost:5000`, `authToken`, atau `absensi_history`.
