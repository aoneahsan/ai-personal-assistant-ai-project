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
export const setUserProfileData = async (data: any) => {
  try {
    await STORAGE.SET(USER_SETTINGS_KEYS.USER_PROFILE, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user profile data:', error);
  }
};

export const getUserProfileData = async () => {
  try {
    const profileData = await STORAGE.GET(USER_SETTINGS_KEYS.USER_PROFILE);
    return profileData ? JSON.parse(profileData) : null;
  } catch (error) {
    console.error('Error retrieving user profile data:', error);
    return null;
  }
};

// Theme Settings Storage
export const setThemeSettings = async (themeName: string) => {
  try {
    await STORAGE.SET(USER_SETTINGS_KEYS.THEME_SETTINGS, themeName);
  } catch (error) {
    console.error('Error saving theme settings:', error);
  }
};

export const getThemeSettings = async () => {
  try {
    return await STORAGE.GET(USER_SETTINGS_KEYS.THEME_SETTINGS);
  } catch (error) {
    console.error('Error retrieving theme settings:', error);
    return null;
  }
};

// App Preferences Storage
export const setAppPreferences = async (preferences: any) => {
  try {
    await STORAGE.SET(
      USER_SETTINGS_KEYS.APP_PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error('Error saving app preferences:', error);
  }
};

export const getAppPreferences = async () => {
  try {
    const preferences = await STORAGE.GET(USER_SETTINGS_KEYS.APP_PREFERENCES);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error retrieving app preferences:', error);
    return null;
  }
};
