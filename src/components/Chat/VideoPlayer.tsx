import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import React, { useEffect, useRef, useState } from 'react';
import { FaEllipsisV, FaPause, FaPlay } from 'react-icons/fa';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string;
  duration: number;
  fileName?: string;
  onLoadedMetadata?: (duration: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  duration,
  fileName = 'video-message.mp4',
  onLoadedMetadata,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoMenuRef = useRef<Menu>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(video.duration);
      onLoadedMetadata?.(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onLoadedMetadata]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoClick = () => {
    togglePlayPause();
    setShowControls(true);

    // Hide controls after 3 seconds
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * totalDuration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const getVideoMenuItems = () => [
    {
      label: 'Download Video',
      icon: 'pi pi-download',
      command: () => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = fileName;
        link.click();
      },
    },
    {
      label: 'Copy Video URL',
      icon: 'pi pi-copy',
      command: () => {
        navigator.clipboard.writeText(videoUrl);
      },
    },
  ];

  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className='video-player-container'>
      <div
        className='video-wrapper'
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className='video-element'
          src={videoUrl}
          poster={thumbnail}
          preload='metadata'
          playsInline
        />

        {showControls && (
          <div className='video-overlay'>
            <div className='video-controls'>
              <Button
                icon={isPlaying ? <FaPause /> : <FaPlay />}
                className='play-pause-btn'
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
              />
            </div>

            <div className='video-progress-container'>
              <div
                className='video-progress-bar'
                onClick={handleProgressClick}
              >
                <div
                  className='video-progress-fill'
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className='video-time-info'>
                <span className='current-time'>
                  {formatDuration(currentTime)}
                </span>
                <span className='duration-separator'>&nbsp;/&nbsp;</span>
                <span className='total-duration'>
                  {formatDuration(totalDuration)}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isPlaying && currentTime === 0 && (
          <div className='video-play-overlay'>
            <Button
              icon={<FaPlay />}
              className='play-button-large'
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            />
          </div>
        )}
      </div>

      <div className='video-meta'>
        <span className='video-duration'>{formatDuration(totalDuration)}</span>
        <Button
          icon={<FaEllipsisV />}
          className='video-menu-btn'
          size='small'
          onClick={(e) => videoMenuRef.current?.toggle(e)}
        />

        <Menu
          ref={videoMenuRef}
          model={getVideoMenuItems()}
          popup
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
