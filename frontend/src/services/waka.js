import apiClient from './api';

export const wakaService = {
  getDashboardSummary: async () => {
    const response = await apiClient.get('/dashboard/waka');
    return response.data;
  }
};

export default wakaService;
