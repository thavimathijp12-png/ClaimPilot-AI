export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`cp_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading from localStorage key "${key}":`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`cp_${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`Error writing to localStorage key "${key}":`, e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`cp_${key}`);
    } catch (e) {
      console.warn(`Error removing localStorage key "${key}":`, e);
    }
  },

  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('cp_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Error clearing ClaimPilot storage:', e);
    }
  }
};

