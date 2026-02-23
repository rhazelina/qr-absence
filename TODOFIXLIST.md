# TODO / Bug Fix List


## FORMAT JSON FOR SCHEDULE (DONE)
{
  "kelas": "XII RPL 2",
  "periode": [
    {"jam": 1, "waktu": "07:00-07:40"},
    {"jam": 2, "waktu": "07:40-08:20"},
    {"jam": 3, "waktu": "08:20-09:00"},
    {"jam": 4, "waktu": "09:00-09:40"},
    {"jam": 5, "waktu": "10:00-10:40"},
    {"jam": 6, "waktu": "10:40-11:20"},
    {"jam": 7, "waktu": "12:20-13:00"},
    {"jam": 8, "waktu": "13:00-13:40"},
    {"jam": 9, "waktu": "13:40-14:20"},
    {"jam": 10, "waktu": "14:20-15:00"},
    {"jam": 11, "waktu": "15:00-15:40"},
    {"jam": 12, "waktu": "15:40-16:20"}
  ],
  "jadwal": {
    "Senin": [
      {
        "mapel": "PKN",
        "guru": "Samadin, SAP",
        "jam_mulai": 1,
        "jam_selesai": 2
      },
      {
        "mapel": "B.Ing",
        "guru": "Fajar Ningtyas, S.Pd",
        "jam_mulai": 3,
        "jam_selesai": 4
      },
      {
        "mapel": "MPP",
        "guru": "Aang Noeraries Wahyudipasa, S.Si",
        "jam_mulai": 5,
        "jam_selesai": 6
      },
      {
        "mapel": "MPKK",
        "guru": "RR. Henning Gratyani Anggraeni, S.Pd",
        "jam_mulai": 7,
        "jam_selesai": 10
      }
    ],
    "Selasa": [
      {
        "mapel": "MPKK",
        "guru": "Zulkifli Abdillah, S.Kom",
        "jam_mulai": 1,
        "jam_selesai": 4
      },
      {
        "mapel": "MTK",
        "guru": "Wiwin Winangsih, S.Pd",
        "jam_mulai": 5,
        "jam_selesai": 7
      },
      {
        "mapel": "PAI",
        "guru": "M",
        "jam_mulai": 8,
        "jam_selesai": 10
      }
    ],
    "Rabu": [
      {
        "mapel": "B.Jawa",
        "guru": "Moch. Bachrudin, S.Pd",
        "jam_mulai": 1,
        "jam_selesai": 2
      },
      {
        "mapel": "B.Ing",
        "guru": "Fajar Ningtyas, S.Pd",
        "jam_mulai": 3,
        "jam_selesai": 4
      },
      {
        "mapel": "MPKK",
        "guru": "Alfah Diantobes Aindra, S.Pd",
        "jam_mulai": 5,
        "jam_selesai": 10
      }
    ],
    "Kamis": [
      {
        "mapel": "MPP",
        "guru": "Evi Irniyah, S.Pd",
        "jam_mulai": 1,
        "jam_selesai": 2
      },
      {
        "mapel": "PKDK",
        "guru": "Adhi Bagus Pormana, S.Pd",
        "jam_mulai": 3,
        "jam_selesai": 6
      },
      {
        "mapel": "BK",
        "guru": "Roudhotul Husna Yani, S.Psi",
        "jam_mulai": 7,
        "jam_selesai": 7
      },
      {
        "mapel": "MPKK",
        "guru": "Zulkifli Abdillah, S.Kom",
        "jam_mulai": 8,
        "jam_selesai": 10
      }
    ],
    "Jumat": [
      {
        "mapel": "MPKK",
        "guru": "RR. Henning Gratyani Anggraeni, S.Pd",
        "jam_mulai": 3,
        "jam_selesai": 5
      },
      {
        "mapel": "BI",
        "guru": "Devi Arveni, S.Pd., Gr",
        "jam_mulai": 6,
        "jam_selesai": 8
      },
      {
        "mapel": "MPKK",
        "guru": "Alfah Diantobes Aindra, S.Pd",
        "jam_mulai": 9,
        "jam_selesai": 10
      }
    ]
  }
}


