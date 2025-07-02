import React, { useEffect, useRef } from 'react';
import {
  FeedbackConfig,
  FeedbackWidgetState,
} from '../../types/feedback.types';
import {
  DEFAULT_FEEDBACK_CONFIG,
  FEEDBACK_EMOJIS,
  FEEDBACK_MODAL_ID,
} from '../../utils/constants';
import './FeedbackModal.scss';

interface FeedbackModalProps {
  config?: FeedbackConfig;
  state: FeedbackWidgetState;
  selectedRating: number | null;
  message: string;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onRatingSelect: (rating: number) => void;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  config = {},
  state,
  selectedRating,
  message,
  error,
  isSubmitting,
  onClose,
  onRatingSelect,
  onMessageChange,
  onSubmit,
}) => {
  const mergedConfig = { ...DEFAULT_FEEDBACK_CONFIG, ...config };
  const modalRef = useRef<HTMLDivElement>(null);
  const firstEmojiRef = useRef<HTMLButtonElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (state === 'modal' && firstEmojiRef.current) {
      firstEmojiRef.current.focus();
    }
  }, [state]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state !== 'hidden') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state, onClose]);

  // Handle click outside
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (state === 'hidden') {
    return null;
  }

  const selectedEmoji = selectedRating
    ? FEEDBACK_EMOJIS.find((e) => e.rating === selectedRating)
    : null;

  return (
    <div
      className={`feedback-modal-backdrop feedback-modal-backdrop--${mergedConfig.theme}`}
      onClick={handleBackdropClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby='feedback-modal-title'
    >
      <div
        ref={modalRef}
        id={FEEDBACK_MODAL_ID}
        className={`feedback-modal feedback-modal--${mergedConfig.theme} feedback-modal--${state}`}
      >
        {/* Header */}
        <div className='feedback-modal__header'>
          <h2
            id='feedback-modal-title'
            className='feedback-modal__title'
          >
            {mergedConfig.modalTitle}
          </h2>
          <button
            className='feedback-modal__close'
            onClick={onClose}
            aria-label='Close feedback modal'
            type='button'
          >
            ✕
          </button>
        </div>

        {/* Content based on state */}
        {state === 'modal' && (
          <>
            {/* Rating Selection */}
            <div className='feedback-modal__rating'>
              <p className='feedback-modal__rating-label'>
                Rate your experience:
              </p>
              <div className='feedback-modal__emojis'>
                {FEEDBACK_EMOJIS.map((emoji, index) => (
                  <button
                    key={emoji.rating}
                    ref={index === 0 ? firstEmojiRef : undefined}
                    className={`feedback-modal__emoji ${
                      selectedRating === emoji.rating
                        ? 'feedback-modal__emoji--selected'
                        : ''
                    }`}
                    onClick={() => onRatingSelect(emoji.rating)}
                    style={
                      { '--emoji-color': emoji.color } as React.CSSProperties
                    }
                    aria-label={`Rate ${emoji.rating} out of 10 - ${emoji.label}`}
                    type='button'
                  >
                    <span className='feedback-modal__emoji-icon'>
                      {emoji.emoji}
                    </span>
                    <span className='feedback-modal__emoji-rating'>
                      {emoji.rating}
                    </span>
                  </button>
                ))}
              </div>

              {selectedEmoji && (
                <div className='feedback-modal__selected-rating'>
                  <span className='feedback-modal__selected-emoji'>
                    {selectedEmoji.emoji}
                  </span>
                  <span className='feedback-modal__selected-label'>
                    {selectedEmoji.label}
                  </span>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className='feedback-modal__message'>
              <label
                htmlFor='feedback-message'
                className='feedback-modal__message-label'
              >
                Additional comments{' '}
                {mergedConfig.requireMessage ? '(required)' : '(optional)'}:
              </label>
              <textarea
                id='feedback-message'
                className='feedback-modal__message-input'
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder={mergedConfig.placeholderText}
                rows={4}
                maxLength={1000}
              />
              <div className='feedback-modal__message-counter'>
                {message.length}/1000
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className='feedback-modal__error'
                role='alert'
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div className='feedback-modal__actions'>
              <button
                className='feedback-modal__button feedback-modal__button--secondary'
                onClick={onClose}
                type='button'
              >
                {mergedConfig.cancelButtonText}
              </button>
              <button
                className='feedback-modal__button feedback-modal__button--primary'
                onClick={onSubmit}
                disabled={!selectedRating || isSubmitting}
                type='button'
              >
                {mergedConfig.submitButtonText}
              </button>
            </div>
          </>
        )}

        {state === 'submitting' && (
          <div className='feedback-modal__submitting'>
            <div className='feedback-modal__spinner' />
            <p>Submitting your feedback...</p>
          </div>
        )}

        {state === 'success' && (
          <div className='feedback-modal__success'>
            <div className='feedback-modal__success-icon'>✅</div>
            <h3>Thank you!</h3>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        )}

        {state === 'error' && (
          <div className='feedback-modal__error-state'>
            <div className='feedback-modal__error-icon'>❌</div>
            <h3>Something went wrong</h3>
            <p>{error || 'Failed to submit feedback. Please try again.'}</p>
            <button
              className='feedback-modal__button feedback-modal__button--primary'
              onClick={() => window.location.reload()}
              type='button'
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
