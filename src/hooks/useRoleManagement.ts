import { roleService } from '@/services/roleService';
import { IPCAUser } from '@/types/user';
import {
  Permission,
  RoleAssignmentRequest,
  RoleAuditLog,
  UserRole,
} from '@/types/user/roles';
import { useUserDataZState } from '@/zustandStates/userState';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export interface UseRoleManagementOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface RoleManagementState {
  loading: boolean;
  error: string | null;
  users: IPCAUser[];
  roleHistory: RoleAuditLog[];
  availableRoles: UserRole[];
  availablePermissions: Permission[];
}

export interface RoleManagementActions {
  assignRole: (request: RoleAssignmentRequest) => Promise<boolean>;
  revokeRole: (userId: string, reason: string) => Promise<boolean>;
  loadUsers: () => Promise<void>;
  loadUsersByRole: (role: UserRole) => Promise<void>;
  loadRoleHistory: (userId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  validateRoleAssignment: (request: RoleAssignmentRequest) => Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}

export const useRoleManagement = (
  options: UseRoleManagementOptions = {}
): RoleManagementState & RoleManagementActions => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const currentUser = useUserDataZState((state) => state.data);

  const [state, setState] = useState<RoleManagementState>({
    loading: false,
    error: null,
    users: [],
    roleHistory: [],
    availableRoles: roleService.getAllRoles(),
    availablePermissions: roleService.getAllPermissions(),
  });

  // ==================== Helper Functions ====================

  const updateState = useCallback((updates: Partial<RoleManagementState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: unknown, message: string) => {
      console.error(message, error);
      updateState({ error: message, loading: false });
      toast.error(message);
    },
    [updateState]
  );

  const setLoading = useCallback(
    (loading: boolean) => {
      updateState({ loading, error: null });
    },
    [updateState]
  );

  // ==================== Role Assignment ====================

