import { DashboardPageWrapper } from '@/components/common';
import { useToast } from '@/hooks';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserProfileZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { useState } from 'react';

const DashboardAccount: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showRefreshSuccess, showLoadError, showInfo } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const { profile: userProfileData } = useUserProfileZState();

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Add any refresh logic here if needed
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate refresh
      showRefreshSuccess('Account');
    } catch (error) {
      showLoadError('account data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSecurityClick = () => {
    showInfo('Coming Soon', 'Security settings will be available soon');
  };

  const accountSettings = [
    {
      title: 'Profile Settings',
      description: 'Update your profile information',
      action: () => navigate({ to: ROUTES.EDIT_PROFILE }),
    },
    {
      title: 'Security',
      description: 'Manage your account security',
      action: handleSecurityClick,
    },
  ];

  const editProfileAction = (
    <Button
      label='Edit Profile'
      icon='pi pi-pencil'
      className='p-button-rounded'
      onClick={() => navigate({ to: ROUTES.EDIT_PROFILE })}
    />
  );

  return (
    <DashboardPageWrapper
      title='Account Information'
      onRefresh={handleRefresh}
      refreshing={refreshing}
      refreshTooltip='Refresh Account Data'
      actions={editProfileAction}
    >
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
              {accountSettings.map((setting, index) => (
                <div
                  key={index}
                  className='flex align-items-center justify-content-between p-3 border-round-lg surface-border border-1'
                >
                  <div>
                    <div
                      className='font-medium'
                      style={{ color: theme.textPrimary }}
                    >
                      {setting.title}
                    </div>
                    <div
                      className='text-sm'
                      style={{ color: theme.textSecondary }}
                    >
                      {setting.description}
                    </div>
                  </div>
                  <Button
                    icon='pi pi-chevron-right'
                    className='p-button-rounded p-button-text'
                    onClick={setting.action}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </DashboardPageWrapper>
  );
};

export default DashboardAccount;
