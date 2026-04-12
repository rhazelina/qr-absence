# Teacher Dashboard & Leave Permission API Documentation

## Overview

This document describes the new API endpoints added for the teacher dashboard system with enhanced attendance management, including student leave permissions (izin pulang, dispensasi, sakit, izin).

## Database Changes

### New Migration

Run migration to create the `student_leave_permissions` table:

```bash
php artisan migrate
```

**Table: `student_leave_permissions`**
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| student_id | foreignId | Student profile ID |
| class_id | foreignId | Class ID |
| granted_by | foreignId | User ID of teacher who granted |
| schedule_id | foreignId (nullable) | Schedule when permission was granted |
| type | enum | 'izin_pulang', 'dispensasi', 'sakit', 'izin' |
| date | date | Date of permission |
| start_time | time | When permission starts |
| end_time | time (nullable) | When student should return (null = until end of school) |
| reason | text (nullable) | Reason for leave |
| attachment_path | string (nullable) | Supporting document path |
| status | enum | 'active', 'returned', 'expired', 'cancelled' |
| returned_at | timestamp (nullable) | When student actually returned |
| returned_by | foreignId (nullable) | Teacher who marked return |
| is_full_day | boolean | If true, affects ALL subjects for the day |

---

## API Endpoints

### 1. Teacher Dashboard (Enhanced)

**GET** `/api/me/dashboard/teacher-summary`

Returns today's teaching schedule with per-subject attendance statistics.

**Response:**
```json
{
  "date": "2026-02-11",
  "day_name": "Rabu",
  "teacher": {
    "name": "Ahmad Subekti",
    "nip": "123456789",
    "code": "123456789",
    "photo_url": null,
    "is_homeroom": true,
    "homeroom_class": "XII RPL 1"
  },
  "school_hours": {
    "start_time": "07:00",
    "end_time": "15:00"
  },
  "attendance_summary": {
    "present": 45,
    "sick": 2,
    "excused": 3,
    "izin": 3,
    "absent": 1,
    "late": 2,
    "on_leave": 2
  },
  "schedule_today": [
    {
      "id": 1,
      "class_id": 5,
      "subject": "Pemrograman Web",
      "class_name": "XII RPL 1",
      "time_slot": "Jam Ke 1",
      "start_time": "07:00",
      "end_time": "08:30",
      "room": "Lab 1",
      "statistics": {
        "present": 28,
        "late": 2,
        "sick": 1,
        "izin": 1,
        "absent": 0
      },
      "students_on_leave": 2,
      "total_students": 32
    }
  ]
}
```

---

### 2. Schedule Detail (From Dashboard "Tampilkan" Button)

**GET** `/api/me/schedules/{schedule}/detail`

Get detailed schedule information with student attendance and leave status.

**Response:**
```json
{
  "schedule": {
    "id": 1,
    "subject_name": "Pemrograman Web",
    "title": "Jam Ke 1",
    "day": "Wednesday",
    "start_time": "07:00",
    "end_time": "08:30",
    "room": "Lab 1"
  },
  "class": {
    "id": 5,
    "name": "XII RPL 1"
  },
  "date": "2026-02-11",
  "statistics": {
    "present": 28,
    "late": 2,
    "sick": 1,
    "izin": 1,
    "absent": 0,
    "on_leave": 2,
    "total_students": 32
  },
  "students": [
    {
      "id": 1,
      "name": "John Doe",
      "nis": "12345",
      "nisn": "1234567890",
      "attendance": {
        "id": 100,
        "status": "present",
        "status_label": "Hadir",
        "checked_in_at": "07:05",
        "reason": null
      }
    }
  ],
  "hidden_students": [
    {
      "id": 2,
      "name": "Jane Doe",
      "nis": "12346",
      "hide_reason": "Sakit (Hari Penuh)",
      "leave_permission": {
        "id": 5,
        "type": "sakit",
        "start_time": "07:00",
        "end_time": null,
        "reason": "Demam tinggi"
      }
    }
  ]
}
```

---

### 3. Get Students for Attendance

**GET** `/api/me/schedules/{schedule}/students`

Get list of students eligible for attendance (excludes students on leave).

**Response:**
```json
{
  "schedule_id": 1,
  "date": "2026-02-11",
  "eligible_students": [
    {
      "id": 1,
      "name": "John Doe",
      "nis": "12345",
      "nisn": "1234567890"
    }
  ],
  "on_leave_students": [
    {
      "id": 2,
      "name": "Jane Doe",
      "nis": "12346",
      "leave_type": "izin_pulang",
      "return_time": "10:00"
    }
  ],
  "total_eligible": 30,
  "total_on_leave": 2
}
```

