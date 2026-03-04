export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getUser = () => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveAuth = ({ token, user }) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem('userRole', user?.role || '');
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem('userRole');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const getDashboardByRole = (role) => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'admin') return '/admin/dashboard';
  if (normalized === 'waka') return '/waka/dashboard';
  if (normalized === 'guru') return '/guru/dashboard';
  if (normalized === 'wakel') return '/walikelas/dashboard';
  if (normalized === 'pengurus_kelas') return '/pengurus-kelas/dashboard';
  if (normalized === 'siswa') return '/siswa/dashboard';
  return '/';
};

export const normalizeRoleByParam = (urlRole) => {
  const map = {
    admin: 'admin',
    waka: 'waka',
    guru: 'guru',
    'wali-kelas': 'wakel',
    'peserta-didik': 'siswa',
    'pengurus-kelas': 'pengurus_kelas',
  };
  return map[urlRole] || null;
};
