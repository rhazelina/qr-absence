# Audit Behavior Per-Role (Web)

Dokumen ini untuk uji perilaku aplikasi web per-role setelah integrasi backend.

## Scope
- Frontend: `web-fe`
- API: Laravel `/api/*`
- Role: `admin`, `waka`, `wakel`, `guru`, `pengurus_kelas`, `siswa`

## Global Test (Semua Role)
1. Login success
- Step: buka `/login/:role`, isi kredensial valid.
- Expected: token + user tersimpan, redirect ke dashboard role.
- API: `POST /auth/login`.

2. Login role mismatch
- Step: login akun role A lewat halaman role B.
- Expected: muncul error mismatch role.
- API: `POST /auth/login`.

3. Unauthorized token
- Step: hapus/ubah token lalu refresh page halaman protected.
- Expected: request gagal `401`, auth dibersihkan, user keluar dari sesi.

4. Forbidden behavior
- Step: pakai user tanpa hak akses endpoint tertentu.
- Expected: tampil pesan backend `403` (bukan silent fail).

5. Validation behavior
- Step: kirim input tidak valid.
- Expected: pesan validasi pertama backend `422` tampil jelas di UI.

## Admin
1. Dashboard
- API: `GET /admin/summary`
- Expected: statistik tampil, no crash.

2. CRUD Jurusan
- API: `GET/POST/PUT/DELETE /majors`
- Validasi: nama/kode wajib, kode unik (422).

3. CRUD Kelas
- API: `GET /classes`, `POST/PUT/DELETE /classes/{id}`
- Validasi: `grade` hanya 10/11/12, `homeroom_teacher_id` valid.

4. CRUD Guru
- API: `GET /teachers`, `POST/PUT/DELETE /teachers/{id}`
- Validasi: NIP/kode unik (422), enum jabatan tervalidasi.

5. CRUD Siswa
- API: `GET /students`, `POST/PUT/DELETE /students/{id}`
- Validasi: NISN/NIS unik, gender enum valid.

6. Profil Sekolah
- API: `GET /settings`, `POST /settings`
- Validasi: file gambar dan ukuran.

## Waka
1. Dashboard
- API: `GET /waka/dashboard/summary`
- Expected: statistik, daily_stats, trend tampil.

2. Jadwal Guru
- API: `GET /teachers`, `GET /teachers/{id}`,
  `POST /teachers/{id}/schedule-image`, `DELETE /teachers/{id}/schedule-image`

3. Jadwal Siswa
- API: `GET /classes`, `GET /classes/{id}`,
  `POST /classes/{id}/schedule-image`, `DELETE /classes/{id}/schedule-image`

4. Kehadiran Guru
- API: `GET /waka/attendance/teachers/daily`, `GET /teachers/{id}/attendance-history`

5. Kehadiran Siswa Index
- API: `GET /classes`
- Expected: filter jurusan/tingkatan berjalan.

6. Kehadiran Siswa Detail
- API: `GET /waka/classes/{class}/attendance?date=...`, `PATCH /attendance/{attendance}`
- Expected: edit status tersimpan dan tervalidasi.

7. Rekap Kehadiran Siswa
- API: `GET /waka/classes/{class}/attendance-summary?from=...&to=...`
- Expected: data per siswa + totals tampil.

## Wali Kelas (`wakel`)
1. Dashboard Wakel
- API: `GET /me/homeroom/dashboard`
- Expected: kelas asuh, summary, jadwal hari ini.

2. Data Siswa Kelas Asuh
- API: `GET /me/homeroom/students`, `GET /me/homeroom/attendance`

3. Jadwal Wakel
- API: `GET /me`, `GET /me/homeroom`, `GET /me/homeroom/schedules`, `GET /classes/{id}/schedule-image`

4. Presensi Wakel
- API: `GET /me/schedules/{id}/students`, `GET /attendance/schedules/{id}?date=...`,
  `POST /attendance/manual`
- Validasi: semua siswa harus dipilih status sebelum simpan (frontend).

5. Riwayat Kehadiran
- API: `GET /me/homeroom/attendance?from=...&to=...`
- Validasi: range tanggal valid.

## Guru
1. Dashboard
- API: `GET /me/teacher/dashboard`

2. Jadwal
- API: `GET /me/schedules`

3. Presensi Siswa
- API: `GET /me/schedules/{id}/students`, `POST /attendance/manual`, `POST /me/schedules/{id}/close`
- Validasi: status wajib dipilih, reason sesuai kebutuhan status.

## Pengurus Kelas
1. Dashboard
- API: `GET /me/class/dashboard` (wajib class-officer), `GET /me/class/schedules`
- Expected: akun non-pengurus mendapat `403`.

2. Riwayat Kelas
- API: `GET /me/class/students`, `GET /me/class/attendance?from=...&to=...`

3. Presensi (QR)
- API: `GET /me/class/schedules`, `POST /me/class/qr-token`
- Validasi backend: hari/jam aktif, class officer only.

## Siswa
1. Dashboard
- API: `GET /me/dashboard/summary`, `GET /me/attendance/summary`

2. Riwayat
- API: `GET /me/attendance?from=...&to=...`, `GET /me/attendance/summary?from=...&to=...`
- Validasi: filter tanggal bekerja, data milik sendiri saja.

## Prioritas Retest Setelah Patch Terbaru
1. Redirect login admin
- Expect: admin masuk ke `/admin/dashboard`.

2. Pesan 422 tampil spesifik
- Coba submit data invalid di Admin CRUD.

3. Simpan Presensi Wakel
- Expect: tidak gagal karena aturan `bulk-manual` desktop; tiap siswa tersimpan lewat `attendance/manual`.

## Catatan
- Warning build `bg.png` dibiarkan sesuai keputusan desain.
- Warning chunk size besar tidak memblokir fungsi, hanya optimasi performa.
