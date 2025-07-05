import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  PERMISSION_CATEGORIES,
  SETTINGS_CATEGORIES,
  SYSTEM_COLLECTIONS,
  SystemConfiguration,
  SystemFeatureFlag,
  SystemPermission,
  SystemRole,
  SystemSettings,
  SystemSubscriptionPlan,
} from '../types/system/configurations';

class SystemConfigurationService {
  private cache: SystemConfiguration = {
    roles: [],
    permissions: [],
    subscriptionPlans: [],
    featureFlags: [],
    settings: [],
    lastUpdated: new Date(),
    version: '1.0.0',
  };

  private listeners: Map<string, () => void> = new Map();
  private initialized = false;

  // Initialize system configurations
  async initializeSystemConfigurations(userId: string): Promise<void> {
    try {
      // First try to load existing configurations
      const existingConfig = await this.loadAllConfigurations();

      // If we have existing configurations, we're done
      if (existingConfig.roles.length > 0) {
        this.initialized = true;
        return;
      }

      // If no existing configurations, create defaults
      await this.createDefaultConfigurations(userId);
      await this.loadAllConfigurations();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize system configurations:', error);

      // If initialization fails, try to provide fallback configurations
      this.provideFallbackConfigurations();
      throw error;
    }
  }

  // Provide fallback configurations when Firebase is not available
  private provideFallbackConfigurations(): void {
    console.warn('Using fallback system configurations');

    this.cache = {
      roles: [
        {
          id: 'user',
          name: 'USER',
          displayName: 'User',
          description: 'Regular user with basic features',
          level: 1,
          permissions: [
            'VIEW_PUBLIC_CONTENT',
            'MANAGE_OWN_PROFILE',
            'CREATE_CHATS',
            'SEND_MESSAGES',
          ],
          color: '#10B981',
          icon: 'pi-user',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        },
        {
          id: 'admin',
          name: 'ADMIN',
          displayName: 'Administrator',
          description: 'System administrator with full access',
          level: 4,
          permissions: ['*'],
          color: '#EF4444',
          icon: 'pi-crown',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        },
      ],
      permissions: [
        {
          id: 'VIEW_PUBLIC_CONTENT',
          name: 'VIEW_PUBLIC_CONTENT',
          displayName: 'View Public Content',
          description: 'View publicly available content',
          category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'MANAGE_OWN_PROFILE',
          name: 'MANAGE_OWN_PROFILE',
          displayName: 'Manage Own Profile',
          description: 'Edit own profile information',
          category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      subscriptionPlans: [
        {
          id: 'free',
          name: 'FREE',
          displayName: 'Free Plan',
          description: 'Basic features for personal use',
          price: 0,
          currency: 'USD',
          interval: 'monthly',
          features: ['Basic Chat', 'Limited Messages'],
          limits: {
            maxChats: 10,
            maxMessages: 100,
            maxUsers: 1,
            maxStorage: 100,
            maxApiCalls: 1000,
          },
          isActive: true,
          isPopular: false,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      featureFlags: [
        {
          id: 'ai_chat_enabled',
          name: 'AI_CHAT_ENABLED',
          displayName: 'AI Chat',
          description: 'Enable AI chat functionality',
          enabled: true,
          rolloutPercentage: 100,
          targetRoles: ['USER', 'ADMIN'],
          targetPlans: ['FREE', 'PRO', 'ENTERPRISE'],
          conditions: {},
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system',
          updatedBy: 'system',
        },
      ],
      settings: [
        {
          id: 'app_name',
          category: SETTINGS_CATEGORIES.GENERAL,
          key: 'app_name',
          value: 'AI Personal Assistant',
          type: 'string',
          description: 'Application name displayed to users',
          isPublic: true,
          isEditable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: 'system',
        },
      ],
      lastUpdated: new Date(),
      version: '1.0.0',
    };

    this.initialized = true;
  }

  // Create default configurations if they don't exist
  private async createDefaultConfigurations(userId: string): Promise<void> {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();

    // Check if configurations already exist
    const rolesSnapshot = await getDocs(
      collection(db, SYSTEM_COLLECTIONS.ROLES)
    );
    if (!rolesSnapshot.empty) {
      return; // Already initialized
    }

    // Default roles
    const defaultRoles: Omit<SystemRole, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'guest',
        name: 'GUEST',
        displayName: 'Guest',
        description: 'Guest user with limited access',
        level: 0,
        permissions: ['VIEW_PUBLIC_CONTENT'],
        color: '#6B7280',
        icon: 'pi-user',
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
      {
        id: 'user',
        name: 'USER',
        displayName: 'User',
        description: 'Regular user with basic features',
        level: 1,
        permissions: [
          'VIEW_PUBLIC_CONTENT',
          'MANAGE_OWN_PROFILE',
          'CREATE_CHATS',
          'SEND_MESSAGES',
        ],
        color: '#10B981',
        icon: 'pi-user',
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
      {
        id: 'support',
        name: 'SUPPORT',
        displayName: 'Support',
        description: 'Support team member',
        level: 2,
        permissions: [
          'VIEW_PUBLIC_CONTENT',
          'MANAGE_OWN_PROFILE',
          'CREATE_CHATS',
          'SEND_MESSAGES',
          'VIEW_USER_PROFILES',
          'MODERATE_CONTENT',
        ],
        color: '#3B82F6',
        icon: 'pi-headphones',
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
      {
        id: 'admin',
        name: 'ADMIN',
        displayName: 'Administrator',
        description: 'System administrator with full access',
        level: 4,
        permissions: ['*'], // All permissions
        color: '#EF4444',
        icon: 'pi-crown',
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      },
    ];

    // Default permissions
    const defaultPermissions: Omit<
      SystemPermission,
      'createdAt' | 'updatedAt'
    >[] = [
      {
        id: 'VIEW_PUBLIC_CONTENT',
        name: 'VIEW_PUBLIC_CONTENT',
        displayName: 'View Public Content',
        description: 'View publicly available content',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
        isActive: true,
      },
      {
        id: 'MANAGE_OWN_PROFILE',
        name: 'MANAGE_OWN_PROFILE',
        displayName: 'Manage Own Profile',
        description: 'Edit own profile information',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
        isActive: true,
      },
      {
        id: 'CREATE_CHATS',
        name: 'CREATE_CHATS',
        displayName: 'Create Chats',
        description: 'Create new chat conversations',
        category: PERMISSION_CATEGORIES.CHAT_MANAGEMENT,
        isActive: true,
      },
      {
        id: 'SEND_MESSAGES',
        name: 'SEND_MESSAGES',
        displayName: 'Send Messages',
        description: 'Send messages in chats',
        category: PERMISSION_CATEGORIES.CHAT_MANAGEMENT,
        isActive: true,
      },
      {
        id: 'VIEW_USER_PROFILES',
        name: 'VIEW_USER_PROFILES',
        displayName: 'View User Profiles',
        description: 'View other users profiles',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
        isActive: true,
      },
      {
        id: 'MODERATE_CONTENT',
        name: 'MODERATE_CONTENT',
        displayName: 'Moderate Content',
        description: 'Moderate user content',
        category: PERMISSION_CATEGORIES.CONTENT_MODERATION,
        isActive: true,
      },
      {
        id: 'MANAGE_USERS',
        name: 'MANAGE_USERS',
        displayName: 'Manage Users',
        description: 'Manage user accounts',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
        isActive: true,
      },
      {
        id: 'MANAGE_SUBSCRIPTIONS',
        name: 'MANAGE_SUBSCRIPTIONS',
        displayName: 'Manage Subscriptions',
        description: 'Manage user subscriptions',
        category: PERMISSION_CATEGORIES.SUBSCRIPTIONS,
        isActive: true,
      },
      {
        id: 'VIEW_ANALYTICS',
        name: 'VIEW_ANALYTICS',
        displayName: 'View Analytics',
        description: 'View system analytics',
        category: PERMISSION_CATEGORIES.ANALYTICS,
        isActive: true,
      },
      {
        id: 'MANAGE_SYSTEM',
        name: 'MANAGE_SYSTEM',
        displayName: 'Manage System',
        description: 'Manage system settings',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMIN,
        isActive: true,
      },
    ];

    // Default subscription plans
    const defaultPlans: Omit<
      SystemSubscriptionPlan,
      'createdAt' | 'updatedAt'
    >[] = [
      {
        id: 'free',
        name: 'FREE',
        displayName: 'Free Plan',
        description: 'Basic features for personal use',
        price: 0,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Basic Chat',
          'Limited Messages (100/month)',
          'Basic Support',
          'Single User',
        ],
        limits: {
          maxChats: 10,
          maxMessages: 100,
          maxUsers: 1,
          maxStorage: 100, // 100MB
          maxApiCalls: 1000,
        },
        isActive: true,
        isPopular: false,
        order: 1,
      },
      {
        id: 'pro',
        name: 'PRO',
        displayName: 'Pro Plan',
        description: 'Advanced features for professionals',
        price: 9.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Unlimited Chats',
          'Unlimited Messages',
          'Priority Support',
          'Advanced Analytics',
          'Team Collaboration',
        ],
        limits: {
          maxChats: -1, // Unlimited
          maxMessages: -1, // Unlimited
          maxUsers: 5,
          maxStorage: 1000, // 1GB
          maxApiCalls: 10000,
        },
        isActive: true,
        isPopular: true,
        order: 2,
      },
      {
        id: 'enterprise',
        name: 'ENTERPRISE',
        displayName: 'Enterprise Plan',
        description: 'Full-featured solution for organizations',
        price: 29.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Everything in Pro',
          'Custom Integrations',
          'Advanced Security',
          'Dedicated Support',
          'Custom Branding',
          'API Access',
        ],
        limits: {
          maxChats: -1, // Unlimited
          maxMessages: -1, // Unlimited
          maxUsers: -1, // Unlimited
          maxStorage: 10000, // 10GB
          maxApiCalls: 100000,
        },
        isActive: true,
        isPopular: false,
        order: 3,
      },
    ];

    // Default feature flags
    const defaultFeatureFlags: Omit<
      SystemFeatureFlag,
      'createdAt' | 'updatedAt'
    >[] = [
      {
        id: 'ai_chat_enabled',
        name: 'AI_CHAT_ENABLED',
        displayName: 'AI Chat',
        description: 'Enable AI chat functionality',
        enabled: true,
        rolloutPercentage: 100,
        targetRoles: ['USER', 'ADMIN'],
        targetPlans: ['FREE', 'PRO', 'ENTERPRISE'],
        conditions: {},
        metadata: {},
        createdBy: userId,
        updatedBy: userId,
      },
      {
        id: 'advanced_analytics',
        name: 'ADVANCED_ANALYTICS',
        displayName: 'Advanced Analytics',
        description: 'Advanced analytics dashboard',
        enabled: true,
        rolloutPercentage: 100,
        targetRoles: ['ADMIN'],
        targetPlans: ['PRO', 'ENTERPRISE'],
        conditions: {},
        metadata: {},
        createdBy: userId,
        updatedBy: userId,
      },
    ];

    // Default settings
    const defaultSettings: Omit<SystemSettings, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'app_name',
        category: SETTINGS_CATEGORIES.GENERAL,
        key: 'app_name',
        value: 'AI Personal Assistant',
        type: 'string',
        description: 'Application name displayed to users',
        isPublic: true,
        isEditable: true,
        updatedBy: userId,
      },
      {
        id: 'max_message_length',
        category: SETTINGS_CATEGORIES.LIMITS,
        key: 'max_message_length',
        value: 4000,
        type: 'number',
        description: 'Maximum message length in characters',
        isPublic: true,
        isEditable: true,
        validation: { min: 100, max: 10000 },
        updatedBy: userId,
      },
      {
        id: 'registration_enabled',
        category: SETTINGS_CATEGORIES.SECURITY,
        key: 'registration_enabled',
        value: true,
        type: 'boolean',
        description: 'Allow new user registration',
        isPublic: true,
        isEditable: true,
        updatedBy: userId,
      },
    ];

    // Add all configurations to batch
    defaultRoles.forEach((role) => {
      const roleRef = doc(db, SYSTEM_COLLECTIONS.ROLES, role.id);
      batch.set(roleRef, {
        ...role,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    defaultPermissions.forEach((permission) => {
      const permissionRef = doc(
        db,
        SYSTEM_COLLECTIONS.PERMISSIONS,
        permission.id
      );
      batch.set(permissionRef, {
        ...permission,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    defaultPlans.forEach((plan) => {
      const planRef = doc(db, SYSTEM_COLLECTIONS.SUBSCRIPTION_PLANS, plan.id);
      batch.set(planRef, {
        ...plan,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    defaultFeatureFlags.forEach((flag) => {
      const flagRef = doc(db, SYSTEM_COLLECTIONS.FEATURE_FLAGS, flag.id);
      batch.set(flagRef, {
        ...flag,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    defaultSettings.forEach((setting) => {
      const settingRef = doc(db, SYSTEM_COLLECTIONS.SETTINGS, setting.id);
      batch.set(settingRef, {
        ...setting,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    });

    await batch.commit();
  }

  // Load all configurations from Firestore
  async loadAllConfigurations(): Promise<SystemConfiguration> {
    try {
      const [roles, permissions, plans, flags, settings] = await Promise.all([
        this.loadRoles(),
        this.loadPermissions(),
        this.loadSubscriptionPlans(),
        this.loadFeatureFlags(),
        this.loadSettings(),
      ]);

      this.cache = {
        roles,
        permissions,
        subscriptionPlans: plans,
        featureFlags: flags,
        settings,
        lastUpdated: new Date(),
        version: '1.0.0',
      };

      return this.cache;
    } catch (error) {
      console.error('Failed to load system configurations:', error);

      // If loading fails and we don't have cached data, provide fallback
      if (this.cache.roles.length === 0) {
        this.provideFallbackConfigurations();
      }

      throw error;
    }
  }

  // Get cached configuration
  getConfiguration(): SystemConfiguration {
    return this.cache;
  }

  // Check if system is initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Load roles
  private async loadRoles(): Promise<SystemRole[]> {
    const snapshot = await getDocs(
      query(
        collection(db, SYSTEM_COLLECTIONS.ROLES),
        where('isActive', '==', true),
        orderBy('level')
      )
    );
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as SystemRole[];
  }

  // Load permissions
  private async loadPermissions(): Promise<SystemPermission[]> {
    const snapshot = await getDocs(
      query(
        collection(db, SYSTEM_COLLECTIONS.PERMISSIONS),
        where('isActive', '==', true)
      )
    );
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as SystemPermission[];
  }

  // Load subscription plans
  private async loadSubscriptionPlans(): Promise<SystemSubscriptionPlan[]> {
    const snapshot = await getDocs(
      query(
        collection(db, SYSTEM_COLLECTIONS.SUBSCRIPTION_PLANS),
        where('isActive', '==', true),
        orderBy('order')
      )
    );
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as SystemSubscriptionPlan[];
  }

  // Load feature flags
  private async loadFeatureFlags(): Promise<SystemFeatureFlag[]> {
    const snapshot = await getDocs(
      collection(db, SYSTEM_COLLECTIONS.FEATURE_FLAGS)
    );
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as SystemFeatureFlag[];
  }

  // Load settings
  private async loadSettings(): Promise<SystemSettings[]> {
    const snapshot = await getDocs(collection(db, SYSTEM_COLLECTIONS.SETTINGS));
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as SystemSettings[];
  }

  // CRUD Operations for Admin Panel

  // Roles
  async createRole(
    role: Omit<SystemRole, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const roleRef = doc(collection(db, SYSTEM_COLLECTIONS.ROLES));
    const timestamp = serverTimestamp();
    await setDoc(roleRef, {
      ...role,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await this.loadAllConfigurations();
    return roleRef.id;
  }

  async updateRole(
    id: string,
    updates: Partial<SystemRole>,
    userId: string
  ): Promise<void> {
    const roleRef = doc(db, SYSTEM_COLLECTIONS.ROLES, id);
    await updateDoc(roleRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
    await this.loadAllConfigurations();
  }

  async deleteRole(id: string): Promise<void> {
    await deleteDoc(doc(db, SYSTEM_COLLECTIONS.ROLES, id));
    await this.loadAllConfigurations();
  }

  // Permissions
  async createPermission(
    permission: Omit<SystemPermission, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const permissionRef = doc(collection(db, SYSTEM_COLLECTIONS.PERMISSIONS));
    const timestamp = serverTimestamp();
    await setDoc(permissionRef, {
      ...permission,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await this.loadAllConfigurations();
    return permissionRef.id;
  }

  async updatePermission(
    id: string,
    updates: Partial<SystemPermission>
  ): Promise<void> {
    const permissionRef = doc(db, SYSTEM_COLLECTIONS.PERMISSIONS, id);
    await updateDoc(permissionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await this.loadAllConfigurations();
  }

  // Subscription Plans
  async createSubscriptionPlan(
    plan: Omit<SystemSubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const planRef = doc(collection(db, SYSTEM_COLLECTIONS.SUBSCRIPTION_PLANS));
    const timestamp = serverTimestamp();
    await setDoc(planRef, {
      ...plan,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await this.loadAllConfigurations();
    return planRef.id;
  }

  async updateSubscriptionPlan(
    id: string,
    updates: Partial<SystemSubscriptionPlan>
  ): Promise<void> {
    const planRef = doc(db, SYSTEM_COLLECTIONS.SUBSCRIPTION_PLANS, id);
    await updateDoc(planRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    await this.loadAllConfigurations();
  }

  // Feature Flags
  async createFeatureFlag(
    flag: Omit<SystemFeatureFlag, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const flagRef = doc(collection(db, SYSTEM_COLLECTIONS.FEATURE_FLAGS));
    const timestamp = serverTimestamp();
    await setDoc(flagRef, {
      ...flag,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await this.loadAllConfigurations();
    return flagRef.id;
  }

  async updateFeatureFlag(
    id: string,
    updates: Partial<SystemFeatureFlag>,
    userId: string
  ): Promise<void> {
    const flagRef = doc(db, SYSTEM_COLLECTIONS.FEATURE_FLAGS, id);
    await updateDoc(flagRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
    await this.loadAllConfigurations();
  }

  // Settings
  async createSetting(
    setting: Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const settingRef = doc(collection(db, SYSTEM_COLLECTIONS.SETTINGS));
    const timestamp = serverTimestamp();
    await setDoc(settingRef, {
      ...setting,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await this.loadAllConfigurations();
    return settingRef.id;
  }

  async updateSetting(
    id: string,
    updates: Partial<SystemSettings>,
    userId: string
  ): Promise<void> {
    const settingRef = doc(db, SYSTEM_COLLECTIONS.SETTINGS, id);
    await updateDoc(settingRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
    await this.loadAllConfigurations();
  }

  // Utility methods
  hasPermission(userRole: string, permission: string): boolean {
    const role = this.cache.roles.find((r) => r.name === userRole);
    if (!role) return false;

    // Super admin has all permissions
    if (role.permissions.includes('*')) return true;

    return role.permissions.includes(permission);
  }

  isFeatureEnabled(
    featureName: string,
    userRole?: string,
    userPlan?: string
  ): boolean {
    const feature = this.cache.featureFlags.find((f) => f.name === featureName);
    if (!feature || !feature.enabled) return false;

    // Check role targeting
    if (userRole && feature.targetRoles.length > 0) {
      if (!feature.targetRoles.includes(userRole)) return false;
    }

    // Check plan targeting
    if (userPlan && feature.targetPlans.length > 0) {
      if (!feature.targetPlans.includes(userPlan)) return false;
    }

    return true;
  }

  getSettingValue(key: string, category?: string): unknown {
    const setting = this.cache.settings.find(
      (s) => s.key === key && (!category || s.category === category)
    );
    return setting?.value;
  }

  getPublicSettings(): SystemSettings[] {
    return this.cache.settings.filter((s) => s.isPublic);
  }

  // Real-time listeners
  subscribeToConfigChanges(
    callback: (config: SystemConfiguration) => void
  ): () => void {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to all collections
    Object.values(SYSTEM_COLLECTIONS).forEach((collectionName) => {
      const unsubscribe = onSnapshot(collection(db, collectionName), () => {
        this.loadAllConfigurations().then(callback);
      });
      unsubscribers.push(unsubscribe);
    });

    // Return cleanup function
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }
}

export const systemConfigService = new SystemConfigurationService();
export default systemConfigService;
