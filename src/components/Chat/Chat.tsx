import { DashboardPageWrapper } from '@/components/common';
import { unifiedAuthService } from '@/services/authService';
import { chatService } from '@/services/chatService';
import { ROUTES } from '@/utils/constants/routingConstants';
import { consoleError } from '@/utils/helpers/consoleHelper';
import {
  useIsAuthSystemReady,
  useUserDataZState,
} from '@/zustandStates/userState';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaEllipsisV,
  FaPaperPlane,
  FaPaperclip,
  FaPhone,
  FaSmile,
  FaVideo,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import AnonymousUserIndicator from '../Auth/AnonymousUserIndicator';
import './Chat.scss';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface FileData {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  fileData?: FileData;
}

interface ChatProps {
  chatUser?: ChatUser;
  initialMessages?: Message[];
  searchParams?: {
    chatId?: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    userAvatar?: string;
  };
}

const Chat: React.FC<ChatProps> = ({
  chatUser,
  initialMessages = [],
  searchParams,
}) => {
  const currentUser = useUserDataZState((state) => state.data);
  const isAuthSystemReady = useIsAuthSystemReady();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse search params
  const getSearchParams = () => {
    if (searchParams) return searchParams;

    try {
      const searchString =
        typeof location.search === 'string' ? location.search : '';
      const urlParams = new URLSearchParams(searchString);
      return {
        chatId: urlParams.get('chatId'),
        userId: urlParams.get('userId'),
        userEmail: urlParams.get('userEmail'),
        userName: urlParams.get('userName'),
        userAvatar: urlParams.get('userAvatar'),
      };
    } catch {
      return {};
    }
  };

  const search = getSearchParams();

  // State
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Current chat user
  const currentChatUser: ChatUser = chatUser || {
    id: search?.userId || '1',
    name: search?.userName || 'Unknown User',
    avatar: search?.userAvatar || '',
    isOnline: true,
    lastSeen: new Date(),
  };

  // Default messages for demo
  const getDefaultMessages = (): Message[] => [
    {
      id: '1',
      text: "✨ Hi there! I'm your AI personal assistant. I'm here to help you with anything you need!",
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      text: '🚀 I can help you with questions, tasks, creative projects, and so much more. Feel free to send me text messages, images, videos, or voice recordings!',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      text: "💡 Try asking me about anything - I'm ready to assist you!",
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      status: 'read',
      type: 'text',
    },
  ];

  // Setup chat
  useEffect(() => {
    const setupChat = async () => {
      if (!isAuthSystemReady) {
        setIsLoading(true);
        return;
      }

      if (!currentUser) {
        setMessages(getDefaultMessages());
        setIsLoading(false);
        return;
      }

      try {
        if (search?.chatId) {
          setChatId(search.chatId);
        } else if (search?.userId && search?.userEmail) {
          const newChatId = await chatService.createOrGetConversation(
            currentUser.id!,
            currentUser.email!,
            search.userId,
            search.userEmail
          );
          setChatId(newChatId);
        } else {
          setMessages(getDefaultMessages());
          setIsLoading(false);
          return;
        }
      } catch {
        toast.error('Failed to set up chat');
        setIsLoading(false);
      }
    };

    setupChat();
  }, [
    currentUser,
    isAuthSystemReady,
    search?.chatId,
    search?.userId,
    search?.userEmail,
  ]);

  // Subscribe to messages
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const unsubscribe = chatService.subscribeToMessages(
      chatId,
      (firestoreMessages) => {
        const convertedMessages = firestoreMessages.map(
          (msg): Message => ({
            id: msg.id || '',
            text: msg.text,
            sender: msg.senderId === currentUser.id ? 'me' : 'other',
            timestamp: msg.timestamp?.toDate?.() || new Date(),
            status: msg.status,
            type: msg.type,
            fileData: msg.fileData,
          })
        );

        setMessages(convertedMessages);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [chatId, currentUser?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const tempMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: 'text',
    };

    setMessages((prev) => [...prev, tempMessage]);

    if (chatId && currentUser) {
      try {
        await chatService.sendTextMessage(
          chatId,
          currentUser.id!,
          currentUser.email!,
          messageText
        );
      } catch (error) {
        consoleError('Error sending message:', error);
        toast.error('Failed to send message');
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      }
    } else {
      // Demo response
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm here to help! What would you like to know?",
          sender: 'other',
          timestamp: new Date(),
          status: 'read',
          type: 'text',
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);
    }
  };

  // Handle textarea input
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardPageWrapper
        title={`Chat with ${currentChatUser.name}`}
        actions={
          <Button
            icon={<FaArrowLeft />}
            label='Back'
            className='p-button-outlined'
            onClick={() => navigate({ to: ROUTES.DASHBOARD_CHATS })}
          />
        }
      >
        <Card className='h-full'>
          <div className='chat-loading'>
            <div className='chat-loading-header'>
              <Skeleton
                width='100%'
                height='60px'
              />
            </div>
            <div className='chat-loading-messages'>
              <Skeleton
                width='60%'
                height='40px'
                className='mb-2'
              />
              <Skeleton
                width='40%'
                height='40px'
                className='mb-2 ml-auto'
              />
              <Skeleton
                width='70%'
                height='40px'
                className='mb-2'
              />
              <Skeleton
                width='50%'
                height='40px'
                className='mb-2 ml-auto'
              />
            </div>
          </div>
        </Card>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper
      title={`Chat with ${currentChatUser.name}`}
      actions={
        <Button
          icon={<FaArrowLeft />}
          label='Back'
          className='p-button-outlined'
          onClick={() => navigate({ to: ROUTES.DASHBOARD_CHATS })}
        />
      }
    >
      {unifiedAuthService.isAnonymousUser() && (
        <AnonymousUserIndicator
          variant='banner'
          showConversion={true}
          className='mb-3'
        />
      )}

      <Card className='h-full p-0 overflow-hidden'>
        <div className='chat-container'>
          {/* Header */}
          <div className='chat-header'>
            <div className='chat-header-left'>
              <Button
                icon={<FaArrowLeft />}
                className='chat-back-btn'
                onClick={() => navigate({ to: ROUTES.DASHBOARD_CHATS })}
              />

              <div className='chat-avatar'>
                {currentChatUser.avatar ? (
                  <img
                    src={currentChatUser.avatar}
                    alt={currentChatUser.name}
                  />
                ) : (
                  <div className='avatar-placeholder'>
                    {currentChatUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className='chat-user-info'>
                <h3 className='chat-user-name'>{currentChatUser.name}</h3>
                <span className='chat-user-status'>
                  {currentChatUser.isOnline ? 'Online' : 'Last seen recently'}
                </span>
              </div>
            </div>

            <div className='chat-header-right'>
              <Button
                icon={<FaVideo />}
                className='chat-action-btn'
              />
              <Button
                icon={<FaPhone />}
                className='chat-action-btn'
              />
              <Button
                icon={<FaEllipsisV />}
                className='chat-action-btn'
              />
            </div>
          </div>

          {/* Messages */}
          <div className='chat-messages'>
            {messages.length === 0 ? (
              <div className='chat-empty'>
                <div className='empty-icon'>💬</div>
                <h3>Start a conversation</h3>
                <p>
                  Send a message to begin chatting with {currentChatUser.name}
                </p>
              </div>
            ) : (
              <div className='messages-list'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'me' ? 'message-sent' : 'message-received'}`}
                  >
                    <div className='message-bubble'>
                      <div className='message-text'>{message.text}</div>
                      <div className='message-meta'>
                        <span className='message-time'>
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender === 'me' && (
                          <span className={`message-status ${message.status}`}>
                            {message.status === 'read' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className='chat-input'>
            <div className='input-wrapper'>
              <Button
                icon={<FaPaperclip />}
                className='attach-btn'
                onClick={() => console.log('Attach file')}
              />

              <InputTextarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder='Type a message...'
                className='message-textarea'
                autoResize={false}
                rows={1}
              />

              <Button
                icon={<FaSmile />}
                className='emoji-btn'
                onClick={() => console.log('Open emoji picker')}
              />

              <Button
                icon={<FaPaperPlane />}
                className='send-btn'
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              />
            </div>
          </div>
        </div>
      </Card>
    </DashboardPageWrapper>
  );
};

export default Chat;
