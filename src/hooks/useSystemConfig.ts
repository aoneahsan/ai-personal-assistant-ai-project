import { SystemConfigHelper } from '@/utils/helpers/systemConfigHelper';
import { useSystemConfigStore } from '@/zustandStates/systemConfigState';
import { useUserDataZState } from '@/zustandStates/userState';
import { useEffect, useState } from 'react';

/**
 * React hook for accessing system configuration
 */
export const useSystemConfig = () => {
  const { config, isLoading, error, isInitialized } = useSystemConfigStore();

  const { data: user } = useUserDataZState();

  return {
    // Configuration data
    roles: config.roles,
    permissions: config.permissions,
    subscriptionPlans: config.subscriptionPlans,
    featureFlags: config.featureFlags,
    settings: config.settings,

    // Loading states
    loading: isLoading,
    error,
    isInitialized,

    // Helper functions
    isFeatureEnabled: (flagName: string) =>
      SystemConfigHelper.isFeatureEnabled(flagName, user),

    getEnabledFeatures: () => SystemConfigHelper.getEnabledFeatures(user),

    hasFeatureAccess: (
      feature: string,
      requiredRole?: string,
      requiredSubscription?: string
    ) =>
      SystemConfigHelper.hasFeatureAccess(
        feature,
        user,
        requiredRole,
        requiredSubscription
      ),

    getSettingValue: <T = any>(settingName: string, defaultValue?: T) =>
      SystemConfigHelper.getSettingValue<T>(settingName, defaultValue),

    getPublicSettings: () => SystemConfigHelper.getPublicSettings(),

    getUserSubscriptionDetails: () =>
      SystemConfigHelper.getUserSubscriptionDetails(user),

    isSubscriptionActive: () => SystemConfigHelper.isSubscriptionActive(user),

    getAvailableSubscriptionPlans: () =>
      SystemConfigHelper.getAvailableSubscriptionPlans(user),

    getSystemStats: () => SystemConfigHelper.getSystemStats(),
  };
};

/**
 * React hook for feature flag checking
 */
export const useFeatureFlag = (flagName: string) => {
  const { data: user } = useUserDataZState();
  const { isInitialized } = useSystemConfigStore();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      setLoading(true);
      return;
    }

    const enabled = SystemConfigHelper.isFeatureEnabled(flagName, user);
    setIsEnabled(enabled);
    setLoading(false);
  }, [flagName, user, isInitialized]);

  return {
    isEnabled,
    loading,
    isInitialized,
  };
};

/**
 * React hook for subscription management
 */
export const useSubscription = () => {
  const { data: user } = useUserDataZState();
  const { config, isInitialized } = useSystemConfigStore();

  return {
    // User subscription info
    subscription: user?.subscription,
    currentPlan: user?.subscription?.plan,
    isActive: SystemConfigHelper.isSubscriptionActive(user),

    // Plan details
    currentPlanDetails: SystemConfigHelper.getUserSubscriptionDetails(user),
    availablePlans: SystemConfigHelper.getAvailableSubscriptionPlans(user),

    // System data
    allPlans: config.subscriptionPlans,
    isInitialized,

    // Helper functions
    canUpgradeTo: (planName: string) => {
      const currentPlan = user?.subscription?.plan;
      if (!currentPlan) return planName !== 'FREE';

      const subscriptionService = import('@/services/subscriptionService').then(
        (m) => m.default
      );
      return subscriptionService.then((service) =>
        service.isDynamicPlanUpgrade(currentPlan, planName)
      );
    },

    getPlanFeatures: (planName: string) => {
      const plan = config.subscriptionPlans.find((p) => p.name === planName);
      return plan?.features || [];
    },

    getPlanLimits: (planName: string) => {
      const plan = config.subscriptionPlans.find((p) => p.name === planName);
      return plan?.limits || null;
    },
  };
};

/**
 * React hook for role and permission checking
 */
export const usePermissions = () => {
  const { data: user } = useUserDataZState();
  const { config, isInitialized } = useSystemConfigStore();

  return {
    // User role info
    userRole: user?.role,

    // System data
    roles: config.roles,
    permissions: config.permissions,
    isInitialized,

    // Helper functions
    hasPermission: (permission: string) => {
      if (!user) return false;

      const roleService = import('@/services/roleService').then(
        (m) => m.default
      );
      return roleService.then((service) => {
        const result = service.hasPermission(user, permission as any);
        return result.hasPermission;
      });
    },

    hasRole: (role: string) => {
      if (!user) return false;

      const roleService = import('@/services/roleService').then(
        (m) => m.default
      );
      return roleService.then((service) => {
        const result = service.hasRoleLevel(user, role as any);
        return result.hasPermission;
      });
    },

    getUserRoleDetails: () => {
      if (!user?.role) return null;
      return config.roles.find((r) => r.name === user.role);
    },
  };
};

/**
 * React hook for system settings
 */
export const useSettings = () => {
  const { config, isInitialized } = useSystemConfigStore();
  const [publicSettings, setPublicSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isInitialized) return;

    const pubSettings = SystemConfigHelper.getPublicSettings();
    setPublicSettings(pubSettings);
  }, [config.settings, isInitialized]);

  return {
    settings: config.settings,
    publicSettings,
    isInitialized,

    // Helper functions
    getSetting: <T = any>(settingName: string, defaultValue?: T) =>
      SystemConfigHelper.getSettingValue<T>(settingName, defaultValue),

    getPublicSetting: (settingName: string) => publicSettings[settingName],
  };
};

export default useSystemConfig;
