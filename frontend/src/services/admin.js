import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAdminSummary = async (options = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN_SUMMARY, options);
    return response.data.data || response.data;
};

export const adminService = {
    getSummary: getAdminSummary
};

export default adminService;
