import EmbedManager from '@/components/EmbeddableWidget/EmbedManager';
import PWAInstallButton from '@/components/PWAInstallButton';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { copyToClipboardWithToast } from '@/utils/helpers/capacitorApis';
import { useUserProfileZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import { MenuItem } from 'primereact/menuitem';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Panel } from 'primereact/panel';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { Tree } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useState } from 'react';

const ModernDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTreeKey, setSelectedTreeKey] = useState<string>('0');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showSubscriptionManagement, setShowSubscriptionManagement] =
    useState(false);
  const [showEmbedManager, setShowEmbedManager] = useState(false);

  // Get user profile data from zustand state
  const { profile: userProfileData } = useUserProfileZState();

  // If no profile data, show loading or default
  if (!userProfileData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
        <div className='p-3'>
          <Skeleton
            height='4rem'
            className='mb-4'
          />
          <div className='grid'>
            <div className='col-12 md:col-6 lg:col-3'>
              <Skeleton
                height='8rem'
                className='mb-3'
              />
            </div>
            <div className='col-12 md:col-6 lg:col-3'>
              <Skeleton
                height='8rem'
                className='mb-3'
              />
            </div>
            <div className='col-12 md:col-6 lg:col-3'>
              <Skeleton
                height='8rem'
                className='mb-3'
              />
            </div>
            <div className='col-12 md:col-6 lg:col-3'>
              <Skeleton
                height='8rem'
                className='mb-3'
              />
            </div>
          </div>
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
      label: 'Analytics',
      icon: 'pi pi-chart-line',
      children: [
        {
          key: '1-0',
          label: 'Performance',
          icon: 'pi pi-chart-bar',
        },
        {
          key: '1-1',
          label: 'Activity',
          icon: 'pi pi-clock',
        },
      ],
    },
  ];

  // Main sidebar menu items
  const sidebarMenuItems = [
    { label: 'Overview', icon: 'pi pi-home', badge: null, key: 'overview' },
    { label: 'Profile', icon: 'pi pi-user', badge: null, key: 'profile' },
    { label: 'Chats', icon: 'pi pi-comments', badge: '5', key: 'chats' },
    {
      label: 'Chat Embeds',
      icon: 'pi pi-code',
      badge: 'NEW',
      key: 'embed-manager',
    },
    { label: 'Projects', icon: 'pi pi-folder', badge: '3', key: 'projects' },
    { label: 'Tasks', icon: 'pi pi-check-square', badge: '12', key: 'tasks' },
    { label: 'Messages', icon: 'pi pi-envelope', badge: '5', key: 'messages' },
    { label: 'Calendar', icon: 'pi pi-calendar', badge: null, key: 'calendar' },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      badge: null,
      key: 'analytics',
    },
    {
      label: 'Subscription',
      icon: 'pi pi-credit-card',
      badge: 'PRO',
      key: 'subscription',
    },
    { label: 'Settings', icon: 'pi pi-cog', badge: null, key: 'settings' },
  ];

  // User menu items for dropdown
  const userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => navigate({ to: '/edit-profile' }),
    },
    {
      label: 'Subscription',
      icon: 'pi pi-credit-card',
      command: () => setShowSubscriptionManagement(true),
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => setActiveSection('settings'),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => navigate({ to: '/' }),
    },
  ];

  const userMenuRef = React.useRef<OverlayPanel>(null);

  const toggleUserMenu = (event: React.MouseEvent) => {
    userMenuRef.current?.toggle(event);
  };

  const handleSidebarItemClick = (key: string) => {
    if (key === 'subscription') {
      setShowSubscriptionManagement(true);
    } else if (key === 'embed-manager') {
      setShowEmbedManager(true);
    } else {
      setActiveSection(key);
    }
    setSidebarVisible(false);
  };

  // Enhanced profile card with modern design
  const renderModernProfileCard = (
    title: string,
    data: any,
    icon: string,
    gradient: string,
    textColor: string
  ) => {
    return (
      <Panel
        header={
          <div className='flex align-items-center gap-3'>
            <div
              className={`w-3rem h-3rem flex align-items-center justify-content-center border-round-2xl`}
              style={{ background: gradient }}
            >
              <i className={`${icon} text-white text-xl`}></i>
            </div>
            <div>
              <h3 className='m-0 text-xl font-bold text-color'>{title}</h3>
              <p className='m-0 text-sm text-color-secondary'>
                {Object.keys(data).length} items
              </p>
            </div>
          </div>
        }
        className='mb-4 shadow-3 border-round-xl border-none'
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <div className='grid'>
          {Object.entries(data).map(([key, value], index) => (
            <div
              key={key}
              className='col-12 md:col-6 lg:col-4 mb-3'
            >
              <div
                className='p-3 border-round-lg transition-all duration-300 hover:shadow-2 cursor-pointer'
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                }}
                onClick={() =>
                  copyToClipboardWithToast({
                    value: value as string,
                    successMessage: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} copied!`,
                  })
                }
              >
                <div className='flex align-items-center justify-content-between mb-2'>
                  <Chip
                    label={key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                    className='p-chip-sm'
                    style={{ background: gradient, color: 'white' }}
                  />
                  <i className='pi pi-copy text-color-secondary hover:text-primary transition-colors cursor-pointer'></i>
                </div>
                <p className='text-color font-semibold text-lg m-0 word-break'>
                  {value as string}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  };

  // Stats card with modern design
  const renderStatsCard = (
    title: string,
    value: string,
    icon: string,
    gradient: string,
    change?: string
  ) => {
    return (
      <Card
        className='border-none shadow-3 border-round-xl overflow-hidden h-full'
        style={{ background: gradient }}
      >
        <div className='flex align-items-center justify-content-between text-white'>
          <div className='flex-1'>
            <p className='text-white opacity-90 text-sm m-0 mb-2'>{title}</p>
            <h2 className='text-white text-3xl font-bold m-0 mb-1'>{value}</h2>
            {change && (
              <div className='flex align-items-center gap-1'>
                <i className='pi pi-arrow-up text-xs'></i>
                <span className='text-xs opacity-90'>{change} this month</span>
              </div>
            )}
          </div>
          <div className='w-4rem h-4rem flex align-items-center justify-content-center border-round-2xl bg-white opacity-20'>
            <i className={`${icon} text-white text-2xl`}></i>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div
      className='min-h-screen'
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Modern Header Navigation */}
      <header className='bg-white shadow-4 border-bottom-1 surface-border sticky top-0 z-4'>
        <div className='flex align-items-center justify-content-between px-2 sm:px-3 py-2'>
          {/* Left side - Logo and menu toggle */}
          <div className='flex align-items-center gap-2 sm:gap-4'>
            <Button
              icon='pi pi-bars'
              className='p-button-text p-button-rounded p-button-sm sm:p-button-md hover:bg-primary hover:text-white transition-all'
              onClick={() => setSidebarVisible(true)}
              tooltip='Menu'
              tooltipOptions={{ position: 'bottom' }}
            />
            <div className='flex align-items-center gap-2 sm:gap-3'>
              <div
                className='w-2rem h-2rem sm:w-3rem sm:h-3rem flex align-items-center justify-content-center border-round-2xl'
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <i className='pi pi-shield text-white text-sm sm:text-xl'></i>
              </div>
              <div>
                <span
                  className='text-lg sm:text-2xl font-bold'
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI Personal Assistant
                </span>
                <p className='text-xs text-color-secondary m-0 hidden sm:block'>
                  Modern Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className='hidden md:block flex-1 max-w-20rem lg:max-w-30rem mx-2 sm:mx-4'>
            <div className='p-input-icon-left w-full'>
              <i className='pi pi-search text-color-secondary'></i>
              <input
                type='text'
                placeholder='Search...'
                className='p-inputtext w-full border-round-3xl bg-gray-50 border-none shadow-1 text-sm'
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Right side - Actions and User profile */}
          <div className='flex align-items-center gap-2 sm:gap-3'>
            <Button
              icon='pi pi-bell'
              className='p-button-text p-button-rounded p-button-sm sm:p-button-md hover:bg-orange-100 transition-all'
              badge='3'
              badgeClassName='p-badge-danger'
              tooltip='Notifications'
              tooltipOptions={{ position: 'bottom' }}
            />
            <Button
              icon='pi pi-envelope'
              className='p-button-text p-button-rounded p-button-sm sm:p-button-md hover:bg-blue-100 transition-all hidden sm:inline-flex'
              badge='5'
              tooltip='Messages'
              tooltipOptions={{ position: 'bottom' }}
            />
            <Divider
              layout='vertical'
              className='hidden sm:block'
            />
            <div
              className='flex align-items-center gap-2 sm:gap-3 cursor-pointer p-1 sm:p-2 border-round-lg hover:bg-gray-50 transition-all'
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
              <div className='hidden md:flex flex-column'>
                <span className='font-bold text-color text-sm'>
                  {userProfileData.name}
                </span>
                <span className='text-xs text-color-secondary'>
                  {userProfileData.workInfo.position}
                </span>
              </div>
              <i className='pi pi-chevron-down text-color-secondary text-xs'></i>
            </div>
          </div>
        </div>
      </header>

      {/* User Menu Overlay */}
      <OverlayPanel
        ref={userMenuRef}
        className='w-15rem border-round-xl shadow-4'
      >
        <div className='flex flex-column gap-2'>
          {userMenuItems.map((item, index) =>
            item.separator ? (
              <Divider
                key={index}
                className='my-2'
              />
            ) : (
              <Button
                key={index}
                label={item.label}
                icon={item.icon}
                className='p-button-text justify-content-start w-full hover:bg-primary hover:text-white transition-all'
                onClick={() => item.command && item.command({} as any)}
              />
            )
          )}
        </div>
      </OverlayPanel>

      {/* Enhanced Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        position='left'
        onHide={() => setSidebarVisible(false)}
        className='w-full sm:w-22rem'
        style={{
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        }}
        header={
          <div className='flex align-items-center gap-2 sm:gap-3 px-3 sm:px-4 text-white'>
            <i className='pi pi-shield text-lg sm:text-2xl'></i>
            <div>
              <span className='font-bold text-lg sm:text-xl'>Dashboard</span>
              <p className='text-xs sm:text-sm opacity-80 m-0'>
                Navigation Menu
              </p>
            </div>
          </div>
        }
      >
        <div className='flex flex-column gap-2 sm:gap-3 p-3 sm:p-4'>
          {sidebarMenuItems.map((item, index) => (
            <div
              key={index}
              className={`flex align-items-center justify-content-between p-3 sm:p-4 border-round-xl cursor-pointer transition-all duration-300 ${
                activeSection === item.key
                  ? 'bg-white text-primary shadow-2'
                  : 'text-white hover:bg-black hover:bg-opacity-20 hover:shadow-4'
              }`}
              onClick={() => handleSidebarItemClick(item.key)}
            >
              <div className='flex align-items-center gap-2 sm:gap-3'>
                <i className={`${item.icon} text-lg sm:text-xl`}></i>
                <span className='font-semibold text-sm sm:text-base'>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <Badge
                  value={item.badge}
                  className={
                    activeSection === item.key
                      ? 'bg-primary'
                      : 'bg-white text-primary'
                  }
                />
              )}
            </div>
          ))}
        </div>
      </Sidebar>

      {/* Main Content */}
      <div
        className='min-h-screen'
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <div className='flex'>
          {/* Sub Sidebar with Tree Menu */}
          <aside className='w-16rem sm:w-18rem lg:w-20rem bg-white shadow-2 hidden lg:block min-h-screen'>
            <div className='p-2 sm:p-3'>
              <div className='mb-4 sm:mb-6'>
                <h3 className='text-lg sm:text-xl font-bold text-color mb-1 sm:mb-2'>
                  Quick Navigation
                </h3>
                <p className='text-xs sm:text-sm text-color-secondary m-0'>
                  Explore different sections
                </p>
              </div>
              <Tree
                value={treeNodes}
                selectionMode='single'
                selectionKeys={selectedTreeKey}
                onSelectionChange={(e) => setSelectedTreeKey(e.value as string)}
                className='w-full tree-modern'
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className='flex-1 p-2 sm:p-3 lg:p-4'>
            {/* Welcome Section */}
            <div className='mb-4 sm:mb-6'>
              <div
                className='p-4 sm:p-5 lg:p-6 border-round-2xl text-white mb-4 sm:mb-6 relative overflow-hidden'
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <div className='flex flex-column lg:flex-row align-items-start lg:align-items-center justify-content-between relative z-2 gap-4'>
                  <div className='flex-1'>
                    <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white m-0 mb-2'>
                      Welcome back, {userProfileData.name.split(' ')[0]}! 👋
                    </h1>
                    <p className='text-white opacity-90 text-sm sm:text-base lg:text-lg m-0 mb-3 sm:mb-4'>
                      Here's what's happening with your account today.
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        label='Edit Profile'
                        icon='pi pi-pencil'
                        className='p-button-rounded bg-white text-primary border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        onClick={() => navigate({ to: '/edit-profile' })}
                      />
                      <Button
                        label='Chats'
                        icon='pi pi-comments'
                        className='p-button-rounded bg-white text-primary border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        onClick={() => navigate({ to: '/chats' })}
                      />
                      <Button
                        label='Subscription'
                        icon='pi pi-credit-card'
                        className='p-button-rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        onClick={() => setShowSubscriptionManagement(true)}
                      />
                      <Button
                        label='Compact'
                        icon='pi pi-compress'
                        className='p-button-rounded p-button-outlined border-white text-white hover:bg-white hover:text-primary p-button-sm sm:p-button-md'
                        onClick={() =>
                          navigate({ to: '/compact-edit-profile' })
                        }
                      />
                      <Button
                        label='Classic'
                        icon='pi pi-home'
                        className='p-button-rounded p-button-outlined border-white text-white hover:bg-white hover:text-primary p-button-sm sm:p-button-md'
                        onClick={() => navigate({ to: '/dashboard' })}
                      />
                      <Button
                        label='Analytics'
                        icon='pi pi-chart-line'
                        className='p-button-rounded p-button-outlined border-white text-white hover:bg-white hover:text-primary p-button-sm sm:p-button-md hidden sm:inline-flex'
                        onClick={() => setActiveSection('analytics')}
                      />
                      <div className='flex align-items-center'>
                        <PWAInstallButton />
                      </div>
                    </div>
                  </div>
                  <div className='hidden lg:block'>
                    <Avatar
                      label={userProfileData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                      className='bg-white text-primary'
                      shape='circle'
                      size='xlarge'
                    />
                  </div>
                </div>
                {/* Background decoration */}
                <div className='absolute top-0 right-0 opacity-10'>
                  <i className='pi pi-shield text-8xl sm:text-9xl lg:text-10xl'></i>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className='grid mb-6'>
              <div className='col-12 md:col-6 lg:col-3'>
                {renderStatsCard(
                  'Active Projects',
                  '24',
                  'pi pi-folder',
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '+12%'
                )}
              </div>
              <div className='col-12 md:col-6 lg:col-3'>
                {renderStatsCard(
                  'Completion Rate',
                  '89%',
                  'pi pi-check-circle',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  '+5%'
                )}
              </div>
              <div className='col-12 md:col-6 lg:col-3'>
                {renderStatsCard(
                  'Total Tasks',
                  '156',
                  'pi pi-check-square',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  '+8%'
                )}
              </div>
              <div className='col-12 md:col-6 lg:col-3'>
                {renderStatsCard(
                  'Performance',
                  '4.8/5',
                  'pi pi-star-fill',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  '+0.2'
                )}
              </div>
            </div>

            {/* Profile Information Sections */}
            <div className='grid'>
              <div className='col-12'>
                {renderModernProfileCard(
                  'General Information',
                  userProfileData.generalInfo,
                  'pi pi-user',
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'text-white'
                )}
              </div>

              <div className='col-12 lg:col-6'>
                {renderModernProfileCard(
                  'Work Information',
                  userProfileData.workInfo,
                  'pi pi-briefcase',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  'text-white'
                )}
              </div>

              <div className='col-12 lg:col-6'>
                {renderModernProfileCard(
                  'Location & Birth Info',
                  userProfileData.birthInfo,
                  'pi pi-map-marker',
                  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  'text-white'
                )}
              </div>

              <div className='col-12'>
                {renderModernProfileCard(
                  'Preferences & Settings',
                  userProfileData.preferences,
                  'pi pi-cog',
                  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  'text-white'
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Subscription Management Modal */}
      {showSubscriptionManagement && (
        <SubscriptionManagement
          visible={showSubscriptionManagement}
          onHide={() => setShowSubscriptionManagement(false)}
        />
      )}

      {/* Embed Manager Modal */}
      <EmbedManager
        visible={showEmbedManager}
        onHide={() => setShowEmbedManager(false)}
      />

      {/* Custom CSS for modern tree */}
      <style>{`
        .tree-modern .p-tree-node-content {
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }
        .tree-modern .p-tree-node-content:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .tree-modern .p-tree-node-content.p-tree-node-selectable.p-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ModernDashboard;
