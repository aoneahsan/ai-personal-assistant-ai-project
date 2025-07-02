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
  isVisible: boolean;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  config = {},
  onClick,
  isVisible,
}) => {
  const mergedConfig = { ...DEFAULT_FEEDBACK_CONFIG, ...config };
  const position = WIDGET_POSITIONS[mergedConfig.position];

  if (!isVisible || !mergedConfig.showWidget) {
    return null;
  }

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
    </div>
  );
};
