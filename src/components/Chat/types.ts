export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'audio' | 'image' | 'file' | 'video';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  audioDuration?: number;
  videoDuration?: number;
  videoThumbnail?: string;
  quickTranscript?: string;
  transcript?: TranscriptSegment[];
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  status?: string;
}

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  isProcessingAudio: boolean;
}

export interface SpeechRecognitionState {
  finalTranscriptSegments: TranscriptSegment[];
  browserSupportsSpeechRecognition: boolean;
}
