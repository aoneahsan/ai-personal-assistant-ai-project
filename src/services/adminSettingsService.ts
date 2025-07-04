import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';
import { FIREBASE_COLLECTIONS } from '../utils/constants/generic/firebase';
import {
  BUSINESS_CONSTANTS,
  DIMENSION_CONSTANTS,
  NETWORK_CONSTANTS,
  PERFORMANCE_CONSTANTS,
  TIME_CONSTANTS,
  VALIDATION_CONSTANTS,
} from '../utils/constants/generic/numbers';
import { firestore } from './firebase';

// Admin Settings Interface
export interface AdminSettings {
  // System Settings
  system: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    debugMode: boolean;
    loggingLevel: 'error' | 'warn' | 'info' | 'debug';
    environment: 'development' | 'staging' | 'production';
    version: string;
    lastUpdated: Date;
    updatedBy: string;
  };

  // Feature Flags
  features: {
    // Core Features
    anonymousChat: boolean;
    embedSystem: boolean;
    feedbackSystem: boolean;
    subscriptionSystem: boolean;
    analytics: boolean;
    notifications: boolean;

    // Advanced Features
    voiceMessages: boolean;
    fileUploads: boolean;
    videoChat: boolean;
    screenSharing: boolean;
    aiAssistant: boolean;
    multiLanguage: boolean;

    // Admin Features
    userManagement: boolean;
    settingsManagement: boolean;
    auditLogs: boolean;
    systemMonitoring: boolean;
  };

  // Timing Configuration
  timing: {
    // Timeouts
    authTimeout: number;
    sessionTimeout: number;
    toastDuration: number;
    animationDuration: number;

    // Polling intervals
    statusPollingInterval: number;
    dataRefreshInterval: number;
    heartbeatInterval: number;

    // Cache durations
    shortCacheDuration: number;
    mediumCacheDuration: number;
    longCacheDuration: number;

    // Feedback system
    feedbackDelayTrigger: number;
    feedbackDismissHours: number;
    thankYouDisplayDuration: number;
    retryDelay: number;
  };

  // UI Configuration
  ui: {
    // Widget dimensions
    widgetDefaultWidth: number;
    widgetDefaultHeight: number;
    widgetMinWidth: number;
    widgetMinHeight: number;
    widgetMaxWidth: number;
    widgetMaxHeight: number;

    // Modal dimensions
    modalSmallWidth: number;
    modalMediumWidth: number;
    modalLargeWidth: number;
    modalExtraLargeWidth: number;

    // Spacing
    spacingSmall: number;
    spacingMedium: number;
    spacingLarge: number;
    spacingExtraLarge: number;

    // Border radius
    borderRadiusSmall: number;
    borderRadiusMedium: number;
    borderRadiusLarge: number;

    // Themes
    defaultTheme: 'light' | 'dark' | 'system';
    allowThemeSwitching: boolean;
    customThemes: string[];
  };

  // Validation Rules
  validation: {
    // Text limits
    roomNameLength: number;
    userNameMax: number;
    userNameMin: number;
    passwordMin: number;
    messageMax: number;
    feedbackMax: number;
    titleMax: number;
    descriptionMax: number;
    emailMax: number;
    phoneMax: number;

    // Numeric limits
    retryAttempts: number;
    maxUploadRetries: number;
    maxLoginAttempts: number;
    maxItemsPerPage: number;
    defaultPageSize: number;
    maxSearchResults: number;

    // Image quality
    imageQualityDefault: number;
    imageQualityThumbnail: number;
    imageQualityPreview: number;
    imageQualityHigh: number;

    // Rating system
    ratingMin: number;
    ratingMax: number;
    ratingDefault: number;
  };

  // Business Rules
  business: {
    // Subscription limits
    freeMessageLimit: number;
    proMessageLimit: number;
    premiumMessageLimit: number;
    freeStorageMB: number;
    proStorageMB: number;
    premiumStorageMB: number;

    // Feature limits
    maxEmbedsFree: number;
    maxEmbedsPro: number;
    maxEmbedsPremium: number;
    maxParticipantsRoom: number;
    maxChatHistoryDays: number;
    maxFileUploadsDay: number;

    // Analytics
    analyticsBatchSize: number;
    analyticsFlushInterval: number;
    analyticsMaxEventsQueue: number;
    analyticsRetentionDays: number;

    // Pricing
    subscriptionPrices: {
      monthly: {
        pro: number;
        premium: number;
      };
      yearly: {
        pro: number;
        premium: number;
      };
    };

    // Discounts
    discountPercentages: {
      student: number;
      bulk: number;
      annual: number;
    };
  };

  // Network Configuration
  network: {
    // Request timeouts
    defaultTimeout: number;
    shortTimeout: number;
    uploadTimeout: number;
    downloadTimeout: number;
    longPollingTimeout: number;
    streamingTimeout: number;

    // Retry configuration
    maxRetryAttempts: number;
    initialRetryDelay: number;
    retryBackoffMultiplier: number;
    maxRetryDelay: number;

    // Rate limiting
    rateLimitRequests: number;
    rateLimitWindow: number;

    // CDN Configuration
    cdnEnabled: boolean;
    cdnBaseUrl: string;
    cdnRegions: string[];
  };

  // Performance Configuration
  performance: {
    // Virtual scrolling
    virtualScrollItemHeight: number;
    virtualScrollBufferSize: number;
    virtualScrollViewportHeight: number;

    // Lazy loading
    lazyLoadingThreshold: number;
    lazyLoadingRootMargin: string;
    lazyLoadingDebounceDelay: number;

    // Chunking
    fileChunkSize: number;
    batchProcessSize: number;
    renderBatchSize: number;

    // Caching
    memoryCacheSize: number;
    diskCacheSize: number;
    cacheCompressionEnabled: boolean;

    // Monitoring
    performanceMonitoringEnabled: boolean;
    performanceMetricsInterval: number;
    memoryUsageThreshold: number;
    cpuUsageThreshold: number;
  };

  // Security Configuration
  security: {
    // Authentication
    passwordComplexity: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };

    // Session management
    sessionDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;

    // File upload security
    allowedFileTypes: string[];
    maxFileSize: number;
    virusScanEnabled: boolean;

    // Content security
    contentModerationEnabled: boolean;
    profanityFilterEnabled: boolean;
    spamDetectionEnabled: boolean;

    // API Security
    apiKeyRequired: boolean;
    rateLimitingEnabled: boolean;
    corsOrigins: string[];

    // Encryption
    encryptionEnabled: boolean;
    encryptionAlgorithm: string;
    keyRotationDays: number;
  };

  // Integration Configuration
  integrations: {
    // Third-party services
    googleAuth: {
      enabled: boolean;
      clientId: string;
      redirectUri: string;
    };

    appleAuth: {
      enabled: boolean;
      clientId: string;
      redirectUri: string;
    };

    oneSignal: {
      enabled: boolean;
      appId: string;
      apiKey: string;
    };

    amplitude: {
      enabled: boolean;
      apiKey: string;
      endpoint: string;
    };

    sentry: {
      enabled: boolean;
      dsn: string;
      environment: string;
      sampleRate: number;
    };

    // AI Services
    openAI: {
      enabled: boolean;
      apiKey: string;
      model: string;
      maxTokens: number;
    };

    // Payment processing
    stripe: {
      enabled: boolean;
      publishableKey: string;
      secretKey: string;
      webhookSecret: string;
    };

    // Communication
    email: {
      enabled: boolean;
      provider: 'sendgrid' | 'mailgun' | 'ses';
      apiKey: string;
      fromEmail: string;
    };

    sms: {
      enabled: boolean;
      provider: 'twilio' | 'nexmo';
      apiKey: string;
      fromNumber: string;
    };
  };

  // Localization Configuration
  localization: {
    defaultLanguage: string;
    availableLanguages: string[];
    rtlLanguages: string[];
    dateFormat: string;
    timeFormat: string;
    currency: string;
    numberFormat: string;
    timezone: string;

    // Translation
    translationEnabled: boolean;
    autoTranslate: boolean;
    translationProvider: 'google' | 'aws' | 'azure';
    translationApiKey: string;
  };

  // Monitoring & Analytics
  monitoring: {
    // Error tracking
    errorTrackingEnabled: boolean;
    errorReportingEmail: string;
    errorThreshold: number;

    // Performance monitoring
    performanceMonitoringEnabled: boolean;
    performanceThreshold: number;

    // Usage analytics
    usageAnalyticsEnabled: boolean;
    analyticsRetentionDays: number;

    // Health checks
    healthCheckEnabled: boolean;
    healthCheckInterval: number;
    healthCheckEndpoints: string[];

    // Alerts
    alertsEnabled: boolean;
    alertChannels: ('email' | 'sms' | 'slack' | 'webhook')[];
    criticalAlertThreshold: number;
    warningAlertThreshold: number;
  };
}

