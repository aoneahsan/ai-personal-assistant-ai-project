import { chatService } from '@/services/chatService';
import { EmbedConfig, embedService } from '@/services/embedService';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { ScrollPanel } from 'primereact/scrollpanel';
import React, { useEffect, useRef, useState } from 'react';
import { BsChatDots } from 'react-icons/bs';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { IoMdMinimize } from 'react-icons/io';
import './EmbeddableWidget.scss';

interface EmbeddableWidgetProps {
  embedId: string;
  containerId?: string;
  baseUrl?: string;
  userId?: string; // Optional user ID, if not provided, device fingerprint will be used
  userMetadata?: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
}

interface WidgetMessage {
  id: string;
  text: string;
  sender: 'visitor' | 'owner';
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

const EmbeddableWidget: React.FC<EmbeddableWidgetProps> = ({
  embedId,
  containerId,
  baseUrl,
  userId,
  userMetadata,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>('');
  const [isOwnerOnline, setIsOwnerOnline] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize widget
  useEffect(() => {
    initializeWidget();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [embedId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle new messages when widget is minimized
  useEffect(() => {
    if (isMinimized && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'owner') {
        setHasUnreadMessages(true);
      }
    }
  }, [messages, isMinimized]);

  const initializeWidget = async () => {
    try {
      setIsLoading(true);

      // Get website URL and origin
      const websiteUrl = window.location.href;
      const origin = window.location.origin;

      // Validate embed request
      const validation = await embedService.validateEmbedRequest(
        embedId,
        websiteUrl,
        origin
      );

      if (!validation.isValid) {
        consoleError('❌ Embed validation failed:', validation.error);
        return;
      }

      setConfig(validation.config!);

      // Get or generate visitor ID
      const visitorIdValue = embedService.getVisitorId(userId);
      setVisitorId(visitorIdValue);

      // Create or get conversation
      const conversationIdValue =
        await embedService.createOrGetEmbeddedConversation(
          embedId,
          websiteUrl,
          visitorIdValue,
          validation.config!.userId,
          validation.config!.userEmail,
          {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            timestamp: new Date(),
          }
        );

      setConversationId(conversationIdValue);

      // Subscribe to messages
      const unsubscribe = chatService.subscribeToMessages(
        conversationIdValue,
        (firestoreMessages) => {
          const widgetMessages: WidgetMessage[] = firestoreMessages.map(
            (msg) => ({
              id: msg.id || '',
              text: msg.text || '',
              sender: msg.senderId === visitorIdValue ? 'visitor' : 'owner',
              timestamp: msg.timestamp?.toDate?.() || new Date(),
              type: msg.type || 'text',
              fileData: msg.fileData,
            })
          );

          setMessages(widgetMessages);
        }
      );

      unsubscribeRef.current = unsubscribe;

      // Send welcome message if no messages exist
      if (validation.config!.behavior?.welcomeMessage) {
        setTimeout(() => {
          sendWelcomeMessage(validation.config!.behavior!.welcomeMessage!);
        }, 1000);
      }

      // Auto-open if configured
      if (validation.config!.behavior?.autoOpen) {
        setTimeout(() => {
          setIsOpen(true);
        }, 2000);
      }

      consoleLog('✅ Widget initialized successfully');
    } catch (error) {
      consoleError('❌ Error initializing widget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeMessage = async (welcomeText: string) => {
    if (!conversationId || !config) return;

    try {
      await chatService.sendTextMessage(
        conversationId,
        config.userId,
        config.userEmail,
        welcomeText
      );
    } catch (error) {
      consoleError('Error sending welcome message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !conversationId || !config || isSending) {
      return;
    }

    setIsSending(true);

    try {
      await chatService.sendTextMessage(
        conversationId,
        visitorId,
        userMetadata?.email || visitorId,
        currentMessage.trim()
      );

      setCurrentMessage('');
      consoleLog('✅ Message sent successfully');
    } catch (error) {
      consoleError('❌ Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setHasUnreadMessages(false);
  };

  const minimizeWidget = () => {
    setIsMinimized(true);
    setHasUnreadMessages(false);
  };

  const maximizeWidget = () => {
    setIsMinimized(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (isLoading) {
    return (
      <div className='embeddable-widget loading'>
        <div className='loading-spinner'>Loading...</div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  const widgetStyle = {
    '--primary-color': config.style?.primaryColor || '#3b82f6',
    '--secondary-color': config.style?.secondaryColor || '#f8fafc',
    '--text-color': config.style?.textColor || '#1f2937',
    '--background-color': config.style?.backgroundColor || '#ffffff',
    '--border-radius': config.style?.borderRadius || '12px',
    '--widget-width': config.style?.width || '350px',
    '--widget-height': config.style?.height || '500px',
  } as React.CSSProperties;

  return (
    <div
      className={`embeddable-widget ${config.style?.position || 'bottom-right'}`}
      style={widgetStyle}
    >
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          className='chat-toggle-button'
          onClick={toggleWidget}
          style={{
            backgroundColor: config.style?.primaryColor || '#3b82f6',
            borderColor: config.style?.primaryColor || '#3b82f6',
          }}
        >
          <BsChatDots size={24} />
          {hasUnreadMessages && <span className='unread-indicator' />}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Chat Header */}
          <div className='chat-header'>
            <div className='chat-header-left'>
              <Avatar
                label={config.userEmail.charAt(0).toUpperCase()}
                size='normal'
                shape='circle'
                className='owner-avatar'
              />
              <div className='owner-info'>
                <h4>{config.title}</h4>
                {config.behavior?.showOnlineStatus && (
                  <span
                    className={`online-status ${isOwnerOnline ? 'online' : 'offline'}`}
                  >
                    {isOwnerOnline ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
            <div className='chat-header-right'>
              <Button
                icon={<IoMdMinimize />}
                className='p-button-text header-button'
                onClick={minimizeWidget}
                tooltip='Minimize'
              />
              <Button
                icon={<FaTimes />}
                className='p-button-text header-button'
                onClick={toggleWidget}
                tooltip='Close'
              />
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <ScrollPanel
                className='chat-messages'
                style={{ height: '350px' }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'visitor' ? 'visitor' : 'owner'}`}
                  >
                    <div className='message-content'>
                      {message.type === 'text' && (
                        <p className='message-text'>{message.text}</p>
                      )}
                      {message.type === 'image' && message.fileData && (
                        <div className='message-image'>
                          <img
                            src={message.fileData.url}
                            alt={message.fileData.name}
                          />
                        </div>
                      )}
                      {message.type === 'file' && message.fileData && (
                        <div className='message-file'>
                          <span className='file-name'>
                            {message.fileData.name}
                          </span>
                          <span className='file-size'>
                            {Math.round(message.fileData.size / 1024)} KB
                          </span>
                        </div>
                      )}
                      <span className='message-time'>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ScrollPanel>

              {/* Message Input */}
              <div className='message-input-container'>
                <InputText
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Type your message...'
                  className='message-input'
                  disabled={isSending}
                />
                <Button
                  icon={<FaPaperPlane />}
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isSending}
                  className='send-button'
                  style={{
                    backgroundColor: config.style?.primaryColor || '#3b82f6',
                    borderColor: config.style?.primaryColor || '#3b82f6',
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EmbeddableWidget;