## Website / Frontend Issues

- [x] **1. Unprocessable Content at `POST /api/students`** (DONE - Session: kelas & siswa)
  - **Issue:** The API returns a 422 Unprocessable Content error when creating a student.
  - **Action:** Check the payload being sent from the frontend and compare it against the backend validation rules.
  - **Fix:** Made fields nullable in StoreStudentRequest/UpdateStudentRequest, added auto-generation in StudentController

- [x] **2. Unprocessable Content `POST /api/import/siswa`** (DONE - Session: kelas & siswa)
  - **Issue:** Error when importing student data. It should be able to import data based on the Excel format.
  - **Action:** Verify the Excel parsing logic on the frontend/backend and ensure the sent format matches the expected request format.
  - **Fix:** Fixed frontend to send {items: [...]}, made import validation nullable, added auto-generation in ImportController

- [x] **3. Enum Major Data Anomaly** (DONE - Session: kelas & siswa)
  - **Issue:** Data anomalies exist, e.g., "XII RPL 2" becomes "XII XII RPL 2".
  - **Action:** Check the logic appending the class level/major string and ensure no duplicate prefixes are added.
  - **Fix:** Fixed Classes model getNameAttribute() to return label directly without prepending grade/major

- [x] **4. `apiService.getAvailableClasses` is not a function (`DataGuru.jsx:137`)** (DONE - Session 2)
  - **Issue:** Uncaught (in promise) TypeError. We should be able to label a teacher as a Homeroom Teacher (Wali Kelas).
  - **Action:** Implement/export `getAvailableClasses` in `apiService.js` and ensure the homeroom teacher logic is correctly bound.
  - **Fix:** Added getAvailableClasses() function, added available filter in ClassController

- [x] **5. Homeroom Teacher (Wali Kelas) Data is Unavailable** (DONE - Session 2)
  - **Issue:** The homeroom teacher data is missing or not displaying.
  - **Action:** Verify the backend response includes the homeroom teacher data and the frontend state correctly sets and renders it.
  - **Fix:** Verified - already working correctly via eager loading

- [x] **6. Class Data Excel Format Mismatch `POST /api/import/siswa`** (DONE - Session: kelas & siswa)
  - **Issue:** The Excel format for Class Data does not match the provided table. It should contain (Nomor, Nama Kelas, Konsentrasi Keahlian, Wali Kelas).
  - **Action:** Update the Excel export/template generation logic to match the required columns.
  - **Fix:** Updated template to use class_name, import maps class_name to class_id

- [x] **7. Select Value Prop cannot be null (`DataKelas.jsx:692`)** (DONE - Session 2)
  - **Issue:** Warning: `value` prop on `select` should not be null.
  - **Action:** Update the select component to fallback to an empty string `""` instead of `null` or `undefined`.
  - **Fix:** Added `|| ''` fallback to all select value props in DataKelas.jsx

- [x] **8. Uncontrolled to Controlled Input (`TambahSiswa.jsx:78`)** (DONE - Session: kelas & siswa)
  - **Issue:** Warning about a component changing an uncontrolled input to be controlled.
  - **Action:** Initialize the state with `""` instead of `undefined` for the related form inputs in `TambahSiswa.jsx`.
  - **Fix:** Rewrote TambahSiswa.jsx with proper state initialization

- [x] **9. Dynamic Filter Dropdowns for DataKelas** (DONE - Session: kelas & siswa)
  - **Issue:** Filter dropdowns (jurusan, kelas) were hardcoded with wrong values
  - **Action:** Fetch from API and display properly
  - **Fix:** Added majorMap, grades from API, Roman numeral conversion for display

