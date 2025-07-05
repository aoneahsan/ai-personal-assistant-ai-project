import { FirestoreMessage } from '@/services/chatService';
import { featureFlagService } from '@/services/featureFlagService';
import { ChatFeatureFlag } from '@/types/user/subscription';
import { useUserDataZState } from '@/zustandStates/userState';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import { MenuItem } from 'primereact/menuitem';
import { Tag } from 'primereact/tag';
import React, { useRef } from 'react';
import { FaDownload, FaFile, FaVideo } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer';
import { Message } from './types';
import VideoPlayer from './VideoPlayer';

// Extended message interface with additional properties
interface ExtendedMessage extends Message {
  isEdited?: boolean;
  lastEditedAt?: Date;
  editHistory?: Array<{
    editedAt: Date;
    editedBy: string;
    editorId: string;
    editorEmail: string;
    previousText: string;
    editReason?: string;
  }>;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

// Template item interface for context menu
interface MenuItemTemplate {
  label: string;
  icon: string;
  className?: string;
  command?: () => void;
  template?: (item: MenuItemTemplate) => React.ReactNode;
}

interface MessageBubbleProps {
  message: Message;
  playingAudioId: string | null;
  onAudioToggle: (messageId: string, audioUrl: string) => void;
  onShowTranscript: (messageId: string) => void;
  onEditMessage?: (message: FirestoreMessage) => void;
  onDeleteMessage?: (message: FirestoreMessage) => void;
  onViewHistory?: (message: FirestoreMessage) => void;
  onUpgrade?: (feature: ChatFeatureFlag) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  playingAudioId,
  onAudioToggle,
  onShowTranscript,
  onEditMessage,
  onDeleteMessage,
  onViewHistory,
  onUpgrade,
}) => {
  const contextMenuRef = useRef<ContextMenu>(null);
  const currentUser = useUserDataZState((state) => state.data);
  const extendedMessage = message as ExtendedMessage;

  // Convert message to FirestoreMessage format with all required properties
  const firestoreMessage: FirestoreMessage = {
    id: message.id,
    chatId: 'current-chat', // Add missing chatId property
    text: message.text,
    senderId: message.sender === 'me' ? currentUser?.id || '' : 'other-user',
    senderEmail:
      message.sender === 'me' ? currentUser?.email || '' : 'other@example.com',
    type: message.type,
    timestamp: message.timestamp,
    status: message.status || 'sent',
    isEdited: extendedMessage.isEdited,
    lastEditedAt: extendedMessage.lastEditedAt,
    editHistory: extendedMessage.editHistory,
    isDeleted: extendedMessage.isDeleted,
    deletedAt: extendedMessage.deletedAt,
    deletedBy: extendedMessage.deletedBy,
    // Media properties with proper typing
    fileData: message.fileData
      ? {
          name: message.fileData.name,
          size: message.fileData.size,
          type: message.fileData.type,
          url: message.fileData.url,
          uploadedAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        }
      : undefined,
    audioDuration: message.audioDuration,
    videoDuration: message.videoDuration,
    videoThumbnail: message.videoThumbnail,
    quickTranscript: message.quickTranscript,
    transcript: message.transcript,
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (message.sender === 'me' && contextMenuRef.current) {
      contextMenuRef.current.show(event);
    }
  };

  const createPremiumTemplate = (item: MenuItemTemplate): React.ReactNode => (
    <div className='p-menuitem-link premium-feature'>
      <i className={item.icon}></i>
      <span>{item.label}</span>
      <span className='premium-feature-badge'>PRO</span>
    </div>
  );

  const getContextMenuItems = (): MenuItem[] => {
    const canEdit = featureFlagService.canEditMessages(currentUser);
    const canDelete = featureFlagService.canDeleteMessages(currentUser);
    const canHistory = featureFlagService.canViewMessageHistory(currentUser);

    const items: MenuItem[] = [];

    // Copy message option (always available)
    items.push({
      label: 'Copy Message',
      icon: 'pi pi-copy',
      command: () => {
        if (message.text) {
          navigator.clipboard.writeText(message.text);
        }
      },
    });

    // Edit message option
    if (message.type === 'text' && !extendedMessage.isDeleted) {
      if (canEdit) {
        items.push({
          label: 'Edit Message',
          icon: 'pi pi-pencil',
          command: () => onEditMessage?.(firestoreMessage),
        });
      } else {
        const editItem: MenuItemTemplate = {
          label: 'Edit Message',
          icon: 'pi pi-pencil',
          className: 'premium-feature',
          command: () => onUpgrade?.(ChatFeatureFlag.MESSAGE_EDITING),
        };
        items.push({
          ...editItem,
          template: () => createPremiumTemplate(editItem),
        });
      }
    }

    // Delete message option
    if (!extendedMessage.isDeleted) {
      if (canDelete) {
        items.push({
          label: 'Delete Message',
          icon: 'pi pi-trash',
          command: () => onDeleteMessage?.(firestoreMessage),
        });
      } else {
        const deleteItem: MenuItemTemplate = {
          label: 'Delete Message',
          icon: 'pi pi-trash',
          className: 'premium-feature',
          command: () => onUpgrade?.(ChatFeatureFlag.MESSAGE_DELETION),
        };
        items.push({
          ...deleteItem,
          template: () => createPremiumTemplate(deleteItem),
        });
      }
    }

    // View history option (only for edited messages)
    if (extendedMessage.isEdited) {
      if (canHistory) {
        items.push({
          label: 'View Edit History',
          icon: 'pi pi-history',
          command: () => onViewHistory?.(firestoreMessage),
        });
      } else {
        const historyItem: MenuItemTemplate = {
          label: 'View Edit History',
          icon: 'pi pi-history',
          className: 'premium-feature',
          command: () => onUpgrade?.(ChatFeatureFlag.MESSAGE_HISTORY),
        };
        items.push({
          ...historyItem,
          template: () => createPremiumTemplate(historyItem),
        });
      }
    }

    return items;
  };

  const renderEditIndicator = () => {
    if (!extendedMessage.isEdited) return null;

    return (
      <div className='message-edit-indicator'>
        <Tag
          value='edited'
          severity='info'
          icon='pi pi-pencil'
          className='text-xs'
          style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}
        />
      </div>
    );
  };

  const renderTextMessage = () => (
    <div
      className='message-bubble'
      onContextMenu={handleContextMenu}
      style={{ position: 'relative' }}
    >
      {(message as ExtendedMessage).isDeleted ? (
        <p className='message-text deleted-message'>
          <i className='pi pi-trash mr-2'></i>
          This message was deleted
        </p>
      ) : (
        <p className='message-text'>{message.text}</p>
      )}

      {renderEditIndicator()}

      <div className='message-meta'>
        <span className='message-time'>{formatTime(message.timestamp)}</span>
        {message.sender === 'me' && (
          <span
            className={`message-status ${message.status === 'read' ? 'read' : ''}`}
          >
            {getStatusIcon(message.status)}
          </span>
        )}
      </div>
    </div>
  );

  const renderImageMessage = () => (
    <div
      className='message-bubble message-media'
      onContextMenu={handleContextMenu}
    >
      <img
        src={message.fileData?.url}
        alt={message.fileData?.name}
        className='message-image'
      />
      {renderEditIndicator()}
      <div className='message-meta'>
        <span className='message-time'>{formatTime(message.timestamp)}</span>
        {message.sender === 'me' && (
          <span
            className={`message-status ${message.status === 'read' ? 'read' : ''}`}
          >
            {getStatusIcon(message.status)}
          </span>
        )}
      </div>
    </div>
  );

  const renderVideoMessage = () => (
    <div
      className='message-bubble message-video'
      onContextMenu={handleContextMenu}
    >
      <VideoPlayer
        videoUrl={message.fileData?.url || ''}
        thumbnail={message.videoThumbnail}
        duration={message.videoDuration || 0}
        fileName={message.fileData?.name}
      />
      {renderEditIndicator()}
      <div className='message-meta'>
        <span className='message-time'>{formatTime(message.timestamp)}</span>
        {message.sender === 'me' && (
          <span
            className={`message-status ${message.status === 'read' ? 'read' : ''}`}
          >
            {getStatusIcon(message.status)}
          </span>
        )}
      </div>
    </div>
  );

  const renderAudioMessage = () => (
    <div
      className='message-bubble message-audio'
      onContextMenu={handleContextMenu}
    >
      <div className='audio-message'>
        <AudioPlayer
          audioUrl={message.fileData?.url || ''}
          duration={message.audioDuration || 0}
          isPlaying={playingAudioId === message.id}
          messageId={message.id}
          onTogglePlay={() =>
            onAudioToggle(message.id, message.fileData?.url || '')
          }
          onShowTranscript={() => onShowTranscript(message.id)}
          transcript={message.transcript}
          fileName={message.fileData?.name}
        />
      </div>

      {/* Quick transcript preview */}
      {message.quickTranscript && (
        <div
          className='audio-transcript-preview'
          onClick={() => onShowTranscript(message.id)}
          role='button'
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onShowTranscript(message.id);
            }
          }}
        >
          <span className='transcript-preview-text'>
            "{message.quickTranscript}"
          </span>
          <span className='transcript-preview-hint'>
            Click to read full transcript
          </span>
        </div>
      )}

      {renderEditIndicator()}
      <div className='message-meta'>
        <span className='message-time'>{formatTime(message.timestamp)}</span>
        {message.sender === 'me' && (
          <span
            className={`message-status ${message.status === 'read' ? 'read' : ''}`}
          >
            {getStatusIcon(message.status)}
          </span>
        )}
      </div>
    </div>
  );

  const renderFileMessage = () => {
    const getFileIcon = () => {
      if (message.type === 'video') return <FaVideo />;
      if (message.fileData?.type.includes('pdf')) return <FaFile />;
      return <FaFile />;
    };

    return (
      <div
        className='message-bubble message-file'
        onContextMenu={handleContextMenu}
      >
        <div className='file-message'>
          <div className='file-icon'>{getFileIcon()}</div>
          <div className='file-info'>
            <span className='file-name'>{message.fileData?.name}</span>
            <span className='file-size'>
              {formatFileSize(message.fileData?.size || 0)}
            </span>
          </div>
          <Button
            icon={<FaDownload />}
            className='p-button-text file-download-btn'
            size='small'
          />
        </div>
        {renderEditIndicator()}
        <div className='message-meta'>
          <span className='message-time'>{formatTime(message.timestamp)}</span>
          {message.sender === 'me' && (
            <span
              className={`message-status ${message.status === 'read' ? 'read' : ''}`}
            >
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>
    );
  };

  // At the end of the component, add the context menu
  const renderContextMenu = () => (
    <ContextMenu
      ref={contextMenuRef}
      model={getContextMenuItems()}
      className='message-context-menu'
    />
  );

  return (
    <div className={`message ${message.sender}`}>
      {message.type === 'text' && renderTextMessage()}
      {message.type === 'image' && renderImageMessage()}
      {message.type === 'video' && renderVideoMessage()}
      {message.type === 'audio' && renderAudioMessage()}
      {message.type === 'file' && renderFileMessage()}

      {/* Context Menu */}
      {message.sender === 'me' && renderContextMenu()}
    </div>
  );
};

export default MessageBubble;
