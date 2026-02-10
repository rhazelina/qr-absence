import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getStudents = async () => {
    const response = await apiClient.get(API_ENDPOINTS.STUDENTS);
    return response.data.data || response.data;
};

export const getStudentById = async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.STUDENTS}/${id}`);
    return response.data.data || response.data;
};

export const createStudent = async (data) => {
    const response = await apiClient.post(API_ENDPOINTS.STUDENTS, data);
    return response.data;
};

export const updateStudent = async (id, data) => {
    const response = await apiClient.put(`${API_ENDPOINTS.STUDENTS}/${id}`, data);
    return response.data;
};

export const deleteStudent = async (id) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.STUDENTS}/${id}`);
    return response.data;
};

export const importStudents = async (items) => {
    const response = await apiClient.post(API_ENDPOINTS.STUDENTS_IMPORT, { items });
    return response.data;
};
