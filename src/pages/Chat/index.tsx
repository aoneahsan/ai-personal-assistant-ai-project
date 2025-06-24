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
import { Menu } from 'primereact/menu';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import {
  FaArrowLeft,
  FaDownload,
  FaEllipsisV,
  FaFile,
  FaMicrophone,
  FaPaperPlane,
  FaPaperclip,
  FaPause,
  FaPlay,
  FaSmile,
  FaStop,
  FaVideo,
} from 'react-icons/fa';
import './index.scss';

interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

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
  transcript?: TranscriptSegment[]; // Full transcript with timestamps
  quickTranscript?: string; // Quick preview transcript
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
    {
      id: '5',
      sender: 'me',
      timestamp: new Date(Date.now() - 1800000),
      status: 'read',
      type: 'audio',
      fileData: {
        name: 'voice-message.wav',
        size: 45000,
        type: 'audio/wav',
        url: 'data:audio/wav;base64,sample',
      },
      audioDuration: 15,
      quickTranscript: 'This is a sample audio message with transcription...',
      transcript: [
        {
          text: 'This is a sample audio message',
          startTime: 0,
          endTime: 3.2,
          confidence: 0.95,
        },
        {
          text: 'with transcription support that works perfectly',
          startTime: 3.5,
          endTime: 7.1,
          confidence: 0.92,
        },
        {
          text: 'and includes timestamps for each segment',
          startTime: 7.4,
          endTime: 11.8,
          confidence: 0.89,
        },
        {
          text: 'making it accessible for everyone!',
          startTime: 12.1,
          endTime: 15.0,
          confidence: 0.94,
        },
      ],
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState<
    string | null
  >(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Speech recognition states
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcriptSegments, setTranscriptSegments] = useState<
    TranscriptSegment[]
  >([]);
  const [listening, setListening] = useState(false);
  const [
    browserSupportsSpeechRecognition,
    setBrowserSupportsSpeechRecognition,
  ] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPanelRef = useRef<OverlayPanel>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const recognitionRef = useRef<any>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioMenuRefs = useRef<{ [key: string]: Menu }>({});

  const chatUser: ChatUser = {
    id: '1',
    name: 'Sarah Johnson',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setBrowserSupportsSpeechRecognition(true);
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;

            // Add to transcript segments with timing
            const segment: TranscriptSegment = {
              text: transcript.trim(),
              startTime: recordingTime - 3, // Approximate start time
              endTime: recordingTime,
              confidence: confidence || 0.8,
            };

            setTranscriptSegments((prev) => [...prev, segment]);
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(finalTranscript + interimTranscript);
      };

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onend = () => {
        setListening(false);
        // Restart if still recording and not paused
        if (isRecording && !isPaused && browserSupportsSpeechRecognition) {
          try {
            recognition.start();
          } catch (error) {
            console.log('Recognition restart failed:', error);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isRecording, isPaused, recordingTime, browserSupportsSpeechRecognition]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      const chunks: Blob[] = [];
      setAudioChunks(chunks);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setAudioChunks([...chunks]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());

        // Send audio message
        handleAudioRecordingComplete(blob);
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscriptSegments([]);
      setCurrentTranscript('');

      // Start speech recognition
      if (recognitionRef.current && browserSupportsSpeechRecognition) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Speech recognition start failed:', error);
        }
      }

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorder && isRecording && !isPaused) {
      mediaRecorder.pause();
      setIsPaused(true);

      // Pause speech recognition
      if (recognitionRef.current && listening) {
        recognitionRef.current.stop();
      }

      // Pause timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorder && isRecording && isPaused) {
      mediaRecorder.resume();
      setIsPaused(false);

      // Resume speech recognition
      if (recognitionRef.current && browserSupportsSpeechRecognition) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Speech recognition resume failed:', error);
        }
      }

      // Resume timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setMediaRecorder(null);

      // Stop speech recognition
      if (recognitionRef.current && listening) {
        recognitionRef.current.stop();
      }

      // Clear timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }

    setIsRecording(false);
    setIsPaused(false);
    setMediaRecorder(null);
    setAudioBlob(null);
    setAudioChunks([]);
    setRecordingTime(0);
    setTranscriptSegments([]);
    setCurrentTranscript('');

    // Stop speech recognition
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }

    // Clear timer
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  // Handle audio recording completion
  const handleAudioRecordingComplete = (blob: Blob) => {
    const audioUrl = URL.createObjectURL(blob);

    // Create quick transcript preview
    const quickTranscript =
      transcriptSegments.length > 0
        ? transcriptSegments.map((seg) => seg.text).join(' ')
        : currentTranscript || 'Audio message recorded';

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: 'audio',
      fileData: {
        name: 'voice-message.webm',
        size: blob.size,
        type: blob.type,
        url: audioUrl,
      },
      audioDuration: recordingTime,
      quickTranscript:
        quickTranscript.substring(0, 50) +
        (quickTranscript.length > 50 ? '...' : ''),
      transcript:
        transcriptSegments.length > 0
          ? transcriptSegments
          : [
              {
                text: currentTranscript || 'Audio message recorded',
                startTime: 0,
                endTime: recordingTime,
                confidence: 0.8,
              },
            ],
    };

    setMessages((prev) => [...prev, newMessage]);

    // Reset states
    setCurrentTranscript('');
    setTranscriptSegments([]);

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

  const showTranscript = (messageId: string) => {
    setShowTranscriptDialog(messageId);
  };

  const getAudioMenuItems = (message: Message) => [
    {
      label: 'Read Transcript',
      icon: 'pi pi-file-word',
      command: () => showTranscript(message.id),
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

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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
              icon={playingAudioId === message.id ? <FaPause /> : <FaPlay />}
              className='audio-play-btn'
              size='small'
              onClick={() =>
                toggleAudioPlayback(message.id, message.fileData?.url || '')
              }
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
              onClick={(e) => audioMenuRefs.current[message.id]?.toggle(e)}
            />
            <Menu
              ref={(el) => {
                if (el) audioMenuRefs.current[message.id] = el;
              }}
              model={getAudioMenuItems(message)}
              popup
            />
          </div>

          {/* Quick transcript preview */}
          {message.quickTranscript && (
            <div className='audio-transcript-preview'>
              <span className='transcript-preview-text'>
                "{message.quickTranscript}"
              </span>
            </div>
          )}

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

  const selectedMessage = showTranscriptDialog
    ? messages.find((m) => m.id === showTranscriptDialog)
    : null;

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

      {/* Speech Recognition Status */}
      {listening && (
        <div className='speech-recognition-status'>
          <div className='recording-indicator'>
            <div className='recording-dot'></div>
            <span>
              Listening... {currentTranscript && `"${currentTranscript}"`}
            </span>
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
            <div className='voice-controls'>
              {!isRecording ? (
                <Button
                  icon={<FaMicrophone />}
                  className='voice-btn'
                  onClick={startRecording}
                  tooltip='Start voice recording'
                />
              ) : (
                <div className='recording-controls'>
                  <Button
                    icon={isPaused ? <FaPlay /> : <FaPause />}
                    className={isPaused ? 'resume-btn' : 'pause-btn'}
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    tooltip={isPaused ? 'Resume recording' : 'Pause recording'}
                    size='small'
                  />
                  <Button
                    icon={<FaStop />}
                    className='stop-btn'
                    onClick={stopRecording}
                    tooltip='Stop and send'
                    size='small'
                  />
                  <Button
                    icon='✕'
                    className='cancel-btn'
                    onClick={cancelRecording}
                    tooltip='Cancel recording'
                    size='small'
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className='recording-status'>
          <div className='recording-info'>
            <span>
              🔴 {isPaused ? 'Paused' : 'Recording'}...{' '}
              {formatDuration(recordingTime)}
            </span>
            {currentTranscript && (
              <span className='live-transcript'>"{currentTranscript}"</span>
            )}
          </div>
        </div>
      )}

      {/* Browser Support Warning */}
      {!browserSupportsSpeechRecognition && (
        <div className='speech-support-warning'>
          <p>
            ⚠️ Speech recognition not supported in this browser. Audio will be
            recorded without transcription.
          </p>
        </div>
      )}

      {/* Transcript Dialog */}
      <Dialog
        header='Audio Transcript'
        visible={!!showTranscriptDialog}
        style={{ width: '90vw', maxWidth: '600px' }}
        onHide={() => setShowTranscriptDialog(null)}
        className='transcript-dialog'
      >
        {selectedMessage && selectedMessage.transcript && (
          <div className='transcript-content'>
            <div className='transcript-header-info'>
              <p>
                <strong>Duration:</strong>{' '}
                {formatDuration(selectedMessage.audioDuration || 0)}
              </p>
              <p>
                <strong>Segments:</strong> {selectedMessage.transcript.length}
              </p>
            </div>
            <div className='transcript-segments'>
              {selectedMessage.transcript.map((segment, index) => (
                <div
                  key={index}
                  className='transcript-segment'
                >
                  <div className='segment-timing'>
                    <span className='start-time'>
                      {formatTimestamp(segment.startTime)}
                    </span>
                    <span className='separator'>→</span>
                    <span className='end-time'>
                      {formatTimestamp(segment.endTime)}
                    </span>
                    {segment.confidence && (
                      <span className='confidence'>
                        ({Math.round(segment.confidence * 100)}%)
                      </span>
                    )}
                  </div>
                  <div className='segment-text'>{segment.text}</div>
                </div>
              ))}
            </div>
            <div className='transcript-actions'>
              <Button
                label='Copy Full Transcript'
                icon='pi pi-copy'
                onClick={() => {
                  const fullText = selectedMessage
                    .transcript!.map((seg) => seg.text)
                    .join(' ');
                  navigator.clipboard.writeText(fullText);
                }}
                className='p-button-outlined'
              />
            </div>
          </div>
        )}
      </Dialog>

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
