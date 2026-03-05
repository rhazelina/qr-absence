# QR Absence Backend

This is the core API for the QR Attendance system, built with **Laravel 12**. It provides high-performance endpoints, real-time data broadcasting, and automated background processing for both Web and Desktop clients.

## ⚡ High-Performance Architecture
- **Octane Engine**: Powered by FrankenPHP for sub-millisecond response times.
- **Reverb WebSockets**: Native broadcasting for real-time dashboard synchronization.
- **Unified Multi-Client Support**: Pre-configured CORS and Sanctum stateful domains for port 5173 (Web) and 5174 (Desktop).
- **Asynchronous Jobs**: WhatsApp notifications and heavy reporting are processed in the background via database-backed Queues.

## ⚙️ Core Configuration

### Prerequisites
- **PHP 8.4** (with PCNTL & SQLite extensions)
- **Composer**
- **SQLite** (Default) or **MySQL**

### One-Step Setup
It is recommended to use the root `./setup-all.sh` script, which automatically configures the backend and syncs keys to all frontends.

Manual setup (Fallback):
```bash
composer install
php artisan migrate --seed
php artisan reverb:start
```

## 🚀 Key Modules

| Category | Description |
| :--- | :--- |
| **Auth & Security** | RBAC (Admin, Teacher, Student, Waka) via Sanctum. |
| **Attendance** | Token-based QR scanning with proximity/timeout validation. |
| **Schedules** | Automated day-of-week schedule mapping with subject support. |
| **Integrations** | Native service for **Whatekster** WhatsApp Gateway. |
| **Diagnostics** | Full observability with **Laravel Telescope**. |

## 🧪 Testing & Quality
Run the comprehensive Pest test suite:
```bash
./test.sh
```
Check system status:
```bash
php artisan app:check
```

*Developed for extreme reliability in educational environments.*
