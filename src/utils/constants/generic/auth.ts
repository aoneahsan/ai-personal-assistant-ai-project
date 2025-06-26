// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: '/auth',
  SIGNUP: '/auth?mode=signup',
  FORGOT_PASSWORD: '/auth?mode=forgot-password',
} as const;

// Protected Routes - routes that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/modern-dashboard',
  '/compact-dashboard',
  '/edit-profile',
  '/compact-edit-profile',
  '/chats',
  '/chat',
] as const;

// Public Routes - routes accessible without authentication
export const PUBLIC_ROUTES = ['/auth'] as const;

// Default redirect routes
export const DEFAULT_ROUTES = {
  AFTER_LOGIN: '/dashboard',
  AFTER_LOGOUT: '/auth',
  UNAUTHORIZED: '/auth',
} as const;

// Authentication Messages
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Signed in successfully!',
  LOGOUT_SUCCESS: 'Signed out successfully!',
  SIGNUP_SUCCESS:
    'Account created successfully! Please check your email for verification.',
  PASSWORD_RESET_SENT: 'Password reset email sent! Please check your inbox.',
  EMAIL_VERIFICATION_SENT: 'Verification email sent!',

  // Error Messages
  SIGNIN_FAILED: 'Failed to sign in. Please try again.',
  SIGNUP_FAILED: 'Failed to create account. Please try again.',
  GOOGLE_SIGNIN_FAILED: 'Failed to sign in with Google. Please try again.',
  APPLE_SIGNIN_FAILED: 'Failed to sign in with Apple. Please try again.',
  PASSWORD_RESET_FAILED: 'Failed to send reset email. Please try again.',
  SIGNOUT_FAILED: 'Failed to sign out. Please try again.',

  // Validation Messages
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters.',
  PASSWORDS_DONT_MATCH: "Passwords don't match.",
  TERMS_REQUIRED: 'You must accept the terms and conditions.',

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
