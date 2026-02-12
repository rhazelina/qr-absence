import apiClient from './api';

export interface SchoolSettings {
  school_name: string;
  school_logo: string | null;
  school_mascot: string | null;
  school_logo_url: string | null;
  school_mascot_url: string | null;
  school_type?: string;
  school_address?: string;
  school_email?: string;
  school_phone?: string;
  school_npsn?: string;
  school_accreditation?: string;
  school_headmaster?: string;
  school_headmaster_nip?: string;
  school_start_time?: string;
  school_end_time?: string;
}

export const settingService = {
  /**
   * Get public school settings for Landing Page
   */
  getPublicSettings: async (): Promise<SchoolSettings> => {
    // Import dynamically or use hardcoded string if circular dependency is an issue
    // Using string for safety as constants.ts is simple
    const response = await apiClient.get('/api/settings/public');
    return response.data;
  },

  /**
   * Get all school settings (requires admin)
   */
  getAllSettings: async (): Promise<Record<string, any>> => {
    const response = await apiClient.get('/api/settings');
    return response.data;
  },

  /**
   * Update school settings (requires admin)
   */
  updateSettings: async (data: FormData | Record<string, any>): Promise<any> => {
    // If data is Record, convert to form data if it contains files or use JSON
    const response = await apiClient.post('/api/settings', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Bulk update school settings (requires admin)
   */
  bulkUpdateSettings: async (settings: Record<string, any>): Promise<any> => {
    const response = await apiClient.post('/api/settings/bulk', { settings });
    return response.data;
  },
};

export default settingService;
