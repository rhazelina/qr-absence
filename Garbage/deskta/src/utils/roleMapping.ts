export const ROLE_MAPPING: Record<string, string> = {
  'Peserta Didik': 'siswa',
  'siswa': 'siswa',
  'Guru': 'guru',
  'guru': 'guru',
  'Wali Kelas': 'wakel',
  'wakel': 'wakel',
  'Admin': 'admin',
  'admin': 'admin',
  'Waka': 'waka',
  'waka': 'waka',
  'Staff': 'waka',
  'Kepala Sekolah': 'kepala_sekolah'
};

export const normalizeRole = (backendRole: string): string => {
  if (!backendRole) return '';
  // Check direct match or case-insensitive match if needed, but here we add lowercase keys
  return ROLE_MAPPING[backendRole] || backendRole;
};
