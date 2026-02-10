# Project Audit & Revision List (update-harris.md)

Dokumen ini rangkuman semua hal yang perlu direvisi, diperbaiki, dan diselesaikan dalam sistem QR Absence (Backend, Frontend Web, & Deskta).

## 🔴 Status Sistem Saat Ini (Technical Blocks)
- [ ] **Backend 500 Error**: Route `/` (Home) mengembalikan 500 Internal Server Error, meskipun `/up` (Health Check) berjalan. Kemungkinan masalah pada view atau middleware.
- [ ] **Websocket (Reverb) Failure**: Koneksi ke `ws://localhost:8080` gagal. Perlu dicek status service Reverb dan konfigurasi port.
- [ ] **Data Mock Selesai**: Database sudah berhasil di-seed dengan 13,000+ data kehadiran (mock), namun dashboard masih memiliki beberapa data hardcoded yang mengabaikan data asli ini.

## 🚀 Masalah Kritis & Bug Utama (Critical)
- [ ] **Data "Bohong" di Dashboard**: `DashboardSiswa.jsx` menggunakan `Math.random()` untuk grafik tren bulanan. UI terlihat bagus tapi datanya tidak valid.
- [ ] **Fallbacks Demo**: Dashboard Waka, Guru, dan Wali Kelas menampilkan data hardcoded di blok `catch`. Jika API mati, sistem menampilkan data palsu alih-alih pesan error.
- [ ] **Missing Document Logic (DataSiswa)**: Tombol "Lihat Surat" dan "Download" di preview modal admin siswa masih belum berfungsi (Missing function).
- [ ] **Export Reports**: Tombol Export Excel/PDF di Riwayat Kehadiran (Web) belum memiliki handler (`onClick`).
- [ ] **Deskta Session Issues**: Perbedaan penamaan role ("Peserta Didik" di Backend vs "Siswa" di Deskta) menyebabkan validasi session sering gagal/mental.

## 🛠️ Kesenjangan Fitur (Feature Gaps)
- [ ] **Import Siswa (Deskta)**: Tombol "Impor" di Admin Siswa masih berupa popup placeholder, belum terhubung ke API.
- [ ] **Pengajuan Izin Siswa**: Saat ini pengajuan izin/sakit di Backend masih terbatas dilakukan oleh Pengurus Kelas, siswa biasa belum bisa mengajukan sendiri.
- [ ] **Guru Pengganti**: Masih berupa komponen `ComingSoon` di Dashboard Staff.
- [ ] **Real-time Presensi**: Library `echo` sudah diimport tapi belum diimplementasikan untuk update daftar hadir secara real-time (masih fetch manual).

## 🎨 Hutang Teknis & UI/UX (Technical Debt)
- [ ] **Krisis Kontras Waka**: Halaman Waka memiliki file CSS kosong (0 byte), menyebabkan teks sulit dibaca di atas background gelap (perlu glassmorphism).
- [ ] **Inkonsistensi Logout**: Web menggunakan `window.location`, Deskta menggunakan `navigate`. Key storage juga tidak seragam (`userData` vs `user`).
- [ ] **Hardcoded API URL**: Deskta masih menunjuk ke `localhost:8000` secara hardcoded di beberapa file, bukan lewat `.env`.
- [ ] **Mapping Status Duplikat**: Logika warna/label status tersebar di banyak file. Perlu disatukan di `statusMapping.js`.
- [ ] **Mapping Hari**: `ScheduleController` belum mendukung hari Sabtu/Minggu (Sabtu sering ada ekskul/jadwal tambahan).

## ✅ Sudah Diperbaiki (Recently Fixed)
- [x] **Database Seeded**: 13,950 records berhasil diinput untuk testing.
- [x] **LandingPage CSS Fix**: Memperbaiki sintaks `<style jsx>` yang menyebabkan error di browser.
- [x] **Migrations Up-to-date**: Semua migrasi sudah dijalankan hingga versi terbaru.

---
*Terakhir diupdate: 10 Februari 2026*
