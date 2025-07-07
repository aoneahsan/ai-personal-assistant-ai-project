import {
  voiceCallService,
  VoiceCallSession,
  VoiceCallState,
} from '@/services/voiceCallService';
import { useUserDataZState } from '@/zustandStates/userState';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface UseVoiceCallOptions {
  onIncomingCall?: (callSession: VoiceCallSession) => void;
  onCallStateChange?: (state: VoiceCallState) => void;
  autoAnswer?: boolean;
}

interface UseVoiceCallReturn {
  callState: VoiceCallState;
  isCallModalVisible: boolean;

  // Call actions
  initiateCall: (
    receiverId: string,
    receiverEmail: string,
    chatId: string
  ) => Promise<void>;
  answerCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  closeCallModal: () => void;

  // State helpers
  isInCall: boolean;
  isRinging: boolean;
  isConnected: boolean;
  callDuration: number;
}

export const useVoiceCall = (
  options: UseVoiceCallOptions = {}
): UseVoiceCallReturn => {
  const { onIncomingCall, onCallStateChange, autoAnswer = false } = options;
  const currentUser = useUserDataZState((state) => state.data);

  // Local state
  const [callState, setCallState] = useState<VoiceCallState>(
    voiceCallService.getCallState()
  );
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [incomingCall, setIncomingCall] = useState<VoiceCallSession | null>(
    null
  );

  // Subscribe to voice call service state changes
  useEffect(() => {
    const unsubscribe = voiceCallService.onStateChange((newState) => {
      setCallState(newState);

      // Show modal when in call
      if (newState.isInCall && !isCallModalVisible) {
        setIsCallModalVisible(true);
      }

      // Hide modal when call ends
      if (!newState.isInCall && isCallModalVisible) {
        setIsCallModalVisible(false);
        setIncomingCall(null);
      }

      // Call external callback
      if (onCallStateChange) {
        onCallStateChange(newState);
      }
    });

    return unsubscribe;
  }, [isCallModalVisible, onCallStateChange]);

  // Subscribe to incoming calls
  useEffect(() => {
    const unsubscribe = voiceCallService.onIncomingCall((callSession) => {
      setIsCallModalVisible(true);

      // Show notification
      toast.info(
        `Incoming call from ${callSession.initiatorEmail.split('@')[0]}`,
        {
          autoClose: 10000,
        }
      );

      // Auto-answer if enabled
      if (autoAnswer) {
        setTimeout(() => {
          answerCall();
        }, 1000);
      }

      // Call external callback
      if (onIncomingCall) {
        onIncomingCall(callSession);
      }
    });

    return unsubscribe;
  }, [autoAnswer, onIncomingCall, answerCall]);

  // Setup incoming call listener when user is available
  useEffect(() => {
    if (currentUser?.id) {
      voiceCallService.setupIncomingCallListenerForUser(currentUser.id);
    }
  }, [currentUser?.id]);

  // Initiate a voice call
  const initiateCall = useCallback(
    async (receiverId: string, receiverEmail: string, chatId: string) => {
      if (!currentUser?.id || !currentUser?.email) {
        toast.error('Please log in to make calls');
        return;
      }

      try {
        await voiceCallService.initiateCall(
          currentUser.id,
          currentUser.email,
          receiverId,
          receiverEmail,
          chatId
        );

        setIsCallModalVisible(true);
        toast.success('Call initiated');
      } catch (error) {
        console.error('Failed to initiate call:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to start call'
        );
      }
    },
    [currentUser]
  );

  // Answer an incoming call
  const answerCall = useCallback(async () => {
    if (!callState.callSession?.callId) {
      toast.error('No active call to answer');
      return;
    }

    try {
      await voiceCallService.answerCall(callState.callSession.callId);
      setIncomingCall(null);
      toast.success('Call answered');
    } catch (error) {
      console.error('Failed to answer call:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to answer call'
      );
    }
  }, [callState.callSession?.callId]);

  // Decline an incoming call
  const declineCall = useCallback(async () => {
    if (!callState.callSession?.callId) {
      return;
    }

    try {
      await voiceCallService.declineCall(callState.callSession.callId);
      setIsCallModalVisible(false);
      setIncomingCall(null);
      toast.info('Call declined');
    } catch (error) {
      console.error('Failed to decline call:', error);
      toast.error('Failed to decline call');
    }
  }, [callState.callSession?.callId]);

  // End an active call
  const endCall = useCallback(async () => {
    try {
      await voiceCallService.endCall();
      setIsCallModalVisible(false);
      setIncomingCall(null);
      toast.info('Call ended');
    } catch (error) {
      console.error('Failed to end call:', error);
      toast.error('Failed to end call');
    }
  }, []);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    voiceCallService.toggleMute();
  }, []);

  // Close call modal (for UI purposes only)
  const closeCallModal = useCallback(() => {
    if (!callState.isInCall) {
      setIsCallModalVisible(false);
      setIncomingCall(null);
    }
  }, [callState.isInCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't automatically end calls on unmount as the component might remount
      // Only cleanup listeners
    };
  }, []);

  return {
    callState,
    isCallModalVisible,

    // Actions
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    closeCallModal,

    // State helpers
    isInCall: callState.isInCall,
    isRinging: callState.isRinging,
    isConnected: callState.isConnected,
    callDuration: callState.callDuration,
  };
};
