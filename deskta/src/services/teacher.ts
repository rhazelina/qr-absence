import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export interface Teacher {
    id: number;
    name: string;
    nip: string;
    code?: string;
    email: string;
    phone: string;
    subject: string;
    homeroom_class_id?: number | null;
    homeroom_class?: {
        id: number;
        name: string;
    } | null;
    schedule_image_path?: string | null;
    gender?: 'L' | 'P';
    role?: string;
}

export interface TeacherResponse {
    data: Teacher[];
    links?: any;
    meta?: any;
}

export const teacherService = {
    /**
     * Get all teachers
     */
    async getTeachers(): Promise<Teacher[]> {
        const response = await apiClient.get(API_ENDPOINTS.TEACHERS);
        // Handle both resource collection (data.data) and simple array (data)
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    },

    /**
     * Get a teacher by ID
     */
    async getTeacherById(id: string | number): Promise<Teacher> {
        const response = await apiClient.get(`${API_ENDPOINTS.TEACHERS}/${id}`);
        return response.data.data || response.data;
    },

    /**
     * Create a new teacher
     */
    async createTeacher(data: any): Promise<Teacher> {
        const response = await apiClient.post(API_ENDPOINTS.TEACHERS, data);
        return response.data;
    },

    /**
     * Update a teacher
     */
    async updateTeacher(id: string | number, data: any): Promise<Teacher> {
        const response = await apiClient.put(`${API_ENDPOINTS.TEACHERS}/${id}`, data);
        return response.data;
    },

    /**
     * Delete a teacher
     */
    async deleteTeacher(id: string | number): Promise<void> {
        await apiClient.delete(`${API_ENDPOINTS.TEACHERS}/${id}`);
    },

    /**
     * Upload schedule image
     */
    async uploadScheduleImage(id: string | number, file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(API_ENDPOINTS.TEACHER_SCHEDULE_IMAGE(Number(id)), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Import multiple teachers from array
     */
    async importTeachers(teachers: any[]): Promise<any> {
        const response = await apiClient.post(`${API_ENDPOINTS.TEACHERS}/import`, {
            teachers
        });
        return response.data;
    },

    /**
     * Get teacher attendance history (for waka)
     */
    async getTeacherAttendance(id: string | number, params?: { month?: number; year?: number }): Promise<any[]> {
        const response = await apiClient.get(API_ENDPOINTS.TEACHER_ATTENDANCE(Number(id)), { params });
        return response.data;
    }
};
