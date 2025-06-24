import PWAInstallButton from '@/components/PWAInstallButton';
import { copyToClipboardWithToast } from '@/utils/helpers/capacitorApis';
import { consoleLog } from '@/utils/helpers/consoleHelper';
import { useUserProfileZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { MenuItem } from 'primereact/menuitem';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import React, { useState } from 'react';

const CompactDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Get user profile data from zustand state
  const { profile: userProfileData } = useUserProfileZState();

  // If no profile data, show loading or default
  if (!userProfileData) {
    return (
      <div className='flex align-items-center justify-content-center min-h-screen'>
        <div className='text-center'>
          <i className='pi pi-spin pi-spinner text-2xl text-primary mb-2'></i>
          <p className='text-color-secondary text-sm'>Loading...</p>
        </div>
      </div>
    );
  }

  // Main sidebar menu items - more compact
  const sidebarMenuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', badge: null },
    { label: 'Modern', icon: 'pi pi-desktop', badge: 'New' },
    { label: 'Profile', icon: 'pi pi-user', badge: null },
    { label: 'Tasks', icon: 'pi pi-check-square', badge: '12' },
    { label: 'Messages', icon: 'pi pi-envelope', badge: '5' },
    { label: 'Settings', icon: 'pi pi-cog', badge: null },
  ];

  // User menu items for dropdown - compact
  const userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => navigate({ to: '/edit-profile' }),
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => consoleLog('Settings clicked'),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => consoleLog('Logout clicked'),
    },
  ];

  const userMenuRef = React.useRef<OverlayPanel>(null);

  const toggleUserMenu = (event: React.MouseEvent) => {
    userMenuRef.current?.toggle(event);
  };

  // Ultra compact info display component
  const CompactInfo = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon?: string;
  }) => (
    <div className='flex align-items-center gap-1 mb-1'>
      {icon && <i className={`${icon} text-xs text-color-secondary`}></i>}
      <span className='text-xs text-color-secondary'>{label}:</span>
      <span className='text-xs font-medium text-color flex-1'>{value}</span>
      <Button
        icon='pi pi-copy'
        className='p-button-text p-button-rounded'
        size='small'
        style={{ width: '1.2rem', height: '1.2rem' }}
        onClick={() =>
          copyToClipboardWithToast({
            value: value,
            successMessage: `${label} copied!`,
          })
        }
      />
    </div>
  );

  // Ultra compact section component
  const CompactSection = ({
    title,
    icon,
    data,
    color = 'primary',
  }: {
    title: string;
    icon: string;
    data: any;
    color?: string;
  }) => (
    <div className='border-1 surface-border border-round p-2 mb-2 bg-white'>
      <div className='flex align-items-center justify-content-between mb-2'>
        <div className='flex align-items-center gap-1'>
          <i className={`${icon} text-${color} text-sm`}></i>
          <span className='font-semibold text-sm text-color'>{title}</span>
        </div>
        <Badge
          value={Object.keys(data).length}
          severity='secondary'
          className='text-xs'
        />
      </div>
      <div className='grid'>
        {Object.entries(data).map(([key, value], index) => (
          <div
            key={key}
            className='col-12 sm:col-6 lg:col-4 p-1'
          >
            <CompactInfo
              label={key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())}
              value={value as string}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Ultra compact stats component
  const CompactStat = ({
    title,
    value,
    icon,
    color,
    change,
  }: {
    title: string;
    value: string;
    icon: string;
    color: string;
    change?: string;
  }) => (
    <div
      className={`border-1 border-${color}-200 bg-${color}-50 border-round p-2`}
    >
      <div className='flex align-items-center justify-content-between mb-1'>
        <span className='text-xs text-color-secondary'>{title}</span>
        <i className={`${icon} text-${color}-600 text-sm`}></i>
      </div>
      <div className='flex align-items-center justify-content-between'>
        <span className='text-lg font-bold text-color'>{value}</span>
        <Button
          icon='pi pi-copy'
          className='p-button-text p-button-rounded'
          size='small'
          style={{ width: '1.2rem', height: '1.2rem' }}
          onClick={() =>
            copyToClipboardWithToast({
              value: value,
              successMessage: `${title} copied!`,
            })
          }
        />
      </div>
      {change && (
        <div className='flex align-items-center gap-1 mt-1'>
          <i className='pi pi-arrow-up text-xs text-green-600'></i>
          <span className='text-xs text-green-600'>{change}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Ultra Compact Header */}
      <header className='bg-white shadow-1 border-bottom-1 surface-border sticky top-0 z-5'>
        <div className='flex align-items-center justify-content-between px-2 py-1'>
          {/* Left side - Logo and menu toggle */}
          <div className='flex align-items-center gap-2'>
            <Button
              icon='pi pi-bars'
              className='p-button-text p-button-rounded p-button-sm'
              onClick={() => setSidebarVisible(true)}
            />
            <div className='flex align-items-center gap-1'>
              <i className='pi pi-shield text-primary text-lg'></i>
              <span className='text-lg font-bold text-primary'>
                AI Personal Assistant
              </span>
            </div>
          </div>

          {/* Center - Quick navigation */}
          <nav className='hidden lg:flex align-items-center gap-1'>
            <Button
              label='Dashboard'
              className='p-button-text p-button-sm'
            />
            <Button
              label='Modern'
              className='p-button-text p-button-sm'
              onClick={() => navigate({ to: '/modern-dashboard' })}
            />
            <Button
              label='Classic'
              className='p-button-text p-button-sm'
              onClick={() => navigate({ to: '/dashboard' })}
            />
          </nav>

          {/* Right side - User profile */}
          <div className='flex align-items-center gap-1'>
            <Button
              icon='pi pi-bell'
              className='p-button-text p-button-rounded p-button-sm'
              badge='3'
              badgeClassName='p-badge-danger'
            />
            <div
              className='flex align-items-center gap-1 cursor-pointer'
              onClick={toggleUserMenu}
            >
              <Avatar
                label={userProfileData.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
                className='bg-primary'
                shape='circle'
                size='normal'
              />
              <div className='hidden sm:flex flex-column'>
                <span className='font-medium text-xs'>
                  {userProfileData.name}
                </span>
                <span className='text-xs text-color-secondary'>
                  {userProfileData.workInfo.position}
                </span>
              </div>
              <i className='pi pi-chevron-down text-xs text-color-secondary'></i>
            </div>
          </div>
        </div>
      </header>

      {/* User Menu Overlay */}
      <OverlayPanel
        ref={userMenuRef}
        className='w-10rem'
      >
        <div className='flex flex-column gap-1'>
          {userMenuItems.map((item, index) =>
            item.separator ? (
              <Divider
                key={index}
                className='my-1'
              />
            ) : (
              <Button
                key={index}
                label={item.label}
                icon={item.icon}
                className='p-button-text justify-content-start w-full p-button-sm'
                onClick={() => item.command && item.command({} as any)}
              />
            )
          )}
        </div>
      </OverlayPanel>

      {/* Compact Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        position='left'
        onHide={() => setSidebarVisible(false)}
        className='w-full sm:w-16rem'
        header={
          <div className='flex align-items-center gap-2 px-2'>
            <i className='pi pi-shield text-primary text-lg'></i>
            <span className='font-bold text-primary'>Menu</span>
          </div>
        }
      >
        <div className='flex flex-column gap-1 p-2'>
          {sidebarMenuItems.map((item, index) => (
            <div
              key={index}
              className='flex align-items-center justify-content-between p-2 border-round hover:surface-100 cursor-pointer transition-colors transition-duration-150'
              onClick={() => {
                if (item.label === 'Modern') {
                  navigate({ to: '/modern-dashboard' });
                  setSidebarVisible(false);
                } else if (item.label === 'Profile') {
                  navigate({ to: '/edit-profile' });
                  setSidebarVisible(false);
                }
              }}
            >
              <div className='flex align-items-center gap-2'>
                <i className={`${item.icon} text-color-secondary`}></i>
                <span className='font-medium text-sm'>{item.label}</span>
              </div>
              {item.badge && (
                <Badge
                  value={item.badge}
                  className={
                    item.badge === 'New' ? 'bg-green-500' : 'bg-primary'
                  }
                />
              )}
            </div>
          ))}
        </div>
      </Sidebar>

      {/* Ultra Compact Main Content */}
      <div className='p-2'>
        <div className='w-full'>
          {/* Ultra Compact Page Header */}
          <div className='flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between mb-2 gap-2'>
            <div>
              <h1 className='text-xl font-bold text-color m-0'>
                Compact Dashboard
              </h1>
              <p className='text-color-secondary text-xs m-0'>
                Welcome, {userProfileData.name.split(' ')[0]}!
              </p>
            </div>
            <div className='flex flex-wrap gap-1'>
              <Button
                label='Edit'
                icon='pi pi-pencil'
                className='p-button-outlined p-button-sm'
                onClick={() => navigate({ to: '/compact-edit-profile' })}
              />
              <Button
                label='Modern'
                icon='pi pi-desktop'
                className='p-button-success p-button-outlined p-button-sm'
                onClick={() => navigate({ to: '/modern-dashboard' })}
              />
              <Button
                label='Classic'
                icon='pi pi-home'
                className='p-button-outlined p-button-sm'
                onClick={() => navigate({ to: '/dashboard' })}
              />
            </div>
          </div>

          {/* Ultra Compact Stats Grid */}
          <div className='grid mb-2'>
            <div className='col-12 sm:col-6 lg:col-3 p-1'>
              <CompactStat
                title='Projects'
                value='24'
                icon='pi pi-folder'
                color='blue'
                change='+12%'
              />
            </div>
            <div className='col-12 sm:col-6 lg:col-3 p-1'>
              <CompactStat
                title='Tasks'
                value='156'
                icon='pi pi-check-square'
                color='green'
                change='+8%'
              />
            </div>
            <div className='col-12 sm:col-6 lg:col-3 p-1'>
              <CompactStat
                title='Messages'
                value='42'
                icon='pi pi-envelope'
                color='orange'
                change='+5%'
              />
            </div>
            <div className='col-12 sm:col-6 lg:col-3 p-1'>
              <CompactStat
                title='Rate'
                value='94%'
                icon='pi pi-chart-line'
                color='purple'
                change='+3%'
              />
            </div>
          </div>

          {/* Ultra Compact Profile Sections */}
          <div className='grid'>
            <div className='col-12 lg:col-6 p-1'>
              <CompactSection
                title='General Info'
                icon='pi pi-user'
                data={userProfileData.generalInfo}
                color='primary'
              />
            </div>
            <div className='col-12 lg:col-6 p-1'>
              <CompactSection
                title='Work Info'
                icon='pi pi-briefcase'
                data={userProfileData.workInfo}
                color='green'
              />
            </div>
            <div className='col-12 lg:col-6 p-1'>
              <CompactSection
                title='Birth & Location'
                icon='pi pi-map-marker'
                data={userProfileData.birthInfo}
                color='orange'
              />
            </div>
            <div className='col-12 lg:col-6 p-1'>
              <CompactSection
                title='Preferences'
                icon='pi pi-cog'
                data={userProfileData.preferences}
                color='purple'
              />
            </div>
          </div>

          {/* Ultra Compact Action Bar */}
          <div className='bg-white border-1 surface-border border-round p-2 mt-2'>
            <div className='flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-2'>
              <div className='flex align-items-center gap-2'>
                <i className='pi pi-info-circle text-blue-500 text-sm'></i>
                <span className='text-xs text-color-secondary'>
                  Ultra-compact view • All data visible at once
                </span>
              </div>
              <div className='flex flex-wrap gap-1'>
                <Button
                  label='Refresh'
                  icon='pi pi-refresh'
                  className='p-button-text p-button-sm'
                  onClick={() => window.location.reload()}
                />
                <Button
                  label='Export'
                  icon='pi pi-download'
                  className='p-button-outlined p-button-sm'
                />
                <Button
                  label='Share'
                  icon='pi pi-share-alt'
                  className='p-button-outlined p-button-sm'
                />
                <PWAInstallButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactDashboard;
