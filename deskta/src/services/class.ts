import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';
import type { AxiosRequestConfig } from 'axios';

export interface ClassRoom {
    id: number;
    grade: string;
    label: string;
    major_id: number;
    homeroom_teacher_id?: number;
    schedule_image_path?: string;
    name?: string; // Accessor likely handles this
    major?: {
        id: number;
        name: string;
        code: string;
    };
    homeroom_teacher?: {
        id: number;
        user?: {
            name: string;
        }
    };
}

export const classService = {
    /**
     * Get all classes
     */
    async getClasses(options?: AxiosRequestConfig): Promise<ClassRoom[]> {
        const response = await apiClient.get(API_ENDPOINTS.CLASSES, options); 
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
     * Get class by ID
     */
    async getClassById(id: string | number, options?: AxiosRequestConfig): Promise<ClassRoom> {
        const response = await apiClient.get(`${API_ENDPOINTS.CLASSES}/${id}`, options);
        return response.data;
    },

    /**
     * Create a new class
     */
    async createClass(data: any): Promise<ClassRoom> {
        const response = await apiClient.post(API_ENDPOINTS.CLASSES, data);
        return response.data;
    },

    /**
     * Update a class
     */
    async updateClass(id: string | number, data: any): Promise<ClassRoom> {
        const response = await apiClient.put(`${API_ENDPOINTS.CLASSES}/${id}`, data);
        return response.data;
    },

    /**
     * Delete a class
     */
    async deleteClass(id: string | number): Promise<void> {
        await apiClient.delete(`${API_ENDPOINTS.CLASSES}/${id}`);
    },

    /**
     * Upload schedule image
     */
    async uploadSchedule(id: string | number, file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`${API_ENDPOINTS.CLASSES}/${id}/schedule-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
