// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: '/auth',
  SIGNUP: '/auth?mode=signup',
  FORGOT_PASSWORD: '/auth?mode=forgot-password',
  ANONYMOUS_CHAT: '/anonymous-chat',
} as const;

// Protected Routes - routes that require authentication (currently active routes only)
export const PROTECTED_ROUTES = ['/dashboard/chats', '/chat'] as const;

// Commented Protected Routes - routes that will require authentication when uncommented
export const COMMENTED_PROTECTED_ROUTES = [
  '/dashboard',
  '/edit-profile',
] as const;

// Public Routes - routes that don't require authentication
export const PUBLIC_ROUTES = ['/auth', '/anonymous-chat'] as const;

// Anonymous Routes - routes that work for anonymous users
export const ANONYMOUS_ROUTES = ['/anonymous-chat'] as const;

// Feature-limited routes for anonymous users
export const ANONYMOUS_FEATURE_LIMITATIONS = {
  '/anonymous-chat': [
    'No message history saved',
    'Limited to basic chat features',
    'No file backup',
    'No message editing',
    'Session expires on logout',
  ],
} as const;

// Default redirect routes
export const DEFAULT_ROUTES = {
  AFTER_LOGIN: '/dashboard/chats',
  AFTER_LOGOUT: '/auth',
  AFTER_ANONYMOUS_START: '/anonymous-chat',
  UNAUTHORIZED: '/auth',
} as const;

// Authentication Messages
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Signed in successfully!',
  LOGOUT_SUCCESS: 'Signed out successfully!',
  ANONYMOUS_START_SUCCESS: 'Anonymous chat started! Your session is temporary.',
  ANONYMOUS_CONVERSION_SUCCESS:
    'Account created! Your chat history has been saved.',
  SIGNUP_SUCCESS:
    'Account created successfully! Please check your email for verification.',
  PASSWORD_RESET_SENT: 'Password reset email sent! Please check your inbox.',
  EMAIL_VERIFICATION_SENT: 'Verification email sent!',

  // Error Messages
  SIGNIN_FAILED: 'Failed to sign in. Please try again.',
  SIGNUP_FAILED: 'Failed to create account. Please try again.',
  ANONYMOUS_FAILED: 'Failed to start anonymous chat. Please try again.',
  CONVERSION_FAILED: 'Failed to convert anonymous account. Please try again.',
  GOOGLE_SIGNIN_FAILED: 'Failed to sign in with Google. Please try again.',
  APPLE_SIGNIN_FAILED: 'Failed to sign in with Apple. Please try again.',
  PASSWORD_RESET_FAILED: 'Failed to send reset email. Please try again.',
  SIGNOUT_FAILED: 'Failed to sign out. Please try again.',

  // Validation Messages
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters.',
  PASSWORDS_DONT_MATCH: "Passwords don't match.",
  TERMS_REQUIRED: 'You must accept the terms and conditions.',

  // Anonymous Messages
  ANONYMOUS_SESSION_WARNING:
    'Your anonymous session will expire when you close the browser.',
  ANONYMOUS_FEATURE_LIMITED: 'This feature requires a permanent account.',
  ANONYMOUS_CONVERT_PROMPT:
    'Create an account to save your conversations and unlock all features.',

  // Platform Specific
  APPLE_IOS_ONLY: 'Apple Sign In is only available on iOS devices.',
  GOOGLE_SETUP_REQUIRED: 'Google Sign In is not properly configured.',
} as const;

// Authentication Providers
export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
  APPLE: 'apple',
} as const;

// Form Field Names
export const AUTH_FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  DISPLAY_NAME: 'displayName',
  ACCEPT_TERMS: 'acceptTerms',
} as const;

export const AUTH_CONFIG = {
  // Session duration in milliseconds (24 hours)
  SESSION_DURATION: 24 * 60 * 60 * 1000,

  // Routes that require authentication
  PROTECTED_ROUTES: ['/dashboard/chats', '/chat'] as const,

  // Routes that are only accessible to guests (non-authenticated users)
  GUEST_ONLY_ROUTES: ['/auth', '/sign-in', '/sign-up'] as const,

  // Default redirect routes
  REDIRECT_ROUTES: {
    // Where to redirect after login
    AFTER_LOGIN: '/dashboard/chats',

    // Where to redirect when authentication is required
    REQUIRE_AUTH: '/auth',

    // Where to redirect when guest access is required
    REQUIRE_GUEST: '/dashboard/chats',
  },

  // Cookie/Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REMEMBER_ME: 'remember_me',
    LAST_ROUTE: 'last_route',
  },

  // OAuth providers configuration
  OAUTH_PROVIDERS: {
    GOOGLE: {
      enabled: true,
      scopes: ['email', 'profile'],
    },
    APPLE: {
      enabled: true,
      scopes: ['email', 'name'],
    },
  },
} as const;
