import { RoleBadge, useRoleCheck } from '@/components/common/RoleGuard';
import { roleService } from '@/services/roleService';
import { IPCAUser } from '@/types/user';
import { Permission } from '@/types/user/roles';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import React from 'react';

interface UserProfileRoleProps {
  user?: IPCAUser | null;
  showPermissions?: boolean;
  showRoleHistory?: boolean;
  className?: string;
}

export const UserProfileRole: React.FC<UserProfileRoleProps> = ({
  user,
  showPermissions = false,
  showRoleHistory = false,
  className = '',
}) => {
  const { getUserRole, getUserRoleConfig, hasPermission } = useRoleCheck(user);

  if (!user) {
    return (
      <Card className={`user-profile-role ${className}`}>
        <div className='text-center p-4'>
          <p className='text-gray-500'>No user information available</p>
        </div>
      </Card>
    );
  }

  const userRole = getUserRole();
  const roleConfig = getUserRoleConfig();
  const rolePermissions = roleService.getRolePermissions(userRole);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className={`user-profile-role ${className}`}>
      <div className='space-y-4'>
        {/* Role Information */}
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Role Information</h3>
          <RoleBadge
            role={userRole}
            size='medium'
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Role Level
            </label>
            <div className='flex items-center gap-2'>
              <Badge
                value={roleConfig.level}
                severity='info'
              />
              <span className='text-sm text-gray-500'>
                Level {roleConfig.level}
              </span>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Role Type
            </label>
            <Chip
              label={roleConfig.isSystemRole ? 'System Role' : 'User Role'}
              className={
                roleConfig.isSystemRole
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
              }
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-600 mb-1'>
            Description
          </label>
          <p className='text-sm text-gray-700'>{roleConfig.description}</p>
        </div>

        {/* Role Assignment Information */}
        {user.roleAssignment && (
          <>
            <Divider />
            <div>
              <h4 className='text-md font-semibold mb-3'>Role Assignment</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600 mb-1'>
                    Assigned Date
                  </label>
                  <span className='text-sm'>
                    {formatDate(user.roleAssignment.assignedAt)}
                  </span>
                </div>

                {user.roleAssignment.expiresAt && (
                  <div>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>
                      Expires
                    </label>
                    <span className='text-sm'>
                      {formatDate(user.roleAssignment.expiresAt)}
                    </span>
                  </div>
                )}

                {user.roleAssignment.reason && (
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-600 mb-1'>
                      Assignment Reason
                    </label>
                    <p className='text-sm text-gray-700'>
                      {user.roleAssignment.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* User Status */}
        <Divider />
        <div>
          <h4 className='text-md font-semibold mb-3'>Account Status</h4>
          <div className='flex flex-wrap gap-2'>
            <Chip
              label={user.isActive ? 'Active' : 'Inactive'}
              className={
                user.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            />

            {user.isBanned && (
              <Chip
                label='Banned'
                className='bg-red-100 text-red-800'
              />
            )}

            {user.isEmailVerified && (
              <Chip
                label='Email Verified'
                className='bg-blue-100 text-blue-800'
              />
            )}

            {user.verificationStatus && (
              <Chip
                label={`Verification: ${user.verificationStatus}`}
                className='bg-gray-100 text-gray-800'
              />
            )}
          </div>

          {user.bannedUntil && (
            <div className='mt-2'>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Banned Until
              </label>
              <span className='text-sm text-red-600'>
                {formatDate(user.bannedUntil)}
              </span>
              {user.bannedReason && (
                <p className='text-sm text-gray-600 mt-1'>
                  Reason: {user.bannedReason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Permissions */}
        {showPermissions && (
          <>
            <Divider />
            <div>
              <h4 className='text-md font-semibold mb-3'>
                Permissions ({rolePermissions.length})
              </h4>
              {rolePermissions.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {rolePermissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission.replace(/_/g, ' ')}
                      className='bg-gray-100 text-gray-700 text-xs'
                    />
                  ))}
                </div>
              ) : (
                <p className='text-sm text-gray-500'>No permissions assigned</p>
              )}
            </div>
          </>
        )}

        {/* Admin Notes */}
        {user.adminNotes && hasPermission(Permission.EDIT_USERS) && (
          <>
            <Divider />
            <div>
              <h4 className='text-md font-semibold mb-3'>Admin Notes</h4>
              <div className='bg-yellow-50 border border-yellow-200 rounded p-3'>
                <p className='text-sm text-yellow-800'>{user.adminNotes}</p>
              </div>
            </div>
          </>
        )}

        {/* Tags */}
        {user.tags && user.tags.length > 0 && (
          <>
            <Divider />
            <div>
              <h4 className='text-md font-semibold mb-3'>Tags</h4>
              <div className='flex flex-wrap gap-2'>
                {user.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    className='bg-purple-100 text-purple-700'
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default UserProfileRole;
