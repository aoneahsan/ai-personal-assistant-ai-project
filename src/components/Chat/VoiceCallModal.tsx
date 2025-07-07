import { VoiceCallSession, VoiceCallState } from '@/services/voiceCallService';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeDown,
  FaVolumeUp,
} from 'react-icons/fa';
import { MdCall, MdCallEnd } from 'react-icons/md';
import styles from './VoiceCallModal.module.scss';

interface VoiceCallModalProps {
  isVisible: boolean;
  callState: VoiceCallState;
  onAnswer: () => void;
  onDecline: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onClose: () => void;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isVisible,
  callState,
  onAnswer,
  onDecline,
  onEndCall,
  onToggleMute,
  onClose,
}) => {
  const [volume, setVolume] = useState(100);
  const audioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get display name
  const getDisplayName = (callSession: VoiceCallSession | null): string => {
    if (!callSession) return 'Unknown';
    return callState.isInitiator
      ? callSession.receiverEmail.split('@')[0]
      : callSession.initiatorEmail.split('@')[0];
  };

  // Get call status text
  const getCallStatusText = (): string => {
    if (callState.connectionState === 'connecting') return 'Connecting...';
    if (callState.isRinging && !callState.isInitiator) return 'Incoming call';
    if (callState.isRinging && callState.isInitiator) return 'Calling...';
    if (callState.isConnected) return 'Connected';
    if (callState.connectionState === 'failed') return 'Connection failed';
    return 'Unknown';
  };

  // Setup remote audio stream
  useEffect(() => {
    if (callState.remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = callState.remoteStream;
      remoteAudioRef.current.volume = volume / 100;
    }
  }, [callState.remoteStream, volume]);

  // Handle ringing sound
  useEffect(() => {
    if (callState.isRinging && !callState.isConnected) {
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [callState.isRinging, callState.isConnected]);

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = newVolume / 100;
    }
  };

  // Render call controls
  const renderCallControls = () => {
    if (callState.isRinging && !callState.isInitiator) {
      // Incoming call controls
      return (
        <div className={styles.callActions}>
          <Button
            icon={<MdCall />}
            className={`${styles.callButton} ${styles.answerButton}`}
            onClick={onAnswer}
            rounded
            tooltip='Answer'
            tooltipOptions={{ position: 'top' }}
          />
          <Button
            icon={<MdCallEnd />}
            className={`${styles.callButton} ${styles.declineButton}`}
            onClick={onDecline}
            rounded
            tooltip='Decline'
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      );
    }

    if (callState.isConnected || callState.isRinging) {
      // Active call controls
      return (
        <div className={styles.callActions}>
          <Button
            icon={callState.isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            className={`${styles.callButton} ${styles.muteButton} ${callState.isMuted ? styles.muted : ''}`}
            onClick={onToggleMute}
            rounded
            tooltip={callState.isMuted ? 'Unmute' : 'Mute'}
            tooltipOptions={{ position: 'top' }}
          />
          <Button
            icon={<MdCallEnd />}
            className={`${styles.callButton} ${styles.endButton}`}
            onClick={onEndCall}
            rounded
            tooltip='End Call'
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      );
    }

    return null;
  };

  // Render volume control
  const renderVolumeControl = () => {
    if (!callState.isConnected) return null;

    return (
      <div className={styles.volumeControl}>
        <FaVolumeDown className={styles.volumeIcon} />
        <input
          type='range'
          min='0'
          max='100'
          value={volume}
          onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
          className={styles.volumeSlider}
        />
        <FaVolumeUp className={styles.volumeIcon} />
      </div>
    );
  };

  if (!isVisible || !callState.callSession) return null;

  return (
    <>
      <Dialog
        visible={isVisible}
        onHide={onClose}
        header={null}
        modal
        closable={false}
        draggable={false}
        resizable={false}
        className={styles.voiceCallModal}
        content={() => (
          <div className={styles.callContainer}>
            {/* Call Header */}
            <div className={styles.callHeader}>
              <div className={styles.callStatus}>
                <span className={styles.statusText}>{getCallStatusText()}</span>
                {callState.isConnected && (
                  <span className={styles.duration}>
                    {formatDuration(callState.callDuration)}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <Avatar
                label={getDisplayName(callState.callSession)
                  .charAt(0)
                  .toUpperCase()}
                className={styles.contactAvatar}
                size='xlarge'
                shape='circle'
              />
              <h3 className={styles.contactName}>
                {getDisplayName(callState.callSession)}
              </h3>
              <p className={styles.contactEmail}>
                {callState.isInitiator
                  ? callState.callSession?.receiverEmail
                  : callState.callSession?.initiatorEmail}
              </p>
            </div>

            {/* Connection Status */}
            <div className={styles.connectionStatus}>
              <div
                className={`${styles.statusIndicator} ${styles[callState.connectionState]}`}
              >
                <div className={styles.pulse}></div>
              </div>
              {callState.connectionState === 'connecting' && (
                <div className={styles.connectingAnimation}>
                  <div className={styles.wave}></div>
                  <div className={styles.wave}></div>
                  <div className={styles.wave}></div>
                </div>
              )}
            </div>

            {/* Volume Control */}
            {renderVolumeControl()}

            {/* Call Controls */}
            {renderCallControls()}

            {/* Connection Quality */}
            {callState.isConnected && (
              <div className={styles.connectionQuality}>
                <span className={styles.qualityText}>
                  {callState.isMuted ? 'Muted' : 'Connected'}
                </span>
              </div>
            )}
          </div>
        )}
      />

      {/* Audio Elements */}
      <audio
        ref={audioRef}
        loop
        preload='auto'
        className={styles.hiddenAudio}
      >
        <source
          src='/sounds/ringtone.mp3'
          type='audio/mpeg'
        />
        <source
          src='/sounds/ringtone.ogg'
          type='audio/ogg'
        />
        {/* Fallback for browsers that don't support audio */}
      </audio>

      <audio
        ref={remoteAudioRef}
        autoPlay
        className={styles.hiddenAudio}
      />
    </>
  );
};

export default VoiceCallModal;
