import { API_BASE_URL, fetchWithAuth, getHeaders, handleResponse } from './api';

export interface PublicSettings {
  school_name: string;
  school_logo: string | null;
  school_mascot: string | null;
  school_type: string | null;
  school_address: string | null;
  school_email: string | null;
  school_phone: string | null;
  school_npsn: string | null;
  school_accreditation: string | null;
  school_logo_url: string | null;
  school_mascot_url: string | null;
  school_principal_name: string | null;
  school_principal_nip: string | null;
  postal_code: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
}

export interface SyncSettingsResponse {
  school_year?: unknown;
  semester?: unknown;
  settings?: Record<string, string | null>;
}

export const settingService = {
  getPublicSettings: async (): Promise<PublicSettings> => {
    const response = await fetch(`${API_BASE_URL}/settings/public`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    return handleResponse(response);
  },

  getSettings: async (): Promise<any> => {
    return fetchWithAuth(`${API_BASE_URL}/settings`, {
      method: 'GET',
    });
  },

  getSyncSettings: async (): Promise<SyncSettingsResponse> => {
    return fetchWithAuth(`${API_BASE_URL}/settings/sync`, {
      method: 'GET',
    });
  },

  updateSettings: async (data: any): Promise<any> => {
    // If data contains files, we should use FormData
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const headers = getHeaders() as Record<string, string>;
    delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(response);
  }
};
