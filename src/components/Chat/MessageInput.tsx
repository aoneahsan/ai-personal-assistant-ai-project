import EmojiPicker from 'emoji-picker-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useRef, useState } from 'react';
import {
  FaCamera,
  FaFile,
  FaImage,
  FaPaperPlane,
  FaSmile,
  FaVideo,
} from 'react-icons/fa';
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

  // Handle camera capture directly
  const handleCameraCapture = async () => {
    if (isProcessingFile) return;

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

    setIsProcessingFile(true);
    try {
      const fileInfo = await pickImageFromGallery({
        quality: 90,
        allowEditing: false,
      });

      await handleFileMessage(fileInfo, 'image');
      setShowAttachmentDialog(false);
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
      setShowAttachmentDialog(false);
    } catch (error) {
      console.error('File selection failed:', error);
    } finally {
      setIsProcessingFile(false);
      // Reset file input
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

    // Add video duration if it's a video file
    if (messageType === 'video') {
      // For video files, we'll need to get duration from the video element
      // This is a placeholder - in real implementation you'd extract video metadata
      newMessage.videoDuration = 0;
    }

    // Trigger the appropriate handler based on file type
    if (messageType === 'video' && onSendVideoMessage) {
      onSendVideoMessage(newMessage);
    } else {
      // For images and other files, we'll create a mock File object and FileList
      const mockFile = new File([new Blob()], fileInfo.name, {
        type: fileInfo.type,
      });
      Object.defineProperty(mockFile, 'size', { value: fileInfo.size });

      const mockFileList = Object.create(FileList.prototype);
      Object.defineProperty(mockFileList, 'length', { value: 1 });
      Object.defineProperty(mockFileList, '0', { value: mockFile });
      Object.defineProperty(mockFileList, 'item', {
        value: (index: number) => (index === 0 ? mockFile : null),
      });

      onFileUpload(mockFileList);
    }
  };

  const handleVideoRecorded = async (
    videoBlob: Blob,
    videoDuration: number,
    thumbnail?: string
  ) => {
    if (isProcessingFile) return;

    setIsProcessingFile(true);
    try {
      // Save video to device storage
      const fileInfo = await saveBlobToDevice(
        videoBlob,
        `video-${Date.now()}.mp4`
      );

      const videoMessage: Message = {
        id: Date.now().toString(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: 'video',
        fileData: {
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type,
          url: fileInfo.url,
        },
        videoDuration,
        videoThumbnail: thumbnail,
      };

      onSendVideoMessage?.(videoMessage);
      setShowVideoRecorder(false);
    } catch (error) {
      console.error('Video save failed:', error);
    } finally {
      setIsProcessingFile(false);
    }
  };

  return (
    <>
      <div className='message-input-container'>
        <div className='message-input-wrapper'>
          <Button
            icon={<FaFile />}
            className='attachment-btn'
            onClick={() => setShowAttachmentDialog(true)}
            disabled={disabled || isProcessingFile}
          />

          <div className='message-input-field'>
            <InputText
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder='Type a message...'
              className='message-input'
              onKeyPress={handleKeyPress}
              disabled={disabled || isProcessingFile}
            />

            <Button
              icon={<FaCamera />}
              className='camera-btn'
              onClick={handleCameraCapture}
              disabled={disabled || isProcessingFile}
            />

            <Button
              icon={<FaSmile />}
              className='emoji-btn'
              onClick={(e) => emojiPanelRef.current?.toggle(e)}
              disabled={disabled || isProcessingFile}
            />
          </div>

          {currentMessage.trim() ? (
            <Button
              icon={<FaPaperPlane />}
              className='send-btn'
              onClick={handleSendMessage}
              disabled={disabled || isProcessingFile}
            />
          ) : (
            <VoiceRecording
              onSendAudioMessage={onSendAudioMessage}
              disabled={disabled || isProcessingFile}
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
            onClick={handleCameraCapture}
            disabled={isProcessingFile}
          />

          <Button
            icon={<FaImage />}
            label='Choose from Gallery'
            className='p-button-outlined attachment-option-btn'
            onClick={handleGallerySelect}
            disabled={isProcessingFile}
          />

          <Button
            icon={<FaVideo />}
            label='Record Video'
            className='p-button-outlined attachment-option-btn'
            onClick={() => {
              setShowVideoRecorder(true);
              setShowAttachmentDialog(false);
            }}
            disabled={isProcessingFile}
          />

          <Button
            icon={<FaFile />}
            label='Choose File'
            className='p-button-outlined attachment-option-btn'
            onClick={() => {
              fileInputRef.current?.click();
            }}
            disabled={isProcessingFile}
          />

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*,video/*,.pdf,.doc,.docx,.txt'
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
          />

          <p className='attachment-help'>
            {isProcessingFile
              ? 'Processing file...'
              : 'Select photos, videos, or documents to send'}
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
