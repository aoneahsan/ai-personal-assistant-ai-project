// Numeric constants for consistent values across the application

// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
  // Common timeouts
  TIMEOUTS: {
    VERY_SHORT: 300,
    SHORT: 500,
    MEDIUM: 1000,
    LONG: 2000,
    VERY_LONG: 3000,
    EXTRA_LONG: 5000,
  },

  // Authentication timeouts
  AUTH: {
    STATE_CHANGE_TIMEOUT: 3000,
    REDIRECT_DELAY: 500,
    LOGIN_SUCCESS_DELAY: 500,
  },

  // Toast display times
  TOAST: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
  },

  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
    TRANSITION: 300,
  },

  // Polling intervals
  POLLING: {
    FAST: 1000,
    NORMAL: 5000,
    SLOW: 10000,
    VERY_SLOW: 30000,
  },

  // Session durations
  SESSION: {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000,
  },

  // Cache durations
  CACHE: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Feedback system timings
  FEEDBACK: {
    DELAY_TRIGGER: 60 * 1000, // 1 minute
    DISMISS_HOURS: 24, // 24 hours
    THANK_YOU_DISPLAY: 3000, // 3 seconds
    RETRY_DELAY: 2000, // 2 seconds
  },
} as const;

// Dimension constants (in pixels)
export const DIMENSION_CONSTANTS = {
  // Widget dimensions
  WIDGET: {
    DEFAULT_WIDTH: 350,
    DEFAULT_HEIGHT: 500,
    MIN_WIDTH: 300,
    MIN_HEIGHT: 400,
    MAX_WIDTH: 800,
    MAX_HEIGHT: 1000,
  },

  // Modal dimensions
  MODAL: {
    SMALL_WIDTH: 400,
    MEDIUM_WIDTH: 500,
    LARGE_WIDTH: 800,
    EXTRA_LARGE_WIDTH: 1200,
    MAX_WIDTH: '90vw',
  },

  // Spacing values
  SPACING: {
    EXTRA_SMALL: 4,
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    EXTRA_LARGE: 20,
    HUGE: 24,
    MASSIVE: 30,
    GIANT: 40,
  },

  // Border radius values
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    EXTRA_LARGE: 16,
    ROUND: 50,
  },

  // Icon sizes
  ICON: {
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 24,
    EXTRA_LARGE: 32,
    HUGE: 48,
    MASSIVE: 64,
  },

  // Screen dimensions
  SCREEN: {
    DEFAULT_WIDTH: 1920,
    DEFAULT_HEIGHT: 1080,
    MOBILE_WIDTH: 375,
    MOBILE_HEIGHT: 812,
    TABLET_WIDTH: 768,
    TABLET_HEIGHT: 1024,
  },

  // Image dimensions
  IMAGE: {
    THUMBNAIL_SIZE: 150,
    PREVIEW_SIZE: 400,
    AVATAR_SIZE: 100,
    COVER_WIDTH: 1200,
    COVER_HEIGHT: 400,
  },
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  // Text length limits
  TEXT_LIMITS: {
    ROOM_NAME_LENGTH: 8,
    USER_NAME_MAX: 20,
    USER_NAME_MIN: 2,
    PASSWORD_MIN: 6,
    MESSAGE_MAX: 1000,
    FEEDBACK_MAX: 1000,
    TITLE_MAX: 100,
    DESCRIPTION_MAX: 500,
    EMAIL_MAX: 254,
    PHONE_MAX: 20,
  },

  // Numeric limits
  NUMERIC_LIMITS: {
    RETRY_ATTEMPTS: 3,
    MAX_UPLOAD_RETRIES: 5,
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_ITEMS_PER_PAGE: 100,
    DEFAULT_PAGE_SIZE: 20,
    MAX_SEARCH_RESULTS: 50,
  },

  // Percentage limits
  PERCENTAGE: {
    IMAGE_QUALITY_DEFAULT: 90,
    IMAGE_QUALITY_THUMBNAIL: 70,
    IMAGE_QUALITY_PREVIEW: 80,
    IMAGE_QUALITY_HIGH: 95,
    PROGRESS_MAX: 100,
    BATTERY_LOW: 20,
    STORAGE_WARNING: 80,
  },

  // Rating limits
  RATING: {
    MIN: 1,
    MAX: 5,
    DEFAULT: 3,
  },
} as const;

// Z-index constants
export const Z_INDEX_CONSTANTS = {
  BASE: 1,
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  OVERLAY: 1090,
  MAX: 2147483647, // Maximum safe z-index value
} as const;

// Network constants
export const NETWORK_CONSTANTS = {
  // HTTP status codes (additional to existing ones)
  STATUS_CODES: {
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    PARTIAL_CONTENT: 206,
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
  },

  // Request timeouts
  TIMEOUTS: {
    DEFAULT: 10000, // 10 seconds
    SHORT: 5000, // 5 seconds
    UPLOAD: 30000, // 30 seconds
    DOWNLOAD: 60000, // 60 seconds
    LONG_POLLING: 120000, // 2 minutes
    STREAMING: 300000, // 5 minutes
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
    MAX_DELAY: 30000,
  },
} as const;

