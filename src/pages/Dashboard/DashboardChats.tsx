import UserSearch from '@/components/Chat/UserSearch';
import { RefreshButton } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import {
  ChatConversation,
  ChatService,
  UserSearchResult,
} from '@/services/chatService';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

const DashboardChats: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const toast = useRef<Toast>(null);
  const [userChats, setUserChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const userData = useUserDataZState((state) => state.data);
  const chatService = new ChatService();

  // Load user chats
  const loadUserChats = async (showFullLoader = false) => {
    try {
      if (showFullLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (userData?.id) {
        const conversations = await chatService.getUserConversations(
          userData.id
        );
        setUserChats(conversations);

        if (showFullLoader) {
          toast.current?.show({
            severity: 'success',
            summary: 'Chats Refreshed',
            detail: 'Chat data has been successfully refreshed',
            life: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error loading user chats:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load chats. Please try again.',
        life: 5000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserChats();
  }, [userData?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    await loadUserChats(true);
  };

  // Handle user found from search
  const handleUserFound = (user: UserSearchResult) => {
    setShowUserSearch(false);
    navigate({
      to: ROUTES.DASHBOARD_CHAT_VIEW,
      search: {
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        userAvatar: user.photoURL,
      },
    });
  };

  // Handle chat row click
  const handleChatClick = (chatId: string) => {
    navigate({ to: ROUTES.DASHBOARD_CHAT_VIEW.replace('$chatId', chatId) });
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className='flex align-items-center justify-content-between mb-4'>
        <h2
          className='text-2xl font-bold m-0'
          style={{ color: theme.textPrimary }}
        >
          My Chats
        </h2>
        <div className='flex align-items-center gap-2'>
          <RefreshButton
            onRefresh={handleRefresh}
            loading={refreshing}
            tooltip='Refresh Chats'
          />
          <Button
            label='Start New Chat'
            icon='pi pi-plus'
            className='p-button-rounded'
            onClick={() => setShowUserSearch(true)}
          />
        </div>
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
            style={{ cursor: 'pointer' }}
          >
            <Column
              field='participant'
              header='Participant'
              body={(rowData: ChatConversation) => (
                <div className='flex align-items-center gap-3'>
                  <Avatar
                    shape='circle'
                    size='normal'
                    image={rowData.participant?.avatar}
                    label={rowData.participant?.name?.charAt(0).toUpperCase()}
                    style={{
                      backgroundColor: !rowData.participant?.avatar
                        ? theme.primary
                        : undefined,
                      color: !rowData.participant?.avatar
                        ? theme.textInverse
                        : undefined,
                    }}
                  />
                  <div>
                    <div
                      className='font-medium'
                      style={{ color: theme.textPrimary }}
                    >
                      {rowData.participant?.name || 'Unknown User'}
                    </div>
                    <div
                      className='text-sm'
                      style={{ color: theme.textSecondary }}
                    >
                      {rowData.participant?.email || ''}
                    </div>
                  </div>
                </div>
              )}
            />
            <Column
              field='lastMessage'
              header='Last Message'
              body={(rowData: ChatConversation) => (
                <div>
                  <div
                    className='text-sm mb-1'
                    style={{ color: theme.textPrimary }}
                  >
                    {rowData.lastMessage || 'No messages yet'}
                  </div>
                  <div
                    className='text-xs'
                    style={{ color: theme.textSecondary }}
                  >
                    {rowData.lastMessageAt || ''}
                  </div>
                </div>
              )}
            />
            <Column
              field='unreadCount'
              header='Unread'
              body={(rowData: ChatConversation) => {
                const unreadCount = userData?.id
                  ? rowData.unreadCount?.[userData.id] || 0
                  : 0;
                return unreadCount > 0 ? (
                  <Chip
                    label={unreadCount.toString()}
                    className='p-chip-sm'
                    style={{
                      backgroundColor: theme.primary,
                      color: theme.textInverse,
                    }}
                  />
                ) : (
                  <span style={{ color: theme.textSecondary }}>-</span>
                );
              }}
            />
            <Column
              field='status'
              header='Status'
              body={(rowData: ChatConversation) => (
                <Tag
                  value={rowData.status || 'active'}
                  severity={rowData.status === 'active' ? 'success' : 'warning'}
                  style={{
                    backgroundColor:
                      rowData.status === 'active'
                        ? theme.success
                        : theme.warning,
                    color: theme.textInverse,
                  }}
                />
              )}
            />
            <Column
              field='type'
              header='Type'
              body={(rowData: ChatConversation) => {
                const getTypeIcon = (type: string) => {
                  switch (type) {
                    case 'system':
                      return 'pi pi-cog';
                    case 'support':
                      return 'pi pi-question-circle';
                    default:
                      return 'pi pi-user';
                  }
                };

                const getTypeColor = (type: string) => {
                  switch (type) {
                    case 'system':
                      return theme.info;
                    case 'support':
                      return theme.warning;
                    default:
                      return theme.primary;
                  }
                };

                return (
                  <div className='flex align-items-center gap-2'>
                    <i
                      className={getTypeIcon(rowData.type || 'user')}
                      style={{
                        color: getTypeColor(rowData.type || 'user'),
                      }}
                    ></i>
                    <span
                      className='text-sm font-medium'
                      style={{ color: theme.textSecondary }}
                    >
                      {(rowData.type || 'user').charAt(0).toUpperCase() +
                        (rowData.type || 'user').slice(1)}
                    </span>
                  </div>
                );
              }}
            />
          </DataTable>
        )}
      </Card>

      {/* User Search Modal */}
      <UserSearch
        visible={showUserSearch}
        onHide={() => setShowUserSearch(false)}
        onUserFound={handleUserFound}
      />
    </div>
  );
};

export default DashboardChats;
