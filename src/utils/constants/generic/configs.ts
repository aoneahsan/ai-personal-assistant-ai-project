// Component configuration constants
export const COMPONENT_CONFIGS = {
  // Toast configurations
  TOAST: {
    POSITION: 'top-right',
    AUTO_CLOSE: true,
    HIDE_PROGRESS_BAR: false,
    CLOSE_ON_CLICK: true,
    PAUSE_ON_HOVER: true,
    DRAGGABLE: true,
    SHOW_CLOSE_BUTTON: true,
    TIMEOUT: {
      SUCCESS: 3000,
      ERROR: 5000,
      WARNING: 4000,
      INFO: 3000,
    },
  },

  // Modal configurations
  MODAL: {
    BACKDROP_DISMISS: true,
    ESCAPE_KEY_DISMISS: true,
    FOCUS_TRAP: true,
    AUTO_FOCUS: true,
    RESTORE_FOCUS: true,
    SIZES: {
      SMALL: { width: '400px' },
      MEDIUM: { width: '500px' },
      LARGE: { width: '800px' },
      EXTRA_LARGE: { width: '1200px' },
    },
    BREAKPOINTS: {
      MOBILE: '90vw',
      TABLET: '75vw',
      DESKTOP: '50vw',
    },
  },

  // DataTable configurations
  DATA_TABLE: {
    PAGINATOR: true,
    ROWS: 10,
    ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50],
    SHOW_GRIDLINES: true,
    STRIPED_ROWS: true,
    RESPONSIVE_LAYOUT: 'scroll',
    SORT_MODE: 'multiple',
    REMOVABLE_SORT: true,
    FILTER_DELAY: 300,
    GLOBAL_FILTER_FIELDS: ['name', 'email', 'title', 'description'],
    EMPTY_MESSAGE: 'No records found',
    LOADING_ICON: 'pi pi-spinner pi-spin',
  },

  // Calendar configurations
  CALENDAR: {
    DATE_FORMAT: 'mm/dd/yy',
    SHOW_ICON: true,
    SHOW_BUTTON_BAR: true,
    SHOW_TIME: false,
    HOUR_FORMAT: '12',
    SHOW_SECONDS: false,
    STEP_MINUTE: 1,
    STEP_HOUR: 1,
    STEP_SECOND: 1,
    INLINE: false,
    TOUCH_UI: false,
    MONTH_NAVIGATOR: true,
    YEAR_NAVIGATOR: true,
    YEAR_RANGE: '1900:2030',
  },

  // Dropdown configurations
  DROPDOWN: {
    FILTER: true,
    SHOW_CLEAR: true,
    SCROLL_HEIGHT: '200px',
    VIRTUAL_SCROLL: false,
    VIRTUAL_SCROLL_ITEM_SIZE: 38,
    OPTION_LABEL: 'label',
    OPTION_VALUE: 'value',
    PLACEHOLDER: 'Select an option',
    EMPTY_FILTER_MESSAGE: 'No results found',
    EMPTY_MESSAGE: 'No options available',
  },

  // Input configurations
  INPUT: {
    AUTO_COMPLETE: 'off',
    AUTO_FOCUS: false,
    DISABLED: false,
    READ_ONLY: false,
    REQUIRED: false,
    MAX_LENGTH: 255,
    PLACEHOLDER: '',
    SIZE: 'medium',
  },

  // Button configurations
  BUTTON: {
    TYPE: 'button',
    SIZE: 'medium',
    VARIANT: 'primary',
    DISABLED: false,
    LOADING: false,
    AUTO_FOCUS: false,
    ICON_POSITION: 'left',
    BADGE_CLASS: 'p-badge-secondary',
  },

  // File Upload configurations
  FILE_UPLOAD: {
    MODE: 'advanced',
    MULTIPLE: false,
    AUTO: false,
    MAX_FILE_SIZE: 10485760, // 10MB
    INVALID_FILE_SIZE_MESSAGE: 'File size exceeds limit',
    INVALID_FILE_TYPE_MESSAGE: 'Invalid file type',
    ACCEPT: '*/*',
    SHOW_UPLOAD_BUTTON: true,
    SHOW_CANCEL_BUTTON: true,
    CHOOSE_LABEL: 'Choose',
    UPLOAD_LABEL: 'Upload',
    CANCEL_LABEL: 'Cancel',
    CUSTOM_UPLOAD: false,
    PREVIEW_WIDTH: 50,
    UPLOAD_ICON: 'pi pi-upload',
  },

  // Chart configurations
  CHART: {
    RESPONSIVE: true,
    MAINTAIN_ASPECT_RATIO: true,
    ANIMATION: {
      DURATION: 1000,
      EASING: 'easeInOutQuad',
    },
    LEGEND: {
      DISPLAY: true,
      POSITION: 'top',
    },
    TOOLTIP: {
      ENABLED: true,
      MODE: 'index',
      INTERSECT: false,
    },
  },

  // Avatar configurations
  AVATAR: {
    SIZE: 'normal',
    SHAPE: 'circle',
    IMAGE_ALT: 'Avatar',
    ICON: 'pi pi-user',
    TEMPLATE_CLASS: 'p-avatar-template',
  },

  // Chip configurations
  CHIP: {
    REMOVABLE: false,
    REMOVE_ICON: 'pi pi-times-circle',
    TEMPLATE_CLASS: 'p-chip-template',
  },

  // Tag configurations
  TAG: {
    SEVERITY: 'primary',
    ROUNDED: false,
    ICON: null,
  },

  // Panel configurations
  PANEL: {
    TOGGLEABLE: false,
    COLLAPSED: false,
    SHOW_HEADER: true,
    TOGGLE_ICON: 'pi pi-chevron-down',
    COLLAPSED_ICON: 'pi pi-chevron-right',
  },

  // Skeleton configurations
  SKELETON: {
    WIDTH: '100%',
    HEIGHT: '1rem',
    BORDER_RADIUS: '4px',
    ANIMATION: 'wave',
  },

  // Progress Bar configurations
  PROGRESS_BAR: {
    MODE: 'determinate',
    SHOW_VALUE: true,
    UNIT: '%',
    COLOR: 'primary',
  },

  // Rating configurations
  RATING: {
    STARS: 5,
    CANCEL: true,
    DISABLED: false,
    READ_ONLY: false,
    ON_ICON: 'pi pi-star-fill',
    OFF_ICON: 'pi pi-star',
    CANCEL_ICON: 'pi pi-ban',
  },

  // Slider configurations
  SLIDER: {
    MIN: 0,
    MAX: 100,
    STEP: 1,
    ORIENTATION: 'horizontal',
    RANGE: false,
    DISABLED: false,
  },

  // Splitter configurations
  SPLITTER: {
    LAYOUT: 'horizontal',
    GUTTER_SIZE: 4,
    RESIZERR_STYLE: null,
    PANEL_STYLE: null,
    PANEL_STYLE_CLASS: null,
  },

  // Timeline configurations
  TIMELINE: {
    LAYOUT: 'vertical',
    ALIGN: 'left',
    DATA_KEY: 'id',
    MARKER_SIZE: '12px',
    OPPOSITE: null,
  },

  // Tree configurations
  TREE: {
    SELECTION_MODE: null,
    LOADING: false,
    FILTER: false,
    FILTER_MODE: 'lenient',
    FILTER_PLACEHOLDER: 'Search',
    FILTER_LOCALE: 'en',
    SCROLL_HEIGHT: '400px',
    VIRTUAL_SCROLL: false,
    VIRTUAL_SCROLL_ITEM_SIZE: 28,
  },
} as const;

