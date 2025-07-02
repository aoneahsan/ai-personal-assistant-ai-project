import { FeedbackConfig, FeedbackEmojiData } from '../types/feedback.types';

export const FEEDBACK_EMOJIS: FeedbackEmojiData[] = [
  { rating: 1, emoji: '😡', label: 'Terrible', color: '#ff4444' },
  { rating: 2, emoji: '😠', label: 'Bad', color: '#ff6644' },
  { rating: 3, emoji: '😞', label: 'Poor', color: '#ff8844' },
  { rating: 4, emoji: '🙁', label: 'Below Average', color: '#ffaa44' },
  { rating: 5, emoji: '😐', label: 'Average', color: '#ffcc44' },
  { rating: 6, emoji: '🙂', label: 'Above Average', color: '#ccff44' },
  { rating: 7, emoji: '😊', label: 'Good', color: '#aaff44' },
  { rating: 8, emoji: '😄', label: 'Great', color: '#88ff44' },
  { rating: 9, emoji: '🤩', label: 'Excellent', color: '#66ff44' },
  { rating: 10, emoji: '🥳', label: 'Outstanding', color: '#44ff44' },
];

export const DEFAULT_FEEDBACK_CONFIG: Required<FeedbackConfig> = {
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  collectionName: 'user_feedback',
  theme: 'auto',
  position: 'bottom-right',
  showWidget: true,
  widgetText: '💬 Share Feedback',

  // Step-specific text - encouraging language
  step1Title: 'How was your experience?',
  step2Title: 'Tell us more',
  step3Title: 'Thank you!',
  step1Subtitle: 'Your rating helps us improve',
  step2Subtitle: 'Share your thoughts with us (optional)',
  step3Message:
    'We appreciate your feedback and will use it to make things better!',
  continueButtonText: 'Continue',
  nextButtonText: 'Next',
  closeButtonText: 'Close',
  skipButtonText: 'Skip',
  placeholderText: 'What can we do better? Your thoughts matter to us...',

  // Trigger Configuration - default to manual (not auto-show)
  trigger: {
    type: 'manual',
    delay: 5,
    actionCount: 3,
    scrollPercentage: 80,
    exitIntent: false,
  },

  autoHide: false,
  hideAfterSubmit: true,
  requireMessage: false,
  showStep2: true,
  onSubmit: () => {},
  onError: () => {},
  onSuccess: () => {},
  onStepChange: () => {},
};

export const FEEDBACK_WIDGET_ID = 'feedback-widget-module';
export const FEEDBACK_MODAL_ID = 'feedback-modal-module';

export const WIDGET_POSITIONS = {
  'bottom-right': { bottom: '20px', right: '20px' },
  'bottom-left': { bottom: '20px', left: '20px' },
  'top-right': { top: '20px', right: '20px' },
  'top-left': { top: '20px', left: '20px' },
  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
};

export const STORAGE_KEYS = {
  SESSION_ID: 'feedback_session_id',
  WIDGET_HIDDEN: 'feedback_widget_hidden',
  LAST_FEEDBACK: 'feedback_last_submission',
};

// Generate unique session ID
export const generateSessionId = (): string => {
  return `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Get or create session ID
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
};

// Get current page info
export const getPageInfo = () => ({
  url: window.location.href,
  userAgent: navigator.userAgent,
  timestamp: new Date(),
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  screen: {
    width: window.screen.width,
    height: window.screen.height,
  },
});
