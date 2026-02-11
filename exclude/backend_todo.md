# 🧩 Backend TODO List — Revisi Absensi Project

Dokumen ini berisi daftar endpoint dan penjelasan logic backend yang wajib diselesaikan berdasarkan hasil revisi sistem absensi.

---

## ✅ Termasuk Jobdesk Backend

### 2. Cegah Data Duplikat (Role Admin)
**Endpoint:** `POST /api/admin/data`  
**Deskripsi:** Mencegah penambahan data yang sama.  
**Logic:**
- Cek data existing berdasarkan field unik (mis. NIP/NIS/id_kelas).
- Jika sudah ada → return `409 Conflict`.
- Jika belum ada → lanjutkan insert.

---

### 4. Ekspor Data Kehadiran (Role Waka)
**Endpoint:** `GET /api/waka/kehadiran/export?start=YYYY-MM-DD&end=YYYY-MM-DD`  
**Deskripsi:** Mengunduh laporan kehadiran dalam rentang tanggal.  
**Logic:**
- Validasi role `waka`.
- Filter data berdasarkan tanggal.
- Keluarkan file `.xlsx` / `.csv`.

---

### 15. Status “Tidak Ada Jam Mengajar”
**Endpoint:** `GET /api/guru/jadwal`  
**Deskripsi:** Jika guru tidak memiliki jadwal hari ini, ubah status ke `"tidak ada jm mengajar"`.  
**Logic:**  
- Jika query jadwal kosong → ubah response status.

---

### 16. Filter Kehadiran Guru (Tanpa Jam)
**Endpoint:** `GET /api/waka/kehadiran?start=YYYY-MM-DD&end=YYYY-MM-DD`  
**Deskripsi:** Filter hanya berdasarkan tanggal, hapus filter jam.  
**Logic:**  
- Gunakan query rentang tanggal saja (`BETWEEN start AND end`).

---

### 17. Batasi Periode Pengurus Kelas
**Endpoint:** `GET /api/pengurus/periode`  
**Deskripsi:** Tidak boleh memilih tanggal sebelum hari ini.  
**Logic:**  
- Validasi `tanggal >= current_date`, jika tidak → `403 Forbidden`.

---

### 18. Setelah Scan Guru (Detail Presensi)
**Endpoint:** `POST /api/presensi/scan`  
**Deskripsi:** Setelah QR discan, ubah status presensi dan tampilkan detail mapel, jam, kelas, serta kehadiran siswa.  
**Logic:**  
- Validasi QR → Update status → Return detail presensi.

---

### 19. Nonaktifkan QR Setelah Waktu Berlalu
**Endpoint:** `GET /api/presensi/qr/:id`  
**Deskripsi:** QR tidak dapat muncul setelah jam selesai.  
**Logic:**  
- Jika `current_time > jam_selesai`, return `410 Gone`.

---

### 20. Validasi File Upload (Hanya JPG/PNG)
**Endpoint:** `POST /api/jadwal/upload`  
**Deskripsi:** Hanya izinkan unggahan gambar.  
**Logic:**  
- Validasi MIME type (`image/jpeg`, `image/png`).
- Return `415 Unsupported Media Type` jika tidak valid.

---

### 21. Cegah Status Ganda
**Endpoint:** `POST /api/presensi/status`  
**Deskripsi:** Tidak boleh ada dua status dalam satu hari.  
**Logic:**  
- Cek `id_siswa + tanggal` sudah punya status → jika iya, tolak.

---

### 22. Update Status Dispensasi (Mobile)
**Endpoint:** `PATCH /api/siswa/status/:id`  
**Deskripsi:** Update status siswa ke `dispensasi`.  
**Logic:**  
- Validasi role.
- Update status pada database.

---

### 23. Tambahkan Sakit & Izin di Absensi (Mobile)
**Endpoint:** `POST /api/siswa/absensi`  
**Deskripsi:** Tambah opsi status `sakit` dan `izin`.  
**Logic:**  
- Tambahkan enum baru.
- Validasi input agar hanya: hadir, sakit, izin, alfa, dispensasi.

---

### 24. Urutkan Berdasarkan Absen Terbanyak
**Endpoint:** `GET /api/absensi/statistik`  
**Deskripsi:** Urutkan siswa berdasarkan jumlah absen terbanyak.  
**Logic:**  
- Query dengan `ORDER BY total_absen DESC`.

---

### 25. Sinkronisasi Kelas di Tiap Halaman
**Endpoint:** `GET /api/kelas/sync`  
**Deskripsi:** Pastikan semua halaman mengambil kelas aktif yang sama.  
**Logic:**  
- Return `kelas_aktif` dari tabel global/setting.

---

### 26. Validasi Tanggal Izin/Dispen/Sakit/Ijin
**Endpoint:** `POST /api/perizinan`  
**Deskripsi:** Pastikan tanggal izin = tanggal hari ini.  
**Logic:**  
- Validasi `tanggal == current_date`.
- Jika beda → `400 Bad Request`.

---

## ⚙️ Campuran (Frontend + Backend)

### 1. Rekap Walikelas dengan Total
**Endpoint:** `GET /api/walikelas/rekap?kelas=...&bulan=...`  
**Deskripsi:** Hitung total hadir/sakit/izin/alfa per kelas.  
**Logic:**  
- Gunakan aggregation query (`SUM`).
- Return total ke FE.

---

### 14. Validasi Guru Sesuai Job
**Endpoint:** `POST /api/guru/jadwal`  
**Deskripsi:** Pastikan guru hanya mengajar mata pelajaran sesuai kompetensinya.  
**Logic:**  
- Validasi `id_guru` dan `mata_pelajaran` di tabel relasi guru-mapel.
- Jika tidak cocok → `400 Bad Request`.

---

## ⚙️ Catatan Tambahan

- Gunakan **middleware RBAC** (admin, waka, guru, wali_kelas, siswa).  
- Semua endpoint `POST`, `PATCH`, `PUT` wajib divalidasi schema input-nya.  
- Gunakan response JSON standar:
```json
{ "status": "success", "message": "..." }
```
- Dokumentasikan semua endpoint di Postman / Swagger.

---

**Author:** Aris  
**Project:** Sistem Absensi (Website, Desktop, Mobile)  
**Last Updated:** 2026-02-11