// Default values for various components
export const DEFAULT_VALUES = {
  // Form defaults
  FORM: {
    EMAIL: '',
    PASSWORD: '',
    CONFIRM_PASSWORD: '',
    DISPLAY_NAME: '',
    PHONE_NUMBER: '',
    DATE_OF_BIRTH: null,
    GENDER: '',
    COUNTRY: '',
    TIMEZONE: 'UTC',
    LANGUAGE: 'en',
    THEME: 'light',
    NOTIFICATIONS: true,
    MARKETING_EMAILS: false,
    TERMS_ACCEPTED: false,
    PRIVACY_ACCEPTED: false,
  },

  // User defaults
  USER: {
    ROLE: 'user',
    STATUS: 'active',
    AVATAR: null,
    BIO: '',
    WEBSITE: '',
    LOCATION: '',
    SUBSCRIPTION: 'free',
    LAST_LOGIN: null,
    CREATED_AT: new Date().toISOString(),
    UPDATED_AT: new Date().toISOString(),
    EMAIL_VERIFIED: false,
    PHONE_VERIFIED: false,
    TWO_FACTOR_ENABLED: false,
  },

  // Chat defaults
  CHAT: {
    TYPE: 'user',
    STATUS: 'active',
    PARTICIPANTS: [],
    LAST_MESSAGE: '',
    LAST_MESSAGE_TIME: null,
    UNREAD_COUNT: 0,
    CREATED_AT: new Date().toISOString(),
    UPDATED_AT: new Date().toISOString(),
    ARCHIVED: false,
    PINNED: false,
    MUTED: false,
  },

  // Message defaults
  MESSAGE: {
    TYPE: 'text',
    STATUS: 'sent',
    TEXT: '',
    SENDER_ID: '',
    SENDER_EMAIL: '',
    TIMESTAMP: new Date().toISOString(),
    EDITED: false,
    DELETED: false,
    REPLY_TO: null,
    FORWARDED: false,
    FILE_DATA: null,
    REACTIONS: [],
  },

  // Embed defaults
  EMBED: {
    NAME: 'New Embed',
    DESCRIPTION: '',
    IS_ACTIVE: true,
    DOMAINS: [],
    SETTINGS: {
      theme: 'light',
      position: 'bottom-right',
      width: 350,
      height: 500,
      show_header: true,
      show_footer: true,
      auto_open: false,
      greeting_message: 'Hello! How can I help you?',
    },
    CREATED_AT: new Date().toISOString(),
    UPDATED_AT: new Date().toISOString(),
  },

  // System defaults
  SYSTEM: {
    PAGINATION: {
      PAGE: 1,
      SIZE: 20,
      TOTAL: 0,
      TOTAL_PAGES: 0,
    },
    SORTING: {
      FIELD: 'created_at',
      ORDER: 'desc',
    },
    FILTERING: {
      SEARCH: '',
      STATUS: 'all',
      TYPE: 'all',
      DATE_FROM: null,
      DATE_TO: null,
    },
  },

  // Theme defaults
  THEME: {
    MODE: 'light',
    PRIMARY_COLOR: '#007bff',
    SECONDARY_COLOR: '#6c757d',
    SUCCESS_COLOR: '#28a745',
    WARNING_COLOR: '#ffc107',
    ERROR_COLOR: '#dc3545',
    INFO_COLOR: '#17a2b8',
    FONT_FAMILY: 'Inter, sans-serif',
    FONT_SIZE: '14px',
    BORDER_RADIUS: '4px',
    SHADOW: '0 2px 4px rgba(0,0,0,0.1)',
  },

  // Notification defaults
  NOTIFICATION: {
    TYPE: 'info',
    TITLE: '',
    MESSAGE: '',
    DURATION: 5000,
    POSITION: 'top-right',
    SHOW_CLOSE_BUTTON: true,
    AUTO_CLOSE: true,
    PAUSE_ON_HOVER: true,
    CLICK_TO_CLOSE: true,
    SOUND: false,
    VIBRATION: false,
  },

  // File defaults
  FILE: {
    TYPE: 'unknown',
    SIZE: 0,
    NAME: '',
    EXTENSION: '',
    MIME_TYPE: '',
    URL: '',
    UPLOADED_AT: new Date().toISOString(),
    EXPIRES_AT: null,
    THUMBNAIL: null,
    METADATA: {},
  },

  // Analytics defaults
  ANALYTICS: {
    DATE_RANGE: '7d',
    METRICS: ['users', 'messages', 'chats'],
    GRANULARITY: 'day',
    CHART_TYPE: 'line',
    SHOW_COMPARISON: false,
    GROUP_BY: null,
    FILTERS: {},
  },

  // Search defaults
  SEARCH: {
    QUERY: '',
    FILTERS: {},
    SORT_BY: 'relevance',
    SORT_ORDER: 'desc',
    PAGE: 1,
    SIZE: 20,
    FACETS: [],
    HIGHLIGHT: true,
    FUZZY: false,
  },

  // Export defaults
  EXPORT: {
    FORMAT: 'csv',
    INCLUDE_HEADERS: true,
    DATE_FORMAT: 'YYYY-MM-DD',
    ENCODING: 'utf-8',
    DELIMITER: ',',
    QUOTE_CHAR: '"',
    ESCAPE_CHAR: '\\',
    NULL_VALUE: '',
  },
} as const;

