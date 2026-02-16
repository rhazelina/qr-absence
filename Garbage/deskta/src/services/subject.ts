import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export interface Subject {
    id: number;
    name: string;
}

export const subjectService = {
    /**
     * Get all subjects
     */
    async getSubjects(): Promise<Subject[]> {
        const response = await apiClient.get(API_ENDPOINTS.SUBJECTS);
        // Handle both resource collection (data.data) and simple array (data)
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    }
};