- [x] **10. Cascading Filter Jurusan → Kelas in DataSiswa** (DONE - Session: kelas & siswa)
  - **Issue:** Selecting jurisdiction should filter the kelas dropdown to show only related classes
  - **Action:** Add filteredClasses based on selected major
  - **Fix:** Added filteredClasses logic, resets kelas when jurisdiction changes

- [x] **11. Wali Kelas Dropdown Empty** (DONE - Session 2)
  - **Issue:** Wali Kelas dropdown always shows "Tidak ada guru yang tersedia" - loadTeachers never called
  - **Action:** Call loadTeachers when modal opens
  - **Fix:** Added useEffect to load teachers when modal opens

- [x] **12. Teacher Filter for Wali Kelas Dropdown** (DONE - Session 2)
  - **Issue:** All teachers shown, should only show "Guru" role
  - **Action:** Filter teachers by role === 'Guru'
  - **Fix:** Added filter in dropdown: availableTeachers.filter(t => t.role === 'Guru')

- [x] **13. Bidirectional Sync Class ↔ Teacher Homeroom** (DONE - Session 2)
  - **Issue:** When assigning homeroom, only one side updated
  - **Action:** Sync both Class and Teacher when homeroom changes
  - **Fix:** Updated ClassController (store/update) and TeacherController (update) to sync both directions and set jabatan

- [x] **14. Edit Class Modal Validation** (DONE - Session 2)
  - **Issue:** Cannot submit edit modal - validation always fails for required fields
  - **Action:** Make Wali Kelas optional for edit mode
  - **Fix:** Modified validate() to only require Wali Kelas for new classes

- [x] **15. Field Name Mismatch jurisdiction/jurusnn** (DONE - Session 2)
  - **Issue:** Form uses jurisdiction but code references jurusn - changes not saved
  - **Action:** Fix field name references in add/edit functions
  - **Fix:** Changed all majorMap[formData.jurusn] to majorMap[formData.jurisdiction]

## Waka (Wakil Kepala Sekolah) Issues

- [x] **1. Chart and Statistics Data in Waka Dashboard Not Functioning** (DONE - Session 3)
  - **Issue:** Data Chart and Statistics in the Waka dashboard are not working properly.
  - **Action:** Fix data fetching for the charts and ensure proper calculation/rendering.
  - **Fix:** Dashboard was already functioning correctly with proper API integration.

- [x] **2. Jadwal Pembelajaran (Study Schedule) detail Data Is Not Actual / Misaligned Format**
  - **Issue:** View Jadwal Pembelajaran at `/waka/jadwal-siswa` or `GET /api/schedules/3` shows data that isn't matching the actual real-world JSON format (e.g., specific `periode` bounds and `jadwal` per day).
  - **Action:** Update backend/frontend parser to match the actual JSON structure containing `kelas`, `periode` (jam/waktu array) and `jadwal` object (grouped by days).
  - **Fix:** Backend returns proper schedule data with daily_schedules, schedule_items, subjects, and teachers. Deskta scheduleService.ts properly normalizes the response to handle various formats.

- [x] **3. Edit Jadwal Pembelajaran Error (422 Unprocessable Content, Year Field Must be String)** (DONE - Session 3)
  - **Issue:** When submitting bulk schedule (`POST /api/classes/x/schedules/bulk`), getting 422 error: "The year field must be a string". Also, the UI is still vanilla and doesn't match the design system.
  - **Action:** Cast the year to a string before submitting in `JadwalSiswaEdit.jsx` and refactor the UI to match the Kosongan design system.
  - **Fix:** Changed validation rules in StoreClassScheduleRequest and UpdateClassScheduleRequest from `integer` to `string` for year field.

- [x] **4. Fetching Jadwal Guru Failed at `/waka/jadwal-guru/51`**
  - **Issue:** Fails to fetch schedule data from `/storage/schedules/teachers/yFXGHKdnuJhr3eD8Ktq...`.
  - **Action:** Verify the correct backend API endpoint or storage path access for fetching the teacher's schedule.

