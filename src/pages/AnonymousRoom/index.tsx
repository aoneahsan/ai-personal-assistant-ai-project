import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Panel } from 'primereact/panel';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styles from './AnonymousRoom.module.scss';

const AnonymousRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  // Initialize theme to ensure CSS variables are loaded
  useTheme();

  // Generate a random 8-character room name
  const generateRoomName = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const handleCreateRoom = () => {
    const newRoomName = generateRoomName();
    setRoomName(newRoomName);
    navigate({ to: `/room/${newRoomName}` });
  };

  const handleJoinRoom = () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    if (roomName.length !== 8) {
      toast.error('Room name must be exactly 8 characters');
      return;
    }

    // Validate room name format (only alphanumeric characters)
    const isValidFormat = /^[A-Z0-9]{8}$/.test(roomName.toUpperCase());
    if (!isValidFormat) {
      toast.error('Room name can only contain letters and numbers');
      return;
    }

    setIsJoining(true);
    const formattedRoomName = roomName.toUpperCase();

    // Navigate to the room
    navigate({ to: `/room/${formattedRoomName}` });
  };

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters and limit to 8 characters
    value = value.replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setRoomName(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roomName.length === 8) {
      handleJoinRoom();
    }
  };

  const handleBackToChats = () => {
    // Navigate to chats list page instead of using browser history
    navigate({ to: '/chats' });
  };

  return (
    <div className={styles.arPage}>
      {/* Header Section */}
      <div className={styles.arPageHeader}>
        <div className='container'>
          <div className={styles.arHeaderContent}>
            <div className={styles.arHeaderIcon}>
              <i className='pi pi-users'></i>
            </div>
            <h1 className={styles.arPageTitle}>Anonymous Chat Rooms</h1>
            <p className={styles.arPageSubtitle}>
              Create or join public chat rooms instantly. No account required!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.arPageContent}>
        <div className='container'>
          {/* Action Cards */}
          <div className={styles.arActionCards}>
            <Card className={`${styles.arActionCard} ${styles.arCreateCard}`}>
              <div className={styles.arCardHeader}>
                <div className={styles.arCardIcon}>
                  <i className='pi pi-plus'></i>
                </div>
                <h3>Create New Room</h3>
              </div>
              <div className={styles.arCardBody}>
                <p>
                  Generate a unique room code and start chatting instantly.
                  Share the room code with friends to invite them.
                </p>
                <div className={styles.arCardActions}>
                  <Button
                    label='Create Room'
                    icon='pi pi-plus'
                    onClick={handleCreateRoom}
                    className={styles.arCreateBtn}
                    size='large'
                  />
                </div>
              </div>
            </Card>

            <Card className={`${styles.arActionCard} ${styles.arJoinCard}`}>
              <div className={styles.arCardHeader}>
                <div className={styles.arCardIcon}>
                  <i className='pi pi-sign-in'></i>
                </div>
                <h3>Join Existing Room</h3>
              </div>
              <div className={styles.arCardBody}>
                <p>
                  Enter an 8-character room code to join an existing chat room.
                </p>
                <div className={styles.arJoinForm}>
                  <div className={styles.arInputGroup}>
                    <InputText
                      value={roomName}
                      onChange={handleRoomNameChange}
                      onKeyPress={handleKeyPress}
                      placeholder='ROOM CODE'
                      className={styles.arRoomInput}
                      maxLength={8}
                    />
                    <span className={styles.arInputCounter}>
                      {roomName.length}/8
                    </span>
                  </div>
                  <Button
                    label='Join Room'
                    icon='pi pi-arrow-right'
                    onClick={handleJoinRoom}
                    disabled={roomName.length !== 8 || isJoining}
                    loading={isJoining}
                    className={styles.arJoinBtn}
                    size='large'
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Features Section */}
          <div className={styles.arFeaturesSection}>
            <Panel
              header='How Anonymous Rooms Work'
              className={styles.arFeaturesPanel}
            >
              <div className={styles.arFeaturesGrid}>
                <div className={styles.arFeatureItem}>
                  <div className={styles.arFeatureIcon}>
                    <i className='pi pi-lock-open'></i>
                  </div>
                  <div className={styles.arFeatureContent}>
                    <h4>No Registration</h4>
                    <p>
                      Jump right in without creating an account or signing up
                    </p>
                  </div>
                </div>

                <div className={styles.arFeatureItem}>
                  <div className={styles.arFeatureIcon}>
                    <i className='pi pi-hashtag'></i>
                  </div>
                  <div className={styles.arFeatureContent}>
                    <h4>8-Character Codes</h4>
                    <p>
                      Easy to share and remember room codes for quick access
                    </p>
                  </div>
                </div>

                <div className={styles.arFeatureItem}>
                  <div className={styles.arFeatureIcon}>
                    <i className='pi pi-users'></i>
                  </div>
                  <div className={styles.arFeatureContent}>
                    <h4>Open to Everyone</h4>
                    <p>Anyone with the room code can join and participate</p>
                  </div>
                </div>

                <div className={styles.arFeatureItem}>
                  <div className={styles.arFeatureIcon}>
                    <i className='pi pi-clock'></i>
                  </div>
                  <div className={styles.arFeatureContent}>
                    <h4>Temporary Messages</h4>
                    <p>Messages exist only during the session for privacy</p>
                  </div>
                </div>

                <div className={styles.arFeatureItem}>
                  <div className={styles.arFeatureIcon}>
                    <i className='pi pi-pencil'></i>
                  </div>
                  <div className={styles.arFeatureContent}>
                    <h4>Edit & Delete</h4>
                    <p>Anyone can edit or delete messages in the room</p>
                  </div>
                </div>

                <div className={styles.arFeatureItem}>
                  <div className={styles.arFeatureIcon}>
                    <i className='pi pi-eye-slash'></i>
                  </div>
                  <div className={styles.arFeatureContent}>
                    <h4>Anonymous</h4>
                    <p>Use any display name without revealing your identity</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Warning Section */}
          <div className={styles.arWarningSection}>
            <div className={styles.arWarningGrid}>
              <div className={styles.arWarningItem}>
                <div className={styles.arWarningIcon}>
                  <i className='pi pi-exclamation-triangle'></i>
                </div>
                <div className={styles.arWarningContent}>
                  <p>
                    <strong>Public rooms:</strong> Anyone can join, view, edit,
                    or delete messages
                  </p>
                </div>
              </div>

              <div className={styles.arWarningItem}>
                <div className={styles.arWarningIcon}>
                  <i className='pi pi-trash'></i>
                </div>
                <div className={styles.arWarningContent}>
                  <p>
                    <strong>Temporary:</strong> Messages are not permanently
                    stored
                  </p>
                </div>
              </div>

              <div className={styles.arWarningItem}>
                <div className={styles.arWarningIcon}>
                  <i className='pi pi-shield'></i>
                </div>
                <div className={styles.arWarningContent}>
                  <p>
                    <strong>No moderation:</strong> Use responsibly and respect
                    others
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.arPageFooter}>
        <div className='container'>
          <Button
            label='← Back to Chats'
            icon='pi pi-arrow-left'
            onClick={handleBackToChats}
            className={styles.arBackButton}
          />
        </div>
      </div>
    </div>
  );
};

export default AnonymousRoom;
