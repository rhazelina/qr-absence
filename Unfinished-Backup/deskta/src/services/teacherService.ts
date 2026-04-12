import { API_BASE_URL, getHeaders, handleResponse } from './api';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  code?: string;
  nama_guru?: string; // For compatibility
  kode_guru?: string; // For compatibility
  subject?: string | string[];
  jabatan?: string[];
  subject_name?: string;
  role?: string;
  waka_field?: string;
  major_expertise?: string;
  email?: string;
  phone?: string;
  contact?: string;
  photo_url?: string;
  schedule_image_path?: string;
  schedule_image_url?: string;
  classes_count?: number;
  homeroom_class_id?: number | null;
  homeroom_class?: {
    id: number;
    name: string;
    grade: string;
    major: string;
    major_name: string;
  };
  konsentrasi_keahlian?: string;
}

const buildQuery = (params?: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();
  if (!params) return searchParams.toString();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

const extractPageData = (payload: any): any[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const teacherService = {
  getTeachers: async (params?: any) => {
    const wantsAll = params?.per_page === -1 || params?.all === true;
    if (!wantsAll) {
      const query = buildQuery(params || {});
      const response = await fetch(`${API_BASE_URL}/teachers${query ? `?${query}` : ''}`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    }

    const baseParams = { ...(params || {}) };
    delete (baseParams as any).all;
    const perPage = typeof baseParams.per_page === 'number' && baseParams.per_page > 0
      ? baseParams.per_page
      : 1000;
    baseParams.per_page = perPage;
    baseParams.page = 1;

    const firstQuery = buildQuery(baseParams);
    const firstResponse = await fetch(`${API_BASE_URL}/teachers?${firstQuery}`, {
      headers: getHeaders()
    });
    const firstPayload = await handleResponse(firstResponse);
    const merged = extractPageData(firstPayload);

    const meta = firstPayload?.meta || {};
    const lastPage = typeof meta?.last_page === 'number' ? meta.last_page : 1;

    if (lastPage > 1) {
      for (let page = 2; page <= lastPage; page += 1) {
        const pageQuery = buildQuery({ ...baseParams, page });
        const pageResponse = await fetch(`${API_BASE_URL}/teachers?${pageQuery}`, {
          headers: getHeaders()
        });
        const pagePayload = await handleResponse(pageResponse);
        merged.push(...extractPageData(pagePayload));
      }
    }

    return {
      ...firstPayload,
      data: merged,
      meta: {
        ...meta,
        current_page: 1,
        per_page: perPage,
        last_page: lastPage,
        total: typeof meta?.total === 'number' ? meta.total : merged.length,
      },
    };
  },

  getTeacherById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  createTeacher: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateTeacher: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'PUT', // or PATCH
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteTeacher: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  importTeachers: async (items: any[]) => {
    const response = await fetch(`${API_BASE_URL}/import/guru`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items })
    });
    return handleResponse(response);
  },
  
  importTeachersFile: async (formData: FormData) => {
    // Note: If using FormData for file upload, don't set Content-Type header manually
    const headers = getHeaders();
    delete (headers as any)['Content-Type'];
    
    const response = await fetch(`${API_BASE_URL}/import/guru`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData
    });
    return handleResponse(response);
  },

  uploadScheduleImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = getHeaders() as any;
    delete headers['Content-Type']; // Let browser set multipart boundary

    const response = await fetch(`${API_BASE_URL}/teachers/${id}/schedule-image`, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData
    });
    return handleResponse(response);
  }
};
