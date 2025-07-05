// Page titles and labels constants
export const PAGE_TITLES = {
  // Dashboard pages
  DASHBOARD_OVERVIEW: 'Dashboard Overview',
  DASHBOARD_CHATS: 'My Chats',
  DASHBOARD_CHAT_EMBEDS: 'Chat Embeds',
  DASHBOARD_ACCOUNT: 'Account Information',

  // Admin pages
  ADMIN_DASHBOARD: 'Admin Dashboard',
  ADMIN_USERS: 'User Management',
  ADMIN_ROLES: 'Role Management',
  ADMIN_PERMISSIONS: 'Permission Management',
  ADMIN_SYSTEM_CONFIG: 'System Configuration',
  ADMIN_SETTINGS: 'System Settings',
  ADMIN_ANALYTICS: 'System Analytics',
  ADMIN_AUDIT_LOGS: 'Audit Logs',
  ADMIN_SUBSCRIPTIONS: 'Subscription Management',
  ADMIN_FEATURE_FLAGS: 'Feature Flags',
  ADMIN_INTEGRATIONS: 'Integration Management',

  // Auth pages
  SIGN_IN: 'Sign In',
  SIGN_UP: 'Sign Up',
  FORGOT_PASSWORD: 'Forgot Password',
  RESET_PASSWORD: 'Reset Password',

  // Other pages
  CHAT_VIEW: 'Chat View',
  ANONYMOUS_ROOM: 'Anonymous Room',
  EDIT_PROFILE: 'Edit Profile',
  EMBED_DEMO: 'Embed Demo',
  SUBSCRIPTION_REQUEST: 'Subscription Request',

  // Policy pages
  PRIVACY_POLICY: 'Privacy Policy',
  TERMS_OF_SERVICE: 'Terms of Service',
  DATA_DELETION_POLICY: 'Data Deletion Policy',
  COOKIE_POLICY: 'Cookie Policy',
} as const;

