import { consoleLog } from '@/utils/helpers/consoleHelper';
import {
  useIsAuthenticatedZState,
  useIsAuthSystemReady,
} from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useRef, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth',
}) => {
  const isAuthenticated = useIsAuthenticatedZState();
  const isAuthSystemReady = useIsAuthSystemReady();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only make routing decisions when auth system is fully ready
    if (isAuthSystemReady && !hasRedirectedRef.current) {
      if (!isAuthenticated) {
        consoleLog('🔒 User is not authenticated, redirecting to auth page');
        hasRedirectedRef.current = true;
        setIsRedirecting(true);

        // Small delay to prevent rapid redirects
        setTimeout(() => {
          navigate({ to: redirectTo, replace: true });
        }, 100);
      } else {
        consoleLog(
          '✅ User is authenticated, rendering protected route:',
          window.location.pathname
        );
      }
    }
  }, [isAuthenticated, isAuthSystemReady, navigate, redirectTo]);

  // Reset redirect flag when auth state changes
  useEffect(() => {
    if (isAuthenticated && hasRedirectedRef.current) {
      hasRedirectedRef.current = false;
      setIsRedirecting(false);
    }
  }, [isAuthenticated]);

  // Show loading state while auth system is initializing
  if (!isAuthSystemReady) {
    return (
      <div className='min-h-screen flex align-items-center justify-content-center bg-gray-50'>
        <div className='text-center'>
          <ProgressSpinner
            style={{ width: '50px', height: '50px' }}
            strokeWidth='4'
            fill='transparent'
            animationDuration='1s'
            className='mb-4'
          />
          <p className='text-gray-600 text-lg'>
            Initializing authentication...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show loading while redirect happens
  if (!isAuthenticated || isRedirecting) {
    return (
      <div className='min-h-screen flex align-items-center justify-content-center bg-gray-50'>
        <div className='text-center'>
          <ProgressSpinner
            style={{ width: '50px', height: '50px' }}
            strokeWidth='4'
            fill='transparent'
            animationDuration='1s'
            className='mb-4'
          />
          <p className='text-gray-600 text-lg'>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
