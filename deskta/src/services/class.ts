import apiClient from './api';




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
    async getClasses(): Promise<ClassRoom[]> {
        const response = await apiClient.get('classes'); // Using 'classes' directly as per controller
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
    async getClassById(id: string | number): Promise<ClassRoom> {
        const response = await apiClient.get(`classes/${id}`);
        return response.data;
    },

    /**
     * Create a new class
     */
    async createClass(data: any): Promise<ClassRoom> {
        const response = await apiClient.post('classes', data);
        return response.data;
    },

    /**
     * Update a class
     */
    async updateClass(id: string | number, data: any): Promise<ClassRoom> {
        const response = await apiClient.put(`classes/${id}`, data);
        return response.data;
    },

    /**
     * Delete a class
     */
    async deleteClass(id: string | number): Promise<void> {
        await apiClient.delete(`classes/${id}`);
    },

    /**
     * Upload schedule image
     */
    async uploadSchedule(id: string | number, file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`classes/${id}/schedule-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
