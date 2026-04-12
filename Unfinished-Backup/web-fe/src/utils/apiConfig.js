const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api';

const API_ENDPOINTS = {
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/me',
  publicSettings: '/settings/public',

  adminSummary: '/admin/summary',
  settings: '/settings',

  majors: '/majors',
  classes: '/classes',
  teachers: '/teachers',
  students: '/students',

  meTeacherDashboard: '/me/teacher/dashboard',
  meSchedules: '/me/schedules',
  meSchedulesToday: '/me/schedules/today',

  meStudentDashboard: '/me/dashboard/summary',
  meAttendance: '/me/attendance',
  meAttendanceSummary: '/me/attendance/summary',

  wakaDashboard: '/waka/dashboard/summary',
  wakaTeacherDailyAttendance: '/waka/attendance/teachers/daily',
};

export { API_BASE_URL, API_ENDPOINTS };
