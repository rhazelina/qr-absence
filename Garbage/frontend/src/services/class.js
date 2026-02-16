import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getClasses = async (options = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.CLASSES, options);
    return response.data.data || response.data;
};

export const getClassById = async (id, options = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.CLASSES}/${id}`, options);
    return response.data.data || response.data;
};

export const createClass = async (data, options = {}) => {
    const response = await apiClient.post(API_ENDPOINTS.CLASSES, data, options);
    return response.data;
};

export const updateClass = async (id, data, options = {}) => {
    const response = await apiClient.put(`${API_ENDPOINTS.CLASSES}/${id}`, data, options);
    return response.data;
};

export const deleteClass = async (id, options = {}) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.CLASSES}/${id}`, options);
    return response.data;
};

export const classService = {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass
};

export default classService;
