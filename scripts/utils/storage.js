/**
 * Safe localStorage wrapper with error handling
 */
export class SafeStorage {
  static get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.warn(`[Storage] Failed to read "${key}":`, error.message);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('[Storage] Quota exceeded, clearing old data');
        this.clearOldData();
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          console.error('[Storage] Failed after clearing:', error);
          return false;
        }
      }
      console.error(`[Storage] Failed to write "${key}":`, error.message);
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  static clearOldData() {
    const keysToKeep = ['admin-panel-theme', 'admin-panel-privacy'];
    try {
      Object.keys(localStorage)
        .filter(k => !keysToKeep.includes(k))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  }
}
