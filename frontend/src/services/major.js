import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getMajors = async (options = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.MAJORS, options);
    return response.data.data || response.data;
};

export const getMajorById = async (id, options = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.MAJORS}/${id}`, options);
    return response.data.data || response.data;
};

export const createMajor = async (data, options = {}) => {
    const response = await apiClient.post(API_ENDPOINTS.MAJORS, data, options);
    return response.data;
};

export const updateMajor = async (id, data, options = {}) => {
    const response = await apiClient.put(`${API_ENDPOINTS.MAJORS}/${id}`, data, options);
    return response.data;
};

export const deleteMajor = async (id, options = {}) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.MAJORS}/${id}`, options);
    return response.data;
};

export const majorService = {
    getMajors,
    getMajorById,
    createMajor,
    updateMajor,
    deleteMajor
};

export default majorService;