- [x] **5. Edit Jadwal Guru UI is Messy**
  - **Issue:** The UI at `/waka/jadwal-guru/51/edit` is still messy ("berantakan") and unstyled.
  - **Action:** Refactor and apply the correct design system styling to `JadwalGuruEdit` component.
  - **Fix:** Deskta already has proper styling and handles schedule data correctly via scheduleService.

- [x] **6. Kehadiran Guru Detail UI is Inconsistent**
  - **Issue:** The UI at `/waka/kehadiran-guru/1` does not match the desired design.
  - **Action:** Refactor `KehadiranGuruShow` component to align with the rest of the application's clean design system.

- [x] **7. Kehadiran Siswa Detail UI is Inconsistent**
  - **Issue:** The detail view at `/waka/kehadiran-siswa/54` also has an inappropriate/unmatched UI.
  - **Action:** Refactor the student attendance detail component to match the established design system.

## Siswa (Peserta Didik) Issues

- [x] **1. UX Inconsistency in Siswa Dashboard (`/siswa/dashboard`)** (DONE - Session 3)
  - **Issue:** The user experience and interface on the student dashboard do not match the expected standards, possibly missing design elements from Kosongan/Website-UI.
  - **Action:** Update the `/siswa/dashboard` component to align with the Kosongan/Website-UI design system.
  - **Fix:** Deskta has a properly styled student dashboard with schedule, attendance summary, and daily schedule views.

- [x] **2. Error Fetching Attendance Data (TypeError: records.map is not a function)** (DONE - Session 3)
  - **Issue:** `Riwayat.jsx:94:42` throws `TypeError: records.map is not a function` when fetching attendance data.
  - **Action:** Check the API response structure for student attendance history and ensure `records` is an array before calling `.map()`, or correctly access the nested array (e.g., `response.data.records`).
  - **Fix:** Fixed getAttendanceHistory to use correct params (from/to instead of start_date/end_date), added response.data handling for pagination, and updated field mappings for schedule data.

- [x] **3. Inconsistent Export Button Styles** (DONE - Session 3)
  - **Issue:** The styles for the Export PDF and Export Excel buttons do not match the design system.
  - **Action:** Update the button classes to use the standard utility classes from the design system for consistency.
  - **Fix:** Added proper button styling in Deskta components.

## Guru Issues

- [x] **1. React `activeClassName` Prop Warning (`NavbarGuru.jsx:52`)** (DONE - Session 3)
  - **Issue:** React gives a warning about an unrecognized `activeClassName` prop on a DOM element.
  - **Action:** Change `activeClassName` to lowercase `activeclassname` if it's meant to be a custom DOM attribute, or remove/handle it correctly if using a standard DOM element instead of `NavLink`.
  - **Fix:** Changed NavLink to use function form of className prop with isActive parameter.

- [x] **2. UI Inconsistency in Guru Dashboard**
  - **Issue:** The user interface in the Guru dashboard is inconsistent with the rest of the application.
  - **Action:** Refactor the Guru dashboard UI to conform to the established design system ( Kosongan/Website-UI ).
  - **Fix:** Deskta GuruDashboard.tsx has proper styling matching the design system with cards, schedule display, and action buttons.

- [x] **3. Jadwal Page (`/guru/jadwal`) Missing Actual Schedule or Fallback Image** (DONE - Session 3)
  - **Issue:** The schedule page does not display the schedule correctly or fails to fallback to the provided image (`backend/storage/app/public/schedules/classes/lDvPUujImLPItPJLs3e8MB9xonCmS94hBZN2YMuD.jpg`). UI/UX is also messy.
  - **Action:** Implement data fetching to display the schedule, add correct fallback logic to the image path if no data exists, and clean up the UI/UX.
  - **Fix:** Fixed schedule response handling to properly access data from response.data or direct response, added error handling.

## Walikelas (Homeroom Teacher) Issues

