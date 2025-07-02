import { IPCAUser } from '@/types/user';
import {
  ChatFeatureFlag,
  FeatureAccessResult,
  SUBSCRIPTION_FEATURES,
  SubscriptionPlan,
  UserSubscription,
} from '@/types/user/subscription';
import { consoleLog, consoleWarn } from '@/utils/helpers/consoleHelper';

export class FeatureFlagService {
  private static instance: FeatureFlagService;

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Check if user has access to a specific feature
   */
  public hasFeatureAccess(
    user: IPCAUser | null | undefined,
    feature: ChatFeatureFlag
  ): FeatureAccessResult {
    if (!user) {
      return {
        hasAccess: false,
        requiredPlan: this.getMinimumPlanForFeature(feature),
        upgradeMessage: 'Please sign in to access this feature',
      };
    }

    const subscription = this.getUserSubscription(user);
    const userFeatures = SUBSCRIPTION_FEATURES[subscription.plan] || [];
    const hasAccess = userFeatures.includes(feature);

    if (hasAccess && subscription.isActive) {
      return { hasAccess: true };
    }

    const requiredPlan = this.getMinimumPlanForFeature(feature);

    return {
      hasAccess: false,
      requiredPlan,
      upgradeMessage: this.getUpgradeMessage(
        feature,
        requiredPlan,
        subscription.plan
      ),
    };
  }

  /**
   * Get user's current subscription or default to FREE
   */
  private getUserSubscription(user: IPCAUser): UserSubscription {
    if (user.subscription) {
      return user.subscription;
    }

    // Default subscription for users without explicit subscription
    return {
      plan: SubscriptionPlan.FREE,
      startDate: new Date(),
      isActive: true,
      features: SUBSCRIPTION_FEATURES[SubscriptionPlan.FREE],
    };
  }

  /**
   * Get the minimum plan required for a feature
   */
  private getMinimumPlanForFeature(feature: ChatFeatureFlag): SubscriptionPlan {
    for (const [plan, features] of Object.entries(SUBSCRIPTION_FEATURES)) {
      if (features.includes(feature)) {
        return plan as SubscriptionPlan;
      }
    }
    return SubscriptionPlan.ENTERPRISE; // Default to highest plan if not found
  }

  /**
   * Generate upgrade message for a feature
   */
  private getUpgradeMessage(
    feature: ChatFeatureFlag,
    requiredPlan: SubscriptionPlan,
    currentPlan: SubscriptionPlan
  ): string {
    const featureNames: Record<ChatFeatureFlag, string> = {
      [ChatFeatureFlag.MESSAGE_EDITING]: 'Message Editing',
      [ChatFeatureFlag.MESSAGE_DELETION]: 'Message Deletion',
      [ChatFeatureFlag.MESSAGE_HISTORY]: 'Message Edit History',
      [ChatFeatureFlag.ANONYMOUS_CHAT]: 'Anonymous Chat',
      [ChatFeatureFlag.GROUP_CHAT]: 'Group Chat',
      [ChatFeatureFlag.FILE_SHARING]: 'File Sharing',
      [ChatFeatureFlag.VOICE_MESSAGES]: 'Voice Messages',
      [ChatFeatureFlag.VIDEO_MESSAGES]: 'Video Messages',
      [ChatFeatureFlag.MESSAGE_REACTIONS]: 'Message Reactions',
      [ChatFeatureFlag.MESSAGE_FORWARDING]: 'Message Forwarding',
    };

    const featureName = featureNames[feature] || 'This feature';

    if (currentPlan === SubscriptionPlan.FREE) {
      return `${featureName} is available for ${requiredPlan.toUpperCase()} subscribers and above. Upgrade your plan to unlock this feature.`;
    }

    return `${featureName} requires ${requiredPlan.toUpperCase()} plan or higher. Please upgrade your subscription.`;
  }

  /**
   * Get all available features for a user
   */
  public getUserFeatures(user: IPCAUser | null | undefined): ChatFeatureFlag[] {
    if (!user) {
      return [];
    }

    const subscription = this.getUserSubscription(user);
    return subscription.isActive
      ? SUBSCRIPTION_FEATURES[subscription.plan]
      : [];
  }

  /**
   * Check if user can edit messages
   */
  public canEditMessages(
    user: IPCAUser | null | undefined
  ): FeatureAccessResult {
    return this.hasFeatureAccess(user, ChatFeatureFlag.MESSAGE_EDITING);
  }

  /**
   * Check if user can delete messages
   */
  public canDeleteMessages(
    user: IPCAUser | null | undefined
  ): FeatureAccessResult {
    return this.hasFeatureAccess(user, ChatFeatureFlag.MESSAGE_DELETION);
  }

  /**
   * Check if user can view message history
   */
  public canViewMessageHistory(
    user: IPCAUser | null | undefined
  ): FeatureAccessResult {
    return this.hasFeatureAccess(user, ChatFeatureFlag.MESSAGE_HISTORY);
  }

  /**
   * Check if user can use anonymous chat
   */
  public canUseAnonymousChat(
    user: IPCAUser | null | undefined
  ): FeatureAccessResult {
    return this.hasFeatureAccess(user, ChatFeatureFlag.ANONYMOUS_CHAT);
  }

  /**
   * Get feature upgrade info for display in UI
   */
  public getFeatureUpgradeInfo(feature: ChatFeatureFlag) {
    const requiredPlan = this.getMinimumPlanForFeature(feature);

    return {
      feature,
      requiredPlan,
      planName: requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1),
      benefits: this.getPlanBenefits(requiredPlan),
    };
  }

  /**
   * Get benefits for a specific plan
   */
  private getPlanBenefits(plan: SubscriptionPlan): string[] {
    const benefits: Record<SubscriptionPlan, string[]> = {
      [SubscriptionPlan.FREE]: [
        'Basic file sharing',
        'Voice messages',
        'Standard support',
      ],
      [SubscriptionPlan.PRO]: [
        'Message editing & deletion',
        'Edit history tracking',
        'Video messages',
        'Priority support',
        'Extended file storage',
      ],
      [SubscriptionPlan.PREMIUM]: [
        'Anonymous chat',
        'Message reactions',
        'Message forwarding',
        'Advanced file sharing',
        'Premium support',
        'Custom themes',
      ],
      [SubscriptionPlan.ENTERPRISE]: [
        'All premium features',
        'Group chat management',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
      ],
    };

    return benefits[plan] || [];
  }

  /**
   * Log feature access attempt (for analytics)
   */
  public logFeatureAccess(
    user: IPCAUser | null | undefined,
    feature: ChatFeatureFlag,
    granted: boolean
  ): void {
    const userPlan = user?.subscription?.plan || SubscriptionPlan.FREE;

    consoleLog(`Feature access: ${feature}`, {
      userId: user?.id,
      userPlan,
      granted,
      timestamp: new Date().toISOString(),
    });

    if (!granted) {
      consoleWarn(`Feature ${feature} blocked for ${userPlan} plan`);
    }
  }
}

// Export singleton instance
export const featureFlagService = FeatureFlagService.getInstance();
