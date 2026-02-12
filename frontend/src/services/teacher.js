import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getTeachers = async (options = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHERS, options);
    return response.data.data || response.data;
};

export const getTeacherById = async (id, options = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.TEACHERS}/${id}`, options);
    return response.data.data || response.data;
};

export const createTeacher = async (data, options = {}) => {
    const response = await apiClient.post(API_ENDPOINTS.TEACHERS, data, options);
    return response.data;
};

export const updateTeacher = async (id, data, options = {}) => {
    const response = await apiClient.put(`${API_ENDPOINTS.TEACHERS}/${id}`, data, options);
    return response.data;
};

export const deleteTeacher = async (id, options = {}) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.TEACHERS}/${id}`, options);
    return response.data;
};

export const importTeachers = async (items, options = {}) => {
    const response = await apiClient.post(`${API_ENDPOINTS.TEACHERS}/import`, { items }, options);
    return response.data;
};

export const teacherService = {
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    importTeachers
};

export default teacherService;
