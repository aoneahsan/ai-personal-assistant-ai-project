import { roleService } from '@/services/roleService';
import { IPCAUser } from '@/types/user';
import { Permission, UserRole } from '@/types/user/roles';
import { useUserDataZState } from '@/zustandStates/userState';
import React from 'react';

// ==================== Role Guard Component ====================

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL roles/permissions. If false, just one is enough
  fallback?: React.ReactNode;
  user?: IPCAUser | null; // Optional user prop, otherwise uses Zustand state
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles = [],
  permissions = [],
  requireAll = false,
  fallback = null,
  user: propUser,
}) => {
  const stateUser = useUserDataZState((state) => state.data);
  const user = propUser || stateUser;

  // If no roles or permissions specified, render children
  if (roles.length === 0 && permissions.length === 0) {
    return <>{children}</>;
  }

  let hasAccess = false;

  // Check roles
  if (roles.length > 0) {
    if (requireAll) {
      hasAccess = roles.every((role) => {
        const result = roleService.hasRoleLevel(user, role);
        return result.hasPermission;
      });
    } else {
      hasAccess = roles.some((role) => {
        const result = roleService.hasRoleLevel(user, role);
        return result.hasPermission;
      });
    }
  }

  // Check permissions
  if (permissions.length > 0) {
    if (requireAll) {
      const result = roleService.hasAllPermissions(user, permissions);
      hasAccess = hasAccess || result.hasPermission;
    } else {
      const result = roleService.hasAnyPermission(user, permissions);
      hasAccess = hasAccess || result.hasPermission;
    }
  }

  // If checking both roles and permissions, combine results
  if (roles.length > 0 && permissions.length > 0) {
    if (requireAll) {
      // Must have ALL roles AND ALL permissions
      const roleAccess = roles.every((role) => {
        const result = roleService.hasRoleLevel(user, role);
        return result.hasPermission;
      });
      const permissionAccess = roleService.hasAllPermissions(user, permissions);
      hasAccess = roleAccess && permissionAccess.hasPermission;
    } else {
      // Must have ANY role OR ANY permission
      const roleAccess = roles.some((role) => {
        const result = roleService.hasRoleLevel(user, role);
        return result.hasPermission;
      });
      const permissionAccess = roleService.hasAnyPermission(user, permissions);
      hasAccess = roleAccess || permissionAccess.hasPermission;
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// ==================== Permission Guard Component ====================

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
  user?: IPCAUser | null;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback = null,
  user: propUser,
}) => {
  const stateUser = useUserDataZState((state) => state.data);
  const user = propUser || stateUser;

  const result = roleService.hasPermission(user, permission);

  return result.hasPermission ? <>{children}</> : <>{fallback}</>;
};

// ==================== Admin Panel Guard ====================

interface AdminPanelGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  user?: IPCAUser | null;
}

export const AdminPanelGuard: React.FC<AdminPanelGuardProps> = ({
  children,
  fallback = null,
  user: propUser,
}) => {
  return (
    <PermissionGuard
      permission={Permission.ACCESS_ADMIN_PANEL}
      fallback={fallback}
      user={propUser}
    >
      {children}
    </PermissionGuard>
  );
};

// ==================== Role Badge Component ====================

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'medium',
  showIcon = true,
  showText = true,
  className = '',
}) => {
  const config = roleService.getRoleConfig(role);

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: config.color + '20', color: config.color }}
    >
      {showIcon && <i className={config.icon} />}
      {showText && <span>{config.displayName}</span>}
    </span>
  );
};

// ==================== Permission Status Component ====================

interface PermissionStatusProps {
  user?: IPCAUser | null;
  permission: Permission;
  children?: (hasPermission: boolean, message: string) => React.ReactNode;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({
  user: propUser,
  permission,
  children,
}) => {
  const stateUser = useUserDataZState((state) => state.data);
  const user = propUser || stateUser;

  const result = roleService.hasPermission(user, permission);

  if (children) {
    return <>{children(result.hasPermission, result.message || '')}</>;
  }

  return (
    <div
      className={`permission-status ${result.hasPermission ? 'granted' : 'denied'}`}
    >
      <i className={`pi ${result.hasPermission ? 'pi-check' : 'pi-times'}`} />
      <span>{result.message}</span>
    </div>
  );
};

// ==================== Role Selector Component ====================

interface RoleSelectorProps {
  currentRole: UserRole;
  availableRoles?: UserRole[];
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
  currentUser?: IPCAUser | null;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  availableRoles,
  onRoleChange,
  disabled = false,
  currentUser: propCurrentUser,
}) => {
  const stateUser = useUserDataZState((state) => state.data);
  const currentUser = propCurrentUser || stateUser;

  // Filter available roles based on current user's permissions
  const selectableRoles = (availableRoles || roleService.getAllRoles()).filter(
    (role) => {
      // Can only assign roles lower than current user's role
      const canAssign = roleService.hasPermission(
        currentUser,
        Permission.ASSIGN_ROLES
      );
      if (!canAssign.hasPermission) return false;

      const currentUserLevel = roleService.getRoleConfig(
        currentUser?.role || UserRole.USER
      ).level;
      const targetRoleLevel = roleService.getRoleConfig(role).level;

      return targetRoleLevel < currentUserLevel;
    }
  );

  return (
    <select
      value={currentRole}
      onChange={(e) => onRoleChange(e.target.value as UserRole)}
      disabled={disabled}
      className='role-selector'
    >
      {selectableRoles.map((role) => {
        const config = roleService.getRoleConfig(role);
        return (
          <option
            key={role}
            value={role}
          >
            {config.displayName}
          </option>
        );
      })}
    </select>
  );
};

// ==================== Hook for Role Checking ====================

export const useRoleCheck = (user?: IPCAUser | null) => {
  const stateUser = useUserDataZState((state) => state.data);
  const targetUser = user || stateUser;

  return {
    hasPermission: (permission: Permission) => {
      const result = roleService.hasPermission(targetUser, permission);
      return result.hasPermission;
    },
    hasRole: (role: UserRole) => {
      const result = roleService.hasRoleLevel(targetUser, role);
      return result.hasPermission;
    },
    hasAnyPermission: (permissions: Permission[]) => {
      const result = roleService.hasAnyPermission(targetUser, permissions);
      return result.hasPermission;
    },
    hasAllPermissions: (permissions: Permission[]) => {
      const result = roleService.hasAllPermissions(targetUser, permissions);
      return result.hasPermission;
    },
    getUserRole: () => targetUser?.role || UserRole.GUEST,
    getUserRoleConfig: () =>
      roleService.getRoleConfig(targetUser?.role || UserRole.GUEST),
    isAdmin: () => {
      const result = roleService.hasPermission(
        targetUser,
        Permission.ACCESS_ADMIN_PANEL
      );
      return result.hasPermission;
    },
    canManageUsers: () => {
      const result = roleService.hasPermission(
        targetUser,
        Permission.MANAGE_SETTINGS
      );
      return result.hasPermission;
    },
  };
};
