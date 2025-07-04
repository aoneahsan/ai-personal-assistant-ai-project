// UI constants for consistent styling and behavior
export const UI_ICONS = {
  // Navigation icons
  HOME: 'pi pi-home',
  DASHBOARD: 'pi pi-th-large',
  CHAT: 'pi pi-comments',
  CHATS: 'pi pi-comment',
  PROFILE: 'pi pi-user',
  SETTINGS: 'pi pi-cog',
  LOGOUT: 'pi pi-sign-out',
  LOGIN: 'pi pi-sign-in',
  BACK: 'pi pi-arrow-left',
  FORWARD: 'pi pi-arrow-right',
  CLOSE: 'pi pi-times',
  MENU: 'pi pi-bars',

  // Message icons
  SEND: 'pi pi-send',
  EDIT: 'pi pi-pencil',
  DELETE: 'pi pi-trash',
  REPLY: 'pi pi-reply',
  FORWARD_MESSAGE: 'pi pi-share-alt',
  COPY: 'pi pi-copy',
  QUOTE: 'pi pi-quote-left',

  // Media icons
  CAMERA: 'pi pi-camera',
  GALLERY: 'pi pi-images',
  MICROPHONE: 'pi pi-microphone',
  VIDEO: 'pi pi-video',
  PHOTO: 'pi pi-image',
  FILE: 'pi pi-file',
  DOWNLOAD: 'pi pi-download',
  UPLOAD: 'pi pi-upload',

  // Status icons
  ONLINE: 'pi pi-circle-fill',
  OFFLINE: 'pi pi-circle',
  TYPING: 'pi pi-ellipsis-h',
  READ: 'pi pi-check-circle',
  UNREAD: 'pi pi-circle',
  SENT: 'pi pi-check',
  DELIVERED: 'pi pi-check-circle',
  FAILED: 'pi pi-exclamation-triangle',

  // Actions
  SEARCH: 'pi pi-search',
  FILTER: 'pi pi-filter',
  SORT: 'pi pi-sort',
  REFRESH: 'pi pi-refresh',
  CLEAR: 'pi pi-times-circle',
  SAVE: 'pi pi-save',
  CANCEL: 'pi pi-ban',
  CONFIRM: 'pi pi-check',

  // Feedback
  LIKE: 'pi pi-thumbs-up',
  DISLIKE: 'pi pi-thumbs-down',
  STAR: 'pi pi-star',
  HEART: 'pi pi-heart',
  FEEDBACK: 'pi pi-comment-dots',

  // System
  INFO: 'pi pi-info-circle',
  WARNING: 'pi pi-exclamation-triangle',
  ERROR: 'pi pi-times-circle',
  SUCCESS: 'pi pi-check-circle',
  LOADING: 'pi pi-spinner',
  HELP: 'pi pi-question-circle',

  // Theme
  DARK_MODE: 'pi pi-moon',
  LIGHT_MODE: 'pi pi-sun',

  // Embed
  CODE: 'pi pi-code',
  EMBED: 'pi pi-external-link',

  // Subscription
  CROWN: 'pi pi-crown',
  UPGRADE: 'pi pi-arrow-up',
  BILLING: 'pi pi-credit-card',

  // Call actions
  PHONE: 'pi pi-phone',
  VIDEO_CALL: 'pi pi-video',
  MUTE: 'pi pi-volume-off',
  UNMUTE: 'pi pi-volume-up',
  END_CALL: 'pi pi-phone-slash',
} as const;

