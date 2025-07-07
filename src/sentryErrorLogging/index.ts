import ENV_KEYS from '@/utils/envKeys';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { getLocalStorageUser } from '@/utils/helpers/localStorage';
import { W_LOCATION } from '@/utils/helpers/windowLocation';
import { 
  init, 
  replayIntegration, 
  User, 
  addBreadcrumb,
  captureException,
  captureMessage,
  setUser,
  setTag,
  setContext,
  browserTracingIntegration
} from '@sentry/react';

// Define error patterns to ignore
const IGNORE_ERRORS = [
  // Browser extension errors
  'Script error.',
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
  
  // Network errors that are expected
  'Network Error',
  'ERR_NETWORK',
  'ERR_INTERNET_DISCONNECTED',
  
  // React development warnings
  'Warning: validateDOMNesting',
  'Warning: React does not recognize',
  
  // Ad blocker and extension related
  'atomicFindClose',
  'AdBlock',
  
  // Capacitor specific errors (mobile)
  'Capacitor WebView',
  
  // Firebase auth errors that are handled
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
];

const sentryInit = async () => {
  // Check if Sentry DSN is available
  if (!ENV_KEYS.sentryDsn) {
    consoleLog('Sentry DSN not provided, error tracking disabled');
    return;
  }

  try {
    let sentryEnvironment = ENV_KEYS.sentryEnvironment;
    if (window && !ENV_KEYS.sentryEnvironment) {
      sentryEnvironment = W_LOCATION.GET_HOST();
    }

    const integrations = [
      replayIntegration({
        maskAllInputs: true,
        blockAllMedia: true,
        maskAllText: false, // Allow text for better debugging
        blockClass: 'sentry-block', // Block elements with this class
        maskClass: 'sentry-mask', // Mask elements with this class
      }),
      browserTracingIntegration({
        // Add tracing for better performance monitoring
        tracePropagationTargets: [
          'localhost',
          /^\/api\//,
          /^https:\/\/.*\.firebaseapp\.com/,
          /^https:\/\/.*\.googleapis\.com/,
        ],
      }),
    ];

    // Get user information for better error context
    const user = await getLocalStorageUser();

    init({
      dsn: ENV_KEYS.sentryDsn,
      integrations,
      tracesSampleRate: ENV_KEYS.isProduction ? 0.1 : 0.7, // Lower sampling in production
      debug: !ENV_KEYS.isProduction, // Only debug in development
      initialScope: {
        user: user as User | undefined,
        tags: { 
          sentryEnvironment,
          nodeEnv: ENV_KEYS.NODE_ENV,
          version: import.meta.env.PACKAGE_VERSION || '1.0.0',
        },
      },
      environment: sentryEnvironment || ENV_KEYS.NODE_ENV,
      replaysOnErrorSampleRate: ENV_KEYS.isProduction ? 0.1 : 1.0,
      replaysSessionSampleRate: ENV_KEYS.isProduction ? 0.01 : 0.1,
      
      ignoreErrors: IGNORE_ERRORS,
      
      beforeSend(event, hint) {
        // Filter out development-only errors
        if (!ENV_KEYS.isProduction) {
          consoleLog('Sentry event:', event);
        }

        // Don't send events with certain patterns
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message);
          if (IGNORE_ERRORS.some(pattern => message.includes(pattern))) {
            return null;
          }
        }

        return event;
      },
      
      beforeBreadcrumb(breadcrumb) {
        // Filter out noisy breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
          return null;
        }
        
        return breadcrumb;
      },
    });

    // Set up global error handlers
    window.addEventListener('unhandledrejection', (event) => {
      consoleError('Unhandled promise rejection:', event.reason);
      captureException(event.reason);
    });

    // Add context about the application
    setContext('app', {
      name: 'AI Personal Assistant',
      version: import.meta.env.PACKAGE_VERSION || '1.0.0',
      environment: sentryEnvironment,
    });

    // Add device/browser context
    setContext('device', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    });

    consoleLog('Sentry error tracking initialized successfully');
    
    // Test Sentry in development
    if (!ENV_KEYS.isProduction) {
      addBreadcrumb({
        message: 'Sentry initialized',
        level: 'info',
        category: 'init',
      });
    }

  } catch (error) {
    consoleError('Failed to initialize Sentry:', error);
  }
};

// Helper functions for better error tracking
export const logError = (error: Error | string, context?: Record<string, any>) => {
  if (context) {
    setContext('errorContext', context);
  }
  
  if (typeof error === 'string') {
    captureMessage(error, 'error');
  } else {
    captureException(error);
  }
};

export const logWarning = (message: string, context?: Record<string, any>) => {
  if (context) {
    setContext('warningContext', context);
  }
  captureMessage(message, 'warning');
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  if (context) {
    setContext('infoContext', context);
  }
  captureMessage(message, 'info');
};

export const updateSentryUser = (userData: {
  id?: string;
  email?: string;
  role?: string;
  subscription?: string;
}) => {
  setUser({
    id: userData.id,
    email: userData.email,
  });
  
  if (userData.role) {
    setTag('userRole', userData.role);
  }
  
  if (userData.subscription) {
    setTag('subscriptionPlan', userData.subscription);
  }
};

export const addBreadcrumbLog = (message: string, category: string = 'custom', data?: Record<string, any>) => {
  addBreadcrumb({
    message,
    level: 'info',
    category,
    data,
  });
};

// Alias for backward compatibility
export const setUserContext = updateSentryUser;

export default sentryInit;