// Button labels
export const BUTTON_LABELS = {
  // Common actions
  SAVE: 'Save',
  CANCEL: 'Cancel',
  CLOSE: 'Close',
  EDIT: 'Edit',
  DELETE: 'Delete',
  CREATE: 'Create',
  UPDATE: 'Update',
  SUBMIT: 'Submit',
  CONFIRM: 'Confirm',
  BACK: 'Back',
  NEXT: 'Next',
  FINISH: 'Finish',
  REFRESH: 'Refresh',
  RELOAD: 'Reload',
  RETRY: 'Retry',
  SEARCH: 'Search',
  FILTER: 'Filter',
  CLEAR: 'Clear',
  RESET: 'Reset',
  COPY: 'Copy',
  PASTE: 'Paste',
  DOWNLOAD: 'Download',
  UPLOAD: 'Upload',
  SHARE: 'Share',
  EXPORT: 'Export',
  IMPORT: 'Import',
  PRINT: 'Print',
  HELP: 'Help',

  // Auth actions
  SIGN_IN: 'Sign In',
  SIGN_UP: 'Sign Up',
  SIGN_OUT: 'Sign Out',
  LOGOUT: 'Logout',
  SIGN_IN_WITH_GOOGLE: 'Sign In with Google',
  SIGN_IN_WITH_APPLE: 'Sign In with Apple',
  FORGOT_PASSWORD: 'Forgot Password',
  RESET_PASSWORD: 'Reset Password',
  RESEND_EMAIL: 'Resend Email',

  // Chat actions
  START_NEW_CHAT: 'Start New Chat',
  SEND_MESSAGE: 'Send Message',
  ATTACH_FILE: 'Attach File',
  RECORD_VOICE: 'Record Voice',
  TAKE_PHOTO: 'Take Photo',
  CHOOSE_FROM_GALLERY: 'Choose from Gallery',
  CLEAR_CHAT: 'Clear Chat',
  DELETE_CHAT: 'Delete Chat',
  BLOCK_USER: 'Block User',
  UNBLOCK_USER: 'Unblock User',
  REPORT_USER: 'Report User',

  // Subscription actions
  UPGRADE_PLAN: 'Upgrade Plan',
  DOWNGRADE_PLAN: 'Downgrade Plan',
  CANCEL_SUBSCRIPTION: 'Cancel Subscription',
  MANAGE_SUBSCRIPTION: 'Manage Subscription',
  VIEW_BILLING: 'View Billing',
  REQUEST_SUBSCRIPTION: 'Request Subscription',

  // Admin actions
  CREATE_USER: 'Create User',
  EDIT_USER: 'Edit User',
  DELETE_USER: 'Delete User',
  BAN_USER: 'Ban User',
  UNBAN_USER: 'Unban User',
  ASSIGN_ROLE: 'Assign Role',
  REMOVE_ROLE: 'Remove Role',
  ENABLE_FEATURE: 'Enable Feature',
  DISABLE_FEATURE: 'Disable Feature',
  VIEW_DETAILS: 'View Details',
  MANAGE_PERMISSIONS: 'Manage Permissions',
  EXPORT_DATA: 'Export Data',
  BACKUP_SYSTEM: 'Backup System',
  RESTORE_SYSTEM: 'Restore System',

  // Embed actions
  CREATE_EMBED: 'Create Embed',
  CREATE_NEW_EMBED: 'Create New Embed',
  EDIT_EMBED: 'Edit Embed',
  DELETE_EMBED: 'Delete Embed',
  COPY_EMBED_CODE: 'Copy Embed Code',
  PREVIEW_EMBED: 'Preview Embed',
  CONFIGURE_EMBED: 'Configure Embed',

  // Navigation
  GO_TO_DASHBOARD: 'Go to Dashboard',
  GO_TO_CHATS: 'Go to Chats',
  GO_TO_ADMIN: 'Go to Admin',
  GO_TO_PROFILE: 'Go to Profile',
  GO_TO_SETTINGS: 'Go to Settings',
  GO_HOME: 'Go Home',

  // Modal actions
  OPEN_MODAL: 'Open Modal',
  CLOSE_MODAL: 'Close Modal',
  MINIMIZE: 'Minimize',
  MAXIMIZE: 'Maximize',
  FULLSCREEN: 'Fullscreen',

  // File actions
  CHOOSE_FILE: 'Choose File',
  REMOVE_FILE: 'Remove File',
  REPLACE_FILE: 'Replace File',
  VIEW_FILE: 'View File',
  DOWNLOAD_FILE: 'Download File',

  // Theme actions
  TOGGLE_THEME: 'Toggle Theme',
  DARK_MODE: 'Dark Mode',
  LIGHT_MODE: 'Light Mode',

  // Feedback actions
  SUBMIT_FEEDBACK: 'Submit Feedback',
  RATE_EXPERIENCE: 'Rate Experience',
  SEND_FEEDBACK: 'Send Feedback',
  CLOSE_FEEDBACK: 'Close Feedback',
} as const;

// Status labels
export const STATUS_LABELS = {
  // General statuses
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ENABLED: 'Enabled',
  DISABLED: 'Disabled',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',

  // User statuses
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  AWAY: 'Away',
  BUSY: 'Busy',
  BANNED: 'Banned',
  VERIFIED: 'Verified',
  UNVERIFIED: 'Unverified',

  // Message statuses
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  READ: 'Read',
  UNREAD: 'Unread',
  TYPING: 'Typing',
  EDITED: 'Edited',
  DELETED: 'Deleted',

  // Subscription statuses
  FREE: 'Free',
  PRO: 'Pro',
  PREMIUM: 'Premium',
  ENTERPRISE: 'Enterprise',
  TRIAL: 'Trial',
  EXPIRED_TRIAL: 'Expired Trial',
  PAST_DUE: 'Past Due',

  // System statuses
  HEALTHY: 'Healthy',
  WARNING: 'Warning',
  ERROR: 'Error',
  MAINTENANCE: 'Maintenance',
  UPDATING: 'Updating',
  BACKUP_IN_PROGRESS: 'Backup in Progress',
  RESTORE_IN_PROGRESS: 'Restore in Progress',
} as const;

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  // Chat related
  NO_CONVERSATIONS: 'No conversations yet',
  NO_MESSAGES: 'No messages yet',
  NO_CHATS: 'No chats found',
  START_CONVERSATION: 'Start a new conversation to see it here',

  // Embed related
  NO_EMBEDS: 'No embeds created yet',
  NO_EMBED_CONFIGS: 'No embed configurations found',
  CREATE_FIRST_EMBED: 'Create your first chat embed to get started',

  // User related
  NO_USERS: 'No users found',
  NO_SEARCH_RESULTS: 'No search results found',
  NO_USER_DATA: 'No user data available',

  // Admin related
  NO_ROLES: 'No roles defined',
  NO_PERMISSIONS: 'No permissions assigned',
  NO_FEATURE_FLAGS: 'No feature flags configured',
  NO_AUDIT_LOGS: 'No audit logs available',
  NO_ANALYTICS_DATA: 'No analytics data available',

  // Subscription related
  NO_SUBSCRIPTION: 'No subscription found',
  NO_BILLING_HISTORY: 'No billing history available',
  NO_REQUESTS: 'No requests found',

  // File related
  NO_FILES: 'No files uploaded',
  NO_MEDIA: 'No media files',
  NO_DOCUMENTS: 'No documents found',

  // General
  NO_DATA: 'No data available',
  NO_RESULTS: 'No results found',
  NO_CONTENT: 'No content available',
  COMING_SOON: 'Coming soon',
} as const;

