import apiClient from './api';
import type { AxiosResponse } from 'axios';

// Types for attendance
export interface AttendanceRecord {
    id: number;
    date: string;
    checked_in_at: string;
    status: 'present' | 'late' | 'excused' | 'sick' | 'absent' | 'izin' | 'dinas';
    reason?: string;
    schedule: {
        id: number;
        subject_name: string;
        start_time: string;
        end_time: string;
        teacher: {
            user: {
                name: string;
            };
        };
    };
}

export interface AttendanceSummary {
    status_summary: Array<{
        status: string;
        total: number;
    }>;
    daily_summary: Array<{
        day: string;
        status: string;
        total: number;
    }>;
}

export interface AttendanceParams {
    from?: string;
    to?: string;
    status?: string;
    page?: number;
    per_page?: number;
}

// Attendance service
export const attendanceService = {
    async getMyAttendance(params?: AttendanceParams, options?: any): Promise<AxiosResponse> {
        return apiClient.get('/api/me/attendance', { params, ...options });
    },

    // Get student's attendance summary
    async getMyAttendanceSummary(params?: { from?: string; to?: string }): Promise<AxiosResponse<AttendanceSummary>> {
        return apiClient.get('/api/me/attendance/summary', { params });
    },

    // Get teacher's teaching attendance
    async getTeachingAttendance(params?: AttendanceParams): Promise<AxiosResponse> {
        return apiClient.get('/api/me/attendance/teaching', { params });
    },

    // Get teacher's teaching summary
    async getTeachingSummary(params?: { from?: string; to?: string }): Promise<AxiosResponse> {
        return apiClient.get('/api/me/attendance/teaching/summary', { params });
    },

    // Get class attendance by date (for homeroom teacher)
    async getClassAttendanceByDate(classId: number, date: string): Promise<AxiosResponse> {
        return apiClient.get(`/api/classes/${classId}/attendance`, {
            params: { date }
        });
    },

    // Get class students summary (for homeroom teacher)
    async getClassStudentsSummary(classId: number, params?: AttendanceParams): Promise<AxiosResponse> {
        return apiClient.get(`/api/classes/${classId}/students/attendance-summary`, { params });
    },

    // Get class students absences (for homeroom teacher)
    async getClassStudentsAbsences(classId: number, params?: AttendanceParams): Promise<AxiosResponse> {
        return apiClient.get(`/api/classes/${classId}/students/absences`, { params });
    },

    // Get student's class dashboard
    async getStudentClassDashboard(): Promise<AxiosResponse> {
        return apiClient.get('/api/me/class');
    },

    // Scan QR code for attendance
    async scanQRCode(token: string, deviceId?: number): Promise<AxiosResponse> {
        return apiClient.post('/api/attendance/scan', {
            token,
            device_id: deviceId
        });
    },

    // Manual attendance entry (for teachers)
    async createManualAttendance(data: {
        attendee_type: 'student' | 'teacher';
        student_id?: number;
        teacher_id?: number;
        schedule_id: number;
        status: string;
        date: string;
        reason?: string;
    }): Promise<AxiosResponse> {
        return apiClient.post('/api/attendance/manual', data);
    }
};

export default attendanceService;
