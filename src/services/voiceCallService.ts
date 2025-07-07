import { db } from '@/services/firebase';
import { PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS } from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import SimplePeer from 'simple-peer';
import { logError, logInfo } from '@/sentryErrorLogging';

// Firebase configuration validation
const validateFirebaseConfig = (): boolean => {
  if (!db) {
    consoleError(
      '❌ Firebase database not initialized. Please check your Firebase configuration in .env file.'
    );
    return false;
  }

  if (!addDoc || !collection || !doc) {
    consoleError('❌ Firebase Firestore functions not properly imported.');
    return false;
  }

  return true;
};

// Voice Call Interfaces
export interface VoiceCallSession {
  id?: string;
  callId: string;
  initiatorId: string;
  initiatorEmail: string;
  receiverId: string;
  receiverEmail: string;
  chatId: string;
  status:
    | 'initiating'
    | 'ringing'
    | 'answered'
    | 'ended'
    | 'declined'
    | 'missed';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
  // WebRTC signaling data
  offer?: string;
  answer?: string;
  iceCandidates?: string[];
}

export interface VoiceCallSignal {
  id?: string;
  callId: string;
  senderId: string;
  receiverId: string;
  signalType:
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'end-call'
    | 'decline-call';
  signalData?: SimplePeer.SignalData;
  timestamp: Date;
}

export interface VoiceCallState {
  isInCall: boolean;
  callSession: VoiceCallSession | null;
  isInitiator: boolean;
  isConnected: boolean;
  isRinging: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peer: SimplePeer.Instance | null;
  callDuration: number;
  isMuted: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

type VoiceCallEventCallback = (state: VoiceCallState) => void;
type IncomingCallCallback = (callSession: VoiceCallSession) => void;

export class VoiceCallService {
  private readonly CALLS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_voice_calls`;
  private readonly SIGNALS_COLLECTION = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_voice_call_signals`;

  // Current call state
  private currentCallState: VoiceCallState = {
    isInCall: false,
    callSession: null,
    isInitiator: false,
    isConnected: false,
    isRinging: false,
    localStream: null,
    remoteStream: null,
    peer: null,
    callDuration: 0,
    isMuted: false,
    connectionState: 'disconnected',
  };

  // Event callbacks
  private stateChangeCallbacks: VoiceCallEventCallback[] = [];
  private incomingCallCallbacks: IncomingCallCallback[] = [];

  // Timers
  private callTimer: NodeJS.Timeout | null = null;
  private ringTimer: NodeJS.Timeout | null = null;

  // Firebase listeners
  private signalListener: (() => void) | null = null;
  private callListener: (() => void) | null = null;

  constructor() {
    // Don't call setupIncomingCallListener here as it's empty
    // It will be set up when user logs in via setupIncomingCallListenerForUser
  }

