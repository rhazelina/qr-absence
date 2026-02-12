# Project TODOs

## ✅ Completed

### UI & UX (New!)
- [x] **Minimalist Modern Design**: Rebuilt all portals with a unified, high-performance Tailwind 4 design system.
- [x] **Responsive Layouts**: Fixed navbar collisions and added mobile-optimized sidebars.
- [x] **Unified Services**: Shared API logic between Web and Desktop.

### Desktop Client
- [x] **Deskta Version**: Created React + TypeScript desktop version running on port 5174.
- [x] **Cross-Platform Auth**: Configured Sanctum stateful domains for both platforms.

### Backend Integration
- [x] **API Connectivity**: Configured `cors.php` and API routes to support Frontend requests.
- [x] **Role-Based Access**: Refined `ScheduleController` and `AttendanceController` to support Teachers and Waka properly.
- [x] **Status Normalization**: Mapped frontend statuses (`alpha`, `terlambat`) to backend enums (`absent`, `late`).
- [x] **Real-Time**: Implemented `AttendanceRecorded` event broadcasting via Reverb (PrivateChannel).
- [x] **Background Jobs**: Added Queues for WhatsApp notifications and Reports.
- [x] **Scheduler**: Added auto-close attendance (16:00) and daily reports (17:00).
- [x] **Health Check**: Created `php artisan app:check` command.

### Frontend Integration
- [x] **Env Config**: Dynamic `API_BASE_URL` and `STORAGE_BASE_URL`.
- [x] **Real-Time Updates**: dashboards now listen to Echo channels.
- [x] **Dashboard**: All Dashboards (Admin, Guru, Waka, Siswa, Wakel) fetch real data from API.

### Infrastructure
- [x] **Directory Structure**: integrated `backend`, `frontend`, `deskta`, and `whatekster`.
- [x] **Automation**: Created `setup-all.sh`, `run-dev.sh`, `test.sh` (Linux & Windows).
- [x] **WhatsApp**: Integrated Whatekster gateway with Backend Service.

## 📝 Remaining / Improvements (Future)

### Backend
- [ ] **Advanced Reporting**: Custom PDF generation for class recaps.
- [ ] **Notification Preferences**: Allow users to toggle specific notifications.
- [ ] **Audit Log**: Enhance `Telescope` or custom logging for critical actions.

### Frontend
- [ ] **PWA**: Enhance offline capabilities (Service Worker).
- [ ] **Dark Mode**: Fully implement dark mode across all pages.
- [ ] **Real-time Chart Updates**: Push chart data via WebSockets for live statistics.

### Desktop Client (`deskta`)
- [ ] **Local Storage Cache**: Persistent data for offline schedule viewing.
- [ ] **Native Integration**: Package as executable via Electron or Tauri.
