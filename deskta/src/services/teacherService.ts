import { API_BASE_URL, getHeaders, handleResponse } from './api';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  code?: string;
  nama_guru?: string; // For compatibility
  kode_guru?: string; // For compatibility
  subject?: string;
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
}

export const teacherService = {
  getTeachers: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/teachers?${query}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
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
    const response = await fetch(`${API_BASE_URL}/teachers/import`, {
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
    
    const response = await fetch(`${API_BASE_URL}/teachers/import`, {
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