// Business logic constants
export const BUSINESS_CONSTANTS = {
  // Subscription limits
  SUBSCRIPTION: {
    FREE_MESSAGE_LIMIT: 100,
    PRO_MESSAGE_LIMIT: 10000,
    PREMIUM_MESSAGE_LIMIT: -1, // Unlimited
    FREE_STORAGE_MB: 100,
    PRO_STORAGE_MB: 10000,
    PREMIUM_STORAGE_MB: 100000,
  },

  // Feature limits
  FEATURES: {
    MAX_EMBEDS_FREE: 1,
    MAX_EMBEDS_PRO: 10,
    MAX_EMBEDS_PREMIUM: 100,
    MAX_PARTICIPANTS_ROOM: 50,
    MAX_CHAT_HISTORY_DAYS: 365,
    MAX_FILE_UPLOADS_DAY: 100,
  },

  // Analytics constants
  ANALYTICS: {
    BATCH_SIZE: 100,
    FLUSH_INTERVAL: 30000, // 30 seconds
    MAX_EVENTS_QUEUE: 1000,
    RETENTION_DAYS: 90,
  },
} as const;

// Performance constants
export const PERFORMANCE_CONSTANTS = {
  // Virtual scrolling
  VIRTUAL_SCROLL: {
    ITEM_HEIGHT: 50,
    BUFFER_SIZE: 10,
    VIEWPORT_HEIGHT: 500,
  },

  // Lazy loading
  LAZY_LOADING: {
    INTERSECTION_THRESHOLD: 0.1,
    ROOT_MARGIN: '50px',
    DEBOUNCE_DELAY: 300,
  },

  // Chunking
  CHUNKING: {
    FILE_CHUNK_SIZE: 1024 * 1024, // 1MB
    BATCH_PROCESS_SIZE: 100,
    RENDER_BATCH_SIZE: 50,
  },
} as const;

// Math constants
export const MATH_CONSTANTS = {
  // Commonly used numbers
  ZERO: 0,
  ONE: 1,
  TWO: 2,
  TEN: 10,
  HUNDRED: 100,
  THOUSAND: 1000,
  MILLION: 1000000,

  // Byte calculations
  BYTES: {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  },

  // Percentage calculations
  PERCENTAGE: {
    FULL: 100,
    HALF: 50,
    QUARTER: 25,
    THREE_QUARTERS: 75,
  },

  // Common fractions as decimals
  FRACTIONS: {
    HALF: 0.5,
    THIRD: 0.333,
    QUARTER: 0.25,
    FIFTH: 0.2,
    TENTH: 0.1,
  },
} as const;

// Helper functions for calculations
export const calculateFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = MATH_CONSTANTS.BYTES.KB;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < TIME_CONSTANTS.SESSION.MINUTE) {
    return 'just now';
  } else if (diff < TIME_CONSTANTS.SESSION.HOUR) {
    const minutes = Math.floor(diff / TIME_CONSTANTS.SESSION.MINUTE);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < TIME_CONSTANTS.SESSION.DAY) {
    const hours = Math.floor(diff / TIME_CONSTANTS.SESSION.HOUR);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < TIME_CONSTANTS.SESSION.WEEK) {
    const days = Math.floor(diff / TIME_CONSTANTS.SESSION.DAY);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};

export const isValidPercentage = (value: number): boolean => {
  return value >= 0 && value <= MATH_CONSTANTS.PERCENTAGE.FULL;
};

export const clampValue = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Helper types
export type TimeConstant =
  (typeof TIME_CONSTANTS)[keyof typeof TIME_CONSTANTS][keyof (typeof TIME_CONSTANTS)[keyof typeof TIME_CONSTANTS]];
export type DimensionConstant =
  (typeof DIMENSION_CONSTANTS)[keyof typeof DIMENSION_CONSTANTS][keyof (typeof DIMENSION_CONSTANTS)[keyof typeof DIMENSION_CONSTANTS]];
export type ValidationConstant =
  (typeof VALIDATION_CONSTANTS)[keyof typeof VALIDATION_CONSTANTS][keyof (typeof VALIDATION_CONSTANTS)[keyof typeof VALIDATION_CONSTANTS]];
export type ZIndexConstant =
  (typeof Z_INDEX_CONSTANTS)[keyof typeof Z_INDEX_CONSTANTS];
export type NetworkConstant =
  (typeof NETWORK_CONSTANTS)[keyof typeof NETWORK_CONSTANTS][keyof (typeof NETWORK_CONSTANTS)[keyof typeof NETWORK_CONSTANTS]];
export type BusinessConstant =
  (typeof BUSINESS_CONSTANTS)[keyof typeof BUSINESS_CONSTANTS][keyof (typeof BUSINESS_CONSTANTS)[keyof typeof BUSINESS_CONSTANTS]];