// Default settings based on constants
export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  system: {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
    debugMode: false,
    loggingLevel: 'info',
    environment: 'production',
    version: '1.0.0',
    lastUpdated: new Date(),
    updatedBy: 'system',
  },

  features: {
    anonymousChat: true,
    embedSystem: true,
    feedbackSystem: true,
    subscriptionSystem: true,
    analytics: true,
    notifications: true,
    voiceMessages: true,
    fileUploads: true,
    videoChat: false,
    screenSharing: false,
    aiAssistant: true,
    multiLanguage: true,
    userManagement: true,
    settingsManagement: true,
    auditLogs: true,
    systemMonitoring: true,
  },

  timing: {
    authTimeout: TIME_CONSTANTS.AUTH.STATE_CHANGE_TIMEOUT,
    sessionTimeout: TIME_CONSTANTS.SESSION.DAY,
    toastDuration: TIME_CONSTANTS.TOAST.MEDIUM,
    animationDuration: TIME_CONSTANTS.ANIMATION.NORMAL,
    statusPollingInterval: TIME_CONSTANTS.POLLING.NORMAL,
    dataRefreshInterval: TIME_CONSTANTS.POLLING.SLOW,
    heartbeatInterval: TIME_CONSTANTS.POLLING.FAST,
    shortCacheDuration: TIME_CONSTANTS.CACHE.SHORT,
    mediumCacheDuration: TIME_CONSTANTS.CACHE.MEDIUM,
    longCacheDuration: TIME_CONSTANTS.CACHE.LONG,
    feedbackDelayTrigger: TIME_CONSTANTS.FEEDBACK.DELAY_TRIGGER,
    feedbackDismissHours: TIME_CONSTANTS.FEEDBACK.DISMISS_HOURS,
    thankYouDisplayDuration: TIME_CONSTANTS.FEEDBACK.THANK_YOU_DISPLAY,
    retryDelay: TIME_CONSTANTS.FEEDBACK.RETRY_DELAY,
  },

  ui: {
    widgetDefaultWidth: DIMENSION_CONSTANTS.WIDGET.DEFAULT_WIDTH,
    widgetDefaultHeight: DIMENSION_CONSTANTS.WIDGET.DEFAULT_HEIGHT,
    widgetMinWidth: DIMENSION_CONSTANTS.WIDGET.MIN_WIDTH,
    widgetMinHeight: DIMENSION_CONSTANTS.WIDGET.MIN_HEIGHT,
    widgetMaxWidth: DIMENSION_CONSTANTS.WIDGET.MAX_WIDTH,
    widgetMaxHeight: DIMENSION_CONSTANTS.WIDGET.MAX_HEIGHT,
    modalSmallWidth: DIMENSION_CONSTANTS.MODAL.SMALL_WIDTH,
    modalMediumWidth: DIMENSION_CONSTANTS.MODAL.MEDIUM_WIDTH,
    modalLargeWidth: DIMENSION_CONSTANTS.MODAL.LARGE_WIDTH,
    modalExtraLargeWidth: DIMENSION_CONSTANTS.MODAL.EXTRA_LARGE_WIDTH,
    spacingSmall: DIMENSION_CONSTANTS.SPACING.SMALL,
    spacingMedium: DIMENSION_CONSTANTS.SPACING.MEDIUM,
    spacingLarge: DIMENSION_CONSTANTS.SPACING.LARGE,
    spacingExtraLarge: DIMENSION_CONSTANTS.SPACING.EXTRA_LARGE,
    borderRadiusSmall: DIMENSION_CONSTANTS.BORDER_RADIUS.SMALL,
    borderRadiusMedium: DIMENSION_CONSTANTS.BORDER_RADIUS.MEDIUM,
    borderRadiusLarge: DIMENSION_CONSTANTS.BORDER_RADIUS.LARGE,
    defaultTheme: 'system',
    allowThemeSwitching: true,
    customThemes: [],
  },

  validation: {
    roomNameLength: VALIDATION_CONSTANTS.TEXT_LIMITS.ROOM_NAME_LENGTH,
    userNameMax: VALIDATION_CONSTANTS.TEXT_LIMITS.USER_NAME_MAX,
    userNameMin: VALIDATION_CONSTANTS.TEXT_LIMITS.USER_NAME_MIN,
    passwordMin: VALIDATION_CONSTANTS.TEXT_LIMITS.PASSWORD_MIN,
    messageMax: VALIDATION_CONSTANTS.TEXT_LIMITS.MESSAGE_MAX,
    feedbackMax: VALIDATION_CONSTANTS.TEXT_LIMITS.FEEDBACK_MAX,
    titleMax: VALIDATION_CONSTANTS.TEXT_LIMITS.TITLE_MAX,
    descriptionMax: VALIDATION_CONSTANTS.TEXT_LIMITS.DESCRIPTION_MAX,
    emailMax: VALIDATION_CONSTANTS.TEXT_LIMITS.EMAIL_MAX,
    phoneMax: VALIDATION_CONSTANTS.TEXT_LIMITS.PHONE_MAX,
    retryAttempts: VALIDATION_CONSTANTS.NUMERIC_LIMITS.RETRY_ATTEMPTS,
    maxUploadRetries: VALIDATION_CONSTANTS.NUMERIC_LIMITS.MAX_UPLOAD_RETRIES,
    maxLoginAttempts: VALIDATION_CONSTANTS.NUMERIC_LIMITS.MAX_LOGIN_ATTEMPTS,
    maxItemsPerPage: VALIDATION_CONSTANTS.NUMERIC_LIMITS.MAX_ITEMS_PER_PAGE,
    defaultPageSize: VALIDATION_CONSTANTS.NUMERIC_LIMITS.DEFAULT_PAGE_SIZE,
    maxSearchResults: VALIDATION_CONSTANTS.NUMERIC_LIMITS.MAX_SEARCH_RESULTS,
    imageQualityDefault: VALIDATION_CONSTANTS.PERCENTAGE.IMAGE_QUALITY_DEFAULT,
    imageQualityThumbnail:
      VALIDATION_CONSTANTS.PERCENTAGE.IMAGE_QUALITY_THUMBNAIL,
    imageQualityPreview: VALIDATION_CONSTANTS.PERCENTAGE.IMAGE_QUALITY_PREVIEW,
    imageQualityHigh: VALIDATION_CONSTANTS.PERCENTAGE.IMAGE_QUALITY_HIGH,
    ratingMin: VALIDATION_CONSTANTS.RATING.MIN,
    ratingMax: VALIDATION_CONSTANTS.RATING.MAX,
    ratingDefault: VALIDATION_CONSTANTS.RATING.DEFAULT,
  },

  business: {
    freeMessageLimit: BUSINESS_CONSTANTS.SUBSCRIPTION.FREE_MESSAGE_LIMIT,
    proMessageLimit: BUSINESS_CONSTANTS.SUBSCRIPTION.PRO_MESSAGE_LIMIT,
    premiumMessageLimit: BUSINESS_CONSTANTS.SUBSCRIPTION.PREMIUM_MESSAGE_LIMIT,
    freeStorageMB: BUSINESS_CONSTANTS.SUBSCRIPTION.FREE_STORAGE_MB,
    proStorageMB: BUSINESS_CONSTANTS.SUBSCRIPTION.PRO_STORAGE_MB,
    premiumStorageMB: BUSINESS_CONSTANTS.SUBSCRIPTION.PREMIUM_STORAGE_MB,
    maxEmbedsFree: BUSINESS_CONSTANTS.FEATURES.MAX_EMBEDS_FREE,
    maxEmbedsPro: BUSINESS_CONSTANTS.FEATURES.MAX_EMBEDS_PRO,
    maxEmbedsPremium: BUSINESS_CONSTANTS.FEATURES.MAX_EMBEDS_PREMIUM,
    maxParticipantsRoom: BUSINESS_CONSTANTS.FEATURES.MAX_PARTICIPANTS_ROOM,
    maxChatHistoryDays: BUSINESS_CONSTANTS.FEATURES.MAX_CHAT_HISTORY_DAYS,
    maxFileUploadsDay: BUSINESS_CONSTANTS.FEATURES.MAX_FILE_UPLOADS_DAY,
    analyticsBatchSize: BUSINESS_CONSTANTS.ANALYTICS.BATCH_SIZE,
    analyticsFlushInterval: BUSINESS_CONSTANTS.ANALYTICS.FLUSH_INTERVAL,
    analyticsMaxEventsQueue: BUSINESS_CONSTANTS.ANALYTICS.MAX_EVENTS_QUEUE,
    analyticsRetentionDays: BUSINESS_CONSTANTS.ANALYTICS.RETENTION_DAYS,
    subscriptionPrices: {
      monthly: {
        pro: 29.99,
        premium: 99.99,
      },
      yearly: {
        pro: 299.99,
        premium: 999.99,
      },
    },
    discountPercentages: {
      student: 50,
      bulk: 20,
      annual: 20,
    },
  },

  network: {
    defaultTimeout: NETWORK_CONSTANTS.TIMEOUTS.DEFAULT,
    shortTimeout: NETWORK_CONSTANTS.TIMEOUTS.SHORT,
    uploadTimeout: NETWORK_CONSTANTS.TIMEOUTS.UPLOAD,
    downloadTimeout: NETWORK_CONSTANTS.TIMEOUTS.DOWNLOAD,
    longPollingTimeout: NETWORK_CONSTANTS.TIMEOUTS.LONG_POLLING,
    streamingTimeout: NETWORK_CONSTANTS.TIMEOUTS.STREAMING,
    maxRetryAttempts: NETWORK_CONSTANTS.RETRY.MAX_ATTEMPTS,
    initialRetryDelay: NETWORK_CONSTANTS.RETRY.INITIAL_DELAY,
    retryBackoffMultiplier: NETWORK_CONSTANTS.RETRY.BACKOFF_MULTIPLIER,
    maxRetryDelay: NETWORK_CONSTANTS.RETRY.MAX_DELAY,
    rateLimitRequests: 100,
    rateLimitWindow: 3600000, // 1 hour
    cdnEnabled: false,
    cdnBaseUrl: '',
    cdnRegions: [],
  },

  performance: {
    virtualScrollItemHeight: PERFORMANCE_CONSTANTS.VIRTUAL_SCROLL.ITEM_HEIGHT,
    virtualScrollBufferSize: PERFORMANCE_CONSTANTS.VIRTUAL_SCROLL.BUFFER_SIZE,
    virtualScrollViewportHeight:
      PERFORMANCE_CONSTANTS.VIRTUAL_SCROLL.VIEWPORT_HEIGHT,
    lazyLoadingThreshold:
      PERFORMANCE_CONSTANTS.LAZY_LOADING.INTERSECTION_THRESHOLD,
    lazyLoadingRootMargin: PERFORMANCE_CONSTANTS.LAZY_LOADING.ROOT_MARGIN,
    lazyLoadingDebounceDelay: PERFORMANCE_CONSTANTS.LAZY_LOADING.DEBOUNCE_DELAY,
    fileChunkSize: PERFORMANCE_CONSTANTS.CHUNKING.FILE_CHUNK_SIZE,
    batchProcessSize: PERFORMANCE_CONSTANTS.CHUNKING.BATCH_PROCESS_SIZE,
    renderBatchSize: PERFORMANCE_CONSTANTS.CHUNKING.RENDER_BATCH_SIZE,
    memoryCacheSize: 100 * 1024 * 1024, // 100MB
    diskCacheSize: 1024 * 1024 * 1024, // 1GB
    cacheCompressionEnabled: true,
    performanceMonitoringEnabled: true,
    performanceMetricsInterval: 60000, // 1 minute
    memoryUsageThreshold: 80,
    cpuUsageThreshold: 70,
  },

  security: {
    passwordComplexity: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 5,
    allowedFileTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    virusScanEnabled: true,
    contentModerationEnabled: true,
    profanityFilterEnabled: true,
    spamDetectionEnabled: true,
    apiKeyRequired: true,
    rateLimitingEnabled: true,
    corsOrigins: ['https://localhost:3000'],
    encryptionEnabled: true,
    encryptionAlgorithm: 'AES-256-GCM',
    keyRotationDays: 90,
  },

  integrations: {
    googleAuth: {
      enabled: true,
      clientId: '',
      redirectUri: '',
    },
    appleAuth: {
      enabled: true,
      clientId: '',
      redirectUri: '',
    },
    oneSignal: {
      enabled: true,
      appId: '',
      apiKey: '',
    },
    amplitude: {
      enabled: true,
      apiKey: '',
      endpoint: '',
    },
    sentry: {
      enabled: true,
      dsn: '',
      environment: 'production',
      sampleRate: 1.0,
    },
    openAI: {
      enabled: true,
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 2048,
    },
    stripe: {
      enabled: true,
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
    },
    email: {
      enabled: true,
      provider: 'sendgrid',
      apiKey: '',
      fromEmail: '',
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: '',
      fromNumber: '',
    },
  },

  localization: {
    defaultLanguage: 'en',
    availableLanguages: [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'ru',
      'zh',
      'ja',
      'ko',
    ],
    rtlLanguages: ['ar', 'he', 'fa'],
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    currency: 'USD',
    numberFormat: 'en-US',
    timezone: 'UTC',
    translationEnabled: true,
    autoTranslate: false,
    translationProvider: 'google',
    translationApiKey: '',
  },

  monitoring: {
    errorTrackingEnabled: true,
    errorReportingEmail: '',
    errorThreshold: 10,
    performanceMonitoringEnabled: true,
    performanceThreshold: 2000,
    usageAnalyticsEnabled: true,
    analyticsRetentionDays: 90,
    healthCheckEnabled: true,
    healthCheckInterval: 60000,
    healthCheckEndpoints: ['/health', '/api/health'],
    alertsEnabled: true,
    alertChannels: ['email'],
    criticalAlertThreshold: 95,
    warningAlertThreshold: 80,
  },
};

