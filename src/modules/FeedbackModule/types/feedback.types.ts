export interface FeedbackRating {
  id?: string;
  rating: number; // 1-10
  emoji: string;
  label: string;
  message?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isAuthenticated: boolean;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackConfig {
  // Firebase config (optional - will use existing if not provided)
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };

  // Collection name in Firestore
  collectionName?: string;

  // UI Configuration
  theme?: 'light' | 'dark' | 'auto';
  position?:
    | 'bottom-right'
    | 'bottom-left'
    | 'top-right'
    | 'top-left'
    | 'center';
  showWidget?: boolean;
  widgetText?: string;

  // Step-specific text
  step1Title?: string;
  step2Title?: string;
  step3Title?: string;
  step1Subtitle?: string;
  step2Subtitle?: string;
  step3Message?: string;
  continueButtonText?: string;
  nextButtonText?: string;
  closeButtonText?: string;
  skipButtonText?: string;
  placeholderText?: string;

  // Trigger Configuration
  trigger?: {
    type:
      | 'manual'
      | 'page-load'
      | 'time-delay'
      | 'page-exit'
      | 'action-count'
      | 'scroll-percentage';
    delay?: number; // minutes for time-delay
    actionCount?: number; // number of actions for action-count
    scrollPercentage?: number; // percentage for scroll trigger
    exitIntent?: boolean; // show on exit intent
  };

  // Behavior
  autoHide?: boolean;
  hideAfterSubmit?: boolean;
  requireMessage?: boolean;
  showStep2?: boolean; // allow skipping text feedback step

  // Callbacks
  onSubmit?: (feedback: FeedbackRating) => void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onStepChange?: (step: number) => void;
}

export interface FeedbackEmojiData {
  rating: number;
  emoji: string;
  label: string;
  color: string;
}

export type FeedbackWidgetState =
  | 'hidden'
  | 'widget'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'submitting'
  | 'error';

export interface UseFeedbackReturn {
  isOpen: boolean;
  state: FeedbackWidgetState;
  currentStep: number;
  selectedRating: number | null;
  message: string;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  openWidget: () => void;
  closeWidget: () => void;
  selectRating: (rating: number) => void;
  setMessage: (message: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  submitFeedback: () => Promise<void>;
  reset: () => void;

  // Trigger actions
  incrementActionCount: () => void;
  trackScrollPercentage: (percentage: number) => void;
}

export interface FeedbackWidgetConfig {
  title: string;
  description?: string;
  placeholder?: string;
  showRating?: boolean;
  showMessage?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  successMessage?: string;
  errorMessage?: string;
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  customData?: Record<string, unknown>;
}
