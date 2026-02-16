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

export const getScheduleDetail = async (scheduleId) => {
    const response = await apiClient.get(`me/schedules/${scheduleId}/detail`);
    return response.data;
};

export const bulkManualAttendance = async (data) => {
    const response = await apiClient.post('attendance/bulk-manual', data);
    return response.data;
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
        const response = await apiClient.get('guru/dashboard', options);
        return response.data;
    },
    getClassDashboard: async (options = {}) => {
        const response = await apiClient.get('me/class/dashboard', options);
        return response.data;
    },
    getHomeroomStudents: async (options = {}) => {
        const response = await apiClient.get('me/homeroom/students', options);
        return response.data;
    },
    getHomeroom: async () => {
        const response = await apiClient.get('me/homeroom');
        return response.data;
    },
    getMyClassStudents: async (options = {}) => {
        const response = await apiClient.get('me/class/students', options);
        return response.data;
    },
    getMyClassAttendance: async (options = {}) => {
        const response = await apiClient.get('me/class/attendance', options);
        return response.data;
    },
    getStudentsOnLeave: async (classId) => {
        const response = await apiClient.get(`classes/${classId}/students-on-leave`);
        return response.data;
    },
    getHomeroomAttendance: async (options = {}) => {
        const response = await apiClient.get('me/homeroom/attendance', options);
        return response.data;
    },
    submitLeavePermission: async (data, file) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        if (file) {
            formData.append('attachment', file);
        }
        const response = await apiClient.post('leave-permissions', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getScheduleDetail,
    bulkManualAttendance,
    uploadDocument: async (attendanceId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`attendance/${attendanceId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default attendanceService;