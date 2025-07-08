import { logError } from '@/sentryErrorLogging';
import { SystemConfiguration } from '@/types/system/configurations';
import { useSystemConfigStore } from '@/zustandStates/systemConfigState';

export const useSystemConfig = () => {
  const systemConfigStore = useSystemConfigStore();

  const getFeatureFlag = (
    flagName: string,
    defaultValue: boolean = false
  ): boolean => {
    const systemConfig = systemConfigStore.config;
    if (!systemConfig?.featureFlags) return defaultValue;
    const flag = systemConfig.featureFlags.find((f) => f.name === flagName);
    return flag?.enabled || defaultValue;
  };

  const getSettings = (
    settingName: string,
    defaultValue: unknown = null
  ): unknown => {
    const systemConfig = systemConfigStore.config;
    if (!systemConfig?.settings) return defaultValue;
    const setting = systemConfig.settings.find((s) => s.key === settingName);
    return setting?.value || defaultValue;
  };

  const getAdvancedSettings = (
    settingName: string,
    defaultValue: unknown = null
  ): unknown => {
    // For backward compatibility - maps to regular settings
    return getSettings(settingName, defaultValue);
  };

  const getSystemConfig = (): SystemConfiguration | null => {
    return systemConfigStore.config;
  };

  const getSystemConfigField = (
    fieldName: keyof SystemConfiguration,
    defaultValue: unknown = null
  ): unknown => {
    const systemConfig = systemConfigStore.config;
    if (!systemConfig) return defaultValue;
    return systemConfig[fieldName] || defaultValue;
  };

  const isSystemConfigLoaded = (): boolean => {
    return systemConfigStore.isInitialized;
  };

  const refreshSystemConfig = async () => {
    try {
      await systemConfigStore.refreshConfig();
    } catch (error) {
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to refresh system config')
      );
    }
  };

  return {
    systemConfig: systemConfigStore.config,
    isLoading: systemConfigStore.isLoading,
    error: systemConfigStore.error,
    getFeatureFlag,
    getSettings,
    getAdvancedSettings,
    getSystemConfig,
    getSystemConfigField,
    isSystemConfigLoaded,
    refreshSystemConfig,
  };
};

export const useFeatureFlag = (flagName: string) => {
  const { getFeatureFlag } = useSystemConfig();

  const isEnabled = getFeatureFlag(flagName, false);

  return {
    isEnabled,
    flagName,
  };
};

export const useSubscription = () => {
  const { getSettings } = useSystemConfig();

  const subscriptionSettings = getSettings('subscriptions', {}) as Record<
    string,
    unknown
  >;

  return {
    subscriptionSettings,
    isSubscriptionEnabled: Boolean(subscriptionSettings?.enabled),
    subscriptionProvider: subscriptionSettings?.provider || 'stripe',
    subscriptionPlans: subscriptionSettings?.plans || [],
  };
};

export const usePermissions = () => {
  const { getSettings } = useSystemConfig();

  const permissionsSettings = getSettings('permissions', {}) as Record<
    string,
    unknown
  >;

  const checkPermission = (permission: string): boolean => {
    const permissions = (permissionsSettings?.permissions as string[]) || [];
    return permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    const roles = (permissionsSettings?.roles as string[]) || [];
    return roles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    const userRoles = (permissionsSettings?.roles as string[]) || [];
    return roles.some((role) => userRoles.includes(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    const userRoles = (permissionsSettings?.roles as string[]) || [];
    return roles.every((role) => userRoles.includes(role));
  };

  const checkFeatureAccess = (feature: string): boolean => {
    const featurePermissions =
      (permissionsSettings?.featurePermissions as Record<string, boolean>) ||
      {};
    return featurePermissions[feature] || false;
  };

  return {
    permissionsSettings,
    checkPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    checkFeatureAccess,
  };
};

export const useSettings = () => {
  const { getSettings } = useSystemConfig();

  const getBooleanSetting = (
    settingName: string,
    defaultValue: boolean = false
  ): boolean => {
    const value = getSettings(settingName, defaultValue);
    return Boolean(value);
  };

  const getStringSetting = (
    settingName: string,
    defaultValue: string = ''
  ): string => {
    const value = getSettings(settingName, defaultValue);
    return String(value);
  };

  const getNumberSetting = (
    settingName: string,
    defaultValue: number = 0
  ): number => {
    const value = getSettings(settingName, defaultValue);
    return Number(value);
  };

  const getObjectSetting = (
    settingName: string,
    defaultValue: Record<string, unknown> = {}
  ): Record<string, unknown> => {
    const value = getSettings(settingName, defaultValue);
    return value as Record<string, unknown>;
  };

  const getArraySetting = (
    settingName: string,
    defaultValue: unknown[] = []
  ): unknown[] => {
    const value = getSettings(settingName, defaultValue);
    return value as unknown[];
  };

  return {
    getBooleanSetting,
    getStringSetting,
    getNumberSetting,
    getObjectSetting,
    getArraySetting,
  };
};
