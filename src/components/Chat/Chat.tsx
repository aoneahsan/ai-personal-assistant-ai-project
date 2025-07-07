import { unifiedAuthService } from '@/services/authService';
import { chatService } from '@/services/chatService';
import { userOnlineStatusService } from '@/services/userOnlineStatusService';
import { ROUTES } from '@/utils/constants/routingConstants';
import { consoleError } from '@/utils/helpers/consoleHelper';
import {
  useIsAuthSystemReady,
  useUserDataZState,
} from '@/zustandStates/userState';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaEllipsisV,
  FaImage,
  FaMicrophone,
  FaPaperPlane,
  FaPaperclip,
  FaPhone,
  FaSmile,
  FaVideo,
  FaVideoSlash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import AnonymousUserIndicator from '../Auth/AnonymousUserIndicator';
import styles from './Chat.module.scss';
import { TranscriptSegment } from './types';
import VideoRecorder from './VideoRecorder';
import VoiceRecording from './VoiceRecording';

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
  audioDuration?: number;
  videoDuration?: number;
  videoThumbnail?: string;
  quickTranscript?: string;
  transcript?: TranscriptSegment[];
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

// Emoji data - basic emojis for the picker
const EMOJI_DATA = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
  '🤠',
  '😈',
  '👿',
  '👹',
  '👺',
  '🤡',
  '💩',
  '👻',
  '💀',
  '☠️',
  '👽',
  '👾',
  '🤖',
  '🎃',
  '😺',
  '😸',
  '😹',
  '😻',
  '😼',
  '😽',
  '🙀',
  '😿',
  '😾',
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🤎',
  '🖤',
  '🤍',
  '💔',
  '❣️',
  '💕',
  '💞',
  '💓',
  '💗',
  '💖',
  '💘',
  '💝',
  '💟',
  '👍',
  '👎',
  '👌',
  '✌️',
  '🤞',
  '🤟',
  '🤘',
  '🤙',
  '👈',
  '👉',
  '👆',
  '🖕',
  '👇',
  '☝️',
  '👋',
  '🤚',
  '🖐️',
  '✋',
  '🖖',
  '👏',
  '🙌',
  '👐',
  '🤲',
  '🤝',
  '🙏',
  '✍️',
  '💅',
  '🤳',
  '💪',
  '🦾',
];

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [userOnlineStatus, setUserOnlineStatus] = useState<{
    isOnline: boolean;
    lastSeen: Date;
  }>({
    isOnline: false,
    lastSeen: new Date(),
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get best available user name
  const getBestUserName = (searchParams: {
    userName?: string | null;
    userEmail?: string | null;
  }): string => {
    if (searchParams?.userName) return searchParams.userName;
    if (searchParams?.userEmail) {
      // Extract name from email (before @)
      const emailName = searchParams.userEmail.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  // Current chat user
  const currentChatUser: ChatUser = chatUser || {
    id: search?.userId || '1',
    name: getBestUserName(search),
    avatar: search?.userAvatar || '',
    isOnline: userOnlineStatus.isOnline,
    lastSeen: userOnlineStatus.lastSeen,
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
        // Start tracking current user's online status
        await userOnlineStatusService.startTracking(currentUser.id!);

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

    // Cleanup function
    return () => {
      if (currentUser?.id) {
        userOnlineStatusService.stopTracking(currentUser.id);
      }
    };
  }, [
    currentUser,
    isAuthSystemReady,
    search?.chatId,
    search?.userId,
    search?.userEmail,
  ]);

  // Subscribe to other user's online status
  useEffect(() => {
    if (search?.userId && search.userId !== currentUser?.id) {
      const unsubscribe = userOnlineStatusService.subscribeToUserStatus(
        search.userId,
        (status) => {
          setUserOnlineStatus({
            isOnline: status.isOnline,
            lastSeen: status.lastActiveAt,
          });
        }
      );

      return unsubscribe;
    }
  }, [search?.userId, currentUser?.id]);

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
            audioDuration: msg.audioDuration,
            videoDuration: msg.videoDuration,
            videoThumbnail: msg.videoThumbnail,
            quickTranscript: msg.quickTranscript,
            transcript: msg.transcript,
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

  // Handle audio message
  const handleSendAudioMessage = async (audioMessage: Message) => {
    setMessages((prev) => [...prev, audioMessage]);

    if (chatId && currentUser) {
      try {
        // Here you would upload the audio file and send the message
        // For now, we'll just show the audio message locally
        console.log('Audio message sent:', audioMessage);
        toast.success('Audio message sent!');
      } catch (error) {
        consoleError('Error sending audio message:', error);
        toast.error('Failed to send audio message');
      }
    }
  };

  // Handle video recorded
  const handleVideoRecorded = (
    videoBlob: Blob,
    videoDuration: number,
    thumbnail?: string
  ) => {
    const videoMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: 'video',
      fileData: {
        name: 'video-message.webm',
        size: videoBlob.size,
        type: videoBlob.type,
        url: URL.createObjectURL(videoBlob),
      },
      videoDuration,
      videoThumbnail: thumbnail,
    };

    setMessages((prev) => [...prev, videoMessage]);
    setShowVideoRecorder(false);

    if (chatId && currentUser) {
      try {
        // Here you would upload the video file and send the message
        console.log('Video message sent:', videoMessage);
        toast.success('Video message sent!');
      } catch (error) {
        consoleError('Error sending video message:', error);
        toast.error('Failed to send video message');
      }
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

  // Handle emoji select
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle file attachment
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Selected files:', files);
      // TODO: Implement file upload logic
      toast.info('File upload functionality coming soon!');
    }
  };

  // Handle image capture
  const handleImageCapture = () => {
    console.log('Image capture clicked');
    toast.info('Image capture functionality coming soon!');
    // TODO: Implement image capture logic
  };

  // Handle video recording
  const handleVideoRecord = () => {
    setShowVideoRecorder(true);
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format last seen
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatLoading}>
          <div className={styles.chatLoadingHeader}>
            <Skeleton
              width='100%'
              height='60px'
            />
          </div>
          <div className={styles.chatLoadingMessages}>
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
      </div>
    );
  }

  return (
    <>
      {unifiedAuthService.isAnonymousUser() && (
        <AnonymousUserIndicator
          variant='banner'
          showConversion={true}
          className='mb-3'
        />
      )}

      <div className={styles.chatContainer}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <Button
              icon={<FaArrowLeft />}
              className={styles.chatBackBtn}
              onClick={() => navigate({ to: ROUTES.DASHBOARD_CHATS })}
            />

            <div className={styles.chatAvatar}>
              {currentChatUser.avatar ? (
                <img
                  src={currentChatUser.avatar}
                  alt={currentChatUser.name}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {currentChatUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className={styles.chatUserInfo}>
              <h3 className={styles.chatUserName}>{currentChatUser.name}</h3>
              <span className={styles.chatUserStatus}>
                {currentChatUser.isOnline
                  ? 'Online'
                  : `Last seen ${formatLastSeen(currentChatUser.lastSeen)}`}
              </span>
            </div>
          </div>

          <div className={styles.chatHeaderRight}>
            <Button
              icon={<FaVideo />}
              className={styles.chatActionBtn}
            />
            <Button
              icon={<FaPhone />}
              className={styles.chatActionBtn}
            />
            <Button
              icon={<FaEllipsisV />}
              className={styles.chatActionBtn}
            />
          </div>
        </div>

        {/* Messages */}
        <div className={styles.chatMessages}>
          {messages.length === 0 ? (
            <div className={styles.chatEmpty}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>Start a conversation</h3>
              <p>
                Send a message to begin chatting with {currentChatUser.name}
              </p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.sender === 'me'
                      ? styles.messageSent
                      : styles.messageReceived
                  }`}
                >
                  <div className={styles.messageBubble}>
                    {message.type === 'text' && (
                      <div className={styles.messageText}>{message.text}</div>
                    )}
                    {message.type === 'audio' && (
                      <div className={styles.messageAudio}>
                        <div className={styles.audioControls}>
                          <FaMicrophone />
                          <span>{Math.floor(message.audioDuration || 0)}s</span>
                        </div>
                        {message.quickTranscript && (
                          <div className={styles.audioTranscript}>
                            {message.quickTranscript}
                          </div>
                        )}
                      </div>
                    )}
                    {message.type === 'video' && (
                      <div className={styles.messageVideo}>
                        <video
                          controls
                          style={{ maxWidth: '100%', borderRadius: '8px' }}
                        >
                          <source
                            src={message.fileData?.url}
                            type={message.fileData?.type}
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    <div className={styles.messageMeta}>
                      <span className={styles.messageTime}>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'me' && (
                        <span
                          className={`${styles.messageStatus} ${message.status}`}
                        >
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
        <div className={styles.chatInput}>
          <div className={styles.inputWrapper}>
            <Button
              icon={<FaPaperclip />}
              className={styles.attachBtn}
              onClick={handleFileClick}
              tooltip='Attach file'
            />

            <InputTextarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder='Type a message...'
              className={styles.messageTextarea}
              autoResize={false}
              rows={1}
            />

            <div className={styles.inputActions}>
              <Button
                icon={<FaSmile />}
                className={styles.emojiBtn}
                onClick={() => setShowEmojiPicker(true)}
                tooltip='Add emoji'
              />

              <VoiceRecording
                onSendAudioMessage={handleSendAudioMessage}
                disabled={false}
              />

              <Button
                icon={<FaImage />}
                className={styles.imageBtn}
                onClick={handleImageCapture}
                tooltip='Take photo'
              />

              <Button
                icon={<FaVideoSlash />}
                className={styles.videoBtn}
                onClick={handleVideoRecord}
                tooltip='Record video'
              />

              <Button
                icon={<FaPaperPlane />}
                className={styles.sendBtn}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                tooltip='Send message'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Emoji Picker Dialog */}
      <Dialog
        visible={showEmojiPicker}
        onHide={() => setShowEmojiPicker(false)}
        header='Select Emoji'
        modal
        className={styles.emojiPickerDialog}
        style={{ width: '400px', maxWidth: '90vw' }}
      >
        <div className={styles.emojiGrid}>
          {EMOJI_DATA.map((emoji, index) => (
            <button
              key={index}
              className={styles.emojiButton}
              onClick={() => handleEmojiSelect(emoji)}
              type='button'
            >
              {emoji}
            </button>
          ))}
        </div>
      </Dialog>

      {/* Video Recorder Dialog */}
      {showVideoRecorder && (
        <Dialog
          visible={showVideoRecorder}
          onHide={() => setShowVideoRecorder(false)}
          header='Record Video'
          modal
          style={{ width: '90vw', maxWidth: '600px' }}
          className='video-recorder-dialog'
        >
          <VideoRecorder
            onVideoRecorded={handleVideoRecorded}
            onClose={() => setShowVideoRecorder(false)}
            maxDuration={60}
          />
        </Dialog>
      )}
    </>
  );
};

export default Chat;
