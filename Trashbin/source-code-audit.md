# Audit Source Code: Aplikasi Mobile & Backend (meyzha-rendra)

Dokumen ini memuat daftar **seluruh komponen *source code*** yang digunakan oleh aplikasi Android (Mobile) beserta pasangannya di sisi *Backend* (Server). Semua rincian di bawah ini diurutkan berdasarkan tingkat kepentingannya (**Sangat Krusial** hingga **Opsional/Pendukung**) untuk laporan/pembuatan dokumentasi sistem Anda.

---

## BAGIAN A: DAFTAR KODE BACKEND (SERVER)
Ini adalah daftar file yang berada di dalam folder `Backend-Mobile` (Laravel) yang murni diakses dan berinteraksi langsung dengan aplikasi Android.

### 1. Sangat Krusial (Inti Sistem & Logika Bisnis Utama)
Komponen ini adalah nyawa dari aplikasi. Tanpa file ini, fitur absen sama sekali tidak bisa berjalan.
*   **`routes/api.php`** \
    File yang memetakan URL yang ditembak oleh HP ke fungsi yang ada di server.
*   **`app/Http/Controllers/AttendanceController.php`** \
    Mengatur skenario utama: Guru absen manual, Siswa validasi Scan QR, penutupan jadwal, ringkasan absen kelas harian.
*   **`app/Http/Controllers/QrCodeController.php`** \
    Mengatur proses pembuatan (generate) token baris QR code yang aman, membatalkan token, dan memastikannya masih aktif.
*   **`app/Http/Controllers/AuthController.php`** \
    Pintu gerbang aplikasi: Login dengan Username/Email, pemberian token hak akses (JWT/Sanctum), dan penarikan profil khusus (`/me`).
*   **`app/Models/Attendance.php`** \
    Model struktur data rekam jejak kehadiran.
*   **`app/Models/Qrcode.php`** \
    Model struktur token kode QR dan masa kedaluwarsanya.

### 2. Penting (Fitur Fungsional & Dashboard Harian)
Komponen ini membangun fungsionalitas harian yang sering digunakan pengguna di beranda aplikasi.
*   **`app/Http/Controllers/DashboardController.php`** \
    Menarik data statistik harian untuk ditampilkan di dasbor Siswa, dasbor Guru (GuruDashboard), Walikelas, dan Waka.
*   **`app/Http/Controllers/ScheduleController.php`** \
    Menyuplai data rutinitas jadwal mengajar guru dan jadwal belajar siswa di layar "Jadwalku".
*   **`app/Http/Controllers/TeacherScheduleDetailController.php`** \
    Digunakan saat guru mengklik satu kotak sesi kelas (misal MTK kelas X-A) guna melihat daftar siswa yang mengisi kelas itu.
*   **`app/Models/Schedule.php`** \
    Model penghubung antara guru, jam belajar, ruang kelas, dan mata pelajaran.
*   **`app/Models/User.php`**, **`StudentProfile.php`**, **`TeacherProfile.php`** \
    Menyimpan hak akses (role) dan detail biodata/NISN/NIP tiap aktor.

### 3. Fungsional Tambahan (Izin, Cuti & Perangkat)
Fitur penyelesaian masalah khusus di luar kegiatan belajar mengajar normal.
*   **`app/Http/Controllers/StudentLeavePermissionController.php`** \
    Mencatat, menyetujui, dan menolak pengajuan siswa yang izin keluar masuk toilet / UKS.
*   **`app/Http/Controllers/AbsenceRequestController.php`** \
    Pengoordinasi surat cuti sakit atau berhalangan hadir satu hari penuh dengan bukti lampiran foto surat dokter/wali.
*   **`app/Http/Controllers/TeacherController.php`** \
    Banyak dipakai untuk fungsi Waka dan Walikelas dalam memantau murid bolos (`getStudentsFollowUp`).
*   **`app/Models/LeavePermission.php`** & **`AbsenceRequest.php`**

### 4. Opsional / Pendukung (Master Data & Estetika)
Sistem ini tetap wajib ada di *backend* agar tidak error, tapi biasanya tidak dibuat dari HP (dibuat dari Web Admin).
*   **Data Master Controllers:** `ClassController`, `SubjectController`, `RoomController`, `MajorController`, `TimeSlotController`, `SchoolYearController`, `SemesterController`.
*   **`app/Http/Controllers/MobileNotificationController.php`** (dan `DeviceController.php`) \
    Guna menghubungkan notifikasi pengumuman dari sekolah untuk ditarik ke dalam kotak masuk (inbox) HP siswa.
