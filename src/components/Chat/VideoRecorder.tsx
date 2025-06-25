import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaCamera,
  FaStop,
  FaTimes,
  FaVideo,
  FaVideoSlash,
} from 'react-icons/fa';
import { useReactMediaRecorder } from 'react-media-recorder';

interface VideoRecorderProps {
  onVideoRecorded: (
    videoBlob: Blob,
    videoDuration: number,
    thumbnail?: string
  ) => void;
  onClose: () => void;
  maxDuration?: number; // in seconds
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoRecorded,
  onClose,
  maxDuration = 60, // 60 seconds default like WhatsApp
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    previewStream,
    clearBlobUrl,
  } = useReactMediaRecorder({
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: true,
    onStop: (blobUrl, blob) => {
      setRecordedVideoBlob(blob);
      setShowPreview(true);
      if (previewVideoRef.current) {
        previewVideoRef.current.src = blobUrl;
      }
    },
  });

  useEffect(() => {
    if (status === 'recording') {
      setIsRecording(true);
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);
    } else {
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, maxDuration]);

  const handleStartRecording = () => {
    setRecordingTime(0);
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateVideoThumbnail = (
    videoElement: HTMLVideoElement
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      if (ctx) {
        ctx.drawImage(videoElement, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve('');
      }
    });
  };

  const handleVideoMetadata = async () => {
    if (previewVideoRef.current && recordedVideoBlob) {
      const duration = previewVideoRef.current.duration;
      setVideoDuration(duration);

      // Generate thumbnail
      const thumbnail = await generateVideoThumbnail(previewVideoRef.current);
      setVideoThumbnail(thumbnail);
    }
  };

  const handleSendVideo = () => {
    if (recordedVideoBlob) {
      onVideoRecorded(recordedVideoBlob, videoDuration, videoThumbnail);
      handleClose();
    }
  };

  const handleRetake = () => {
    setShowPreview(false);
    setRecordedVideoBlob(null);
    setVideoThumbnail('');
    setVideoDuration(0);
    setRecordingTime(0);
    clearBlobUrl();
  };

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    clearBlobUrl();
    onClose();
  };

  const handleCapacitorPhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (!image.dataUrl) {
        throw new Error('No image data received');
      }

      // Convert to blob
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();

      // Create a simple file info object for the photo
      const photoUrl = URL.createObjectURL(blob);

      // You could call a callback here to handle the photo
      console.log('Photo captured:', {
        size: blob.size,
        type: blob.type,
        url: photoUrl,
      });
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  if (showPreview && recordedVideoBlob) {
    return (
      <div className='video-recorder-container preview-mode'>
        <div className='video-preview-wrapper'>
          <video
            ref={previewVideoRef}
            className='video-preview'
            controls
            onLoadedMetadata={handleVideoMetadata}
          />

          <div className='preview-overlay'>
            <div className='preview-header'>
              <Button
                icon={<FaTimes />}
                className='close-btn'
                onClick={handleRetake}
              />
              <span className='video-duration'>
                {formatTime(Math.floor(videoDuration))}
              </span>
            </div>
          </div>
        </div>

        <div className='preview-controls'>
          <Button
            icon={<FaTimes />}
            className='retake-btn'
            onClick={handleRetake}
            label='Retake'
          />
          <Button
            icon={<FaVideo />}
            className='send-btn'
            onClick={handleSendVideo}
            label='Send'
          />
        </div>
      </div>
    );
  }

  return (
    <div className='video-recorder-container'>
      <div className='camera-view-wrapper'>
        {previewStream && (
          <video
            autoPlay
            muted
            playsInline
            className='camera-preview'
            ref={(videoElement) => {
              if (videoElement && previewStream) {
                videoElement.srcObject = previewStream;
              }
            }}
          />
        )}

        <div className='camera-overlay'>
          <div className='camera-header'>
            <Button
              icon={<FaTimes />}
              className='close-btn'
              onClick={handleClose}
            />
            <Button
              icon={<FaCamera />}
              className='switch-camera-btn'
              onClick={switchCamera}
            />
          </div>

          {isRecording && (
            <div className='recording-indicator'>
              <div className='recording-dot' />
              <span className='recording-time'>
                {formatTime(recordingTime)}
              </span>
              <div className='progress-bar'>
                <div
                  className='progress-fill'
                  style={{
                    width: `${(recordingTime / maxDuration) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className='camera-controls'>
          <Button
            icon={<FaCamera />}
            className='photo-btn'
            onClick={handleCapacitorPhoto}
          />

          <Button
            icon={isRecording ? <FaStop /> : <FaVideo />}
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={status === 'acquiring_media'}
          />

          <Button
            icon={previewStream ? <FaVideo /> : <FaVideoSlash />}
            className='camera-toggle-btn'
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;
