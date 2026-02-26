             const baseURL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  window.location.href = '/login';
};

export const handleResponse = async (response: Response) => {
  // Handle 401 Unauthorized - clear tokens and redirect
  if (response.status === 401) {
    clearAuthAndRedirect();
    throw new Error('Session expired. Please login again.');
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'You do not have permission to perform this action.');
  }

  const text = await response.text();
  const tryParse = (raw: string) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  const data = tryParse(text);

  if (!response.ok) {
    const message = data?.message || text || 'API request failed';
    const error = new Error(message) as Error & {
      data?: any;
      status?: number;
    };
    error.data = data || { raw: text };
    error.status = response.status;
    throw error;
  }

  if (data !== null) {
    return data;
  }

  if (!text) {
    return null;
  }

  throw new Error('Invalid JSON response from server.');
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};
