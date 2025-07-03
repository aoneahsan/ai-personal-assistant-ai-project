import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Panel } from 'primereact/panel';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './AnonymousRoom.scss';

const AnonymousRoom: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className='anonymous-room-page'>
      {/* Header Section */}
      <div className='page-header'>
        <div className='container'>
          <div className='header-content'>
            <div className='header-icon'>
              <i className='pi pi-users'></i>
            </div>
            <h1 className='page-title'>Anonymous Chat Rooms</h1>
            <p className='page-subtitle'>
              Create or join public chat rooms instantly. No account required!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='page-content'>
        <div className='container'>
          {/* Action Cards */}
          <div className='action-cards'>
            <Card className='action-card create-card'>
              <div className='card-header'>
                <div className='card-icon'>
                  <i className='pi pi-plus'></i>
                </div>
                <h3>Create New Room</h3>
              </div>
              <div className='card-body'>
                <p>
                  Generate a unique room code and start chatting instantly.
                  Share the room code with friends to invite them.
                </p>
                <div className='card-actions'>
                  <Button
                    label='Create Room'
                    icon='pi pi-plus'
                    onClick={handleCreateRoom}
                    className='create-btn'
                    size='large'
                  />
                </div>
              </div>
            </Card>

            <Card className='action-card join-card'>
              <div className='card-header'>
                <div className='card-icon'>
                  <i className='pi pi-sign-in'></i>
                </div>
                <h3>Join Existing Room</h3>
              </div>
              <div className='card-body'>
                <p>
                  Enter an 8-character room code to join an existing chat room.
                </p>
                <div className='join-form'>
                  <div className='input-group'>
                    <InputText
                      value={roomName}
                      onChange={handleRoomNameChange}
                      onKeyPress={handleKeyPress}
                      placeholder='ROOM CODE'
                      className='room-input'
                      maxLength={8}
                    />
                    <span className='input-counter'>{roomName.length}/8</span>
                  </div>
                  <Button
                    label='Join Room'
                    icon='pi pi-arrow-right'
                    onClick={handleJoinRoom}
                    disabled={roomName.length !== 8 || isJoining}
                    loading={isJoining}
                    className='join-btn'
                    size='large'
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Features Section */}
          <div className='features-section'>
            <Panel
              header='How Anonymous Rooms Work'
              className='features-panel'
            >
              <div className='features-grid'>
                <div className='feature-item'>
                  <div className='feature-icon'>
                    <i className='pi pi-lock-open'></i>
                  </div>
                  <div className='feature-content'>
                    <h4>No Registration</h4>
                    <p>
                      Jump right in without creating an account or signing up
                    </p>
                  </div>
                </div>

                <div className='feature-item'>
                  <div className='feature-icon'>
                    <i className='pi pi-hashtag'></i>
                  </div>
                  <div className='feature-content'>
                    <h4>8-Character Codes</h4>
                    <p>
                      Easy to share and remember room codes for quick access
                    </p>
                  </div>
                </div>

                <div className='feature-item'>
                  <div className='feature-icon'>
                    <i className='pi pi-users'></i>
                  </div>
                  <div className='feature-content'>
                    <h4>Open to Everyone</h4>
                    <p>Anyone with the room code can join and participate</p>
                  </div>
                </div>

                <div className='feature-item'>
                  <div className='feature-icon'>
                    <i className='pi pi-bolt'></i>
                  </div>
                  <div className='feature-content'>
                    <h4>Real-Time Chat</h4>
                    <p>Messages appear instantly for seamless conversation</p>
                  </div>
                </div>

                <div className='feature-item'>
                  <div className='feature-icon'>
                    <i className='pi pi-edit'></i>
                  </div>
                  <div className='feature-content'>
                    <h4>Collaborative Editing</h4>
                    <p>All participants can edit and delete messages</p>
                  </div>
                </div>

                <div className='feature-item'>
                  <div className='feature-icon'>
                    <i className='pi pi-clock'></i>
                  </div>
                  <div className='feature-content'>
                    <h4>Temporary Rooms</h4>
                    <p>No permanent storage - rooms are temporary by design</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Navigation */}
          <div className='page-navigation'>
            <Button
              label='Back to Personal Chat'
              icon='pi pi-arrow-left'
              className='p-button-outlined back-btn'
              onClick={() => navigate({ to: '/anonymous-chat' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousRoom;
