import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getMajors = async () => {
    const response = await apiClient.get(API_ENDPOINTS.MAJORS);
    return response.data.data || response.data;
};
