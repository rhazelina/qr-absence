import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';
import type { ApiError } from '../types/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = storage.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<ApiError>) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            storage.clearAll();

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data);
        }

        // Handle 422 Validation Error
        if (error.response?.status === 422) {
            console.error('Validation error:', error.response.data);
        }

        // Handle 500 Server Error
        if (error.response?.status === 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        // Check for validation errors
        if (axiosError.response?.data?.errors) {
            const errors = axiosError.response.data.errors;
            const firstError = Object.values(errors)[0];
            return Array.isArray(firstError) ? firstError[0] : 'Validation error';
        }

        // Check for message in response
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        // Network error
        if (axiosError.message === 'Network Error') {
            return 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.';
        }

        // Generic axios error
        return axiosError.message || 'Terjadi kesalahan';
    }

    // Generic error
    if (error instanceof Error) {
        return error.message;
    }

    return 'Terjadi kesalahan yang tidak diketahui';
};

export default apiClient;
