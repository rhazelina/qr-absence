import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getClasses = async () => {
    const response = await apiClient.get(API_ENDPOINTS.CLASSES);
    return response.data.data || response.data;
};

export const getClassById = async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.CLASSES}/${id}`);
    return response.data.data || response.data;
};
