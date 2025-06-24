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