---

### 4. Create Full Day Leave (Sakit/Izin)

**POST** `/api/me/schedules/{schedule}/students/{student}/leave`

Mark a student as sick or on permission for the FULL DAY. This automatically creates attendance records with sick/izin status for ALL schedules today.

**Request Body:**
```json
{
  "type": "sakit", // or "izin"
  "reason": "Demam tinggi",
  "attachment": "(file upload - optional)"
}
```

**Response:**
```json
{
  "message": "Student marked as sick for full day",
  "leave_permission": {
    "id": 5,
    "student_id": 2,
    "type": "sakit",
    "is_full_day": true,
    "date": "2026-02-11",
    "start_time": "07:00",
    "end_time": null,
    "reason": "Demam tinggi",
    "status": "active",
    "student": { ... },
    "granter": { ... }
  }
}
```

---

### 5. Create Temporary Leave (Izin Pulang/Dispensasi)

**POST** `/api/me/schedules/{schedule}/students/{student}/leave-early`

Grant permission for a student to leave early. Student will be hidden from attendance until return time.

**Request Body:**
```json
{
  "type": "izin_pulang", // or "dispensasi"
  "end_time": "10:00", // optional - null means until end of school
  "reason": "Keperluan keluarga"
}
```

**Behavior:**
- If `end_time` is null: Student is marked as `izin` for ALL remaining subjects today
- If `end_time` is set: Student is hidden from attendance only during the leave period, and should return before the specified time

**Response:**
```json
{
  "message": "Leave permission granted",
  "leave_permission": { ... },
  "info": "Student should return by 10:00"
}
```

---

### 6. Mark Student as Returned

**POST** `/api/me/leave-permissions/{leavePermission}/return`

Mark a student as returned from temporary leave.

**Response:**
```json
{
  "message": "Student marked as returned",
  "leave_permission": {
    ...
    "status": "returned",
    "returned_at": "09:45",
    "returner": { ... }
  }
}
```

---

### 7. Mark Student as Absent (Alpha)

**POST** `/api/me/leave-permissions/{leavePermission}/mark-absent`

If a student doesn't return on time, mark them as absent for missed schedules.

**Response:**
```json
{
  "message": "Student marked as absent for missed schedules",
  "leave_permission": {
    ...
    "status": "expired"
  }
}
```

---

### 8. Get Class Leave Permissions

**GET** `/api/classes/{class}/leave-permissions`

Get all leave permissions for a class today.

**Response:**
```json
{
  "class_id": 5,
  "class_name": "XII RPL 1",
  "date": "2026-02-11",
  "permissions": [
    {
      "id": 5,
      "student": {
        "id": 2,
        "name": "Jane Doe",
        "nis": "12346"
      },
      "type": "sakit",
      "type_label": "Sakit",
      "start_time": "07:00",
      "end_time": null,
      "reason": "Demam tinggi",
      "status": "active",
      "is_full_day": true,
      "granted_by": "Ahmad Subekti",
      "granted_at": "07:15",
      "returned_at": null
    }
  ]
}
```

---

### 9. Get Students On Leave

**GET** `/api/classes/{class}/students-on-leave`

Get list of students currently on leave for a class.

**Response:**
```json
{
  "class": {
    "id": 5,
    "name": "XII RPL 1"
  },
  "date": "2026-02-11",
  "students_on_leave": [
    {
      "id": 5,
      "student": {
        "id": 2,
        "name": "Jane Doe",
        "nis": "12346"
      },
      "type": "izin_pulang",
      "type_label": "Izin Pulang",
      "start_time": "08:30",
      "end_time": "10:00",
      "is_full_day": false,
      "is_currently_active": true,
      "reason": "Keperluan keluarga",
      "granted_by": "Ahmad Subekti"
    }
  ],
  "total": 1
}
```

---

### 10. Leave Permission CRUD

**GET** `/api/leave-permissions`

List all leave permissions with filters.

**Query Parameters:**
- `class_id` - Filter by class
- `student_id` - Filter by student
- `date` - Filter by date (default: today)
- `status` - Filter by status: 'active', 'returned', 'expired', 'cancelled'
- `type` - Filter by type: 'izin_pulang', 'dispensasi', 'sakit', 'izin'

---

**POST** `/api/leave-permissions`

