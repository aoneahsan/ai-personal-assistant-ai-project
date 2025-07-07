import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  AudioRecordingState,
  Message,
  SpeechRecognitionState,
  TranscriptSegment,
} from './types';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface VoiceRecordingProps {
  onSendAudioMessage: (message: Message) => void;
  disabled?: boolean;
}

const VoiceRecording: React.FC<VoiceRecordingProps> = ({
  onSendAudioMessage,
  disabled = false,
}) => {
  // Audio recording states
  const [audioState, setAudioState] = useState<AudioRecordingState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioBlob: null,
    mediaRecorder: null,
    audioChunks: [],
    isProcessingAudio: false,
  });

  // Speech recognition states
  const [speechState, setSpeechState] = useState<SpeechRecognitionState>({
    finalTranscriptSegments: [],
    browserSupportsSpeechRecognition: false,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentRecognitionText = useRef<string>('');
  const recordingStartTime = useRef<number>(0);
  const lastSegmentEndTime = useRef<number>(0);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechState((prev) => ({
        ...prev,
        browserSupportsSpeechRecognition: true,
      }));

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        const currentTime = (Date.now() - recordingStartTime.current) / 1000;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;

            const words = transcript.trim().split(' ');
            const estimatedDuration = Math.max(1, words.length * 0.6);
            const segmentStartTime = lastSegmentEndTime.current;
            const segmentEndTime = Math.min(
              currentTime,
              segmentStartTime + estimatedDuration
            );

            const segment: TranscriptSegment = {
              text: transcript.trim(),
              startTime: Math.round(segmentStartTime * 10) / 10,
              endTime: Math.round(segmentEndTime * 10) / 10,
              confidence: confidence || 0.8,
            };

            setSpeechState((prev) => ({
              ...prev,
              finalTranscriptSegments: [
                ...prev.finalTranscriptSegments,
                segment,
              ],
            }));

            lastSegmentEndTime.current = segmentEndTime + 0.2;
          }
        }

        if (finalTranscript) {
          currentRecognitionText.current += finalTranscript;
        }
      };

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onend = () => {
        if (
          audioState.isRecording &&
          !audioState.isPaused &&
          speechState.browserSupportsSpeechRecognition
        ) {
          try {
            recognition.start();
          } catch (error) {
            console.log('Recognition restart failed:', error);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechState((prev) => ({
        ...prev,
        browserSupportsSpeechRecognition: false,
      }));
    }
  }, [
    audioState.isRecording,
    audioState.isPaused,
    speechState.browserSupportsSpeechRecognition,
  ]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioState((prev) => ({ ...prev, audioBlob: blob }));
        stream.getTracks().forEach((track) => track.stop());
        processCompleteAudioTranscript(blob);
      };

      recorder.start(1000);

      setAudioState((prev) => ({
        ...prev,
        mediaRecorder: recorder,
        isRecording: true,
        isPaused: false,
        recordingTime: 0,
        audioChunks: chunks,
      }));

      setSpeechState((prev) => ({
        ...prev,
        finalTranscriptSegments: [],
      }));

      currentRecognitionText.current = '';
      recordingStartTime.current = Date.now();
      lastSegmentEndTime.current = 0;

      // Start speech recognition
      if (
        recognitionRef.current &&
        speechState.browserSupportsSpeechRecognition
      ) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Speech recognition start failed:', error);
        }
      }

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setAudioState((prev) => ({
          ...prev,
          recordingTime: prev.recordingTime + 1,
        }));
      }, 1000);

      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error(
        'Unable to access microphone. Please check your permissions.'
      );
    }
  };

  const stopRecording = () => {
    if (audioState.mediaRecorder && audioState.isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setTimeout(() => {
        audioState.mediaRecorder!.stop();
        setAudioState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          mediaRecorder: null,
        }));

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
      }, 500);
    }
  };

  const processCompleteAudioTranscript = async (blob: Blob) => {
    setAudioState((prev) => ({ ...prev, isProcessingAudio: true }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const audioUrl = URL.createObjectURL(blob);
    let allTranscriptText = '';
    let combinedSegments: TranscriptSegment[] = [];

    if (speechState.finalTranscriptSegments.length > 0) {
      allTranscriptText = speechState.finalTranscriptSegments
        .map((seg) => seg.text)
        .join(' ');
      combinedSegments = [...speechState.finalTranscriptSegments];
    }

    if (
      currentRecognitionText.current &&
      !allTranscriptText.includes(currentRecognitionText.current)
    ) {
      const remainingText = currentRecognitionText.current
        .replace(allTranscriptText, '')
        .trim();
      if (remainingText) {
        allTranscriptText += (allTranscriptText ? ' ' : '') + remainingText;

        const words = remainingText.split(' ');
        const estimatedDuration = Math.max(1, words.length * 0.6);
        const segmentStartTime = lastSegmentEndTime.current;
        const segmentEndTime = Math.min(
          audioState.recordingTime,
          segmentStartTime + estimatedDuration
        );

        combinedSegments.push({
          text: remainingText,
          startTime: Math.round(segmentStartTime * 10) / 10,
          endTime: Math.round(segmentEndTime * 10) / 10,
          confidence: 0.7,
        });
      }
    }

    if (!allTranscriptText && speechState.browserSupportsSpeechRecognition) {
      allTranscriptText = 'Audio message recorded (no speech detected)';
    } else if (!allTranscriptText) {
      allTranscriptText = 'Audio message recorded';
    }

    const finalTranscript: TranscriptSegment[] =
      combinedSegments.length > 0
        ? combinedSegments
        : [
            {
              text: allTranscriptText,
              startTime: 0,
              endTime: audioState.recordingTime,
              confidence: 0.8,
            },
          ];

    const quickTranscript = allTranscriptText;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: 'audio',
      fileData: {
        name: 'voice-message.webm',
        size: blob.size,
        type: blob.type,
        url: audioUrl,
      },
      audioDuration: audioState.recordingTime,
      quickTranscript:
        quickTranscript.substring(0, 50) +
        (quickTranscript.length > 50 ? '...' : ''),
      transcript: finalTranscript,
    };

    onSendAudioMessage(newMessage);

    // Reset states
    setSpeechState((prev) => ({ ...prev, finalTranscriptSegments: [] }));
    currentRecognitionText.current = '';
    recordingStartTime.current = 0;
    lastSegmentEndTime.current = 0;
    setAudioState((prev) => ({ ...prev, isProcessingAudio: false }));

    toast.success('Voice message sent!');
  };

  const handleClick = () => {
    if (audioState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        icon={audioState.isRecording ? <FaStop /> : <FaMicrophone />}
        className={`voiceBtn ${audioState.isRecording ? 'recording' : ''}`}
        onClick={handleClick}
        disabled={disabled || audioState.isProcessingAudio}
        tooltip={
          audioState.isRecording
            ? `Recording ${formatDuration(audioState.recordingTime)}`
            : 'Record voice message'
        }
      />

      {/* Processing indicator */}
      {audioState.isProcessingAudio && (
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '0',
            fontSize: '12px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          Processing audio...
        </div>
      )}
    </>
  );
};

export default VoiceRecording;