// Error messages for UI
export const ERROR_LABELS = {
  // General errors
  SOMETHING_WENT_WRONG: 'Something went wrong',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
  NETWORK_ERROR: 'Network error',
  CONNECTION_FAILED: 'Connection failed',
  TIMEOUT_ERROR: 'Request timeout',
  PERMISSION_DENIED: 'Permission denied',
  ACCESS_DENIED: 'Access denied',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not found',
  SERVER_ERROR: 'Server error',

  // Form errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PASSWORD: 'Invalid password',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_URL: 'Invalid URL',
  INVALID_DATE: 'Invalid date',
  INVALID_FORMAT: 'Invalid format',

  // File errors
  FILE_TOO_LARGE: 'File too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'Upload failed',
  DOWNLOAD_FAILED: 'Download failed',
  FILE_NOT_FOUND: 'File not found',

  // Auth errors
  INVALID_CREDENTIALS: 'Invalid credentials',
  ACCOUNT_LOCKED: 'Account locked',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  WEAK_PASSWORD: 'Password too weak',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',

  // System errors
  MAINTENANCE_MODE: 'System under maintenance',
  SERVICE_UNAVAILABLE: 'Service unavailable',
  QUOTA_EXCEEDED: 'Quota exceeded',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
} as const;

// Success messages for UI
export const SUCCESS_LABELS = {
  // General success
  SUCCESS: 'Success',
  COMPLETED: 'Completed successfully',
  SAVED: 'Saved successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  UPLOADED: 'Uploaded successfully',
  DOWNLOADED: 'Downloaded successfully',
  COPIED: 'Copied successfully',
  SHARED: 'Shared successfully',
  SENT: 'Sent successfully',

  // Auth success
  SIGNED_IN: 'Signed in successfully',
  SIGNED_OUT: 'Signed out successfully',
  ACCOUNT_CREATED: 'Account created successfully',
  PASSWORD_RESET: 'Password reset successfully',
  EMAIL_VERIFIED: 'Email verified successfully',

  // Chat success
  MESSAGE_SENT: 'Message sent',
  CHAT_CREATED: 'Chat created',
  CHAT_DELETED: 'Chat deleted',
  USER_BLOCKED: 'User blocked',
  USER_UNBLOCKED: 'User unblocked',

  // Embed success
  EMBED_CREATED: 'Embed created successfully',
  EMBED_UPDATED: 'Embed updated successfully',
  EMBED_DELETED: 'Embed deleted successfully',
  EMBED_CODE_COPIED: 'Embed code copied to clipboard',

  // Admin success
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  ROLE_ASSIGNED: 'Role assigned successfully',
  PERMISSION_GRANTED: 'Permission granted successfully',
  FEATURE_ENABLED: 'Feature enabled successfully',
  FEATURE_DISABLED: 'Feature disabled successfully',

  // Subscription success
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  PLAN_UPGRADED: 'Plan upgraded successfully',
  PLAN_DOWNGRADED: 'Plan downgraded successfully',

  // System success
  BACKUP_CREATED: 'Backup created successfully',
  SYSTEM_RESTORED: 'System restored successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  CONFIGURATION_SAVED: 'Configuration saved successfully',
} as const;