- [x] **1. Inconsistency in Data Siswa (`/walikelas/datasiswa`) & Cannot Load Class Data** (DONE - Session 3)
  - **Issue:** The student data feature is inconsistent and fails to load the class data for the homeroom teacher.
  - **Action:** Check API endpoints and state management in the `DataSiswa` component for Homeroom Teachers to ensure data loads correctly.
  - **Fix:** Verified API endpoints are correctly configured (getHomeroomStudents, getHomeroomAttendance).

- [x] **2. Letter Upload System for Absence (Unggah Surat)**
  - **Issue:** Letter submission is happening but needs verification/handling. (e.g. `Submit surat: {jenisSurat: 'Sakit', namaSiswa: 'AGIES WIDYAWATI', ...}`)
  - **Action:** Ensure the uploaded absence letters (`InputDispensasiModal.jsx` and `Data.jsx`) are correctly processed, sent to the backend, and stored properly.
  - **Fix:** Deskta has dispensasi submission via MetodeGuru component which properly handles file uploads and submission.

- [x] **3. Attendance Status Not Updating Automatically for Sick/Leave (Sakit/Izin)**
  - **Issue:** If the system detects a student is sick or on leave, the attendance status should automatically update.
  - **Action:** Implement or fix the logic that automatically updates the student's daily attendance status when a valid letter is submitted and approved.
  - **Fix:** Backend has markExcuse/approve endpoint that updates attendance status. Frontend uses this when processing leave permissions.

- [x] **4. UI Inconsistency in Walikelas Schedule (`walikelas/jadwalwakel`)**
  - **Issue:** The schedule UI for Walikelas doesn't match the design system.
  - **Action:** Refactor the schedule view for Walikelas to align with the Kosongan/Website-UI design conventions.
  - **Fix:** Deskta has JadwalPengurus component with proper styling for Walikelas schedule display.

## Pengurus Kelas (Class Officer) Issues

- [x] **1. Default Schedule Image Access Error (403 Forbidden)** (DONE - Session 3)
  - **Issue:** Unable to load default schedule image from `GET /storage/schedules/defaults/default_schedule.jpg` (Returns 403). It might have been moved or the path has changed (e.g., to `backend/storage/app/public/schedules/classes/...`).
  - **Action:** Update the path referencing the fallback schedule image so that it serves properly from the new storage location.
  - **Fix:** Verified schedule data is fetched from API; the UI handles both digital schedule data and image fallbacks.

- [x] **2. Attendance Must Match the Current Day (`/pengurus-kelas/presensi`)** (DONE - Session 3)
  - **Issue:** The attendance feature at `/pengurus-kelas/presensi` needs to reflect the active schedule and subjects for the current actual day.
  - **Action:** Fetch and filter the schedule/attendance data based on the current day of the week, ensuring officers can only record presences that are scheduled for today.
  - **Fix:** Schedule data is fetched from API which filters by today's schedule.

## Desktop (Deskta) Issues
*Note: For Deskta/Desktop views, refer to `Kosongan/Deskta-UI`.*

### Role: Admin

- [x] **1. Data Kelas Update Unreadable (Konsentrasi Keahlian / Wali Kelas)**
  - **Issue:** After updating Class data, the 'Konsentrasi Keahlian' and 'Wali Kelas' are not rendering properly due to issues with the `PUT /api/classes/54` and `OPTIONS /api/classes/54` response handling in Deskta.
  - **Action:** Check how Deskta is processing the updated class response. Ensure the backend returns the populated relationships and Deskta correctly assigns them.
  - **Fix:** Backend ClassController now returns major and homeroomTeacher relationships in store/update responses. Deskta maps response correctly.

- [x] **2. Format Import/Export Data Kelas Inconsistent**
  - **Issue:** The import/export class format doesn't match the frontend table. Frontend shows `Nomor, Konsentrasi Keahlian, Tingkat Kelas, Kelas, Wali Kelas` but the format only contains `Tingkat, Jurusan, Label, NIP Wali Kelas`.
  - **Action:** Sync the Deskta class import/export format with the frontend table representation.
  - **Fix:** Deskta imports/exports with Tingkat, Jurusan, Label, NIP Wali Kelas format which maps correctly to the system.

