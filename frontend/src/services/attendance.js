import apiClient from './api';

// Attendance API Functions
export const getMyAttendanceHistory = async (options = {}) => {
    const response = await apiClient.get('attendance/me', options);
    return response.data;
};

export const getMyAttendanceSummary = async (options = {}) => {
    const response = await apiClient.get('me/attendance/summary', options);
    return response.data;
};

export const getTeachingAttendance = async (options = {}) => {
    const response = await apiClient.get('attendance/me/teaching', options);
    return response.data;
};

export const getTeachingSummary = async (options = {}) => {
    const response = await apiClient.get('attendance/me/teaching/summary', options);
    return response.data;
};

export const getClassAttendanceByDate = async (classId, date, options = {}) => {
    const response = await apiClient.get(`attendance/class/${classId}/by-date`, {
        ...options,
        params: { date }
    });
    return response.data;
};

export const getClassStudentsSummary = async (classId, options = {}) => {
    const response = await apiClient.get(`attendance/class/${classId}/students/summary`, options);
    return response.data;
};

export const getClassStudentsAbsences = async (classId, options = {}) => {
    const response = await apiClient.get(`attendance/class/${classId}/students/absences`, options);
    return response.data;
};

export const getHomeroomDashboard = async (options = {}) => {
    const response = await apiClient.get('me/homeroom/dashboard', options);
    return response.data;
};

export const getStudentClassDashboard = async (options = {}) => {
    const response = await apiClient.get('me/class', options);
    return response.data;
};

export const getTeacherSchedules = async (options = {}) => {
    const response = await apiClient.get('schedules', options);
    return response.data.data ? response.data.data : response.data;
};

export const createManualAttendance = async (data) => {
    const response = await apiClient.post('attendance/manual', data);
    return response.data;
};

export const getAttendanceBySchedule = async (scheduleId, options = {}) => {
    const response = await apiClient.get(`attendance/schedule/${scheduleId}`, options);
    return response.data.data ? response.data.data : response.data;
};

export const getClassSchedules = async (classId, options = {}) => {
    const response = await apiClient.get(`classes/${classId}/schedules`, options);
    return response.data;
};

export const getClassScheduleImage = async (classId) => {
    const response = await apiClient.get(`classes/${classId}/schedule-image`, {
        responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
};

const attendanceService = {
    getMyAttendanceHistory,
    getMyAttendanceSummary,
    getTeachingAttendance,
    getTeachingSummary,
    getClassAttendanceByDate,
    getClassStudentsSummary,
    getClassStudentsAbsences,
    getHomeroomDashboard,
    getStudentClassDashboard,
    createManualAttendance,
    getTeacherSchedules,
    getAttendanceBySchedule,
    getClassSchedules,
    getClassScheduleImage,
    getTeacherDashboard: async (options = {}) => {
        const response = await apiClient.get('me/teacher/dashboard', options);
        return response.data;
    },
    getClassDashboard: async (options = {}) => {
        const response = await apiClient.get('me/class/dashboard', options);
        return response.data;
    }
};

export default attendanceService;