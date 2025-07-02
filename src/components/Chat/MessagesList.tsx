import { FirestoreMessage } from '@/services/chatService';
import { ChatFeatureFlag } from '@/types/user/subscription';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Message } from './types';

interface MessagesListProps {
  messages: Message[];
  isTyping: boolean;
  playingAudioId: string | null;
  onAudioToggle: (messageId: string, audioUrl: string) => void;
  onShowTranscript: (messageId: string) => void;
  isLoading?: boolean;
  onEditMessage?: (message: FirestoreMessage) => void;
  onDeleteMessage?: (message: FirestoreMessage) => void;
  onViewHistory?: (message: FirestoreMessage) => void;
  onUpgrade?: (feature: ChatFeatureFlag) => void;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isTyping,
  playingAudioId,
  onAudioToggle,
  onShowTranscript,
  isLoading = false,
  onEditMessage,
  onDeleteMessage,
  onViewHistory,
  onUpgrade,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='messages-container'>
      <div className='messages-list'>
        {/* Loading state */}
        {isLoading && messages.length === 0 && (
          <div className='flex align-items-center justify-content-center p-4'>
            <ProgressSpinner
              style={{ width: '30px', height: '30px' }}
              strokeWidth='4'
            />
            <span className='ml-3 text-600'>Loading messages...</span>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-wrapper ${message.sender === 'me' ? 'message-sent' : 'message-received'}`}
          >
            <MessageBubble
              message={message}
              playingAudioId={playingAudioId}
              onAudioToggle={onAudioToggle}
              onShowTranscript={onShowTranscript}
              onEditMessage={onEditMessage}
              onDeleteMessage={onDeleteMessage}
              onViewHistory={onViewHistory}
              onUpgrade={onUpgrade}
            />
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className='message-wrapper message-received'>
            <div className='message-bubble typing-indicator'>
              <div className='typing-dots'>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesList;
