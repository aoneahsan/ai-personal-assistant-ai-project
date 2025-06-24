import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from 'emoji-picker-react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {
  FaArrowLeft,
  FaDownload,
  FaFile,
  FaMicrophone,
  FaPaperPlane,
  FaPaperclip,
  FaPause,
  FaPlay,
  FaSmile,
  FaStop,
  FaTrash,
  FaVideo,
} from 'react-icons/fa';
import './index.scss';

interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'file' | 'audio' | 'image' | 'video';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  audioDuration?: number;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you doing?',
      sender: 'other',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      text: "I'm doing great! Just working on some exciting projects. What about you?",
      sender: 'me',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      text: "That sounds awesome! I'd love to hear more about your projects.",
      sender: 'other',
      timestamp: new Date(Date.now() - 3400000),
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      text: "Sure! I'm building an AI personal assistant with React and it's been quite a journey.",
      sender: 'me',
      timestamp: new Date(Date.now() - 3300000),
      status: 'read',
      type: 'text',
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showRecordingControls, setShowRecordingControls] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPanelRef = useRef<OverlayPanel>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const chatUser: ChatUser = {
    id: '1',
    name: 'Sarah Johnson',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.onstop = () => {
        // Create preview audio when recording stops
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        setShowRecordingControls(true);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);

      // Start recording timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording && !isPaused) {
      mediaRecorder.pause();
      setIsPaused(true);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && isRecording && isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setMediaRecorder(null);
    setRecordedAudio(null);
    setShowRecordingControls(false);
    setRecordingTime(0);
    setAudioChunks([]);

    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const sendAudioMessage = () => {
    if (recordedAudio && audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: 'audio',
        fileData: {
          name: 'voice-message.wav',
          size: audioBlob.size,
          type: 'audio/wav',
          url: recordedAudio,
        },
        audioDuration: recordingTime,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Reset recording state
      setRecordedAudio(null);
      setShowRecordingControls(false);
      setRecordingTime(0);
      setAudioChunks([]);
      setIsPlayingPreview(false);
    }
  };

  const togglePreviewPlayback = () => {
    if (audioPreviewRef.current && recordedAudio) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioPreviewRef.current.play();
        setIsPlayingPreview(true);
      }
    }
  };

  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    const audioElement = audioRefs.current[messageId];

    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audioRefs.current[messageId] = audio;

      audio.onended = () => {
        setPlayingAudioId(null);
      };

      audio.play();
      setPlayingAudioId(messageId);
    } else {
      if (playingAudioId === messageId) {
        audioElement.pause();
        audioElement.currentTime = 0;
        setPlayingAudioId(null);
      } else {
        audioElement.play();
        setPlayingAudioId(messageId);
      }
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: currentMessage.trim(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: 'text',
      };

      setMessages((prev) => [...prev, newMessage]);
      setCurrentMessage('');

      // Simulate message status updates
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 2000);

      // Simulate typing indicator and response
      setTimeout(() => {
        setIsTyping(true);
      }, 2500);

      setTimeout(() => {
        setIsTyping(false);
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'That sounds really interesting! 😊',
          sender: 'other',
          timestamp: new Date(),
          status: 'read',
          type: 'text',
        };
        setMessages((prev) => [...prev, responseMessage]);
      }, 4000);
    }
  };

  const handleFileUpload = (event: any) => {
    const files = event.files;

    for (let file of files) {
      const fileUrl = URL.createObjectURL(file);
      let messageType: Message['type'] = 'file';

      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      }

      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: messageType,
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: fileUrl,
        },
      };

      setMessages((prev) => [...prev, newMessage]);
    }

    setShowAttachmentDialog(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setCurrentMessage((prev) => prev + emojiData.emoji);
    emojiPanelRef.current?.hide();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  const renderMessage = (message: Message) => {
    if (message.type === 'text') {
      return (
        <div className='message-bubble'>
          <p className='message-text'>{message.text}</p>
          <div className='message-meta'>
            <span className='message-time'>
              {formatTime(message.timestamp)}
            </span>
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
    }

    if (message.type === 'image') {
      return (
        <div className='message-bubble message-media'>
          <img
            src={message.fileData?.url}
            alt={message.fileData?.name}
            className='message-image'
          />
          <div className='message-meta'>
            <span className='message-time'>
              {formatTime(message.timestamp)}
            </span>
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
    }

    if (message.type === 'audio') {
      return (
        <div className='message-bubble message-audio'>
          <div className='audio-message'>
            <Button
              icon={<FaPlay />}
              className='audio-play-btn'
              size='small'
            />
            <div className='audio-waveform'>
              <div className='audio-progress'></div>
            </div>
            <span className='audio-duration'>
              {formatDuration(message.audioDuration || 0)}
            </span>
          </div>
          <div className='message-meta'>
            <span className='message-time'>
              {formatTime(message.timestamp)}
            </span>
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
    }

    if (message.type === 'file' || message.type === 'video') {
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
            <span className='message-time'>
              {formatTime(message.timestamp)}
            </span>
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
    }

    return null;
  };

  return (
    <div className='chat-container'>
      {/* Chat Header */}
      <div className='chat-header'>
        <div className='chat-header-left'>
          <Button
            icon={<FaArrowLeft />}
            className='p-button-text chat-back-btn'
            onClick={() => window.history.back()}
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
          <Button
            icon={<BsThreeDotsVertical />}
            className='p-button-text chat-menu-btn'
          />
        </div>
      </div>

      <Divider className='m-0' />

      {/* Messages Area */}
      <div className='messages-container'>
        <div className='messages-list'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender === 'me' ? 'message-sent' : 'message-received'}`}
            >
              {renderMessage(message)}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className='message-wrapper message-received'>
              <div className='message-bubble typing-indicator'>
                <div className='typing-dots'>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Recording Overlay */}
      {isRecording && (
        <div className='recording-overlay'>
          <div className='recording-content'>
            <div className='recording-animation'>
              <FaMicrophone />
            </div>
            <span className='recording-time'>
              {formatDuration(recordingTime)}
            </span>
            <p>Recording voice message...</p>
          </div>
        </div>
      )}

      {/* WhatsApp-style Recording Controls */}
      {(isRecording || showRecordingControls) && (
        <div className='recording-controls-overlay'>
          <div className='recording-controls'>
            {isRecording ? (
              <>
                <div className='recording-info'>
                  <div className='recording-indicator'>
                    <div className='recording-dot'></div>
                    <span>Recording... {formatDuration(recordingTime)}</span>
                  </div>
                  <div className='recording-waveform'>
                    <div className='wave-bar'></div>
                    <div className='wave-bar'></div>
                    <div className='wave-bar'></div>
                    <div className='wave-bar'></div>
                    <div className='wave-bar'></div>
                  </div>
                </div>
                <div className='recording-actions'>
                  <Button
                    icon={<FaTrash />}
                    className='p-button-text recording-cancel-btn'
                    onClick={cancelRecording}
                    tooltip='Cancel'
                  />
                  <Button
                    icon={isPaused ? <FaMicrophone /> : <FaPause />}
                    className={
                      isPaused ? 'recording-resume-btn' : 'recording-pause-btn'
                    }
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    tooltip={isPaused ? 'Resume' : 'Pause'}
                  />
                  <Button
                    icon={<FaStop />}
                    className='recording-stop-btn'
                    onClick={stopRecording}
                    tooltip='Stop & Preview'
                  />
                </div>
              </>
            ) : showRecordingControls && recordedAudio ? (
              <>
                <div className='preview-info'>
                  <span>
                    Voice message recorded ({formatDuration(recordingTime)})
                  </span>
                  <audio
                    ref={audioPreviewRef}
                    src={recordedAudio}
                    onEnded={() => setIsPlayingPreview(false)}
                  />
                </div>
                <div className='preview-actions'>
                  <Button
                    icon={<FaTrash />}
                    className='p-button-text preview-cancel-btn'
                    onClick={cancelRecording}
                    tooltip='Delete'
                  />
                  <Button
                    icon={isPlayingPreview ? <FaPause /> : <FaPlay />}
                    className='preview-play-btn'
                    onClick={togglePreviewPlayback}
                    tooltip={isPlayingPreview ? 'Pause' : 'Play'}
                  />
                  <Button
                    icon={<FaPaperPlane />}
                    className='preview-send-btn'
                    onClick={sendAudioMessage}
                    tooltip='Send'
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Message Input Area */}
      <div className='message-input-container'>
        <div className='message-input-wrapper'>
          <Button
            icon={<FaPaperclip />}
            className='p-button-text attachment-btn'
            onClick={() => setShowAttachmentDialog(true)}
          />
          <div className='message-input-field'>
            <InputText
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type a message...'
              className='message-input'
            />
            <Button
              icon={<FaSmile />}
              className='p-button-text emoji-btn'
              onClick={(e) => emojiPanelRef.current?.toggle(e)}
            />
          </div>
          {currentMessage.trim() ? (
            <Button
              icon={<FaPaperPlane />}
              className='send-btn'
              onClick={handleSendMessage}
            />
          ) : (
            <Button
              icon={isRecording ? <FaStop /> : <FaMicrophone />}
              className={isRecording ? 'stop-recording-btn' : 'voice-btn'}
              onClick={isRecording ? stopRecording : startRecording}
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
    </div>
  );
};

export default Chat;
