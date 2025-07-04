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
import { firestore } from './firebase';

export class RoleService {
  private static instance: RoleService;
  private db = firestore;
  private readonly USERS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`;
  private readonly ROLE_ASSIGNMENTS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_role_assignments`;
  private readonly ROLE_AUDIT_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_role_audit`;

  public static getInstance(): RoleService {
    if (!RoleService.instance) {
      RoleService.instance = new RoleService();
    }
    return RoleService.instance;
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
    const userLevel = ROLE_HIERARCHY[userRole];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
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

      // Get current user data
      const userDoc = await getDoc(
        doc(this.db, this.USERS_COLLECTION, request.userId)
      );
      if (!userDoc.exists()) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const currentUser = userDoc.data() as IPCAUser;
      const previousRole = currentUser.role || UserRole.USER;

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
      await updateDoc(userDoc.ref, {
        role: request.newRole,
        roleAssignment,
        lastActiveAt: new Date(),
      });

      // Log the role change
      await this.logRoleChange({
        id: `${request.userId}_${Date.now()}`,
        userId: request.userId,
        previousRole,
        newRole: request.newRole,
        changedBy: assignedBy,
        changedAt: new Date(),
        reason: request.reason,
      });

      // Save role assignment record
      await addDoc(collection(this.db, this.ROLE_ASSIGNMENTS_COLLECTION), {
        ...roleAssignment,
        createdAt: new Date(),
      });

      consoleLog('✅ Role assigned successfully:', {
        userId: request.userId,
        previousRole,
        newRole: request.newRole,
        assignedBy,
      });

      return {
        success: true,
        message: `Role changed from ${previousRole} to ${request.newRole}`,
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
   * Remove/revoke a role from a user (reset to default USER role)
   */
  public async revokeRole(
    userId: string,
    revokedBy: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await this.assignRole(
        {
          userId,
          newRole: UserRole.USER,
          reason: `Role revoked: ${reason}`,
        },
        revokedBy
      );
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
        collection(this.db, this.USERS_COLLECTION),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as IPCAUser);
    } catch (error) {
      consoleError('❌ Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Get role assignment history for a user
   */
  public async getRoleHistory(userId: string): Promise<RoleAuditLog[]> {
    try {
      const q = query(
        collection(this.db, this.ROLE_AUDIT_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => doc.data() as RoleAuditLog);
    } catch (error) {
      consoleError('❌ Error getting role history:', error);
      return [];
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Get all permissions for a role
   */
  public getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Get role configuration
   */
  public getRoleConfig(role: UserRole): RoleConfig {
    return ROLE_CONFIGS[role];
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

  /**
   * Check if user account is active
   */
  private isUserActive(user: IPCAUser): boolean {
    if (user.isActive === false) return false;
    if (user.isBanned) {
      if (user.bannedUntil && user.bannedUntil > new Date()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if role assignment is expired
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
    const userDoc = await getDoc(
      doc(this.db, this.USERS_COLLECTION, request.userId)
    );
    if (!userDoc.exists()) {
      errors.push('User not found');
    }

    // Check if assigner exists and has permission
    const assignerDoc = await getDoc(
      doc(this.db, this.USERS_COLLECTION, assignedBy)
    );
    if (!assignerDoc.exists()) {
      errors.push('Assigner not found');
    } else {
      const assigner = assignerDoc.data() as IPCAUser;
      const canAssignRoles = this.hasPermission(
        assigner,
        Permission.ASSIGN_ROLES
      );
      if (!canAssignRoles.hasPermission) {
        errors.push('Assigner lacks ASSIGN_ROLES permission');
      }

      // Check if assigner can assign this specific role
      const assignerLevel = ROLE_HIERARCHY[assigner.role || UserRole.USER];
      const targetRoleLevel = ROLE_HIERARCHY[request.newRole];
      if (assignerLevel <= targetRoleLevel) {
        errors.push('Cannot assign role equal or higher than your own');
      }
    }

    // Validate role
    if (!Object.values(UserRole).includes(request.newRole)) {
      errors.push('Invalid role specified');
    }

    // Validate expiration date
    if (request.expiresAt && request.expiresAt <= new Date()) {
      errors.push('Expiration date must be in the future');
    }

    // Validate reason
    if (!request.reason || request.reason.trim().length < 5) {
      errors.push('Reason must be at least 5 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Log role change for audit trail
   */
  private async logRoleChange(auditLog: RoleAuditLog): Promise<void> {
    try {
      await addDoc(collection(this.db, this.ROLE_AUDIT_COLLECTION), {
        ...auditLog,
        createdAt: new Date(),
      });
    } catch (error) {
      consoleError('❌ Error logging role change:', error);
    }
  }
}

// Export singleton instance
export const roleService = RoleService.getInstance();
