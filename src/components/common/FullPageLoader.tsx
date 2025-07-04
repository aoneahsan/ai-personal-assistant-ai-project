import { useTheme } from '@/hooks/useTheme';
import { ProgressSpinner } from 'primereact/progressspinner';
import React from 'react';

interface FullPageLoaderProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'normal' | 'large';
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  visible,
  message = 'Loading...',
  size = 'large',
}) => {
  const { theme } = useTheme();

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return '50px';
      case 'normal':
        return '75px';
      case 'large':
        return '100px';
      default:
        return '100px';
    }
  };

  if (!visible) return null;

  return (
    <div
      className='fixed inset-0 flex align-items-center justify-content-center'
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'fixed',
      }}
    >
      <div className='flex flex-column align-items-center justify-content-center gap-4'>
        <ProgressSpinner
          style={{
            width: getSpinnerSize(),
            height: getSpinnerSize(),
            color: theme.primary,
          }}
          strokeWidth='3'
          fill='transparent'
          animationDuration='1s'
        />
        <div
          className='text-lg font-medium'
          style={{
            color: theme.textPrimary,
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default FullPageLoader;
