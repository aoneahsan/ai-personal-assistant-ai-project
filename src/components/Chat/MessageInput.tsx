import { Capacitor } from '@capacitor/core';
import EmojiPicker from 'emoji-picker-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useRef, useState } from 'react';
import { FaPaperclip, FaPaperPlane, FaSmile } from 'react-icons/fa';
import {
  FileInfo,
  handleWebFileInput,
  pickImageFromGallery,
  saveBlobToDevice,
  takePhoto,
} from '../../utils/helpers/capacitorApis/fileManager';
import VideoRecorder from './VideoRecorder';
import VoiceRecording from './VoiceRecording';
import { Message } from './types';

interface EmojiObject {
  emoji: string;
  names?: string[];
  unified?: string;
}

interface ExtendedFile extends File {
  actualUrl?: string;
}

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
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPanelRef = useRef<OverlayPanel>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check platform
  const isNative = Capacitor.isNativePlatform();

  const handleSendMessage = () => {
    if (currentMessage.trim() && !disabled) {
      onSendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiObject: EmojiObject) => {
    onMessageChange(currentMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(e.target.value);
    adjustTextareaHeight();
  };

  // Handle camera capture directly
  const handleCameraCapture = async () => {
    if (isProcessingFile) return;

    setShowAttachmentDialog(false);
    setIsProcessingFile(true);

    try {
      const fileInfo = await takePhoto({
        quality: 90,
        allowEditing: false,
      });
      await handleFileMessage(fileInfo, 'image');
    } catch (error) {
      console.error('Camera capture failed:', error);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle gallery image selection
  const handleGallerySelect = async () => {
    if (isProcessingFile) return;

    setShowAttachmentDialog(false);
    setIsProcessingFile(true);

    try {
      const fileInfo = await pickImageFromGallery({
        quality: 90,
        allowEditing: false,
      });
      await handleFileMessage(fileInfo, 'image');
    } catch (error) {
      console.error('Gallery selection failed:', error);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle web file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || isProcessingFile) return;

    setShowAttachmentDialog(false);
    setIsProcessingFile(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileInfo = await handleWebFileInput(file);

        let messageType: Message['type'] = 'file';
        if (file.type.startsWith('image/')) {
          messageType = 'image';
        } else if (file.type.startsWith('video/')) {
          messageType = 'video';
        }

        await handleFileMessage(fileInfo, messageType);
      }
    } catch (error) {
      console.error('File selection failed:', error);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Create message from file info
  const handleFileMessage = async (
    fileInfo: FileInfo,
    messageType: Message['type']
  ) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: messageType,
      fileData: {
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.type,
        url: fileInfo.url,
      },
    };

    if (messageType === 'video') {
      newMessage.videoDuration = 0;
    }

    if (messageType === 'video' && onSendVideoMessage) {
      onSendVideoMessage(newMessage);
    } else {
      const mockFile = new File([new Blob()], fileInfo.name, {
        type: fileInfo.type,
      }) as ExtendedFile;
      Object.defineProperty(mockFile, 'size', { value: fileInfo.size });

      const mockFileList = Object.create(FileList.prototype);
      Object.defineProperty(mockFileList, 'length', { value: 1 });
      Object.defineProperty(mockFileList, '0', { value: mockFile });
      Object.defineProperty(mockFileList, 'item', {
        value: (index: number) => (index === 0 ? mockFile : null),
      });

      onFileUpload(mockFileList as FileList);
    }
  };

  const handleVideoRecorded = async (
    videoBlob: Blob,
    videoDuration: number,
    thumbnail?: string
  ) => {
    try {
      const videoFile = await saveBlobToDevice(videoBlob, 'recorded_video.mp4');

      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: 'video',
        fileData: {
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          url: videoFile.url,
        },
        videoDuration,
        videoThumbnail: thumbnail,
      };

      if (onSendVideoMessage) {
        onSendVideoMessage(newMessage);
      }
    } catch (error) {
      console.error('Failed to save video:', error);
    }

    setShowVideoRecorder(false);
  };

  const getAttachmentOptions = () => [
    {
      id: 'camera',
      label: 'Take Photo',
      description: 'Capture a photo with your camera',
      icon: '📸',
      action: handleCameraCapture,
      disabled: !isNative,
    },
    {
      id: 'gallery',
      label: 'Choose from Gallery',
      description: 'Select photos or videos from your gallery',
      icon: '🖼️',
      action: isNative
        ? handleGallerySelect
        : () => fileInputRef.current?.click(),
      disabled: false,
    },
    {
      id: 'file',
      label: 'Upload File',
      description: 'Share documents, audio, or other files',
      icon: '📎',
      action: () => fileInputRef.current?.click(),
      disabled: false,
    },
    {
      id: 'video',
      label: 'Record Video',
      description: 'Record a video message',
      icon: '🎥',
      action: () => {
        setShowAttachmentDialog(false);
        setShowVideoRecorder(true);
      },
      disabled: false,
    },
  ];

  return (
    <>
      <div className='message-input-container'>
        <div className='message-input-wrapper'>
          {/* Attachment Button */}
          <Button
            icon={<FaPaperclip />}
            className='attachment-btn'
            onClick={() => setShowAttachmentDialog(true)}
            disabled={disabled || isProcessingFile}
            tooltip='Attach files'
            tooltipOptions={{ position: 'top' }}
          />

          {/* Message Input */}
          <textarea
            ref={textareaRef}
            className='message-input'
            placeholder='Type a message...'
            value={currentMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
          />

          {/* Input Actions */}
          <div className='input-actions'>
            {/* Emoji Button */}
            <Button
              icon={<FaSmile />}
              className='emoji-btn'
              onClick={(e) => {
                setShowEmojiPicker(!showEmojiPicker);
                emojiPanelRef.current?.toggle(e);
              }}
              disabled={disabled}
              tooltip='Add emoji'
              tooltipOptions={{ position: 'top' }}
            />

            {/* Voice Recording Component */}
            <VoiceRecording
              onSendAudioMessage={onSendAudioMessage}
              disabled={disabled}
            />

            {/* Send Button */}
            <Button
              icon={<FaPaperPlane />}
              className='send-btn'
              onClick={handleSendMessage}
              disabled={disabled || !currentMessage.trim()}
              tooltip='Send message'
              tooltipOptions={{ position: 'top' }}
            />
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessingFile && (
          <div className='processing-indicator'>
            <ProgressSpinner />
            <span>Processing file...</span>
          </div>
        )}
      </div>

      {/* Emoji Picker Overlay */}
      <OverlayPanel
        ref={emojiPanelRef}
        className='emoji-panel'
        showCloseIcon={false}
        dismissable={true}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={false}
          height={350}
          width={300}
          searchDisabled={false}
          skinTonesDisabled={false}
          previewConfig={{
            showPreview: false,
          }}
        />
      </OverlayPanel>

      {/* Attachment Options Dialog */}
      <Dialog
        visible={showAttachmentDialog}
        onHide={() => setShowAttachmentDialog(false)}
        header='Share Content'
        modal
        style={{ width: '90vw', maxWidth: '500px' }}
        className='attachment-dialog modern-dialog'
      >
        <div className='attachment-options-grid'>
          {getAttachmentOptions().map((option) => (
            <div
              key={option.id}
              className={`attachment-option-card ${option.disabled ? 'disabled' : ''}`}
              onClick={option.disabled ? undefined : option.action}
            >
              <div className='option-illustration'>
                <span
                  className='option-emoji'
                  role='img'
                  aria-label={option.label}
                >
                  {option.icon}
                </span>
              </div>
              <div className='option-content'>
                <h4 className='option-title'>{option.label}</h4>
                <p className='option-description'>{option.description}</p>
              </div>
              {option.disabled && (
                <div className='option-badge'>
                  <span>Mobile Only</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Dialog>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Video Recorder */}
      {showVideoRecorder && (
        <VideoRecorder
          onVideoRecorded={handleVideoRecorded}
          onClose={() => setShowVideoRecorder(false)}
        />
      )}
    </>
  );
};

export default MessageInput;
