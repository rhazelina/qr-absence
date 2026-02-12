# Changes

## [2026-02-08] UI Overhaul & Multi-Platform Update
- **Minimalist Modern UI**: Overhauled the entire frontend (Web & Desktop) with a new design system using Tailwind CSS 4.
- **Desktop Version (`deskta`)**: Integrated a new React + TypeScript desktop client running on port 5174.
- **Unified Services**: Synchronized API services between Web and Desktop, resolving named export and HMR issues.
- **Authentication Alignment**: Updated Sanctum and CORS configurations to support simultaneous Web and Desktop sessions.
- **Automation Scripts**: Updated `./setup-all.sh` and `./run-dev.sh` (plus Windows equivalents) to include the Desktop version and ensure clean port management.
- **Bug Fixes**: 
    - Resolved `exportButtonRef` ReferenceErrors in Admin pages.
    - Fixed `FaChalkboardTeacher` import issues.
    - Corrected data mapping for attendance statistics (e.g., `pulang` to `terlambat` alignment).
    - Enabled Waka users to view detailed class attendance by date.

## Unreleased
- Added majors (jurusan) master data and class linkage.
- Added absence request workflow (dispensation/sick/permit) with Waka approval and signature.
- Added class-officer role flag for students and QR validation rules.
- Added bulk schedule management per day with subject_name support and broadcasts.
- Added Scalar API docs at `/docs` and OpenAPI JSON.
- Added web login for schedules and role-restricted web view.
- Added activity logging middleware and controller logs.
- Expanded OpenAPI spec coverage and added auth sample payloads.