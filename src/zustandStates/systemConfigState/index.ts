import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { systemConfigService } from '../../services/systemConfigurationService';
import {
  SystemConfiguration,
  SystemFeatureFlag,
  SystemPermission,
  SystemRole,
  SystemSettings,
  SystemSubscriptionPlan,
} from '../../types/system/configurations';

interface SystemConfigState {
  // Configuration data
  config: SystemConfiguration;

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Last update tracking
  lastUpdated: Date | null;

  // Actions
  initializeConfig: (userId: string) => Promise<void>;
  loadConfig: () => Promise<void>;
  refreshConfig: () => Promise<void>;

  // Role management
  createRole: (
    role: Omit<SystemRole, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updateRole: (
    id: string,
    updates: Partial<SystemRole>,
    userId: string
  ) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;

  // Permission management
  createPermission: (
    permission: Omit<SystemPermission, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updatePermission: (
    id: string,
    updates: Partial<SystemPermission>
  ) => Promise<void>;

  // Subscription plan management
  createSubscriptionPlan: (
    plan: Omit<SystemSubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updateSubscriptionPlan: (
    id: string,
    updates: Partial<SystemSubscriptionPlan>
  ) => Promise<void>;

  // Feature flag management
  createFeatureFlag: (
    flag: Omit<SystemFeatureFlag, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updateFeatureFlag: (
    id: string,
    updates: Partial<SystemFeatureFlag>,
    userId: string
  ) => Promise<void>;

  // Settings management
  createSetting: (
    setting: Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>;
  updateSetting: (
    id: string,
    updates: Partial<SystemSettings>,
    userId: string
  ) => Promise<void>;

  // Utility methods
  hasPermission: (userRole: string, permission: string) => boolean;
  isFeatureEnabled: (
    featureName: string,
    userRole?: string,
    userPlan?: string
  ) => boolean;
  getSettingValue: (key: string, category?: string) => any;
  getPublicSettings: () => SystemSettings[];

  // Real-time updates
  subscribeToChanges: (
    callback: (config: SystemConfiguration) => void
  ) => () => void;

  // Reset state
  reset: () => void;
}

const initialConfig: SystemConfiguration = {
  roles: [],
  permissions: [],
  subscriptionPlans: [],
  featureFlags: [],
  settings: [],
  lastUpdated: new Date(),
  version: '1.0.0',
};

export const useSystemConfigStore = create<SystemConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        config: initialConfig,
        isLoading: false,
        isInitialized: false,
        error: null,
        lastUpdated: null,

        // Initialize system configuration
        initializeConfig: async (userId: string) => {
          set({ isLoading: true, error: null });

          try {
            await systemConfigService.initializeSystemConfigurations(userId);
            const config = await systemConfigService.loadAllConfigurations();

            set({
              config,
              isInitialized: true,
              isLoading: false,
              lastUpdated: new Date(),
              error: null,
            });
          } catch (error) {
            console.error('Failed to initialize system config:', error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to initialize system configuration',
              isLoading: false,
            });
            throw error;
          }
        },

        // Load configuration
        loadConfig: async () => {
          set({ isLoading: true, error: null });

          try {
            const config = await systemConfigService.loadAllConfigurations();

            set({
              config,
              isInitialized: true,
              isLoading: false,
              lastUpdated: new Date(),
              error: null,
            });
          } catch (error) {
            console.error('Failed to load system config:', error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to load system configuration',
              isLoading: false,
            });
            throw error;
          }
        },

        // Refresh configuration
        refreshConfig: async () => {
          const { loadConfig } = get();
          await loadConfig();
        },

        // Role management
        createRole: async (role) => {
          try {
            const id = await systemConfigService.createRole(role);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
            return id;
          } catch (error) {
            console.error('Failed to create role:', error);
            throw error;
          }
        },

        updateRole: async (id, updates, userId) => {
          try {
            await systemConfigService.updateRole(id, updates, userId);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
          } catch (error) {
            console.error('Failed to update role:', error);
            throw error;
          }
        },

        deleteRole: async (id) => {
          try {
            await systemConfigService.deleteRole(id);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
          } catch (error) {
            console.error('Failed to delete role:', error);
            throw error;
          }
        },

        // Permission management
        createPermission: async (permission) => {
          try {
            const id = await systemConfigService.createPermission(permission);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
            return id;
          } catch (error) {
            console.error('Failed to create permission:', error);
            throw error;
          }
        },

        updatePermission: async (id, updates) => {
          try {
            await systemConfigService.updatePermission(id, updates);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
          } catch (error) {
            console.error('Failed to update permission:', error);
            throw error;
          }
        },

        // Subscription plan management
        createSubscriptionPlan: async (plan) => {
          try {
            const id = await systemConfigService.createSubscriptionPlan(plan);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
            return id;
          } catch (error) {
            console.error('Failed to create subscription plan:', error);
            throw error;
          }
        },

        updateSubscriptionPlan: async (id, updates) => {
          try {
            await systemConfigService.updateSubscriptionPlan(id, updates);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
          } catch (error) {
            console.error('Failed to update subscription plan:', error);
            throw error;
          }
        },

        // Feature flag management
        createFeatureFlag: async (flag) => {
          try {
            const id = await systemConfigService.createFeatureFlag(flag);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
            return id;
          } catch (error) {
            console.error('Failed to create feature flag:', error);
            throw error;
          }
        },

        updateFeatureFlag: async (id, updates, userId) => {
          try {
            await systemConfigService.updateFeatureFlag(id, updates, userId);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
          } catch (error) {
            console.error('Failed to update feature flag:', error);
            throw error;
          }
        },

        // Settings management
        createSetting: async (setting) => {
          try {
            const id = await systemConfigService.createSetting(setting);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
            return id;
          } catch (error) {
            console.error('Failed to create setting:', error);
            throw error;
          }
        },

        updateSetting: async (id, updates, userId) => {
          try {
            await systemConfigService.updateSetting(id, updates, userId);
            const updatedConfig = systemConfigService.getConfiguration();
            set({ config: updatedConfig, lastUpdated: new Date() });
          } catch (error) {
            console.error('Failed to update setting:', error);
            throw error;
          }
        },

        // Utility methods
        hasPermission: (userRole: string, permission: string) => {
          return systemConfigService.hasPermission(userRole, permission);
        },

        isFeatureEnabled: (
          featureName: string,
          userRole?: string,
          userPlan?: string
        ) => {
          return systemConfigService.isFeatureEnabled(
            featureName,
            userRole,
            userPlan
          );
        },

        getSettingValue: (key: string, category?: string) => {
          return systemConfigService.getSettingValue(key, category);
        },

        getPublicSettings: () => {
          return systemConfigService.getPublicSettings();
        },

        // Real-time updates
        subscribeToChanges: (
          callback: (config: SystemConfiguration) => void
        ) => {
          return systemConfigService.subscribeToConfigChanges((config) => {
            set({ config, lastUpdated: new Date() });
            callback(config);
          });
        },

        // Reset state
        reset: () => {
          set({
            config: initialConfig,
            isLoading: false,
            isInitialized: false,
            error: null,
            lastUpdated: null,
          });
        },
      }),
      {
        name: 'system-config-store',
        partialize: (state) => ({
          config: state.config,
          isInitialized: state.isInitialized,
          lastUpdated: state.lastUpdated,
        }),
      }
    ),
    {
      name: 'system-config-store',
    }
  )
);

