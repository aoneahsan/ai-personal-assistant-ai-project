import React from 'react';
import { FeedbackConfig } from '../../types/feedback.types';
import {
  DEFAULT_FEEDBACK_CONFIG,
  FEEDBACK_WIDGET_ID,
  WIDGET_POSITIONS,
} from '../../utils/constants';
import './FeedbackWidget.scss';

interface FeedbackWidgetProps {
  config?: FeedbackConfig;
  onClick: () => void;
  onDismiss?: () => void;
  isVisible: boolean;
  showDismissButton?: boolean;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  config = {},
  onClick,
  onDismiss,
  isVisible,
  showDismissButton = true,
}) => {
  const mergedConfig = { ...DEFAULT_FEEDBACK_CONFIG, ...config };
  const position = WIDGET_POSITIONS[mergedConfig.position];

  if (!isVisible || !mergedConfig.showWidget) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div
      id={FEEDBACK_WIDGET_ID}
      className={`feedback-widget feedback-widget--${mergedConfig.theme}`}
      style={position}
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label='Open feedback form'
    >
      <div className='feedback-widget__icon'>💬</div>
      <div className='feedback-widget__text'>{mergedConfig.widgetText}</div>
      {showDismissButton && (
        <button
          className='feedback-widget__dismiss'
          onClick={handleDismiss}
          aria-label='Dismiss feedback widget'
          title='Hide feedback widget'
        >
          ×
        </button>
      )}
    </div>
  );
};
