import { chatService } from '@/services/chatService';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { useUserDataZState } from '@/zustandStates/userState';
import { useSearch } from '@tanstack/react-router';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import TranscriptDialog from './TranscriptDialog';
import { ChatUser, Message } from './types';

interface ChatProps {
  chatUser?: ChatUser;
  initialMessages?: Message[];
  onBack?: () => void;
}

const Chat: React.FC<ChatProps> = ({
  chatUser,
  initialMessages = [],
  onBack,
}) => {
  const currentUser = useUserDataZState((state) => state.data);
  const search = useSearch({ from: '/chat' }) as any;

  // State for messages and chat
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState<
    string | null
  >(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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
      if (!currentUser) {
        consoleLog('No current user, skipping chat setup');
        return;
      }

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
          return;
        }
      } catch (error) {
        consoleError('Error setting up chat:', error);
        toast.error('Failed to set up chat');
      }
    };

    setupChat();
  }, [currentUser, search?.chatId, search?.userId, search?.userEmail]);

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
      text: 'Hey! How are you doing?',
      sender: 'other',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      text: "I'm doing great! Just working on some exciting projects. What about you?",
      sender: 'me',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      text: "That sounds awesome! I'd love to hear more about your projects.",
      sender: 'other',
      timestamp: new Date(Date.now() - 3400000),
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      text: "Sure! I'm building an AI personal assistant with React and it's been quite a journey.",
      sender: 'me',
      timestamp: new Date(Date.now() - 3300000),
      status: 'read',
      type: 'text',
    },
  ];

  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    // Stop all other audio first
    Object.keys(audioRefs.current).forEach((id) => {
      if (id !== messageId && audioRefs.current[id]) {
        audioRefs.current[id].pause();
        audioRefs.current[id].currentTime = 0;
      }
    });

    // Toggle the current audio
    if (playingAudioId === messageId) {
      // Pause the current audio
      setPlayingAudioId(null);
    } else {
      // Play the new audio
      setPlayingAudioId(messageId);
    }
  };

  const showTranscript = (messageId: string) => {
    setShowTranscriptDialog(messageId);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !currentUser) {
      return;
    }

    const messageText = currentMessage.trim();
    setCurrentMessage('');

    // If we have a chatId, save to Firestore
    if (chatId) {
      try {
        await chatService.sendMessage(
          chatId,
          currentUser.id!,
          currentUser.email!,
          {
            text: messageText,
            type: 'text',
          }
        );

        consoleLog('✅ Message sent to Firestore');
        // Message will be added to UI via the subscription
      } catch (error) {
        consoleError('❌ Error sending message:', error);
        toast.error('Failed to send message');
        // Restore the message text
        setCurrentMessage(messageText);
      }
    } else {
      // Fallback to local state for backward compatibility
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: 'text',
      };

      setMessages((prev) => [...prev, newMessage]);

      // Simulate message status updates
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 2000);

      // Simulate typing indicator and response
      setTimeout(() => {
        setIsTyping(true);
      }, 2500);

      setTimeout(() => {
        setIsTyping(false);
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'That sounds really interesting! 😊',
          sender: 'other',
          timestamp: new Date(),
          status: 'read',
          type: 'text',
        };
        setMessages((prev) => [...prev, responseMessage]);
      }, 4000);
    }
  };

  const handleSendAudioMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2000);
  };

  const handleSendVideoMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2000);
  };

  const handleFileUpload = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let messageType: Message['type'] = 'file';

      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      }

      // Check if the file has an actualUrl property (from Capacitor file manager)
      const fileUrl = (file as any).actualUrl || URL.createObjectURL(file);

      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: messageType,
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
        },
      };

      // Add video duration for video files (placeholder)
      if (messageType === 'video') {
        newMessage.videoDuration = 0; // This would be extracted from video metadata
      }

      setMessages((prev) => [...prev, newMessage]);

      // Simulate message status updates
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 2000);
    }
  };

  const selectedMessage = showTranscriptDialog
    ? messages.find((m) => m.id === showTranscriptDialog) || null
    : null;

  // Check if any audio is being processed
  const isProcessingAudio = false;

  // Chat header action handlers
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
      // Navigate back to chat list
      window.history.back();
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

  return (
    <div className='chat-container'>
      <ChatHeader
        chatUser={currentChatUser}
        onBack={onBack}
        onClearChat={handleClearChat}
        onDeleteChat={handleDeleteChat}
        onBlockUser={handleBlockUser}
        onMuteNotifications={handleMuteNotifications}
      />

      <MessagesList
        messages={messages}
        isTyping={isTyping}
        playingAudioId={playingAudioId}
        onAudioToggle={toggleAudioPlayback}
        onShowTranscript={showTranscript}
        isLoading={isLoadingMessages}
      />

      <MessageInput
        currentMessage={currentMessage}
        onMessageChange={setCurrentMessage}
        onSendMessage={handleSendMessage}
        onSendAudioMessage={handleSendAudioMessage}
        onSendVideoMessage={handleSendVideoMessage}
        onFileUpload={handleFileUpload}
        disabled={isProcessingAudio}
      />

      <TranscriptDialog
        visible={!!showTranscriptDialog}
        onHide={() => setShowTranscriptDialog(null)}
        message={selectedMessage}
      />
    </div>
  );
};

export default Chat;
