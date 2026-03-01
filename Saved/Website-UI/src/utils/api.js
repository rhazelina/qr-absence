// Central API utility for Website-UI
// All pages should import from here for consistent token & error handling

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Standard token key across all pages
const TOKEN_KEY = 'token';
const USER_DATA_KEY = 'userData';
const USER_ROLE_KEY = 'userRole';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUserData = () => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
};
export const getUserRole = () => localStorage.getItem(USER_ROLE_KEY);

export const setAuthData = (token, user, role) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    localStorage.setItem(USER_ROLE_KEY, role);
};

export const clearAuthData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    // Clear legacy keys too
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userIdentifier');
};

/**
 * Core fetch wrapper with auth header and error handling
 * @param {string} endpoint - API endpoint path (e.g. '/me')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

// Convenience methods
export const api = {
    request: (endpoint, options) => apiFetch(endpoint, options),
    get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, data, options = {}) =>
        apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data, options = {}) =>
        apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
    patch: (endpoint, data, options = {}) =>
        apiFetch(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }),
    delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

export { BASE_URL };
export default api;
