import { User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { feedbackService } from '../services/feedbackService';
import { FeedbackConfig } from '../types/feedback.types';
import { FeedbackModal } from './FeedbackModal';
import { FeedbackWidget } from './FeedbackWidget';

interface FeedbackModuleProps {
  // Firebase instance (required)
  firestore: Firestore;

  // Current user (optional - for authenticated users)
  user?: User | null;

  // Configuration options
  config?: FeedbackConfig;

  // Auto-show widget on mount
  autoShow?: boolean;

  // Custom trigger function (optional)
  onTrigger?: () => void;
}

export const FeedbackModule: React.FC<FeedbackModuleProps> = ({
  firestore,
  user,
  config = {},
  autoShow = true,
  onTrigger,
}) => {
  // Initialize feedback service
  useEffect(() => {
    feedbackService.initialize(firestore, config);
  }, [firestore, config]);

  // Use feedback hook
  const feedback = useFeedback({
    user,
    config,
    autoShow,
  });

  // Handle external trigger
  useEffect(() => {
    if (onTrigger) {
      onTrigger();
    }
  }, [onTrigger]);

  return (
    <>
      {/* Floating Widget */}
      <FeedbackWidget
        config={config}
        onClick={feedback.openWidget}
        isVisible={feedback.state === 'hidden'}
      />

      {/* Modal */}
      <FeedbackModal
        config={config}
        state={feedback.state}
        selectedRating={feedback.selectedRating}
        message={feedback.message}
        error={feedback.error}
        isSubmitting={feedback.isSubmitting}
        onClose={feedback.closeWidget}
        onRatingSelect={feedback.selectRating}
        onMessageChange={feedback.setMessage}
        onSubmit={feedback.submitFeedback}
      />
    </>
  );
};

// Export hook and service for advanced usage
export { useFeedback } from '../hooks/useFeedback';
export { feedbackService, FeedbackService } from '../services/feedbackService';
export * from '../types/feedback.types';
export * from '../utils/constants';