  // Subscribe to state changes
  onStateChange(callback: VoiceCallEventCallback) {
    this.stateChangeCallbacks.push(callback);
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Subscribe to incoming calls
  onIncomingCall(callback: IncomingCallCallback) {
    this.incomingCallCallbacks.push(callback);
    return () => {
      this.incomingCallCallbacks = this.incomingCallCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Get current call state
  getCallState(): VoiceCallState {
    return { ...this.currentCallState };
  }

  // Initiate a voice call
  async initiateCall(
    initiatorId: string,
    initiatorEmail: string,
    receiverId: string,
    receiverEmail: string,
    chatId: string
  ): Promise<string> {
    try {
      consoleLog('📞 Initiating voice call...', {
        initiatorId,
        receiverId,
        chatId,
      });

      // Validate Firebase configuration
      if (!validateFirebaseConfig()) {
        throw new Error(
          'Firebase is not properly configured. Please check your environment variables.'
        );
      }

      // Check if already in a call
      if (this.currentCallState.isInCall) {
        throw new Error('Already in a call');
      }

      // Generate call ID
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create call session
      const callSession: Omit<VoiceCallSession, 'id'> = {
        callId,
        initiatorId,
        initiatorEmail,
        receiverId,
        receiverEmail,
        chatId,
        status: 'initiating',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, this.CALLS_COLLECTION), {
        ...callSession,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Get user media
      const localStream = await this.getUserMedia();

      // Create peer connection
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      // Update call state
      this.currentCallState = {
        isInCall: true,
        callSession: { ...callSession, id: docRef.id },
        isInitiator: true,
        isConnected: false,
        isRinging: true,
        localStream,
        remoteStream: null,
        peer,
        callDuration: 0,
        isMuted: false,
        connectionState: 'connecting',
      };

      // Setup peer event handlers
      this.setupPeerEventHandlers(peer, callId);

      // Start listening for signals
      this.setupSignalListener(callId);

      // Update call status to ringing
      await this.updateCallStatus(docRef.id, 'ringing');

      // Start ring timer (auto-end call after 30 seconds if not answered)
      this.startRingTimer();

      this.notifyStateChange();

      consoleLog('✅ Voice call initiated successfully:', callId);
      return callId;
    } catch (error) {
      consoleError('❌ Error initiating voice call:', error);
      
      logError(error instanceof Error ? error : new Error('Voice call initiation failed'), {
        initiatorId,
        receiverId,
        chatId,
        errorType: 'voice_call_initiation_error',
        step: 'initiate_call',
      });
      
      await this.cleanupCall();
      
      // Enhance error message for better user experience
      if (error instanceof Error) {
        if (error.message.includes('Permission denied')) {
          throw new Error('Microphone access is required for voice calls. Please allow microphone access and try again.');
        } else if (error.message.includes('NotFoundError')) {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (error.message.includes('NotAllowedError')) {
          throw new Error('Microphone access was denied. Please allow microphone access in your browser settings.');
        } else if (error.message.includes('Firebase')) {
          throw new Error('Unable to connect to call service. Please check your internet connection and try again.');
        }
      }
      
      throw error;
    }
  }

  // Answer an incoming call
  async answerCall(callId: string): Promise<void> {
    try {
      consoleLog('📞 Answering call:', callId);

      if (
        !this.currentCallState.callSession ||
        this.currentCallState.callSession.callId !== callId
      ) {
        throw new Error('Invalid call session');
      }

      // Get user media
      const localStream = await this.getUserMedia();

      // Create peer connection
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: localStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      // Update call state
      this.currentCallState.localStream = localStream;
      this.currentCallState.peer = peer;
      this.currentCallState.isRinging = false;
      this.currentCallState.connectionState = 'connecting';

      // Setup peer event handlers
      this.setupPeerEventHandlers(peer, callId);

      // Update call status
      if (this.currentCallState.callSession?.id) {
        await this.updateCallStatus(
          this.currentCallState.callSession.id,
          'answered'
        );
      }

      // Start call timer
      this.startCallTimer();

      this.notifyStateChange();

      consoleLog('✅ Call answered successfully');
    } catch (error) {
      consoleError('❌ Error answering call:', error);
      
      logError(error instanceof Error ? error : new Error('Voice call answer failed'), {
        callId,
        errorType: 'voice_call_answer_error',
        step: 'answer_call',
      });
      
      await this.endCall();
      
      // Enhance error message for better user experience
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
          throw new Error('Microphone access is required to answer calls. Please allow microphone access and try again.');
        } else if (error.message.includes('NotFoundError')) {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        }
      }
      
      throw error;
    }
  }

  // Decline an incoming call
  async declineCall(callId: string): Promise<void> {
    try {
      consoleLog('📞 Declining call:', callId);

      if (this.currentCallState.callSession?.id) {
        await this.updateCallStatus(
          this.currentCallState.callSession.id,
          'declined'
        );

        // Send decline signal
        await this.sendSignal(callId, 'decline-call');
      }

      await this.cleanupCall();

      consoleLog('✅ Call declined successfully');
    } catch (error) {
      consoleError('❌ Error declining call:', error);
      
      logError(error instanceof Error ? error : new Error('Voice call decline failed'), {
        callId,
        errorType: 'voice_call_decline_error',
        step: 'decline_call',
      });
      
      await this.cleanupCall();
    }
  }

  // End an active call
  async endCall(): Promise<void> {
    try {
      consoleLog('📞 Ending call...');

      if (this.currentCallState.callSession) {
        const callId = this.currentCallState.callSession.callId;

        // Send end call signal
        await this.sendSignal(callId, 'end-call');

        // Update call status
        if (this.currentCallState.callSession.id) {
          await this.updateCallStatus(
            this.currentCallState.callSession.id,
            'ended'
          );
        }

        // Update call duration
        if (this.currentCallState.callSession.id) {
          await this.updateCallDuration(this.currentCallState.callSession.id);
        }
      }

      await this.cleanupCall();

      consoleLog('✅ Call ended successfully');
    } catch (error) {
      consoleError('❌ Error ending call:', error);
      await this.cleanupCall();
    }
  }

  // Mute/unmute audio
  toggleMute(): void {
    if (this.currentCallState.localStream) {
      const audioTrack = this.currentCallState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.currentCallState.isMuted = !audioTrack.enabled;
        this.notifyStateChange();
        consoleLog(
          `🔇 Audio ${this.currentCallState.isMuted ? 'muted' : 'unmuted'}`
        );
      }
    }
  }

  // Private methods
  private async getUserMedia(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      return stream;
    } catch (error) {
      consoleError('❌ Error accessing microphone:', error);
      throw new Error('Could not access microphone. Please check permissions.');
    }
  }

  private setupPeerEventHandlers(
    peer: SimplePeer.Instance,
    callId: string
  ): void {
    peer.on('signal', (data: SimplePeer.SignalData) => {
      consoleLog('📡 Peer signal:', data.type);
      this.sendSignal(callId, data.type === 'offer' ? 'offer' : 'answer', data);
    });

    peer.on('stream', (stream: MediaStream) => {
      consoleLog('📻 Received remote stream');
      this.currentCallState.remoteStream = stream;
      this.notifyStateChange();
    });

    peer.on('connect', () => {
      consoleLog('🔗 Peer connected');
      this.currentCallState.isConnected = true;
      this.currentCallState.connectionState = 'connected';
      this.notifyStateChange();
    });

    peer.on('close', () => {
      consoleLog('🔌 Peer connection closed');
      this.endCall();
    });

    peer.on('error', (error: Error) => {
      consoleError('❌ Peer error:', error);
      this.currentCallState.connectionState = 'failed';
      this.notifyStateChange();
      this.endCall();
    });
  }

  private setupSignalListener(callId: string): void {
    const q = query(
      collection(db, this.SIGNALS_COLLECTION),
      where('callId', '==', callId),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    this.signalListener = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const signal = change.doc.data() as VoiceCallSignal;
          this.handleSignal(signal);
        }
      });
    });
  }

  private setupIncomingCallListener(): void {
    // We'll set this up when user logs in
  }

  public setupIncomingCallListenerForUser(userId: string): void {
    const q = query(
      collection(db, this.CALLS_COLLECTION),
      where('receiverId', '==', userId),
      where('status', '==', 'ringing'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    this.callListener = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const callSession = {
            id: change.doc.id,
            ...change.doc.data(),
          } as VoiceCallSession;

          // Only notify if not already in call
          if (!this.currentCallState.isInCall) {
            this.handleIncomingCall(callSession);
          }
        }
      });
    });
  }

  private handleSignal(signal: VoiceCallSignal): void {
    if (!this.currentCallState.peer) return;

    switch (signal.signalType) {
      case 'offer':
      case 'answer':
        if (signal.signalData) {
          this.currentCallState.peer.signal(signal.signalData);
        }
        break;
      case 'ice-candidate':
        if (signal.signalData) {
          this.currentCallState.peer.signal(signal.signalData);
        }
        break;
      case 'end-call':
        this.endCall();
        break;
      case 'decline-call':
        this.cleanupCall();
        break;
    }
  }

  private handleIncomingCall(callSession: VoiceCallSession): void {
    consoleLog('📞 Incoming call:', callSession.callId);

    this.currentCallState.callSession = callSession;
    this.currentCallState.isInCall = true;
    this.currentCallState.isInitiator = false;
    this.currentCallState.isRinging = true;
    this.currentCallState.connectionState = 'connecting';

    // Setup signal listener
    this.setupSignalListener(callSession.callId);

    this.notifyStateChange();
    this.incomingCallCallbacks.forEach((cb) => cb(callSession));
  }

  private async sendSignal(
    callId: string,
    signalType: VoiceCallSignal['signalType'],
    signalData?: SimplePeer.SignalData
  ): Promise<void> {
    try {
      const signal: Omit<VoiceCallSignal, 'id'> = {
        callId,
        senderId: this.currentCallState.isInitiator
          ? this.currentCallState.callSession!.initiatorId
          : this.currentCallState.callSession!.receiverId,
        receiverId: this.currentCallState.isInitiator
          ? this.currentCallState.callSession!.receiverId
          : this.currentCallState.callSession!.initiatorId,
        signalType,
        signalData,
        timestamp: new Date(),
      };

      await addDoc(collection(db, this.SIGNALS_COLLECTION), {
        ...signal,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      consoleError('❌ Error sending signal:', error);
    }
  }

  private async updateCallStatus(
    callId: string,
    status: VoiceCallSession['status']
  ): Promise<void> {
    try {
      const callRef = doc(db, this.CALLS_COLLECTION, callId);
      await updateDoc(callRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'answered' && { startTime: serverTimestamp() }),
        ...(status === 'ended' && { endTime: serverTimestamp() }),
      });

      if (this.currentCallState.callSession) {
        this.currentCallState.callSession.status = status;
        this.notifyStateChange();
      }
    } catch (error) {
      consoleError('❌ Error updating call status:', error);
    }
  }

  private async updateCallDuration(callId: string): Promise<void> {
    try {
      const duration = this.currentCallState.callDuration;
      const callRef = doc(db, this.CALLS_COLLECTION, callId);
      await updateDoc(callRef, {
        duration,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      consoleError('❌ Error updating call duration:', error);
    }
  }

  private startCallTimer(): void {
    this.callTimer = setInterval(() => {
      this.currentCallState.callDuration++;
      this.notifyStateChange();
    }, 1000);
  }

  private startRingTimer(): void {
    this.ringTimer = setTimeout(async () => {
      consoleLog('⏰ Call ring timeout');

      // Check if we have a valid call session with an id
      if (this.currentCallState.callSession?.id) {
        await this.updateCallStatus(
          this.currentCallState.callSession.id,
          'missed'
        );
      }

      await this.cleanupCall();
    }, 30000); // 30 seconds
  }

  private async cleanupCall(): Promise<void> {
    // Stop timers
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
    if (this.ringTimer) {
      clearTimeout(this.ringTimer);
      this.ringTimer = null;
    }

    // Close peer connection
    if (this.currentCallState.peer) {
      this.currentCallState.peer.destroy();
    }

    // Stop media streams
    if (this.currentCallState.localStream) {
      this.currentCallState.localStream
        .getTracks()
        .forEach((track) => track.stop());
    }

    // Clean up listeners
    if (this.signalListener) {
      this.signalListener();
      this.signalListener = null;
    }

    // Reset state
    this.currentCallState = {
      isInCall: false,
      callSession: null,
      isInitiator: false,
      isConnected: false,
      isRinging: false,
      localStream: null,
      remoteStream: null,
      peer: null,
      callDuration: 0,
      isMuted: false,
      connectionState: 'disconnected',
    };

    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach((cb) => cb(this.getCallState()));
  }

  // Cleanup on service destruction
  public destroy(): void {
    this.cleanupCall();
    if (this.callListener) {
      this.callListener();
      this.callListener = null;
    }
  }
}

// Export singleton instance
export const voiceCallService = new VoiceCallService();