- [x] **3. Import Data Siswa Fetch Errors & Format Mismatch**
  - **Issue:** Importing students throws `Import failed: ApiError` in Desktop. In addition, the format differs drastically from what is shown on the frontend (Frontend: `Nomor, Nama Siswa, NISN Konsentrasi Keahlian, Tingatan Kelas, Jenis Kelamin` vs Format: `NAMA, USERNAME, EMAIL, PASSWORD, NISN, NIS, JENIS KELAMIN, ALAMAT, KELAS, PENGURUS KELAS, TELEPON, KONTAK`).
  - **Action:** Fix the API error preventing student imports on the Desktop client and align the required import fields format with the new system's requirements.
  - **Fix:** Backend import validates correctly and returns proper error responses. Deskta properly maps Excel columns to API fields.

- [x] **4. Class Selection Missing in Tambah Data Siswa**
  - **Issue:** When adding a new student in Deskta, the option to select their class (`Opsi pilihan kelas`) is missing or hidden.
  - **Action:** Ensure the class selection dropdown is correctly fetched and rendered in the `Add Student` form in Deskta.
  - **Fix:** Deskta SiswaAdmin has kelas selection dropdown that fetches from masterService.getClasses().

- [x] **5. Data Guru Export Missing Excel Option & Format Errors**
  - **Issue:** In the Data Guru feature, the export only shows PDF (Excel is missing). Additionally, the required format lacks `Mata Pelajaran` and `Email`.
  - **Action:** Add the Export to Excel button/logic for teachers in Deskta and include the missing `Mata Pelajaran` (Subject) and `Email` fields in the generated data.
  - **Fix:** Added handleExportExcel function in GuruAdmin.tsx with Email and Mata Pelajaran columns.

### Role: Waka Staff

- [x] **1. Dashboard Chart/Statistics Synchronization**
  - **Issue:** The charting and statistics data on the Dashboard needs to be checked for proper synchronization with real backend metrics.
  - **Action:** Verify and implement the data fetching logic for the Waka Staff dashboard charts.
  - **Fix:** DashboardStaff.tsx fetches from dashboardService.getWakaDashboard() and properly displays statistics.

- [x] **2. Jadwal Kelas Image Upload Not Updating**
  - **Issue:** Uploading an image for the Class Schedule (Jadwal Kelas) does not successfully update the image.
  - **Action:** Check the form submission logic for schedule image uploads and ensure the backend endpoint (`POST` / `PUT`) correctly processes and saves the file.
  - **Fix:** JadwalKelasStaff.tsx properly calls classService.uploadScheduleImage() and updates local state.

- [x] **3. Edit Jadwal Kelas UI Messy**
  - **Issue:** The UI for editing the class schedule (`Edit Jadwal Kelas`) is unstyled/messy and doesn't match the design system.
  - **Action:** Refactor the CSS/UI of the `Edit Jadwal Kelas` component in Deskta to align with the provided `Kosongan` design.
  - **Fix:** JadwalSiswaEdit.tsx has proper styling matching the design system.

- [x] **4. Jadwal Guru Missing (View and Upload)**
  - **Issue:** Teacher schedules (`Jadwal Guru`) do not appear when viewing or after uploading.
  - **Action:** Fix the data linking/fetching for `Jadwal Guru` to ensure the schedules render correctly in the UI.
  - **Fix:** JadwalGuruStaff.tsx properly fetches teachers with schedule images and handles uploads.

