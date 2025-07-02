// Main FeedbackModule export
export { FeedbackModule } from './components/FeedbackModule';

// Individual components for custom usage
export { FeedbackModal } from './components/FeedbackModal';
export { FeedbackWidget } from './components/FeedbackWidget';

// Hook for custom implementations
export { useFeedback } from './hooks/useFeedback';

// Service for direct API calls
export { FeedbackService, feedbackService } from './services/feedbackService';

// Types and interfaces
export type {
  FeedbackConfig,
  FeedbackEmojiData,
  FeedbackRating,
  FeedbackWidgetState,
  UseFeedbackReturn,
} from './types/feedback.types';

// Constants and utilities
export {
  DEFAULT_FEEDBACK_CONFIG,
  FEEDBACK_EMOJIS,
  WIDGET_POSITIONS,
  generateSessionId,
  getPageInfo,
  getSessionId,
} from './utils/constants';

// Default export
export { FeedbackModule as default } from './components/FeedbackModule';
