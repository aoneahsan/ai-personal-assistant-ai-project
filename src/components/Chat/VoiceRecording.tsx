import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import {
  FaMicrophone,
  FaPause,
  FaPlay,
  FaSquare,
  FaTimes,
} from 'react-icons/fa';
import {
  AudioRecordingState,
  Message,
  SpeechRecognitionState,
  TranscriptSegment,
} from './types';

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

  const recognitionRef = useRef<any>(null);
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
      console.log('Speech recognition is supported');

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result event:', event);
        let finalTranscript = '';

        const currentTime = (Date.now() - recordingStartTime.current) / 1000;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          console.log(
            `Result ${i}: "${transcript}", Final: ${event.results[i].isFinal}, Confidence: ${confidence}`
          );

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

            console.log('Adding segment with timing:', segment);
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
          console.log(
            'Updated current recognition text:',
            currentRecognitionText.current
          );
        }
      };

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (
          audioState.isRecording &&
          !audioState.isPaused &&
          speechState.browserSupportsSpeechRecognition
        ) {
          try {
            console.log('Restarting speech recognition...');
            recognition.start();
          } catch (error) {
            console.log('Recognition restart failed:', error);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (
          event.error === 'not-allowed' ||
          event.error === 'service-not-allowed'
        ) {
          console.error('Speech recognition permission denied');
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.log('Speech recognition not supported');
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording...');

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
        console.log('MediaRecorder stopped, processing audio...');
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
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const pauseRecording = () => {
    if (
      audioState.mediaRecorder &&
      audioState.isRecording &&
      !audioState.isPaused
    ) {
      audioState.mediaRecorder.pause();
      setAudioState((prev) => ({ ...prev, isPaused: true }));

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (
      audioState.mediaRecorder &&
      audioState.isRecording &&
      audioState.isPaused
    ) {
      audioState.mediaRecorder.resume();
      setAudioState((prev) => ({ ...prev, isPaused: false }));

      if (
        recognitionRef.current &&
        speechState.browserSupportsSpeechRecognition
      ) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Speech recognition resume failed:', error);
        }
      }

      recordingIntervalRef.current = setInterval(() => {
        setAudioState((prev) => ({
          ...prev,
          recordingTime: prev.recordingTime + 1,
        }));
      }, 1000);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');

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

  const cancelRecording = () => {
    if (audioState.mediaRecorder) {
      audioState.mediaRecorder.stop();
    }

    setAudioState({
      isRecording: false,
      isPaused: false,
      recordingTime: 0,
      audioBlob: null,
      mediaRecorder: null,
      audioChunks: [],
      isProcessingAudio: false,
    });

    setSpeechState((prev) => ({
      ...prev,
      finalTranscriptSegments: [],
    }));

    currentRecognitionText.current = '';
    recordingStartTime.current = 0;
    lastSegmentEndTime.current = 0;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const processCompleteAudioTranscript = async (blob: Blob) => {
    setAudioState((prev) => ({ ...prev, isProcessingAudio: true }));

    await new Promise((resolve) => setTimeout(resolve, 2000));

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
  };

  return (
    <>
      <div className='voice-controls'>
        {!audioState.isRecording ? (
          <Button
            icon={<FaMicrophone />}
            className='voice-btn'
            onClick={startRecording}
            disabled={disabled || audioState.isProcessingAudio}
          />
        ) : (
          <div className='recording-controls'>
            <Button
              icon={audioState.isPaused ? <FaPlay /> : <FaPause />}
              className={audioState.isPaused ? 'resume-btn' : 'pause-btn'}
              onClick={audioState.isPaused ? resumeRecording : pauseRecording}
              size='small'
            />
            <Button
              icon={<FaSquare />}
              className='stop-btn'
              onClick={stopRecording}
              size='small'
            />
            <Button
              icon={<FaTimes />}
              className='cancel-btn'
              onClick={cancelRecording}
              size='small'
            />
          </div>
        )}
      </div>

      {/* Recording Status */}
      {audioState.isRecording && (
        <div className='recording-status'>
          <div className='recording-info'>
            <span>
              🔴 {audioState.isPaused ? 'Paused' : 'Recording'}...{' '}
              {formatDuration(audioState.recordingTime)}
            </span>
          </div>
        </div>
      )}

      {/* Processing Audio Indicator */}
      {audioState.isProcessingAudio && (
        <div className='processing-audio-status'>
          <div className='processing-info'>
            <div className='processing-spinner'></div>
            <span>Processing audio and generating transcript...</span>
          </div>
        </div>
      )}

      {/* Browser Support Warning */}
      {!speechState.browserSupportsSpeechRecognition && (
        <div className='speech-support-warning'>
          <p>
            ⚠️ Speech recognition not supported in this browser. Audio will be
            recorded without transcription.
          </p>
        </div>
      )}
    </>
  );
};

export default VoiceRecording;
