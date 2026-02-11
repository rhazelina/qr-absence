import { TOKEN_KEY } from './constants';
import type { User } from '../types/api';

const ROLE_KEY = 'user_role';
const USER_DATA_KEY = 'user_data';
const SELECTED_ROLE_KEY = 'selectedRole';

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),

  getRole: (): string | null => localStorage.getItem(ROLE_KEY),
  setRole: (role: string): void => localStorage.setItem(ROLE_KEY, role),
  removeRole: (): void => localStorage.removeItem(ROLE_KEY),

  getUserData: (): User | null => {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      return null;
    }
  },
  setUserData: (user: User): void => localStorage.setItem(USER_DATA_KEY, JSON.stringify(user)),
  removeUserData: (): void => localStorage.removeItem(USER_DATA_KEY),

  getSelectedRole: (): string | null => localStorage.getItem(SELECTED_ROLE_KEY),
  setSelectedRole: (role: string): void => localStorage.setItem(SELECTED_ROLE_KEY, role),
  removeSelectedRole: (): void => localStorage.removeItem(SELECTED_ROLE_KEY),

  clearAll: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(SELECTED_ROLE_KEY);
  }
};
