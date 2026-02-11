# Deskta Project TODOs

Daftar tugas khusus untuk aplikasi Desktop (Deskta) guna mencapai paritas fitur dan stabilitas dengan versi Web.

## 🏁 Prioritas Utama (Stabilitas Session)
- [ ] **Fix Inconsistency Redirect 'Wakel'**:
  - `LoginPage.tsx` mengarah ke `/walikelas/dashboard`.
  - `App.tsx` mengharapkan `/wakel/dashboard`.
  - Akibat: Redirect pecah/404 setelah login sebagai Wali Kelas.
- [ ] **Sinkronisasi Role Backend**: Backend mengirim `user_type`, namun Deskta sering mengecek `role`. Samakan logika agar tidak terjadi session mismatch.
- [ ] **Standarisasi Logout & Storage**:
  - Gunakan utility storage terpusat (hindari penggunaan `localStorage` langsung di banyak tempat).
  - Samakan alur logout antar komponen (Web vs Deskta).

## 🛠️ Gap Fitur & Fungsionalitas
- [ ] **Integrasi Real-time (Echo)**: Aktifkan listener Laravel Echo yang sudah diimpor di `PresensiSiswa.jsx` dan dashboard lainnya agar data update otomatis.
- [ ] **Fitur Guru Pengganti**: Implementasikan logika asli untuk menggantikan komponen `ComingSoon` di `DashboardStaff.tsx`.
- [ ] **Data Fetching Gaps (Critical)**:
  - [ ] `KehadiranSiswa.tsx`: Selesaikan implementasi fetching data yang saat ini masih 'None fetch'.
  - [ ] `KehadiranGuru.tsx`: Ganti data dummy dengan data riil dari API backend.
  - [ ] `RekapKehadiranSiswa.tsx`: Hubungkan ke endpoint rekapitulasi backend yang sesuai.
- [ ] **Perbaikan Temp-ID Wali Kelas**: Ganti `Math.random()` di `KehadiranSiswaWakel.tsx` dengan penanganan ID yang lebih aman dari backend.
- [ ] **Modul Jadwal & Gambar**:
  - [ ] Hilangkan ketergantungan pada `DummyJadwal.png`.
  - [ ] Pastikan modul upload/display jadwal kelas dan guru berfungsi 100% menggunakan `STORAGE_BASE_URL`.
- [ ] **Fitur Impor (Admin)**: Verifikasi dan selesaikan integrasi tombol "Impor" di `SiswaAdmin.tsx` dan `GuruAdmin.tsx` agar terhubung ke CSV Parser backend.
- [ ] **Native Integration**: Persiapan packaging aplikasi menggunakan Electron atau Tauri untuk menjadi executable `.exe`.

## ⚠️ Error Fetching & Race Conditions
- [ ] **Propagasi AbortSignal**: 
  - [ ] Pastikan semua pemanggilan service di `useEffect` meneruskan `signal` (AbortSignal) ke API client.
  - [ ] Contoh: Di `DashboardStaff.tsx`, signal sudah dibuat tapi belum di-pass ke `getWakaDashboardSummary`.
- [ ] **KehadiranGuruIndex.jsx**: Cegah penumpukan request saat user mengganti `date` dengan cepat (race condition).
- [ ] **Error States UI**: Berikan fallback UI yang informatif daripada membiarkan halaman kosong atau crash saat API error.

## 🎨 UI, CSS & Refactoring
- [ ] **Migrasi Tailwind 4**:
  - [ ] Project sudah memiliki `@tailwindcss/vite` v4, namun `index.css` masih berupa Vanilla CSS manual yang sangat besar.
  - [ ] Disarankan migrasi bertahap ke utility-first sesuai standar project.
- [ ] **Konsistensi Role Naming**: Pastikan penggunaan `wakel` (kependekan) atau `walikelas` (lengkap) konsisten di seluruh aplikasi (saat ini campur aduk).
- [ ] **Utilitas Status Terpusat**: Migrasikan semua komponen untuk menggunakan `statusMapping.ts`.

---
*Catatan: File ini disusun berdasarkan audit project terakhir pada 2026-02-10.*