Create a new leave permission.

**Request Body:**
```json
{
  "student_id": 2,
  "schedule_id": 1, // optional
  "type": "izin_pulang",
  "start_time": "08:30",
  "end_time": "10:00", // optional
  "reason": "Keperluan keluarga"
}
```

---

**PATCH** `/api/leave-permissions/{permission}`

Update a leave permission (e.g., change end time).

**Request Body:**
```json
{
  "end_time": "11:00",
  "reason": "Updated reason"
}
```

---

**POST** `/api/leave-permissions/{permission}/return`

Mark student as returned.

---

**POST** `/api/leave-permissions/{permission}/mark-absent`

Mark student as absent (didn't return on time).

---

**POST** `/api/leave-permissions/{permission}/cancel`

Cancel a leave permission.

---

**POST** `/api/leave-permissions/check-expired`

Check and expire all leave permissions that have passed their end time. Can be called by a scheduler.

---

## System Behavior

### Full Day Leave (Sakit/Izin)

When a student is marked as sick or on permission (full day):

1. A `StudentLeavePermission` record is created with `is_full_day = true`
2. Attendance records are automatically created for ALL today's schedules with the appropriate status
3. The student is hidden from all attendance lists for the day
4. The student cannot scan QR codes for attendance

### Temporary Leave (Izin Pulang/Dispensasi)

When a student is granted permission to leave early:

1. A `StudentLeavePermission` record is created with `is_full_day = false`
2. If no `end_time` is set, attendance records are created for all remaining schedules
3. The student is hidden from attendance lists during the leave period
4. The student cannot scan QR codes during the leave period
5. When the student returns (marked by teacher), they become visible again
6. If the student doesn't return by `end_time`, they can be marked as absent (alpha)

### Attendance Close

When a teacher closes attendance for a schedule:

1. Students with valid leave permissions are automatically marked with appropriate status (sick/izin)
2. Students without leave who haven't scanned are marked as absent (alpha)
3. The response includes counts for both categories

### QR Scan

When a student tries to scan attendance QR:

1. System checks if the student has an active leave permission
2. If on leave and the schedule overlaps with leave period, the scan is rejected
3. A message is returned explaining the student's leave status

---

## Route Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me/dashboard/teacher-summary` | Enhanced teacher dashboard |
| GET | `/api/me/schedules/{schedule}/detail` | Schedule detail with attendance |
| GET | `/api/me/schedules/{schedule}/students` | Students eligible for attendance |
| POST | `/api/me/schedules/{schedule}/students/{student}/leave` | Create full-day leave |
| POST | `/api/me/schedules/{schedule}/students/{student}/leave-early` | Create temporary leave |
| POST | `/api/me/leave-permissions/{leavePermission}/return` | Mark returned |
| POST | `/api/me/leave-permissions/{leavePermission}/mark-absent` | Mark absent |
| GET | `/api/classes/{class}/leave-permissions` | Class leave permissions |
| GET | `/api/classes/{class}/students-on-leave` | Students on leave |
| GET | `/api/leave-permissions` | List leave permissions |
| POST | `/api/leave-permissions` | Create leave permission |
| GET | `/api/leave-permissions/{permission}` | Show leave permission |
| PATCH | `/api/leave-permissions/{permission}` | Update leave permission |
| POST | `/api/leave-permissions/{permission}/return` | Mark returned |
| POST | `/api/leave-permissions/{permission}/mark-absent` | Mark absent |
| POST | `/api/leave-permissions/{permission}/cancel` | Cancel permission |
| POST | `/api/leave-permissions/check-expired` | Check expired permissions |

---

## Authentication

All endpoints require authentication via Laravel Sanctum token:

```
Authorization: Bearer {token}
```

Teacher endpoints require `role:teacher` middleware.

---

## Files Changed/Added

### New Files:
- `database/migrations/2026_02_11_170800_create_student_leave_permissions_table.php`
- `app/Models/StudentLeavePermission.php`
- `app/Http/Controllers/TeacherScheduleDetailController.php`
- `app/Http/Controllers/StudentLeavePermissionController.php`

### Modified Files:
- `routes/api.php` - Added new routes
- `app/Http/Controllers/DashboardController.php` - Enhanced teacher dashboard
- `app/Http/Controllers/AttendanceController.php` - Added leave permission checks

---

## Quick Start

1. Run migration:
```bash
php artisan migrate
```

2. Clear cache:
```bash
php artisan optimize:clear
```

3. Test endpoints using provided examples above.
