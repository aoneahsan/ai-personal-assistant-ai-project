import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from 'emoji-picker-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useRef, useState } from 'react';
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa';
import { Message } from './types';
import VoiceRecording from './VoiceRecording';

interface MessageInputProps {
  currentMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onSendAudioMessage: (message: Message) => void;
  onFileUpload: (files: FileList) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  currentMessage,
  onMessageChange,
  onSendMessage,
  onSendAudioMessage,
  onFileUpload,
  disabled = false,
}) => {
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const emojiPanelRef = useRef<OverlayPanel>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onMessageChange(currentMessage + emojiData.emoji);
    emojiPanelRef.current?.hide();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleFileUpload = (event: any) => {
    const files = event.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
    setShowAttachmentDialog(false);
  };

  return (
    <>
      <div className='message-input-container'>
        <div className='message-input-wrapper'>
          <Button
            icon={<FaPaperclip />}
            className='p-button-text attachment-btn'
            onClick={() => setShowAttachmentDialog(true)}
            disabled={disabled}
          />
          <div className='message-input-field'>
            <InputText
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                disabled ? 'Processing audio...' : 'Type a message...'
              }
              className='message-input'
              disabled={disabled}
            />
            <Button
              icon={<FaSmile />}
              className='p-button-text emoji-btn'
              onClick={(e) => emojiPanelRef.current?.toggle(e)}
              disabled={disabled}
            />
          </div>
          {currentMessage.trim() ? (
            <Button
              icon={<FaPaperPlane />}
              className='send-btn'
              onClick={onSendMessage}
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

      {/* Emoji Picker Overlay */}
      <OverlayPanel
        ref={emojiPanelRef}
        className='emoji-panel'
        dismissable
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={Theme.LIGHT}
          emojiStyle={EmojiStyle.APPLE}
          width={320}
          height={400}
          searchDisabled={false}
          skinTonesDisabled={false}
          previewConfig={{ showPreview: false }}
          lazyLoadEmojis={true}
        />
      </OverlayPanel>

      {/* File Attachment Dialog */}
      <Dialog
        header='Send Attachment'
        visible={showAttachmentDialog}
        style={{ width: '90vw', maxWidth: '500px' }}
        onHide={() => setShowAttachmentDialog(false)}
        className='attachment-dialog'
      >
        <div className='attachment-options'>
          <FileUpload
            ref={fileUploadRef}
            mode='basic'
            multiple
            accept='image/*,video/*,.pdf,.doc,.docx,.txt'
            maxFileSize={50000000} // 50MB
            onSelect={handleFileUpload}
            chooseLabel='Choose Files'
            className='file-upload-btn'
            auto
          />
          <p className='attachment-help'>
            You can send images, videos, documents and other files up to 50MB
          </p>
        </div>
      </Dialog>
    </>
  );
};

export default MessageInput;
