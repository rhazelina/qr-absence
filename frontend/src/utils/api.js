import { toast } from 'react-toastify';
import API_ENDPOINTS from './apiConfig';

const baseURL = import.meta.env.VITE_API_URL;
const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';

const apiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const isFormDataBody = options.body instanceof FormData;
    
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    
    const headers = {
      'Accept': 'application/json',
      'X-Device-Type': deviceType,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(!isFormDataBody && { 'Content-Type': 'application/json' }),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      // if server redirected to login page (HTML) treat as unauthorized
      if (response.redirected && response.url.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Sesi telah berakhir, silakan login kembali');
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('Sesi telah berakhir, silakan login kembali');
        }

        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          toast.error(errorData.message || 'Anda tidak memiliki akses (Forbidden). Hubungi Administrator.');
        } else if (response.status >= 500) {
          toast.error('Terjadi kesalahan pada server (Internal Server Error).');
        }

        const error = new Error(errorData.message || `API Error: ${response.status}`);
        error.data = errorData;

        // Return structured error instead of throwing a generic one string
        // Many frontend components expect error.data to exist and contain error details
        throw error;
      }

      return await response.json();
    } catch (error) {
      // normalize error: always have data property
      if (error && typeof error === 'object' && !('data' in error)) {
        error.data = {};
      }
      // Only toast if it's a TypeError (Network Error from fetch failing) and not our custom re-thrown error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.', { toastId: 'network-err' });
      }
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
  },

  // Auth Methods
  getProfile() {
    return this.get(API_ENDPOINTS.me);
  },

  // Class & Schedule Methods
  getMyClassSchedules() {
    return this.get(API_ENDPOINTS.meClassSchedules);
  },

  getMyClassAttendance(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.meClassAttendance + query);
  },

  getMyClassStudents() {
    return this.get(API_ENDPOINTS.meClassStudents);
  },

  getMyClassAttendanceHistory(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.meClassAttendance + query);
  },

  // Teacher Schedule & Attendance Methods
  getTeacherSchedules() {
    return this.get(API_ENDPOINTS.meSchedules);
  },

  getTeacherScheduleDetail(scheduleId) {
    return this.get(`${API_ENDPOINTS.meSchedules}/${scheduleId}/detail`);
  },

  getTeacherScheduleStudents(scheduleId) {
    return this.get(`${API_ENDPOINTS.meSchedules}/${scheduleId}/students`);
  },

  submitBulkAttendance(data) {
    return this.post(`${API_ENDPOINTS.attendance}/bulk-manual`, data);
  },

  // Homeroom Teacher Methods
  getHomeroomInfo() {
    return this.get(API_ENDPOINTS.meHomeroom);
  },

  getHomeroomSchedules(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.meHomeroomSchedules + query);
  },

  getHomeroomStudents() {
    return this.get(API_ENDPOINTS.meHomeroomStudents);
  },

  getHomeroomAttendance(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.meHomeroomAttendance + query);
  },

  getMyClassDashboard() {
    return this.get(API_ENDPOINTS.meClassDashboard);
  },

  generateClassQr(data) {
    return this.post(API_ENDPOINTS.meClassQrToken, data);
  },

  // Student Methods
  getStudentDashboard() {
    return this.get(API_ENDPOINTS.meDashboardSummary);
  },

  getAttendanceHistory(params) {
    const query = new URLSearchParams({
      from: params.start_date,
      to: params.end_date
    }).toString();
    return this.get(`${API_ENDPOINTS.meAttendance}?${query}`);
  },

  // Shared / Public Methods
  getSemesters() {
    return this.get(API_ENDPOINTS.semesters);
  },

  // miscellaneous
  login(data) {
    return this.post(API_ENDPOINTS.login, data);
  },

  getMyAttendanceSummary() {
    return this.get(API_ENDPOINTS.meAttendanceSummary);
  },

  // Settings Methods
  getSettings() {
    return this.get(API_ENDPOINTS.settings);
  },

  getPublicSettings() {
    return this.get(API_ENDPOINTS.publicSettings);
  },

  updateSettings(data) {
    return this.post(API_ENDPOINTS.settings, data);
  },

  getTeachers(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.teachers + query);
  },

  // Waka Methods
  getWakaDashboardSummary(semesterId) {
    const params = semesterId ? `?semester_id=${semesterId}` : '';
    return this.get(API_ENDPOINTS.waDashboardSummary + params);
  },

  getWakaClassAttendanceSummary(classId, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${API_ENDPOINTS.waClasses}/${classId}/attendance-summary${query}`);
  },

  // Waka/Admin Methods
  getStudentAttendance(studentId, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${API_ENDPOINTS.students}/${studentId}/attendance${query}`);
  },

  getTeacherAttendanceHistory(teacherId, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${API_ENDPOINTS.teachers}/${teacherId}/attendance-history${query}`);
  },

  getTeacherAttendance(teacherId, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${API_ENDPOINTS.teachers}/${teacherId}/attendance${query}`);
  },

  // detailed summaries for admins/waka
  getAttendanceClassSummary(classId, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`${API_ENDPOINTS.attendanceClasses}/${classId}/summary${query}`);
  },

  getAttendanceBySchedule(scheduleId) {
    return this.get(`${API_ENDPOINTS.attendance}/schedules/${scheduleId}`);
  },

  getDailyTeacherAttendance(date, params) {
    const query = new URLSearchParams({ date, ...params }).toString();
    return this.get(`${API_ENDPOINTS.attendanceTeachersDaily}?${query}`);
  },

  voidAttendance(id) {
    return this.post(`${API_ENDPOINTS.attendance}/${id}/void`, {});
  },

  updateAttendanceStatus(attendanceId, data) {
    return this.post(`${API_ENDPOINTS.attendance}/${attendanceId}/excuse`, data);
  },

  uploadAttendanceDocument(attendanceId, formData) {
    return this.post(`${API_ENDPOINTS.attendance}/${attendanceId}/document`, formData);
  },

  getClasses(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '?per_page=1000';
    return this.get(API_ENDPOINTS.classes + query);
  },

  /**
   * Schedule image management for teachers and classes
   */
  uploadTeacherScheduleImage(teacherId, formData) {
    return this.post(`${API_ENDPOINTS.teacherScheduleBase}/${teacherId}/schedule-image`, formData);
  },
  deleteTeacherScheduleImage(teacherId) {
    return this.post(`${API_ENDPOINTS.teacherScheduleBase}/${teacherId}/schedule-image`, {}); // backend uses POST for delete?
  },
  getTeacherScheduleImage(teacherId) {
    return this.get(`${API_ENDPOINTS.teacherScheduleBase}/${teacherId}/schedule-image`);
  },
  uploadClassScheduleImage(classId, formData) {
    return this.post(`${API_ENDPOINTS.classScheduleBase}/${classId}/schedule-image`, formData);
  },
  deleteClassScheduleImage(classId) {
    return this.post(`${API_ENDPOINTS.classScheduleBase}/${classId}/schedule-image`, {});
  },
  getClassScheduleImage(classId) {
    return this.get(`${API_ENDPOINTS.classScheduleBase}/${classId}/schedule-image`);
  },

  getAvailableClasses(teacherId = null) {
    let query = '?available=true&per_page=1000';
    if (teacherId) {
      query += `&exclude_teacher=${teacherId}`;
    }
    return this.get(API_ENDPOINTS.classes + query);
  },

  getMajors(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '?per_page=1000';
    return this.get(API_ENDPOINTS.majors + query);
  },

  addMajor(data) {
    return this.post(API_ENDPOINTS.majors, data);
  },

  updateMajor(id, data) {
    return this.request(`${API_ENDPOINTS.majors}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteMajor(id) {
    return this.request(`${API_ENDPOINTS.majors}/${id}`, { method: 'DELETE' });
  },

  getClass(classId) {
    return this.get(`${API_ENDPOINTS.classes}/${classId}`);
  },

  getClassAttendanceByDate(classId, date) {
    const query = date ? `?date=${date}` : '';
    return this.get(`${API_ENDPOINTS.waClasses}/${classId}/attendance${query}`);
  },

  // Leave permissions / absence requests
  getLeavePermissions(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.leavePermissions + query);
  },
  createLeavePermission(data) {
    return this.post(API_ENDPOINTS.leavePermissions, data);
  },
  getLeavePermission(id) {
    return this.get(`${API_ENDPOINTS.leavePermissions}/${id}`);
  },
  updateLeavePermission(id, data) {
    return this.request(`${API_ENDPOINTS.leavePermissions}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  markLeaveReturned(id) {
    return this.post(`${API_ENDPOINTS.leavePermissions}/${id}/return`, {});
  },
  markLeaveAbsent(id) {
    return this.post(`${API_ENDPOINTS.leavePermissions}/${id}/mark-absent`, {});
  },
  cancelLeavePermission(id) {
    return this.post(`${API_ENDPOINTS.leavePermissions}/${id}/cancel`, {});
  },
  checkLeaveExpired() {
    return this.post(`${API_ENDPOINTS.leavePermissions}/check-expired`, {});
  },

  getAbsenceRequests(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.absenceRequests + query);
  },
  createAbsenceRequest(data) {
    return this.post(API_ENDPOINTS.absenceRequests, data);
  },
  approveAbsenceRequest(id) {
    return this.post(`${API_ENDPOINTS.absenceRequests}/${id}/approve`, {});
  },
  rejectAbsenceRequest(id) {
    return this.post(`${API_ENDPOINTS.absenceRequests}/${id}/reject`, {});
  },

  // Student Admin CRUD
  getStudents(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.students + query);
  },
  getStudent(id) {
    return this.get(`${API_ENDPOINTS.students}/${id}`);
  },
  addStudent(data) {
    return this.post(API_ENDPOINTS.students, data);
  },
  updateStudent(id, data) {
    return this.request(`${API_ENDPOINTS.students}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteStudent(id) {
    return this.request(`${API_ENDPOINTS.students}/${id}`, { method: 'DELETE' });
  },
  importStudents(data) {
    return this.post(API_ENDPOINTS.importStudents, data);
  },

  // Teacher Admin CRUD
  getTeacher(id) {
    return this.get(`${API_ENDPOINTS.teachers}/${id}`);
  },
  addTeacher(data) {
    return this.post(API_ENDPOINTS.teachers, data);
  },
  updateTeacher(id, data) {
    return this.request(`${API_ENDPOINTS.teachers}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteTeacher(id) {
    return this.request(`${API_ENDPOINTS.teachers}/${id}`, { method: 'DELETE' });
  },
  importTeachers(data) {
    return this.post(API_ENDPOINTS.importTeachers, data);
  },

  // Class Admin CRUD
  addClass(data) {
    return this.post(API_ENDPOINTS.classes, data);
  },
  updateClass(id, data) {
    return this.request(`${API_ENDPOINTS.classes}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteClass(id) {
    return this.request(`${API_ENDPOINTS.classes}/${id}`, { method: 'DELETE' });
  },
  importClasses(data) {
    return this.post(API_ENDPOINTS.importClasses, data);
  },

  // attendance export / recap
  exportAttendance(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.attendanceExport + query);
  },
  exportAttendancePdf(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.attendanceExportPdf + query);
  },
  getAttendanceRecap(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.attendanceRecap + query);
  },

  // Admin master data CRUD
  /* rooms */
  getRooms(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.rooms + query);
  },
  addRoom(data) {
    return this.post(API_ENDPOINTS.rooms, data);
  },
  updateRoom(id, data) {
    return this.request(`${API_ENDPOINTS.rooms}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteRoom(id) {
    return this.request(`${API_ENDPOINTS.rooms}/${id}`, { method: 'DELETE' });
  },
  /* subjects */
  getSubjects(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.subjects + query);
  },
  addSubject(data) {
    return this.post(API_ENDPOINTS.subjects, data);
  },
  updateSubject(id, data) {
    return this.request(`${API_ENDPOINTS.subjects}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteSubject(id) {
    return this.request(`${API_ENDPOINTS.subjects}/${id}`, { method: 'DELETE' });
  },
  /* time slots */
  getTimeSlots(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.timeSlots + query);
  },
  addTimeSlot(data) {
    return this.post(API_ENDPOINTS.timeSlots, data);
  },
  updateTimeSlot(id, data) {
    return this.request(`${API_ENDPOINTS.timeSlots}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteTimeSlot(id) {
    return this.request(`${API_ENDPOINTS.timeSlots}/${id}`, { method: 'DELETE' });
  },
  /* school years */
  getSchoolYears(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(API_ENDPOINTS.schoolYears + query);
  },
  addSchoolYear(data) {
    return this.post(API_ENDPOINTS.schoolYears, data);
  },
  updateSchoolYear(id, data) {
    return this.request(`${API_ENDPOINTS.schoolYears}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteSchoolYear(id) {
    return this.request(`${API_ENDPOINTS.schoolYears}/${id}`, { method: 'DELETE' });
  },
  /* semesters already have getSemesters; provide modification too */
  addSemester(data) {
    return this.post(API_ENDPOINTS.semesters, data);
  },
  updateSemester(id, data) {
    return this.request(`${API_ENDPOINTS.semesters}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteSemester(id) {
    return this.request(`${API_ENDPOINTS.semesters}/${id}`, { method: 'DELETE' });
  },

  // bulk settings and admin sync
  updateSettingsBulk(data) {
    return this.post(API_ENDPOINTS.settingsBulk, data);
  },
  syncAdminData(data = {}) {
    return this.post(API_ENDPOINTS.adminDataSync, data);
  },

  importSchedules(data) {
    return this.post(API_ENDPOINTS.importSchedules, data);
  }
};

export default apiService;

