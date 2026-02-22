import { toast } from 'react-toastify';

const baseURL = import.meta.env.VITE_API_URL;
const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';

const apiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const isFormDataBody = options.body instanceof FormData;
    const headers = {
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(!isFormDataBody && { 'Content-Type': 'application/json' }),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

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
    return this.get('/me');
  },

  // Class & Schedule Methods
  getMyClassSchedules() {
    return this.get('/me/class/schedules');
  },

  getMyClassAttendance(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/me/class/attendance${query}`);
  },

  getMyClassStudents() {
    return this.get('/me/class/students');
  },

  getMyClassAttendanceHistory(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/me/class/attendance${query}`);
  },

  // Teacher Schedule & Attendance Methods
  getTeacherSchedules() {
    return this.get('/me/schedules');
  },

  getTeacherScheduleDetail(scheduleId) {
    return this.get(`/me/schedules/${scheduleId}/detail`);
  },

  getTeacherScheduleStudents(scheduleId) {
    return this.get(`/me/schedules/${scheduleId}/students`);
  },

  submitBulkAttendance(data) {
    return this.post('/attendance/bulk-manual', data);
  },

  // Homeroom Teacher Methods
  getHomeroomInfo() {
    return this.get('/me/homeroom');
  },

  getHomeroomSchedules() {
    return this.get('/me/homeroom/schedules');
  },

  getHomeroomStudents() {
    return this.get('/me/homeroom/students');
  },

  getHomeroomAttendance(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/me/homeroom/attendance${query}`);
  },

  getMyClassDashboard() {
    return this.get('/me/class/dashboard');
  },

  generateClassQr(data) {
    return this.post('/me/class/qr-token', data);
  },

  // Student Methods
  getStudentDashboard() {
    return this.get('/me/dashboard/summary');
  },

  getAttendanceHistory(params) {
    const query = new URLSearchParams({
      from: params.start_date,
      to: params.end_date,
    }).toString();
    return this.get(`/me/attendance?${query}`);
  },

  // Shared / Public Methods
  getSemesters() {
    return this.get('/semesters');
  },

  // Settings Methods
  getSettings() {
    return this.get('/settings');
  },

  getPublicSettings() {
    return this.get('/settings/public');
  },

  updateSettings(data) {
    return this.post('/settings', data);
  },

  getTeachers(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/teachers${query}`);
  },

  // Waka Methods
  getWakaDashboardSummary(semesterId) {
    const params = semesterId ? `?semester_id=${semesterId}` : '';
    return this.get(`/waka/dashboard/summary${params}`);
  },

  getWakaClassAttendanceSummary(classId, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/waka/classes/${classId}/attendance-summary${query}`);
  },

  // Waka/Admin Methods
  getStudentAttendance(studentId, params) { // For detail view
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/students/${studentId}/attendance${query}`);
  },

  getTeacherAttendanceHistory(teacherId, params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/teachers/${teacherId}/attendance-history${query}`);
  },

  getDailyTeacherAttendance(date, params) {
    const query = new URLSearchParams({ date, ...params }).toString();
    return this.get(`/attendance/teachers/daily?${query}`);
  },

  voidAttendance(id) {
    return this.post(`/attendance/${id}/void`, {});
  },

  updateAttendanceStatus(attendanceId, data) {
    return this.post(`/attendance/${attendanceId}/excuse`, data);
  },

  getClasses(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '?per_page=1000';
    return this.get(`/classes${query}`);
  },

  getAvailableClasses() {
    return this.get('/classes?available=true&per_page=1000');
  },

  getMajors(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '?per_page=1000';
    return this.get(`/majors${query}`);
  },

  getClass(classId) {
    return this.get(`/classes/${classId}`);
  },

  getClassAttendanceByDate(classId, date) {
    const query = date ? `?date=${date}` : '';
    return this.get(`/waka/classes/${classId}/attendance${query}`);
  },

  // Student Admin CRUD
  getStudents(params) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/students${query}`);
  },
  getStudent(id) {
    return this.get(`/students/${id}`);
  },
  addStudent(data) {
    return this.post('/students', data);
  },
  updateStudent(id, data) {
    return this.request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteStudent(id) {
    return this.request(`/students/${id}`, { method: 'DELETE' });
  },
  importStudents(data) {
    return this.post('/import/siswa', data);
  },

  // Teacher Admin CRUD
  getTeacher(id) {
    return this.get(`/teachers/${id}`);
  },
  addTeacher(data) {
    return this.post('/teachers', data);
  },
  updateTeacher(id, data) {
    return this.request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteTeacher(id) {
    return this.request(`/teachers/${id}`, { method: 'DELETE' });
  },
  importTeachers(data) {
    return this.post('/import/guru', data);
  },

  // Class Admin CRUD
  addClass(data) {
    return this.post('/classes', data);
  },
  updateClass(id, data) {
    return this.request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteClass(id) {
    return this.request(`/classes/${id}`, { method: 'DELETE' });
  },
  importClasses(data) {
    return this.post('/import/kelas', data);
  },

  importSchedules(data) {
    return this.post('/import/jadwal', data);
  }
};

export default apiService;