  const assignRole = useCallback(
    async (request: RoleAssignmentRequest): Promise<boolean> => {
      if (!currentUser) {
        toast.error('You must be logged in to assign roles');
        return false;
      }

      // Check if current user has permission to assign roles
      const canAssign = roleService.hasPermission(
        currentUser,
        Permission.ASSIGN_ROLES
      );
      if (!canAssign.hasPermission) {
        toast.error('You do not have permission to assign roles');
        return false;
      }

      setLoading(true);

      try {
        const result = await roleService.assignRole(request, currentUser.id!);

        if (result.success) {
          toast.success(result.message);
          await loadUsers();
          return true;
        } else {
          toast.error(result.message);
          return false;
        }
      } catch (error) {
        handleError(error, 'Failed to assign role');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, setLoading, handleError]
  );

  const revokeRole = useCallback(
    async (userId: string, reason: string): Promise<boolean> => {
      if (!currentUser) {
        toast.error('You must be logged in to revoke roles');
        return false;
      }

      setLoading(true);

      try {
        const result = await roleService.revokeRole(
          userId,
          currentUser.id!,
          reason
        );

        if (result.success) {
          toast.success(result.message);
          await loadUsers();
          return true;
        } else {
          toast.error(result.message);
          return false;
        }
      } catch (error) {
        handleError(error, 'Failed to revoke role');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, setLoading, handleError]
  );

  // ==================== Data Loading ====================

  const loadUsers = useCallback(async (): Promise<void> => {
    if (!currentUser) return;

    // Check if user has permission to view users
    const canView = roleService.hasPermission(
      currentUser,
      Permission.VIEW_USERS
    );
    if (!canView.hasPermission) {
      updateState({ error: 'You do not have permission to view users' });
      return;
    }

    setLoading(true);

    try {
      // Load users from all roles (this would need to be implemented in roleService)
      const allUsers: IPCAUser[] = [];

      // Get users from each role
      for (const role of roleService.getAllRoles()) {
        const usersInRole = await roleService.getUsersByRole(role);
        allUsers.push(...usersInRole);
      }

      // Remove duplicates (users might appear in multiple role queries)
      const uniqueUsers = allUsers.filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );

      updateState({ users: uniqueUsers });
    } catch (error) {
      handleError(error, 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentUser, setLoading, handleError, updateState]);

  const loadUsersByRole = useCallback(
    async (role: UserRole): Promise<void> => {
      if (!currentUser) return;

      const canView = roleService.hasPermission(
        currentUser,
        Permission.VIEW_USERS
      );
      if (!canView.hasPermission) {
        updateState({ error: 'You do not have permission to view users' });
        return;
      }

      setLoading(true);

      try {
        const users = await roleService.getUsersByRole(role);
        updateState({ users });
      } catch (error) {
        handleError(error, `Failed to load users with role ${role}`);
      } finally {
        setLoading(false);
      }
    },
    [currentUser, setLoading, handleError, updateState]
  );

  const loadRoleHistory = useCallback(
    async (userId: string): Promise<void> => {
      if (!currentUser) return;

      const canView = roleService.hasPermission(
        currentUser,
        Permission.VIEW_USERS
      );
      if (!canView.hasPermission) {
        updateState({
          error: 'You do not have permission to view role history',
        });
        return;
      }

      setLoading(true);

      try {
        const history = await roleService.getRoleHistory(userId);
        updateState({ roleHistory: history });
      } catch (error) {
        handleError(error, 'Failed to load role history');
      } finally {
        setLoading(false);
      }
    },
    [currentUser, setLoading, handleError, updateState]
  );

  const refreshData = useCallback(async (): Promise<void> => {
    await loadUsers();
  }, [loadUsers]);

  // ==================== Validation ====================

  const validateRoleAssignment = useCallback(
    async (request: RoleAssignmentRequest) => {
      if (!currentUser) {
        return {
          isValid: false,
          errors: ['You must be logged in to assign roles'],
          warnings: [],
        };
      }

      const errors: string[] = [];
      const warnings: string[] = [];

      // Check if current user can assign roles
      const canAssign = roleService.hasPermission(
        currentUser,
        Permission.ASSIGN_ROLES
      );
      if (!canAssign.hasPermission) {
        errors.push('You do not have permission to assign roles');
      }

      // Check if current user can assign this specific role
      const currentUserLevel = roleService.getRoleConfig(
        currentUser.role || UserRole.USER
      ).level;
      const targetRoleLevel = roleService.getRoleConfig(request.newRole).level;

      if (currentUserLevel <= targetRoleLevel) {
        errors.push('You cannot assign a role equal or higher than your own');
      }

      // Validate request fields
      if (!request.userId || request.userId.trim().length === 0) {
        errors.push('User ID is required');
      }

      if (
        !request.newRole ||
        !Object.values(UserRole).includes(request.newRole)
      ) {
        errors.push('Valid role is required');
      }

      if (!request.reason || request.reason.trim().length < 5) {
        errors.push('Reason must be at least 5 characters long');
      }

      if (request.expiresAt && request.expiresAt <= new Date()) {
        errors.push('Expiration date must be in the future');
      }

      // Add warnings for potentially risky operations
      if (request.newRole === UserRole.SUPER_ADMIN) {
        warnings.push('Assigning Super Admin role grants full system access');
      }

      if (request.newRole === UserRole.ADMIN) {
        warnings.push('Assigning Admin role grants extensive system access');
      }

      if (
        request.expiresAt &&
        request.expiresAt > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      ) {
        warnings.push('Role assignment expires in more than 1 year');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
    [currentUser]
  );

  // ==================== Auto Refresh ====================

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  // ==================== Initial Load ====================

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser, loadUsers]);

  // ==================== Return Hook Interface ====================

  return {
    // State
    ...state,

    // Actions
    assignRole,
    revokeRole,
    loadUsers,
    loadUsersByRole,
    loadRoleHistory,
    refreshData,
    validateRoleAssignment,
  };
};
