import { roleService } from '@/services/roleService';
import { subscriptionService } from '@/services/subscriptionService';
import { systemConfigService } from '@/services/systemConfigurationService';
import { IPCAUser } from '@/types/user';

/**
 * System Configuration Helper
 * Provides utility functions for working with dynamic system configurations
 */
export class SystemConfigHelper {
  /**
   * Check if a feature flag is enabled for a user
   */
  static isFeatureEnabled(flagName: string, user?: IPCAUser | null): boolean {
    try {
      const config = systemConfigService.getConfiguration();
      const featureFlag = config.featureFlags.find(
        (flag) => flag.name === flagName && flag.enabled === true
      );

      if (!featureFlag) {
        return false;
      }

      // If no user provided, check if it's enabled globally
      if (!user) {
        return featureFlag.rolloutPercentage === 100;
      }

      // Check targeting conditions
      if (featureFlag.conditions) {
        const conditions = featureFlag.conditions;

        // Check role-based targeting
        if (conditions.userEmails && conditions.userEmails.length > 0) {
          const userEmail = user.email;
          if (!userEmail || !conditions.userEmails.includes(userEmail)) {
            return false;
          }
        }

        // Check user ID targeting
        if (conditions.userIds && conditions.userIds.length > 0) {
          if (!user.id || !conditions.userIds.includes(user.id)) {
            return false;
          }
        }
      }

      // Check rollout percentage
      if (featureFlag.rolloutPercentage < 100) {
        // Use consistent hash-based rollout
        const hash = user.id ? this.getUserHash(user.id, flagName) : 0;
        return hash < featureFlag.rolloutPercentage;
      }

      return true;
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  }

  /**
   * Get all enabled feature flags for a user
   */
  static getEnabledFeatures(user?: IPCAUser | null): string[] {
    try {
      const config = systemConfigService.getConfiguration();
      return config.featureFlags
        .filter((flag) => this.isFeatureEnabled(flag.name, user))
        .map((flag) => flag.name);
    } catch (error) {
      console.error('Error getting enabled features:', error);
      return [];
    }
  }

  /**
   * Check if user has access to a feature based on role and subscription
   */
  static hasFeatureAccess(
    feature: string,
    user?: IPCAUser | null,
    requiredRole?: string,
    requiredSubscription?: string
  ): {
    hasAccess: boolean;
    reason?: string;
    upgradeRequired?: boolean;
  } {
    try {
      // First check if feature flag is enabled
      if (!this.isFeatureEnabled(feature, user)) {
        return {
          hasAccess: false,
          reason: 'Feature is not enabled',
        };
      }

      // Check role requirement
      if (requiredRole && user) {
        const hasRole = roleService.hasRoleLevel(user, requiredRole as any);
        if (!hasRole.hasPermission) {
          return {
            hasAccess: false,
            reason: `Requires ${requiredRole} role or higher`,
          };
        }
      }

      // Check subscription requirement
      if (requiredSubscription && user) {
        const userPlan = user.subscription?.plan;
        const planDetails =
          subscriptionService.getPlanByName(requiredSubscription);

        if (!userPlan || !planDetails) {
          return {
            hasAccess: false,
            reason: `Requires ${requiredSubscription} subscription`,
            upgradeRequired: true,
          };
        }

        // Check if user's plan is sufficient
        const userPlanDetails = subscriptionService.getPlanByName(userPlan);
        if (!userPlanDetails || userPlanDetails.order < planDetails.order) {
          return {
            hasAccess: false,
            reason: `Requires ${requiredSubscription} subscription or higher`,
            upgradeRequired: true,
          };
        }
      }

      return { hasAccess: true };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        reason: 'Error checking access',
      };
    }
  }

  /**
   * Get system setting value
   */
  static getSettingValue<T = unknown>(
    settingName: string,
    defaultValue?: T
  ): T {
    try {
      const config = systemConfigService.getConfiguration();
      const setting = config.settings.find((s) => s.key === settingName);

      if (!setting) {
        return defaultValue as T;
      }

      // Parse value based on type
      switch (setting.type) {
        case 'boolean':
          return (setting.value === 'true' || setting.value === true) as T;
        case 'number':
          return Number(setting.value) as T;
        case 'object':
        case 'array':
          try {
            return JSON.parse(setting.value as string) as T;
          } catch {
            return defaultValue as T;
          }
        default:
          return setting.value as T;
      }
    } catch (error) {
      console.error('Error getting setting value:', error);
      return defaultValue as T;
    }
  }

