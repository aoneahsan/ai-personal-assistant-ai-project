import PWAInstallButton from '@/components/PWAInstallButton';
import { useTheme } from '@/hooks/useTheme';
import { useUserProfileZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import React from 'react';

const CompactDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { profile: userProfileData } = useUserProfileZState();

  // If no profile data, show loading state
  if (!userProfileData) {
    return (
      <div
        className='min-h-screen'
        style={{ background: theme.background }}
      >
        <div className='p-3'>
          <Skeleton
            height='3rem'
            className='mb-3'
          />
          <div className='grid'>
            <div className='col-12 md:col-6'>
              <Skeleton
                height='12rem'
                className='mb-3'
              />
            </div>
            <div className='col-12 md:col-6'>
              <Skeleton
                height='12rem'
                className='mb-3'
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quick stats data
  const quickStats = [
    {
      label: 'Tasks',
      value: 156,
      icon: 'pi pi-check-square',
      color: theme.primary,
    },
    {
      label: 'Projects',
      value: 24,
      icon: 'pi pi-folder',
      color: theme.success,
    },
    {
      label: 'Messages',
      value: 85,
      icon: 'pi pi-envelope',
      color: theme.secondary,
    },
    {
      label: 'Meetings',
      value: 12,
      icon: 'pi pi-calendar',
      color: theme.accent,
    },
  ];

  // Recent activity data
  const recentActivities = [
    {
      id: 1,
      action: 'Profile Updated',
      time: '2 hours ago',
      type: 'success',
      icon: 'pi pi-user',
    },
    {
      id: 2,
      action: 'New Chat Started',
      time: '4 hours ago',
      type: 'info',
      icon: 'pi pi-comments',
    },
    {
      id: 3,
      action: 'Task Completed',
      time: '6 hours ago',
      type: 'success',
      icon: 'pi pi-check-circle',
    },
    {
      id: 4,
      action: 'File Uploaded',
      time: '1 day ago',
      type: 'warning',
      icon: 'pi pi-upload',
    },
  ];

  const renderQuickAction = (
    label: string,
    icon: string,
    onClick: () => void,
    color?: string
  ) => {
    return (
      <Button
        label={label}
        icon={icon}
        className='p-button-outlined w-full justify-content-start'
        style={{
          borderColor: color || theme.border,
          color: color || theme.textPrimary,
        }}
        onClick={onClick}
      />
    );
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className='flex align-items-center gap-2'>
        <i
          className={`${rowData.icon} p-2 border-round-circle`}
          style={{
            background: getTypeColor(rowData.type),
            color: 'white',
            fontSize: '0.8rem',
          }}
        ></i>
        <div className='flex-1'>
          <div
            className='font-medium'
            style={{ color: theme.textPrimary }}
          >
            {rowData.action}
          </div>
          <div
            className='text-sm'
            style={{ color: theme.textSecondary }}
          >
            {rowData.time}
          </div>
        </div>
      </div>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'error':
        return theme.error;
      case 'info':
        return theme.info;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <div
      className='min-h-screen'
      style={{ background: theme.background }}
    >
      {/* Compact Header */}
      <header
        className='shadow-1 border-bottom-1 sticky top-0 z-5'
        style={{ background: theme.surface, borderColor: theme.border }}
      >
        <div className='flex align-items-center justify-content-between px-3 py-2'>
          <div className='flex align-items-center gap-2'>
            <i
              className='pi pi-shield text-xl'
              style={{ color: theme.primary }}
            ></i>
            <h1
              className='text-lg font-bold m-0'
              style={{ color: theme.textPrimary }}
            >
              AI Assistant
            </h1>
          </div>

          <div className='flex align-items-center gap-2'>
            <PWAInstallButton />
            <Avatar
              label={userProfileData.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
              style={{ background: theme.primary, color: 'white' }}
              shape='circle'
              size='normal'
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='p-3'>
        {/* Welcome Section */}
        <Card
          className='mb-4 shadow-2 border-round-xl overflow-hidden'
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
          }}
        >
          <div className='flex align-items-center justify-content-between text-white'>
            <div className='flex-1'>
              <h2 className='text-xl font-bold m-0 mb-2'>
                Welcome, {userProfileData.name.split(' ')[0]}! 👋
              </h2>
              <p className='text-sm opacity-90 m-0'>
                Here's your compact overview
              </p>
            </div>
            <div className='hidden md:block'>
              <Avatar
                label={userProfileData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
                className='bg-white'
                style={{ color: theme.primary }}
                shape='circle'
                size='large'
              />
            </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <div className='grid mb-4'>
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className='col-6 md:col-3'
            >
              <Card
                className='text-center shadow-2 border-round-xl'
                style={{ background: theme.surface }}
              >
                <div className='flex flex-column align-items-center gap-2'>
                  <i
                    className={`${stat.icon} text-2xl`}
                    style={{ color: stat.color }}
                  ></i>
                  <div
                    className='text-2xl font-bold'
                    style={{ color: theme.textPrimary }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className='text-sm'
                    style={{ color: theme.textSecondary }}
                  >
                    {stat.label}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className='grid'>
          {/* Quick Actions */}
          <div className='col-12 md:col-6'>
            <Card
              title={
                <div className='flex align-items-center gap-2'>
                  <i
                    className='pi pi-bolt'
                    style={{ color: theme.primary }}
                  ></i>
                  <span style={{ color: theme.textPrimary }}>
                    Quick Actions
                  </span>
                </div>
              }
              className='h-full shadow-2 border-round-xl'
              style={{ background: theme.surface }}
            >
              <div className='flex flex-column gap-3'>
                {renderQuickAction(
                  'Edit Profile',
                  'pi pi-user-edit',
                  () => navigate({ to: '/edit-profile' }),
                  theme.primary
                )}
                {renderQuickAction(
                  'Chat Messages',
                  'pi pi-comments',
                  () => navigate({ to: '/chats' }),
                  theme.secondary
                )}
                {renderQuickAction(
                  'Modern Dashboard',
                  'pi pi-desktop',
                  () => navigate({ to: '/modern-dashboard' }),
                  theme.success
                )}
                {renderQuickAction(
                  'Classic Dashboard',
                  'pi pi-home',
                  () => navigate({ to: '/dashboard' }),
                  theme.accent
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className='col-12 md:col-6'>
            <Card
              title={
                <div className='flex align-items-center gap-2'>
                  <i
                    className='pi pi-clock'
                    style={{ color: theme.primary }}
                  ></i>
                  <span style={{ color: theme.textPrimary }}>
                    Recent Activity
                  </span>
                </div>
              }
              className='h-full shadow-2 border-round-xl'
              style={{ background: theme.surface }}
            >
              <DataTable
                value={recentActivities}
                showHeaders={false}
                className='compact-table'
              >
                <Column body={actionBodyTemplate} />
              </DataTable>
            </Card>
          </div>
        </div>

        {/* Progress Overview */}
        <div className='grid mt-4'>
          <div className='col-12'>
            <Card
              title={
                <div className='flex align-items-center gap-2'>
                  <i
                    className='pi pi-chart-line'
                    style={{ color: theme.primary }}
                  ></i>
                  <span style={{ color: theme.textPrimary }}>
                    Progress Overview
                  </span>
                </div>
              }
              className='shadow-2 border-round-xl'
              style={{ background: theme.surface }}
            >
              <div className='grid'>
                <div className='col-12 md:col-6'>
                  <div className='mb-3'>
                    <div className='flex justify-content-between mb-2'>
                      <span style={{ color: theme.textPrimary }}>
                        Task Completion
                      </span>
                      <Chip
                        label='89%'
                        className='p-chip-lg'
                      />
                    </div>
                    <ProgressBar
                      value={89}
                      style={{ height: '8px' }}
                      color={theme.success}
                    />
                  </div>
                </div>
                <div className='col-12 md:col-6'>
                  <div className='mb-3'>
                    <div className='flex justify-content-between mb-2'>
                      <span style={{ color: theme.textPrimary }}>
                        Project Progress
                      </span>
                      <Chip
                        label='75%'
                        className='p-chip-lg'
                      />
                    </div>
                    <ProgressBar
                      value={75}
                      style={{ height: '8px' }}
                      color={theme.primary}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Profile Summary */}
        <div className='grid mt-4'>
          <div className='col-12'>
            <Card
              title={
                <div className='flex align-items-center gap-2'>
                  <i
                    className='pi pi-user'
                    style={{ color: theme.primary }}
                  ></i>
                  <span style={{ color: theme.textPrimary }}>
                    Profile Summary
                  </span>
                </div>
              }
              className='shadow-2 border-round-xl'
              style={{ background: theme.surface }}
            >
              <div className='grid'>
                <div className='col-12 md:col-4'>
                  <div className='text-center'>
                    <div
                      className='font-semibold mb-1'
                      style={{ color: theme.textSecondary }}
                    >
                      Name
                    </div>
                    <div style={{ color: theme.textPrimary }}>
                      {userProfileData.generalInfo.firstName}{' '}
                      {userProfileData.generalInfo.lastName}
                    </div>
                  </div>
                </div>
                <div className='col-12 md:col-4'>
                  <div className='text-center'>
                    <div
                      className='font-semibold mb-1'
                      style={{ color: theme.textSecondary }}
                    >
                      Position
                    </div>
                    <div style={{ color: theme.textPrimary }}>
                      {userProfileData.workInfo.position}
                    </div>
                  </div>
                </div>
                <div className='col-12 md:col-4'>
                  <div className='text-center'>
                    <div
                      className='font-semibold mb-1'
                      style={{ color: theme.textSecondary }}
                    >
                      Department
                    </div>
                    <div style={{ color: theme.textPrimary }}>
                      {userProfileData.workInfo.department}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom CSS for compact table */}
      <style>{`
        .compact-table .p-datatable-tbody > tr > td {
          padding: 0.5rem;
          border: none;
        }
        .compact-table .p-datatable-table {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default CompactDashboard;
