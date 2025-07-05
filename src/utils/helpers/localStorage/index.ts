import { CONSOLE_MESSAGES } from '@/utils/constants/generic';
import { aesDecrypt, aesEncrypt } from '@/utils/helpers/encryptDecrypt';
import { Preferences } from '@capacitor/preferences';
import { USER_LOCALSTORAGE_KEY } from '@perkforce/tool-kit';

export const STORAGE = {
  GET: async (key: string) => {
    return (await Preferences.get({ key }))?.value ?? null;
  },
  SET: async (key: string, value: string) => {
    return await Preferences.set({ key, value });
  },
  REMOVE: async (key: string) => {
    return await Preferences.remove({ key });
  },
  CLEAR: async () => {
    return await Preferences.clear();
  },
};

// Storage keys for user settings
export const USER_SETTINGS_KEYS = {
  USER_PROFILE: 'user_profile_data',
  THEME_SETTINGS: 'theme_settings',
  APP_PREFERENCES: 'app_preferences',
};

export const setLocalStorageUser = async (data: any) => {
  try {
    await STORAGE.SET(USER_LOCALSTORAGE_KEY, aesEncrypt(data));
  } catch (_) {}
};

export const getLocalStorageUser = async () => {
  try {
    const user = (await STORAGE.GET(USER_LOCALSTORAGE_KEY)) || {};
    return aesDecrypt(user);
  } catch (_) {
    return null;
  }
};

// User Profile Data Storage
export const saveUserProfileData = async (data: any): Promise<void> => {
  try {
    await STORAGE.SET(USER_SETTINGS_KEYS.USER_PROFILE, JSON.stringify(data));
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR.SAVING_USER_PROFILE, error);
  }
};

export const getUserProfileData = async (): Promise<any | null> => {
  try {
    const profileData = await STORAGE.GET(USER_SETTINGS_KEYS.USER_PROFILE);
    return profileData ? JSON.parse(profileData) : null;
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR.RETRIEVING_USER_PROFILE, error);
    return null;
  }
};

// Theme Settings Storage
export const saveThemeSettings = async (themeName: string): Promise<void> => {
  try {
    await STORAGE.SET(USER_SETTINGS_KEYS.THEME_SETTINGS, themeName);
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR.SAVING_THEME, error);
  }
};

export const getThemeSettings = async (): Promise<any | null> => {
  try {
    return await STORAGE.GET(USER_SETTINGS_KEYS.THEME_SETTINGS);
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR.RETRIEVING_THEME, error);
    return null;
  }
};

// App Preferences Storage
export const saveAppPreferences = async (preferences: any): Promise<void> => {
  try {
    await STORAGE.SET(
      USER_SETTINGS_KEYS.APP_PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR.SAVING_PREFERENCES, error);
  }
};

export const getAppPreferences = async (): Promise<any | null> => {
  try {
    const preferences = await STORAGE.GET(USER_SETTINGS_KEYS.APP_PREFERENCES);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR.RETRIEVING_PREFERENCES, error);
    return null;
  }
};

export const setLocalStorage = (
  key: string,
  value: string | object | number | boolean
) => {
  try {
    const encryptedValue = aesEncrypt(value);
    localStorage.setItem(key, encryptedValue);
  } catch {
    // Silently fail if encryption or storage fails
  }
};

export const getLocalStorage = (
  key: string
): string | object | number | boolean | null => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return aesDecrypt(value);
  } catch {
    return null;
  }
};

export const removeLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail if removal fails
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch {
    // Silently fail if clearing fails
  }
};

// Generic get function with type safety
export const getTypedLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return defaultValue;
    const decrypted = aesDecrypt(value);
    return decrypted as T;
  } catch {
    return defaultValue;
  }
};

// Check if localStorage is available
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, 'test');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Get all keys from localStorage
export const getAllLocalStorageKeys = (): string[] => {
  try {
    return Object.keys(localStorage);
  } catch {
    return [];
  }
};

// Get localStorage size
export const getLocalStorageSize = (): number => {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch {
    return 0;
  }
};

// Batch operations
export const setMultipleLocalStorage = (
  items: Record<string, string | object | number | boolean>
) => {
  try {
    Object.entries(items).forEach(([key, value]) => {
      setLocalStorage(key, value);
    });
  } catch {
    // Silently fail if batch setting fails
  }
};

export const getMultipleLocalStorage = (
  keys: string[]
): Record<string, string | object | number | boolean | null> => {
  try {
    const result: Record<string, string | object | number | boolean | null> =
      {};
    keys.forEach((key) => {
      result[key] = getLocalStorage(key);
    });
    return result;
  } catch {
    return {};
  }
};
