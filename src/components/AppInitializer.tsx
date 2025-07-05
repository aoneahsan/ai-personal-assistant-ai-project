import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useState } from 'react';
import { useSystemConfigInitialization } from '../hooks/useSystemConfigInitialization';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const {
    isInitializing,
    initializationComplete,
    error,
    retryInitialization,
    canRetry,
    isSystemConfigReady,
  } = useSystemConfigInitialization();

  const [forceReady, setForceReady] = useState(false);

  // Force app to be ready after 20 seconds to prevent infinite loading
  useEffect(() => {
    const forceReadyTimeout = setTimeout(() => {
      if (!isSystemConfigReady && !forceReady) {
        console.warn(
          'AppInitializer: Force proceeding after timeout to prevent infinite loading'
        );
        setForceReady(true);
      }
    }, 20000); // 20 seconds maximum

    return () => clearTimeout(forceReadyTimeout);
  }, [isSystemConfigReady, forceReady]);

  // Show loading spinner while initializing (but not forever)
  if ((isInitializing || !initializationComplete) && !forceReady) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card className='text-center p-6'>
          <ProgressSpinner />
          <h3 className='mt-4 mb-2'>Initializing Application</h3>
          <p className='text-600'>Loading system configuration...</p>
          <div className='mt-3'>
            <Button
              label='Skip and Continue'
              className='p-button-text p-button-sm'
              onClick={() => setForceReady(true)}
            />
          </div>
        </Card>
      </div>
    );
  }

  // Show error state if initialization failed and we haven't forced ready
  if (error && !initializationComplete && !forceReady) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Card className='text-center p-6 max-w-md'>
          <div className='text-red-500 mb-4'>
            <i className='pi pi-exclamation-triangle text-4xl'></i>
          </div>
          <h3 className='text-red-700 mb-2'>Initialization Failed</h3>
          <p className='text-600 mb-4'>{error}</p>
          <div className='flex gap-2 justify-content-center'>
            {canRetry && (
              <Button
                icon='pi pi-refresh'
                label='Retry'
                onClick={retryInitialization}
                className='p-button-outlined'
              />
            )}
            <Button
              label='Continue Anyway'
              onClick={() => setForceReady(true)}
              className='p-button-text'
            />
          </div>
        </Card>
      </div>
    );
  }

  // Show success and render children when ready or forced ready
  if (isSystemConfigReady || forceReady) {
    if (forceReady) {
      console.log('AppInitializer: Proceeding with forced ready state');
    }
    return <>{children}</>;
  }

  // Fallback loading state (should rarely be reached)
  return (
    <div className='flex justify-center items-center h-screen'>
      <Card className='text-center p-6'>
        <ProgressSpinner />
        <h3 className='mt-4 mb-2'>Loading...</h3>
        <p className='text-600'>Please wait...</p>
        <div className='mt-3'>
          <Button
            label='Continue'
            onClick={() => setForceReady(true)}
            className='p-button-text p-button-sm'
          />
        </div>
      </Card>
    </div>
  );
};

export default AppInitializer;
