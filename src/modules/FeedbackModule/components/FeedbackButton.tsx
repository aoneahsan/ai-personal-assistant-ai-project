import { Button } from 'primereact/button';
import React from 'react';

interface FeedbackButtonProps {
  onClick: () => void;
  variant?: 'icon' | 'text' | 'icon-text';
  className?: string;
  tooltip?: string;
  disabled?: boolean;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onClick,
  variant = 'icon',
  className = '',
  tooltip = 'Share Feedback',
  disabled = false,
}) => {
  const getButtonContent = () => {
    switch (variant) {
      case 'text':
        return 'Feedback';
      case 'icon-text':
        return (
          <>
            <span style={{ marginRight: '8px' }}>💬</span>
            Feedback
          </>
        );
      case 'icon':
      default:
        return '💬';
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`p-button-text ${className}`}
      tooltip={tooltip}
      tooltipOptions={{ position: 'bottom' }}
      disabled={disabled}
      aria-label={tooltip}
    >
      {getButtonContent()}
    </Button>
  );
};

export default FeedbackButton;
