import apiClient from './api';
import { storage } from '../utils/storage';
import type { LoginRequest, LoginResponse, User } from '../types/api';

export const authService = {
    /**
     * Login user and store token
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>(
            '/api/auth/login', // Use string directly or import API_ENDPOINTS if needed
            credentials
        );

        const { token } = response.data;

        // Store token in storage
        this.setToken(token);

        if (response.data.user && response.data.user.role) {
            const { normalizeRole } = await import('../utils/roleMapping');
            response.data.user.role = normalizeRole(response.data.user.role);
        }

        return response.data;
    },

    /**
     * Logout user and clear token
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local data even if API call fails
            storage.clearAll();
            sessionStorage.clear();
        }
    },

    /**
     * Get current user data
     */
    async getMe(): Promise<User> {
        const response = await apiClient.get<User>('/api/me');
        
        if (response.data.role) {
            const { normalizeRole } = await import('../utils/roleMapping');
            response.data.role = normalizeRole(response.data.role);
        }
        
        return response.data;
    },

    /**
     * Get stored token
     */
    getToken(): string | null {
        return storage.getToken();
    },

    /**
     * Store token
     */
    setToken(token: string): void {
        storage.setToken(token);
    },

    /**
     * Remove token
     */
    removeToken(): void {
        storage.removeToken();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