// CSS class names for consistent styling
export const CSS_CLASSES = {
  // Layout
  CONTAINER: 'container',
  WRAPPER: 'wrapper',
  CONTENT: 'content',
  SIDEBAR: 'sidebar',
  HEADER: 'header',
  FOOTER: 'footer',
  MAIN: 'main',

  // Grid system
  GRID: 'grid',
  GRID_ITEM: 'grid-item',
  FLEX: 'flex',
  FLEX_COLUMN: 'flex-column',
  FLEX_ROW: 'flex-row',
  FLEX_CENTER: 'flex-center',
  FLEX_BETWEEN: 'flex-between',
  FLEX_AROUND: 'flex-around',
  FLEX_WRAP: 'flex-wrap',

  // Spacing
  MARGIN_AUTO: 'margin-auto',
  PADDING_SMALL: 'padding-small',
  PADDING_MEDIUM: 'padding-medium',
  PADDING_LARGE: 'padding-large',
  MARGIN_SMALL: 'margin-small',
  MARGIN_MEDIUM: 'margin-medium',
  MARGIN_LARGE: 'margin-large',

  // Typography
  TEXT_CENTER: 'text-center',
  TEXT_LEFT: 'text-left',
  TEXT_RIGHT: 'text-right',
  TEXT_BOLD: 'text-bold',
  TEXT_ITALIC: 'text-italic',
  TEXT_UNDERLINE: 'text-underline',
  TEXT_UPPERCASE: 'text-uppercase',
  TEXT_LOWERCASE: 'text-lowercase',
  TEXT_CAPITALIZE: 'text-capitalize',

  // Colors
  TEXT_PRIMARY: 'text-primary',
  TEXT_SECONDARY: 'text-secondary',
  TEXT_SUCCESS: 'text-success',
  TEXT_WARNING: 'text-warning',
  TEXT_ERROR: 'text-error',
  TEXT_INFO: 'text-info',
  TEXT_MUTED: 'text-muted',

  // Background colors
  BG_PRIMARY: 'bg-primary',
  BG_SECONDARY: 'bg-secondary',
  BG_SUCCESS: 'bg-success',
  BG_WARNING: 'bg-warning',
  BG_ERROR: 'bg-error',
  BG_INFO: 'bg-info',
  BG_LIGHT: 'bg-light',
  BG_DARK: 'bg-dark',

  // Borders
  BORDER: 'border',
  BORDER_TOP: 'border-top',
  BORDER_BOTTOM: 'border-bottom',
  BORDER_LEFT: 'border-left',
  BORDER_RIGHT: 'border-right',
  BORDER_RADIUS: 'border-radius',
  BORDER_ROUNDED: 'border-rounded',

  // Shadows
  SHADOW_SMALL: 'shadow-small',
  SHADOW_MEDIUM: 'shadow-medium',
  SHADOW_LARGE: 'shadow-large',

  // Visibility
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  INVISIBLE: 'invisible',

  // States
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',

  // Responsive
  MOBILE_ONLY: 'mobile-only',
  TABLET_ONLY: 'tablet-only',
  DESKTOP_ONLY: 'desktop-only',
  MOBILE_HIDDEN: 'mobile-hidden',
  TABLET_HIDDEN: 'tablet-hidden',
  DESKTOP_HIDDEN: 'desktop-hidden',
} as const;

// Component sizes
export const COMPONENT_SIZES = {
  EXTRA_SMALL: 'xs',
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl',
} as const;

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  LIGHT: 'light',
  DARK: 'dark',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link',
} as const;

// Input types
export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  DATE: 'date',
  TIME: 'time',
  DATETIME_LOCAL: 'datetime-local',
  MONTH: 'month',
  WEEK: 'week',
  COLOR: 'color',
  FILE: 'file',
  HIDDEN: 'hidden',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  RANGE: 'range',
  TEXTAREA: 'textarea',
  SELECT: 'select',
} as const;

// Toast positions
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
  CENTER: 'center',
} as const;

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Modal sizes
export const MODAL_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extra-large',
  FULL_SCREEN: 'full-screen',
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints (in pixels)
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
  LARGE_DESKTOP: 1440,
} as const;

// Z-index values
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Severity levels
export const SEVERITY_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warn',
  ERROR: 'error',
} as const;

// Message status indicators
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

// Chat message types
export const CHAT_MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location',
  CONTACT: 'contact',
  STICKER: 'sticker',
  EMOJI: 'emoji',
  SYSTEM: 'system',
} as const;

// File upload states
export const UPLOAD_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
} as const;

// Helper types
export type UIIcon = (typeof UI_ICONS)[keyof typeof UI_ICONS];
export type CSSClass = (typeof CSS_CLASSES)[keyof typeof CSS_CLASSES];
export type ComponentSize =
  (typeof COMPONENT_SIZES)[keyof typeof COMPONENT_SIZES];
export type ButtonVariant =
  (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS];
export type InputType = (typeof INPUT_TYPES)[keyof typeof INPUT_TYPES];
export type ToastPosition =
  (typeof TOAST_POSITIONS)[keyof typeof TOAST_POSITIONS];
export type ToastType = (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES];
export type ModalSize = (typeof MODAL_SIZES)[keyof typeof MODAL_SIZES];
export type SeverityLevel =
  (typeof SEVERITY_LEVELS)[keyof typeof SEVERITY_LEVELS];
export type MessageStatus =
  (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];
export type ChatMessageType =
  (typeof CHAT_MESSAGE_TYPES)[keyof typeof CHAT_MESSAGE_TYPES];
export type UploadState = (typeof UPLOAD_STATES)[keyof typeof UPLOAD_STATES];
