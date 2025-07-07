import { DashboardPageWrapper } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';
import { unifiedAuthService } from '@/services/authService';
import { chatService, FirestoreMessage } from '@/services/chatService';
import { ChatFeatureFlag, SubscriptionPlan } from '@/types/user/subscription';
import { ROUTES } from '@/utils/constants/routingConstants';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  useIsAuthSystemReady,
  useUserDataZState,
} from '@/zustandStates/userState';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import React, { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AnonymousUserIndicator from '../Auth/AnonymousUserIndicator';
import './Chat.scss';
import ChatHeader from './ChatHeader';
import MessageEditDialog from './MessageEditDialog';
import MessageHistoryDialog from './MessageHistoryDialog';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import TranscriptDialog from './TranscriptDialog';
import UpgradeModal from './UpgradeModal';
import { ChatUser, Message } from './types';

interface ChatProps {
  chatUser?: ChatUser;
  initialMessages?: Message[];
  onBack?: () => void;
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
  onBack,
  searchParams,
}) => {
  const currentUser = useUserDataZState((state) => state.data);
  const isAuthSystemReady = useIsAuthSystemReady();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Initialize theme to ensure CSS variables are loaded
  useTheme();

  // Use searchParams from props or fall back to URL parsing
  const getSearchParams = () => {
    if (searchParams) {
      return searchParams;
    }

    try {
      // Convert location.search to string to handle TanStack Router compatibility
      const searchString =
        typeof location.search === 'string' ? location.search : '';
      const urlParams = new URLSearchParams(searchString);
      return {
        chatId: urlParams.get('chatId'),
        userId: urlParams.get('userId'),
        userEmail: urlParams.get('userEmail'),
        userName: urlParams.get('userName'),
        userAvatar: urlParams.get('userAvatar'),
        contactId: urlParams.get('contactId'),
      };
    } catch (error) {
      console.warn('Failed to parse search params:', error);
      return {};
    }
  };

  const search = getSearchParams();

  // State for messages and chat
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentMessage, setCurrentMessage] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState<
    string | null
  >(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // State for message editing features
  const [selectedMessageForEdit, setSelectedMessageForEdit] =
    useState<FirestoreMessage | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<ChatFeatureFlag | null>(
    null
  );

  // Processing states
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Determine chat user from props or search params
  const currentChatUser: ChatUser = chatUser || {
    id: search?.userId || '1',
    name: search?.userName || 'Unknown User',
    avatar: search?.userAvatar || '',
    isOnline: true,
    lastSeen: new Date(),
  };

  // Set up chat when component mounts or search params change
  useEffect(() => {
    const setupChat = async () => {
      // Wait for auth system to be ready before proceeding
      if (!isAuthSystemReady) {
        consoleLog('Auth system not ready, waiting...');
        return;
      }

      if (!currentUser) {
        consoleLog('No current user, using default chat behavior');
        setMessages(getDefaultMessages());
        setIsInitialLoading(false);
        return;
      }

      setIsInitialLoading(true);
      try {
        // If we have a chatId from search params, use it
        if (search?.chatId) {
          setChatId(search.chatId);
          consoleLog('Using chatId from search params:', search.chatId);
        } else if (search?.userId && search?.userEmail) {
          // Create or get conversation
          const newChatId = await chatService.createOrGetConversation(
            currentUser.id!,
            currentUser.email!,
            search.userId,
            search.userEmail
          );
          setChatId(newChatId);
          consoleLog('Created/got chatId:', newChatId);
        } else {
          // Use default behavior for existing contacts
          consoleLog('Using default chat behavior');
          setMessages(getDefaultMessages());
          setIsInitialLoading(false);
          return;
        }
      } catch (error) {
        consoleError('Error setting up chat:', error);
        toast.error('Failed to set up chat');
        setIsInitialLoading(false);
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

  // Subscribe to messages when chatId is available
  useEffect(() => {
    if (!chatId) {
      return;
    }

    consoleLog('Setting up message subscription for chatId:', chatId);
    setIsLoadingMessages(true);

    const unsubscribe = chatService.subscribeToMessages(
      chatId,
      (firestoreMessages) => {
        consoleLog('Received Firestore messages:', firestoreMessages.length);

        // Convert Firestore messages to local message format
        const convertedMessages = firestoreMessages.map(
          (msg): Message => ({
            id: msg.id || '',
            text: msg.text,
            sender: msg.senderId === currentUser?.id ? 'me' : 'other',
            timestamp: msg.timestamp?.toDate?.() || new Date(),
            status: msg.status,
            type: msg.type,
            fileData: msg.fileData,
            audioDuration: msg.audioDuration,
            videoDuration: msg.videoDuration,
            videoThumbnail: msg.videoThumbnail,
            quickTranscript: msg.quickTranscript,
            transcript: msg.transcript,
          })
        );

        setMessages(convertedMessages);
        setIsLoadingMessages(false);
        setIsInitialLoading(false);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [chatId, currentUser?.id]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Default messages for existing contacts (backward compatibility)
  const getDefaultMessages = (): Message[] => [
    {
      id: '1',
      text: "✨ Hi there! I'm your AI personal assistant. I'm here to help you with anything you need!",
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      text: '🚀 I can help you with questions, tasks, creative projects, and so much more. Feel free to send me text messages, images, videos, or voice recordings!',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      text: "💡 Try asking me about anything - I'm ready to assist you!",
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
      status: 'read',
      type: 'text',
    },
  ];

  const toggleAudioPlayback = (messageId: string) => {
    const audioElement = audioRefs.current[messageId];
    if (audioElement) {
      if (playingAudioId === messageId) {
        audioElement.pause();
        setPlayingAudioId(null);
      } else {
        // Pause any currently playing audio
        if (playingAudioId) {
          audioRefs.current[playingAudioId]?.pause();
        }
        audioElement.play();
        setPlayingAudioId(messageId);
      }
    }
  };

  const showTranscript = (messageId: string) => {
    setShowTranscriptDialog(messageId);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: 'text',
    };

    // Add message to local state immediately
    setMessages((prev) => [...prev, newMessage]);
    setCurrentMessage('');

    // Send to Firebase if chatId exists
    if (chatId && currentUser) {
      try {
        await chatService.sendTextMessage(
          chatId,
          currentUser.id!,
          currentUser.email!,
          currentMessage
        );
      } catch (error) {
        consoleError('Error sending message:', error);
        toast.error('Failed to send message');

        // Remove message from local state on error
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
      }
    } else {
      // Simulate bot response for default behavior
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

  const handleSendAudioMessage = (message: Message) => {
    setIsProcessingAudio(true);

    // Add message to local state immediately
    setMessages((prev) => [...prev, message]);

    // Send to Firebase if chatId exists
    if (chatId && currentUser && message.fileData) {
      try {
        const audioFile = new File([new Blob()], message.fileData.name, {
          type: message.fileData.type,
        });

        chatService.sendAudioMessage({
          file: audioFile,
          chatId,
          senderId: currentUser.id!,
          senderEmail: currentUser.email!,
          transcript: message.transcript,
          quickTranscript: message.quickTranscript,
          duration: message.audioDuration,
        });
      } catch (error) {
        consoleError('Error sending audio message:', error);
        toast.error('Failed to send audio message');

        // Remove message from local state on error
        setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
      }
    }

    setIsProcessingAudio(false);
  };

  const handleSendVideoMessage = (message: Message) => {
    setIsProcessingVideo(true);

    // Add message to local state immediately
    setMessages((prev) => [...prev, message]);

    // Send to Firebase if chatId exists
    if (chatId && currentUser && message.fileData) {
      try {
        const videoFile = new File([new Blob()], message.fileData.name, {
          type: message.fileData.type,
        });

        chatService.sendVideoMessage({
          file: videoFile,
          chatId,
          senderId: currentUser.id!,
          senderEmail: currentUser.email!,
          duration: message.videoDuration,
          thumbnail: message.videoThumbnail,
        });
      } catch (error) {
        consoleError('Error sending video message:', error);
        toast.error('Failed to send video message');

        // Remove message from local state on error
        setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
      }
    }

    setIsProcessingVideo(false);
  };

  const handleFileUpload = (files: FileList) => {
    setIsProcessingFile(true);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: e.target?.result as string,
        };

        let messageType: Message['type'] = 'file';
        if (file.type.startsWith('image/')) {
          messageType = 'image';
        } else if (file.type.startsWith('video/')) {
          messageType = 'video';
        }

        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          sender: 'me',
          timestamp: new Date(),
          status: 'sent',
          type: messageType,
          fileData,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Send to Firebase if chatId exists
        if (chatId && currentUser) {
          try {
            if (messageType === 'image') {
              chatService.sendImageMessage({
                file: file,
                chatId,
                senderId: currentUser.id!,
                senderEmail: currentUser.email!,
              });
            } else if (messageType === 'video') {
              chatService.sendVideoMessage({
                file: file,
                chatId,
                senderId: currentUser.id!,
                senderEmail: currentUser.email!,
              });
            }
          } catch (error) {
            consoleError('Error sending file message:', error);
            toast.error('Failed to send file');

            // Remove message from local state on error
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== newMessage.id)
            );
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setIsProcessingFile(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    consoleLog('Chat cleared');
  };

  const handleDeleteChat = () => {
    // For now, just clear messages and navigate back
    setMessages([]);
    if (onBack) {
      onBack();
    } else {
      // Navigate to chats list page instead of using browser history
      if (location.pathname === '/anonymous-chat') {
        navigate({ to: ROUTES.DASHBOARD_CHATS });
      } else {
        navigate({ to: ROUTES.DASHBOARD_CHATS });
      }
    }
    consoleLog('Chat deleted');
  };

  const handleBlockUser = () => {
    // For now, just show a success message
    consoleLog('User blocked:', currentChatUser.name);
    // Could implement actual blocking logic here
  };

  const handleMuteNotifications = (muted: boolean) => {
    consoleLog(
      'Notifications',
      muted ? 'muted' : 'unmuted',
      'for:',
      currentChatUser.name
    );
    // Could implement actual mute logic here
  };

  // Message editing handlers
  const handleEditMessage = (message: FirestoreMessage) => {
    setSelectedMessageForEdit(message);
    setShowEditDialog(true);
  };

  const handleDeleteMessage = async (message: FirestoreMessage) => {
    if (!currentUser?.id || !message.id) return;

    try {
      await chatService.deleteMessage(message.id, currentUser.id);
      toast.success('Message deleted successfully');
    } catch (error) {
      consoleError('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleViewHistory = (message: FirestoreMessage) => {
    setSelectedMessageForEdit(message);
    setShowHistoryDialog(true);
  };

  const handleUpgradeFeature = (feature: ChatFeatureFlag) => {
    setUpgradeFeature(feature);
    setShowUpgradeModal(true);
  };

  const handleSaveEdit = async (newText: string, editReason?: string) => {
    if (!selectedMessageForEdit || !currentUser?.id) return;

    try {
      await chatService.editMessage(
        selectedMessageForEdit.id!,
        newText,
        currentUser.id,
        currentUser.email!,
        editReason
      );
      setShowEditDialog(false);
      setSelectedMessageForEdit(null);
      toast.success('Message updated successfully');
    } catch (error) {
      consoleError('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleUpgradePlan = (plan: SubscriptionPlan) => {
    setShowUpgradeModal(false);
    // Handle upgrade logic here
    consoleLog('Upgrading to plan:', plan);
  };

  const selectedMessage =
    messages.find((msg) => msg.id === showTranscriptDialog) || null;

  // Enhanced empty state component
  const EmptyState = () => (
    <div className='empty-chat-state text-center'>
      <div className='empty-illustration'></div>
      <h3
        className='empty-title mb-3'
        style={{ color: theme.textPrimary }}
      >
        Start a Conversation
      </h3>
      <p
        className='empty-subtitle mb-4'
        style={{ color: theme.textSecondary }}
      >
        Begin chatting with your AI assistant. Ask questions, share files, or
        just say hello!
      </p>
      <Button
        label='Get Started'
        className='start-chat-btn'
        onClick={() => {
          setMessages(getDefaultMessages());
        }}
      />
    </div>
  );

  // Show initial loading state
  if (isInitialLoading) {
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
        <Card className='shadow-3 border-round-2xl h-full'>
          <div className='chat-loading-state'>
            <div className='loading-messages'>
              <div className='loading-message-group'>
                <Skeleton
                  width='60%'
                  height='60px'
                  className='mb-3'
                />
                <Skeleton
                  width='40%'
                  height='60px'
                  className='mb-3 ml-auto'
                />
                <Skeleton
                  width='70%'
                  height='60px'
                  className='mb-3'
                />
                <Skeleton
                  width='50%'
                  height='60px'
                  className='mb-3 ml-auto'
                />
                <Skeleton
                  width='65%'
                  height='60px'
                  className='mb-3'
                />
              </div>
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
      {/* Anonymous User Indicator */}
      {unifiedAuthService.isAnonymousUser() && (
        <AnonymousUserIndicator
          variant='banner'
          showConversion={true}
          className='mb-3'
        />
      )}

      <Card className='shadow-3 border-round-2xl h-full'>
        <div className='chat-container'>
          <ChatHeader
            chatUser={currentChatUser}
            onBack={onBack}
            onClearChat={handleClearChat}
            onDeleteChat={handleDeleteChat}
            onBlockUser={handleBlockUser}
            onMuteNotifications={handleMuteNotifications}
          />

          {/* Show empty state if no messages, otherwise show messages list */}
          {messages.length === 0 && !isLoadingMessages ? (
            <div className='messages-container'>
              <EmptyState />
            </div>
          ) : (
            <MessagesList
              messages={messages}
              isTyping={false}
              playingAudioId={playingAudioId}
              onAudioToggle={toggleAudioPlayback}
              onShowTranscript={showTranscript}
              isLoading={isLoadingMessages}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onViewHistory={handleViewHistory}
              onUpgrade={handleUpgradeFeature}
            />
          )}

          <MessageInput
            currentMessage={currentMessage}
            onMessageChange={setCurrentMessage}
            onSendMessage={handleSendMessage}
            onSendAudioMessage={handleSendAudioMessage}
            onSendVideoMessage={handleSendVideoMessage}
            onFileUpload={handleFileUpload}
            disabled={
              isProcessingAudio || isProcessingVideo || isProcessingFile
            }
          />
        </div>
      </Card>

      <TranscriptDialog
        visible={!!showTranscriptDialog}
        onHide={() => setShowTranscriptDialog(null)}
        message={selectedMessage}
      />

      {/* Message Edit Dialog */}
      <MessageEditDialog
        visible={showEditDialog}
        message={selectedMessageForEdit}
        onHide={() => setShowEditDialog(false)}
        onSave={handleSaveEdit}
      />

      {/* Message History Dialog */}
      <MessageHistoryDialog
        visible={showHistoryDialog}
        message={selectedMessageForEdit}
        onHide={() => setShowHistoryDialog(false)}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        feature={upgradeFeature}
        onHide={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradePlan}
      />
    </DashboardPageWrapper>
  );
};

export default Chat;
