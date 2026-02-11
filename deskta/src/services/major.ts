import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';


export interface Major {
    id: number;
    name: string;
    code: string;
    description?: string;
}

export const majorService = {
    /**
     * Get all majors
     */
    async getMajors(): Promise<Major[]> {
        const response = await apiClient.get(API_ENDPOINTS.MAJORS);
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    },

    /**
     * Create a new major
     */
    async createMajor(data: any): Promise<Major> {
        const response = await apiClient.post(API_ENDPOINTS.MAJORS, data);
        return response.data;
    },

    /**
     * Update a major
     */
    async updateMajor(id: string | number, data: any): Promise<Major> {
        const response = await apiClient.put(`${API_ENDPOINTS.MAJORS}/${id}`, data);
        return response.data;
    },

    /**
     * Delete a major
     */
    async deleteMajor(id: string | number): Promise<void> {
        await apiClient.delete(`${API_ENDPOINTS.MAJORS}/${id}`);
    }
};