  /**
   * Get public system settings (for client-side usage)
   */
  static getPublicSettings(): Record<string, unknown> {
    try {
      const config = systemConfigService.getConfiguration();
      const publicSettings: Record<string, unknown> = {};

      config.settings
        .filter((setting) => setting.isPublic)
        .forEach((setting) => {
          publicSettings[setting.key] = this.getSettingValue(setting.key);
        });

      return publicSettings;
    } catch (error) {
      console.error('Error getting public settings:', error);
      return {};
    }
  }

  /**
   * Get user's subscription plan details
   */
  static getUserSubscriptionDetails(user?: IPCAUser | null) {
    try {
      if (!user?.subscription?.plan) {
        return subscriptionService.getPlanByName('FREE');
      }

      return subscriptionService.getPlanByName(user.subscription.plan);
    } catch (error) {
      console.error('Error getting user subscription details:', error);
      return subscriptionService.getPlanByName('FREE');
    }
  }

  /**
   * Check if user's subscription is active
   */
  static isSubscriptionActive(user?: IPCAUser | null): boolean {
    try {
      if (!user?.subscription) {
        return false;
      }

      const subscription = user.subscription;

      // Check if subscription is marked as active
      if (!subscription.isActive) {
        return false;
      }

      // Check if subscription has expired
      if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get available subscription plans for user
   */
  static getAvailableSubscriptionPlans(user?: IPCAUser | null) {
    try {
      const allPlans = subscriptionService.getActivePlans();
      const currentPlan = user?.subscription?.plan;

      return allPlans.map((plan) => ({
        ...plan,
        isCurrent: plan.name === currentPlan,
        isUpgrade: currentPlan
          ? subscriptionService.isDynamicPlanUpgrade(currentPlan, plan.name)
          : plan.name !== 'FREE',
        isDowngrade: currentPlan
          ? !subscriptionService.isDynamicPlanUpgrade(currentPlan, plan.name) &&
            plan.name !== currentPlan
          : false,
      }));
    } catch (error) {
      console.error('Error getting available subscription plans:', error);
      return [];
    }
  }

  /**
   * Generate consistent hash for user and feature (for rollout percentage)
   */
  private static getUserHash(userId: string, feature: string): number {
    let hash = 0;
    const str = `${userId}-${feature}`;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash) % 100;
  }

  /**
   * Get system configuration statistics
   */
  static getSystemStats() {
    try {
      const config = systemConfigService.getConfiguration();

      return {
        roles: config.roles.length,
        permissions: config.permissions.length,
        subscriptionPlans: config.subscriptionPlans.length,
        featureFlags: config.featureFlags.length,
        settings: config.settings.length,
        activeFeatureFlags: config.featureFlags.filter((f) => f.enabled).length,
        publicSettings: config.settings.filter((s) => s.isPublic).length,
        lastUpdated: config.lastUpdated,
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        roles: 0,
        permissions: 0,
        subscriptionPlans: 0,
        featureFlags: 0,
        settings: 0,
        activeFeatureFlags: 0,
        publicSettings: 0,
        lastUpdated: null,
      };
    }
  }

  // Check if feature flag is enabled for specific user
  static isFeatureEnabledForUser(flagName: string, userId: string): boolean {
    const config = systemConfigService.getConfiguration();
    const flag = config.featureFlags.find(
      (f) => f.name === flagName && f.enabled === true
    );
    if (!flag) return false;

    // Check if user is in targeting conditions (if they exist)
    if (
      flag.conditions &&
      flag.conditions.userIds &&
      flag.conditions.userIds.length > 0
    ) {
      return flag.conditions.userIds.includes(userId);
    }

    return flag.enabled;
  }
}

// Export utility functions for direct usage
export const {
  isFeatureEnabled,
  getEnabledFeatures,
  hasFeatureAccess,
  getSettingValue,
  getPublicSettings,
  getUserSubscriptionDetails,
  isSubscriptionActive,
  getAvailableSubscriptionPlans,
  getSystemStats,
  isFeatureEnabledForUser,
} = SystemConfigHelper;

export default SystemConfigHelper;
