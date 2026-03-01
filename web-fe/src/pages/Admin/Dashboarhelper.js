// dashboardHelper.js
// Utility untuk trigger update dashboard

export const triggerDashboardUpdate = () => {
  // Dispatch custom event untuk update dashboard
  const event = new Event('dashboardUpdate');
  window.dispatchEvent(event);
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Trigger dashboard update setelah save
    triggerDashboardUpdate();
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const getFromLocalStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const initializeData = (key, defaultData) => {
  const existing = localStorage.getItem(key);
  if (!existing) {
    saveToLocalStorage(key, defaultData);
  }
  return getFromLocalStorage(key, defaultData);
};