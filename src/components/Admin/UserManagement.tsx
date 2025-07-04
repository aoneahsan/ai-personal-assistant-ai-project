import { PermissionGuard, RoleBadge } from '@/components/common/RoleGuard';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { IPCAUser } from '@/types/user';
import { Permission, UserRole } from '@/types/user/roles';
import { SubscriptionPlan } from '@/types/user/subscription';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';

interface UserFilters {
  global: { value: string; matchMode: string };
  role: { value: UserRole | null; matchMode: string };
  subscription: { value: SubscriptionPlan | null; matchMode: string };
  isActive: { value: boolean | null; matchMode: string };
}

export const UserManagement: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<IPCAUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IPCAUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<IPCAUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<IPCAUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState<Date | null>(null);

  const {
    loading: roleLoading,
    assignRole,
    revokeRole,
    loadUsers,
    refreshData,
  } = useRoleManagement();

  const [filters, setFilters] = useState<UserFilters>({
    global: { value: '', matchMode: FilterMatchMode.CONTAINS },
    role: { value: null, matchMode: FilterMatchMode.EQUALS },
    subscription: { value: null, matchMode: FilterMatchMode.EQUALS },
    isActive: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    setLoading(true);
    try {
      await loadUsers();
      // In a real app, we'd get users from the hook
      // For now, simulate user data
      const mockUsers: IPCAUser[] = [
        {
          id: '1',
          email: 'admin@example.com',
          displayName: 'Admin User',
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          subscription: {
            plan: SubscriptionPlan.PREMIUM,
            isActive: true,
            startDate: new Date(),
            features: [],
          },
        },
        {
          id: '2',
          email: 'moderator@example.com',
          displayName: 'Moderator User',
          role: UserRole.MODERATOR,
          isActive: true,
          createdAt: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          subscription: {
            plan: SubscriptionPlan.PRO,
            isActive: true,
            startDate: new Date(),
            features: [],
          },
        },
        {
          id: '3',
          email: 'user@example.com',
          displayName: 'Regular User',
          role: UserRole.USER,
          isActive: true,
          isBanned: false,
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          subscription: {
            plan: SubscriptionPlan.FREE,
            isActive: true,
            startDate: new Date(),
            features: [],
          },
        },
        {
          id: '4',
          email: 'banned@example.com',
          displayName: 'Banned User',
          role: UserRole.USER,
          isActive: false,
          isBanned: true,
          bannedReason: 'Violation of community guidelines',
          bannedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(
            Date.now() - 45 * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastLoginAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          subscription: {
            plan: SubscriptionPlan.FREE,
            isActive: false,
            startDate: new Date(),
            features: [],
          },
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newFilters = { ...filters };
    newFilters['global'].value = value;
    setFilters(newFilters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className='flex flex-wrap gap-2 align-items-center justify-content-between'>
        <h4 className='m-0'>User Management</h4>
        <span className='p-input-icon-left'>
          <i className='pi pi-search' />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder='Search users...'
            className='p-inputtext-sm'
          />
        </span>
      </div>
    );
  };

  const renderUserAvatar = (user: IPCAUser) => {
    return (
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
    );
  };

  const renderUserRole = (user: IPCAUser) => {
    return (
      <RoleBadge
        role={user.role || UserRole.USER}
        size='small'
      />
    );
  };

  const renderUserStatus = (user: IPCAUser) => {
    if (user.isBanned) {
      return (
        <Tag
          value='Banned'
          severity='danger'
        />
      );
    }
    return (
      <Tag
        value={user.isActive ? 'Active' : 'Inactive'}
        severity={user.isActive ? 'success' : 'warning'}
      />
    );
  };

  const renderSubscription = (user: IPCAUser) => {
    if (!user.subscription)
      return (
        <Tag
          value='None'
          severity='secondary'
        />
      );

    const severityMap = {
      [SubscriptionPlan.FREE]: 'secondary',
      [SubscriptionPlan.PRO]: 'info',
      [SubscriptionPlan.PREMIUM]: 'success',
      [SubscriptionPlan.ENTERPRISE]: 'warning',
    };

    return (
      <Tag
        value={user.subscription.plan.toUpperCase()}
        severity={severityMap[user.subscription.plan] as any}
      />
    );
  };

  const renderLastLogin = (user: IPCAUser) => {
    if (!user.lastLoginAt) return 'Never';

    const lastLogin = new Date(user.lastLoginAt);
    const now = new Date();
    const diffInHours =
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return lastLogin.toLocaleDateString();
    }
  };

  const renderActions = (user: IPCAUser) => {
    return (
      <div className='flex gap-2'>
        <Button
          icon='pi pi-eye'
          className='p-button-sm p-button-outlined'
          tooltip='View Details'
          onClick={() => {
            setSelectedUser(user);
            setShowUserDialog(true);
          }}
        />

        <PermissionGuard permission={Permission.EDIT_USERS}>
          <Button
            icon='pi pi-pencil'
            className='p-button-sm p-button-outlined'
            tooltip='Edit User'
            onClick={() => {
              setEditingUser(user);
              setShowUserDialog(true);
            }}
          />
        </PermissionGuard>

        <PermissionGuard permission={Permission.BAN_USERS}>
          <Button
            icon={user.isBanned ? 'pi pi-unlock' : 'pi pi-ban'}
            className={`p-button-sm p-button-outlined ${
              user.isBanned ? 'p-button-success' : 'p-button-danger'
            }`}
            tooltip={user.isBanned ? 'Unban User' : 'Ban User'}
            onClick={() => {
              setSelectedUser(user);
              if (user.isBanned) {
                handleUnbanUser(user);
              } else {
                setShowBanDialog(true);
              }
            }}
          />
        </PermissionGuard>
      </div>
    );
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;

    try {
      // In a real app, this would call an API
      const updatedUser = {
        ...selectedUser,
        isBanned: true,
        isActive: false,
        bannedReason: banReason,
        bannedUntil: banUntil,
      };

      setUsers(users.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      setShowBanDialog(false);
      setBanReason('');
      setBanUntil(null);
      setSelectedUser(null);

      toast.current?.show({
        severity: 'success',
        summary: 'User Banned',
        detail: `${selectedUser.displayName} has been banned`,
      });
    } catch (error) {
      console.error('Error banning user:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to ban user',
      });
    }
  };

  const handleUnbanUser = async (user: IPCAUser) => {
    try {
      const updatedUser = {
        ...user,
        isBanned: false,
        isActive: true,
        bannedReason: undefined,
        bannedUntil: undefined,
      };

      setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));

      toast.current?.show({
        severity: 'success',
        summary: 'User Unbanned',
        detail: `${user.displayName} has been unbanned`,
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to unban user',
      });
    }
  };

  const leftToolbarTemplate = () => {
    return (
      <div className='flex flex-wrap gap-2'>
        <Button
          label='Refresh'
          icon='pi pi-refresh'
          onClick={loadUsersData}
          loading={loading}
        />
        <Button
          label='Export'
          icon='pi pi-upload'
          className='p-button-help'
          onClick={() => {
            // Export functionality
            toast.current?.show({
              severity: 'info',
              summary: 'Export',
              detail: 'Export functionality would be implemented here',
            });
          }}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className='flex flex-wrap gap-2'>
        <Button
          label='Bulk Actions'
          icon='pi pi-cog'
          className='p-button-outlined'
          disabled={selectedUsers.length === 0}
          onClick={() => {
            toast.current?.show({
              severity: 'info',
              summary: 'Bulk Actions',
              detail: 'Bulk actions would be implemented here',
            });
          }}
        />
      </div>
    );
  };

  return (
    <div className='user-management'>
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card>
        <Toolbar
          className='mb-4'
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
        />

        <DataTable
          value={users}
          selection={selectedUsers}
          onSelectionChange={(e) => setSelectedUsers(e.value)}
          dataKey='id'
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          filters={filters}
          filterDisplay='menu'
          globalFilterFields={['displayName', 'email', 'role']}
          header={renderHeader()}
          emptyMessage='No users found.'
          className='p-datatable-striped'
        >
          <Column
            selectionMode='multiple'
            headerStyle={{ width: '3rem' }}
          />
          <Column
            field='displayName'
            header='User'
            body={renderUserAvatar}
            sortable
          />
          <Column
            field='role'
            header='Role'
            body={renderUserRole}
            sortable
          />
          <Column
            field='subscription.plan'
            header='Subscription'
            body={renderSubscription}
            sortable
          />
          <Column
            field='isActive'
            header='Status'
            body={renderUserStatus}
            sortable
          />
          <Column
            field='lastLoginAt'
            header='Last Login'
            body={renderLastLogin}
            sortable
          />
          <Column
            field='createdAt'
            header='Created'
            sortable
            body={(user) => new Date(user.createdAt!).toLocaleDateString()}
          />
          <Column
            body={renderActions}
            exportable={false}
            style={{ minWidth: '8rem' }}
          />
        </DataTable>
      </Card>

      {/* User Details/Edit Dialog */}
      <Dialog
        visible={showUserDialog}
        onHide={() => {
          setShowUserDialog(false);
          setSelectedUser(null);
          setEditingUser(null);
        }}
        header={editingUser ? 'Edit User' : 'User Details'}
        style={{ width: '50vw' }}
        maximizable
      >
        {(selectedUser || editingUser) && (
          <div className='grid gap-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block mb-2'>Display Name</label>
                <InputText
                  value={
                    selectedUser?.displayName || editingUser?.displayName || ''
                  }
                  readOnly={!editingUser}
                  className='w-full'
                />
              </div>
              <div>
                <label className='block mb-2'>Email</label>
                <InputText
                  value={selectedUser?.email || editingUser?.email || ''}
                  readOnly={!editingUser}
                  className='w-full'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block mb-2'>Role</label>
                <RoleBadge
                  role={
                    selectedUser?.role || editingUser?.role || UserRole.USER
                  }
                />
              </div>
              <div>
                <label className='block mb-2'>Status</label>
                {renderUserStatus(selectedUser || editingUser!)}
              </div>
            </div>

            {(selectedUser?.isBanned || editingUser?.isBanned) && (
              <div>
                <label className='block mb-2'>Ban Reason</label>
                <InputTextarea
                  value={
                    selectedUser?.bannedReason ||
                    editingUser?.bannedReason ||
                    ''
                  }
                  readOnly
                  className='w-full'
                  rows={3}
                />
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block mb-2'>Created</label>
                <InputText
                  value={new Date(
                    (selectedUser?.createdAt || editingUser?.createdAt)!
                  ).toLocaleString()}
                  readOnly
                  className='w-full'
                />
              </div>
              <div>
                <label className='block mb-2'>Last Login</label>
                <InputText
                  value={renderLastLogin(selectedUser || editingUser!)}
                  readOnly
                  className='w-full'
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog
        visible={showBanDialog}
        onHide={() => {
          setShowBanDialog(false);
          setBanReason('');
          setBanUntil(null);
          setSelectedUser(null);
        }}
        header='Ban User'
        footer={
          <div className='flex justify-end gap-2'>
            <Button
              label='Cancel'
              icon='pi pi-times'
              onClick={() => {
                setShowBanDialog(false);
                setBanReason('');
                setBanUntil(null);
                setSelectedUser(null);
              }}
              className='p-button-text'
            />
            <Button
              label='Ban User'
              icon='pi pi-ban'
              onClick={handleBanUser}
              disabled={!banReason.trim()}
              severity='danger'
            />
          </div>
        }
      >
        <div className='grid gap-4'>
          <p>Are you sure you want to ban {selectedUser?.displayName}?</p>

          <div>
            <label className='block mb-2'>Reason *</label>
            <InputTextarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder='Enter reason for banning...'
              rows={3}
              className='w-full'
            />
          </div>

          <div>
            <label className='block mb-2'>Ban Until (Optional)</label>
            <Calendar
              value={banUntil}
              onChange={(e) => setBanUntil(e.value)}
              showTime
              className='w-full'
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
