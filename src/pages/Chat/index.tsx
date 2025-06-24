import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {
  FaArrowLeft,
  FaMicrophone,
  FaPaperPlane,
  FaPaperclip,
  FaSmile,
} from 'react-icons/fa';
import './index.scss';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you doing?',
      sender: 'other',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
    },
    {
      id: '2',
      text: "I'm doing great! Just working on some exciting projects. What about you?",
      sender: 'me',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read',
    },
    {
      id: '3',
      text: "That sounds awesome! I'd love to hear more about your projects.",
      sender: 'other',
      timestamp: new Date(Date.now() - 3400000),
      status: 'read',
    },
    {
      id: '4',
      text: "Sure! I'm building an AI personal assistant with React and it's been quite a journey.",
      sender: 'me',
      timestamp: new Date(Date.now() - 3300000),
      status: 'read',
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatUser: ChatUser = {
    id: '1',
    name: 'Sarah Johnson',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: currentMessage.trim(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
      };

      setMessages((prev) => [...prev, newMessage]);
      setCurrentMessage('');

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
        };
        setMessages((prev) => [...prev, responseMessage]);
      }, 4000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <div className='chat-container'>
      {/* Chat Header */}
      <div className='chat-header'>
        <div className='chat-header-left'>
          <Button
            icon={<FaArrowLeft />}
            className='p-button-text chat-back-btn'
            onClick={() => window.history.back()}
          />
          <Avatar
            image={chatUser.avatar}
            label={chatUser.name.charAt(0)}
            className='chat-avatar'
            size='large'
            shape='circle'
          />
          <div className='chat-user-info'>
            <h3 className='chat-user-name'>{chatUser.name}</h3>
            <span className='chat-user-status'>
              {chatUser.isOnline
                ? 'Online'
                : `Last seen ${formatTime(chatUser.lastSeen || new Date())}`}
            </span>
          </div>
        </div>
        <div className='chat-header-right'>
          <Button
            icon={<BsThreeDotsVertical />}
            className='p-button-text chat-menu-btn'
          />
        </div>
      </div>

      <Divider className='m-0' />

      {/* Messages Area */}
      <div className='messages-container'>
        <div className='messages-list'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender === 'me' ? 'message-sent' : 'message-received'}`}
            >
              <div className='message-bubble'>
                <p className='message-text'>{message.text}</p>
                <div className='message-meta'>
                  <span className='message-time'>
                    {formatTime(message.timestamp)}
                  </span>
                  {message.sender === 'me' && (
                    <span
                      className={`message-status ${message.status === 'read' ? 'read' : ''}`}
                    >
                      {getStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
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

      {/* Message Input Area */}
      <div className='message-input-container'>
        <div className='message-input-wrapper'>
          <Button
            icon={<FaPaperclip />}
            className='p-button-text attachment-btn'
          />
          <div className='message-input-field'>
            <InputText
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type a message...'
              className='message-input'
            />
            <Button
              icon={<FaSmile />}
              className='p-button-text emoji-btn'
            />
          </div>
          {currentMessage.trim() ? (
            <Button
              icon={<FaPaperPlane />}
              className='send-btn'
              onClick={handleSendMessage}
            />
          ) : (
            <Button
              icon={<FaMicrophone />}
              className='voice-btn'
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
