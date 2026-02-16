import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export interface Student {
    id: number;
    name: string;
    nisn: string;
    nis: string;
    gender: 'L' | 'P';
    address: string;
    class_id: number;
    is_class_officer: boolean;
    phone?: string;
    contact?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    class_room?: {
        id: number;
        name: string;
        major: {
            id: number;
            name: string;
        };
    };
}

export const studentService = {
    /**
     * Get all students
     */
    async getStudents(): Promise<Student[]> {
        const response = await apiClient.get(API_ENDPOINTS.STUDENTS);
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
     * Get a student by ID
     */
    async getStudentById(id: string | number): Promise<Student> {
        const response = await apiClient.get(`${API_ENDPOINTS.STUDENTS}/${id}`);
        return response.data.data || response.data;
    },

    /**
     * Create a new student
     */
    async createStudent(data: any): Promise<Student> {
        const response = await apiClient.post(API_ENDPOINTS.STUDENTS, data);
        return response.data;
    },

    /**
     * Update a student
     */
    async updateStudent(id: string | number, data: any): Promise<Student> {
        const response = await apiClient.put(`${API_ENDPOINTS.STUDENTS}/${id}`, data);
        return response.data;
    },

    /**
     * Delete a student
     */
    async deleteStudent(id: string | number): Promise<void> {
        await apiClient.delete(`${API_ENDPOINTS.STUDENTS}/${id}`);
    },

    /**
     * Import multiple students
     */
    async importStudents(items: any[]): Promise<{ created: number, students: Student[] }> {
        const response = await apiClient.post(`${API_ENDPOINTS.STUDENTS}/import`, { items });
        return response.data;
    }
};
