import { ROUTES } from '@/utils/constants/routingConstants';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import React from 'react';
import Chat from './Chat';
import './ChatView.scss';
import { ChatUser } from './types';

const ChatView: React.FC = () => {
  const navigate = useNavigate();
  const { chatId } = useParams({ from: '/dashboard/chats/view/$chatId' });
  const search = useSearch({ from: '/dashboard/chats/view/$chatId' });

  const handleBack = () => {
    navigate({ to: ROUTES.DASHBOARD_CHATS });
  };

  // Extract chat user from search params if available
  const chatUser: ChatUser | undefined = search
    ? {
        id: search.userId || chatId,
        name: search.userName || 'Unknown User',
        avatar: search.userAvatar || '',
        isOnline: true,
        lastSeen: new Date(),
      }
    : undefined;

  // Create a modified search object to pass to Chat component
  const chatSearchParams = search
    ? {
        chatId: chatId === 'new' ? undefined : chatId, // Don't pass 'new' as chatId
        userId: search.userId,
        userEmail: search.userEmail,
        userName: search.userName,
        userAvatar: search.userAvatar,
      }
    : undefined;

  return (
    <div className='dashboard-chat-view'>
      <Chat
        chatUser={chatUser}
        onBack={handleBack}
        searchParams={chatSearchParams}
      />
    </div>
  );
};

export default ChatView;
