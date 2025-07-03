import { FeedbackButton } from '@/modules/FeedbackModule/components/FeedbackButton';
import { FeedbackModule } from '@/modules/FeedbackModule/components/FeedbackModule';
import { auth, db } from '@/services/firebase';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import React, { useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaArrowLeft, FaPhone, FaVideo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ChatUser } from './types';

interface ChatHeaderProps {
  chatUser: ChatUser;
  onBack?: () => void;
  onClearChat?: () => void;
  onDeleteChat?: () => void;
  onBlockUser?: () => void;
  onMuteNotifications?: (muted: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatUser,
  onBack,
  onClearChat,
  onDeleteChat,
  onBlockUser,
  onMuteNotifications,
}) => {
  const firebaseUser = auth.currentUser;
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const menuRef = useRef<Menu>(null);
  const location = useLocation();
  const navigate = useNavigate();

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
      navigate({ to: '/chats' });
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    menuRef.current?.toggle(e);
  };

  const handleConfirmAction = (action: string, message: string) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = () => {
    setShowConfirmDialog(false);

    switch (confirmAction) {
      case 'clear':
        onClearChat?.();
        toast.success('Chat cleared successfully');
        break;
      case 'delete':
        onDeleteChat?.();
        toast.success('Chat deleted successfully');
        break;
      case 'block':
        onBlockUser?.();
        toast.success(`${chatUser.name} has been blocked`);
        break;
      default:
        break;
    }
  };

  const handleMuteToggle = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    onMuteNotifications?.(newMuteState);
    toast.success(
      newMuteState ? 'Notifications muted' : 'Notifications unmuted'
    );
  };

  const handleFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  const menuItems: MenuItem[] = [
    {
      label: 'View Contact',
      icon: 'pi pi-user',
      command: () => {
        toast.info('Contact details coming soon!');
      },
    },
    {
      label: 'Media, Links, and Docs',
      icon: 'pi pi-images',
      command: () => {
        toast.info('Shared media browser coming soon!');
      },
    },
    {
      separator: true,
    },
    {
      label: isMuted ? 'Unmute Notifications' : 'Mute Notifications',
      icon: isMuted ? 'pi pi-volume-up' : 'pi pi-volume-off',
      command: handleMuteToggle,
    },
    {
      label: 'Search Messages',
      icon: 'pi pi-search',
      command: () => {
        toast.info('Message search coming soon!');
      },
    },
    {
      separator: true,
    },
    {
      label: 'Clear Chat',
      icon: 'pi pi-eraser',
      command: () =>
        handleConfirmAction(
          'clear',
          'Are you sure you want to clear this chat? This action cannot be undone.'
        ),
    },
    {
      label: 'Delete Chat',
      icon: 'pi pi-trash',
      command: () =>
        handleConfirmAction(
          'delete',
          'Are you sure you want to delete this chat? This action cannot be undone.'
        ),
    },
    {
      separator: true,
    },
    {
      label: 'Block Contact',
      icon: 'pi pi-ban',
      command: () =>
        handleConfirmAction(
          'block',
          `Are you sure you want to block ${chatUser.name}? You will no longer receive messages from this contact.`
        ),
      className: 'text-red-500',
    },
  ];

  const getConfirmMessage = () => {
    switch (confirmAction) {
      case 'clear':
        return 'Are you sure you want to clear this chat? This action cannot be undone.';
      case 'delete':
        return 'Are you sure you want to delete this chat? This action cannot be undone.';
      case 'block':
        return `Are you sure you want to block ${chatUser.name}? You will no longer receive messages from this contact.`;
      default:
        return '';
    }
  };

  const getConfirmHeader = () => {
    switch (confirmAction) {
      case 'clear':
        return 'Clear Chat';
      case 'delete':
        return 'Delete Chat';
      case 'block':
        return 'Block Contact';
      default:
        return 'Confirm Action';
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
            tooltip='Back to chats'
            tooltipOptions={{ position: 'bottom' }}
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
          <FeedbackButton
            onClick={handleFeedbackClick}
            variant='icon'
            className='chat-action-btn'
            tooltip='Share Feedback'
          />
          <Button
            icon={<FaVideo />}
            className='p-button-text chat-action-btn'
            tooltip='Video call'
            tooltipOptions={{ position: 'bottom' }}
            onClick={() => toast.info('Video calls coming soon!')}
          />
          <Button
            icon={<FaPhone />}
            className='p-button-text chat-action-btn'
            tooltip='Voice call'
            tooltipOptions={{ position: 'bottom' }}
            onClick={() => toast.info('Voice calls coming soon!')}
          />
          <Button
            icon={<BsThreeDotsVertical />}
            className='p-button-text chat-menu-btn'
            tooltip='More options'
            tooltipOptions={{ position: 'bottom' }}
            onClick={handleMenuClick}
          />
        </div>
      </div>
      <Divider className='m-0' />

      {/* Chat Options Menu */}
      <Menu
        ref={menuRef}
        model={menuItems}
        popup
        className='chat-options-menu'
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        message={getConfirmMessage()}
        header={getConfirmHeader()}
        icon={
          confirmAction === 'block'
            ? 'pi pi-exclamation-triangle'
            : 'pi pi-question-circle'
        }
        accept={executeAction}
        reject={() => setShowConfirmDialog(false)}
        acceptLabel='Yes'
        rejectLabel='Cancel'
        acceptClassName={
          confirmAction === 'block' ? 'p-button-danger' : 'p-button-primary'
        }
      />

      {/* Feedback Module for Header */}
      {showFeedbackModal && (
        <FeedbackModule
          firestore={db}
          user={firebaseUser}
          config={{
            collectionName: 'user_feedback',
            theme: 'auto',
            position: 'center',
            hideAfterSubmit: true,
            requireMessage: false,
            showStep2: true,
            onSuccess: () => {
              setShowFeedbackModal(false);
              toast.success('Thank you for your feedback!');
            },
            onError: (error) => {
              console.error('Feedback error:', error);
              toast.error('Failed to submit feedback. Please try again.');
            },
          }}
          customPosition='header'
          autoShow={true}
          showDismissButton={false}
        />
      )}
    </>
  );
};

export default ChatHeader;
