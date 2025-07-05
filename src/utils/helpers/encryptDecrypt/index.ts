import ENV_KEYS from '@/utils/envKeys';
import CryptoJS from 'crypto-js';

export const aesEncrypt = (data: string | object | number | boolean) => {
  const salt = ENV_KEYS.encryptSalt;
  return CryptoJS.AES.encrypt(JSON.stringify(data), salt)?.toString();
};

export const aesDecrypt = (
  data: string
): object | string | number | boolean | null => {
  try {
    const salt = ENV_KEYS.encryptSalt;
    const bytes = CryptoJS.AES.decrypt(data, salt);
    return JSON.parse(bytes?.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

// Encrypt function
export const encrypt = (text: string, key: string): string => {
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return encrypted;
};

// Decrypt function
export const decrypt = (encryptedText: string, key: string): string => {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key).toString(
    CryptoJS.enc.Utf8
  );
  return decrypted;
};

// Hash function
export const hash = (text: string): string => {
  try {
    const hashed = CryptoJS.SHA256(text).toString();
    return hashed;
  } catch {
    // Return fallback hash if error occurs
    return '';
  }
};
