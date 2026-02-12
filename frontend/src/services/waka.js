import apiClient from './api';

export const wakaService = {
  getDashboardSummary: async (params) => {
    const response = await apiClient.get('/waka/dashboard/summary', { params });
    return response.data;
  },
  getSemesters: async () => {
    const response = await apiClient.get('/semesters');
    return response.data;
  },
  getClasses: async () => {
    const response = await apiClient.get('/classes', { params: { per_page: -1 } });
    return response.data;
  },
  getClassAttendanceSummary: async (classId, params) => {
    const response = await apiClient.get(`/waka/classes/${classId}/attendance-summary`, { params });
    const { data } = response;
    return data;
  },
  getClassAttendanceDate: async (classId, date) => {
    const response = await apiClient.get(`/classes/${classId}/attendance`, { params: { date } });
    const { data } = response;
    return data;
  },
  updateAttendance: async (payload) => {
    const response = await apiClient.post('/attendance/manual', payload);
    return response.data;
  },
  getTeachersDailyAttendance: async (date) => {
    const response = await apiClient.get(`/attendance/teachers/daily`, { params: { date, per_page: -1 } });
    const { data } = response;
    return data;
  },
  getTeacherAttendanceHistory: async (teacherId, params) => {
    const response = await apiClient.get(`/teachers/${teacherId}/attendance-history`, { params });
    const { data } = response;
    return data;
  },
  getStudentAttendance: async (studentId, params) => {
    const response = await apiClient.get(`/students/${studentId}/attendance`, { params });
    const { data } = response;
    return data;
  }
};

export default wakaService;
