export const ROLE_MAPPING = {
  'Peserta Didik': 'Siswa',
  'Guru': 'Guru',
  'Wali Kelas': 'WaliKelas',
  'Admin': 'Admin',
  'Waka': 'WakaStaff',
  'Staff': 'WakaStaff',
  'Kepala Sekolah': 'KepalaSekolah'
};

export const normalizeRole = (backendRole) => {
  if (!backendRole) return '';
  return ROLE_MAPPING[backendRole] || backendRole;
};
