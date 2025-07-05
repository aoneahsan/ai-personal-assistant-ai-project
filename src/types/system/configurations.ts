// System Configuration Types for Firestore Storage

export interface SystemRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SystemPermission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxChats: number;
    maxMessages: number;
    maxUsers: number;
    maxStorage: number; // in MB
    maxApiCalls: number;
  };
  isActive: boolean;
  isPopular: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemFeatureFlag {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetRoles: string[];
  targetPlans: string[];
  conditions: {
    minUserLevel?: number;
    maxUserLevel?: number;
    userEmails?: string[];
    userIds?: string[];
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isPublic: boolean; // If true, visible to all users
  isEditable: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    required?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export interface SystemConfiguration {
  roles: SystemRole[];
  permissions: SystemPermission[];
  subscriptionPlans: SystemSubscriptionPlan[];
  featureFlags: SystemFeatureFlag[];
  settings: SystemSettings[];
  lastUpdated: Date;
  version: string;
}

// Configuration categories
export const SYSTEM_COLLECTIONS = {
  ROLES: 'system_roles',
  PERMISSIONS: 'system_permissions',
  SUBSCRIPTION_PLANS: 'system_subscription_plans',
  FEATURE_FLAGS: 'system_feature_flags',
  SETTINGS: 'system_settings',
} as const;

// Permission categories
export const PERMISSION_CATEGORIES = {
  USER_MANAGEMENT: 'user_management',
  CONTENT_MODERATION: 'content_moderation',
  SYSTEM_ADMIN: 'system_admin',
  ANALYTICS: 'analytics',
  INTEGRATIONS: 'integrations',
  FEATURE_FLAGS: 'feature_flags',
  SUBSCRIPTIONS: 'subscriptions',
  CHAT_MANAGEMENT: 'chat_management',
  BILLING: 'billing',
  SECURITY: 'security',
} as const;

// Settings categories
export const SETTINGS_CATEGORIES = {
  GENERAL: 'general',
  SECURITY: 'security',
  NOTIFICATIONS: 'notifications',
  INTEGRATIONS: 'integrations',
  FEATURES: 'features',
  LIMITS: 'limits',
  APPEARANCE: 'appearance',
  BILLING: 'billing',
} as const;

// Default system configurations
export const DEFAULT_SYSTEM_CONFIG: Partial<SystemConfiguration> = {
  version: '1.0.0',
  lastUpdated: new Date(),
};
