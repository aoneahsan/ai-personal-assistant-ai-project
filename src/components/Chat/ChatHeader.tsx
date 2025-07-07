import { useVoiceCall } from '@/hooks/useVoiceCall';
import { FeedbackModule } from '@/modules/FeedbackModule/components/FeedbackModule';
import { auth, db } from '@/services/firebase';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useNavigate } from '@tanstack/react-router';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';
import React, { useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaArrowLeft, FaPhone, FaVideo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ChatUser } from './types';
import VoiceCallModal from './VoiceCallModal';

interface ChatHeaderProps {
  chatUser: ChatUser;
  chatId?: string;
  onBack?: () => void;
  onClearChat?: () => void;
  onDeleteChat?: () => void;
  onBlockUser?: () => void;
  onMuteNotifications?: (muted: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatUser,
  chatId,
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
  const navigate = useNavigate();

  // Voice call functionality
  const {
    callState,
    isCallModalVisible,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    closeCallModal,
    isInCall,
  } = useVoiceCall({
    onIncomingCall: (callSession) => {
      toast.info(
        `Incoming call from ${callSession.initiatorEmail.split('@')[0]}`
      );
    },
    onCallStateChange: (state) => {
      console.log('Call state changed:', state.connectionState);
    },
  });

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
      navigate({ to: ROUTES.DASHBOARD_CHATS });
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    menuRef.current?.toggle(e);
  };

  const handleConfirmAction = (action: string) => {
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

  // Handle voice call initiation
  const handleVoiceCall = async () => {
    if (isInCall) {
      toast.info('Already in a call');
      return;
    }

    if (!chatId) {
      toast.error('Chat ID not available');
      return;
    }

    try {
      await initiateCall(chatUser.id, `${chatUser.name}@example.com`, chatId);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  // Handle video call (placeholder for future implementation)
  const handleVideoCall = () => {
    toast.info('Video calling coming soon!');
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
      command: () => handleConfirmAction('clear'),
    },
    {
      label: 'Delete Chat',
      icon: 'pi pi-trash',
      command: () => handleConfirmAction('delete'),
    },
    {
      separator: true,
    },
    {
      label: 'Block Contact',
      icon: 'pi pi-ban',
      command: () => handleConfirmAction('block'),
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
            <p className='chat-user-status'>
              {chatUser.isOnline ? (
                <span className='online-indicator'>
                  <span className='status-dot online'></span>
                  Online
                </span>
              ) : (
                <span className='offline-indicator'>
                  Last seen {formatTime(chatUser.lastSeen)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className='chat-header-right'>
          {/* Voice Call Button */}
          <Button
            icon={<FaPhone />}
            className={`p-button-text call-btn ${isInCall ? 'in-call' : ''}`}
            onClick={handleVoiceCall}
            disabled={isInCall}
            tooltip={isInCall ? 'In call' : 'Voice call'}
            tooltipOptions={{ position: 'bottom' }}
          />

          {/* Video Call Button */}
          <Button
            icon={<FaVideo />}
            className='p-button-text call-btn'
            onClick={handleVideoCall}
            tooltip='Video call'
            tooltipOptions={{ position: 'bottom' }}
          />

          {/* Menu Button */}
          <Button
            icon={<BsThreeDotsVertical />}
            className='p-button-text menu-btn'
            onClick={handleMenuClick}
            tooltip='More options'
            tooltipOptions={{ position: 'bottom' }}
          />

          <Menu
            ref={menuRef}
            model={menuItems}
            popup
            className='chat-menu'
          />
        </div>
      </div>

      {/* Voice Call Modal */}
      <VoiceCallModal
        isVisible={isCallModalVisible}
        callState={callState}
        onAnswer={answerCall}
        onDecline={declineCall}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onClose={closeCallModal}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        message={getConfirmMessage()}
        header={getConfirmHeader()}
        accept={executeAction}
        reject={() => setShowConfirmDialog(false)}
        acceptClassName='p-button-danger'
        rejectClassName='p-button-text'
        acceptLabel='Yes'
        rejectLabel='Cancel'
      />

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModule
          firestore={db}
          user={firebaseUser}
          config={{
            theme: 'auto',
            position: 'center',
            hideAfterSubmit: true,
            onSuccess: () => {
              setShowFeedbackModal(false);
              toast.success('Thank you for your feedback!');
            },
            onError: (error) => {
              console.error('Feedback error:', error);
              toast.error('Failed to submit feedback');
            },
          }}
          customPosition='header'
        />
      )}
    </>
  );
};

export default ChatHeader;
