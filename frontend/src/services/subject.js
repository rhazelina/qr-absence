import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all subjects from backend
 * @param {Object} options - Additional request options
 * @returns {Promise<Array>} List of subjects
 */
export const getSubjects = async (options = {}) => {
    const params = { per_page: -1, ...options };
    const response = await apiClient.get(API_ENDPOINTS.SUBJECTS, { params });
    return response.data.data || response.data;
};

/**
 * Get single subject by ID
 * @param {number} id - Subject ID
 * @param {Object} options - Additional request options
 * @returns {Promise<Object>} Subject data
 */
export const getSubjectById = async (id, options = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.SUBJECTS}/${id}`, options);
    return response.data.data || response.data;
};

export const subjectService = {
    getSubjects,
    getSubjectById
};

export default subjectService;
