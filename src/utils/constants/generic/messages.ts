// User-facing messages constants
export const TOAST_MESSAGES = {
  // Success messages
  SUCCESS: {
    WELCOME_BACK: 'Welcome back! You have signed in successfully.',
    GOOGLE_SIGNIN: 'Welcome! You have signed in with Google successfully.',
    APPLE_SIGNIN: 'Welcome! You have signed in with Apple successfully.',
    ACCOUNT_CREATED:
      'Account created successfully! Please check your email for verification.',
    ACCOUNT_CREATED_GOOGLE:
      'Welcome! Account created with Google successfully.',
    ACCOUNT_CREATED_APPLE: 'Welcome! Account created with Apple successfully.',
    ANONYMOUS_WELCOME: 'Welcome! You can start chatting anonymously now.',
    ANONYMOUS_CONVERSION: 'Account created! Your chat history has been saved.',
    PASSWORD_RESET_SENT: 'Password reset email sent! Please check your inbox.',
    PASSWORD_RESET_SENT_AGAIN: 'Password reset email sent again!',
    CHAT_CLEARED: 'Chat cleared successfully',
    CHAT_DELETED: 'Chat deleted successfully',
    USER_BLOCKED: 'has been blocked',
    MESSAGE_DELETED: 'Message deleted successfully',
    MESSAGE_UPDATED: 'Message updated successfully',
    MESSAGE_SENT: 'message sent successfully!',
    FEEDBACK_SUBMITTED: 'Thank you for your feedback!',
    EMBED_CREATED: 'Embed created successfully!',
    EMBED_UPDATED: 'Embed updated successfully!',
    EMBED_DELETED: 'Embed deleted successfully!',
    EMBED_CODE_COPIED: 'Embed code copied to clipboard!',
    ROOM_ID_COPIED: 'Room ID copied to clipboard!',
    CLIPBOARD_SUCCESS: 'Copied to clipboard!',
    ROOM_WELCOME: 'Welcome to room',
    EMAIL_CASING_FIXED: 'Fixed email casing for',
    PHOTO_SAVED: 'Photo saved successfully!',
    VIDEO_SAVED: 'Video saved successfully!',
  },

  // Error messages
  ERROR: {
    SIGNIN_FAILED: 'Failed to sign in',
    GOOGLE_SIGNIN_FAILED: 'Google sign in failed. Please try again.',
    APPLE_SIGNIN_FAILED: 'Apple sign in failed. Please try again.',
    ACCOUNT_CREATION_FAILED: 'Failed to create account. Please try again.',
    ANONYMOUS_FAILED: 'Failed to start anonymous chat. Please try again.',
    CONVERSION_FAILED: 'Failed to convert anonymous account. Please try again.',
    PASSWORD_RESET_FAILED:
      'Failed to send password reset email. Please try again.',
    ENTER_EMAIL: 'Please enter your email address',
    ENTER_ROOM_NAME: 'Please enter a room name',
    ROOM_NAME_LENGTH: 'Room name must be exactly 8 characters',
    ROOM_NAME_ALPHANUMERIC: 'Room name can only contain letters and numbers',
    ENTER_NAME: 'Please enter your name',
    NAME_TOO_LONG: 'Name must be 20 characters or less',
    CHAT_SETUP_FAILED: 'Failed to set up chat',
    MESSAGE_SEND_FAILED: 'Failed to send message',
    MESSAGE_DELETE_FAILED: 'Failed to delete message',
    MESSAGE_EDIT_FAILED: 'Failed to edit message',
    FEEDBACK_FAILED: 'Failed to submit feedback. Please try again.',
    EMBED_LOAD_FAILED: 'Failed to load embeds',
    EMBED_CREATE_FAILED: 'Failed to create embed',
    EMBED_UPDATE_FAILED: 'Failed to update embed',
    EMBED_DELETE_FAILED: 'Failed to delete embed',
    TITLE_REQUIRED: 'Title is required',
    DOMAIN_REQUIRED: 'At least one domain is required',
    USER_NOT_FOUND: 'No user found with email:',
    USER_SEARCH_FAILED: 'Failed to search for user. Please try again.',
    CHAT_START_FAILED: 'Failed to start chat. Please try again.',
    CANNOT_CHAT_YOURSELF: 'You cannot start a chat with yourself',
    MUST_BE_LOGGED_IN: 'You must be logged in to search for users',
    INVALID_FILE_TYPE: 'Invalid file type',
    CLIPBOARD_FAILED: 'Failed to copy to clipboard',
    USERS_LOAD_FAILED: 'Failed to load users',
    EMAIL_CASING_FAILED: 'Failed to fix email casing',
    CAMERA_PERMISSION_DENIED: 'Camera permission denied',
    MICROPHONE_PERMISSION_DENIED:
      'Unable to access microphone. Please check your permissions.',
    CAMERA_CAPTURE_FAILED: 'Camera capture failed',
    GALLERY_SELECTION_FAILED: 'Gallery selection failed',
    FILE_SELECTION_FAILED: 'File selection failed',
    VIDEO_SAVE_FAILED: 'Video save failed',
    PHOTO_CAPTURE_FAILED: 'Error taking photo',
    UPLOAD_FAILED: 'Upload failed',
    HISTORY_LOAD_FAILED: 'Error loading message history',
    USER_DATA_LOAD_FAILED: 'Error loading user data',
    THEME_LOAD_FAILED: 'Error loading theme',
  },

  // Info messages
  INFO: {
    CONTACT_DETAILS_COMING_SOON: 'Contact details coming soon!',
    SHARED_MEDIA_COMING_SOON: 'Shared media browser coming soon!',
    MESSAGE_SEARCH_COMING_SOON: 'Message search coming soon!',
    VIDEO_CALLS_COMING_SOON: 'Video calls coming soon!',
    VOICE_CALLS_COMING_SOON: 'Voice calls coming soon!',
    NO_EMAIL_CASING_ISSUES: 'No email casing issues found!',
    REDIRECTING_TO_UPGRADE: 'Redirecting to upgrade to',
  },

  // Warning messages
  WARNING: {
    ANONYMOUS_SESSION_EXPIRES:
      'Your anonymous session will expire when you close the browser.',
    ANONYMOUS_FEATURE_LIMITED: 'This feature requires a permanent account.',
    ANONYMOUS_CONVERT_PROMPT:
      'Create an account to save your conversations and unlock all features.',
  },
} as const;

