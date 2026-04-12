import { API_BASE_URL } from './apiConfig';
import { clearAuth, getToken } from './auth';

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const q = query.toString();
  return q ? `?${q}` : '';
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const request = async (path, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }

    const validationErrors = data?.errors || null;
    let validationMessage = null;
    if (validationErrors && typeof validationErrors === 'object') {
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey) {
        const firstError = validationErrors[firstKey];
        validationMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      }
    }
    const message =
      data?.message ||
      validationMessage ||
      (validationErrors ? 'Validasi gagal' : `HTTP ${response.status}`);

    throw new ApiError(message, response.status, data);
  }

  return data;
};

const api = {
  request,
  get: (path, params) => request(`${path}${buildQuery(params)}`),
  post: (path, body) => request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError, buildQuery };
export default api;