*   **`app/Http/Controllers/SettingController.php`** \
    Sinkronisasi nama sekolah, batas toleransi alpha, dan konfigurasi lainnya.

---
---

## BAGIAN B: DAFTAR KODE ANDROID (MOBILE)
Ini adalah daftar file yang berada di dalam *project* Android (`meyzha-rendra` / `mobile-fix`).

### 1. Sangat Krusial (Infrastruktur API & Menu Utama)
Pondasi jembatan penghubung antara genggaman *user* ke *server*.
*   **`api/services/ApiService.kt`** \
    Daftar fungsi Retrofit murni. Inilah alat *translator* komunikasi dari Android ke Laravel (Daftar semua URL Endpoint).
*   **`RetrofitClient.kt`** & **`AuthInterceptor.kt`** \
    Setup mesin *request* dan penyisipan rahasia token Login secara otomatis setiap HP minta data.
*   **`api/models/*` (Semua Models)** \
    Semua `Data Class` Kotlin (contohnya `AttendanceModels.kt`, `AuthModels.kt`, `ClassScheduleModels.kt`). Berguna menangkap format JSON milik Laravel.
*   **`LoginActivity.kt`** \
    Layar masuk yang menentukan level otorisasi akses navigasi.

### 2. Penting (Layar Utama / Fragments tiap Pengguna)
Ini adalah komponen raksasa (UI Utama) yang dirender di tengah-tengah HP menyesuaikan tipe yang sedang login.
*   **`MainActivity.kt`** \
    Rumah utamanya, menampung pemindahan navigasi menu bawah (*Bottom Navigation*).
*   **`StudentDashboardFragment.kt`** \
    Beranda siswa memuat presentase masuk, jadwalnya hari ini.
*   **`TeacherDashboardFragment.kt`** (dan `GuruDashboardFragment.kt`) \
    Menggabungkan jadwal ngajar Pak/Bu Guru.
*   **`WaliKelasDashboardFragment.kt`** \
    Menampilkan info kenakalan anak asuh spesifik satu kelas.
*   **`WakaDashboardFragment.kt`** \
    Laporan persentase seluruh guru dan kelas 1 sekolah di ujung jari pimpinan.

### 3. Fungsional Pemindaian & Presensi (Inti Mobile)
Pemusatan aktivitas presensinya di HP terjadi di file-file ini:
*   **`ScannerSiswaActivity.kt`** (atau sejenisnya) \
    Menyalakan kamera, menembak barkode dari depan layar kelas, memproses String Token ke API `/attendance/scan-student`.
*   **`QRGeneratorGuruActivity.kt`** (atau sejenisnya) \
    Bagi guru untuk menampilkan kotak pola matriks QR ke Monitor Kelas.
*   **`DetailJadwalGuruActivity.kt`** \
    Sisi di mana Pak Guru mencentang-centang Alpa, Sakit, Bolos secara massal-manual jika layar QR bermasalah. Termasuk daftar tunggu siswa kelasnya.
*   **`AbsensiManualActivity.kt`**

### 4. Opsional / Sekunder (Riwayat Laporan & Settings)
Fitur bacaan dan rekapan akhir yang dinavigasi dari sub-menu.
*   **`RiwayatAbsensiFragment.kt`** \
    Kotak memori jejak hari demi hari (baik versi siswa yang dicek, maupun versi hari mengajar guru).
*   **`IzinSiswaActivity.kt`** \
    Formulir UI untuk upload gambar surat sakit, alasan mengetik "Kenapa pulang awal".
*   **`KotakNotifikasiActivity.kt`**
*   **`SettingsFragment.kt`** / **`ProfileActivity.kt`**
*   **`JadwalAdapter.kt`**, **`SimpleSiswaAdapter.kt`** \
    Daftar *CardView* pembantu pencetak grafis baris yang di-loop di dalam RecyclerView layout.

---

### Langkah Selanjutnya:
Daftar inventaris di atas sudah menyortir yang mana "Sistem Pusat" dan yang mana "Layar Antarmukanya". Laporan tidak perlu merujuk kode API yang mendetail untuk kelas pendukung (nomor 4).

Silakan pertimbangkan format pembedahan ini. Laporan/Dokumentasi **BAB Implementasi** biasanya akan memadupadankan **1 Fitur Krusial dengan 1 Activity dan 1 Controller**:
Sebagai contoh: _"Implementasi Scan QRCode → (Android) `ScannerSiswaActivity.kt` memanggil `ApiService.kt` → Mengarah ke (Backend) `AttendanceController.php` (fungsi `scan`) dan tabel `qrcodes`."_

Pilihlah skema mana yang ingin kita "bedah" / "breakdown" terlebih dahulu untuk bahan tulisan Anda!