// Console messages constants
export const CONSOLE_MESSAGES = {
  // Debug messages
  DEBUG: {
    AUTH_STATE_CHECK: 'Auth State Check:',
    AUTH_SYSTEM_STATUS: '🔄 Auth System Status Changed:',
    SUBSCRIPTION_TESTING: '🧪 Subscription testing utilities loaded:',
    SUBSCRIPTION_SCENARIOS: '- window.subscriptionTests.scenarios.freeUser()',
    SUBSCRIPTION_PRO: '- window.subscriptionTests.scenarios.proUser()',
    SUBSCRIPTION_PREMIUM: '- window.subscriptionTests.scenarios.premiumUser()',
    SUBSCRIPTION_SWITCH: '- window.subscriptionTests.switchToPlan("pro")',
    MESSAGE_SUBSCRIPTION: 'Setting up message subscription for room:',
    RECEIVED_MESSAGES: 'Received room messages:',
    PWA_INSTALL_PROMPT: 'PWA Install: beforeinstallprompt event fired',
    PWA_INSTALL_SUCCESS: 'PWA Install: App was installed',
    PWA_NO_PROMPT: 'PWA Install: No install prompt available',
    PWA_INSTALL_ACCEPTED: 'PWA Install: User accepted the install prompt',
    PWA_INSTALL_DISMISSED: 'PWA Install: User dismissed the install prompt',
    SPEECH_RECOGNITION_SUPPORTED: 'Speech recognition is supported',
    SPEECH_RECOGNITION_RESULT: 'Speech recognition result event:',
    SPEECH_RECOGNITION_STARTED: 'Speech recognition started',
    SPEECH_RECOGNITION_ENDED: 'Speech recognition ended',
    SPEECH_RECOGNITION_RESTARTING: 'Restarting speech recognition...',
    SPEECH_RECOGNITION_NOT_SUPPORTED: 'Speech recognition not supported',
    RECORDING_STARTED: 'Starting recording...',
    RECORDING_STOPPED: 'MediaRecorder stopped, processing audio...',
    RECORDING_STOPPING: 'Stopping recording...',
    PHOTO_CAPTURED: 'Photo captured:',
    FEEDBACK_SUBMITTED_LOG: 'Feedback submitted:',
    FEEDBACK_STEP_CHANGED: 'Feedback step changed to:',
    FEEDBACK_SUCCESS_LOG: 'Feedback submitted successfully!',
    ADDING_SEGMENT: 'Adding segment with timing:',
  },

  // Error messages
  ERROR: {
    SAVING_USER_PROFILE: 'Error saving user profile data:',
    RETRIEVING_USER_PROFILE: 'Error retrieving user profile data:',
    SAVING_THEME: 'Error saving theme settings:',
    RETRIEVING_THEME: 'Error retrieving theme settings:',
    SAVING_PREFERENCES: 'Error saving app preferences:',
    RETRIEVING_PREFERENCES: 'Error retrieving app preferences:',
    SENDING_MESSAGE: 'Error sending message:',
    DELETING_MESSAGE: 'Error deleting message:',
    EDITING_MESSAGE: 'Error editing message:',
    SUBMITTING_FEEDBACK: 'Error submitting feedback:',
    FETCHING_FEEDBACK: 'Error fetching feedback:',
    FETCHING_SESSION_FEEDBACK: 'Error fetching session feedback:',
    FETCHING_FEEDBACK_STATS: 'Error fetching feedback stats:',
    CHECKING_RECENT_FEEDBACK: 'Error checking recent feedback:',
    ROOT_ELEMENT_NOT_FOUND: 'Root element not found',
    DISMISSING_FEEDBACK_WIDGET: 'Error dismissing feedback widget:',
    CHECKING_WIDGET_DISMISSAL: 'Error checking widget dismissal status:',
    CLEARING_DISMISSAL_STATUS: 'Error clearing dismissal status:',
    GETTING_TIME_REMAINING: 'Error getting time remaining:',
    FEEDBACK_ERROR: 'Feedback error:',
    UPLOAD_ERROR: 'Upload error:',
    SPEECH_RECOGNITION_ERROR: 'Speech recognition error:',
    SPEECH_RECOGNITION_PERMISSION_DENIED:
      'Speech recognition permission denied',
    SPEECH_RECOGNITION_START_FAILED: 'Speech recognition start failed:',
    SPEECH_RECOGNITION_RESUME_FAILED: 'Speech recognition resume failed:',
    SPEECH_RECOGNITION_RESTART_FAILED: 'Recognition restart failed:',
    RECORDING_START_FAILED: 'Error starting recording:',
    CURRENT_LOCATION_INFO: 'Error in getUserCurrentLocationInfo:',
    CLIPBOARD_COPY_FAILED: 'Clipboard copy failed:',
  },

  // Warning messages
  WARNING: {
    FAILED_PARSE_SEARCH_PARAMS: 'Failed to parse search params:',
  },
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: {
    EMAIL: 'Please enter a valid email address.',
    PASSWORD: 'Please enter your password.',
    CONFIRM_PASSWORD: 'Please confirm your password.',
    DISPLAY_NAME: 'Please enter your display name.',
    TERMS_ACCEPTANCE: 'You must accept the terms and conditions.',
    ROOM_NAME: 'Please enter a room name.',
    USER_NAME: 'Please enter your name.',
    TITLE: 'Title is required.',
    DOMAIN: 'At least one domain is required.',
  },
  FORMAT: {
    EMAIL: 'Please enter a valid email address.',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters.',
    PASSWORDS_DONT_MATCH: "Passwords don't match.",
    ROOM_NAME_LENGTH: 'Room name must be exactly 8 characters.',
    ROOM_NAME_ALPHANUMERIC: 'Room name can only contain letters and numbers.',
    NAME_TOO_LONG: 'Name must be 20 characters or less.',
  },
} as const;

