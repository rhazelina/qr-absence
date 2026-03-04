import { API_BASE_URL, fetchWithAuth, getHeaders, handleResponse } from './api';


const classService = {
  getMyClass: async () => {
    const payload = await fetchWithAuth(`${API_BASE_URL}/me/class`, {
      method: "GET",
    });
    return payload?.data || payload;
  },

  uploadScheduleImage: async (classId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers = getHeaders() as Record<string, string>;
    delete headers["Content-Type"];

    const response = await fetch(`${API_BASE_URL}/classes/${classId}/schedule-image`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse(response);
  },

  getScheduleImage: async (classId: string) => {
    // Return the URL directly since it's an image resource
    // But we might need auth token? Use fetch to get blob and create object URL
    const response = await fetch(`${API_BASE_URL}/classes/${classId}/schedule-image`, {
      method: "GET",
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error("Failed to load image");
    }

    // For images, we return the blob
    return response.blob();
  },

  deleteScheduleImage: async (classId: string) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/classes/${classId}/schedule-image`, {
      method: "DELETE",
    });
    return response;
  },

  getMyClassSchedules: async () => {
    return fetchWithAuth(`${API_BASE_URL}/me/class/schedules`, {
      method: "GET",
    });
  },

  getMyClassAttendance: async (params?: any) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== '')
        .reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
    ).toString();
    return fetchWithAuth(`${API_BASE_URL}/me/class/attendance${query ? `?${query}` : ''}`, {
      method: "GET",
    });
  },

  getMyClassStudents: async () => {
    return fetchWithAuth(`${API_BASE_URL}/me/class/students`, {
      method: "GET",
    });
  }
};

export default classService;
