/**
 * Central API utility for Deskta-UI
 * Mirrors the pattern in Website-UI/src/utils/api.js
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

/** localStorage keys — must match Website-UI keys for token interoperability */
const TOKEN_KEY = 'token';
const USER_DATA_KEY = 'userData';
const USER_ROLE_KEY = 'userRole';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getUserData = (): Record<string, unknown> | null => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
};

export const getUserRole = (): string | null => localStorage.getItem(USER_ROLE_KEY);

export const setAuthData = (token: string, user: Record<string, unknown>, role: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    localStorage.setItem(USER_ROLE_KEY, role);
};

export const clearAuthData = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    // Clear legacy keys
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
};

/**
 * Core fetch wrapper with auth header and error handling.
 * On 401 the auth data is cleared and user is redirected to root.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<unknown> => {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearAuthData();
        window.location.href = '/';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const api = {
    get: (endpoint: string) => apiFetch(endpoint),
    post: (endpoint: string, data: unknown) =>
        apiFetch(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint: string, data: unknown) =>
        apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    patch: (endpoint: string, data: unknown) =>
        apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
};

export { BASE_URL };
export default api;