// Status messages
export const STATUS_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  CONNECTING: 'Connecting...',
  DISCONNECTED: 'Disconnected',
  RECONNECTING: 'Reconnecting...',
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  TYPING: 'Typing...',
  RECORDING: 'Recording...',
} as const;

// Default values
export const DEFAULT_VALUES = {
  USER_NAME: 'Anonymous User',
  CHAT_PLACEHOLDER: 'Type your message...',
  SEARCH_PLACEHOLDER: 'Search...',
  EMAIL_PLACEHOLDER: 'Enter your email',
  PASSWORD_PLACEHOLDER: 'Enter your password',
  ROOM_NAME_PLACEHOLDER: 'Enter 8-character room name',
  USER_NAME_PLACEHOLDER: 'Enter your name',
  TITLE_PLACEHOLDER: 'Enter title',
  DOMAIN_PLACEHOLDER: 'Enter domain',
} as const;

// Confirm dialog messages
export const CONFIRM_MESSAGES = {
  DELETE_CHAT: 'Are you sure you want to delete this chat?',
  DELETE_MESSAGE: 'Are you sure you want to delete this message?',
  CLEAR_CHAT: 'Are you sure you want to clear this chat?',
  BLOCK_USER: 'Are you sure you want to block this user?',
  LOGOUT: 'Are you sure you want to logout?',
  CANCEL_SUBSCRIPTION: 'Are you sure you want to cancel your subscription?',
  UPGRADE_PLAN: 'Are you sure you want to upgrade your plan?',
  DELETE_ACCOUNT: 'Are you sure you want to delete your account?',
} as const;

// Helper type for message keys
export type ToastMessageKey = keyof typeof TOAST_MESSAGES;
export type ConsoleMessageKey = keyof typeof CONSOLE_MESSAGES;
export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
export type StatusMessageKey = keyof typeof STATUS_MESSAGES;
export type ConfirmMessageKey = keyof typeof CONFIRM_MESSAGES;
