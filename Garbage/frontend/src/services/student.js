import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getStudents = async (options = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.STUDENTS, options);
    return response.data.data || response.data;
};

export const getStudentById = async (id, options = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.STUDENTS}/${id}`, options);
    return response.data.data || response.data;
};

export const createStudent = async (data, options = {}) => {
    const response = await apiClient.post(API_ENDPOINTS.STUDENTS, data, options);
    return response.data;
};

export const updateStudent = async (id, data, options = {}) => {
    const response = await apiClient.put(`${API_ENDPOINTS.STUDENTS}/${id}`, data, options);
    return response.data;
};

export const deleteStudent = async (id, options = {}) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.STUDENTS}/${id}`, options);
    return response.data;
};

export const importStudents = async (items, options = {}) => {
    const response = await apiClient.post(API_ENDPOINTS.STUDENTS_IMPORT, { items }, options);
    return response.data;
};
