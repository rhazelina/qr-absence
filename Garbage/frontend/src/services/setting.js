// import api from '../utils/api';
import api from "./api";

export const settingService = {
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  updateSettings: async (formData) => {
    try {
      // formData should be a FormData object if uploading files
      const response = await api.post('/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
