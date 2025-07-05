import { IPCAUser } from '@/types/user';
import { ChatFeatureFlag, SubscriptionPlan } from '@/types/user/subscription';
import { AdminSettings, adminSettingsService } from './adminSettingsService';

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

export interface FeatureUpgradeInfo {
  requiredPlan: SubscriptionPlan;
  currentFeatures: string[];
  upgradeBenefits: string[];
  description: string;
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

  // ==================== Chat Features ====================

  /**
   * Check if user can edit messages based on their subscription plan
   */
  public canEditMessages(user: IPCAUser | null): boolean {
    if (!user?.subscription) {
      return false;
    }

    // Check if message editing is enabled and user has required plan
    const editingEnabled = this.checkFeatureFlag('voiceMessages').isEnabled; // Using existing flag as proxy
    if (!editingEnabled) {
      return false;
    }

    // Free users can't edit messages
    return user.subscription.plan !== SubscriptionPlan.FREE;
  }

  /**
   * Check if user can delete messages based on their subscription plan
   */
  public canDeleteMessages(user: IPCAUser | null): boolean {
    if (!user?.subscription) {
      return false;
    }

    // Check if message deletion is enabled and user has required plan
    const deletionEnabled = this.checkFeatureFlag('voiceMessages').isEnabled; // Using existing flag as proxy
    if (!deletionEnabled) {
      return false;
    }

    // Free users can't delete messages
    return user.subscription.plan !== SubscriptionPlan.FREE;
  }

  /**
   * Check if user can view message history based on their subscription plan
   */
  public canViewMessageHistory(user: IPCAUser | null): boolean {
    if (!user?.subscription) {
      return false;
    }

    // Check if message history is enabled and user has required plan
    const historyEnabled = this.checkFeatureFlag('analytics').isEnabled;
    if (!historyEnabled) {
      return false;
    }

    // Premium and Enterprise users can view history
    return [SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE].includes(
      user.subscription.plan
    );
  }

  /**
   * Get upgrade information for a specific feature
   */
  public getFeatureUpgradeInfo(
    feature: ChatFeatureFlag | null
  ): FeatureUpgradeInfo {
    if (!feature) {
      return {
        requiredPlan: SubscriptionPlan.PRO,
        currentFeatures: ['Basic chat'],
        upgradeBenefits: ['Enhanced features'],
        description: 'Upgrade to unlock additional features',
      };
    }

    const upgradeMap: Record<ChatFeatureFlag, FeatureUpgradeInfo> = {
      [ChatFeatureFlag.MESSAGE_EDITING]: {
        requiredPlan: SubscriptionPlan.PRO,
        currentFeatures: ['Send messages', 'Basic chat'],
        upgradeBenefits: [
          'Edit sent messages',
          'Message history',
          'Advanced formatting',
        ],
        description: 'Edit your messages after sending them',
      },
      [ChatFeatureFlag.MESSAGE_DELETION]: {
        requiredPlan: SubscriptionPlan.PRO,
        currentFeatures: ['Send messages', 'Basic chat'],
        upgradeBenefits: [
          'Delete sent messages',
          'Message cleanup',
          'Privacy controls',
        ],
        description: 'Delete your messages from conversations',
      },
      [ChatFeatureFlag.MESSAGE_HISTORY]: {
        requiredPlan: SubscriptionPlan.PREMIUM,
        currentFeatures: ['Basic chat', 'Message editing'],
        upgradeBenefits: [
          'Full message history',
          'Edit tracking',
          'Audit trails',
        ],
        description: 'View complete message edit and deletion history',
      },
      [ChatFeatureFlag.VOICE_MESSAGES]: {
        requiredPlan: SubscriptionPlan.PRO,
        currentFeatures: ['Text messages'],
        upgradeBenefits: [
          'Voice messages',
          'Audio transcription',
          'Voice notes',
        ],
        description: 'Send and receive voice messages',
      },
      [ChatFeatureFlag.FILE_SHARING]: {
        requiredPlan: SubscriptionPlan.PRO,
        currentFeatures: ['Text messages', 'Images'],
        upgradeBenefits: [
          'File uploads',
          'Document sharing',
          'Large file support',
        ],
        description: 'Share files and documents in conversations',
      },
      [ChatFeatureFlag.VIDEO_MESSAGES]: {
        requiredPlan: SubscriptionPlan.PREMIUM,
        currentFeatures: ['Voice messages', 'File sharing'],
        upgradeBenefits: ['Video messages', 'Screen sharing', 'Recording'],
        description: 'Send video messages to other users',
      },
      [ChatFeatureFlag.ANONYMOUS_CHAT]: {
        requiredPlan: SubscriptionPlan.PREMIUM,
        currentFeatures: ['Basic chat'],
        upgradeBenefits: [
          'Anonymous chat rooms',
          'Privacy protection',
          'Temporary conversations',
        ],
        description: 'Join anonymous chat rooms',
      },
      [ChatFeatureFlag.GROUP_CHAT]: {
        requiredPlan: SubscriptionPlan.PRO,
        currentFeatures: ['One-on-one chat'],
        upgradeBenefits: [
          'Group conversations',
          'Multiple participants',
          'Group management',
        ],
        description: 'Create and participate in group chats',
      },
      [ChatFeatureFlag.MESSAGE_REACTIONS]: {
        requiredPlan: SubscriptionPlan.PREMIUM,
        currentFeatures: ['Basic messaging'],
        upgradeBenefits: [
          'Message reactions',
          'Emoji responses',
          'Quick feedback',
        ],
        description: 'React to messages with emojis',
      },
      [ChatFeatureFlag.MESSAGE_FORWARDING]: {
        requiredPlan: SubscriptionPlan.PREMIUM,
        currentFeatures: ['Basic messaging'],
        upgradeBenefits: [
          'Message forwarding',
          'Share conversations',
          'Relay messages',
        ],
        description: 'Forward messages to other conversations',
      },
    };

    return (
      upgradeMap[feature] || {
        requiredPlan: SubscriptionPlan.PRO,
        currentFeatures: ['Basic features'],
        upgradeBenefits: ['Enhanced functionality'],
        description: 'Upgrade to access this feature',
      }
    );
  }

