import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
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
    <div className='anonymous-room-container'>
      <div className='anonymous-room-content'>
        <div className='header-section'>
          <h1 className='main-title'>
            <i className='pi pi-comments mr-3'></i>
            Anonymous Chat Rooms
          </h1>
          <p className='subtitle'>
            Create or join public chat rooms. No account required!
          </p>
        </div>

        <div className='cards-container'>
          {/* Create Room Card */}
          <Card className='room-card create-card'>
            <div className='card-content'>
              <div className='card-icon'>
                <i className='pi pi-plus-circle'></i>
              </div>
              <h3>Create New Room</h3>
              <p>
                Start a new chat room with a randomly generated 8-character room
                name. Share the room name with others to invite them.
              </p>
              <Button
                label='Create Room'
                icon='pi pi-plus'
                onClick={handleCreateRoom}
                className='create-button'
                size='large'
              />
            </div>
          </Card>

          {/* Join Room Card */}
          <Card className='room-card join-card'>
            <div className='card-content'>
              <div className='card-icon'>
                <i className='pi pi-sign-in'></i>
              </div>
              <h3>Join Existing Room</h3>
              <p>
                Enter an 8-character room name to join an existing chat room.
              </p>

              <div className='join-form'>
                <div className='input-container'>
                  <InputText
                    value={roomName}
                    onChange={handleRoomNameChange}
                    onKeyPress={handleKeyPress}
                    placeholder='Enter 8-character room name'
                    className='room-input'
                    maxLength={8}
                  />
                  <small className='input-help'>
                    {roomName.length}/8 characters (A-Z, 0-9 only)
                  </small>
                </div>

                <Button
                  label='Join Room'
                  icon='pi pi-arrow-right'
                  onClick={handleJoinRoom}
                  disabled={roomName.length !== 8 || isJoining}
                  loading={isJoining}
                  className='join-button'
                  size='large'
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Information Section */}
        <div className='info-section'>
          <Message
            severity='info'
            className='room-info-message'
            content={
              <div>
                <h4>How it works:</h4>
                <ul>
                  <li>
                    🔓 <strong>No login required</strong> - Start chatting
                    immediately
                  </li>
                  <li>
                    🏷️ <strong>Room names are 8 characters</strong> - Easy to
                    share and remember
                  </li>
                  <li>
                    👥 <strong>Anyone can join</strong> - Share the room name
                    with friends
                  </li>
                  <li>
                    ✏️ <strong>Everyone can edit/delete</strong> - All messages
                    can be modified by anyone
                  </li>
                  <li>
                    🔄 <strong>Real-time chat</strong> - Messages appear
                    instantly
                  </li>
                  <li>
                    🎨 <strong>No message history</strong> - Rooms are temporary
                    and messages aren't permanently stored
                  </li>
                </ul>
              </div>
            }
          />
        </div>

        {/* Back to Main Chat */}
        <div className='navigation-section'>
          <Button
            label='Back to Personal Chat'
            icon='pi pi-arrow-left'
            className='p-button-outlined'
            onClick={() => navigate({ to: '/anonymous-chat' })}
          />
        </div>
      </div>
    </div>
  );
};

export default AnonymousRoom;
