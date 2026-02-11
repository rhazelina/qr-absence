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
