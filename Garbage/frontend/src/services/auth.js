import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { normalizeRole } from '../utils/roleMapping';
import { authHelpers } from '../utils/authHelpers';

export const authService = {
    /**
   * Login user and store token
   */
    async login(login, password = '') {
        const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, {
            login,
            password: password || '', // Send empty string if no password (for NISN login)
        });

        const { token, user } = response.data;
        if (user && user.role) {
            user.role = normalizeRole(user.role);
        }

        // Store token and user data
        authHelpers.setToken(token);
        if (user.role) authHelpers.setRole(user.role);
        authHelpers.setUserData(user);

        return { token, user };
    },

    /**
     * Logout user and clear token
     */
    async logout() {
        try {
            await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local data
            authHelpers.clearAuth();
            sessionStorage.clear();
        }
    },

    /**
     * Get current user data
     */
    async getMe() {
        const response = await apiClient.get(API_ENDPOINTS.ME);
        if (response.data.role) {
            response.data.role = normalizeRole(response.data.role);
        }
        return response.data;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return authHelpers.isAuthenticated();
    },
};
