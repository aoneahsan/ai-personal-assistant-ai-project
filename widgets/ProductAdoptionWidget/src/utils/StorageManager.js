/**
 * Storage manager for persisting widget state
 */

export default class StorageManager {
  constructor(config) {
    this.config = config;
    this.storageKey = config.key || 'product-adoption-widget';
    this.storageType = config.type || 'localStorage';
    this.enabled = config.enabled !== false;
  }

  /**
   * Get storage instance
   */
  getStorage() {
    if (!this.enabled) return null;

    switch (this.storageType) {
      case 'localStorage':
        return typeof localStorage !== 'undefined' ? localStorage : null;
      case 'sessionStorage':
        return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
      case 'cookie':
        return null; // Cookie storage handled separately
      default:
        return null;
    }
  }

  /**
   * Get value from storage
   * @param {string} key - Storage key
   * @returns {*} Stored value
   */
  get(key) {
    if (!this.enabled) return null;

    try {
      if (this.storageType === 'cookie') {
        return this.getCookie(`${this.storageKey}_${key}`);
      }

      const storage = this.getStorage();
      if (!storage) return null;

      const data = storage.getItem(this.storageKey);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return parsed[key] || null;
    } catch (error) {
      console.error('[StorageManager] Error reading from storage:', error);
      return null;
    }
  }

  /**
   * Set value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  set(key, value) {
    if (!this.enabled) return;

    try {
      if (this.storageType === 'cookie') {
        this.setCookie(`${this.storageKey}_${key}`, value);
        return;
      }

      const storage = this.getStorage();
      if (!storage) return;

      const data = storage.getItem(this.storageKey);
      const parsed = data ? JSON.parse(data) : {};
      
      parsed[key] = value;
      storage.setItem(this.storageKey, JSON.stringify(parsed));
    } catch (error) {
      console.error('[StorageManager] Error writing to storage:', error);
    }
  }

  /**
   * Remove value from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    if (!this.enabled) return;

    try {
      if (this.storageType === 'cookie') {
        this.deleteCookie(`${this.storageKey}_${key}`);
        return;
      }

      const storage = this.getStorage();
      if (!storage) return;

      const data = storage.getItem(this.storageKey);
      if (!data) return;

      const parsed = JSON.parse(data);
      delete parsed[key];
      
      if (Object.keys(parsed).length === 0) {
        storage.removeItem(this.storageKey);
      } else {
        storage.setItem(this.storageKey, JSON.stringify(parsed));
      }
    } catch (error) {
      console.error('[StorageManager] Error removing from storage:', error);
    }
  }

  /**
   * Clear all storage
   */
  clear() {
    if (!this.enabled) return;

    try {
      if (this.storageType === 'cookie') {
        // Clear all widget cookies
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.startsWith(this.storageKey)) {
            this.deleteCookie(name);
          }
        });
        return;
      }

      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('[StorageManager] Error clearing storage:', error);
    }
  }

  /**
   * Get cookie value
   * @param {string} name - Cookie name
   * @returns {*} Cookie value
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      try {
        return JSON.parse(decodeURIComponent(cookieValue));
      } catch {
        return cookieValue;
      }
    }
    
    return null;
  }

  /**
   * Set cookie value
   * @param {string} name - Cookie name
   * @param {*} value - Cookie value
   * @param {number} days - Days until expiration
   */
  setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const expires = `expires=${date.toUTCString()}`;
    const cookieValue = typeof value === 'object' ? JSON.stringify(value) : value;
    
    document.cookie = `${name}=${encodeURIComponent(cookieValue)};${expires};path=/;SameSite=Lax`;
  }

  /**
   * Delete cookie
   * @param {string} name - Cookie name
   */
  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}