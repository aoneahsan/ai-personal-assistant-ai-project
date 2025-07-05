import { RefreshButton } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserProfileZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';

const DashboardAccount: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const toast = useRef<Toast>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { profile: userProfileData } = useUserProfileZState();

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Add any refresh logic here if needed
      toast.current?.show({
        severity: 'success',
        summary: 'Account Refreshed',
        detail: 'Account data has been successfully refreshed',
        life: 3000,
      });
    } catch (error) {
      console.error('Error refreshing account:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to refresh account data. Please try again.',
        life: 5000,
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className='flex align-items-center justify-content-between mb-4'>
        <h2
          className='text-2xl font-bold m-0'
          style={{ color: theme.textPrimary }}
        >
          Account Information
        </h2>
        <div className='flex align-items-center gap-2'>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={refreshing}
            tooltip='Refresh Account Data'
          />
          <Button
            label='Edit Profile'
            icon='pi pi-pencil'
            className='p-button-rounded'
            onClick={() => navigate({ to: ROUTES.EDIT_PROFILE })}
          />
        </div>
      </div>

      <Card className='shadow-3 border-round-2xl'>
        <div className='grid'>
          <div className='col-12 md:col-6'>
            <h3
              className='text-xl font-bold mb-4'
              style={{ color: theme.textPrimary }}
            >
              Profile Information
            </h3>
            <div className='space-y-4'>
              <div className='flex align-items-center gap-3'>
                <Avatar
                  label={userProfileData?.name?.charAt(0).toUpperCase() || 'U'}
                  shape='circle'
                  size='large'
                  image={userProfileData?.avatar || undefined}
                  className='bg-primary'
                />
                <div>
                  <div
                    className='font-medium text-lg'
                    style={{ color: theme.textPrimary }}
                  >
                    {userProfileData?.name || 'Unknown User'}
                  </div>
                  <div
                    className='text-sm'
                    style={{ color: theme.textSecondary }}
                  >
                    {userProfileData?.email || 'No email'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col-12 md:col-6'>
            <h3
              className='text-xl font-bold mb-4'
              style={{ color: theme.textPrimary }}
            >
              Account Settings
            </h3>
            <div className='space-y-3'>
              <div className='flex align-items-center justify-content-between p-3 border-round-lg surface-border border-1'>
                <div>
                  <div
                    className='font-medium'
                    style={{ color: theme.textPrimary }}
                  >
                    Profile Settings
                  </div>
                  <div
                    className='text-sm'
                    style={{ color: theme.textSecondary }}
                  >
                    Update your profile information
                  </div>
                </div>
                <Button
                  icon='pi pi-chevron-right'
                  className='p-button-rounded p-button-text'
                  onClick={() => navigate({ to: ROUTES.EDIT_PROFILE })}
                />
              </div>

              <div className='flex align-items-center justify-content-between p-3 border-round-lg surface-border border-1'>
                <div>
                  <div
                    className='font-medium'
                    style={{ color: theme.textPrimary }}
                  >
                    Security
                  </div>
                  <div
                    className='text-sm'
                    style={{ color: theme.textSecondary }}
                  >
                    Manage your account security
                  </div>
                </div>
                <Button
                  icon='pi pi-chevron-right'
                  className='p-button-rounded p-button-text'
                  onClick={() => {
                    toast.current?.show({
                      severity: 'info',
                      summary: 'Coming Soon',
                      detail: 'Security settings will be available soon',
                      life: 3000,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardAccount;
