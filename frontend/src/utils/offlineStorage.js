const OFFLINE_ATTENDANCE_KEY = 'offline_attendance_queue';
const OFFLINE_SETTINGS_KEY = 'offline_settings';

export const offlineStorage = {
  /**
   * Add attendance record to offline queue
   */
  addToQueue: (attendanceData) => {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || '[]');
      queue.push({
        ...attendanceData,
        queuedAt: new Date().toISOString(),
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(queue));
      return { success: true, queueLength: queue.length };
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all queued attendance records
   */
  getQueue: () => {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || '[]');
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  },

  /**
   * Remove item from queue after successful sync
   */
  removeFromQueue: (itemId) => {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || '[]');
      const filteredQueue = queue.filter(item => item.id !== itemId);
      localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(filteredQueue));
      return { success: true, remainingCount: filteredQueue.length };
    } catch (error) {
      console.error('Failed to remove from offline queue:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear all queued items
   */
  clearQueue: () => {
    localStorage.removeItem(OFFLINE_ATTENDANCE_KEY);
    return { success: true };
  },

  /**
   * Get queue count
   */
  getQueueCount: () => {
    const queue = offlineStorage.getQueue();
    return queue.length;
  },

  /**
   * Check if device is online
   */
  isOnline: () => {
    return navigator.onLine;
  },

  /**
   * Sync all queued items to server
   */
  syncQueue: async (apiService) => {
    if (!navigator.onLine) {
      return { success: false, message: 'Offline - cannot sync' };
    }

    const queue = offlineStorage.getQueue();
    if (queue.length === 0) {
      return { success: true, message: 'No items to sync', synced: 0 };
    }

    const results = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };

    for (const item of queue) {
      try {
        await apiService.submitBulkAttendance(item.data);
        offlineStorage.removeFromQueue(item.id);
        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push({ id: item.id, error: error.message });
        results.success = false;
      }
    }

    return results;
  },

  /**
   * Save pending user settings offline
   */
  saveSettings: (settings) => {
    try {
      localStorage.setItem(OFFLINE_SETTINGS_KEY, JSON.stringify({
        ...settings,
        savedAt: new Date().toISOString()
      }));
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings offline:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get offline settings
   */
  getSettings: () => {
    try {
      return JSON.parse(localStorage.getItem(OFFLINE_SETTINGS_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }
};

// Auto-sync when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online - ready to sync');
    window.dispatchEvent(new CustomEvent('appOnline'));
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline');
    window.dispatchEvent(new CustomEvent('appOffline'));
  });
}

export default offlineStorage;
