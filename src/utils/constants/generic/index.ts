// Add constants here which do not need import value from any other file, that means generic constants, self sufficient constants

export const APP_BUNDLE_ID = 'com.zaions.aipersonalassistant';

// Export all constants for easy importing
export * from './api';
export * from './auth';
export * from './fileTypes';
export * from './firebase';
export * from './labels';
export * from './messages';
export * from './numbers';
export * from './ui';

// Export configs with selective imports to avoid conflicts
export {
  API_CONFIGS,
  COMPONENT_CONFIGS,
  DEFAULT_VALUES as CONFIG_DEFAULT_VALUES,
  PERFORMANCE_CONFIGS,
  SECURITY_CONFIGS,
} from './configs';

// Export styles with selective imports to avoid conflicts
export {
  COMMON_PATTERNS,
  COMPONENT_STYLES,
  CSS_CLASSES as STYLE_CLASSES,
} from './styles';