// Tooltip messages
export const TOOLTIP_LABELS = {
  // Navigation tooltips
  REFRESH_DATA: 'Refresh Data',
  REFRESH_DASHBOARD: 'Refresh Dashboard',
  REFRESH_CHATS: 'Refresh Chats',
  REFRESH_EMBEDS: 'Refresh Embeds',
  REFRESH_USERS: 'Refresh Users',
  REFRESH_ANALYTICS: 'Refresh Analytics',

  // Action tooltips
  EDIT_ITEM: 'Edit Item',
  DELETE_ITEM: 'Delete Item',
  COPY_ITEM: 'Copy Item',
  SHARE_ITEM: 'Share Item',
  DOWNLOAD_ITEM: 'Download Item',
  UPLOAD_ITEM: 'Upload Item',

  // Status tooltips
  ONLINE_STATUS: 'User is online',
  OFFLINE_STATUS: 'User is offline',
  TYPING_STATUS: 'User is typing',
  LAST_SEEN: 'Last seen',

  // Feature tooltips
  PREMIUM_FEATURE: 'Premium feature',
  COMING_SOON: 'Coming soon',
  BETA_FEATURE: 'Beta feature',
  EXPERIMENTAL: 'Experimental feature',

  // Security tooltips
  VERIFIED_USER: 'Verified user',
  ADMIN_USER: 'Admin user',
  MODERATOR: 'Moderator',
  BANNED_USER: 'Banned user',

  // System tooltips
  HEALTHY_STATUS: 'System is healthy',
  WARNING_STATUS: 'System warning',
  ERROR_STATUS: 'System error',
  MAINTENANCE_STATUS: 'Under maintenance',
} as const;

// Placeholder texts
export const PLACEHOLDER_TEXTS = {
  // Search placeholders
  SEARCH_USERS: 'Search users...',
  SEARCH_CHATS: 'Search chats...',
  SEARCH_MESSAGES: 'Search messages...',
  SEARCH_EMBEDS: 'Search embeds...',
  SEARCH_LOGS: 'Search logs...',
  SEARCH_ANALYTICS: 'Search analytics...',
  SEARCH_GENERAL: 'Search...',

  // Input placeholders
  ENTER_NAME: 'Enter your name',
  ENTER_EMAIL: 'Enter your email',
  ENTER_PASSWORD: 'Enter your password',
  ENTER_PHONE: 'Enter your phone number',
  ENTER_URL: 'Enter URL',
  ENTER_MESSAGE: 'Type your message...',
  ENTER_TITLE: 'Enter title',
  ENTER_DESCRIPTION: 'Enter description',
  ENTER_COMMENT: 'Enter comment',
  ENTER_FEEDBACK: 'Enter your feedback',

  // Select placeholders
  SELECT_OPTION: 'Select an option',
  SELECT_ROLE: 'Select a role',
  SELECT_PERMISSION: 'Select permission',
  SELECT_PLAN: 'Select a plan',
  SELECT_STATUS: 'Select status',
  SELECT_TYPE: 'Select type',
  SELECT_CATEGORY: 'Select category',
  SELECT_DATE: 'Select date',
  SELECT_TIME: 'Select time',

  // File placeholders
  CHOOSE_FILE: 'Choose file',
  DROP_FILE: 'Drop file here or click to browse',
  NO_FILE_SELECTED: 'No file selected',

  // Other placeholders
  ENTER_ROOM_CODE: 'Enter room code',
  ENTER_VERIFICATION_CODE: 'Enter verification code',
  ENTER_AMOUNT: 'Enter amount',
  ENTER_QUANTITY: 'Enter quantity',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  // General loading
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  SAVING: 'Saving...',
  UPLOADING: 'Uploading...',
  DOWNLOADING: 'Downloading...',
  SENDING: 'Sending...',
  DELETING: 'Deleting...',
  UPDATING: 'Updating...',
  CREATING: 'Creating...',
  CONNECTING: 'Connecting...',
  SIGNING_IN: 'Signing in...',
  SIGNING_OUT: 'Signing out...',

  // Data loading
  LOADING_DATA: 'Loading data...',
  LOADING_USERS: 'Loading users...',
  LOADING_CHATS: 'Loading chats...',
  LOADING_MESSAGES: 'Loading messages...',
  LOADING_EMBEDS: 'Loading embeds...',
  LOADING_ANALYTICS: 'Loading analytics...',
  LOADING_SETTINGS: 'Loading settings...',
  LOADING_PROFILE: 'Loading profile...',

  // File loading
  LOADING_IMAGE: 'Loading image...',
  LOADING_VIDEO: 'Loading video...',
  LOADING_AUDIO: 'Loading audio...',
  LOADING_DOCUMENT: 'Loading document...',

  // System loading
  INITIALIZING: 'Initializing...',
  CONFIGURING: 'Configuring...',
  SYNCHRONIZING: 'Synchronizing...',
  BACKING_UP: 'Backing up...',
  RESTORING: 'Restoring...',
  OPTIMIZING: 'Optimizing...',
} as const;

