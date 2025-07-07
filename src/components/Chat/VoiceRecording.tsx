import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { FaMicrophone, FaStop, FaPause, FaPlay } from 'react-icons/fa';
import { Message } from './types';

interface VoiceRecordingProps {
  onSendAudioMessage: (message: Message) => void;
  disabled?: boolean;
}

const VoiceRecording: React.FC<VoiceRecordingProps> = ({
  onSendAudioMessage,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const sendAudioMessage = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const message: Message = {
        id: Date.now().toString() + Math.random(),
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
        type: 'audio',
        fileData: {
          name: 'voice_message.webm',
          size: audioBlob.size,
          type: 'audio/webm',
          url: audioUrl,
        },
        audioDuration: recordingTime,
      };

      onSendAudioMessage(message);
      
      // Reset state
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recording-container">
      {!isRecording && !audioBlob && (
        <Button
          icon={<FaMicrophone />}
          className="voice-btn"
          onClick={startRecording}
          disabled={disabled}
          tooltip="Record voice message"
          tooltipOptions={{ position: 'top' }}
        />
      )}

      {isRecording && (
        <div className="recording-controls">
          <span className="recording-time">{formatTime(recordingTime)}</span>
          
          {!isPaused ? (
            <Button
              icon={<FaPause />}
              className="pause-btn"
              onClick={pauseRecording}
              tooltip="Pause recording"
              tooltipOptions={{ position: 'top' }}
            />
          ) : (
            <Button
              icon={<FaPlay />}
              className="resume-btn"
              onClick={resumeRecording}
              tooltip="Resume recording"
              tooltipOptions={{ position: 'top' }}
            />
          )}

          <Button
            icon={<FaStop />}
            className="stop-btn"
            onClick={stopRecording}
            tooltip="Stop recording"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      )}

      {audioBlob && (
        <div className="audio-preview">
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <Button
            label="Send"
            className="send-audio-btn"
            onClick={sendAudioMessage}
          />
          <Button
            label="Cancel"
            className="cancel-audio-btn"
            onClick={() => {
              setAudioBlob(null);
              setRecordingTime(0);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VoiceRecording;