// API configuration defaults
export const API_CONFIGS = {
  // Request defaults
  REQUEST: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CACHE: false,
    CACHE_DURATION: 300000, // 5 minutes
    HEADERS: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_SIZE: 20,
    MAX_SIZE: 100,
    SIZE_OPTIONS: [10, 20, 50, 100],
  },

  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
    REQUESTS_PER_DAY: 10000,
    BURST_SIZE: 10,
  },

  // File upload limits
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 10485760, // 10MB
    MAX_FILES: 10,
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ],
    CHUNK_SIZE: 1048576, // 1MB
  },

  // WebSocket defaults
  WEBSOCKET: {
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 1000,
    PING_INTERVAL: 30000,
    PONG_TIMEOUT: 5000,
    HEARTBEAT: true,
    BINARY_TYPE: 'blob',
  },
} as const;

// Performance optimization defaults
export const PERFORMANCE_CONFIGS = {
  // Virtual scrolling
  VIRTUAL_SCROLL: {
    ITEM_HEIGHT: 50,
    BUFFER_SIZE: 10,
    THRESHOLD: 100,
    ENABLED: false,
  },

  // Lazy loading
  LAZY_LOADING: {
    ENABLED: true,
    THRESHOLD: 100,
    ROOT_MARGIN: '50px',
    PLACEHOLDER: 'Loading...',
  },

  // Debouncing
  DEBOUNCE: {
    SEARCH: 300,
    INPUT: 300,
    RESIZE: 100,
    SCROLL: 16,
  },

  // Throttling
  THROTTLE: {
    SCROLL: 16,
    RESIZE: 100,
    MOUSE_MOVE: 16,
  },

  // Caching
  CACHE: {
    ENABLED: true,
    TTL: 300000, // 5 minutes
    MAX_SIZE: 100,
    STRATEGY: 'lru',
  },

  // Image optimization
  IMAGE: {
    LAZY_LOADING: true,
    PLACEHOLDER:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
    QUALITY: 80,
    FORMAT: 'webp',
    SIZES: [480, 768, 1024, 1200, 1920],
  },
} as const;

