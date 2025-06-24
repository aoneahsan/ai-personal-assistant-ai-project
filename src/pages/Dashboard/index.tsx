import PWAInstallButton from '@/components/PWAInstallButton';
import { copyToClipboardWithToast } from '@/utils/helpers/capacitorApis';
import { consoleLog } from '@/utils/helpers/consoleHelper';
import { useUserProfileZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { MenuItem } from 'primereact/menuitem';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { Tree } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useState } from 'react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTreeKey, setSelectedTreeKey] = useState<string>('0');

  // Get user profile data from zustand state
  const { profile: userProfileData } = useUserProfileZState();

  // If no profile data, show loading or default
  if (!userProfileData) {
    return (
      <div className='flex align-items-center justify-content-center min-h-screen'>
        <div className='text-center'>
          <i className='pi pi-spin pi-spinner text-4xl text-primary mb-3'></i>
          <p className='text-color-secondary'>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Tree structure menu data
  const treeNodes: TreeNode[] = [
    {
      key: '0',
      label: 'Profile Overview',
      icon: 'pi pi-user',
      children: [
        {
          key: '0-0',
          label: 'General Information',
          icon: 'pi pi-info-circle',
        },
        {
          key: '0-1',
          label: 'Work Details',
          icon: 'pi pi-briefcase',
        },
        {
          key: '0-2',
          label: 'Personal Info',
          icon: 'pi pi-id-card',
        },
      ],
    },
    {
      key: '1',
      label: 'Settings',
      icon: 'pi pi-cog',
      children: [
        {
          key: '1-0',
          label: 'Account Settings',
          icon: 'pi pi-user-edit',
        },
        {
          key: '1-1',
          label: 'Privacy',
          icon: 'pi pi-shield',
        },
        {
          key: '1-2',
          label: 'Preferences',
          icon: 'pi pi-sliders-h',
        },
      ],
    },
    {
      key: '2',
      label: 'Activity',
      icon: 'pi pi-chart-line',
      children: [
        {
          key: '2-0',
          label: 'Recent Actions',
          icon: 'pi pi-clock',
        },
        {
          key: '2-1',
          label: 'Analytics',
          icon: 'pi pi-chart-bar',
        },
      ],
    },
  ];

  // Main sidebar menu items
  const sidebarMenuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', badge: null },
    { label: 'Modern Dashboard', icon: 'pi pi-desktop', badge: 'New' },
    { label: 'Profile', icon: 'pi pi-user', badge: null },
    { label: 'Projects', icon: 'pi pi-folder', badge: '3' },
    { label: 'Tasks', icon: 'pi pi-check-square', badge: '12' },
    { label: 'Messages', icon: 'pi pi-envelope', badge: '5' },
    { label: 'Calendar', icon: 'pi pi-calendar', badge: null },
    { label: 'Reports', icon: 'pi pi-chart-bar', badge: null },
    { label: 'Settings', icon: 'pi pi-cog', badge: null },
  ];

  // User menu items for dropdown
  const userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => consoleLog('Profile clicked'),
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

  const renderProfileCard = (title: string, data: any, icon: string) => {
    return (
      <Card
        title={
          <div className='flex align-items-center gap-2'>
            <i className={`${icon} text-primary`}></i>
            <span>{title}</span>
          </div>
        }
        className='mb-4 shadow-2'
      >
        <div className='grid'>
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className='col-12 md:col-6 lg:col-4 mb-3'
            >
              <div className='flex flex-column gap-1'>
                <span className='text-sm font-medium text-color-secondary'>
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
                <div className='flex align-items-center justify-content-between gap-2'>
                  <span className='text-color font-semibold flex-1'>
                    {value as string}
                  </span>
                  <Button
                    icon='pi pi-copy'
                    className='p-button-text p-button-rounded p-button-sm'
                    tooltip='Copy to clipboard'
                    tooltipOptions={{ position: 'top' }}
                    onClick={() =>
                      copyToClipboardWithToast({
                        value: value as string,
                        successMessage: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} copied to clipboard!`,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header Navigation */}
      <header className='bg-white shadow-1 border-bottom-1 surface-border sticky top-0 z-5'>
        <div className='flex align-items-center justify-content-between px-2 sm:px-4 py-2 sm:py-3'>
          {/* Left side - Logo and menu toggle */}
          <div className='flex align-items-center gap-2 sm:gap-3'>
            <Button
              icon='pi pi-bars'
              className='p-button-text p-button-rounded p-button-sm sm:p-button-md'
              onClick={() => setSidebarVisible(true)}
              tooltip='Menu'
              tooltipOptions={{ position: 'bottom' }}
            />
            <div className='flex align-items-center gap-2'>
              <i className='pi pi-shield text-primary text-lg sm:text-2xl'></i>
              <span className='text-lg sm:text-xl font-bold text-primary'>
                AI Personal Assistant
              </span>
            </div>
          </div>

          {/* Center - Navigation items */}
          <nav className='hidden xl:flex align-items-center gap-4'>
            <Button
              label='Dashboard'
              className='p-button-text'
            />
            <Button
              label='Modern Dashboard'
              className='p-button-text'
              onClick={() => navigate({ to: '/modern-dashboard' })}
            />
            <Button
              label='Analytics'
              className='p-button-text'
            />
            <Button
              label='Reports'
              className='p-button-text'
            />
            <Button
              label='Help'
              className='p-button-text'
            />
          </nav>

          {/* Right side - User profile */}
          <div className='flex align-items-center gap-2 sm:gap-3'>
            <Button
              icon='pi pi-bell'
              className='p-button-text p-button-rounded p-button-sm sm:p-button-md'
              badge='3'
              badgeClassName='p-badge-danger'
              tooltip='Notifications'
              tooltipOptions={{ position: 'bottom' }}
            />
            <div
              className='flex align-items-center gap-2 cursor-pointer'
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
                <span className='font-medium text-sm'>
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
        className='w-12rem'
      >
        <div className='flex flex-column gap-2'>
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
                className='p-button-text justify-content-start w-full'
                onClick={() => item.command && item.command({} as any)}
              />
            )
          )}
        </div>
      </OverlayPanel>

      {/* Main Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        position='left'
        onHide={() => setSidebarVisible(false)}
        className='w-full sm:w-20rem'
        header={
          <div className='flex align-items-center gap-2 px-3'>
            <i className='pi pi-shield text-primary text-lg sm:text-xl'></i>
            <span className='font-bold text-primary text-sm sm:text-base'>
              Dashboard
            </span>
          </div>
        }
      >
        <div className='flex flex-column gap-2 p-2 sm:p-3'>
          {sidebarMenuItems.map((item, index) => (
            <div
              key={index}
              className='flex align-items-center justify-content-between p-2 sm:p-3 border-round hover:surface-100 cursor-pointer transition-colors transition-duration-150'
              onClick={() => {
                if (item.label === 'Modern Dashboard') {
                  navigate({ to: '/modern-dashboard' });
                  setSidebarVisible(false);
                } else if (item.label === 'Profile') {
                  navigate({ to: '/edit-profile' });
                  setSidebarVisible(false);
                }
              }}
            >
              <div className='flex align-items-center gap-2 sm:gap-3'>
                <i className={`${item.icon} text-color-secondary`}></i>
                <span className='font-medium text-sm sm:text-base'>
                  {item.label}
                </span>
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

      {/* Main Content Layout */}
      <div className='flex min-h-screen'>
        {/* Sub Sidebar with Tree Menu */}
        <aside className='w-16rem sm:w-18rem lg:w-20rem bg-white shadow-1 border-right-1 surface-border hidden lg:block'>
          <div className='p-3 sm:p-4'>
            <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-color'>
              Navigation
            </h3>
            <Tree
              value={treeNodes}
              selectionMode='single'
              selectionKeys={selectedTreeKey}
              onSelectionChange={(e) => setSelectedTreeKey(e.value as string)}
              className='w-full'
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className='flex-1 p-2 sm:p-3 lg:p-4'>
          <div className='w-full'>
            {/* Page Header */}
            <div className='flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between mb-3 sm:mb-4 gap-3'>
              <div>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-color m-0'>
                  Dashboard
                </h1>
                <p className='text-color-secondary mt-1 sm:mt-2 mb-0 text-sm sm:text-base'>
                  Welcome back, {userProfileData.name}!
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  label='Modern'
                  icon='pi pi-desktop'
                  className='p-button-success p-button-outlined p-button-sm'
                  onClick={() => navigate({ to: '/modern-dashboard' })}
                />
                <Button
                  label='Ultra Compact'
                  icon='pi pi-compress'
                  className='p-button-outlined p-button-warning p-button-sm'
                  onClick={() => navigate({ to: '/compact-dashboard' })}
                />
                <Button
                  label='Edit'
                  icon='pi pi-pencil'
                  className='p-button-outlined p-button-sm'
                  onClick={() => navigate({ to: '/edit-profile' })}
                />
                <Button
                  label='Compact Edit'
                  icon='pi pi-compress'
                  className='p-button-outlined p-button-info p-button-sm'
                  onClick={() => navigate({ to: '/compact-edit-profile' })}
                />
                <PWAInstallButton />
              </div>
            </div>

            {/* Profile Data Cards */}
            <div className='grid'>
              <div className='col-12'>
                {renderProfileCard(
                  'General Information',
                  userProfileData.generalInfo,
                  'pi pi-user'
                )}
              </div>

              <div className='col-12 lg:col-6'>
                {renderProfileCard(
                  'Work Information',
                  userProfileData.workInfo,
                  'pi pi-briefcase'
                )}
              </div>

              <div className='col-12 lg:col-6'>
                {renderProfileCard(
                  'Birth & Location',
                  userProfileData.birthInfo,
                  'pi pi-map-marker'
                )}
              </div>

              <div className='col-12'>
                {renderProfileCard(
                  'Preferences',
                  userProfileData.preferences,
                  'pi pi-cog'
                )}
              </div>
            </div>

            {/* Additional Stats Cards */}
            <div className='grid mt-4'>
              <div className='col-12 md:col-6 lg:col-3'>
                <Card className='bg-blue-100 border-blue-200'>
                  <div className='flex align-items-center justify-content-between'>
                    <div className='flex-1'>
                      <div className='flex align-items-center gap-2'>
                        <span className='text-blue-900 text-xl font-bold'>
                          24
                        </span>
                        <Button
                          icon='pi pi-copy'
                          className='p-button-text p-button-rounded p-button-sm'
                          tooltip='Copy Active Projects count'
                          tooltipOptions={{ position: 'top' }}
                          onClick={() =>
                            copyToClipboardWithToast({
                              value: '24',
                              successMessage:
                                'Active Projects count copied to clipboard!',
                            })
                          }
                        />
                      </div>
                      <div className='text-blue-700 text-sm'>
                        Active Projects
                      </div>
                    </div>
                    <i className='pi pi-folder text-blue-500 text-2xl'></i>
                  </div>
                </Card>
              </div>

              <div className='col-12 md:col-6 lg:col-3'>
                <Card className='bg-green-100 border-green-200'>
                  <div className='flex align-items-center justify-content-between'>
                    <div className='flex-1'>
                      <div className='flex align-items-center gap-2'>
                        <span className='text-green-900 text-xl font-bold'>
                          89%
                        </span>
                        <Button
                          icon='pi pi-copy'
                          className='p-button-text p-button-rounded p-button-sm'
                          tooltip='Copy Completion Rate'
                          tooltipOptions={{ position: 'top' }}
                          onClick={() =>
                            copyToClipboardWithToast({
                              value: '89%',
                              successMessage:
                                'Completion Rate copied to clipboard!',
                            })
                          }
                        />
                      </div>
                      <div className='text-green-700 text-sm'>
                        Completion Rate
                      </div>
                    </div>
                    <i className='pi pi-check-circle text-green-500 text-2xl'></i>
                  </div>
                </Card>
              </div>

              <div className='col-12 md:col-6 lg:col-3'>
                <Card className='bg-orange-100 border-orange-200'>
                  <div className='flex align-items-center justify-content-between'>
                    <div className='flex-1'>
                      <div className='flex align-items-center gap-2'>
                        <span className='text-orange-900 text-xl font-bold'>
                          156
                        </span>
                        <Button
                          icon='pi pi-copy'
                          className='p-button-text p-button-rounded p-button-sm'
                          tooltip='Copy Total Tasks count'
                          tooltipOptions={{ position: 'top' }}
                          onClick={() =>
                            copyToClipboardWithToast({
                              value: '156',
                              successMessage:
                                'Total Tasks count copied to clipboard!',
                            })
                          }
                        />
                      </div>
                      <div className='text-orange-700 text-sm'>Total Tasks</div>
                    </div>
                    <i className='pi pi-check-square text-orange-500 text-2xl'></i>
                  </div>
                </Card>
              </div>

              <div className='col-12 md:col-6 lg:col-3'>
                <Card className='bg-purple-100 border-purple-200'>
                  <div className='flex align-items-center justify-content-between'>
                    <div className='flex-1'>
                      <div className='flex align-items-center gap-2'>
                        <span className='text-purple-900 text-xl font-bold'>
                          4.8
                        </span>
                        <Button
                          icon='pi pi-copy'
                          className='p-button-text p-button-rounded p-button-sm'
                          tooltip='Copy Rating'
                          tooltipOptions={{ position: 'top' }}
                          onClick={() =>
                            copyToClipboardWithToast({
                              value: '4.8',
                              successMessage: 'Rating copied to clipboard!',
                            })
                          }
                        />
                      </div>
                      <div className='text-purple-700 text-sm'>Rating</div>
                    </div>
                    <i className='pi pi-star-fill text-purple-500 text-2xl'></i>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
