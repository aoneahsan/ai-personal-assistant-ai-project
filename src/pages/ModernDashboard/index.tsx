import EmbedManager from '@/components/EmbeddableWidget/EmbedManager';
import PWAInstallButton from '@/components/PWAInstallButton';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { useTheme } from '@/hooks/useTheme';
import { copyToClipboardWithToast } from '@/utils/helpers/capacitorApis';
import { useUserProfileZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
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
  const { theme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTreeKey, setSelectedTreeKey] = useState<string>('0');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [showSubscriptionManagement, setShowSubscriptionManagement] =
    useState(false);
  const [showEmbedManager, setShowEmbedManager] = useState(false);

  // Get user profile data from zustand state
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
          <div className='flex align-items-center gap-2'>
            <i className={`${icon} ${textColor}`}></i>
            <span className={textColor}>{title}</span>
          </div>
        }
        className='mb-4 shadow-3 border-round-2xl overflow-hidden'
        style={{ background: gradient }}
      >
        <div className='grid'>
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className='col-12 md:col-6 lg:col-4 mb-3'
            >
              <div className='flex flex-column gap-2'>
                <span className={`text-sm font-medium ${textColor} opacity-80`}>
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
                <div className='flex align-items-center justify-content-between gap-2'>
                  <span className={`${textColor} font-semibold flex-1`}>
                    {value as string}
                  </span>
                  <Button
                    icon='pi pi-copy'
                    className='p-button-text p-button-rounded p-button-sm'
                    style={{
                      color: textColor.includes('white')
                        ? 'white'
                        : theme.textPrimary,
                    }}
                    tooltip='Copy to clipboard'
                    tooltipOptions={{ position: 'top' }}
                    onClick={() =>
                      copyToClipboardWithToast({
                        value: value as string,
                        successMessage: `${key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) =>
                            str.toUpperCase()
                          )} copied to clipboard!`,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  };

  // Stats card renderer
  const renderStatsCard = (
    title: string,
    value: string,
    icon: string,
    gradient: string,
    change?: string
  ) => {
    return (
      <Card
        className='shadow-3 border-round-2xl overflow-hidden hover:shadow-4 transition-all transition-duration-300'
        style={{ background: gradient }}
      >
        <div className='text-center text-white'>
          <div className='flex align-items-center justify-content-between mb-3'>
            <i className={`${icon} text-3xl`}></i>
            {change && (
              <Chip
                label={change}
                className='bg-white text-color border-round-2xl'
                style={{ fontSize: '0.75rem' }}
              />
            )}
          </div>
          <div className='text-3xl font-bold mb-1'>{value}</div>
          <div className='text-sm opacity-90'>{title}</div>
        </div>
      </Card>
    );
  };

  return (
    <div
      className='min-h-screen'
      style={{ background: theme.background }}
    >
      {/* Header Navigation */}
      <header
        className='shadow-2 border-bottom-1 sticky top-0 z-5'
        style={{ background: theme.surface, borderColor: theme.border }}
      >
        <div className='flex align-items-center justify-content-between px-2 sm:px-4 py-2 sm:py-3'>
          {/* Left side - Logo and menu toggle */}
          <div className='flex align-items-center gap-2 sm:gap-3'>
            <Button
              icon='pi pi-bars'
              className='p-button-text p-button-rounded lg:hidden'
              onClick={() => setSidebarVisible(true)}
              style={{ color: theme.textPrimary }}
            />
            <div className='flex align-items-center gap-2'>
              <i
                className='pi pi-shield text-2xl'
                style={{ color: theme.primary }}
              ></i>
              <h1
                className='text-xl font-bold m-0 hidden sm:block'
                style={{ color: theme.textPrimary }}
              >
                AI Assistant
              </h1>
            </div>
          </div>

          {/* Right side - User menu and PWA install */}
          <div className='flex align-items-center gap-2'>
            <PWAInstallButton />
            <Button
              icon='pi pi-bell'
              className='p-button-text p-button-rounded'
              badge='3'
              badgeClassName='p-badge-danger'
              style={{ color: theme.textPrimary }}
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
                style={{ background: theme.primary, color: 'white' }}
                shape='circle'
                size='normal'
              />
              <div className='hidden md:block text-right'>
                <div
                  className='font-semibold text-sm'
                  style={{ color: theme.textPrimary }}
                >
                  {userProfileData.name}
                </div>
                <div
                  className='text-xs'
                  style={{ color: theme.textSecondary }}
                >
                  {userProfileData.email}
                </div>
              </div>
              <i
                className='pi pi-chevron-down text-xs'
                style={{ color: theme.textSecondary }}
              />
            </div>
          </div>

          <OverlayPanel
            ref={userMenuRef}
            className='shadow-4 border-round-2xl'
          >
            <div className='flex flex-column gap-2 min-w-15rem'>
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
                    className='p-button-text justify-content-start'
                    onClick={item.command}
                  />
                )
              )}
            </div>
          </OverlayPanel>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        className='w-full sm:w-20rem'
        modal
      >
        <div className='flex flex-column gap-2'>
          <div className='text-center mb-4'>
            <div className='flex align-items-center justify-content-center gap-2 mb-2'>
              <i className='pi pi-shield text-2xl text-primary'></i>
              <span className='font-bold text-lg text-color'>AI Assistant</span>
            </div>
            <Divider />
          </div>

          {sidebarMenuItems.map((item, index) => (
            <Button
              key={index}
              label={item.label}
              icon={item.icon}
              className='p-button-text justify-content-start'
              badge={item.badge}
              badgeClassName={
                item.badge === 'NEW'
                  ? 'p-badge-success'
                  : item.badge === 'PRO'
                    ? 'p-badge-warning'
                    : 'p-badge-info'
              }
              onClick={() => handleSidebarItemClick(item.key)}
            />
          ))}
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className='flex min-h-screen'>
        {/* Desktop Sidebar */}
        <aside
          className='hidden lg:block w-20rem border-right-1 sticky top-0 h-screen overflow-y-auto'
          style={{
            background: theme.surface,
            borderColor: theme.border,
            marginTop: '4rem', // Account for header height
          }}
        >
          <div className='p-4'>
            <div className='mb-4'>
              <Tree
                value={treeNodes}
                selectionMode='single'
                selectionKeys={selectedTreeKey}
                onSelectionChange={(e) => setSelectedTreeKey(e.value)}
                className='tree-modern'
              />
            </div>
            <Divider />
            <div className='flex flex-column gap-2 mt-4'>
              {sidebarMenuItems.slice(0, 6).map((item, index) => (
                <Button
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  className='p-button-text justify-content-start'
                  badge={item.badge}
                  badgeClassName={
                    item.badge === 'NEW'
                      ? 'p-badge-success'
                      : item.badge === 'PRO'
                        ? 'p-badge-warning'
                        : 'p-badge-info'
                  }
                  onClick={() => handleSidebarItemClick(item.key)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className='flex-1 p-3 sm:p-4 lg:p-6'>
          <div className='max-w-full'>
            {/* Welcome Section */}
            <div className='mb-4 sm:mb-6'>
              <div
                className='p-4 sm:p-5 lg:p-6 border-round-2xl text-white mb-4 sm:mb-6 relative overflow-hidden'
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
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
                        className='p-button-rounded bg-white border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        style={{ color: theme.primary }}
                        onClick={() => navigate({ to: '/edit-profile' })}
                      />
                      <Button
                        label='Chats'
                        icon='pi pi-comments'
                        className='p-button-rounded bg-white border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        style={{ color: theme.primary }}
                        onClick={() => navigate({ to: '/chats' })}
                      />
                      <Button
                        label='Subscription'
                        icon='pi pi-credit-card'
                        className='p-button-rounded border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        style={{
                          background: `linear-gradient(45deg, ${theme.accent}, ${theme.secondary})`,
                          color: 'white',
                        }}
                        onClick={() => setShowSubscriptionManagement(true)}
                      />
                      <Button
                        label='Compact'
                        icon='pi pi-compress'
                        className='p-button-rounded p-button-outlined border-white text-white hover:bg-white p-button-sm sm:p-button-md'
                        style={{ borderColor: 'white' }}
                        onClick={() => navigate({ to: '/compact-dashboard' })}
                      />
                      <Button
                        label='Classic'
                        icon='pi pi-home'
                        className='p-button-rounded p-button-outlined border-white text-white hover:bg-white p-button-sm sm:p-button-md'
                        style={{ borderColor: 'white' }}
                        onClick={() => navigate({ to: '/dashboard' })}
                      />
                      <Button
                        label='Analytics'
                        icon='pi pi-chart-line'
                        className='p-button-rounded p-button-outlined border-white text-white hover:bg-white p-button-sm sm:p-button-md hidden sm:inline-flex'
                        style={{ borderColor: 'white' }}
                        onClick={() => setActiveSection('analytics')}
                      />
                    </div>
                  </div>
                  <div className='hidden lg:block'>
                    <Avatar
                      label={userProfileData.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                      className='bg-white'
                      style={{ color: theme.primary }}
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
                  `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
                  '+12%'
                )}
              </div>
              <div className='col-12 md:col-6 lg:col-3'>
                {renderStatsCard(
                  'Completion Rate',
                  '89%',
                  'pi pi-check-circle',
                  `linear-gradient(135deg, ${theme.success} 0%, #059669 100%)`,
                  '+5%'
                )}
              </div>
              <div className='col-12 md:col-6 lg:col-3'>
                {renderStatsCard(
                  'Total Tasks',
                  '156',
                  'pi pi-check-square',
                  `linear-gradient(135deg, ${theme.secondary} 0%, #0891B2 100%)`,
                  '+8%'
                )}
              </div>
              <div className='col-12 md:col-6 lg:col-3'>
                {renderStatsCard(
                  'Performance',
                  '4.8/5',
                  'pi pi-star-fill',
                  `linear-gradient(135deg, ${theme.accent} 0%, #059669 100%)`,
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
                  `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
                  'text-white'
                )}
              </div>

              <div className='col-12 lg:col-6'>
                {renderModernProfileCard(
                  'Work Information',
                  userProfileData.workInfo,
                  'pi pi-briefcase',
                  `linear-gradient(135deg, ${theme.success} 0%, #059669 100%)`,
                  'text-white'
                )}
              </div>

              <div className='col-12 lg:col-6'>
                {renderModernProfileCard(
                  'Location & Birth Info',
                  userProfileData.birthInfo,
                  'pi pi-map-marker',
                  `linear-gradient(135deg, ${theme.secondary} 0%, #0891B2 100%)`,
                  'text-white'
                )}
              </div>

              <div className='col-12'>
                {renderModernProfileCard(
                  'Preferences & Settings',
                  userProfileData.preferences,
                  'pi pi-cog',
                  `linear-gradient(135deg, ${theme.accent} 0%, #059669 100%)`,
                  'text-white'
                )}
              </div>
            </div>
          </div>
        </main>
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
          background: ${theme.hover};
          color: ${theme.primary};
        }
        .tree-modern .p-tree-node-content.p-tree-node-selectable.p-highlight {
          background: ${theme.primary};
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ModernDashboard;