// Security configuration defaults
export const SECURITY_CONFIGS = {
  // Authentication
  AUTH: {
    SESSION_TIMEOUT: 3600000, // 1 hour
    REMEMBER_ME_DURATION: 2592000000, // 30 days
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900000, // 15 minutes
    PASSWORD_RESET_EXPIRY: 3600000, // 1 hour
    EMAIL_VERIFICATION_EXPIRY: 86400000, // 24 hours
    TWO_FACTOR_WINDOW: 300000, // 5 minutes
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
    FORBIDDEN_PATTERNS: ['password', '123456', 'qwerty'],
  },

  // Rate limiting
  RATE_LIMITING: {
    LOGIN_ATTEMPTS: 5,
    PASSWORD_RESET_ATTEMPTS: 3,
    EMAIL_VERIFICATION_ATTEMPTS: 3,
    API_REQUESTS: 100,
    WINDOW_MS: 900000, // 15 minutes
  },

  // Content Security Policy
  CSP: {
    DEFAULT_SRC: "'self'",
    SCRIPT_SRC: "'self' 'unsafe-inline'",
    STYLE_SRC: "'self' 'unsafe-inline'",
    IMG_SRC: "'self' data: https:",
    FONT_SRC: "'self' https:",
    CONNECT_SRC: "'self' https:",
    MEDIA_SRC: "'self'",
    OBJECT_SRC: "'none'",
    FRAME_SRC: "'self'",
  },

  // CORS settings
  CORS: {
    ORIGIN: ['http://localhost:3000', 'https://yourdomain.com'],
    METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
    CREDENTIALS: true,
    MAX_AGE: 86400, // 24 hours
  },
} as const;

// Export types for better TypeScript support
export type ComponentConfig =
  (typeof COMPONENT_CONFIGS)[keyof typeof COMPONENT_CONFIGS];
export type DefaultValue = (typeof DEFAULT_VALUES)[keyof typeof DEFAULT_VALUES];
export type APIConfig = (typeof API_CONFIGS)[keyof typeof API_CONFIGS];
export type PerformanceConfig =
  (typeof PERFORMANCE_CONFIGS)[keyof typeof PERFORMANCE_CONFIGS];
export type SecurityConfig =
  (typeof SECURITY_CONFIGS)[keyof typeof SECURITY_CONFIGS];
