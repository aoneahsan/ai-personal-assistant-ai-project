import EmojiPicker from 'emoji-picker-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useRef, useState } from 'react';
import {
  FaCamera,
  FaFile,
  FaPaperPlane,
  FaSmile,
  FaVideo,
} from 'react-icons/fa';
import VideoRecorder from './VideoRecorder';
import VoiceRecording from './VoiceRecording';
import { Message } from './types';

interface MessageInputProps {
  currentMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onSendAudioMessage: (message: Message) => void;
  onSendVideoMessage?: (message: Message) => void;
  onFileUpload: (files: FileList) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  currentMessage,
  onMessageChange,
  onSendMessage,
  onSendAudioMessage,
  onSendVideoMessage,
  onFileUpload,
  disabled = false,
}) => {
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

  const emojiPanelRef = useRef<OverlayPanel>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (currentMessage.trim() && !disabled) {
      onSendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    onMessageChange(currentMessage + emojiObject.emoji);
    emojiPanelRef.current?.hide();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
      setShowAttachmentDialog(false);
    }
  };

  const handleVideoRecorded = (
    videoBlob: Blob,
    videoDuration: number,
    thumbnail?: string
  ) => {
    const videoUrl = URL.createObjectURL(videoBlob);
    const videoMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: 'video',
      fileData: {
        name: `video-${Date.now()}.mp4`,
        size: videoBlob.size,
        type: videoBlob.type,
        url: videoUrl,
      },
      videoDuration,
      videoThumbnail: thumbnail,
    };

    onSendVideoMessage?.(videoMessage);
    setShowVideoRecorder(false);
  };

  return (
    <>
      <div className='message-input-container'>
        <div className='message-input-wrapper'>
          <Button
            icon={<FaFile />}
            className='attachment-btn'
            onClick={() => setShowAttachmentDialog(true)}
            disabled={disabled}
          />

          <div className='message-input-field'>
            <InputText
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder='Type a message...'
              className='message-input'
              onKeyPress={handleKeyPress}
              disabled={disabled}
            />
            <Button
              icon={<FaSmile />}
              className='emoji-btn'
              onClick={(e) => emojiPanelRef.current?.toggle(e)}
              disabled={disabled}
            />
          </div>

          {currentMessage.trim() ? (
            <Button
              icon={<FaPaperPlane />}
              className='send-btn'
              onClick={handleSendMessage}
              disabled={disabled}
            />
          ) : (
            <VoiceRecording
              onSendAudioMessage={onSendAudioMessage}
              disabled={disabled}
            />
          )}
        </div>
      </div>

      {/* Emoji Picker */}
      <OverlayPanel
        ref={emojiPanelRef}
        className='emoji-panel'
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </OverlayPanel>

      {/* Attachment Dialog */}
      <Dialog
        header='Send Attachment'
        visible={showAttachmentDialog}
        style={{ width: '400px' }}
        onHide={() => setShowAttachmentDialog(false)}
        className='attachment-dialog'
      >
        <div className='attachment-options'>
          <Button
            icon={<FaCamera />}
            label='Take Photo'
            className='p-button-outlined attachment-option-btn'
            onClick={() => {
              fileInputRef.current?.click();
              setShowAttachmentDialog(false);
            }}
          />

          <Button
            icon={<FaVideo />}
            label='Record Video'
            className='p-button-outlined attachment-option-btn'
            onClick={() => {
              setShowVideoRecorder(true);
              setShowAttachmentDialog(false);
            }}
          />

          <Button
            icon={<FaFile />}
            label='Choose File'
            className='p-button-outlined attachment-option-btn'
            onClick={() => {
              fileInputRef.current?.click();
              setShowAttachmentDialog(false);
            }}
          />

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*,video/*,.pdf,.doc,.docx'
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
          />

          <p className='attachment-help'>
            Select photos, videos, or documents to send
          </p>
        </div>
      </Dialog>

      {/* Video Recorder */}
      {showVideoRecorder && (
        <Dialog
          visible={showVideoRecorder}
          onHide={() => setShowVideoRecorder(false)}
          className='video-recorder-dialog'
          header={null}
          closable={false}
          style={{ width: '100vw', height: '100vh', margin: 0 }}
          contentStyle={{ padding: 0, height: '100%' }}
        >
          <VideoRecorder
            onVideoRecorded={handleVideoRecorded}
            onClose={() => setShowVideoRecorder(false)}
            maxDuration={60}
          />
        </Dialog>
      )}
    </>
  );
};

export default MessageInput;
