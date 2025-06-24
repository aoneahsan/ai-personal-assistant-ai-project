import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import React, { useRef } from 'react';
import {
  FaDownload,
  FaEllipsisV,
  FaFile,
  FaPause,
  FaPlay,
  FaVideo,
} from 'react-icons/fa';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  playingAudioId: string | null;
  onAudioToggle: (messageId: string, audioUrl: string) => void;
  onShowTranscript: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  playingAudioId,
  onAudioToggle,
  onShowTranscript,
}) => {
  const audioMenuRef = useRef<Menu>(null);

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

  const renderTextMessage = () => (
    <div className='message-bubble'>
      <p className='message-text'>{message.text}</p>
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
    <div className='message-bubble message-media'>
      <img
        src={message.fileData?.url}
        alt={message.fileData?.name}
        className='message-image'
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
        <Button
          icon={playingAudioId === message.id ? <FaPause /> : <FaPlay />}
          className='audio-play-btn'
          size='small'
          onClick={() => onAudioToggle(message.id, message.fileData?.url || '')}
        />
        <div className='audio-waveform'>
          <div className='audio-progress'></div>
        </div>
        <span className='audio-duration'>
          {formatDuration(message.audioDuration || 0)}
        </span>
        <Button
          icon={<FaEllipsisV />}
          className='audio-menu-btn'
          size='small'
          onClick={(e) => audioMenuRef.current?.toggle(e)}
        />
        <Menu
          ref={audioMenuRef}
          model={getAudioMenuItems()}
          popup
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

  const renderMessage = () => {
    switch (message.type) {
      case 'text':
        return renderTextMessage();
      case 'image':
        return renderImageMessage();
      case 'audio':
        return renderAudioMessage();
      case 'file':
      case 'video':
        return renderFileMessage();
      default:
        return renderTextMessage();
    }
  };

  return renderMessage();
};

export default MessageBubble;
