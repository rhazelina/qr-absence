import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 detik timeout agar tidak hanging
});

// Request interceptor - add token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
import eventBus from '../utils/eventBus';

// Response interceptor - handle global errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            
            // 401 Unauthorized - handled by specific logic, but can also show alert if needed
            if (status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_data');
                
                if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/login')) {
                    window.location.href = '/';
                }
                return Promise.reject(error);
            }

            // 403 Forbidden - Access Denied
            if (status === 403) {
                eventBus.dispatch('SHOW_ALERT', {
                    type: 'warning',
                    title: 'Akses Ditolak',
                    message: data.message || 'Anda tidak memiliki izin untuk mengakses halaman ini.'
                });
            }

            // 422 Validation Error - usually handled by form, but can show generic alert if needed
            // OR strictly for complex forms we might not want a global alert, but for general actions we might.
            // Let's only show if it contains a 'message' field that is generic.
            // (Skipping 422 global alert for now to avoid duplicate alerts on forms)

            // 500 Server Error
            if (status >= 500) {
                eventBus.dispatch('SHOW_ALERT', {
                    type: 'warning',
                    title: 'Kesalahan Server',
                    message: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.'
                });
            }
            
            // Network Error (no response)
        } else if (error.request) {
             eventBus.dispatch('SHOW_ALERT', {
                type: 'warning',
                title: 'Koneksi Terputus',
                message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
            });
        }

        return Promise.reject(error);
    }
);

// QR Code API Functions
export const generateQRCode = async (scheduleId, duration = 30, options = {}) => {
    const response = await apiClient.post('qrcodes/generate', {
        schedule_id: scheduleId,
        duration: duration
    }, options);
    return response.data;
};

export const scanQRCode = async (token, options = {}) => {
    const response = await apiClient.post('attendance/scan', {
        token: token // Backend refactored to expect 'token'
    }, options);
    return response.data;
};

export const getActiveQRCodes = async (options = {}) => {
    const response = await apiClient.get('qrcodes/active', options);
    return response.data;
};

export default apiClient;