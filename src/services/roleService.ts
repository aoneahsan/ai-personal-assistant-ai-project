import { IPCAUser } from '@/types/user';
import {
  Permission,
  PermissionCheckResult,
  ROLE_CONFIGS,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  RoleAssignmentRequest,
  RoleAuditLog,
  RoleConfig,
  RoleValidationResult,
  UserRole,
  UserRoleAssignment,
} from '@/types/user/roles';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { systemConfigService } from './systemConfigurationService';

export class RoleService {
  private static instance: RoleService;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;
  private readonly ROLE_ASSIGNMENTS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_role_assignments`;
  private readonly ROLE_AUDIT_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_role_audit`;

  public static getInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService();
    }
    return RoleService.instance;
  }

  // ==================== Dynamic Configuration Helpers ====================

  /**
   * Get dynamic role hierarchy from system config
   */
  private getDynamicRoleHierarchy(): Record<string, number> {
    const config = systemConfigService.getConfiguration();
    const hierarchy: Record<string, number> = {};

    config.roles.forEach((role) => {
      // Map system roles to UserRole enum for backward compatibility
      const userRole = this.mapSystemRoleToUserRole(role.name);
      if (userRole) {
        hierarchy[userRole] = role.level;
      }
    });

    // Fallback to hardcoded values if dynamic config not available
    return Object.keys(hierarchy).length > 0 ? hierarchy : ROLE_HIERARCHY;
  }

  /**
   * Get dynamic role permissions from system config
   */
  private getDynamicRolePermissions(): Record<string, Permission[]> {
    const config = systemConfigService.getConfiguration();
    const rolePermissions: Record<string, Permission[]> = {};

    config.roles.forEach((role) => {
      const userRole = this.mapSystemRoleToUserRole(role.name);
      if (userRole) {
        // Map system permissions to Permission enum
        const permissions = role.permissions
          .map((perm) => this.mapSystemPermissionToPermission(perm))
          .filter(Boolean) as Permission[];

        rolePermissions[userRole] = permissions;
      }
    });

    // Fallback to hardcoded values if dynamic config not available
    return Object.keys(rolePermissions).length > 0
      ? rolePermissions
      : ROLE_PERMISSIONS;
  }

  /**
   * Get dynamic role configs from system config
   */
  private getDynamicRoleConfigs(): Record<string, RoleConfig> {
    const config = systemConfigService.getConfiguration();
    const roleConfigs: Record<string, RoleConfig> = {};

    config.roles.forEach((role) => {
      const userRole = this.mapSystemRoleToUserRole(role.name);
      if (userRole) {
        roleConfigs[userRole] = {
          name: userRole,
          displayName: role.displayName,
          description: role.description,
          color: role.color,
          icon: role.icon,
          level: role.level,
          isSystemRole: true,
        };
      }
    });

    // Fallback to hardcoded values if dynamic config not available
    return Object.keys(roleConfigs).length > 0 ? roleConfigs : ROLE_CONFIGS;
  }

  /**
   * Map system role names to UserRole enum for backward compatibility
   */
  private mapSystemRoleToUserRole(systemRoleName: string): UserRole | null {
    const roleMap: Record<string, UserRole> = {
      GUEST: UserRole.GUEST,
      USER: UserRole.USER,
      SUPPORT: UserRole.SUPPORT,
      MODERATOR: UserRole.MODERATOR,
      ADMIN: UserRole.ADMIN,
      SUPER_ADMIN: UserRole.SUPER_ADMIN,
    };

    return roleMap[systemRoleName.toUpperCase()] || null;
  }

  /**
   * Map system permission names to Permission enum for backward compatibility
   */
  private mapSystemPermissionToPermission(
    systemPermissionName: string
  ): Permission | null {
    // Check if the system permission matches any of our Permission enum values
    const permissionValues = Object.values(Permission);
    return (
      permissionValues.find((perm) => perm === systemPermissionName) || null
    );
  }

  // ==================== Permission Checking ====================

  /**
   * Check if a user has a specific permission
   */
  public hasPermission(
    user: IPCAUser | null | undefined,
    permission: Permission
  ): PermissionCheckResult {
    if (!user) {
      return {
        hasPermission: false,
        userRole: UserRole.GUEST,
        requiredPermission: permission,
        message: 'User not authenticated',
      };
    }

    const userRole = user.role || UserRole.USER;
    const userPermissions = this.getRolePermissions(userRole);
    const hasPermission = userPermissions.includes(permission);

    // Check if user account is active
    if (!this.isUserActive(user)) {
      return {
        hasPermission: false,
        userRole,
        requiredPermission: permission,
        message: 'User account is inactive or banned',
      };
    }

    // Check if role assignment is expired
    if (
      user.roleAssignment &&
      this.isRoleAssignmentExpired(user.roleAssignment)
    ) {
      return {
        hasPermission: false,
        userRole: UserRole.USER, // Default to user role if expired
        requiredPermission: permission,
        message: 'Role assignment has expired',
      };
    }

    return {
      hasPermission,
      userRole,
      requiredPermission: permission,
      message: hasPermission ? 'Permission granted' : 'Permission denied',
    };
  }

  /**
   * Check if user has any of the provided permissions
   */
  public hasAnyPermission(
    user: IPCAUser | null | undefined,
    permissions: Permission[]
  ): PermissionCheckResult {
    if (!user) {
      return {
        hasPermission: false,
        userRole: UserRole.GUEST,
        message: 'User not authenticated',
      };
    }

    for (const permission of permissions) {
      const result = this.hasPermission(user, permission);
      if (result.hasPermission) {
        return result;
      }
    }

    return {
      hasPermission: false,
      userRole: user.role || UserRole.USER,
      message: 'User lacks required permissions',
    };
  }

  /**
   * Check if user has all of the provided permissions
   */
  public hasAllPermissions(
    user: IPCAUser | null | undefined,
    permissions: Permission[]
  ): PermissionCheckResult {
    if (!user) {
      return {
        hasPermission: false,
        userRole: UserRole.GUEST,
        message: 'User not authenticated',
      };
    }

    for (const permission of permissions) {
      const result = this.hasPermission(user, permission);
      if (!result.hasPermission) {
        return result;
      }
    }

    return {
      hasPermission: true,
      userRole: user.role || UserRole.USER,
      message: 'All permissions granted',
    };
  }

  /**
   * Check if user has a role with equal or higher level
   */
  public hasRoleLevel(
    user: IPCAUser | null | undefined,
    requiredRole: UserRole
  ): PermissionCheckResult {
    if (!user) {
      return {
        hasPermission: false,
        userRole: UserRole.GUEST,
        requiredRole,
        message: 'User not authenticated',
      };
    }

    const userRole = user.role || UserRole.USER;
    const roleHierarchy = this.getDynamicRoleHierarchy();
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    const hasRequiredLevel = userLevel >= requiredLevel;

    return {
      hasPermission: hasRequiredLevel,
      userRole,
      requiredRole,
      message: hasRequiredLevel
        ? `User has ${userRole} role (level ${userLevel})`
        : `User needs ${requiredRole} role (level ${requiredLevel}) or higher`,
    };
  }

  // ==================== Role Management ====================

  /**
   * Assign a role to a user
   */
  public async assignRole(
    request: RoleAssignmentRequest,
    assignedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      consoleLog('🔄 Assigning role:', request);

      // Validate the role assignment
      const validation = await this.validateRoleAssignment(request, assignedBy);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', '),
        };
      }

      // Get current user
      const userRef = doc(db, this.USERS_COLLECTION, request.userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const userData = userDoc.data() as IPCAUser;
      const previousRole = userData.role || UserRole.USER;

      // Create role assignment
      const roleAssignment: UserRoleAssignment = {
        userId: request.userId,
        role: request.newRole,
        assignedBy,
        assignedAt: new Date(),
        expiresAt: request.expiresAt,
        reason: request.reason,
        isActive: true,
      };

      // Update user document
      await updateDoc(userRef, {
        role: request.newRole,
        roleAssignment,
        updatedAt: new Date(),
      });

      // Log the role change
      const auditLog: RoleAuditLog = {
        id: '', // Will be set by Firestore
        userId: request.userId,
        previousRole,
        newRole: request.newRole,
        changedBy: assignedBy,
        changedAt: new Date(),
        reason: request.reason,
      };

      await this.logRoleChange(auditLog);

      consoleLog('✅ Role assigned successfully:', {
        userId: request.userId,
        role: request.newRole,
        assignedBy,
      });

      return {
        success: true,
        message: `Role ${request.newRole} assigned successfully`,
      };
    } catch (error) {
      consoleError('❌ Error assigning role:', error);
      return {
        success: false,
        message: 'Failed to assign role',
      };
    }
  }

  /**
   * Revoke a role from a user (set back to USER)
   */
  public async revokeRole(
    userId: string,
    revokedBy: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const request: RoleAssignmentRequest = {
        userId,
        newRole: UserRole.USER,
        reason,
      };

      return await this.assignRole(request, revokedBy);
    } catch (error) {
      consoleError('❌ Error revoking role:', error);
      return {
        success: false,
        message: 'Failed to revoke role',
      };
    }
  }

  /**
   * Get all users with a specific role
   */
  public async getUsersByRole(role: UserRole): Promise<IPCAUser[]> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as IPCAUser);
    } catch (error) {
      consoleError('❌ Error fetching users by role:', error);
      return [];
    }
  }

  /**
   * Get role assignment history for a user
   */
  public async getRoleHistory(userId: string): Promise<RoleAuditLog[]> {
    try {
      const q = query(
        collection(db, this.ROLE_AUDIT_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }) as RoleAuditLog)
        .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());
    } catch (error) {
      consoleError('❌ Error fetching role history:', error);
      return [];
    }
  }

  // ==================== Role Information ====================

  /**
   * Get permissions for a specific role (using dynamic config)
   */
  public getRolePermissions(role: UserRole): Permission[] {
    const rolePermissions = this.getDynamicRolePermissions();
    return rolePermissions[role] || [];
  }

  /**
   * Get configuration for a specific role (using dynamic config)
   */
  public getRoleConfig(role: UserRole): RoleConfig {
    const roleConfigs = this.getDynamicRoleConfigs();
    return roleConfigs[role] || ROLE_CONFIGS[role];
  }

  /**
   * Get all available roles
   */
  public getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * Get all available permissions
   */
  public getAllPermissions(): Permission[] {
    return Object.values(Permission);
  }

  // ==================== Helper Methods ====================

  /**
   * Check if user account is active
   */
  private isUserActive(user: IPCAUser): boolean {
    // User is active if:
    // 1. Not explicitly banned
    // 2. Account is not suspended
    // 3. Email is verified (if required)
    return !user.isBanned && !user.isSuspended && user.isActive !== false;
  }

  /**
   * Check if role assignment has expired
   */
  private isRoleAssignmentExpired(assignment: UserRoleAssignment): boolean {
    if (!assignment.expiresAt) return false;
    return new Date() > assignment.expiresAt;
  }

  /**
   * Validate role assignment request
   */
  private async validateRoleAssignment(
    request: RoleAssignmentRequest,
    assignedBy: string
  ): Promise<RoleValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if user exists
    const userRef = doc(db, this.USERS_COLLECTION, request.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      errors.push('Target user does not exist');
      return { isValid: false, errors, warnings };
    }

    // Check if assigner has permission
    const assignerRef = doc(db, this.USERS_COLLECTION, assignedBy);
    const assignerDoc = await getDoc(assignerRef);

    if (!assignerDoc.exists()) {
      errors.push('Assigner user does not exist');
      return { isValid: false, errors, warnings };
    }

    const assignerData = assignerDoc.data() as IPCAUser;
    const assignerPermissionCheck = this.hasPermission(
      assignerData,
      Permission.ASSIGN_ROLES
    );

    if (!assignerPermissionCheck.hasPermission) {
      errors.push('Insufficient permissions to assign roles');
      return { isValid: false, errors, warnings };
    }

    // Check role hierarchy - prevent privilege escalation
    const roleHierarchy = this.getDynamicRoleHierarchy();
    const assignerLevel =
      roleHierarchy[assignerData.role || UserRole.USER] || 0;
    const targetRoleLevel = roleHierarchy[request.newRole] || 0;

    if (
      targetRoleLevel >= assignerLevel &&
      assignerData.role !== UserRole.SUPER_ADMIN
    ) {
      errors.push('Cannot assign role equal or higher than your own role');
      return { isValid: false, errors, warnings };
    }

    // Validate role exists
    if (!Object.values(UserRole).includes(request.newRole)) {
      errors.push('Invalid role specified');
      return { isValid: false, errors, warnings };
    }

    // Add warnings for sensitive operations
    if (request.newRole === UserRole.SUPER_ADMIN) {
      warnings.push('Assigning SUPER_ADMIN role grants full system access');
    }

    if (request.newRole === UserRole.ADMIN) {
      warnings.push('Assigning ADMIN role grants extensive system privileges');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Log role changes for audit purposes
   */
  private async logRoleChange(auditLog: RoleAuditLog): Promise<void> {
    try {
      const docRef = await addDoc(collection(db, this.ROLE_AUDIT_COLLECTION), {
        ...auditLog,
        changedAt: auditLog.changedAt,
      });
      consoleLog('📝 Role change logged:', docRef.id);
    } catch (error) {
      consoleError('❌ Error logging role change:', error);
      // Don't throw error here as it shouldn't block the role assignment
    }
  }
}

// Export singleton instance
export const roleService = RoleService.getInstance();
export default roleService;