// Admin Settings Service
export class AdminSettingsService {
  private static instance: AdminSettingsService;
  private settings: AdminSettings = DEFAULT_ADMIN_SETTINGS;
  private listeners: ((settings: AdminSettings) => void)[] = [];
  private unsubscribe: Unsubscribe | null = null;

  private constructor() {
    this.initializeSettings();
  }

  static getInstance(): AdminSettingsService {
    if (!AdminSettingsService.instance) {
      AdminSettingsService.instance = new AdminSettingsService();
    }
    return AdminSettingsService.instance;
  }

  private async initializeSettings(): Promise<void> {
    try {
      // Load settings from Firestore
      const settingsDoc = await getDoc(
        doc(firestore, FIREBASE_COLLECTIONS.SETTINGS, 'admin')
      );

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        this.settings = {
          ...DEFAULT_ADMIN_SETTINGS,
          ...data,
          system: {
            ...DEFAULT_ADMIN_SETTINGS.system,
            ...data.system,
          },
        };
      } else {
        // Create default settings if they don't exist
        await this.saveSettings(DEFAULT_ADMIN_SETTINGS);
      }

      // Set up real-time listener
      this.setupRealtimeListener();
    } catch (error) {
      console.error('Failed to initialize admin settings:', error);
      this.settings = DEFAULT_ADMIN_SETTINGS;
    }
  }

  private setupRealtimeListener(): void {
    this.unsubscribe = onSnapshot(
      doc(firestore, FIREBASE_COLLECTIONS.SETTINGS, 'admin'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          this.settings = {
            ...DEFAULT_ADMIN_SETTINGS,
            ...data,
            system: {
              ...DEFAULT_ADMIN_SETTINGS.system,
              ...data.system,
            },
          };
          this.notifyListeners();
        }
      },
      (error) => {
        console.error('Settings listener error:', error);
      }
    );
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.settings));
  }

  public getSettings(): AdminSettings {
    return { ...this.settings };
  }

  public async saveSettings(
    settings: AdminSettings,
    updatedBy = 'admin'
  ): Promise<void> {
    try {
      const updatedSettings = {
        ...settings,
        system: {
          ...settings.system,
          lastUpdated: new Date(),
          updatedBy,
        },
      };

      await setDoc(
        doc(firestore, FIREBASE_COLLECTIONS.SETTINGS, 'admin'),
        updatedSettings
      );
      this.settings = updatedSettings;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save admin settings:', error);
      throw error;
    }
  }

  public async updatePartialSettings(
    partialSettings: Partial<AdminSettings>,
    updatedBy = 'admin'
  ): Promise<void> {
    try {
      const updatedSettings = {
        ...this.settings,
        ...partialSettings,
        system: {
          ...this.settings.system,
          ...partialSettings.system,
          lastUpdated: new Date(),
          updatedBy,
        },
      };

      await updateDoc(
        doc(firestore, FIREBASE_COLLECTIONS.SETTINGS, 'admin'),
        updatedSettings
      );
      this.settings = updatedSettings;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update admin settings:', error);
      throw error;
    }
  }

  public subscribe(listener: (settings: AdminSettings) => void): () => void {
    this.listeners.push(listener);

    // Immediately call with current settings
    listener(this.settings);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }

  // Helper methods to get specific settings
  public getFeatureFlag(feature: keyof AdminSettings['features']): boolean {
    return this.settings.features[feature];
  }

  public getTimingSetting(timing: keyof AdminSettings['timing']): number {
    return this.settings.timing[timing];
  }

  public getUISetting<T>(ui: keyof AdminSettings['ui']): T {
    return this.settings.ui[ui] as T;
  }

  public getValidationSetting(
    validation: keyof AdminSettings['validation']
  ): number {
    return this.settings.validation[validation];
  }

  public getBusinessSetting<T>(business: keyof AdminSettings['business']): T {
    return this.settings.business[business] as T;
  }

  public getNetworkSetting(
    network: keyof AdminSettings['network']
  ): number | boolean | string | string[] {
    return this.settings.network[network];
  }

  public getPerformanceSetting(
    performance: keyof AdminSettings['performance']
  ): number | boolean | string {
    return this.settings.performance[performance];
  }

  public getSecuritySetting<T>(security: keyof AdminSettings['security']): T {
    return this.settings.security[security] as T;
  }

  public getIntegrationSetting<T>(
    integration: keyof AdminSettings['integrations']
  ): T {
    return this.settings.integrations[integration] as T;
  }

  public getLocalizationSetting<T>(
    localization: keyof AdminSettings['localization']
  ): T {
    return this.settings.localization[localization] as T;
  }

  public getMonitoringSetting<T>(
    monitoring: keyof AdminSettings['monitoring']
  ): T {
    return this.settings.monitoring[monitoring] as T;
  }

  public isMaintenanceMode(): boolean {
    return this.settings.system.maintenanceMode;
  }

  public getMaintenanceMessage(): string {
    return this.settings.system.maintenanceMessage;
  }

  public isDebugMode(): boolean {
    return this.settings.system.debugMode;
  }

  public getEnvironment(): string {
    return this.settings.system.environment;
  }

  public getVersion(): string {
    return this.settings.system.version;
  }
}

// Export singleton instance
export const adminSettingsService = AdminSettingsService.getInstance();

// Export types for use in other files
export type { AdminSettings };
