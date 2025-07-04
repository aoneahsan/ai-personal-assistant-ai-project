// API endpoints and configuration constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    REFRESH_TOKEN: '/auth/refresh-token',
    GOOGLE_SIGNIN: '/auth/google',
    APPLE_SIGNIN: '/auth/apple',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    DELETE_ACCOUNT: '/users/delete',
    SEARCH: '/users/search',
    BLOCK: '/users/block',
    UNBLOCK: '/users/unblock',
    UPLOAD_AVATAR: '/users/avatar',
  },
  CHATS: {
    CONVERSATIONS: '/chats/conversations',
    MESSAGES: '/chats/messages',
    SEND_MESSAGE: '/chats/send',
    DELETE_MESSAGE: '/chats/message',
    EDIT_MESSAGE: '/chats/message',
    CLEAR_CHAT: '/chats/clear',
    DELETE_CHAT: '/chats/delete',
    TYPING: '/chats/typing',
    READ_RECEIPT: '/chats/read',
  },
  MEDIA: {
    UPLOAD: '/media/upload',
    DELETE: '/media/delete',
    DOWNLOAD: '/media/download',
    THUMBNAIL: '/media/thumbnail',
  },
  NOTIFICATIONS: {
    REGISTER_DEVICE: '/notifications/register',
    UNREGISTER_DEVICE: '/notifications/unregister',
    PREFERENCES: '/notifications/preferences',
  },
  FEEDBACK: {
    SUBMIT: '/feedback/submit',
    GET_FEEDBACK: '/feedback/get',
    STATS: '/feedback/stats',
  },
  SUBSCRIPTION: {
    PLANS: '/subscription/plans',
    CURRENT: '/subscription/current',
    UPGRADE: '/subscription/upgrade',
    CANCEL: '/subscription/cancel',
    BILLING_HISTORY: '/subscription/billing',
  },
  ANONYMOUS: {
    ROOMS: '/anonymous/rooms',
    JOIN_ROOM: '/anonymous/join',
    LEAVE_ROOM: '/anonymous/leave',
    MESSAGES: '/anonymous/messages',
    SEND_MESSAGE: '/anonymous/send',
  },
  EMBED: {
    CREATE: '/embed/create',
    UPDATE: '/embed/update',
    DELETE: '/embed/delete',
    GET_EMBEDS: '/embed/get',
    VALIDATE_DOMAIN: '/embed/validate-domain',
  },
} as const;

// HTTP methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Request timeout configurations
export const REQUEST_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 30000, // 30 seconds
  DOWNLOAD: 60000, // 60 seconds
  LONG_POLLING: 120000, // 2 minutes
} as const;

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_WEBP: 'image/webp',
  VIDEO_MP4: 'video/mp4',
  VIDEO_WEBM: 'video/webm',
  AUDIO_MP3: 'audio/mp3',
  AUDIO_WAV: 'audio/wav',
  AUDIO_WEBM: 'audio/webm',
} as const;

// API response formats
export const API_RESPONSE_FORMATS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle',
} as const;

// Firebase collection names
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  ANONYMOUS_ROOMS: 'anonymous_rooms',
  ANONYMOUS_MESSAGES: 'anonymous_messages',
  FEEDBACK: 'feedback',
  NOTIFICATIONS: 'notifications',
  SUBSCRIPTIONS: 'subscriptions',
  EMBEDS: 'embeds',
  SESSIONS: 'sessions',
  ANALYTICS: 'analytics',
  SYSTEM_LOGS: 'system_logs',
} as const;

// Firebase document field names
export const FIREBASE_FIELDS = {
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  DELETED_AT: 'deletedAt',
  USER_ID: 'userId',
  EMAIL: 'email',
  DISPLAY_NAME: 'displayName',
  PHOTO_URL: 'photoURL',
  LAST_SEEN: 'lastSeen',
  IS_ONLINE: 'isOnline',
  IS_VERIFIED: 'isVerified',
  IS_BLOCKED: 'isBlocked',
  CHAT_ID: 'chatId',
  MESSAGE_TEXT: 'text',
  MESSAGE_TYPE: 'type',
  MESSAGE_STATUS: 'status',
  SENDER_ID: 'senderId',
  RECIPIENT_ID: 'recipientId',
  PARTICIPANTS: 'participants',
  LAST_MESSAGE: 'lastMessage',
  UNREAD_COUNT: 'unreadCount',
  ROOM_ID: 'roomId',
  ROOM_NAME: 'roomName',
  FEEDBACK_TYPE: 'type',
  FEEDBACK_RATING: 'rating',
  FEEDBACK_COMMENT: 'comment',
  DEVICE_TOKEN: 'deviceToken',
  PLATFORM: 'platform',
  SUBSCRIPTION_PLAN: 'plan',
  SUBSCRIPTION_STATUS: 'status',
  BILLING_CYCLE: 'billingCycle',
  EMBED_TITLE: 'title',
  EMBED_DOMAINS: 'domains',
  EMBED_CONFIG: 'config',
} as const;

// API error codes
export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  SUBSCRIPTION: 'subscription',
  THEME_SETTINGS: 'theme_settings',
  APP_PREFERENCES: 'app_preferences',
  ANONYMOUS_ROOMS: 'anonymous_rooms',
  FEEDBACK_STATS: 'feedback_stats',
  EMBEDS: 'embeds',
} as const;

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Helper types
export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]];
export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];
export type ApiResponseFormat =
  (typeof API_RESPONSE_FORMATS)[keyof typeof API_RESPONSE_FORMATS];
export type FirebaseCollection =
  (typeof FIREBASE_COLLECTIONS)[keyof typeof FIREBASE_COLLECTIONS];
export type FirebaseField =
  (typeof FIREBASE_FIELDS)[keyof typeof FIREBASE_FIELDS];
export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];