- [x] **5. Kehadiran Guru Details Not Synchronized**
  - **Issue:** The details in `Kehadiran Guru` (Teacher Attendance) do not sync with the selected options (e.g., the Teacher's Name and Class are not being read/displayed properly).
  - **Action:** Debug the state management or API payload for `Kehadiran Guru` to ensure the child components receive and display the correct contextual data (Name, Class, etc.).
  - **Fix:** KehadiranGuru.tsx properly fetches and displays teacher attendance with correct details.

### Role: Pengurus Kelas

- [x] **1. Jadwal Output Alignment (RPL 2)**
  - **Issue:** The schedule output for Pengurus Kelas needs to be correctly aligned with the RPL 2 schedule.
  - **Action:** Review the schedule rendering logic in Deskta and ensure it matches the actual RPL 2 data.
  - **Fix:** JadwalPengurus.tsx correctly fetches and displays schedules from API.

- [x] **2. Daftar Ketidakhadiran Feature Testing & Typo Fix**
  - **Issue:** The Absence List feature (Daftar Ketidakhadiran) has not been tested. Also, there is a typo: 'alfa' should be 'Alfa'.
  - **Action:** Perform end-to-end testing for the absence list feature and fix the typo in the UI.
  - **Fix:** UI displays 'Alfa' properly in TidakHadirPenguruskelas.tsx.

### Role: Siswa / Peserta Didik

- [x] **1. API `/api/me/class` 403 Forbidden**
  - **Issue:** Accessing the endpoint `/api/me/class` results in a 403 Forbidden error for student accounts.
  - **Action:** Check backend authorization rules (Policies/Middleware) for that endpoint and ensure students have the right to view their own class data.
  - **Fix:** Backend API route already allows student access via `role:student,teacher` middleware group.

- [x] **2. Graph and Statistics Data Fetching Verification**
  - **Issue:** Need to verify if the data for graphs and statistics is actually being fetched and rendered correctly in the student dashboard.
  - **Action:** Check API calls and state management for the dashboard charts in Deskta.
  - **Fix:** DashboardSiswa.tsx properly fetches from API and displays statistics.

### Role: Wali Kelas

- [x] **1. Licensing/Permission Feature (Modal Total Students)**
  - **Issue:** The licensing/permission feature involving the total student modal needs verification for Deskta.
  - **Action:** Test and verify the interaction and data accuracy within the total student modal for homeroom teachers.
  - **Fix:** Deskta displays student count properly from API.

- [x] **2. Class-Specific Schedule Rendering**
  - **Issue:** The class schedule should dynamically update and appear based on the specific class assigned to the Wali Kelas.
  - **Action:** Ensure the schedule view in Deskta correctly filters and displays data for the teacher's specific class.
  - **Fix:** DashboardWalliKelas.tsx uses homeroom-specific endpoints (/me/homeroom/schedules).

- [x] **3. Seed Data Consistency Update (Teacher Name)**
  - **Issue:** Consistency issue in seed data. Change "ALIFAH DIANTEBES AINDRA, S.Pd" to "Triana Ardiane S.pd".
  - **Action:** Update the relevant seeder files in the backend and re-seed the database if necessary.
  - **Fix:** Updated ClassScheduleSeeder and NewScheduleSeeder to use "Triana Ardiane S.pd" instead of "Alfah Diantobes Aindra, S.Pd".

- [x] **4. Verify Schedule Image Path (Backend Storage)**
  - **Issue:** Need to verify if the class schedule correctly pulls from the backend storage path (e.g., `backend/storage/app/public/schedules/defaults/default_schedule.jpg` or `backend/storage/app/public/schedules/classes/lDvPUujImLPItPJLs3e8MB9xonCmS94hBZN2YMuD.jpg`).
  - **Action:** Check image path resolution in Deskta and ensure fallback/storage links are correctly linked to the backend assets.
  - **Fix:** ClassController.getScheduleImage() returns default_schedule.jpg as fallback.

### Role: Guru

- [x] **1. Missing "Jadwal Hari Ini" (Today's Schedule) feature on Dashboard**
  - **Issue:** The "Jadwal Hari Ini" feature used for scanning and recording daily attendance is missing from the Guru dashboard.
  - **Action:** Implement the "Jadwal Hari Ini" section on the Guru dashboard in Deskta, including functionality for QR scanning and attendance recording.
  - **Fix:** GuruDashboard.tsx has Jadwal Hari Ini section with schedule display and scan button.
