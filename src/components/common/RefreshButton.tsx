import { useTheme } from '@/hooks/useTheme';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import React from 'react';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  size?: 'small' | 'normal' | 'large';
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  loading = false,
  disabled = false,
  className = '',
  tooltip = 'Refresh Data',
  size = 'normal',
}) => {
  const { theme } = useTheme();

  const handleClick = async () => {
    if (loading || disabled) return;
    await onRefresh();
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'p-button-sm';
      case 'large':
        return 'p-button-lg';
      default:
        return '';
    }
  };

  const buttonId = `refresh-btn-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <Button
        id={buttonId}
        icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
        className={`p-button-text p-button-rounded ${getSizeClass()} ${className}`}
        onClick={handleClick}
        disabled={disabled || loading}
        style={{
          color: loading ? theme.primary : theme.textSecondary,
          backgroundColor: 'transparent',
          border: 'none',
        }}
        aria-label={tooltip}
      />
      <Tooltip
        target={`#${buttonId}`}
        content={loading ? 'Refreshing...' : tooltip}
        position='top'
        className='custom-tooltip'
        showDelay={300}
        hideDelay={100}
      />
    </>
  );
};

export default RefreshButton;
