import UserSearch from '@/components/Chat/UserSearch';
import PWAInstallButton from '@/components/PWAInstallButton';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { useTheme } from '@/hooks/useTheme';
import {
  ChatConversation,
  ChatService,
  UserSearchResult,
} from '@/services/chatService';
import { EmbedConfig, EmbedService } from '@/services/embedService';
import { ROUTES } from '@/utils/constants/routingConstants';
import { copyToClipboardWithToast } from '@/utils/helpers/capacitorApis';
import {
  useUserDataZState,
  useUserProfileZState,
} from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import { MenuItem } from 'primereact/menuitem';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [userChats, setUserChats] = useState<ChatConversation[]>([]);
  const [userEmbeds, setUserEmbeds] = useState<EmbedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Get user profile data from zustand state
  const { profile: userProfileData } = useUserProfileZState();
  const userData = useUserDataZState((state) => state.data);

  // Services
  const chatService = new ChatService();
  const embedService = new EmbedService();

  // Load user data
  useEffect(() => {
    if (userData?.id) {
      loadUserData();
    }
  }, [userData]);

  const loadUserData = async () => {
    if (!userData?.id) return;

    try {
      setLoading(true);

      // Load user chats
      const chats = await chatService.getUserConversations(userData.id);
      setUserChats(chats);

      // Load user embeds
      const embeds = await embedService.getUserEmbedConfigs(userData.id);
      setUserEmbeds(embeds);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // If no profile data, show loading state
  if (!userProfileData || !userData) {
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

  // Single sidebar menu items
  const sidebarMenuItems = [
    { label: 'Overview', icon: 'pi pi-home', key: 'overview' },
    {
      label: 'Chats',
      icon: 'pi pi-comments',
      key: 'chats',
      badge: userChats.length.toString(),
    },
    {
      label: 'Chat Embeds',
      icon: 'pi pi-code',
      key: 'embeds',
      badge: userEmbeds.length.toString(),
    },
    { label: 'Profile', icon: 'pi pi-user', key: 'profile' },
    { label: 'Account', icon: 'pi pi-cog', key: 'account' },
  ];

  // User menu items for dropdown
  const userMenuItems: MenuItem[] = [
    {
      label: 'Edit Profile',
      icon: 'pi pi-user',
      command: () => navigate({ to: ROUTES.EDIT_PROFILE }),
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => setActiveSection('account'),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => navigate({ to: ROUTES.AUTH }),
    },
  ];

  const userMenuRef = React.useRef<OverlayPanel>(null);

  const toggleUserMenu = (event: React.MouseEvent) => {
    userMenuRef.current?.toggle(event);
  };

  const handleSidebarItemClick = (key: string) => {
    if (key === 'profile') {
      navigate({ to: ROUTES.EDIT_PROFILE });
    } else {
      setActiveSection(key);
    }
    setSidebarVisible(false);
  };

  const handleUserFound = (user: UserSearchResult, chatId: string) => {
    navigate({
      to: ROUTES.CHAT,
      search: {
        chatId,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
      },
    });
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

  // Render overview section
  const renderOverview = () => (
    <div>
      {/* Stats Cards */}
      <div className='grid mb-6'>
        <div className='col-12 md:col-6 lg:col-3'>
          {renderStatsCard(
            'Active Chats',
            userChats.length.toString(),
            'pi pi-comments',
            `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`
          )}
        </div>
        <div className='col-12 md:col-6 lg:col-3'>
          {renderStatsCard(
            'Chat Embeds',
            userEmbeds.length.toString(),
            'pi pi-code',
            `linear-gradient(135deg, ${theme.success} 0%, #059669 100%)`
          )}
        </div>
        <div className='col-12 md:col-6 lg:col-3'>
          {renderStatsCard(
            'Active Embeds',
            userEmbeds.filter((e) => e.isActive).length.toString(),
            'pi pi-check-circle',
            `linear-gradient(135deg, ${theme.secondary} 0%, #0891B2 100%)`
          )}
        </div>
        <div className='col-12 md:col-6 lg:col-3'>
          {renderStatsCard(
            'Account Status',
            'Active',
            'pi pi-user',
            `linear-gradient(135deg, ${theme.accent} 0%, #059669 100%)`
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className='grid'>
        <div className='col-12 lg:col-6'>
          <Card className='shadow-3 border-round-2xl h-full'>
            <div className='flex align-items-center justify-content-between mb-4'>
              <h3
                className='text-xl font-bold m-0'
                style={{ color: theme.textPrimary }}
              >
                Recent Chats
              </h3>
              <Button
                label='View All'
                className='p-button-text p-button-sm'
                onClick={() => setActiveSection('chats')}
                style={{ color: theme.primary }}
              />
            </div>
            {userChats.slice(0, 3).map((chat, index) => (
              <div
                key={chat.id}
                className='flex align-items-center justify-content-between py-3 border-bottom-1 border-300'
              >
                <div className='flex align-items-center gap-3'>
                  <Avatar
                    label={
                      chat.participantEmails[0]?.charAt(0).toUpperCase() || 'U'
                    }
                    style={{ background: theme.primary, color: 'white' }}
                    shape='circle'
                    size='normal'
                  />
                  <div>
                    <div
                      className='font-semibold'
                      style={{ color: theme.textPrimary }}
                    >
                      {chat.participantEmails[0] || 'Unknown User'}
                    </div>
                    <div
                      className='text-sm'
                      style={{ color: theme.textSecondary }}
                    >
                      {chat.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div
                    className='text-sm'
                    style={{ color: theme.textSecondary }}
                  >
                    {chat.lastMessageTime
                      ? new Date(
                          chat.lastMessageTime.toDate()
                        ).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
            {userChats.length === 0 && (
              <div
                className='text-center py-4'
                style={{ color: theme.textSecondary }}
              >
                No chats yet. Start a conversation!
              </div>
            )}
          </Card>
        </div>
        <div className='col-12 lg:col-6'>
          <Card className='shadow-3 border-round-2xl h-full'>
            <div className='flex align-items-center justify-content-between mb-4'>
              <h3
                className='text-xl font-bold m-0'
                style={{ color: theme.textPrimary }}
              >
                Chat Embeds
              </h3>
              <Button
                label='View All'
                className='p-button-text p-button-sm'
                onClick={() => setActiveSection('embeds')}
                style={{ color: theme.primary }}
              />
            </div>
            {userEmbeds.slice(0, 3).map((embed, index) => (
              <div
                key={embed.id}
                className='flex align-items-center justify-content-between py-3 border-bottom-1 border-300'
              >
                <div className='flex align-items-center gap-3'>
                  <i
                    className='pi pi-code text-2xl'
                    style={{ color: theme.primary }}
                  ></i>
                  <div>
                    <div
                      className='font-semibold'
                      style={{ color: theme.textPrimary }}
                    >
                      {embed.title}
                    </div>
                    <div
                      className='text-sm'
                      style={{ color: theme.textSecondary }}
                    >
                      {embed.allowedDomains.join(', ')}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <Tag
                    value={embed.isActive ? 'Active' : 'Inactive'}
                    severity={embed.isActive ? 'success' : 'warning'}
                    className='border-round-2xl'
                  />
                </div>
              </div>
            ))}
            {userEmbeds.length === 0 && (
              <div
                className='text-center py-4'
                style={{ color: theme.textSecondary }}
              >
                No embeds created yet. Create your first embed!
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  // Render chats section
  const renderChats = () => (
    <div>
      <div className='flex align-items-center justify-content-between mb-4'>
        <h2
          className='text-2xl font-bold m-0'
          style={{ color: theme.textPrimary }}
        >
          Your Chats
        </h2>
        <Button
          label='Start New Chat'
          icon='pi pi-plus'
          className='p-button-rounded'
          onClick={() => setShowUserSearch(true)}
          style={{ background: theme.primary }}
        />
      </div>

      <Card className='shadow-3 border-round-2xl'>
        <DataTable
          value={userChats}
          emptyMessage='No chats found. Start a conversation!'
          className='p-datatable-striped'
          paginator
          rows={10}
        >
          <Column
            field='participantEmails'
            header='Participants'
            body={(chat) => (
              <div className='flex align-items-center gap-2'>
                <Avatar
                  label={
                    chat.participantEmails[0]?.charAt(0).toUpperCase() || 'U'
                  }
                  style={{ background: theme.primary, color: 'white' }}
                  shape='circle'
                  size='normal'
                />
                <span>{chat.participantEmails.join(', ')}</span>
              </div>
            )}
          />
          <Column
            field='lastMessage'
            header='Last Message'
          />
          <Column
            field='lastMessageTime'
            header='Last Activity'
            body={(chat) =>
              chat.lastMessageTime
                ? new Date(chat.lastMessageTime.toDate()).toLocaleDateString()
                : 'N/A'
            }
          />
          <Column
            field='unreadCount'
            header='Unread'
            body={(chat) => (
              <Chip
                label={chat.unreadCount?.[userData?.id || ''] || 0}
                className='border-round-2xl'
                style={{ background: theme.primary, color: 'white' }}
              />
            )}
          />
          <Column
            header='Actions'
            body={(chat) => (
              <Button
                icon='pi pi-arrow-right'
                className='p-button-rounded p-button-text'
                onClick={() =>
                  navigate({ to: ROUTES.CHATS, search: { chatId: chat.id } })
                }
                tooltip='Open Chat'
              />
            )}
          />
        </DataTable>
      </Card>
    </div>
  );

  // Render embeds section
  const renderEmbeds = () => (
    <div>
      <div className='flex align-items-center justify-content-between mb-4'>
        <h2
          className='text-2xl font-bold m-0'
          style={{ color: theme.textPrimary }}
        >
          Chat Embeds
        </h2>
        <Button
          label='Create New Embed'
          icon='pi pi-plus'
          className='p-button-rounded'
          onClick={() => navigate({ to: ROUTES.EMBED_DEMO })}
          style={{ background: theme.primary }}
        />
      </div>

      <Card className='shadow-3 border-round-2xl'>
        <DataTable
          value={userEmbeds}
          emptyMessage='No embeds created yet. Create your first embed!'
          className='p-datatable-striped'
          paginator
          rows={10}
        >
          <Column
            field='title'
            header='Title'
          />
          <Column
            field='description'
            header='Description'
          />
          <Column
            field='allowedDomains'
            header='Allowed Domains'
            body={(embed) => embed.allowedDomains.join(', ')}
          />
          <Column
            field='isActive'
            header='Status'
            body={(embed) => (
              <Tag
                value={embed.isActive ? 'Active' : 'Inactive'}
                severity={embed.isActive ? 'success' : 'warning'}
                className='border-round-2xl'
              />
            )}
          />
          <Column
            field='createdAt'
            header='Created'
            body={(embed) =>
              embed.createdAt
                ? new Date(embed.createdAt.toDate()).toLocaleDateString()
                : 'N/A'
            }
          />
          <Column
            header='Actions'
            body={(embed) => (
              <div className='flex gap-2'>
                <Button
                  icon='pi pi-copy'
                  className='p-button-rounded p-button-text'
                  onClick={() =>
                    copyToClipboardWithToast({
                      value: embed.embedCode,
                      successMessage: 'Embed code copied to clipboard!',
                    })
                  }
                  tooltip='Copy Embed Code'
                />
                <Button
                  icon='pi pi-external-link'
                  className='p-button-rounded p-button-text'
                  onClick={() => navigate({ to: ROUTES.EMBED_DEMO })}
                  tooltip='View Demo'
                />
              </div>
            )}
          />
        </DataTable>
      </Card>
    </div>
  );

  // Render account section
  const renderAccount = () => (
    <div>
      <h2
        className='text-2xl font-bold mb-4'
        style={{ color: theme.textPrimary }}
      >
        Account Information
      </h2>

      <div className='grid'>
        <div className='col-12 lg:col-6'>
          <Card className='shadow-3 border-round-2xl h-full'>
            <h3
              className='text-xl font-bold mb-4'
              style={{ color: theme.textPrimary }}
            >
              Profile Information
            </h3>
            <div className='flex flex-column gap-3'>
              <div>
                <label
                  className='block text-sm font-medium mb-1'
                  style={{ color: theme.textSecondary }}
                >
                  Name
                </label>
                <div
                  className='p-3 border-round-lg'
                  style={{ background: theme.hover }}
                >
                  {userProfileData.name}
                </div>
              </div>
              <div>
                <label
                  className='block text-sm font-medium mb-1'
                  style={{ color: theme.textSecondary }}
                >
                  Email
                </label>
                <div
                  className='p-3 border-round-lg'
                  style={{ background: theme.hover }}
                >
                  {userProfileData.email}
                </div>
              </div>
              <div>
                <label
                  className='block text-sm font-medium mb-1'
                  style={{ color: theme.textSecondary }}
                >
                  User ID
                </label>
                <div className='flex align-items-center gap-2'>
                  <div
                    className='p-3 border-round-lg flex-1'
                    style={{ background: theme.hover }}
                  >
                    {userProfileData.id}
                  </div>
                  <Button
                    icon='pi pi-copy'
                    className='p-button-rounded p-button-text'
                    onClick={() =>
                      copyToClipboardWithToast({
                        value: userProfileData.id,
                        successMessage: 'User ID copied to clipboard!',
                      })
                    }
                    tooltip='Copy User ID'
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className='col-12 lg:col-6'>
          <Card className='shadow-3 border-round-2xl h-full'>
            <h3
              className='text-xl font-bold mb-4'
              style={{ color: theme.textPrimary }}
            >
              Account Actions
            </h3>
            <div className='flex flex-column gap-3'>
              <Button
                label='Edit Profile'
                icon='pi pi-user-edit'
                className='p-button-outlined justify-content-start'
                onClick={() => navigate({ to: ROUTES.EDIT_PROFILE })}
              />
              <Button
                label='Manage Subscription'
                icon='pi pi-credit-card'
                className='p-button-outlined justify-content-start'
                onClick={() => {
                  // Show subscription management in main content
                  setActiveSection('subscription');
                }}
              />
              <Button
                label='View Analytics'
                icon='pi pi-chart-line'
                className='p-button-outlined justify-content-start'
                onClick={() => setActiveSection('analytics')}
              />
              <Divider />
              <Button
                label='Sign Out'
                icon='pi pi-sign-out'
                className='p-button-outlined justify-content-start'
                severity='danger'
                onClick={() => navigate({ to: ROUTES.AUTH })}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // Render subscription section
  const renderSubscription = () => (
    <div>
      <h2
        className='text-2xl font-bold mb-4'
        style={{ color: theme.textPrimary }}
      >
        Subscription Management
      </h2>
      <Card className='shadow-3 border-round-2xl'>
        <SubscriptionManagement
          visible={true}
          onHide={() => setActiveSection('overview')}
        />
      </Card>
    </div>
  );

  // Render analytics section
  const renderAnalytics = () => (
    <div>
      <h2
        className='text-2xl font-bold mb-4'
        style={{ color: theme.textPrimary }}
      >
        Analytics
      </h2>
      <Card className='shadow-3 border-round-2xl'>
        <div
          className='text-center py-6'
          style={{ color: theme.textSecondary }}
        >
          <i
            className='pi pi-chart-line text-6xl mb-3'
            style={{ color: theme.primary }}
          ></i>
          <h3
            className='text-xl font-bold mb-2'
            style={{ color: theme.textPrimary }}
          >
            Analytics Dashboard
          </h3>
          <p className='text-lg'>Detailed analytics coming soon!</p>
        </div>
      </Card>
    </div>
  );

  // Render main content based on active section
  const renderMainContent = () => {
    if (loading) {
      return (
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
      );
    }

    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'chats':
        return renderChats();
      case 'embeds':
        return renderEmbeds();
      case 'account':
        return renderAccount();
      case 'subscription':
        return renderSubscription();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
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

      {/* Mobile Sidebar */}
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
              className={`p-button-text justify-content-start ${
                activeSection === item.key ? 'p-button-outlined' : ''
              }`}
              badge={item.badge}
              badgeClassName='p-badge-info'
              onClick={() => handleSidebarItemClick(item.key)}
            />
          ))}
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className='flex min-h-screen'>
        {/* Desktop Sidebar */}
        <aside
          className='hidden lg:block w-18rem border-right-1 sticky top-0 h-screen overflow-y-auto'
          style={{
            background: theme.surface,
            borderColor: theme.border,
            marginTop: '4rem',
          }}
        >
          <div className='p-4'>
            <div className='flex flex-column gap-2'>
              {sidebarMenuItems.map((item, index) => (
                <Button
                  key={index}
                  label={item.label}
                  icon={item.icon}
                  className={`p-button-text justify-content-start ${
                    activeSection === item.key ? 'p-button-outlined' : ''
                  }`}
                  badge={item.badge}
                  badgeClassName='p-badge-info'
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
                      Welcome back, {userProfileData.name.split(' ')[0]}!
                    </h1>
                    <p className='text-white opacity-90 text-sm sm:text-base lg:text-lg m-0 mb-3 sm:mb-4'>
                      Here's your account overview and recent activity.
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        label='New Chat'
                        icon='pi pi-comments'
                        className='p-button-rounded bg-white border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        style={{ color: theme.primary }}
                        onClick={() => navigate({ to: ROUTES.CHATS })}
                      />
                      <Button
                        label='Create Embed'
                        icon='pi pi-code'
                        className='p-button-rounded bg-white border-none hover:shadow-3 p-button-sm sm:p-button-md'
                        style={{ color: theme.primary }}
                        onClick={() => navigate({ to: ROUTES.EMBED_DEMO })}
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
                <div className='absolute top-0 right-0 opacity-10'>
                  <i className='pi pi-shield text-8xl sm:text-9xl lg:text-10xl'></i>
                </div>
              </div>
            </div>

            {/* Main Content */}
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* User Search Modal */}
      <UserSearch
        visible={showUserSearch}
        onHide={() => setShowUserSearch(false)}
        onUserFound={handleUserFound}
      />
    </div>
  );
};

export default Dashboard;
