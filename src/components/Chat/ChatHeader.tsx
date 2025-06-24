import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import React from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { ChatUser } from './types';

interface ChatHeaderProps {
  chatUser: ChatUser;
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatUser, onBack }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      <div className='chat-header'>
        <div className='chat-header-left'>
          <Button
            icon={<FaArrowLeft />}
            className='p-button-text chat-back-btn'
            onClick={handleBack}
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
    </>
  );
};

export default ChatHeader;
