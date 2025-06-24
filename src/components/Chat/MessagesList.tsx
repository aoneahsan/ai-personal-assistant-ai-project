import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Message } from './types';

interface MessagesListProps {
  messages: Message[];
  isTyping: boolean;
  playingAudioId: string | null;
  onAudioToggle: (messageId: string, audioUrl: string) => void;
  onShowTranscript: (messageId: string) => void;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isTyping,
  playingAudioId,
  onAudioToggle,
  onShowTranscript,
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
