import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React from 'react';
import { Message } from './types';

interface TranscriptDialogProps {
  visible: boolean;
  onHide: () => void;
  message: Message | null;
}

const TranscriptDialog: React.FC<TranscriptDialogProps> = ({
  visible,
  onHide,
  message,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleCopyTranscript = () => {
    if (message?.transcript) {
      const fullText = message.transcript.map((seg) => seg.text).join(' ');
      navigator.clipboard.writeText(fullText).then(() => {
        // Show success feedback
        const button = document.querySelector(
          '.copy-transcript-btn'
        ) as HTMLElement;
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✓ Copied!';
          button.style.background = '#28a745';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
          }, 2000);
        }
      });
    }
  };

  return (
    <Dialog
      header='Audio Transcript'
      visible={visible}
      style={{ width: '90vw', maxWidth: '600px' }}
      onHide={onHide}
      className='transcript-dialog'
    >
      {message && message.transcript && (
        <div className='transcript-content'>
          <div className='transcript-header-info'>
            <p>
              <strong>Duration:</strong>{' '}
              {formatDuration(message.audioDuration || 0)}
            </p>
            <p>
              <strong>Segments:</strong> {message.transcript.length}
            </p>
          </div>
          <div className='transcript-segments'>
            {message.transcript.map((segment, index) => (
              <div
                key={index}
                className='transcript-segment'
              >
                <div className='segment-timing'>
                  <span className='start-time'>
                    {formatTimestamp(segment.startTime)}
                  </span>
                  <span className='separator'>→</span>
                  <span className='end-time'>
                    {formatTimestamp(segment.endTime)}
                  </span>
                  {segment.confidence && (
                    <span className='confidence'>
                      ({Math.round(segment.confidence * 100)}%)
                    </span>
                  )}
                </div>
                <div className='segment-text'>{segment.text}</div>
              </div>
            ))}
          </div>
          <div className='transcript-actions'>
            <Button
              label='Copy Full Transcript'
              icon='pi pi-copy'
              onClick={handleCopyTranscript}
              className='copy-transcript-btn'
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default TranscriptDialog;
