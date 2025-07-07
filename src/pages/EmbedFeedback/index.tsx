import {
  FeedbackModal,
  FeedbackWidget,
  useFeedback,
} from '@/modules/FeedbackModule';
import {
  FeedbackConfig,
  FeedbackRating,
} from '@/modules/FeedbackModule/types/feedback.types';
import { feedbackEmbedService } from '@/services/feedbackEmbedService';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { useLocation } from '@tanstack/react-router';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './EmbedFeedback.module.scss';

interface EmbedParams {
  embedId: string;
  mode: string;
  sessionId: string;
  userId?: string;
  userMetadata?: string;
  websiteUrl: string;
  origin: string;
  referrer?: string;
  userAgent?: string;
  theme?: string;
  position?: string;
}

interface EmbedFeedbackData extends Omit<FeedbackRating, 'id'> {
  embedId: string;
  sessionId: string;
  websiteUrl: string;
  origin: string;
  referrer?: string;
  userAgent?: string;
  userMetadata?: Record<string, unknown>;
}

const EmbedFeedback: React.FC = () => {
  const location = useLocation();
  const [embedConfig, setEmbedConfig] = useState<FeedbackConfig | null>(null);
  const [embedParams, setEmbedParams] = useState<EmbedParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  // Parse URL parameters
  useEffect(() => {
    try {
      const searchString =
        typeof location.search === 'string' ? location.search : '';
      const urlParams = new URLSearchParams(searchString);

      const params: EmbedParams = {
        embedId: urlParams.get('embedId') || '',
        mode: urlParams.get('mode') || 'feedback-embed',
        sessionId: urlParams.get('sessionId') || '',
        userId: urlParams.get('userId') || undefined,
        userMetadata: urlParams.get('userMetadata') || undefined,
        websiteUrl: urlParams.get('websiteUrl') || '',
        origin: urlParams.get('origin') || '',
        referrer: urlParams.get('referrer') || undefined,
        userAgent: urlParams.get('userAgent') || navigator.userAgent,
        theme: urlParams.get('theme') || 'auto',
        position: urlParams.get('position') || 'bottom-right',
      };

      if (!params.embedId) {
        setError('Embed ID is required');
        setIsLoading(false);
        return;
      }

      setEmbedParams(params);
      consoleLog('Embed params loaded:', params);
    } catch (err) {
      consoleError('Error parsing embed parameters:', err);
      setError('Invalid embed parameters');
      setIsLoading(false);
    }
  }, [location.search]);

  // Load embed configuration
  useEffect(() => {
    const loadEmbedConfig = async () => {
      if (!embedParams?.embedId || initRef.current) return;

      initRef.current = true;

      try {
        consoleLog('Loading embed configuration...');
        const config = await feedbackEmbedService.getEmbedConfig(
          embedParams.embedId
        );

        if (!config) {
          throw new Error('Embed configuration not found');
        }

        // Merge with URL params
        const mergedConfig: FeedbackConfig = {
          ...config,
          theme:
            (embedParams.theme as 'light' | 'dark' | 'auto') || config.theme,
          position:
            (embedParams.position as
              | 'bottom-right'
              | 'bottom-left'
              | 'top-right'
              | 'top-left'
              | 'center') || config.position,
          // Override callbacks for embed environment
          onSubmit: handleFeedbackSubmit,
          onError: handleFeedbackError,
          onSuccess: handleFeedbackSuccess,
          onStepChange: handleStepChange,
        };

        setEmbedConfig(mergedConfig);
        setIsLoading(false);

        // Notify parent that widget is ready
        sendMessageToParent('FEEDBACK_WIDGET_READY', {
          embedId: embedParams.embedId,
          config: mergedConfig,
        });

        consoleLog('Embed configuration loaded successfully');
      } catch (err) {
        consoleError('Error loading embed configuration:', err);
        setError('Failed to load feedback configuration');
        setIsLoading(false);

        sendMessageToParent('FEEDBACK_ERROR', {
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    };

    loadEmbedConfig();
  }, [embedParams?.embedId]);

  // Initialize feedback hook
  const feedback = useFeedback({
    config: embedConfig || {},
    autoShow: true,
  });

  // Auto-open feedback modal when loaded
  useEffect(() => {
    if (embedConfig && !isLoading && !error) {
      feedback.openWidget();
    }
  }, [embedConfig, isLoading, error, feedback]);

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedbackData: FeedbackRating) => {
    try {
      if (!embedParams) return;

      const submissionData: EmbedFeedbackData = {
        ...feedbackData,
        embedId: embedParams.embedId,
        sessionId: embedParams.sessionId,
        websiteUrl: embedParams.websiteUrl,
        origin: embedParams.origin,
        referrer: embedParams.referrer,
        userAgent: embedParams.userAgent,
        userMetadata: embedParams.userMetadata
          ? JSON.parse(embedParams.userMetadata)
          : undefined,
      };

      // Submit to backend
      const submissionId =
        await feedbackEmbedService.submitEmbedFeedback(submissionData);

      // Store locally for duplicate prevention
      localStorage.setItem(
        'ai_feedback_last_submission',
        JSON.stringify({
          embedId: embedParams.embedId,
          timestamp: Date.now(),
          submissionId,
        })
      );

      // Notify parent
      sendMessageToParent('FEEDBACK_SUBMITTED', {
        submissionId,
        feedbackData: submissionData,
      });

      consoleLog('Feedback submitted successfully:', submissionId);
    } catch (err) {
      consoleError('Error submitting feedback:', err);
      handleFeedbackError(
        err instanceof Error ? err : new Error('Submission failed')
      );
    }
  };

  // Handle feedback error
  const handleFeedbackError = (error: Error) => {
    consoleError('Feedback error:', error);
    toast.error('Failed to submit feedback. Please try again.');

    sendMessageToParent('FEEDBACK_ERROR', {
      error: error.message,
    });
  };

  // Handle feedback success
  const handleFeedbackSuccess = () => {
    consoleLog('Feedback submitted successfully');
    toast.success('Thank you for your feedback!');

    // Auto-close after success
    setTimeout(() => {
      sendMessageToParent('FEEDBACK_CLOSED', {});
    }, 2000);
  };

  // Handle step change
  const handleStepChange = (step: number) => {
    sendMessageToParent('FEEDBACK_STEP_CHANGED', { step });
  };

  // Handle rating selection
  const handleRatingSelect = (rating: number) => {
    feedback.selectRating(rating);
    sendMessageToParent('FEEDBACK_RATING_SELECTED', { rating });
  };

  // Send message to parent window
  const sendMessageToParent = (
    type: string,
    data?: Record<string, unknown>
  ) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type, data }, '*');
      }
    } catch (err) {
      consoleError('Error sending message to parent:', err);
    }
  };

  // Handle close
  const handleClose = () => {
    feedback.closeWidget();
    sendMessageToParent('FEEDBACK_CLOSED', {});
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.embedContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading feedback form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.embedContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Unable to load feedback form</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No config state
  if (!embedConfig) {
    return (
      <div className={styles.embedContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>🔧</div>
          <h3>Configuration not found</h3>
          <p>The feedback widget configuration could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.embedContainer} ${styles[`theme-${embedConfig.theme}`]}`}
    >
      {/* Hidden widget (not shown in embed) */}
      <FeedbackWidget
        config={embedConfig}
        onClick={feedback.openWidget}
        onDismiss={feedback.closeWidget}
        isVisible={false}
        showDismissButton={false}
      />

      {/* Feedback modal (main UI) */}
      <FeedbackModal
        config={embedConfig}
        state={feedback.state}
        currentStep={feedback.currentStep}
        selectedRating={feedback.selectedRating}
        message={feedback.message}
        error={feedback.error}
        isSubmitting={feedback.isSubmitting}
        onClose={handleClose}
        onRatingSelect={handleRatingSelect}
        onMessageChange={feedback.setMessage}
        onNextStep={feedback.nextStep}
        onPreviousStep={feedback.previousStep}
        onSkipStep={feedback.skipStep}
      />
    </div>
  );
};

export default EmbedFeedback;
