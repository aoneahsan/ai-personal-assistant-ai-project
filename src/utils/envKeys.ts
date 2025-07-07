const _env = import.meta.env;

const NODE_ENV = _env.MODE.toString().toLowerCase();

const ENV_KEYS = {
  NODE_ENV, // NODE_ENV
  isProduction: _env.PROD, // a simple check to see if app is running in production mode
  
  // Google Services
  googleMapsApiKey: _env.VITE_GOOGLE_MAPS_API_KEY,
  googleMobileAuthClientId: _env.VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID,
  googleAuthIosAppClientId: _env.VITE_GOOGLE_AUTH_IOS_APP_CLIENT_ID,
  
  // Firebase Configuration
  firebaseApiKey: _env.VITE_FIREBASE_API_KEY,
  firebaseAuthDomain: _env.VITE_FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: _env.VITE_FIREBASE_PROJECT_ID,
  firebaseStorageBucket: _env.VITE_FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: _env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: _env.VITE_FIREBASE_APP_ID,
  firebaseMeasurementId: _env.VITE_FIREBASE_MEASUREMENT_ID,
  firebaseDatabaseUrl: _env.VITE_FIREBASE_DATABASE_URL,
  
  // Security & Encryption
  encryptSalt: _env.VITE_ENCRYPT_SALT,
  
  // Error Tracking
  sentryEnvironment: _env.VITE_SENTRY_ENVIRONMENT,
  sentryDsn: _env.VITE_SENTRY_DSN,
  
  // Push Notifications
  oneSignalAppId: _env.VITE_ONE_SIGNAL_APP_ID,
  
  // User Feedback & Support
  productFruitsAppId: _env.VITE_PRODUCT_FRUITS_APP_ID,
  
  // Real-time Communication
  socketIoServerUrl: _env.VITE_SOCKET_IO_SERVER_URL,
  
  // Analytics
  amplitudeApiKey: _env.VITE_AMPLITUDE_API_KEY,
  
  // Internationalization
  tolgeeApiUrl: _env.VITE_TOLGEE_API_URL,
  tolgeeApiKey: _env.VITE_TOLGEE_API_KEY,
  
  // Development Tools
  tanstackRouterDevtools: _env.VITE_TANSTACK_ROUTER_DEVTOOLS === 'true',
};

export default ENV_KEYS;
