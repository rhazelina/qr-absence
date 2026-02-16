import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

/**
 * Hook untuk fetch data (GET)
 * @param {string} key - Unique key untuk cache (misal: 'students')
 * @param {string} url - Endpoint API (misal: '/students')
 * @param {object} params - Query params (opsional)
 * @param {object} options - Opsi tambahan React Query
 */
export const useFetchData = (key, url, params = {}, options = {}) => {
  return useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      const { data } = await apiClient.get(url, { params });
      return data;
    },
    keepPreviousData: true, // Data lama tetap tampil saat fetching baru (sat set!)
    ...options,
  });
};

/**
 * Hook untuk mutasi data (POST, PUT, DELETE)
 * @param {string} key - Key cache yang akan di-invalidate setelah sukses (misal: 'students')
 */
export const useMutationData = ({ method = 'post', url, key, onSuccess }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      // Handle dynamic URL if it's a function (e.g. for DELETE with ID)
      const finalUrl = typeof url === 'function' ? url(payload) : url;
      const { data } = await apiClient[method](finalUrl, payload);
      return data;
    },
    onSuccess: (data) => {
      if (key) {
        queryClient.invalidateQueries([key]); // Refresh data otomatis
      }
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};
