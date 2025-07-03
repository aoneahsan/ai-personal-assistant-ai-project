import { STORAGE } from '@/utils/helpers/localStorage';
import { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tracking refs for trigger system
  const actionCountRef = useRef<number>(0);
  const scrollPercentageRef = useRef<number>(0);
  const timeDelayRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownRef = useRef<boolean>(false);

  // Initialize trigger system
  useEffect(() => {
    if (!config.trigger) return;

    const trigger = config.trigger;

    // Time delay trigger
    if (
      trigger.type === 'time-delay' &&
      trigger.delay &&
      !hasShownRef.current
    ) {
      timeDelayRef.current = setTimeout(
        () => {
          if (!hasShownRef.current) {
            openWidget();
            hasShownRef.current = true;
          }
        },
        trigger.delay * 60 * 1000
      ); // Convert minutes to milliseconds
    }

    // Page load trigger (only if explicitly set)
    if (trigger.type === 'page-load' && autoShow && !hasShownRef.current) {
      // Add a small delay to avoid immediate popup
      setTimeout(() => {
        if (!hasShownRef.current) {
          openWidget();
          hasShownRef.current = true;
        }
      }, 2000);
    }

    // Scroll percentage trigger
    if (trigger.type === 'scroll-percentage' && trigger.scrollPercentage) {
      const handleScroll = () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

        scrollPercentageRef.current = scrollPercentage;

        if (
          scrollPercentage >= (trigger.scrollPercentage || 80) &&
          !hasShownRef.current
        ) {
          openWidget();
          hasShownRef.current = true;
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // Exit intent trigger
    if (trigger.type === 'page-exit' && trigger.exitIntent) {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !hasShownRef.current) {
          openWidget();
          hasShownRef.current = true;
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (timeDelayRef.current) {
        clearTimeout(timeDelayRef.current);
      }
    };
  }, [config.trigger, autoShow]);

  const openWidget = useCallback(() => {
    setState('step1');
    setCurrentStep(1);
    setError(null);
    hasShownRef.current = true;
  }, []);

  const closeWidget = useCallback(() => {
    setState('hidden');
    setCurrentStep(1);
    setSelectedRating(null);
    setMessage('');
    setError(null);

    // Store that user has interacted with widget
    if (config.autoHide) {
      STORAGE.SET(STORAGE_KEYS.WIDGET_HIDDEN, 'true');
    }
  }, [config.autoHide]);

  const selectRating = useCallback((rating: number) => {
    setSelectedRating(rating);
    setError(null);
  }, []);

  const setMessageValue = useCallback((msg: string) => {
    setMessage(msg);
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!selectedRating) {
        setError('Please select a rating to continue');
        return;
      }

      // Move to text feedback step or skip if disabled
      if (config.showStep2 !== false) {
        setState('step2');
        setCurrentStep(2);
      } else {
        // Skip directly to submission
        submitFeedback();
      }
    } else if (currentStep === 2) {
      // Check if message is required
      if (config.requireMessage && !message.trim()) {
        setError('Please share your thoughts to continue');
        return;
      }

      // Submit feedback
      submitFeedback();
    }

    // Call step change callback
    if (config.onStepChange) {
      config.onStepChange(currentStep + 1);
    }
  }, [currentStep, selectedRating, message, config]);

  const previousStep = useCallback(() => {
    if (currentStep === 2) {
      setState('step1');
      setCurrentStep(1);
      setError(null);
    }

    if (config.onStepChange) {
      config.onStepChange(currentStep - 1);
    }
  }, [currentStep, config]);

  const skipStep = useCallback(() => {
    if (currentStep === 2) {
      // Skip text feedback and submit
      submitFeedback();
    }
  }, [currentStep]);

  const submitFeedback = useCallback(async () => {
    if (selectedRating === null) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setState('submitting');

    try {
      // Check for recent feedback to prevent spam
      const hasRecent = await feedbackService.hasRecentFeedback(30);
      if (hasRecent) {
        throw new Error("Thank you! You've already shared feedback recently.");
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
          step1Completed: true,
          step2Completed: !!message.trim(),
          totalSteps: config.showStep2 !== false ? 3 : 2,
        }
      );

      setState('step3');
      setCurrentStep(3);

      // Auto-hide after success if configured
      if (config.hideAfterSubmit) {
        setTimeout(() => {
          closeWidget();
        }, 3000); // Show thank you for 3 seconds
      }

      // Store last feedback timestamp
      await STORAGE.SET(STORAGE_KEYS.LAST_FEEDBACK, new Date().toISOString());
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
      setState('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRating, message, user, config, closeWidget]);

  const reset = useCallback(() => {
    setSelectedRating(null);
    setMessage('');
    setError(null);
    setIsSubmitting(false);
    setCurrentStep(1);
    setState('hidden');
    hasShownRef.current = false;
  }, []);

  // Trigger action functions
  const incrementActionCount = useCallback(() => {
    actionCountRef.current += 1;

    if (
      config.trigger?.type === 'action-count' &&
      config.trigger.actionCount &&
      actionCountRef.current >= config.trigger.actionCount &&
      !hasShownRef.current
    ) {
      openWidget();
      hasShownRef.current = true;
    }
  }, [config.trigger, openWidget]);

  const trackScrollPercentage = useCallback((percentage: number) => {
    scrollPercentageRef.current = percentage;
  }, []);

  return {
    isOpen: state !== 'hidden',
    state,
    currentStep,
    selectedRating,
    message,
    isSubmitting,
    error,
    openWidget,
    closeWidget,
    selectRating,
    setMessage: setMessageValue,
    nextStep,
    previousStep,
    skipStep,
    submitFeedback,
    reset,
    incrementActionCount,
    trackScrollPercentage,
  };
};
