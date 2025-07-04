import { adminSettingsService, AdminSettings } from './adminSettingsService';

export interface FeatureFlagResult {
  isEnabled: boolean;
  reason?: string;
}

export interface FeatureFlagConfig {
  name: string;
  enabled: boolean;
  description?: string;
  environments?: ('development' | 'staging' | 'production')[];
  rolloutPercentage?: number;
  targetUsers?: string[];
  startDate?: Date;
  endDate?: Date;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private settings: AdminSettings;

  private constructor() {
    this.settings = adminSettingsService.getSettings();
    
    // Subscribe to settings changes
    adminSettingsService.subscribe((newSettings) => {
      this.settings = newSettings;
    });
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  // ==================== Core Feature Flags ====================

  public isAnonymousChatEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('anonymousChat');
  }

  public isEmbedSystemEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('embedSystem');
  }

  public isFeedbackSystemEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('feedbackSystem');
  }

  public isSubscriptionSystemEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('subscriptionSystem');
  }

  public isAnalyticsEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('analytics');
  }

  public isNotificationsEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('notifications');
  }

  // ==================== Advanced Features ====================

  public isVoiceMessagesEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('voiceMessages');
  }

  public isFileUploadsEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('fileUploads');
  }

  public isVideoChatEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('videoChat');
  }

  public isScreenSharingEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('screenSharing');
  }

  public isAiAssistantEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('aiAssistant');
  }

  public isMultiLanguageEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('multiLanguage');
  }

  // ==================== Admin Features ====================

  public isUserManagementEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('userManagement');
  }

  public isSettingsManagementEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('settingsManagement');
  }

  public isAuditLogsEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('auditLogs');
  }

  public isSystemMonitoringEnabled(): FeatureFlagResult {
    return this.checkFeatureFlag('systemMonitoring');
  }

  // ==================== Helper Methods ====================

  private checkFeatureFlag(flagName: keyof AdminSettings['features']): FeatureFlagResult {
    const isEnabled = this.settings.features[flagName];
    
    // Check if in maintenance mode
    if (this.settings.system.maintenanceMode) {
      return {
        isEnabled: false,
        reason: 'System is in maintenance mode'
      };
    }

    // Check environment-specific rules if needed
    const environment = this.settings.system.environment;
    
    return {
      isEnabled,
      reason: isEnabled ? 'Feature is enabled' : 'Feature is disabled'
    };
  }

  /**
   * Check multiple feature flags at once
   */
  public checkMultipleFlags(flagNames: (keyof AdminSettings['features'])[]): Record<string, FeatureFlagResult> {
    const results: Record<string, FeatureFlagResult> = {};
    
    flagNames.forEach(flagName => {
      results[flagName] = this.checkFeatureFlag(flagName);
    });
    
    return results;
  }

  /**
   * Get all feature flag states
   */
  public getAllFlags(): Record<keyof AdminSettings['features'], FeatureFlagResult> {
    const flags = Object.keys(this.settings.features) as (keyof AdminSettings['features'])[];
    return this.checkMultipleFlags(flags);
  }

  /**
   * Enable a feature flag
   */
  public async enableFeature(flagName: keyof AdminSettings['features']): Promise<void> {
    const currentSettings = adminSettingsService.getSettings();
    await adminSettingsService.updatePartialSettings({
      features: {
        ...currentSettings.features,
        [flagName]: true
      }
    });
  }

  /**
   * Disable a feature flag
   */
  public async disableFeature(flagName: keyof AdminSettings['features']): Promise<void> {
    const currentSettings = adminSettingsService.getSettings();
    await adminSettingsService.updatePartialSettings({
      features: {
        ...currentSettings.features,
        [flagName]: false
      }
    });
  }

  /**
   * Toggle a feature flag
   */
  public async toggleFeature(flagName: keyof AdminSettings['features']): Promise<boolean> {
    const currentState = this.checkFeatureFlag(flagName).isEnabled;
    
    if (currentState) {
      await this.disableFeature(flagName);
    } else {
      await this.enableFeature(flagName);
    }
    
    return !currentState;
  }

  /**
   * Bulk update feature flags
   */
  public async updateFeatureFlags(flags: Partial<AdminSettings['features']>): Promise<void> {
    const currentSettings = adminSettingsService.getSettings();
    await adminSettingsService.updatePartialSettings({
      features: {
        ...currentSettings.features,
        ...flags
      }
    });
  }

  /**
   * Check if system is in maintenance mode
   */
  public isMaintenanceMode(): boolean {
    return this.settings.system.maintenanceMode;
  }

  /**
   * Get maintenance message
   */
  public getMaintenanceMessage(): string {
    return this.settings.system.maintenanceMessage;
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugMode(): boolean {
    return this.settings.system.debugMode;
  }

  /**
   * Get current environment
   */
  public getEnvironment(): string {
    return this.settings.system.environment;
  }
}

// Export singleton instance
export const featureFlagService = FeatureFlagService.getInstance();
