import { User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { feedbackDismissalService } from '../services/feedbackDismissalService';
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

  // Dismissal time in hours (optional)
  dismissHours?: number;

  // Show dismiss button (optional)
  showDismissButton?: boolean;

  // Custom position for chat pages (optional)
  customPosition?: 'header' | 'floating';
}

export const FeedbackModule: React.FC<FeedbackModuleProps> = ({
  firestore,
  user,
  config = {},
  autoShow = true,
  onTrigger,
  dismissHours,
  showDismissButton = true,
  customPosition = 'floating',
}) => {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  // Initialize feedback service
  useEffect(() => {
    feedbackService.initialize(firestore, config);
  }, [firestore, config]);

  // Initialize dismissal service
  useEffect(() => {
    if (dismissHours) {
      feedbackDismissalService.setDismissalTime(dismissHours);
    }
  }, [dismissHours]);

  // Check widget visibility on mount
  useEffect(() => {
    const checkVisibility = async () => {
      const shouldShow = await feedbackDismissalService.shouldShowWidget();
      setIsWidgetVisible(shouldShow);
    };

    checkVisibility();
  }, []);

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

  // Handle widget dismissal
  const handleDismiss = async () => {
    await feedbackDismissalService.dismissWidget();
    setIsWidgetVisible(false);
  };

  // Handle widget click
  const handleWidgetClick = () => {
    feedback.openWidget();
  };

  // Don't render anything if widget should not be visible
  if (!isWidgetVisible) {
    return null;
  }

  // For header position, return only the modal (widget will be handled by parent)
  if (customPosition === 'header') {
    return (
      <FeedbackModal
        config={config}
        state={feedback.state}
        currentStep={feedback.currentStep}
        selectedRating={feedback.selectedRating}
        message={feedback.message}
        error={feedback.error}
        isSubmitting={feedback.isSubmitting}
        onClose={feedback.closeWidget}
        onRatingSelect={feedback.selectRating}
        onMessageChange={feedback.setMessage}
        onNextStep={feedback.nextStep}
        onPreviousStep={feedback.previousStep}
        onSkipStep={feedback.skipStep}
      />
    );
  }

  return (
    <>
      {/* Floating Widget */}
      <FeedbackWidget
        config={config}
        onClick={handleWidgetClick}
        onDismiss={handleDismiss}
        isVisible={feedback.state === 'hidden' && isWidgetVisible}
        showDismissButton={showDismissButton}
      />

      {/* Modal */}
      <FeedbackModal
        config={config}
        state={feedback.state}
        currentStep={feedback.currentStep}
        selectedRating={feedback.selectedRating}
        message={feedback.message}
        error={feedback.error}
        isSubmitting={feedback.isSubmitting}
        onClose={feedback.closeWidget}
        onRatingSelect={feedback.selectRating}
        onMessageChange={feedback.setMessage}
        onNextStep={feedback.nextStep}
        onPreviousStep={feedback.previousStep}
        onSkipStep={feedback.skipStep}
      />
    </>
  );
};

// Export hook and service for advanced usage
export { useFeedback } from '../hooks/useFeedback';
export { feedbackService, FeedbackService } from '../services/feedbackService';
export * from '../types/feedback.types';
export * from '../utils/constants';
