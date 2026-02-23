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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); 
    throw new Error(errorData.message || 'API request failed');
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text);
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
