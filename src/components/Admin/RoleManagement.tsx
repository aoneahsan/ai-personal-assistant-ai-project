import { PermissionGuard, RoleBadge } from '@/components/common/RoleGuard';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { roleService } from '@/services/roleService';
import { IPCAUser } from '@/types/user';
import {
  Permission,
  RoleAssignmentRequest,
  UserRole,
} from '@/types/user/roles';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';

interface RoleManagementProps {
  className?: string;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  className = '',
}) => {
  const toast = useRef<Toast>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<IPCAUser | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Role assignment form
  const [assignmentForm, setAssignmentForm] = useState<RoleAssignmentRequest>({
    userId: '',
    newRole: UserRole.USER,
    reason: '',
    expiresAt: undefined,
  });

  // Use role management hook
  const {
    loading,
    users,
    roleHistory,
    availableRoles,
    assignRole,
    revokeRole,
    loadRoleHistory,
    validateRoleAssignment,
  } = useRoleManagement({ autoRefresh: true, refreshInterval: 30000 });

  // ==================== Event Handlers ====================

  const handleAssignRole = async () => {
    try {
      const validation = await validateRoleAssignment(assignmentForm);

      if (!validation.isValid) {
        toast.current?.show({
          severity: 'error',
          summary: 'Validation Error',
          detail: validation.errors.join(', '),
        });
        return;
      }

      if (validation.warnings.length > 0) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Warning',
          detail: validation.warnings.join(', '),
        });
      }

      const success = await assignRole(assignmentForm);
      if (success) {
        setShowAssignDialog(false);
        resetAssignmentForm();
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Role assigned successfully',
        });
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to assign role',
      });
    }
  };

  const handleRevokeRole = async () => {
    if (!selectedUser) return;

    try {
      const success = await revokeRole(selectedUser.id!, assignmentForm.reason);
      if (success) {
        setShowRevokeDialog(false);
        setSelectedUser(null);
        resetAssignmentForm();
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Role revoked successfully',
        });
      }
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to revoke role',
      });
    }
  };

  const handleShowHistory = async (user: IPCAUser) => {
    setSelectedUser(user);
    await loadRoleHistory(user.id!);
    setShowHistoryDialog(true);
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      userId: '',
      newRole: UserRole.USER,
      reason: '',
      expiresAt: undefined,
    });
  };

  // ==================== UI Renderers ====================

  const renderUserRole = (user: IPCAUser) => {
    const role = user.role || UserRole.USER;
    return (
      <RoleBadge
        role={role}
        size='small'
      />
    );
  };

  const renderUserStatus = (user: IPCAUser) => {
    const isActive = user.isActive !== false;
    const isBanned = user.isBanned === true;

    if (isBanned) {
      return (
        <Tag
          value='Banned'
          severity='danger'
        />
      );
    }

    return (
      <Tag
        value={isActive ? 'Active' : 'Inactive'}
        severity={isActive ? 'success' : 'warning'}
      />
    );
  };

  const renderUserActions = (user: IPCAUser) => {
    return (
      <div className='flex gap-2'>
        <PermissionGuard permission={Permission.ASSIGN_ROLES}>
          <Button
            icon='pi pi-user-edit'
            className='p-button-sm p-button-outlined'
            tooltip='Assign Role'
            onClick={() => {
              setSelectedUser(user);
              setAssignmentForm((prev) => ({ ...prev, userId: user.id! }));
              setShowAssignDialog(true);
            }}
          />
        </PermissionGuard>

        <PermissionGuard permission={Permission.ASSIGN_ROLES}>
          <Button
            icon='pi pi-user-minus'
            className='p-button-sm p-button-outlined p-button-danger'
            tooltip='Revoke Role'
            onClick={() => {
              setSelectedUser(user);
              setAssignmentForm((prev) => ({ ...prev, userId: user.id! }));
              setShowRevokeDialog(true);
            }}
          />
        </PermissionGuard>

        <Button
          icon='pi pi-history'
          className='p-button-sm p-button-outlined p-button-info'
          tooltip='View Role History'
          onClick={() => handleShowHistory(user)}
        />
      </div>
    );
  };

  const renderPermissionsList = (role: UserRole) => {
    const permissions = roleService.getRolePermissions(role);
    return (
      <div className='flex flex-wrap gap-1'>
        {permissions.slice(0, 3).map((permission) => (
          <Chip
            key={permission}
            label={permission}
            className='text-xs'
          />
        ))}
        {permissions.length > 3 && (
          <Chip
            label={`+${permissions.length - 3} more`}
            className='text-xs'
          />
        )}
      </div>
    );
  };

  const renderRoleTimeline = () => {
    const events = roleHistory.map((log) => ({
      status: log.newRole,
      date: log.changedAt.toLocaleDateString(),
      icon: 'pi pi-user',
      color: roleService.getRoleConfig(log.newRole).color,
      title: `Changed to ${roleService.getRoleConfig(log.newRole).displayName}`,
      description: `By: ${log.changedBy} | Reason: ${log.reason}`,
    }));

    return (
      <Timeline
        value={events}
        align='alternate'
        className='customized-timeline'
      />
    );
  };

  // ==================== Filters ====================

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  // ==================== Role Statistics ====================

  const roleStats = availableRoles.map((role) => ({
    role,
    count: users.filter((user) => user.role === role).length,
    config: roleService.getRoleConfig(role),
  }));

  // ==================== Render ====================

  return (
    <div className={`role-management ${className}`}>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className='mb-4'>
        <h2 className='text-2xl font-bold mb-2'>Role Management</h2>
        <p className='text-gray-600'>Manage user roles and permissions</p>
      </div>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
        {/* Users Tab */}
        <TabPanel
          header='Users'
          leftIcon='pi pi-users'
        >
          <div className='mb-4 flex flex-wrap gap-4 items-center'>
            <div className='flex-1 min-w-0'>
              <InputText
                placeholder='Search users...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full'
              />
            </div>

            <Dropdown
              value={selectedRole}
              options={[
                { label: 'All Roles', value: null },
                ...availableRoles.map((role) => ({
                  label: roleService.getRoleConfig(role).displayName,
                  value: role,
                })),
              ]}
              onChange={(e) => setSelectedRole(e.value)}
              placeholder='Filter by role'
              className='w-48'
            />

            <Button
              icon='pi pi-refresh'
              label='Refresh'
              onClick={refreshData}
              loading={loading}
            />
          </div>

          <DataTable
            value={filteredUsers}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className='p-datatable-striped'
            emptyMessage='No users found'
            sortMode='multiple'
            removableSort
          >
            <Column
              field='displayName'
              header='Name'
              sortable
              body={(user: IPCAUser) => (
                <div className='flex items-center gap-2'>
                  <img
                    src={user.photoURL || '/default-avatar.png'}
                    alt={user.displayName}
                    className='w-8 h-8 rounded-full'
                  />
                  <div>
                    <div className='font-medium'>{user.displayName}</div>
                    <div className='text-sm text-gray-500'>{user.email}</div>
                  </div>
                </div>
              )}
            />

            <Column
              field='role'
              header='Role'
              sortable
              body={renderUserRole}
            />

            <Column
              field='isActive'
              header='Status'
              body={renderUserStatus}
            />

            <Column
              field='createdAt'
              header='Created'
              sortable
              body={(user: IPCAUser) =>
                new Date(user.createdAt!).toLocaleDateString()
              }
            />

            <Column
              field='lastLoginAt'
              header='Last Login'
              sortable
              body={(user: IPCAUser) =>
                user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString()
                  : 'Never'
              }
            />

            <Column
              header='Actions'
              body={renderUserActions}
              exportable={false}
            />
          </DataTable>
        </TabPanel>

        {/* Role Overview Tab */}
        <TabPanel
          header='Role Overview'
          leftIcon='pi pi-shield'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {roleStats.map(({ role, count, config }) => (
              <Card
                key={role}
                className='role-stat-card'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center'
                    style={{ backgroundColor: config.color + '20' }}
                  >
                    <i
                      className={config.icon}
                      style={{ color: config.color }}
                    />
                  </div>
                  <div>
                    <h3 className='font-semibold'>{config.displayName}</h3>
                    <p className='text-sm text-gray-600'>{count} users</p>
                  </div>
                </div>
                <div className='mt-3'>
                  <p className='text-sm text-gray-500'>{config.description}</p>
                </div>
                <div className='mt-3'>{renderPermissionsList(role)}</div>
              </Card>
            ))}
          </div>
        </TabPanel>

        {/* Permissions Tab */}
        <TabPanel
          header='Permissions'
          leftIcon='pi pi-key'
        >
          <div className='permissions-matrix'>
            {availableRoles.map((role) => {
              const permissions = roleService.getRolePermissions(role);
              const config = roleService.getRoleConfig(role);

              return (
                <Card
                  key={role}
                  className='mb-4'
                >
                  <div className='flex items-center gap-3 mb-3'>
                    <RoleBadge role={role} />
                    <span className='text-sm text-gray-600'>
                      {permissions.length} permissions
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                    {permissions.map((permission) => (
                      <div
                        key={permission}
                        className='flex items-center gap-2 p-2 bg-gray-50 rounded'
                      >
                        <i className='pi pi-check text-green-500' />
                        <span className='text-sm'>{permission}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabPanel>
      </TabView>

      {/* Assign Role Dialog */}
      <Dialog
        header='Assign Role'
        visible={showAssignDialog}
        onHide={() => setShowAssignDialog(false)}
        footer={
          <div className='flex justify-end gap-2'>
            <Button
              label='Cancel'
              icon='pi pi-times'
              onClick={() => setShowAssignDialog(false)}
              className='p-button-text'
            />
            <Button
              label='Assign'
              icon='pi pi-check'
              onClick={handleAssignRole}
              loading={loading}
            />
          </div>
        }
      >
        <div className='grid gap-4'>
          <div>
            <label className='block mb-2'>Role</label>
            <Dropdown
              value={assignmentForm.newRole}
              options={availableRoles.map((role) => ({
                label: roleService.getRoleConfig(role).displayName,
                value: role,
              }))}
              onChange={(e) =>
                setAssignmentForm((prev) => ({ ...prev, newRole: e.value }))
              }
              className='w-full'
            />
          </div>

          <div>
            <label className='block mb-2'>Reason *</label>
            <InputTextarea
              value={assignmentForm.reason}
              onChange={(e) =>
                setAssignmentForm((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder='Reason for role assignment...'
              rows={3}
              className='w-full'
            />
          </div>

          <div>
            <label className='block mb-2'>Expires At (Optional)</label>
            <Calendar
              value={assignmentForm.expiresAt}
              onChange={(e) =>
                setAssignmentForm((prev) => ({
                  ...prev,
                  expiresAt: e.value || undefined,
                }))
              }
              showTime
              className='w-full'
            />
          </div>
        </div>
      </Dialog>

      {/* Revoke Role Dialog */}
      <Dialog
        header='Revoke Role'
        visible={showRevokeDialog}
        onHide={() => setShowRevokeDialog(false)}
        footer={
          <div className='flex justify-end gap-2'>
            <Button
              label='Cancel'
              icon='pi pi-times'
              onClick={() => setShowRevokeDialog(false)}
              className='p-button-text'
            />
            <Button
              label='Revoke'
              icon='pi pi-check'
              onClick={handleRevokeRole}
              loading={loading}
              severity='danger'
            />
          </div>
        }
      >
        <div className='grid gap-4'>
          <p>
            Are you sure you want to revoke the role for{' '}
            {selectedUser?.displayName}?
          </p>
          <div>
            <label className='block mb-2'>Reason *</label>
            <InputTextarea
              value={assignmentForm.reason}
              onChange={(e) =>
                setAssignmentForm((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder='Reason for role revocation...'
              rows={3}
              className='w-full'
            />
          </div>
        </div>
      </Dialog>

      {/* Role History Dialog */}
      <Dialog
        header={`Role History - ${selectedUser?.displayName}`}
        visible={showHistoryDialog}
        onHide={() => setShowHistoryDialog(false)}
        style={{ width: '50vw' }}
        maximizable
      >
        <div className='role-history'>
          {roleHistory.length > 0 ? (
            renderRoleTimeline()
          ) : (
            <p className='text-center text-gray-500'>
              No role history available
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
};
