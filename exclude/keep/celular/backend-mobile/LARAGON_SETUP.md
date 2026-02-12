# Setup Guide for Laragon (Windows)

This document provides step-by-step instructions for setting up the **QR Absence Ecosystem** (Backend, Web, Desktop, and WhatsApp Gateway) on a Windows environment using **Laragon**.

## 📋 Prerequisites
- [Laragon](https://laragon.org/download/) installed (Full edition recommended).
- **PHP 8.4** recommended (Minimum 8.2).
- **Node.js v20+** installed.
- **Composer** installed.
- **Bun** (Optional, for faster frontend setup).

---

## 🛠 1. Automated Setup (Recommended)

The easiest way to set up everything on Windows is using our PowerShell automation script.

1.  Open **Laragon Terminal** (Cmder) or **PowerShell**.
2.  Navigate to your project root (e.g., `C:\laragon\www\qr-absence`).
3.  Run the master setup script:
    ```powershell
    .\setup-all.ps1
    ```
    *This script will:*
    - Install Composer dependencies in `backend`.
    - Install Node dependencies in `frontend`, `deskta`, and `whatekster`.
    - Generate APP_KEY and sync Reverb keys across all platforms.
    - Create the SQLite database automatically.

---

## ⚙️ 2. Manual Configuration (Optional)

If you prefer to configure manually or want to use **MySQL** instead of SQLite:

### 2.1 Backend (`/backend`)
1.  Copy `.env.example` to `.env`.
2.  Choose your database mode:
    - **LOKAL (SQLite):** Set `DB_CONNECTION=sqlite`.
    - **LARAGON (MySQL):** 
      ```env
      DB_CONNECTION=mysql
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_DATABASE=qr_absence
      DB_USERNAME=root
      DB_PASSWORD=
      ```
3.  Run migrations: `php artisan migrate --seed`

### 2.2 Frontend Apps
- **Web App (`/frontend`)**: Set `VITE_API_URL=http://localhost:8000/api` in `.env`. (Port 5173)
- **Desktop Client (`/deskta`)**: Set `VITE_API_URL=http://localhost:8000` in `.env`. (Port 5174)

---

## 🚀 3. Running the Ecosystem

To start all services simultaneously (Backend, Web, Desktop, Reverb, and WhatsApp Gateway):

```powershell
.\run-dev.ps1
```

### 🌐 Access URLs:
- **Web Portal (Student/Staff):** `http://localhost:5173`
- **Desktop Client (Classroom):** `http://localhost:5174`
- **Backend API / Scalar Docs:** `http://localhost:8000/docs`
- **Telescope (Monitoring):** `http://localhost:8000/telescope`

---

## 📱 4. WhatsApp Integration
When you run `.\run-dev.ps1`, the **Whatekster** service will start. 
1.  Check the terminal for a generated QR Code.
2.  Open WhatsApp on your phone -> **Linked Devices** -> **Link a Device**.
3.  Scan the terminal QR code to enable automated notifications.

---

## 🔍 5. Troubleshooting

- **CORS / Authentication Errors:**
  Ensure `backend/config/sanctum.php` includes `localhost:5173` and `localhost:5174` in the stateful domains list. The `setup-all.ps1` script handles this by default.

- **Storage Images Not Appearing:**
  Run `php artisan storage:link` in the `backend` directory. If images still don't load, ensure Laragon's Virtual Host is serving the `public` directory correctly.

- **Port Conflict:**
  If ports 8000, 5173, or 5174 are taken, the `run-dev.ps1` script will attempt to kill existing processes. If it fails, close other dev servers manually.

---
*Minimalist Modern UI successfully integrated. Optimized for performance on Laragon.*