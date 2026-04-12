const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
export const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';

type ApiFieldErrors = Record<string, string[]>;

const normalizeFieldErrors = (errors: unknown): ApiFieldErrors => {
  if (!errors || typeof errors !== 'object') return {};

  const mapped: ApiFieldErrors = {};
  Object.entries(errors as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      mapped[key] = value.map((item) => String(item));
      return;
    }
    if (value !== undefined && value !== null) {
      mapped[key] = [String(value)];
    }
  });
  return mapped;
};

const flattenFieldErrors = (fieldErrors: ApiFieldErrors): string[] =>
  Object.values(fieldErrors).flat().filter(Boolean);

const getSanitizedToken = (): string | null => {
  const raw = localStorage.getItem('token');
  if (!raw) return null;
  const token = raw.trim();
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
};

export const getHeaders = () => {
  const token = getSanitizedToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
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

  // Handle 503 Service Unavailable (Maintenance)
  if (response.status === 503) {
    window.dispatchEvent(new CustomEvent('server-maintenance'));
    throw new Error('Sistem sedang dalam perbaikan (Maintenance). Silakan coba lagi nanti.');
  }

  // Handle 500 Internal Server Error
  if (response.status >= 500) {
    window.dispatchEvent(new CustomEvent('server-error'));
    throw new Error('Terjadi kesalahan pada server. Tim kami sedang menanganinya.');
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
    const fieldErrors = normalizeFieldErrors(data?.errors);
    const flattenedFieldErrors = flattenFieldErrors(fieldErrors);
    const message = flattenedFieldErrors[0] || data?.message || text || 'API request failed';
    const error = new Error(message) as Error & {
      data?: any;
      status?: number;
      fieldErrors?: ApiFieldErrors;
      validationMessages?: string[];
    };
    error.data = data || { raw: text };
    error.status = response.status;
    error.fieldErrors = fieldErrors;
    error.validationMessages = flattenedFieldErrors;
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
