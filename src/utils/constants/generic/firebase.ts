export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

export const PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS = 'pca'; // Personal Chat Assistant
export const PROJECT_PREFIX_FOR_DB_ANALYTICS_DATA = 'pca'; // Personal Chat Assistant

// Configuration validation
export const isFirebaseConfigured = (): boolean => {
  return !!(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.authDomain &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.appId
  );
};

export const isGoogleAuthConfigured = (): boolean => {
  return !!import.meta.env.VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID;
};

export const getFirebaseConfigStatus = () => {
  const missing = [];

  if (!FIREBASE_CONFIG.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!FIREBASE_CONFIG.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!FIREBASE_CONFIG.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!FIREBASE_CONFIG.storageBucket)
    missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!FIREBASE_CONFIG.messagingSenderId)
    missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!FIREBASE_CONFIG.appId) missing.push('VITE_FIREBASE_APP_ID');

  if (!import.meta.env.VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID) {
    missing.push('VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID');
  }

  return {
    isConfigured: missing.length === 0,
    missingKeys: missing,
    message:
      missing.length > 0
        ? `Missing environment variables: ${missing.join(', ')}`
        : 'All Firebase configuration is set up correctly',
  };
};
