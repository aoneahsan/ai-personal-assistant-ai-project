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
  currentStep: number;
  selectedRating: number | null;
  message: string;
  error: string | null;
  onClose: () => void;
  onRatingSelect: (rating: number) => void;
  onMessageChange: (message: string) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onSkipStep: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  config = {},
  state,
  currentStep,
  selectedRating,
  message,
  error,
  onClose,
  onRatingSelect,
  onMessageChange,
  onNextStep,
  onPreviousStep,
  onSkipStep,
}) => {
  const mergedConfig = { ...DEFAULT_FEEDBACK_CONFIG, ...config };
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (state === 'hidden') {
    return null;
  }

  const selectedEmoji = selectedRating
    ? FEEDBACK_EMOJIS.find((e) => e.rating === selectedRating)
    : null;

  const renderStep1 = () => (
    <>
      <div className='feedback-modal__header'>
        <div className='feedback-modal__step-indicator'>
          <span className='feedback-modal__step-number'>1 of 3</span>
        </div>
        <button
          className='feedback-modal__close'
          onClick={onClose}
          type='button'
        >
          ✕
        </button>
      </div>

      <div className='feedback-modal__content'>
        <div className='feedback-modal__title-section'>
          <h2 className='feedback-modal__title'>{mergedConfig.step1Title}</h2>
          <p className='feedback-modal__subtitle'>
            {mergedConfig.step1Subtitle}
          </p>
        </div>

        <div className='feedback-modal__rating'>
          <div className='feedback-modal__emojis'>
            {FEEDBACK_EMOJIS.map((emoji) => (
              <button
                key={emoji.rating}
                className={`feedback-modal__emoji ${
                  selectedRating === emoji.rating
                    ? 'feedback-modal__emoji--selected'
                    : ''
                }`}
                onClick={() => onRatingSelect(emoji.rating)}
                style={{ '--emoji-color': emoji.color } as React.CSSProperties}
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

        {error && <div className='feedback-modal__error'>{error}</div>}

        <div className='feedback-modal__actions'>
          <button
            className='feedback-modal__button feedback-modal__button--secondary'
            onClick={onClose}
            type='button'
          >
            Maybe Later
          </button>
          <button
            className='feedback-modal__button feedback-modal__button--primary'
            onClick={onNextStep}
            disabled={!selectedRating}
            type='button'
          >
            {mergedConfig.continueButtonText}
          </button>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className='feedback-modal__header'>
        <div className='feedback-modal__step-indicator'>
          <span className='feedback-modal__step-number'>2 of 3</span>
        </div>
        <button
          className='feedback-modal__close'
          onClick={onClose}
          type='button'
        >
          ✕
        </button>
      </div>

      <div className='feedback-modal__content'>
        <div className='feedback-modal__title-section'>
          <h2 className='feedback-modal__title'>{mergedConfig.step2Title}</h2>
          <p className='feedback-modal__subtitle'>
            {mergedConfig.step2Subtitle}
          </p>
        </div>

        {selectedEmoji && (
          <div className='feedback-modal__rating-recap'>
            <span className='feedback-modal__recap-emoji'>
              {selectedEmoji.emoji}
            </span>
            <span className='feedback-modal__recap-label'>
              You rated us: {selectedEmoji.label}
            </span>
          </div>
        )}

        <div className='feedback-modal__message'>
          <textarea
            id='feedback-message'
            className='feedback-modal__message-input'
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={mergedConfig.placeholderText}
            rows={4}
            maxLength={1000}
            autoFocus
          />
          <div className='feedback-modal__message-counter'>
            {message.length}/1000
          </div>
        </div>

        {error && <div className='feedback-modal__error'>{error}</div>}

        <div className='feedback-modal__actions'>
          <button
            className='feedback-modal__button feedback-modal__button--secondary'
            onClick={onPreviousStep}
            type='button'
          >
            Back
          </button>
          <button
            className='feedback-modal__button feedback-modal__button--tertiary'
            onClick={onSkipStep}
            type='button'
          >
            {mergedConfig.skipButtonText}
          </button>
          <button
            className='feedback-modal__button feedback-modal__button--primary'
            onClick={onNextStep}
            type='button'
          >
            {mergedConfig.nextButtonText}
          </button>
        </div>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className='feedback-modal__header'>
        <div className='feedback-modal__step-indicator'>
          <span className='feedback-modal__step-number'>3 of 3</span>
        </div>
      </div>

      <div className='feedback-modal__content'>
        <div className='feedback-modal__success'>
          <div className='feedback-modal__success-icon'>🎉</div>
          <h2 className='feedback-modal__title'>{mergedConfig.step3Title}</h2>
          <p className='feedback-modal__success-message'>
            {mergedConfig.step3Message}
          </p>

          {selectedEmoji && (
            <div className='feedback-modal__success-recap'>
              <span>
                You rated us {selectedEmoji.emoji} {selectedEmoji.label}
              </span>
              {message && (
                <span>
                  and shared: "{message.substring(0, 50)}
                  {message.length > 50 ? '...' : ''}"
                </span>
              )}
            </div>
          )}
        </div>

        <div className='feedback-modal__actions'>
          <button
            className='feedback-modal__button feedback-modal__button--primary feedback-modal__button--full'
            onClick={onClose}
            type='button'
          >
            {mergedConfig.closeButtonText}
          </button>
        </div>
      </div>
    </>
  );

  const renderSubmitting = () => (
    <div className='feedback-modal__content'>
      <div className='feedback-modal__submitting'>
        <div className='feedback-modal__spinner' />
        <h3>Sending your feedback...</h3>
        <p>This will only take a moment</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className='feedback-modal__content'>
      <div className='feedback-modal__error-state'>
        <div className='feedback-modal__error-icon'>😕</div>
        <h3>Oops! Something went wrong</h3>
        <p>
          {error ||
            "We couldn't send your feedback right now. Please try again."}
        </p>
        <div className='feedback-modal__actions'>
          <button
            className='feedback-modal__button feedback-modal__button--secondary'
            onClick={onClose}
            type='button'
          >
            Close
          </button>
          <button
            className='feedback-modal__button feedback-modal__button--primary'
            onClick={() => onPreviousStep()}
            type='button'
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`feedback-modal-backdrop feedback-modal-backdrop--${mergedConfig.theme}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role='dialog'
      aria-modal='true'
      aria-labelledby='feedback-modal-title'
    >
      <div
        ref={modalRef}
        id={FEEDBACK_MODAL_ID}
        className={`feedback-modal feedback-modal--${mergedConfig.theme} feedback-modal--step${currentStep}`}
      >
        {state === 'step1' && renderStep1()}
        {state === 'step2' && renderStep2()}
        {state === 'step3' && renderStep3()}
        {state === 'submitting' && renderSubmitting()}
        {state === 'error' && renderError()}
      </div>
    </div>
  );
};
