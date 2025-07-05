import UserSearch from '@/components/Chat/UserSearch';
import {
  DashboardPageWrapper,
  EmptyState,
  SkeletonLoader,
} from '@/components/common';
import { useAsyncData, useToast } from '@/hooks';
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
import { Tag } from 'primereact/tag';
import React, { useState } from 'react';

const DashboardChats: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showSuccess } = useToast();
  const [showUserSearch, setShowUserSearch] = useState(false);

  const userData = useUserDataZState((state) => state.data);
  const chatService = new ChatService();

  // Load user chats using the shared hook
  const fetchUserChats = async (): Promise<ChatConversation[]> => {
    if (!userData?.id) return [];
    return await chatService.getUserConversations(userData.id);
  };

  const {
    data: userChats,
    loading,
    refresh,
    refreshing,
  } = useAsyncData(fetchUserChats, {
    entityName: 'chats',
    dependencies: [userData?.id],
  });

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
    showSuccess('Chat Started', `Started new chat with ${user.displayName}`);
  };

  // Handle chat row click
  const handleChatClick = (chatId: string) => {
    navigate({ to: ROUTES.DASHBOARD_CHAT_VIEW.replace('$chatId', chatId) });
  };

  // Helper functions for table rendering
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

  const renderParticipant = (rowData: ChatConversation) => (
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
          color: !rowData.participant?.avatar ? theme.textInverse : undefined,
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
  );

  const renderLastMessage = (rowData: ChatConversation) => (
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
  );

  const renderUnreadCount = (rowData: ChatConversation) => {
    const unreadCount = userData?.id
      ? rowData.unreadCount?.[userData.id] || 0
      : 0;
    return unreadCount > 0 ? (
      <Chip
        label={unreadCount.toString()}
        className='p-chip-sm'
        style={{ backgroundColor: theme.primary, color: theme.textInverse }}
      />
    ) : (
      <span style={{ color: theme.textSecondary }}>-</span>
    );
  };

  const renderStatus = (rowData: ChatConversation) => (
    <Tag
      value={rowData.status || 'active'}
      severity={rowData.status === 'active' ? 'success' : 'warning'}
      style={{
        backgroundColor:
          rowData.status === 'active' ? theme.success : theme.warning,
        color: theme.textInverse,
      }}
    />
  );

  const renderType = (rowData: ChatConversation) => {
    const type = rowData.type || 'user';
    return (
      <div className='flex align-items-center gap-2'>
        <i
          className={getTypeIcon(type)}
          style={{ color: getTypeColor(type) }}
        ></i>
        <span
          className='text-sm font-medium'
          style={{ color: theme.textSecondary }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
    );
  };

  const startNewChatAction = (
    <Button
      label='Start New Chat'
      icon='pi pi-plus'
      className='p-button-rounded'
      onClick={() => setShowUserSearch(true)}
    />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Card className='shadow-3 border-round-2xl'>
          <SkeletonLoader
            type='list'
            count={5}
          />
        </Card>
      );
    }

    if (!userChats || userChats.length === 0) {
      return (
        <Card className='shadow-3 border-round-2xl'>
          <EmptyState
            icon='pi pi-comments'
            title='No conversations yet'
            description='Start a new conversation to see it here'
            actionLabel='Start New Chat'
            onAction={() => setShowUserSearch(true)}
          />
        </Card>
      );
    }

    return (
      <Card className='shadow-3 border-round-2xl'>
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
            body={renderParticipant}
          />
          <Column
            field='lastMessage'
            header='Last Message'
            body={renderLastMessage}
          />
          <Column
            field='unreadCount'
            header='Unread'
            body={renderUnreadCount}
          />
          <Column
            field='status'
            header='Status'
            body={renderStatus}
          />
          <Column
            field='type'
            header='Type'
            body={renderType}
          />
        </DataTable>
      </Card>
    );
  };

  return (
    <DashboardPageWrapper
      title='My Chats'
      onRefresh={refresh}
      refreshing={refreshing}
      refreshTooltip='Refresh Chats'
      actions={startNewChatAction}
    >
      {renderContent()}

      <UserSearch
        visible={showUserSearch}
        onHide={() => setShowUserSearch(false)}
        onUserFound={handleUserFound}
      />
    </DashboardPageWrapper>
  );
};

export default DashboardChats;
