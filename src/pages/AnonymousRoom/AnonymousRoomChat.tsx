import MessageEditDialog from '@/components/Chat/MessageEditDialog';
import { chatService, FirestoreMessage } from '@/services/chatService';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import './AnonymousRoomChat.scss';

interface RoomMessage extends FirestoreMessage {
  senderName: string;
}

const AnonymousRoomChat: React.FC = () => {
  const { roomId } = useParams({ from: '/room/$roomId' });
  const navigate = useNavigate();

  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<RoomMessage | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const contextMenuRef = useRef<Menu>(null);

  // Generate a random user name
  const generateRandomName = () => {
    const adjectives = [
      'Happy',
      'Cool',
      'Swift',
      'Bright',
      'Clever',
      'Bold',
      'Calm',
      'Quick',
    ];
    const animals = [
      'Panda',
      'Tiger',
      'Eagle',
      'Dolphin',
      'Wolf',
      'Fox',
      'Bear',
      'Hawk',
    ];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adjective}${animal}${Math.floor(Math.random() * 99)}`;
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time message subscription
  useEffect(() => {
    if (!isConnected || !roomId) return;

    console.log('Setting up message subscription for room:', roomId);

    const unsubscribe = chatService.subscribeToMessages(
      `room_${roomId}`,
      (firestoreMessages) => {
        console.log('Received room messages:', firestoreMessages.length);

        const roomMessages: RoomMessage[] = firestoreMessages.map((msg) => ({
          ...msg,
          senderName: msg.senderEmail || 'Anonymous User',
        }));

        setMessages(roomMessages);
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isConnected, roomId]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const handleJoinRoom = () => {
    if (!senderName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (senderName.length > 20) {
      toast.error('Name must be 20 characters or less');
      return;
    }

    setIsConnected(true);
    setShowNameDialog(false);
    setOnlineUsers([senderName]);
    toast.success(`Welcome to room ${roomId}!`);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !isConnected) return;

    try {
      await chatService.sendTextMessage(
        `room_${roomId}`,
        senderName,
        senderName, // Using name as both ID and email for room chats
        currentMessage.trim()
      );

      setCurrentMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (message: RoomMessage) => {
    setSelectedMessage(message);
    setShowEditDialog(true);
  };

  const handleDeleteMessage = async (message: RoomMessage) => {
    if (!message.id) return;

    try {
      await chatService.deleteMessage(
        message.id,
        senderName,
        'Deleted by room member'
      );
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleSaveEdit = async (
    messageId: string,
    newText: string,
    reason?: string
  ) => {
    try {
      await chatService.editMessage(messageId, newText, senderName, reason);
      toast.success('Message updated');
      setShowEditDialog(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleRightClick = (e: React.MouseEvent, message: RoomMessage) => {
    e.preventDefault();
    const menuItems = [
      {
        label: 'Edit Message',
        icon: 'pi pi-pencil',
        command: () => handleEditMessage(message),
      },
      {
        label: 'Delete Message',
        icon: 'pi pi-trash',
        command: () => handleDeleteMessage(message),
      },
    ];

    contextMenuRef.current?.show(e);
    // Set current context menu items (would need to modify Menu component to accept dynamic items)
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleLeaveRoom = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    navigate({ to: '/room' });
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    toast.success('Room ID copied to clipboard!');
  };

  // Name entry dialog
  const nameDialogFooter = (
    <div className='name-dialog-footer'>
      <Button
        label='Join Room'
        icon='pi pi-sign-in'
        onClick={handleJoinRoom}
        disabled={!senderName.trim()}
        className='join-room-button'
      />
    </div>
  );

  if (!roomId) {
    return (
      <div className='room-error'>
        <h2>Invalid Room</h2>
        <Button
          label='Back to Room List'
          onClick={() => navigate({ to: '/room' })}
        />
      </div>
    );
  }

  return (
    <div className='anonymous-room-chat-container'>
      {/* Room Header */}
      <div className='room-header'>
        <div className='room-info'>
          <h2 className='room-title'>
            <i className='pi pi-comments mr-2'></i>
            Room: {roomId}
          </h2>
          <div className='room-details'>
            <Tag
              value={`${onlineUsers.length} online`}
              severity='success'
            />
            <Button
              icon='pi pi-copy'
              className='p-button-text p-button-sm'
              onClick={handleCopyRoomId}
              tooltip='Copy Room ID'
            />
          </div>
        </div>
        <div className='room-actions'>
          <Button
            label='Leave Room'
            icon='pi pi-sign-out'
            className='p-button-outlined p-button-danger'
            onClick={handleLeaveRoom}
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className='room-info-banner'>
        <Message
          severity='info'
          content='🔓 Open Room: Anyone can join, edit, or delete messages. Messages are temporary and not permanently stored.'
        />
      </div>

      {/* Messages Area */}
      <div className='messages-container'>
        {messages.length === 0 ? (
          <div className='empty-messages'>
            <i
              className='pi pi-comments'
              style={{ fontSize: '3rem', color: '#ccc' }}
            ></i>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className='messages-list'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.senderName === senderName ? 'own-message' : 'other-message'}`}
                onContextMenu={(e) => handleRightClick(e, message)}
              >
                <div className='message-header'>
                  <span className='sender-name'>{message.senderName}</span>
                  <span className='message-time'>
                    {formatTime(message.timestamp)}
                  </span>
                  {message.isEdited && (
                    <Tag
                      value='edited'
                      className='edited-tag'
                      severity='secondary'
                    />
                  )}
                </div>
                <div className='message-content'>
                  {message.isDeleted ? (
                    <em className='deleted-message'>
                      This message was deleted
                    </em>
                  ) : (
                    message.text
                  )}
                </div>
                <div className='message-actions'>
                  <Button
                    icon='pi pi-pencil'
                    className='p-button-text p-button-sm'
                    onClick={() => handleEditMessage(message)}
                    tooltip='Edit Message'
                  />
                  <Button
                    icon='pi pi-trash'
                    className='p-button-text p-button-sm p-button-danger'
                    onClick={() => handleDeleteMessage(message)}
                    tooltip='Delete Message'
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      {isConnected && (
        <div className='message-input-container'>
          <div className='input-wrapper'>
            <InputText
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type your message...'
              className='message-input'
            />
            <Button
              icon='pi pi-send'
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
              className='send-button'
            />
          </div>
        </div>
      )}

      {/* Name Entry Dialog */}
      <Dialog
        header={`Join Room ${roomId}`}
        visible={showNameDialog}
        style={{ width: '400px' }}
        footer={nameDialogFooter}
        closable={false}
        modal
        className='name-entry-dialog'
      >
        <div className='name-entry-content'>
          <div className='entry-icon'>
            <i className='pi pi-user'></i>
          </div>
          <p>Enter your name to join this chat room:</p>
          <InputText
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder='Your display name'
            className='name-input'
            maxLength={20}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleJoinRoom();
              }
            }}
          />
          <small className='name-help'>{senderName.length}/20 characters</small>
          <div className='random-name-section'>
            <Button
              label='Use Random Name'
              icon='pi pi-refresh'
              className='p-button-text'
              onClick={() => setSenderName(generateRandomName())}
            />
          </div>
        </div>
      </Dialog>

      {/* Message Edit Dialog */}
      <MessageEditDialog
        visible={showEditDialog}
        message={selectedMessage}
        onHide={() => {
          setShowEditDialog(false);
          setSelectedMessage(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Context Menu */}
      <Menu
        ref={contextMenuRef}
        model={[]}
        popup
      />
    </div>
  );
};

export default AnonymousRoomChat;
