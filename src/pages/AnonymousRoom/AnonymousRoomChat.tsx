import MessageEditDialog from '@/components/Chat/MessageEditDialog';
import { chatService, FirestoreMessage } from '@/services/chatService';
import { CONSOLE_MESSAGES, TOAST_MESSAGES } from '@/utils/constants/generic';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './AnonymousRoomChat.module.scss';

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
    console.log(CONSOLE_MESSAGES.DEBUG.MESSAGE_SUBSCRIPTION, roomId);

    if (!roomId) return;

    const unsubscribe = chatService.subscribeToMessages(
      `room_${roomId}`,
      (firestoreMessages) => {
        console.log(
          CONSOLE_MESSAGES.DEBUG.RECEIVED_MESSAGES,
          firestoreMessages.length
        );
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
  }, [roomId]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const handleJoinRoom = () => {
    const trimmedName = senderName.trim();

    if (!trimmedName) {
      toast.error(TOAST_MESSAGES.ERROR.ENTER_NAME);
      return;
    }

    if (trimmedName.length > 20) {
      toast.error(TOAST_MESSAGES.ERROR.NAME_TOO_LONG);
      return;
    }

    setIsConnected(true);
    setShowNameDialog(false);
    setOnlineUsers([trimmedName]);
    toast.success(`${TOAST_MESSAGES.SUCCESS.ROOM_WELCOME} ${roomId}!`);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !isConnected) return;

    console.log('Sending message:', {
      text: currentMessage.trim(),
      senderName: senderName,
      roomId: roomId,
      timestamp: new Date(),
    });

    try {
      await chatService.sendTextMessage(
        `room_${roomId}`,
        senderName,
        senderName, // Using name as both ID and email for room chats
        currentMessage.trim()
      );

      setCurrentMessage('');
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERROR.SENDING_MESSAGE, error);
      toast.error(TOAST_MESSAGES.ERROR.MESSAGE_SEND_FAILED);
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
      toast.success(TOAST_MESSAGES.SUCCESS.MESSAGE_DELETED);
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERROR.DELETING_MESSAGE, error);
      toast.error(TOAST_MESSAGES.ERROR.MESSAGE_DELETE_FAILED);
    }
  };

  const handleSaveEdit = async (newText: string, editReason?: string) => {
    if (!selectedMessage?.id) return;

    try {
      await chatService.editMessage(
        selectedMessage.id,
        newText,
        senderName,
        editReason
      );
      toast.success(TOAST_MESSAGES.SUCCESS.MESSAGE_UPDATED);
      setShowEditDialog(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error(CONSOLE_MESSAGES.ERROR.EDITING_MESSAGE, error);
      toast.error(TOAST_MESSAGES.ERROR.MESSAGE_EDIT_FAILED);
    }
  };

  const handleRightClick = (e: React.MouseEvent, message: RoomMessage) => {
    e.preventDefault();
    console.log('Context menu for message:', message, 'Options:', [
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
    ]);

    contextMenuRef.current?.show(e);
    // Set current context menu items (would need to modify Menu component to accept dynamic items)
  };

  const formatTime = (timestamp: unknown) => {
    const date =
      (timestamp as { toDate?: () => Date })?.toDate?.() ||
      new Date(timestamp as Date);
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

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId || '');
      toast.success(TOAST_MESSAGES.SUCCESS.ROOM_ID_COPIED);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomId || '';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(TOAST_MESSAGES.SUCCESS.ROOM_ID_COPIED);
    }
  };

  // Name entry dialog
  const nameDialogFooter = (
    <div className={styles.arcNameDialogFooter}>
      <Button
        label='Join Room'
        icon='pi pi-sign-in'
        onClick={handleJoinRoom}
        disabled={!senderName.trim()}
        className={styles.arcJoinButton}
      />
    </div>
  );

  if (!roomId) {
    return (
      <div className={styles.arcError}>
        <h2>Invalid Room</h2>
        <Button
          label='Back to Room List'
          onClick={() => navigate({ to: '/room' })}
        />
      </div>
    );
  }

  return (
    <div className={styles.arcContainer}>
      {/* Room Header */}
      <div className={styles.arcHeader}>
        <div className={styles.arcRoomInfo}>
          <h2 className={styles.arcRoomTitle}>
            <i className='pi pi-comments mr-2'></i>
            Room: {roomId}
          </h2>
          <div className={styles.arcRoomDetails}>
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
        <div className={styles.arcRoomActions}>
          <Button
            label='Leave Room'
            icon='pi pi-sign-out'
            className='p-button-outlined p-button-danger'
            onClick={handleLeaveRoom}
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className={styles.arcInfoBanner}>
        <Message
          severity='info'
          content='🔓 Open Room: Anyone can join, edit, or delete messages. Messages are temporary and not permanently stored.'
        />
      </div>

      {/* Messages Area */}
      <div className={styles.arcMessagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.arcEmptyMessages}>
            <i
              className='pi pi-comments'
              style={{ fontSize: '3rem', color: '#ccc' }}
            ></i>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className={styles.arcMessagesList}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.arcMessageBubble} ${message.senderName === senderName ? styles.arcOwnMessage : styles.arcOtherMessage}`}
                onContextMenu={(e) => handleRightClick(e, message)}
              >
                <div className={styles.arcMessageHeader}>
                  <span className={styles.arcSenderName}>
                    {message.senderName}
                  </span>
                  <span className={styles.arcMessageTime}>
                    {formatTime(message.timestamp)}
                  </span>
                  {message.isEdited && (
                    <Tag
                      value='edited'
                      className={styles.arcEditedTag}
                      severity='secondary'
                    />
                  )}
                </div>
                <div className={styles.arcMessageContent}>
                  {message.isDeleted ? (
                    <em className={styles.arcDeletedMessage}>
                      This message was deleted
                    </em>
                  ) : (
                    message.text
                  )}
                </div>
                <div className={styles.arcMessageActions}>
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
        <div className={styles.arcMessageInput}>
          <div className={styles.arcMessageInputField}>
            <InputText
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Type your message...'
            />
          </div>
          <Button
            icon='pi pi-send'
            onClick={handleSendMessage}
            disabled={!currentMessage.trim()}
            className={styles.arcSendButton}
          />
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
        className={styles.arcNameDialog}
        onHide={() => setShowNameDialog(false)}
      >
        <div className={styles.arcNameDialogContent}>
          <p>Enter your name to join this chat room:</p>
          <div className={styles.arcNameInputContainer}>
            <label>Your display name</label>
            <InputText
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder='Your display name'
              maxLength={20}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinRoom();
                }
              }}
            />
            <small className={styles.arcCharacterCount}>
              {senderName.length}/20 characters
            </small>
          </div>
          <button
            className={styles.arcRandomNameButton}
            onClick={() => setSenderName(generateRandomName())}
          >
            🎲 Use Random Name
          </button>
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
