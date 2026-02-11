import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getMajors = async (options = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.MAJORS, options);
    return response.data.data || response.data;
};
