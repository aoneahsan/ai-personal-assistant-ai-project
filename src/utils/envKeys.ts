const _env = import.meta.env;

const NODE_ENV = _env.MODE.toString().toLowerCase();

const ENV_KEYS = {
  NODE_ENV, // NODE_ENV
  isProduction: _env.PROD, // a simple check to see if app is running in production mode
  googleMapsApiKey: _env.VITE_GOOGLE_MAPS_API_KEY,
  encryptSalt: _env.VITE_ENCRYPT_SALT,
  sentryEnvironment: _env.VITE_SENTRY_ENVIRONMENT,
  sentryDsn: _env.VITE_SENTRY_DSN,
  oneSignalAppId: _env.VITE_ONE_SIGNAL_APP_ID,
  productFruitsAppId: _env.VITE_PRODUCT_FRUITS_APP_ID,
  socketIoServerUrl: _env.VITE_SOCKET_IO_SERVER_URL,
  amplitudeApiKey: _env.VITE_AMPLITUDE_API_KEY,
  tolgeeApiUrl: _env.VITE_TOLGEE_API_URL,
  tolgeeApiKey: _env.VITE_TOLGEE_API_KEY,
};

export default ENV_KEYS;
