import { FirestoreMessage } from '@/services/chatService';
import { featureFlagService } from '@/services/featureFlagService';
import { ChatFeatureFlag } from '@/types/user/subscription';
import { useUserDataZState } from '@/zustandStates/userState';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Tag } from 'primereact/tag';
import React, { useRef } from 'react';
import { FaDownload, FaFile, FaVideo } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import { Message } from './types';

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
  const audioMenuRef = useRef<Menu>(null);
  const contextMenuRef = useRef<Menu>(null);
  const currentUser = useUserDataZState((state) => state.data);

  // Convert Message to FirestoreMessage for compatibility
  const firestoreMessage: FirestoreMessage = {
    id: message.id,
    chatId: '', // This would be populated in a real scenario
    senderId: message.sender === 'me' ? currentUser?.id || '' : 'other',
    senderEmail: message.sender === 'me' ? currentUser?.email || '' : '',
    text: message.text,
    type: message.type,
    timestamp: message.timestamp,
    status: message.status || 'sent',
    // Add edit/delete properties if they exist
    isEdited: (message as any).isEdited,
    lastEditedAt: (message as any).lastEditedAt,
    editHistory: (message as any).editHistory,
    isDeleted: (message as any).isDeleted,
    deletedAt: (message as any).deletedAt,
    deletedBy: (message as any).deletedBy,
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    if (message.sender === 'me') {
      // For now, show basic context menu options
      const canEdit = featureFlagService.canEditMessages(currentUser);
      const canDelete = featureFlagService.canDeleteMessages(currentUser);

      if (
        canEdit.hasAccess &&
        message.type === 'text' &&
        !(message as any).isDeleted
      ) {
        onEditMessage?.(firestoreMessage);
      } else if (canDelete.hasAccess && !(message as any).isDeleted) {
        onDeleteMessage?.(firestoreMessage);
      } else {
        // Show upgrade prompt
        onUpgrade?.(
          canEdit.hasAccess
            ? ChatFeatureFlag.MESSAGE_DELETION
            : ChatFeatureFlag.MESSAGE_EDITING
        );
      }
    }
  };

  const handleUpgradeClick = (feature: ChatFeatureFlag) => {
    onUpgrade?.(feature);
  };

  const getAudioMenuItems = () => [
    {
      label: 'Read Transcript',
      icon: 'pi pi-file-word',
      command: () => onShowTranscript(message.id),
    },
    {
      label: 'Download Audio',
      icon: 'pi pi-download',
      command: () => {
        if (message.fileData?.url) {
          const link = document.createElement('a');
          link.href = message.fileData.url;
          link.download = message.fileData.name || 'audio-message.webm';
          link.click();
        }
      },
    },
    {
      label: 'Copy Transcript',
      icon: 'pi pi-copy',
      command: () => {
        if (message.transcript) {
          const fullText = message.transcript.map((seg) => seg.text).join(' ');
          navigator.clipboard.writeText(fullText);
        }
      },
    },
  ];

  const renderEditIndicator = () => {
    if (!(message as any).isEdited) return null;

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
      {(message as any).isDeleted ? (
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
    <div className='message-bubble message-video'>
      <VideoPlayer
        videoUrl={message.fileData?.url || ''}
        thumbnail={message.videoThumbnail}
        duration={message.videoDuration || 0}
        fileName={message.fileData?.name}
      />
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
    <div className='message-bubble message-audio'>
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
      <div className='message-bubble message-file'>
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

  return (
    <div className={`message ${message.sender}`}>
      {message.type === 'text' && renderTextMessage()}
      {message.type === 'image' && renderImageMessage()}
      {message.type === 'video' && renderVideoMessage()}
      {message.type === 'audio' && renderAudioMessage()}
      {message.type === 'file' && renderFileMessage()}
    </div>
  );
};

export default MessageBubble;
