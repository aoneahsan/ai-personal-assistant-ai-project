# User Roles and Permissions System

## Overview

This document describes the comprehensive Role-Based Access Control (RBAC) system implemented in the AI Personal Assistant application. The system provides granular permission management while maintaining compatibility with the existing subscription-based feature system.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Roles](#user-roles)
3. [Permissions](#permissions)
4. [Role Management](#role-management)
5. [UI Components](#ui-components)
6. [API Services](#api-services)
7. [Database Schema](#database-schema)
8. [Implementation Examples](#implementation-examples)
9. [Security Considerations](#security-considerations)
10. [Migration Guide](#migration-guide)

## System Architecture

The RBAC system consists of:

- **Role Types**: Hierarchical user roles (Guest → User → Support → Moderator → Admin → Super Admin)
- **Permission System**: Granular permissions for specific actions
- **Role Service**: Core business logic for role management
- **UI Components**: React components for role-based rendering
- **Database Integration**: Firestore collections for role data
- **Audit System**: Complete audit trail for role changes

## User Roles

### Role Hierarchy

```
Super Admin (Level 5)
├── Admin (Level 4)
│   ├── Moderator (Level 3)
│   │   ├── Support (Level 2)
│   │   │   ├── User (Level 1)
│   │   │   │   └── Guest (Level 0)
```

### Role Definitions

#### 1. Guest (Level 0)

- **Description**: Non-authenticated users
- **Color**: #D5DBDB
- **Icon**: pi-eye
- **Permissions**: None
- **Use Case**: Anonymous browsing

#### 2. User (Level 1)

- **Description**: Regular authenticated users
- **Color**: #85C1E9
- **Icon**: pi-user
- **Permissions**: Standard user features
- **Use Case**: Regular application usage

#### 3. Support (Level 2)

- **Description**: Customer support agents
- **Color**: #F7DC6F
- **Icon**: pi-question-circle
- **Permissions**:
  - View support tickets
  - Respond to support requests
  - View user profiles
- **Use Case**: Customer service and support

#### 4. Moderator (Level 3)

- **Description**: Content moderators
- **Color**: #45B7D1
- **Icon**: pi-shield
- **Permissions**:
  - All Support permissions
  - View all chats
  - Moderate content
  - Delete messages
  - Ban users
  - Access admin panel
- **Use Case**: Content moderation and user management

#### 5. Admin (Level 4)

- **Description**: System administrators
- **Color**: #4ECDC4
- **Icon**: pi-cog
- **Permissions**:
  - All Moderator permissions
  - User management (CRUD)
  - Role assignment
  - Subscription management
  - System settings
  - Analytics access
  - Integration management
- **Use Case**: System administration and configuration

#### 6. Super Admin (Level 5)

- **Description**: Ultimate system access
- **Color**: #FF6B6B
- **Icon**: pi-crown
- **Permissions**: All permissions
- **Use Case**: System ownership and critical operations

## Permissions

### Permission Categories

#### User Management

- `VIEW_USERS`: View user profiles and data
- `CREATE_USERS`: Create new user accounts
- `EDIT_USERS`: Modify user information
- `DELETE_USERS`: Remove user accounts
- `ASSIGN_ROLES`: Assign/change user roles
- `MANAGE_USER_SUBSCRIPTIONS`: Manage user subscription plans

#### Content Management

- `VIEW_ALL_CHATS`: Access all chat conversations
- `MODERATE_CONTENT`: Review and moderate content
- `DELETE_MESSAGES`: Remove messages
- `EDIT_MESSAGES`: Modify message content
- `BAN_USERS`: Temporarily or permanently ban users

#### System Administration

- `ACCESS_ADMIN_PANEL`: Access administrative interface
- `MANAGE_SETTINGS`: Modify system settings
- `VIEW_ANALYTICS`: Access system analytics
- `MANAGE_INTEGRATIONS`: Configure third-party integrations
- `MANAGE_FEATURE_FLAGS`: Toggle system features

#### Technical Operations

- `VIEW_LOGS`: Access system logs
- `MANAGE_DATABASE`: Direct database operations
- `MANAGE_BACKUPS`: Handle system backups
- `SYSTEM_MAINTENANCE`: Perform maintenance tasks

#### Financial Management

- `VIEW_BILLING`: Access billing information
- `MANAGE_SUBSCRIPTIONS`: Handle subscription plans
- `VIEW_REVENUE`: Access revenue data
- `MANAGE_PRICING`: Set pricing configurations

#### Support Operations

- `VIEW_SUPPORT_TICKETS`: Access support tickets
- `RESPOND_TO_SUPPORT`: Reply to support requests
- `ESCALATE_ISSUES`: Escalate support issues

#### Embed System Management

- `MANAGE_EMBEDS`: Configure embed widgets
- `VIEW_EMBED_ANALYTICS`: Access embed analytics
- `CONFIGURE_EMBED_SETTINGS`: Modify embed settings

## Role Management

### Role Assignment

```typescript
// Example role assignment
const assignmentRequest: RoleAssignmentRequest = {
  userId: 'user123',
  newRole: UserRole.MODERATOR,
  reason: 'Promoted to moderator for excellent community management',
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
};

const success = await roleService.assignRole(assignmentRequest, currentUserId);
```

### Role Validation

The system validates role assignments based on:

- Current user's permission level
- Target user's current role
- Role hierarchy constraints
- Assignment reason requirements
- Expiration date validity

### Audit Trail

All role changes are logged with:

- Previous role
- New role
- User who made the change
- Timestamp
- Reason for change
- IP address and user agent

## UI Components

### Role Guard Components

#### Basic Role Guard

```typescript
<RoleGuard roles={[UserRole.ADMIN, UserRole.MODERATOR]}>
  <AdminPanel />
</RoleGuard>
```

#### Permission Guard

```typescript
<PermissionGuard permission={Permission.VIEW_USERS}>
  <UserList />
</PermissionGuard>
```

#### Admin Panel Guard

```typescript
<AdminPanelGuard>
  <AdminDashboard />
</AdminPanelGuard>
```

### Role Display Components

#### Role Badge

```typescript
<RoleBadge
  role={UserRole.ADMIN}
  size="medium"
  showIcon={true}
  showText={true}
/>
```

#### Permission Status

```typescript
<PermissionStatus
  permission={Permission.EDIT_USERS}
  user={currentUser}
>
  {(hasPermission, message) => (
    <div className={hasPermission ? 'text-green-600' : 'text-red-600'}>
      {message}
    </div>
  )}
</PermissionStatus>
```

### Role Management Hook

```typescript
const {
  loading,
  users,
  assignRole,
  revokeRole,
  loadUsers,
  validateRoleAssignment,
} = useRoleManagement();
```

## API Services

### Role Service

```typescript
// Check permission
const result = roleService.hasPermission(user, Permission.VIEW_USERS);

// Check role level
const hasRole = roleService.hasRoleLevel(user, UserRole.ADMIN);

// Assign role
const success = await roleService.assignRole(request, assignedBy);

// Get role permissions
const permissions = roleService.getRolePermissions(UserRole.MODERATOR);
```

### Integration with Existing Services

The role system integrates with:

- **Authentication Service**: Role assignment on user creation
- **Feature Flag Service**: Role-based feature access
- **Admin Settings Service**: Role-based configuration access
- **Firebase Service**: Role data persistence

## Database Schema

### User Document Structure

```typescript
interface IPCAUser {
  id: string;
  email: string;
  displayName: string;
  // ... other user fields

  // Role-based access control
  role: UserRole;
  roleAssignment?: UserRoleAssignment;
  isActive: boolean;
  isBanned: boolean;
  bannedUntil?: Date;
  bannedReason?: string;

  // Profile completion
  profileCompletionPercentage?: number;
  isProfileComplete?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';

  // Administrative notes
  adminNotes?: string;
  tags?: string[];
}
```

### Role Assignment Collection

```typescript
interface UserRoleAssignment {
  userId: string;
  role: UserRole;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  reason?: string;
  isActive: boolean;
}
```

### Audit Log Collection

```typescript
interface RoleAuditLog {
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
```

## Implementation Examples

### Protected Route Component

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useRoleCheck();

  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Conditional Menu Items

```typescript
const AdminMenu: React.FC = () => {
  const { hasPermission } = useRoleCheck();

  return (
    <nav>
      {hasPermission(Permission.VIEW_USERS) && (
        <MenuItem icon="pi-users" label="User Management" />
      )}
      {hasPermission(Permission.MANAGE_SETTINGS) && (
        <MenuItem icon="pi-cog" label="Settings" />
      )}
      {hasPermission(Permission.VIEW_ANALYTICS) && (
        <MenuItem icon="pi-chart-bar" label="Analytics" />
      )}
    </nav>
  );
};
```

### Role-Based Form Fields

```typescript
const UserForm: React.FC = () => {
  const { hasPermission } = useRoleCheck();

  return (
    <form>
      <InputText name="name" label="Name" />
      <InputText name="email" label="Email" />

      {hasPermission(Permission.ASSIGN_ROLES) && (
        <RoleSelector
          currentRole={user.role}
          onRoleChange={handleRoleChange}
        />
      )}

      {hasPermission(Permission.EDIT_USERS) && (
        <InputTextarea name="adminNotes" label="Admin Notes" />
      )}
    </form>
  );
};
```

## Security Considerations

### Role Hierarchy Enforcement

- Users can only assign roles lower than their own
- Role assignments require explicit permission checks
- Expired role assignments automatically revert to default

### Permission Validation

- All permission checks are performed server-side
- UI components provide UX but not security
- Role changes are logged for audit purposes

### Data Protection

- Admin notes and sensitive data are role-restricted
- User data access is permission-based
- Role assignment requires authentication

### Best Practices

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Role Rotation**: Regularly review and update role assignments
3. **Audit Compliance**: Maintain complete audit trails
4. **Separation of Duties**: Distribute critical permissions across roles
5. **Regular Review**: Periodically audit role assignments and permissions

## Migration Guide

### Updating Existing Users

```typescript
// Add default role to existing users
const updateExistingUsers = async () => {
  const users = await getAllUsers();

  for (const user of users) {
    if (!user.role) {
      await updateUser(user.id, {
        role: UserRole.USER,
        isActive: true,
      });
    }
  }
};
```

### Component Updates

```typescript
// Before: Subscription-based check
{user.subscription?.plan === SubscriptionPlan.PREMIUM && (
  <PremiumFeature />
)}

// After: Role-based check
<PermissionGuard permission={Permission.ACCESS_PREMIUM_FEATURES}>
  <PremiumFeature />
</PermissionGuard>
```

### Service Integration

```typescript
// Before: Manual permission checks
if (user.email?.includes('@admin.com')) {
  // Admin logic
}

// After: Role-based checks
const { hasPermission } = useRoleCheck();
if (hasPermission(Permission.ACCESS_ADMIN_PANEL)) {
  // Admin logic
}
```

## Troubleshooting

### Common Issues

1. **Role Assignment Errors**: Check role hierarchy and permissions
2. **Permission Denied**: Verify user authentication and role assignment
3. **UI Not Updating**: Ensure role changes trigger re-renders
4. **Database Errors**: Check Firestore security rules and collection names

### Debug Tools

```typescript
// Debug role information
const debugRole = (user: IPCAUser) => {
  console.log('User Role Debug:', {
    role: user.role,
    level: ROLE_HIERARCHY[user.role || UserRole.USER],
    permissions: roleService.getRolePermissions(user.role || UserRole.USER),
    isActive: user.isActive,
    isBanned: user.isBanned,
  });
};
```

## Future Enhancements

1. **Dynamic Permissions**: Runtime permission configuration
2. **Role Templates**: Pre-configured role sets
3. **Group-based Permissions**: Role inheritance from groups
4. **Conditional Permissions**: Context-based permission granting
5. **Multi-tenant Support**: Organization-scoped roles

---

## Quick Reference

### Role Hierarchy

```
Super Admin > Admin > Moderator > Support > User > Guest
```

### Key Permissions

- `ACCESS_ADMIN_PANEL`: Admin interface access
- `ASSIGN_ROLES`: Role management capability
- `VIEW_USERS`: User data access
- `MANAGE_SETTINGS`: System configuration

### Common Patterns

```typescript
// Permission check
const canEdit = roleService.hasPermission(user, Permission.EDIT_USERS);

// Role level check
const isAdmin = roleService.hasRoleLevel(user, UserRole.ADMIN);

// Multiple permissions
const canManage = roleService.hasAllPermissions(user, [
  Permission.VIEW_USERS,
  Permission.EDIT_USERS,
]);
```

This comprehensive role system provides secure, scalable, and maintainable access control for the AI Personal Assistant application.
