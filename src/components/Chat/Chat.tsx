import React, { useRef, useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessagesList from './MessagesList';
import TranscriptDialog from './TranscriptDialog';
import { ChatUser, Message } from './types';

interface ChatProps {
  chatUser?: ChatUser;
  initialMessages?: Message[];
  onBack?: () => void;
}

const Chat: React.FC<ChatProps> = ({
  chatUser,
  initialMessages = [],
  onBack,
}) => {
  // Default chat user if none provided
  const defaultChatUser: ChatUser = {
    id: '1',
    name: 'Sarah Johnson',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastSeen: new Date(),
  };

  // Default sample messages if none provided
  const defaultMessages: Message[] = [
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
      audioDuration: 12,
      quickTranscript: 'This is a sample audio message with transcription...',
      transcript: [
        {
          text: 'This is a sample audio message',
          startTime: 0.0,
          endTime: 2.4,
          confidence: 0.95,
        },
        {
          text: 'with transcription support that works perfectly',
          startTime: 2.6,
          endTime: 5.8,
          confidence: 0.92,
        },
        {
          text: 'and includes timestamps for each segment',
          startTime: 6.0,
          endTime: 9.2,
          confidence: 0.89,
        },
        {
          text: 'making it accessible for everyone!',
          startTime: 9.4,
          endTime: 12.0,
          confidence: 0.94,
        },
      ],
    },
  ];

  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : defaultMessages
  );
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState<
    string | null
  >(null);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const currentChatUser = chatUser || defaultChatUser;

  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    // Stop all other audio first
    Object.keys(audioRefs.current).forEach((id) => {
      if (id !== messageId && audioRefs.current[id]) {
        audioRefs.current[id].pause();
        audioRefs.current[id].currentTime = 0;
      }
    });

    // Toggle the current audio
    if (playingAudioId === messageId) {
      // Pause the current audio
      setPlayingAudioId(null);
    } else {
      // Play the new audio
      setPlayingAudioId(messageId);
    }
  };

  const showTranscript = (messageId: string) => {
    setShowTranscriptDialog(messageId);
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

  const handleSendAudioMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2000);
  };

  const handleSendVideoMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 2000);
  };

  const handleFileUpload = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let messageType: Message['type'] = 'file';

      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      }

      // Check if the file has an actualUrl property (from Capacitor file manager)
      const fileUrl = (file as any).actualUrl || URL.createObjectURL(file);

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

      // Add video duration for video files (placeholder)
      if (messageType === 'video') {
        newMessage.videoDuration = 0; // This would be extracted from video metadata
      }

      setMessages((prev) => [...prev, newMessage]);

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
    }
  };

  const selectedMessage = showTranscriptDialog
    ? messages.find((m) => m.id === showTranscriptDialog) || null
    : null;

  // Check if any audio is being processed
  const isProcessingAudio = false; // This would be managed by VoiceRecording component

  return (
    <div className='chat-container'>
      <ChatHeader
        chatUser={currentChatUser}
        onBack={onBack}
      />

      <MessagesList
        messages={messages}
        isTyping={isTyping}
        playingAudioId={playingAudioId}
        onAudioToggle={toggleAudioPlayback}
        onShowTranscript={showTranscript}
      />

      <MessageInput
        currentMessage={currentMessage}
        onMessageChange={setCurrentMessage}
        onSendMessage={handleSendMessage}
        onSendAudioMessage={handleSendAudioMessage}
        onSendVideoMessage={handleSendVideoMessage}
        onFileUpload={handleFileUpload}
        disabled={isProcessingAudio}
      />

      <TranscriptDialog
        visible={!!showTranscriptDialog}
        onHide={() => setShowTranscriptDialog(null)}
        message={selectedMessage}
      />
    </div>
  );
};

export default Chat;
