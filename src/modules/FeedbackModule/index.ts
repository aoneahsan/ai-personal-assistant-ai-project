// Main component exports
export { FeedbackButton } from './components/FeedbackButton';
export { FeedbackModal } from './components/FeedbackModal';
export { FeedbackModule } from './components/FeedbackModule';
export { FeedbackWidget } from './components/FeedbackWidget';

// Hook exports
export { useFeedback } from './hooks/useFeedback';

// Service exports
export {
  FeedbackDismissalService,
  feedbackDismissalService,
} from './services/feedbackDismissalService';
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
  FEEDBACK_DISMISSAL_CONFIG,
  FEEDBACK_EMOJIS,
  WIDGET_POSITIONS,
  generateSessionId,
  getPageInfo,
  getSessionId,
} from './utils/constants';

// Default export
export { FeedbackModule as default } from './components/FeedbackModule';
