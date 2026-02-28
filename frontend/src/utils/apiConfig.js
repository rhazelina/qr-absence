// central list of API endpoints used across the frontend
// keeping paths here makes it easy to update when backend routes change.

const API_ENDPOINTS = {
  // authentication
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/me',

  // public/settings
  publicSettings: '/settings/public',
  settings: '/settings',

  // master data
  semesters: '/semesters',
  teachers: '/teachers',
  students: '/students',
  classes: '/classes',
  majors: '/majors',
  subjects: '/subjects',

  // imports
  importStudents: '/import/siswa',
  importTeachers: '/import/guru',
  importClasses: '/import/kelas',
  importSchedules: '/import/jadwal',

  // attendance helpers
  attendance: '/attendance', // used with dynamic segments
  attendanceTeachersDaily: '/waka/attendance/teachers/daily',

  // waka/admin endpoints
  waDashboardSummary: '/waka/dashboard/summary',
  waClasses: '/waka/classes',

  // me/*
  meClassSchedules: '/me/class/schedules',
  meClassAttendance: '/me/class/attendance',
  meClassStudents: '/me/class/students',
  meClassDashboard: '/me/class/dashboard',
  meClassQrToken: '/me/class/qr-token',

  meSchedules: '/me/schedules',
  meHomeroom: '/me/homeroom',
  meHomeroomSchedules: '/me/homeroom/schedules',
  meHomeroomStudents: '/me/homeroom/students',
  meHomeroomAttendance: '/me/homeroom/attendance',

  meDashboardSummary: '/me/dashboard/summary',
  meAttendance: '/me/attendance',
  meAttendanceSummary: '/me/attendance/summary',

  // leave/absence
  leavePermissions: '/leave-permissions',
  absenceRequests: '/absence-requests',

  // attendance exports/recaps
  attendanceExport: '/attendance/export',
  attendanceExportPdf: '/attendance/export-pdf',
  attendanceRecap: '/attendance/recap',
  attendanceClasses: '/attendance/classes',

  // schedule images (append dynamic segments)
  teacherScheduleBase: '/teachers',
  classScheduleBase: '/classes',

  // admin master data
  rooms: '/rooms',
  timeSlots: '/time-slots',
  schoolYears: '/school-years',
  // semesters already defined above

  // bulk/settings/sync
  settingsBulk: '/settings/bulk',
  adminDataSync: '/admin/data/sync',
};

export default API_ENDPOINTS;
