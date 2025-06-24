export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence?: number;
}

export interface Message {
  id: string;
  text?: string;
  sender: 'me' | 'other';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'file' | 'audio' | 'image' | 'video';
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  audioDuration?: number;
  transcript?: TranscriptSegment[];
  quickTranscript?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
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
