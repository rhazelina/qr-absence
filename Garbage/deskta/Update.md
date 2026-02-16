# Update - 2026-02-08 [Ecosystem Integration]

## Changes
- **Backend Alignment**: Menyesuaikan service API (`attendance.ts`) agar sinkron dengan backend terbaru, termasuk penambahan fungsi `getStudentClassDashboard`.
- **Port Conflict Resolution**: Mengatur port default ke **5174** di `vite.config.ts` untuk mencegah bentrok dengan versi web (5173).
- **Setup Automation**: Menambahkan `setup.sh` dan `setup.ps1` yang terintegrasi dengan skrip otomasi root project.
- **Environment Sync**: Sinkronisasi kunci Laravel Reverb secara otomatis dari backend melalui skrip setup global.
- **Minimalist modern UI Refinement**: Memastikan gaya visual tetap konsisten dengan versi web namun dioptimalkan untuk performa desktop.

# Update - 2026-02-05

## Changes
- Menambahkan sistem popup custom (alert/confirm/prompt) tanpa library dan memasangnya secara global lewat `PopupProvider`.
- Mengganti semua `window.alert` dan `window.confirm` di halaman Admin, Guru, Siswa, Wali Kelas, dan Waka Staff menjadi popup custom (`usePopup`).
- Menyesuaikan handler terkait menjadi `async` agar bisa `await` popup.
- Mengupdate catatan backup agar tidak lagi memakai `alert` bawaan.

## Notes
- Popup custom dibangun di `src/component/Shared/Popup/PopupProvider.tsx` dan memakai `Modal` yang sudah ada.