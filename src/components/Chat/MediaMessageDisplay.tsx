import { FirestoreMessage } from '@/services/chatService';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import React, { useRef, useState } from 'react';

interface MediaMessageDisplayProps {
  message: FirestoreMessage;
  isOwnMessage: boolean;
}

const MediaMessageDisplay: React.FC<MediaMessageDisplayProps> = ({
  message,
  isOwnMessage,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isFileExpired = (): boolean => {
    if (!message.fileData?.expiresAt) return false;
    return new Date() > new Date(message.fileData.expiresAt);
  };

  const renderImageMessage = () => (
    <div className='media-message image-message'>
      <div
        className='media-container cursor-pointer'
        onClick={() => setShowImageDialog(true)}
      >
        {isFileExpired() ? (
          <div className='expired-file-placeholder p-4 text-center border-1 border-300 border-round'>
            <i className='pi pi-image text-4xl text-300 mb-2'></i>
            <p className='text-500 m-0'>Image expired (10-day limit)</p>
          </div>
        ) : (
          <img
            src={message.fileData?.url}
            alt={message.fileData?.name}
            className='media-image max-w-full h-auto border-round'
            style={{ maxWidth: '300px', maxHeight: '200px' }}
            loading='lazy'
          />
        )}
      </div>

      <div className='media-info mt-2'>
        <div className='flex justify-content-between align-items-center'>
          <span className='text-sm text-500'>{message.fileData?.name}</span>
          <div className='flex gap-2'>
            {message.imageWidth && message.imageHeight && (
              <Tag
                value={`${message.imageWidth}×${message.imageHeight}`}
                severity='info'
              />
            )}
            <Tag
              value={formatFileSize(message.fileData?.size || 0)}
              severity='secondary'
            />
          </div>
        </div>
      </div>

      {/* Image Dialog */}
      <Dialog
        visible={showImageDialog}
        onHide={() => setShowImageDialog(false)}
        header={message.fileData?.name}
        style={{ width: '90vw', height: '90vh' }}
        dismissableMask
        maximizable
      >
        <div className='flex justify-content-center align-items-center h-full'>
          <img
            src={message.fileData?.url}
            alt={message.fileData?.name}
            className='max-w-full max-h-full'
          />
        </div>
      </Dialog>
    </div>
  );

  const renderAudioMessage = () => (
    <div className='media-message audio-message'>
      <div className='media-container'>
        {isFileExpired() ? (
          <div className='expired-file-placeholder p-4 text-center border-1 border-300 border-round'>
            <i className='pi pi-volume-up text-4xl text-300 mb-2'></i>
            <p className='text-500 m-0'>Audio expired (10-day limit)</p>
          </div>
        ) : (
          <audio
            ref={audioRef}
            controls
            className='w-full'
            style={{ maxWidth: '300px' }}
          >
            <source
              src={message.fileData?.url}
              type={message.fileData?.type}
            />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>

      <div className='media-info mt-2'>
        <div className='flex justify-content-between align-items-center mb-2'>
          <span className='text-sm text-500'>{message.fileData?.name}</span>
          <div className='flex gap-2'>
            {message.audioDuration && (
              <Tag
                value={formatDuration(message.audioDuration)}
                severity='info'
              />
            )}
            <Tag
              value={formatFileSize(message.fileData?.size || 0)}
              severity='secondary'
            />
          </div>
        </div>

        {/* Quick transcript preview */}
        {message.quickTranscript && (
          <div className='transcript-preview p-2 bg-surface-100 border-round'>
            <div className='flex justify-content-between align-items-start gap-2'>
              <p className='text-sm text-700 m-0 line-height-3'>
                📝 {message.quickTranscript}
              </p>
              {message.transcript && message.transcript.length > 0 && (
                <Button
                  label='Full Transcript'
                  size='small'
                  className='p-button-text p-button-sm'
                  onClick={() => setShowTranscript(true)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transcript Dialog */}
      <Dialog
        header='🎙️ Audio Transcript'
        visible={showTranscript}
        onHide={() => setShowTranscript(false)}
        style={{ width: '90vw', maxWidth: '600px' }}
        dismissableMask
      >
        <div className='transcript-content'>
          {message.transcript?.map((segment, index) => (
            <div
              key={index}
              className='transcript-segment mb-3 p-3 border-1 border-300 border-round'
            >
              <div className='flex justify-content-between align-items-center mb-2'>
                <span className='font-semibold text-primary'>
                  {formatDuration(segment.startTime)} -{' '}
                  {formatDuration(segment.endTime)}
                </span>
                <div className='flex gap-2'>
                  <Tag
                    value={`${Math.round(segment.confidence * 100)}% confidence`}
                    severity={segment.confidence > 0.8 ? 'success' : 'warning'}
                  />
                  {segment.speakerId && (
                    <Tag
                      value={segment.speakerId}
                      severity='info'
                    />
                  )}
                </div>
              </div>
              <p className='text-900 m-0 line-height-3'>{segment.text}</p>
            </div>
          ))}

          {(!message.transcript || message.transcript.length === 0) && (
            <p className='text-500 text-center m-0'>No transcript available</p>
          )}
        </div>
      </Dialog>
    </div>
  );

  const renderVideoMessage = () => (
    <div className='media-message video-message'>
      <div className='media-container'>
        {isFileExpired() ? (
          <div className='expired-file-placeholder p-4 text-center border-1 border-300 border-round'>
            <i className='pi pi-video text-4xl text-300 mb-2'></i>
            <p className='text-500 m-0'>Video expired (10-day limit)</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            className='w-full border-round'
            style={{ maxWidth: '300px', maxHeight: '200px' }}
            poster={message.videoThumbnail}
          >
            <source
              src={message.fileData?.url}
              type={message.fileData?.type}
            />
            Your browser does not support the video element.
          </video>
        )}
      </div>

      <div className='media-info mt-2'>
        <div className='flex justify-content-between align-items-center'>
          <span className='text-sm text-500'>{message.fileData?.name}</span>
          <div className='flex gap-2'>
            {message.videoDuration && (
              <Tag
                value={formatDuration(message.videoDuration)}
                severity='info'
              />
            )}
            <Tag
              value={formatFileSize(message.fileData?.size || 0)}
              severity='secondary'
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpiredInfo = () => (
    <div className='mt-2 p-2 bg-orange-50 border-left-3 border-orange-400 border-round'>
      <div className='flex align-items-center gap-2'>
        <i className='pi pi-exclamation-triangle text-orange-600'></i>
        <small className='text-orange-800'>
          This file was automatically deleted after 10 days to save storage
          space.
        </small>
      </div>
    </div>
  );

  switch (message.type) {
    case 'image':
      return (
        <div>
          {renderImageMessage()}
          {isFileExpired() && renderExpiredInfo()}
        </div>
      );

    case 'audio':
      return (
        <div>
          {renderAudioMessage()}
          {isFileExpired() && renderExpiredInfo()}
        </div>
      );

    case 'video':
      return (
        <div>
          {renderVideoMessage()}
          {isFileExpired() && renderExpiredInfo()}
        </div>
      );

    default:
      return null;
  }
};

export default MediaMessageDisplay;