  /**
   * Get available features for a subscription plan
   */
  public getAvailableFeatures(
    plan: SubscriptionPlan | string
  ): ChatFeatureFlag[] {
    const planKey =
      typeof plan === 'string' ? (plan as SubscriptionPlan) : plan;

    const featuresByPlan: Record<SubscriptionPlan, ChatFeatureFlag[]> = {
      [SubscriptionPlan.FREE]: [
        ChatFeatureFlag.FILE_SHARING,
        ChatFeatureFlag.VOICE_MESSAGES,
      ],
      [SubscriptionPlan.PRO]: [
        ChatFeatureFlag.FILE_SHARING,
        ChatFeatureFlag.VOICE_MESSAGES,
        ChatFeatureFlag.VIDEO_MESSAGES,
        ChatFeatureFlag.MESSAGE_EDITING,
        ChatFeatureFlag.MESSAGE_DELETION,
        ChatFeatureFlag.MESSAGE_HISTORY,
        ChatFeatureFlag.GROUP_CHAT,
      ],
      [SubscriptionPlan.PREMIUM]: [
        ChatFeatureFlag.FILE_SHARING,
        ChatFeatureFlag.VOICE_MESSAGES,
        ChatFeatureFlag.VIDEO_MESSAGES,
        ChatFeatureFlag.MESSAGE_EDITING,
        ChatFeatureFlag.MESSAGE_DELETION,
        ChatFeatureFlag.MESSAGE_HISTORY,
        ChatFeatureFlag.ANONYMOUS_CHAT,
        ChatFeatureFlag.GROUP_CHAT,
        ChatFeatureFlag.MESSAGE_REACTIONS,
        ChatFeatureFlag.MESSAGE_FORWARDING,
      ],
      [SubscriptionPlan.ENTERPRISE]: [
        ChatFeatureFlag.FILE_SHARING,
        ChatFeatureFlag.VOICE_MESSAGES,
        ChatFeatureFlag.VIDEO_MESSAGES,
        ChatFeatureFlag.MESSAGE_EDITING,
        ChatFeatureFlag.MESSAGE_DELETION,
        ChatFeatureFlag.MESSAGE_HISTORY,
        ChatFeatureFlag.ANONYMOUS_CHAT,
        ChatFeatureFlag.GROUP_CHAT,
        ChatFeatureFlag.MESSAGE_REACTIONS,
        ChatFeatureFlag.MESSAGE_FORWARDING,
      ],
    };

    return featuresByPlan[planKey] || [];
  }

  // ==================== Helper Methods ====================

  private checkFeatureFlag(
    flagName: keyof AdminSettings['features']
  ): FeatureFlagResult {
    const isEnabled = this.settings.features[flagName];

    // Check if in maintenance mode
    if (this.settings.system.maintenanceMode) {
      return {
        isEnabled: false,
        reason: 'System is in maintenance mode',
      };
    }

    // Check environment-specific rules if needed
    // const environment = this.settings.system.environment;

    return {
      isEnabled,
      reason: isEnabled ? 'Feature is enabled' : 'Feature is disabled',
    };
  }

  /**
   * Check multiple feature flags at once
   */
  public checkMultipleFlags(
    flagNames: (keyof AdminSettings['features'])[]
  ): Record<string, FeatureFlagResult> {
    const results: Record<string, FeatureFlagResult> = {};

    flagNames.forEach((flagName) => {
      results[flagName] = this.checkFeatureFlag(flagName);
    });

    return results;
  }

  /**
   * Get all feature flag states
   */
  public getAllFlags(): Record<
    keyof AdminSettings['features'],
    FeatureFlagResult
  > {
    const flags = Object.keys(
      this.settings.features
    ) as (keyof AdminSettings['features'])[];
    return this.checkMultipleFlags(flags);
  }

  /**
   * Enable a feature flag
   */
  public async enableFeature(
    flagName: keyof AdminSettings['features']
  ): Promise<void> {
    const currentSettings = adminSettingsService.getSettings();
    await adminSettingsService.updatePartialSettings({
      features: {
        ...currentSettings.features,
        [flagName]: true,
      },
    });
  }

  /**
   * Disable a feature flag
   */
  public async disableFeature(
    flagName: keyof AdminSettings['features']
  ): Promise<void> {
    const currentSettings = adminSettingsService.getSettings();
    await adminSettingsService.updatePartialSettings({
      features: {
        ...currentSettings.features,
        [flagName]: false,
      },
    });
  }

  /**
   * Toggle a feature flag
   */
  public async toggleFeature(
    flagName: keyof AdminSettings['features']
  ): Promise<boolean> {
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
  public async updateFeatureFlags(
    flags: Partial<AdminSettings['features']>
  ): Promise<void> {
    const currentSettings = adminSettingsService.getSettings();
    await adminSettingsService.updatePartialSettings({
      features: {
        ...currentSettings.features,
        ...flags,
      },
    });
  }

  // ==================== System Checks ====================

  /**
   * Check if system is in maintenance mode
   */
  public isMaintenanceMode(): boolean {
    return this.settings.system.maintenanceMode;
  }

  /**
   * Get maintenance mode message
   */
  public getMaintenanceMessage(): string {
    return (
      this.settings.system.maintenanceMessage || 'System is under maintenance'
    );
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
