import { useTheme } from '@/hooks/useTheme';
import { Button } from 'primereact/button';
import React from 'react';

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`text-center py-8 ${className}`}
      style={{ color: theme.textSecondary }}
    >
      <i
        className={`${icon} text-6xl mb-3`}
        style={{ color: theme.primary }}
      ></i>
      <h3
        className='text-xl font-bold mb-2'
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h3>
      <p className='text-lg mb-4'>{description}</p>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          icon='pi pi-plus'
          className='p-button-rounded'
          onClick={onAction}
        />
      )}
    </div>
  );
};

export default EmptyState;
