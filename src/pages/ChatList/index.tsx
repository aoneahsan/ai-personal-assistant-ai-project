import LimitationsModal from '@/components/Chat/LimitationsModal';
import UserSearch from '@/components/Chat/UserSearch';
import { unifiedAuthService } from '@/services/authService';
import { UserSearchResult } from '@/services/chatService';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import React, { useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaInfoCircle, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './index.scss';

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showLimitations, setShowLimitations] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<Menu>(null);

  const contacts: ChatContact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'That sounds really interesting! 😊',
      lastMessageTime: new Date(Date.now() - 300000),
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: "Let's schedule a meeting for next week",
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Thanks for the help today! 🙏',
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'The project looks great so far',
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '5',
      name: 'Lisa Wang',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Can you send me the files?',
      lastMessageTime: new Date(Date.now() - 172800000),
      unreadCount: 3,
      isOnline: true,
    },
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleChatClick = (contactId: string) => {
    navigate({ to: '/chat', search: { contactId } });
  };

  const handleUserFound = (user: UserSearchResult, chatId: string) => {
    // Navigate to the chat with the found user
    navigate({
      to: '/chat',
      search: {
        chatId,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
      },
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await unifiedAuthService.signOut();
      toast.success('Logged out successfully');
      // The auth system will automatically redirect to login page
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: 'New Group',
      icon: 'pi pi-users',
      command: () => {
        toast.info('Group chats coming soon!');
      },
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => {
        toast.info('Settings page coming soon!');
      },
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogout,
      className: isLoggingOut ? 'p-disabled' : '',
    },
  ];

  return (
    <div className='chat-list-container'>
      {/* Header */}
      <div className='chat-list-header'>
        <h2 className='chat-list-title'>Chats</h2>
        <div className='chat-list-actions'>
          <Button
            icon={<FaInfoCircle />}
            className='p-button-text header-btn'
            tooltip='Current Limitations'
            tooltipOptions={{ position: 'bottom' }}
            onClick={() => setShowLimitations(true)}
          />
          <Button
            icon={<FaSearch />}
            className='p-button-text header-btn'
            tooltip='Find User'
            tooltipOptions={{ position: 'bottom' }}
            onClick={() => setShowUserSearch(true)}
          />
          <Button
            icon={<BsThreeDotsVertical />}
            className='p-button-text header-btn'
            tooltip='Menu'
            tooltipOptions={{ position: 'bottom' }}
            onClick={(e) => menuRef.current?.toggle(e)}
          />
        </div>
      </div>

      <Divider className='m-0' />

      {/* Chat List */}
      <div className='chat-list-content'>
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className='chat-item'
            onClick={() => handleChatClick(contact.id)}
          >
            <div className='chat-item-avatar'>
              <Avatar
                image={contact.avatar}
                label={contact.name.charAt(0)}
                size='large'
                shape='circle'
                className='contact-avatar'
              />
              {contact.isOnline && <div className='online-indicator' />}
            </div>

            <div className='chat-item-content'>
              <div className='chat-item-header'>
                <h4 className='contact-name'>{contact.name}</h4>
                <span className='last-message-time'>
                  {formatTime(contact.lastMessageTime)}
                </span>
              </div>

              <div className='chat-item-footer'>
                <p className='last-message'>{contact.lastMessage}</p>
                {contact.unreadCount > 0 && (
                  <span className='unread-badge'>{contact.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <Button
        icon={<FaPlus />}
        className='fab-button'
        rounded
        tooltip='Start New Chat'
        tooltipOptions={{ position: 'top' }}
        onClick={() => setShowUserSearch(true)}
      />

      {/* Header Menu */}
      <Menu
        ref={menuRef}
        model={menuItems}
        popup
        className='chat-list-menu'
      />

      {/* User Search Modal */}
      <UserSearch
        visible={showUserSearch}
        onHide={() => setShowUserSearch(false)}
        onUserFound={handleUserFound}
      />

      {/* Limitations Modal */}
      <LimitationsModal
        visible={showLimitations}
        onHide={() => setShowLimitations(false)}
      />
    </div>
  );
};

export default ChatList;
