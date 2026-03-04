// Legacy placeholder: local storage attendance manager has been removed.
// Attendance data must be read/write through backend API.

const removed = () => {
  throw new Error('dataManager telah dihapus. Gunakan endpoint backend melalui utils/api.js.');
};

export const getAbsensiHistory = removed;
export const saveAbsensi = removed;
export const getAbsensiByJadwal = removed;
export const generateSiswaList = removed;
export const getAbsensiSummary = removed;
export const isJadwalCompleted = removed;
export const getSiswaByKelas = removed;
export const resetAllData = removed;
export const exportData = removed;
export const importData = removed;
export const getOverallStatistics = removed;

export default {
  getAbsensiHistory,
  saveAbsensi,
  getAbsensiByJadwal,
  generateSiswaList,
  getAbsensiSummary,
  isJadwalCompleted,
  getSiswaByKelas,
  resetAllData,
  exportData,
  importData,
  getOverallStatistics,
};
