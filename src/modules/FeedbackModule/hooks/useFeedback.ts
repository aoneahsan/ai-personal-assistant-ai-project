import { User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { feedbackService } from '../services/feedbackService';
import {
  FeedbackConfig,
  FeedbackWidgetState,
  UseFeedbackReturn,
} from '../types/feedback.types';
import { FEEDBACK_EMOJIS, STORAGE_KEYS } from '../utils/constants';

interface UseFeedbackProps {
  user?: User | null;
  config?: FeedbackConfig;
  autoShow?: boolean;
}

export const useFeedback = ({
  user,
  config = {},
  autoShow = false,
}: UseFeedbackProps = {}): UseFeedbackReturn => {
  const [state, setState] = useState<FeedbackWidgetState>('hidden');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if widget should be shown on mount
  useEffect(() => {
    if (autoShow && config.showWidget !== false) {
      const isHidden = localStorage.getItem(STORAGE_KEYS.WIDGET_HIDDEN);
      if (!isHidden) {
        setState('widget');
      }
    }
  }, [autoShow, config.showWidget]);

  const openWidget = useCallback(() => {
    setState('widget');
    setError(null);
  }, []);

  const closeWidget = useCallback(() => {
    setState('hidden');
    setError(null);

    // Store that user has closed the widget
    if (config.autoHide) {
      localStorage.setItem(STORAGE_KEYS.WIDGET_HIDDEN, 'true');
    }
  }, [config.autoHide]);

  const selectRating = useCallback((rating: number) => {
    setSelectedRating(rating);
    setState('modal');
    setError(null);
  }, []);

  const setMessageValue = useCallback((msg: string) => {
    setMessage(msg);
    setError(null);
  }, []);

  const submitFeedback = useCallback(async () => {
    if (selectedRating === null) {
      setError('Please select a rating');
      return;
    }

    // Check if message is required
    if (config.requireMessage && !message.trim()) {
      setError('Please provide a message');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setState('submitting');

    try {
      // Check for recent feedback to prevent spam
      const hasRecent = await feedbackService.hasRecentFeedback(30);
      if (hasRecent) {
        throw new Error(
          'You have already submitted feedback recently. Please wait before submitting again.'
        );
      }

      const emojiData = FEEDBACK_EMOJIS.find(
        (e) => e.rating === selectedRating
      );
      if (!emojiData) {
        throw new Error('Invalid rating selected');
      }

      await feedbackService.submitFeedback(
        selectedRating,
        emojiData.emoji,
        emojiData.label,
        message.trim() || undefined,
        user,
        {
          source: 'feedback-widget',
          timestamp: new Date().toISOString(),
        }
      );

      setState('success');

      // Auto-hide after success if configured
      if (config.hideAfterSubmit) {
        setTimeout(() => {
          setState('hidden');
          reset();
        }, 2000);
      }

      // Store last feedback timestamp
      localStorage.setItem(
        STORAGE_KEYS.LAST_FEEDBACK,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to submit feedback'
      );
      setState('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedRating,
    message,
    user,
    config.requireMessage,
    config.hideAfterSubmit,
  ]);

  const reset = useCallback(() => {
    setSelectedRating(null);
    setMessage('');
    setError(null);
    setIsSubmitting(false);
    setState('hidden');
  }, []);

  return {
    isOpen: state !== 'hidden',
    state,
    selectedRating,
    message,
    isSubmitting,
    error,
    openWidget,
    closeWidget,
    selectRating,
    setMessage: setMessageValue,
    submitFeedback,
    reset,
  };
};