// Selectors for common use cases
export const selectRoles = (state: SystemConfigState) => state.config.roles;
export const selectPermissions = (state: SystemConfigState) =>
  state.config.permissions;
export const selectSubscriptionPlans = (state: SystemConfigState) =>
  state.config.subscriptionPlans;
export const selectFeatureFlags = (state: SystemConfigState) =>
  state.config.featureFlags;
export const selectSettings = (state: SystemConfigState) =>
  state.config.settings;
export const selectIsLoading = (state: SystemConfigState) => state.isLoading;
export const selectError = (state: SystemConfigState) => state.error;
export const selectIsInitialized = (state: SystemConfigState) =>
  state.isInitialized;

// Hook for role-based access control
export const useRoleAccess = (requiredRole: string) => {
  const { config } = useSystemConfigStore();
  // You'll need to integrate this with your user state to get current user role
  // For now, returning a placeholder
  return {
    hasAccess: false, // This should check current user role against required role
    role: null,
  };
};

// Hook for permission-based access control
export const usePermissionAccess = (requiredPermission: string) => {
  const { hasPermission } = useSystemConfigStore();
  // You'll need to integrate this with your user state to get current user role
  // For now, returning a placeholder
  return {
    hasPermission: false, // This should check: hasPermission(currentUserRole, requiredPermission)
    permission: requiredPermission,
  };
};

// Hook for feature flag access
export const useFeatureFlag = (featureName: string) => {
  const { isFeatureEnabled } = useSystemConfigStore();
  // You'll need to integrate this with your user state to get current user role/plan
  // For now, returning a placeholder
  return {
    isEnabled: false, // This should check: isFeatureEnabled(featureName, currentUserRole, currentUserPlan)
    feature: featureName,
  };
};

export default useSystemConfigStore;