// Confirmation messages
export const CONFIRMATION_MESSAGES = {
  // Delete confirmations
  DELETE_ITEM: 'Are you sure you want to delete this item?',
  DELETE_CHAT: 'Are you sure you want to delete this chat?',
  DELETE_MESSAGE: 'Are you sure you want to delete this message?',
  DELETE_USER: 'Are you sure you want to delete this user?',
  DELETE_EMBED: 'Are you sure you want to delete this embed?',
  DELETE_ROLE: 'Are you sure you want to delete this role?',
  DELETE_PERMISSION: 'Are you sure you want to delete this permission?',

  // Action confirmations
  SAVE_CHANGES: 'Are you sure you want to save these changes?',
  DISCARD_CHANGES: 'Are you sure you want to discard your changes?',
  CANCEL_OPERATION: 'Are you sure you want to cancel this operation?',
  LOGOUT_CONFIRM: 'Are you sure you want to log out?',
  RESET_PASSWORD: 'Are you sure you want to reset your password?',
  CLEAR_CHAT: 'Are you sure you want to clear this chat?',
  BLOCK_USER: 'Are you sure you want to block this user?',
  UNBLOCK_USER: 'Are you sure you want to unblock this user?',
  BAN_USER: 'Are you sure you want to ban this user?',
  UNBAN_USER: 'Are you sure you want to unban this user?',

  // Subscription confirmations
  UPGRADE_PLAN: 'Are you sure you want to upgrade your plan?',
  DOWNGRADE_PLAN: 'Are you sure you want to downgrade your plan?',
  CANCEL_SUBSCRIPTION: 'Are you sure you want to cancel your subscription?',

  // System confirmations
  SYSTEM_RESET: 'Are you sure you want to reset the system?',
  BACKUP_SYSTEM: 'Are you sure you want to backup the system?',
  RESTORE_SYSTEM: 'Are you sure you want to restore the system?',
  MAINTENANCE_MODE: 'Are you sure you want to enable maintenance mode?',

  // Permanent action warnings
  PERMANENT_ACTION: 'This action cannot be undone.',
  DATA_LOSS_WARNING: 'This action will result in permanent data loss.',
  ACCOUNT_DELETION:
    'This will permanently delete your account and all associated data.',
} as const;

// Export all label types
export type PageTitle = (typeof PAGE_TITLES)[keyof typeof PAGE_TITLES];
export type ButtonLabel = (typeof BUTTON_LABELS)[keyof typeof BUTTON_LABELS];
export type StatusLabel = (typeof STATUS_LABELS)[keyof typeof STATUS_LABELS];
export type EmptyStateMessage =
  (typeof EMPTY_STATE_MESSAGES)[keyof typeof EMPTY_STATE_MESSAGES];
export type ErrorLabel = (typeof ERROR_LABELS)[keyof typeof ERROR_LABELS];
export type SuccessLabel = (typeof SUCCESS_LABELS)[keyof typeof SUCCESS_LABELS];
export type TooltipLabel = (typeof TOOLTIP_LABELS)[keyof typeof TOOLTIP_LABELS];
export type PlaceholderText =
  (typeof PLACEHOLDER_TEXTS)[keyof typeof PLACEHOLDER_TEXTS];
export type LoadingMessage =
  (typeof LOADING_MESSAGES)[keyof typeof LOADING_MESSAGES];
export type ConfirmationMessage =
  (typeof CONFIRMATION_MESSAGES)[keyof typeof CONFIRMATION_MESSAGES];
