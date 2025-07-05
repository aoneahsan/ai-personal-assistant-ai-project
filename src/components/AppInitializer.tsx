import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import React from 'react';
import { useSystemConfigInitialization } from '../hooks/useSystemConfigInitialization';
import { useUserStore } from '../zustandStates/userState';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { user } = useUserStore();
  const {
    isInitializing,
    initializationComplete,
    error,
    retryInitialization,
    canRetry,
    isSystemConfigReady,
  } = useSystemConfigInitialization();

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card className='text-center p-6'>
          <ProgressSpinner />
          <h3 className='mt-4 mb-2'>Initializing Application</h3>
          <p className='text-600'>Loading system configuration...</p>
        </Card>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error && !initializationComplete) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card className='text-center p-6 max-w-md'>
          <div className='text-red-500 mb-4'>
            <i className='pi pi-exclamation-triangle text-4xl'></i>
          </div>
          <h3 className='text-red-700 mb-2'>Initialization Failed</h3>
          <p className='text-600 mb-4'>{error}</p>
          {canRetry && (
            <Button
              icon='pi pi-refresh'
              label='Retry'
              onClick={retryInitialization}
              className='p-button-outlined'
            />
          )}
        </Card>
      </div>
    );
  }

  // Show success and render children when ready
  if (isSystemConfigReady) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className='flex justify-center items-center h-screen'>
      <Card className='text-center p-6'>
        <ProgressSpinner />
        <h3 className='mt-4 mb-2'>Loading...</h3>
        <p className='text-600'>Please wait...</p>
      </Card>
    </div>
  );
};

export default AppInitializer;
