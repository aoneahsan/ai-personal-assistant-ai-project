import { CONSOLE_MESSAGES } from '@/utils/constants/generic';
import { Preferences } from '@capacitor/preferences';
import { USER_LOCALSTORAGE_KEY } from '@perkforce/tool-kit';
import { aesDecrypt, aesEncrypt } from '../encryptDecrypt';

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
