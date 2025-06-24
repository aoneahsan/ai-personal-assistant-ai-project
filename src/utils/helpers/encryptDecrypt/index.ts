import ENV_KEYS from '@/utils/envKeys';
import CryptoJS from 'crypto-js';

export const aesEncrypt = (data: any) => {
  const salt = ENV_KEYS.encryptSalt;
  return CryptoJS.AES.encrypt(JSON.stringify(data), salt)?.toString();
};

export const aesDecrypt = (data: any) => {
  try {
    const salt = ENV_KEYS.encryptSalt;
    const bytes = CryptoJS.AES.decrypt(data, salt);
    return JSON.parse(bytes?.toString(CryptoJS.enc.Utf8));
  } catch (_) {
    return null;
  }
};
