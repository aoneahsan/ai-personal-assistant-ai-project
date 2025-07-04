// User Roles - Hierarchical system
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  USER = 'user',
  GUEST = 'guest',
}

// Granular Permissions for Admin Functions
export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  ASSIGN_ROLES = 'assign_roles',
  MANAGE_USER_SUBSCRIPTIONS = 'manage_user_subscriptions',

  // Content Management
  VIEW_ALL_CHATS = 'view_all_chats',
  MODERATE_CONTENT = 'moderate_content',
  DELETE_MESSAGES = 'delete_messages',
  EDIT_MESSAGES = 'edit_messages',
  BAN_USERS = 'ban_users',

  // System Administration
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_INTEGRATIONS = 'manage_integrations',
  MANAGE_FEATURE_FLAGS = 'manage_feature_flags',

  // Technical Operations
  VIEW_LOGS = 'view_logs',
  MANAGE_DATABASE = 'manage_database',
  MANAGE_BACKUPS = 'manage_backups',
  SYSTEM_MAINTENANCE = 'system_maintenance',

  // Financial Management
  VIEW_BILLING = 'view_billing',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  VIEW_REVENUE = 'view_revenue',
  MANAGE_PRICING = 'manage_pricing',

  // Support Operations
  VIEW_SUPPORT_TICKETS = 'view_support_tickets',
  RESPOND_TO_SUPPORT = 'respond_to_support',
  ESCALATE_ISSUES = 'escalate_issues',

  // Embed System Management
  MANAGE_EMBEDS = 'manage_embeds',
  VIEW_EMBED_ANALYTICS = 'view_embed_analytics',
  CONFIGURE_EMBED_SETTINGS = 'configure_embed_settings',
}

// Role Hierarchy - Higher roles inherit permissions from lower roles
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.GUEST]: 0,
  [UserRole.USER]: 1,
  [UserRole.SUPPORT]: 2,
  [UserRole.MODERATOR]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};

// Permission Mapping - What each role can do
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [],

  [UserRole.USER]: [],

  [UserRole.SUPPORT]: [
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.RESPOND_TO_SUPPORT,
    Permission.VIEW_USERS,
  ],

  [UserRole.MODERATOR]: [
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.RESPOND_TO_SUPPORT,
    Permission.ESCALATE_ISSUES,
    Permission.VIEW_USERS,
    Permission.VIEW_ALL_CHATS,
    Permission.MODERATE_CONTENT,
    Permission.DELETE_MESSAGES,
    Permission.BAN_USERS,
    Permission.ACCESS_ADMIN_PANEL,
  ],

  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.ASSIGN_ROLES,
    Permission.MANAGE_USER_SUBSCRIPTIONS,
    Permission.VIEW_ALL_CHATS,
    Permission.MODERATE_CONTENT,
    Permission.DELETE_MESSAGES,
    Permission.EDIT_MESSAGES,
    Permission.BAN_USERS,
    Permission.ACCESS_ADMIN_PANEL,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_INTEGRATIONS,
    Permission.MANAGE_FEATURE_FLAGS,
    Permission.VIEW_LOGS,
    Permission.VIEW_BILLING,
    Permission.MANAGE_SUBSCRIPTIONS,
    Permission.VIEW_REVENUE,
    Permission.MANAGE_PRICING,
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.RESPOND_TO_SUPPORT,
    Permission.ESCALATE_ISSUES,
    Permission.MANAGE_EMBEDS,
    Permission.VIEW_EMBED_ANALYTICS,
    Permission.CONFIGURE_EMBED_SETTINGS,
  ],

  [UserRole.SUPER_ADMIN]: [
    ...Object.values(Permission), // Super admin has all permissions
  ],
};

// Role Configuration
export interface RoleConfig {
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  level: number;
  isSystemRole: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  [UserRole.SUPER_ADMIN]: {
    name: UserRole.SUPER_ADMIN,
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions',
    color: '#FF6B6B',
    icon: 'pi pi-crown',
    level: ROLE_HIERARCHY[UserRole.SUPER_ADMIN],
    isSystemRole: true,
  },
  [UserRole.ADMIN]: {
    name: UserRole.ADMIN,
    displayName: 'Administrator',
    description: 'Administrative access to most system functions',
    color: '#4ECDC4',
    icon: 'pi pi-cog',
    level: ROLE_HIERARCHY[UserRole.ADMIN],
    isSystemRole: true,
  },
  [UserRole.MODERATOR]: {
    name: UserRole.MODERATOR,
    displayName: 'Moderator',
    description: 'Content moderation and user management',
    color: '#45B7D1',
    icon: 'pi pi-shield',
    level: ROLE_HIERARCHY[UserRole.MODERATOR],
    isSystemRole: true,
  },
  [UserRole.SUPPORT]: {
    name: UserRole.SUPPORT,
    displayName: 'Support Agent',
    description: 'Customer support and ticket management',
    color: '#F7DC6F',
    icon: 'pi pi-question-circle',
    level: ROLE_HIERARCHY[UserRole.SUPPORT],
    isSystemRole: true,
  },
  [UserRole.USER]: {
    name: UserRole.USER,
    displayName: 'User',
    description: 'Regular user with standard access',
    color: '#85C1E9',
    icon: 'pi pi-user',
    level: ROLE_HIERARCHY[UserRole.USER],
    isSystemRole: false,
  },
  [UserRole.GUEST]: {
    name: UserRole.GUEST,
    displayName: 'Guest',
    description: 'Limited access for non-authenticated users',
    color: '#D5DBDB',
    icon: 'pi pi-eye',
    level: ROLE_HIERARCHY[UserRole.GUEST],
    isSystemRole: false,
  },
};

// Role Assignment Interface
export interface UserRoleAssignment {
  userId: string;
  role: UserRole;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  reason?: string;
  isActive: boolean;
}

// Permission Check Result
export interface PermissionCheckResult {
  hasPermission: boolean;
  userRole: UserRole;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  message?: string;
}

// Role Assignment Request
export interface RoleAssignmentRequest {
  userId: string;
  newRole: UserRole;
  reason: string;
  expiresAt?: Date;
}

// Helper Types
export type RoleLevel = number;
export type PermissionSet = Set<Permission>;

// Role Validation
export interface RoleValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Audit Log for Role Changes
export interface RoleAuditLog {
  id: string;
  userId: string;
  previousRole: UserRole;
  newRole: UserRole;
  changedBy: string;
  changedAt: Date;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}
