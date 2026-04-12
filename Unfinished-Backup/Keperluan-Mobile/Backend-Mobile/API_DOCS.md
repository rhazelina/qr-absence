# Backend API Reference

Detailed documentation for the QR Absence API.

## 📌 Table of Contents
1. [Authentication](#-authentication)
2. [Schedules & Master Data](#-schedules--master-data)
3. [Dashboards](#-dashboards)
4. [QR Code Lifecycle](#-qr-code-lifecycle)
5. [Attendance Tracking](#-attendance-tracking)
6. [Absence Requests](#-absence-requests)
7. [Teacher Operations](#-teacher-operations)
8. [Real-time (WebSockets)](#-websockets-real-time)
9. [System Health](#-system-health)

---

## 🔑 Authentication
**Base URL**: `http://localhost:8000/api`  
**Header**: `Authorization: Bearer {token}`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/login` | `POST` | Login with `login` (username/email) and `password`. |
| `/auth/logout` | `POST` | Revoke current access token. |
| `/me` | `GET` | Get profile of the currently authenticated user. |

---

## 📅 Schedules & Master Data

### Timetables
- `GET /schedules`: Paginated list of schedules. Teachers see only their own.
- `GET /classes/{id}/schedules`: View all schedules for a specific class.
- `GET /me/schedules`: Shortcut for current user's relevant schedules.

### Master Classes
- `GET /classes`: List of all classes (supports `per_page=-1` for dropdowns).
- `GET /classes/{id}`: Detailed class info including homeroom teacher.

### Bulk Operations (Waka Only)
- `POST /classes/{id}/schedules/bulk`: Replace an entire day's schedule for a class.

---

## 📊 Dashboards

| Endpoint | Role | Description |
| :--- | :--- | :--- |
| `/me/dashboard/summary` | Student | Today's schedule and check-in status. |
| `/me/dashboard/teacher-summary` | Teacher | Teaching slots and class attendance counts. |
| `/me/homeroom/dashboard` | Wakel | Detailed stats for your specific homeroom class. |
| `/waka/dashboard/summary` | Waka | Global statistics, attendance trends, and school-wide alerts. |
| `/me/class` | Pengurus | Classroom-specific tools and active session status. |

---

## 🔐 QR Code Lifecycle

- `POST /qrcodes/generate`: Create a new QR session for a schedule.  
  Payload: `{ "schedule_id": 1, "type": "student", "duration": 30 }`
- `POST /qrcodes/{token}/revoke`: Instantly deactivate an active QR.
- `GET /qrcodes/active`: List currently active QR codes for the user's role.

---

## 📝 Attendance Tracking

### QR Scan
- `POST /attendance/scan`: Process a QR token.  
  Payload: `{ "token": "uuid", "device_id": 1 }`

### Manual Overrides
- `POST /attendance/manual`: Create or update an attendance record manually (Admin/Teacher).  
  Payload: `{ "student_id": 1, "status": "present", "date": "YYYY-MM-DD" }`
- `PATCH /attendance/{id}`: Update status with a reason (e.g., mark as "Izin").

---

## 🤒 Absence Requests (Dispensasi)

- `POST /absence-requests`: Submit a new request (Sick/Permit/Dispensation).
- `GET /absence-requests`: List all requests (Waka only).
- `POST /absence-requests/{id}/approve`: Approve a pending request with a signature.
- `POST /absence-requests/{id}/reject`: Deny a request.

---

## 👨‍🏫 Teacher Operations

- `POST /api/teachers/unable-to-teach`: Report an absence for the teacher themselves.  
  Payload: `{ "reason": "...", "type": "sick", "start_date": "...", "end_date": "..." }`
- `GET /me/students/follow-up`: List students with concerning attendance patterns (Alpha > 1).

---

## 📡 WebSockets (Real-time)
Broadcasting via **Laravel Reverb**.

- **Private Channel**: `schedules.{scheduleId}`
- **Event**: `.attendance.recorded`
- **Payload Example**:
  ```json
  {
    "attendee_type": "student",
    "name": "John Doe",
    "status": "present",
    "student_id": 15
  }
  ```

---

## 🩺 System Health

- `php artisan app:check`: Run a comprehensive health check on Database, Cache, Queue, and WhatsApp Gateway.
- `/telescope`: GUI for monitoring requests, jobs, and exceptions.
