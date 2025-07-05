import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import React, { useEffect, useRef, useState } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { FaEllipsisV, FaPause, FaPlay } from 'react-icons/fa';

interface TranscriptSegment {
  text: string;
  startTime?: number;
  endTime?: number;
  confidence?: number;
  speakerId?: string;
}

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  isPlaying: boolean;
  messageId: string;
  onTogglePlay: () => void;
  onShowTranscript: () => void;
  transcript?: TranscriptSegment[];
  fileName?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  duration,
  isPlaying,
  onTogglePlay,
  onShowTranscript,
  transcript,
  fileName = 'audio-message.webm',
}) => {
  const playerRef = useRef<H5AudioPlayer>(null);
  const audioMenuRef = useRef<Menu>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);

  useEffect(() => {
    const audio = playerRef.current?.audio?.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleListen = (e: Event) => {
    const audio = e.target as HTMLAudioElement;
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = (e: Event) => {
    const audio = e.target as HTMLAudioElement;
    setTotalDuration(audio.duration || duration);
  };

  const handleEnded = () => {
    setCurrentTime(0);
    onTogglePlay(); // This will set isPlaying to false
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = playerRef.current?.audio?.current;
    if (audio && totalDuration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * totalDuration;

      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const getAudioMenuItems = () => [
    {
      label: 'Read Transcript',
      icon: 'pi pi-file-word',
      command: () => onShowTranscript(),
    },
    {
      label: 'Download Audio',
      icon: 'pi pi-download',
      command: () => {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = fileName;
        link.click();
      },
    },
    {
      label: 'Copy Transcript',
      icon: 'pi pi-copy',
      command: () => {
        if (transcript) {
          const fullText = transcript
            .map((seg: TranscriptSegment) => seg.text)
            .join(' ');
          navigator.clipboard.writeText(fullText);
        }
      },
    },
  ];

  // Calculate progress percentage
  const progressPercentage =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className='whatsapp-audio-player'>
      <Button
        icon={isPlaying ? <FaPause /> : <FaPlay />}
        className='audio-play-btn'
        size='small'
        onClick={onTogglePlay}
      />

      <div className='audio-waveform-container'>
        <div
          className='audio-waveform'
          onClick={handleSeek}
        >
          <div
            className='audio-progress'
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className='audio-time-info'>
          <span className='current-time'>{formatDuration(currentTime)}</span>
          <span className='duration-separator'>&nbsp;/&nbsp;</span>
          <span className='total-duration'>
            {formatDuration(totalDuration)}
          </span>
        </div>
      </div>

      <Button
        icon={<FaEllipsisV />}
        className='audio-menu-btn'
        size='small'
        onClick={(e) => audioMenuRef.current?.toggle(e)}
      />

      <Menu
        ref={audioMenuRef}
        model={getAudioMenuItems()}
        popup
      />

      {/* Hidden H5AudioPlayer for functionality */}
      <div style={{ display: 'none' }}>
        <H5AudioPlayer
          ref={playerRef}
          src={audioUrl}
          onListen={handleListen}
          onLoadedMetaData={handleLoadedMetadata}
          onEnded={handleEnded}
          showJumpControls={false}
          showSkipControls={false}
          showDownloadProgress={false}
          customProgressBarSection={[]}
          customControlsSection={[]}
          autoPlayAfterSrcChange={false}
          listenInterval={100}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
