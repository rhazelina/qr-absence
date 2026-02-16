# Frontend Login Credentials

## 🔐 Test Accounts

Semua password: **password123**

### Admin
- Username: `admin`
- Email: admin@example.com

### Waka (Wakil Kepala Sekolah)
- Username: `waka1`
- Email: waka@example.com

### Guru
- Username: `guru1`
- Email: guru1@example.com
- NIP: NIP-0001

### Wali Kelas
- Username: `walikelas1`
- Email: walikelas1@example.com
- NIP: NIP-WALI-001
- Kelas: XII TKJ 1

### Siswa (Peserta Didik)
- Username: `siswa1` | Email: siswa1@example.com | NIS: 2024001 | **NISN: 0024001** ⭐
- Username: `siswa2` | Email: siswa2@example.com | NIS: 2024002 | **NISN: 0024002** ⭐
- Username: `siswa3` | Email: siswa3@example.com | NIS: 2024003 | **NISN: 0024003** ⭐

**Note:** Siswa bisa login dengan 3 cara:
1. **NISN saja** (tanpa password) ⭐ *Cara termudah*
2. **NIS + Password** (2024001 + password123)
3. **Username + Password** (siswa1 + password123)

### Pengurus Kelas
- Username: `pengurus1`
- Email: pengurus1@example.com
- NIS: 2024999
- **NISN: 0024999** ⭐

**Note:** Pengurus kelas bisa login dengan 3 cara:
1. **NISN saja** (tanpa password) ⭐ *Cara termudah*
2. **NIS + Password** (2024999 + password123)
3. **Username + Password** (pengurus1 + password123)

---

## 🚀 Setup & Testing

### 1. Install Dependencies
```bash
cd frontend
npm install
# atau
bun install
```

### 2. Start Development Server
```bash
npm run dev
# atau
bun run dev
```

### 3. Backend API
Pastikan backend Laravel running di:
```
http://127.0.0.1:8001
```

### 4. Test Login
1. Buka aplikasi (biasanya http://localhost:5173)
2. Pilih role (admin/guru/siswa/dll)
3. Login dengan credentials di atas
4. Verify data muncul dari API

---

## ✅ Yang Sudah Diupdate

1. ✅ Created API service layer (`src/services/api.js`, `src/services/auth.js`)
2. ✅ Created constants (`src/utils/constants.js`)
3. ✅ Updated LoginPage.jsx to use real API
4. ✅ Created .env file with API URL
5. ✅ Removed dummy data validation

---

## 📝 Notes

- Login sekarang menggunakan **real backend API**
- Token disimpan di localStorage
- Auto-logout jika token invalid (401)
- Error handling sudah diimplementasi

**Last Updated:** 2026-02-10

---

## 🔐 Login NISN Tanpa Password - AKTIF

✅ **Fitur login dengan NISN saja (tanpa password) sudah aktif kembali!**

Cara pakai:
1. Pilih role "Siswa" atau "Pengurus Kelas"
2. Masukkan NISN di field login
3. Biarkan field password kosong
4. Klik Login

**Keamanan:**
- Hanya siswa yang bisa login tanpa password
- Guru, Admin, dan Waka WAJIB menggunakan password
- Semua login tetap tercatat dan diaudit
