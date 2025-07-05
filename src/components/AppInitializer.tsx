import React, { useEffect, useState } from 'react';
import { useSystemConfigInitialization } from '../hooks/useSystemConfigInitialization';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { isSystemConfigReady } = useSystemConfigInitialization();
  const [isReady, setIsReady] = useState(false);

  // Force app to be ready after a short delay to prevent infinite loading
  useEffect(() => {
    if (isSystemConfigReady) {
      setIsReady(true);
    } else {
      // Force ready after 5 seconds maximum
      const forceReadyTimeout = setTimeout(() => {
        console.warn('AppInitializer: Force proceeding after timeout');
        setIsReady(true);
      }, 5000);

      return () => clearTimeout(forceReadyTimeout);
    }
  }, [isSystemConfigReady]);

  // Render children when ready
  if (isReady) {
    return <>{children}</>;
  }

  // Show minimal loading state
  return null;
};

export default AppInitializer;
