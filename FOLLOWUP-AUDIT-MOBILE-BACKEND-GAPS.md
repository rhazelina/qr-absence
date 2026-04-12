# Follow-up Audit Mobile: Fitur yang Belum Punya Backend

Dokumen ini fokus pada fitur di `Code-Dari-AndroStudio` yang:

1. memang belum punya backend sama sekali, atau
2. secara praktis belum bisa jalan karena capability backend yang dibutuhkan belum tersedia.

Dokumen ini sengaja dipisah dari audit kompatibilitas umum. Di bawah ini, saya bedakan antara:

- `Gap backend murni`: route/capability backend memang belum ada.
- `Bukan gap backend murni`: backend ada, tetapi frontend masih dummy, placeholder, atau belum dirangkai.

## Ringkasan Singkat

### Gap backend murni
1. **Pengiriman WhatsApp dari mobile**
2. **Notification center yang stateful** (mark as read / clear / persist)

### Bukan gap backend murni
1. **Screen riwayat Waka yang masih dummy**
2. **Fragment placeholder di Guru/Wali Kelas**
3. **Menu yang melempar "Halaman belum tersedia"**

---

## 1. Pengiriman WhatsApp dari mobile

### Status
`Gap backend murni`

### Bukti di Android
- Client masih mendeklarasikan:
  - `POST /wa/send-text` di [ApiService.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/api/services/ApiService.kt:992)
  - `POST /wa/send-media` di [ApiService.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/api/services/ApiService.kt:997)

### Bukti di backend
- `routes/api.php` tidak memiliki route `wa/send-text` atau `wa/send-media` sama sekali:
  [api.php](/root/full/qr-absence/backend/routes/api.php)

### Dampak
- Fitur kirim WhatsApp langsung dari aplikasi mobile belum bisa dipakai.
- Kalau nanti ada screen/action yang memanggil endpoint ini, hasilnya akan 404.

### Rekomendasi backend
Tambahkan minimal:

1. `POST /wa/send-text`
   Payload:
   - `phone`
   - `message`
   - optional `context_type`
   - optional `context_id`

2. `POST /wa/send-media`
   Payload:
   - `phone`
   - `caption`
   - `file` multipart
   - optional `context_type`
   - optional `context_id`

3. Policy role
   - admin
   - waka tertentu bila memang diizinkan

4. Audit log
   - siapa kirim
   - ke nomor mana
   - tipe pesan
   - status gateway

---

## 2. Notification Center yang stateful

### Status
`Gap backend murni`

### Bukti di backend
- Backend notifikasi mobile saat ini hanya menyediakan endpoint baca:
  - `GET /mobile/notifications`
  - `GET /me/notifications`
  di [api.php](/root/full/qr-absence/backend/routes/api.php:35) dan [api.php](/root/full/qr-absence/backend/routes/api.php:50)
- Controller menghasilkan notifikasi secara dinamis dari attendance:
  [MobileNotificationController.php](/root/full/qr-absence/backend/app/Http/Controllers/MobileNotificationController.php:17)

### Yang belum ada di backend
Tidak ada endpoint untuk:
- mark as read
- mark all as read
- delete/clear notification
- menyimpan notification inbox yang persisten
- unread count yang stabil lintas sesi

### Bukti di Android
- Model mobile notification sudah punya field `read_at`:
  [OtherModels.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/api/models/OtherModels.kt:619)

### Dampak
- Notification center saat ini hanya cocok sebagai feed baca sementara.
- Tidak bisa mendukung UX inbox penuh seperti:
  - badge unread akurat
  - sinkron status dibaca
  - arsip notifikasi
  - hapus notifikasi

### Rekomendasi backend
Jika ingin notification center penuh, tambahkan tabel + endpoint:

1. `GET /me/notifications`
   - paginated
   - source persisten

2. `POST /me/notifications/{id}/read`

3. `POST /me/notifications/read-all`

4. `DELETE /me/notifications/{id}`

5. `GET /me/notifications/unread-count`

Catatan:
- kalau memang produk hanya butuh feed dinamis harian, capability ini boleh dianggap `nice to have`, bukan blocker.

---

## 3. Screen Riwayat Waka yang masih dummy

### Status
`Bukan gap backend murni`

### Bukti
- Dashboard Waka masih mengarahkan ke screen dummy `RiwayatKehadiranGuru1`:
  [DashboardWaka.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/DashboardWaka.kt:349)
- Model dummy masih menyimpan data lokal:
  [Guru1.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/model/Guru1.kt:8)
  [Siswa1.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/model/Siswa1.kt:8)

### Kenapa ini bukan gap backend
Backend sebenarnya sudah punya data rekap/riwayat yang relevan:
- `GET /teachers/{teacher}/attendance-history`
- `GET /students/{student}/attendance`
- `GET /students/absences`
- `GET /waka/classes/{class}/attendance`

### Kesimpulan
Masalahnya ada di wiring frontend, bukan karena backend belum ada.

---

## 4. Placeholder Fragment Guru/Wali Kelas

### Status
`Bukan gap backend murni`

### Bukti
- Placeholder dipakai agar app tidak crash:
  [PlaceholderFragment.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/PlaceholderFragment.kt:9)
- Guru navigation fallback:
  [GuruNavigationActivity.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/GuruNavigationActivity.kt:45)
- Wali Kelas navigation fallback:
  [WaliKelasNavigationActivity.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/WaliKelasNavigationActivity.kt:47)

### Kenapa ini bukan gap backend
Sebagian besar data inti untuk riwayat, dashboard, attendance, dan follow-up sudah ada di backend.

### Kesimpulan
Ini gap implementasi frontend / navigasi, bukan backend.

---

## 5. Menu yang masih menampilkan "Halaman belum tersedia"

### Status
`Bukan gap backend murni`

### Bukti
Contoh lokasi:
- [DashboardWaka.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/DashboardWaka.kt:362)
- [DataRekapKehadiranGuru.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/DataRekapKehadiranGuru.kt:524)
- [DataRekapKehadiranSiswa.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/DataRekapKehadiranSiswa.kt:1055)
- [RekapKehadiranSiswa.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/RekapKehadiranSiswa.kt:330)
- [StatistikWakaa.kt](/root/full/qr-absence/Code-Dari-AndroStudio/meyzha-rendra/app/src/main/java/com/example/ritamesa/StatistikWakaa.kt:674)

### Kenapa ini bukan gap backend murni
Toast ini biasanya muncul karena:
- activity/fragment tujuan belum ada
- wiring intent belum selesai
- fallback exception di sisi UI

Backend route inti untuk data-data utamanya sebagian besar sudah ada.

---

## Prioritas Implementasi Backend

Kalau tujuannya adalah menutup semua `gap backend murni`, urutan paling masuk akal:

1. **WhatsApp outbound**
   - paling jelas route-nya belum ada sama sekali
   - mudah dipisah sebagai modul opsional

2. **Notification persistence**
   - dikerjakan hanya kalau produk memang butuh unread/read-state yang nyata

---

## Kesimpulan Final

Per hari audit ini, fitur mobile yang benar-benar **belum punya backend sama sekali** dan layak dianggap `backend gap` hanya:

1. **Pengiriman WhatsApp dari mobile**
2. **Notification center persisten / read-state**

Temuan lain yang kelihatan "belum jadi" di aplikasi saat ini lebih banyak masuk kategori:

- frontend masih dummy,
- navigasi masih placeholder,
- atau screen belum dirangkai ke endpoint yang sebenarnya sudah tersedia.
