ERROR LOG :

WAKA [DESKTA] :
attendanceService.ts:99  GET http://localhost:8000/api/waka/attendance/teachers/daily?date=2026-02-17 404 (Not Found)
KehadiranGuru.tsx:134 Error fetching data: Error: The route api/waka/attendance/teachers/daily could not be found.
    at handleResponse (api.ts:16:11)
    at async Promise.all (index 1)
    at async fetchData (KehadiranGuru.tsx:73:50)

PENGURUS KELAS [DESKTA] ! :
classService.ts:18 
 GET http://localhost:8000/api/me/class 500 (Internal Server Error)d)
DashboardSiswa.tsx:184 Error fetching dashboard data: Error: No active schedule found
    at handleResponse (api.ts:16:11)
    at async fetchData (DashboardSiswa.tsx:133:34)

scheduleService.ts:24  GET http://localhost:8000/api/me/schedules 404 (Not Found)
DaftarMapel.tsx:37 Failed to fetch data: Error: Call to undefined method App\Models\Classes::getGradeRomanAttribute()
    at handleResponse (classService.ts:11:15)
    at async Promise.all (index 0)
    at async fetchData (DaftarMapel.tsx:30:28)

classService.ts:18  GET http://localhost:8000/api/me/class 500 (Internal Server Error)
JadwalPengurus.tsx:44 Failed to fetch class info Error: Call to undefined method App\Models\Classes::getGradeRomanAttribute()
    at handleResponse (classService.ts:11:15)
    at async fetchClassInfo (JadwalPengurus.tsx:31:34)

SISWA [DESKTA] :
scheduleService.ts:24  GET http://localhost:8000/api/me/schedules 404 (Not Found)
DashboardSiswa.tsx:184 Error fetching dashboard data: Error: No active schedule found
    at handleResponse (api.ts:16:11)
    at async fetchData (DashboardSiswa.tsx:133:34)


GURU [DESKTA] :
- BELOM TESTING (DEMONYA BELOM ADA)

WALI KELAS [DESKTA] SISTEMNYA KEBALIK NGGA NGEBACA ROLE INI ! : 
- BELOM TESTING 

=================== WEBSITE

REVISI :
ADMIN [
 TAMPILAN UNTUK TABELNYA PAS DENGAN KANAN KIRINYA
 TAMBAHIN PAGINATION BUAT DATA SISWA, DATA GURU, DATA KELAS
]

WAKA [
RAPIHIN LAYOUT TAMBAH JADWAL
TAMPILAN KEHADIRAN SISWA INI KURANG PAS DENGAN YANG VERSI KOSONGANNYA, DAN JUGA LOGO MATA NYA YANG KECIL BANGET 

]

ERROR LOG :

WAKA :
JadwalGuruShow.jsx:34 
 GET http://localhost:8000/api/teachers/11 500 (Internal Server Error)

JadwalGuruShow.jsx:46 Gagal memuat data jadwal guru

GET http://localhost:8000/api/waka/classes/4/attendance?date=2026-02-17 500 (Internal Server Error)

http://localhost:8000/api/waka/classes/4/attendance?date=2026-02-17 500 (Internal Server Error)

KehadiranSiswaShow.jsx:102 Error fetching class attendance: Error: Call to undefined method App\Models\Classes::getGradeRomanAttribute()
    at Object.request (api.js:28:13)
    at async Promise.all (index 0)
    at async fetchData (KehadiranSiswaShow.jsx:66:41)
﻿
SISWA :
react-dom_client.js?v=cfe62a7b:20103 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
:8000/api/me/dashboard/summary:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
:8000/api/me/dashboard/summary:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)

GURU :
DashboardGuru.jsx:18 
 GET http://localhost:8000/api/me/teacher/dashboard 500 (Internal Server Error)

DashboardGuru.jsx:49 Error fetching dashboard: Error: Class "App\Models\Schedule" not found
    at Object.request (api.js:28:13)
    at async fetchDashboard (DashboardGuru.jsx:29:22)


WALI KELAS :

 GET http://localhost:8000/api/me/homeroom/schedules 404 (Not Found)
DashboardWakel.jsx:97 Failed to fetch dashboard data Error: Homeroom not found
    at Object.request (api.js:28:13)
    at async fetchData (DashboardWakel.jsx:47:27)


PENGURUS KELAS :

GET http://localhost:8000/api/me/class/dashboard 403 (Forbidden) api.js:14 

DashboardKelas.jsx:624 Error fetching data: Error: Forbidden for non class officer
    at Object.request (api.js:28:13)
    at async fetchData (DashboardKelas.jsx:582:31)

RiwayatKelas.jsx:45 Error fetching students: TypeError: apiService.getMyClassStudents is not a function
    at fetchStudents (RiwayatKelas.jsx:38:43)
    at RiwayatKelas.jsx:49:5

RiwayatKelas.jsx:102 Error fetching attendance data: TypeError: apiService.getMyClassAttendanceHistory is not a function
    at fetchAttendanceData (RiwayatKelas.jsx:69:42)
    at RiwayatKelas.jsx:109:5

PresensiKelas.jsx:74 Error fetching schedule: Error: Forbidden for non class officer
    at Object.request (api.js:28:13)
    at async fetchSchedule (PresensiKelas.jsx:47:34)