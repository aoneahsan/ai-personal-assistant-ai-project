import { TranscriptSegment, chatService } from '@/services/chatService';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface MediaMessageManagerProps {
  chatId: string;
  senderId: string;
  senderEmail: string;
  onMessageSent?: (messageId: string) => void;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  messageType: 'image' | 'audio' | 'video';
  error?: string;
}

const MediaMessageManager: React.FC<MediaMessageManagerProps> = ({
  chatId,
  senderId,
  senderEmail,
  onMessageSent,
}) => {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const toastRef = useRef<Toast>(null);

  // File type validation
  const validateFile = (
    file: File
  ): {
    isValid: boolean;
    type: 'image' | 'audio' | 'video' | null;
    error?: string;
  } => {
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      return {
        isValid: false,
        type: null,
        error: 'File size must be less than 50MB',
      };
    }

    if (file.type.startsWith('image/')) {
      return { isValid: true, type: 'image' };
    } else if (file.type.startsWith('audio/')) {
      return { isValid: true, type: 'audio' };
    } else if (file.type.startsWith('video/')) {
      return { isValid: true, type: 'video' };
    }

    return {
      isValid: false,
      type: null,
      error: 'Only image, audio, and video files are supported',
    };
  };

  // Get image dimensions
  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  // Get audio/video duration
  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const media = document.createElement(
        file.type.startsWith('audio/') ? 'audio' : 'video'
      );
      const url = URL.createObjectURL(file);

      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(media.duration);
      };

      media.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load media'));
      };

      media.src = url;
    });
  };

  // Simulate audio transcription (in real implementation, this would call a transcription service)
  const generateMockTranscript = (duration: number): TranscriptSegment[] => {
    const segments: TranscriptSegment[] = [];
    const sampleTexts = [
      'Hello, this is an audio message.',
      'I wanted to share this with you.',
      'Let me know what you think about it.',
      'Thanks for listening!',
    ];

    const segmentDuration = duration / sampleTexts.length;

    sampleTexts.forEach((text, index) => {
      segments.push({
        text,
        startTime: index * segmentDuration,
        endTime: (index + 1) * segmentDuration,
        confidence: 0.95,
        speakerId: 'speaker_1',
      });
    });

    return segments;
  };

  // Handle file upload
  const handleFileUpload = async (event: FileUploadHandlerEvent) => {
    const files = event.files;

    if (!files || files.length === 0) return;

    for (const file of files) {
      const validation = validateFile(file);

      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file type');
        continue;
      }

      const uploadProgress: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading',
        messageType: validation.type!,
      };

      setUploadQueue((prev) => [...prev, uploadProgress]);

      try {
        // Update progress to processing
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.file === file
              ? { ...item, progress: 50, status: 'processing' }
              : item
          )
        );

        let messageId: string;

        switch (validation.type) {
          case 'image':
            const dimensions = await getImageDimensions(file);
            messageId = await chatService.sendImageMessage({
              file,
              chatId,
              senderId,
              senderEmail,
              dimensions,
            });
            break;

          case 'audio':
            const audioDuration = await getMediaDuration(file);
            const transcript = generateMockTranscript(audioDuration);
            const quickTranscript = transcript.map((s) => s.text).join(' ');

            messageId = await chatService.sendAudioMessage({
              file,
              chatId,
              senderId,
              senderEmail,
              duration: audioDuration,
              transcript,
              quickTranscript,
            });
            break;

          case 'video':
            const videoDuration = await getMediaDuration(file);
            messageId = await chatService.sendVideoMessage({
              file,
              chatId,
              senderId,
              senderEmail,
              duration: videoDuration,
            });
            break;

          default:
            throw new Error('Unsupported file type');
        }

        // Update progress to completed
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.file === file
              ? { ...item, progress: 100, status: 'completed' }
              : item
          )
        );

        toast.success(`${validation.type} message sent successfully!`);
        onMessageSent?.(messageId);

        // Remove from queue after 2 seconds
        setTimeout(() => {
          setUploadQueue((prev) => prev.filter((item) => item.file !== file));
        }, 2000);
      } catch (error) {
        console.error('Upload error:', error);

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.file === file
              ? {
                  ...item,
                  status: 'error',
                  error:
                    error instanceof Error ? error.message : 'Upload failed',
                }
              : item
          )
        );

        toast.error(`Failed to send ${validation.type} message`);
      }
    }
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'pi pi-upload';
      case 'processing':
        return 'pi pi-cog pi-spin';
      case 'completed':
        return 'pi pi-check';
      case 'error':
        return 'pi pi-times';
      default:
        return 'pi pi-file';
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'blue';
      case 'processing':
        return 'orange';
      case 'completed':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <Toast ref={toastRef} />

      {/* Upload Queue Display */}
      {uploadQueue.length > 0 && (
        <div className='upload-queue mb-3'>
          {uploadQueue.map((upload, index) => (
            <div
              key={index}
              className='upload-item p-3 mb-2 border-1 border-300 border-round'
            >
              <div className='flex align-items-center gap-3'>
                <i
                  className={`${getStatusIcon(upload.status)} text-${getStatusColor(upload.status)}-500`}
                ></i>
                <div className='flex-1'>
                  <div className='flex justify-content-between align-items-center mb-2'>
                    <span className='font-semibold'>{upload.file.name}</span>
                    <span className='text-sm text-500'>
                      {(upload.file.size / (1024 * 1024)).toFixed(1)}MB
                    </span>
                  </div>
                  {upload.status !== 'error' && (
                    <ProgressBar
                      value={upload.progress}
                      className='h-1rem'
                    />
                  )}
                  {upload.status === 'error' && upload.error && (
                    <small className='text-red-500'>{upload.error}</small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Upload Button */}
      <Button
        icon='pi pi-paperclip'
        className='p-button-text p-button-rounded'
        tooltip='Attach file'
        tooltipOptions={{ position: 'top' }}
        onClick={() => setShowUploadDialog(true)}
      />

      {/* Upload Dialog */}
      <Dialog
        header='📎 Attach Media File'
        visible={showUploadDialog}
        style={{ width: '90vw', maxWidth: '500px' }}
        onHide={() => setShowUploadDialog(false)}
        dismissableMask
      >
        <div className='upload-dialog-content'>
          <div className='mb-4'>
            <p className='text-600 line-height-3 m-0'>
              Upload images, audio, or video files. Files are automatically
              deleted after 10 days.
            </p>
          </div>

          <FileUpload
            mode='basic'
            name='mediaFile'
            accept='image/*,audio/*,video/*'
            maxFileSize={50000000} // 50MB
            customUpload
            uploadHandler={handleFileUpload}
            chooseLabel='Choose File'
            className='w-full'
            auto
          />

          <div className='mt-4 p-3 bg-blue-50 border-round'>
            <div className='flex align-items-center gap-2 mb-2'>
              <i className='pi pi-info-circle text-blue-600'></i>
              <strong className='text-blue-900'>File Information</strong>
            </div>
            <ul className='text-blue-800 m-0 pl-3 text-sm line-height-3'>
              <li>Maximum file size: 50MB</li>
              <li>Supported: Images, Audio, Video</li>
              <li>Audio files will include transcripts</li>
              <li>Files are deleted after 10 days</li>
            </ul>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default MediaMessageManager;
