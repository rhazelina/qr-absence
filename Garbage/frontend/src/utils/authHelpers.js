import { TOKEN_KEY } from './constants';

const ROLE_KEY = 'user_role';
const USER_DATA_KEY = 'user_data';

export const authHelpers = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getRole: () => localStorage.getItem(ROLE_KEY),
  setRole: (role) => localStorage.setItem(ROLE_KEY, role),
  removeRole: () => localStorage.removeItem(ROLE_KEY),

  getUserData: () => {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      return null;
    }
  },
  setUserData: (user) => localStorage.setItem(USER_DATA_KEY, JSON.stringify(user)),
  removeUserData: () => localStorage.removeItem(USER_DATA_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },
  
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY)
};
