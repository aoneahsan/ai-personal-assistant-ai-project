import { useParams, useSearch } from '@tanstack/react-router';
import React from 'react';
import Chat from './Chat';
import { ChatUser } from './types';

const ChatView: React.FC = () => {
  const { chatId } = useParams({ from: '/dashboard/chats/view/$chatId' });
  const search = useSearch({ from: '/dashboard/chats/view/$chatId' });

  // Extract chat user from search params if available
  const chatUser: ChatUser | undefined = search
    ? {
        id: search.userId || chatId,
        name: search.userName || 'Unknown User',
        avatar: search.userAvatar || 'https://via.placeholder.com/40',
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
    <Chat
      chatUser={chatUser}
      searchParams={chatSearchParams}
    />
  );
};

export default ChatView;
