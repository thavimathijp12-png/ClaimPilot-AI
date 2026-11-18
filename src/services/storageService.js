export const storage = {
  get(key, defaultValue = null, validate) {
    const storageKey = `cp_${key}`;
    try {
      const item = localStorage.getItem(storageKey);
      if (item === null) return defaultValue;

      let value;
      try {
        value = JSON.parse(item);
      } catch (error) {
        console.warn(`Invalid JSON in localStorage key "${key}":`, error);
        storage.remove(key);
        return defaultValue;
      }

      const expectedType = Array.isArray(defaultValue)
        ? Array.isArray(value)
        : defaultValue && typeof defaultValue === 'object'
          ? value !== null && typeof value === 'object' && !Array.isArray(value)
          : defaultValue !== null && defaultValue !== undefined
            ? typeof value === typeof defaultValue
            : true;

      if (!expectedType || (validate && !validate(value))) {
        console.warn(`Invalid stored data for localStorage key "${key}". Restoring default data.`);
        storage.remove(key);
        return defaultValue;
      }
      return value;
    } catch (error) {
      console.warn(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new TypeError('Storage value cannot be serialized.');
      localStorage.setItem(`cp_${key}`, serialized);
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`cp_${key}`);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  },

  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('cp_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (error) {
      console.warn('Error clearing ClaimPilot storage:', error);
    }
  }
};

