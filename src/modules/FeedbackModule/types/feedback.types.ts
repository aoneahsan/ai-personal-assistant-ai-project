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
  metadata?: Record<string, any>;
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
  modalTitle?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  placeholderText?: string;

  // Behavior
  autoHide?: boolean;
  hideAfterSubmit?: boolean;
  requireMessage?: boolean;

  // Callbacks
  onSubmit?: (feedback: FeedbackRating) => void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
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
  | 'modal'
  | 'submitting'
  | 'success'
  | 'error';

export interface UseFeedbackReturn {
  isOpen: boolean;
  state: FeedbackWidgetState;
  selectedRating: number | null;
  message: string;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  openWidget: () => void;
  closeWidget: () => void;
  selectRating: (rating: number) => void;
  setMessage: (message: string) => void;
  submitFeedback: () => Promise<void>;
  reset: () => void;
}
