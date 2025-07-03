import ChatView from '@/components/Chat/ChatView';
import UserSearch from '@/components/Chat/UserSearch';
import { useTheme } from '@/hooks/useTheme';
import EditProfile from '@/pages/EditProfile';
import {
  ChatConversation,
  ChatService,
  UserSearchResult,
} from '@/services/chatService';
import { EmbedConfig, EmbedService } from '@/services/embedService';
import { ROUTES } from '@/utils/constants/routingConstants';
import {
  useUserDataZState,
  useUserProfileZState,
} from '@/zustandStates/userState';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Sidebar } from 'primereact/sidebar';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userChats, setUserChats] = useState<ChatConversation[]>([]);
  const [userEmbeds, setUserEmbeds] = useState<EmbedConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const { profile: userProfileData } = useUserProfileZState();
  const userData = useUserDataZState((state) => state.data);

  const chatService = new ChatService();
  const embedService = new EmbedService();

  // Determine active section based on current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === ROUTES.DASHBOARD_CHATS) return 'chats';
    if (path === ROUTES.DASHBOARD_CHAT_EMBEDS) return 'embeds';
    if (path === ROUTES.DASHBOARD_ACCOUNT) return 'account';
    if (path === ROUTES.EDIT_PROFILE) return 'profile';
    if (path.startsWith('/chats/view/')) return 'chat-view';
    return 'overview';
  };

  const activeSection = getActiveSection();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        if (userData?.id) {
          const conversations = await chatService.getUserConversations(
            userData.id
          );
          setUserChats(conversations);
          // const embeds = await embedService.getUserEmbeds(userData.id);
          const embeds: EmbedConfig[] = []; // Placeholder until getUserEmbeds is implemented
          setUserEmbeds(embeds);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userData?.id]);

  // Handle user found from search
  const handleUserFound = (user: UserSearchResult) => {
    setShowUserSearch(false);
    navigate({
      to: ROUTES.CHAT,
      search: {
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        userAvatar: user.photoURL,
      },
    });
  };

  // Handle sidebar navigation
  const handleSidebarItemClick = (key: string) => {
    if (key === 'chats') {
      navigate({ to: ROUTES.DASHBOARD_CHATS });
    } else if (key === 'embeds') {
      navigate({ to: ROUTES.DASHBOARD_CHAT_EMBEDS });
    } else if (key === 'account') {
      navigate({ to: ROUTES.DASHBOARD_ACCOUNT });
    } else if (key === 'profile') {
      navigate({ to: ROUTES.EDIT_PROFILE });
    } else {
      navigate({ to: ROUTES.DASHBOARD });
    }
    setSidebarVisible(false);
  };

  // Handle chat row click
  const handleChatClick = (chatId: string) => {
    navigate({ to: `/chats/view/${chatId}` });
  };

  // Render different sections based on active route
  const renderContent = () => {
    switch (activeSection) {
      case 'chats':
        return (
          <div>
            <div className='flex align-items-center justify-content-between mb-4'>
              <h2
                className='text-2xl font-bold m-0'
                style={{ color: theme.textPrimary }}
              >
                My Chats
              </h2>
              <Button
                label='Start New Chat'
                icon='pi pi-plus'
                className='p-button-rounded'
                onClick={() => setShowUserSearch(true)}
              />
            </div>
            <Card className='shadow-3 border-round-2xl'>
              {loading ? (
                <div className='space-y-3'>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className='flex align-items-center gap-3 p-3'
                    >
                      <Skeleton
                        shape='circle'
                        size='3rem'
                      />
                      <div className='flex-1'>
                        <Skeleton
                          width='200px'
                          height='1rem'
                          className='mb-2'
                        />
                        <Skeleton
                          width='150px'
                          height='0.8rem'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userChats.length === 0 ? (
                <div
                  className='text-center py-8'
                  style={{ color: theme.textSecondary }}
                >
                  <i
                    className='pi pi-comments text-6xl mb-3'
                    style={{ color: theme.primary }}
                  ></i>
                  <h3
                    className='text-xl font-bold mb-2'
                    style={{ color: theme.textPrimary }}
                  >
                    No conversations yet
                  </h3>
                  <p className='text-lg mb-4'>
                    Start a new conversation to see it here
                  </p>
                  <Button
                    label='Start New Chat'
                    icon='pi pi-plus'
                    className='p-button-rounded'
                    onClick={() => setShowUserSearch(true)}
                  />
                </div>
              ) : (
                <DataTable
                  value={userChats}
                  paginator
                  rows={10}
                  rowHover
                  className='p-datatable-customers'
                  onRowClick={(e) => handleChatClick(e.data.id)}
                >
                  <Column
                    field='participant'
                    header='Participant'
                    body={(rowData) => (
                      <div className='flex align-items-center gap-3'>
                        <Avatar
                          shape='circle'
                          size='normal'
                          image={rowData.participant.avatar}
                          label={rowData.participant.name?.charAt(0)}
                        />
                        <div>
                          <div className='font-medium'>
                            {rowData.participant.name}
                          </div>
                          <div className='text-sm text-500'>
                            {rowData.participant.email}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                  <Column
                    field='lastMessage'
                    header='Last Message'
                    body={(rowData) => (
                      <div>
                        <div className='text-sm'>{rowData.lastMessage}</div>
                        <div className='text-xs text-500'>
                          {new Date(rowData.lastMessageAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  />
                  <Column
                    field='unreadCount'
                    header='Unread'
                    body={(rowData) =>
                      rowData.unreadCount > 0 ? (
                        <Chip
                          label={rowData.unreadCount}
                          className='p-chip-sm'
                        />
                      ) : (
                        <span className='text-500'>-</span>
                      )
                    }
                  />
                  <Column
                    field='status'
                    header='Status'
                    body={(rowData) => (
                      <Tag
                        value={rowData.status}
                        severity={
                          rowData.status === 'active' ? 'success' : 'warning'
                        }
                      />
                    )}
                  />
                </DataTable>
              )}
            </Card>
          </div>
        );

      case 'embeds':
        return (
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
              />
            </div>
            <Card className='shadow-3 border-round-2xl'>
              {loading ? (
                <div className='space-y-3'>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className='flex align-items-center gap-3 p-3'
                    >
                      <Skeleton
                        shape='circle'
                        size='3rem'
                      />
                      <div className='flex-1'>
                        <Skeleton
                          width='200px'
                          height='1rem'
                          className='mb-2'
                        />
                        <Skeleton
                          width='150px'
                          height='0.8rem'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userEmbeds.length === 0 ? (
                <div
                  className='text-center py-8'
                  style={{ color: theme.textSecondary }}
                >
                  <i
                    className='pi pi-code text-6xl mb-3'
                    style={{ color: theme.primary }}
                  ></i>
                  <h3
                    className='text-xl font-bold mb-2'
                    style={{ color: theme.textPrimary }}
                  >
                    No embeds created yet
                  </h3>
                  <p className='text-lg mb-4'>
                    Create your first chat embed to get started
                  </p>
                  <Button
                    label='Create New Embed'
                    icon='pi pi-plus'
                    className='p-button-rounded'
                    onClick={() => navigate({ to: ROUTES.EMBED_DEMO })}
                  />
                </div>
              ) : (
                <DataTable
                  value={userEmbeds}
                  paginator
                  rows={10}
                  rowHover
                  className='p-datatable-customers'
                >
                  <Column
                    field='name'
                    header='Name'
                    body={(rowData) => (
                      <div>
                        <div className='font-medium'>{rowData.name}</div>
                        <div className='text-sm text-500'>
                          {rowData.description}
                        </div>
                      </div>
                    )}
                  />
                  <Column
                    field='isActive'
                    header='Status'
                    body={(rowData) => (
                      <Tag
                        value={rowData.isActive ? 'Active' : 'Inactive'}
                        severity={rowData.isActive ? 'success' : 'danger'}
                      />
                    )}
                  />
                  <Column
                    field='createdAt'
                    header='Created'
                    body={(rowData) =>
                      new Date(rowData.createdAt).toLocaleDateString()
                    }
                  />
                  <Column
                    field='actions'
                    header='Actions'
                    body={(rowData) => (
                      <div className='flex gap-2'>
                        <Button
                          icon='pi pi-copy'
                          className='p-button-rounded p-button-text'
                          onClick={() => {
                            const embedCode = `<script src="https://yoursite.com/embed/${rowData.id}"></script>`;
                            navigator.clipboard.writeText(embedCode);
                          }}
                          tooltip='Copy Embed Code'
                        />
                        <Button
                          icon='pi pi-external-link'
                          className='p-button-rounded p-button-text'
                          onClick={() =>
                            window.open(ROUTES.EMBED_DEMO, '_blank')
                          }
                          tooltip='Preview Embed'
                        />
                      </div>
                    )}
                  />
                </DataTable>
              )}
            </Card>
          </div>
        );

      case 'account':
        return (
          <div>
            <div className='flex align-items-center justify-content-between mb-4'>
              <h2
                className='text-2xl font-bold m-0'
                style={{ color: theme.textPrimary }}
              >
                Account Information
              </h2>
              <Button
                label='Edit Profile'
                icon='pi pi-pencil'
                className='p-button-rounded'
                onClick={() => navigate({ to: ROUTES.EDIT_PROFILE })}
              />
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
                        label={
                          userProfileData?.name?.charAt(0).toUpperCase() || 'U'
                        }
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
              </div>
            </Card>
          </div>
        );

      case 'profile':
        return <EditProfile />;

      case 'chat-view':
        return <ChatView />;

      default:
        return (
          <div className='grid'>
            <div className='col-12'>
              <div className='flex align-items-center justify-content-between mb-4'>
                <h2
                  className='text-2xl font-bold m-0'
                  style={{ color: theme.textPrimary }}
                >
                  Dashboard Overview
                </h2>
                <Button
                  icon='pi pi-refresh'
                  className='p-button-text p-button-rounded'
                  onClick={() => window.location.reload()}
                  tooltip='Refresh'
                />
              </div>
            </div>

            {/* Statistics Cards */}
            <div className='col-12 md:col-6 lg:col-3'>
              <Card className='text-center shadow-3 border-round-2xl'>
                <div className='text-900 font-medium mb-2'>Active Chats</div>
                <div className='text-5xl font-bold text-blue-500'>
                  {userChats.length}
                </div>
              </Card>
            </div>

            <div className='col-12 md:col-6 lg:col-3'>
              <Card className='text-center shadow-3 border-round-2xl'>
                <div className='text-900 font-medium mb-2'>Chat Embeds</div>
                <div className='text-5xl font-bold text-green-500'>
                  {userEmbeds.length}
                </div>
              </Card>
            </div>

            <div className='col-12 md:col-6 lg:col-3'>
              <Card className='text-center shadow-3 border-round-2xl'>
                <div className='text-900 font-medium mb-2'>Active Embeds</div>
                <div className='text-5xl font-bold text-purple-500'>
                  {userEmbeds.filter((e) => e.isActive).length}
                </div>
              </Card>
            </div>

            <div className='col-12 md:col-6 lg:col-3'>
              <Card className='text-center shadow-3 border-round-2xl'>
                <div className='text-900 font-medium mb-2'>Account Status</div>
                <div className='text-5xl font-bold text-orange-500'>
                  <i className='pi pi-check-circle'></i>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: 'pi pi-home' },
    { key: 'chats', label: 'Chats', icon: 'pi pi-comments' },
    { key: 'embeds', label: 'Chat Embeds', icon: 'pi pi-code' },
    { key: 'account', label: 'Account', icon: 'pi pi-user' },
    { key: 'profile', label: 'Profile', icon: 'pi pi-user-edit' },
  ];

  return (
    <div
      className='min-h-screen'
      style={{ backgroundColor: theme.surface || '#f8f9fa' }}
    >
      {/* Mobile Header */}
      <div className='lg:hidden flex align-items-center justify-content-between p-3 border-bottom-1 surface-border'>
        <Button
          icon='pi pi-bars'
          className='p-button-text p-button-rounded'
          onClick={() => setSidebarVisible(true)}
        />
        <div
          className='font-bold text-lg'
          style={{ color: theme.textPrimary }}
        >
          Dashboard
        </div>
        <div className='w-3rem'></div>
      </div>

      {/* Desktop Layout */}
      <div className='flex'>
        {/* Desktop Sidebar */}
        <div className='hidden lg:flex flex-column w-16rem border-right-1 surface-border min-h-screen'>
          <div className='p-4 border-bottom-1 surface-border'>
            <div
              className='font-bold text-xl'
              style={{ color: theme.textPrimary }}
            >
              Dashboard
            </div>
          </div>
          <div className='flex-1 p-3'>
            {sidebarItems.map((item) => (
              <div
                key={item.key}
                className={`flex align-items-center gap-3 p-3 border-round-lg cursor-pointer mb-2 ${
                  activeSection === item.key
                    ? 'bg-primary-50 border-primary'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSidebarItemClick(item.key)}
                style={{
                  color:
                    activeSection === item.key
                      ? theme.primary
                      : theme.textPrimary,
                  backgroundColor:
                    activeSection === item.key
                      ? `${theme.primary}15`
                      : 'transparent',
                }}
              >
                <i className={item.icon}></i>
                <span className='font-medium'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 p-4'>{renderContent()}</div>
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        className='w-16rem'
        position='left'
      >
        <div className='p-4 border-bottom-1 surface-border'>
          <div
            className='font-bold text-xl'
            style={{ color: theme.textPrimary }}
          >
            Dashboard
          </div>
        </div>
        <div className='p-3'>
          {sidebarItems.map((item) => (
            <div
              key={item.key}
              className={`flex align-items-center gap-3 p-3 border-round-lg cursor-pointer mb-2 ${
                activeSection === item.key
                  ? 'bg-primary-50 border-primary'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSidebarItemClick(item.key)}
              style={{
                color:
                  activeSection === item.key
                    ? theme.primary
                    : theme.textPrimary,
                backgroundColor:
                  activeSection === item.key
                    ? `${theme.primary}15`
                    : 'transparent',
              }}
            >
              <i className={item.icon}></i>
              <span className='font-medium'>{item.label}</span>
            </div>
          ))}
        </div>
      </Sidebar>

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
