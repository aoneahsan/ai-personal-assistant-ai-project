import {
  useIsAuthenticatedZState,
  useIsAuthSystemReady,
} from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect } from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/chats',
}) => {
  const isAuthenticated = useIsAuthenticatedZState();
  const isAuthSystemReady = useIsAuthSystemReady();
  const navigate = useNavigate();

  useEffect(() => {
    // Only make routing decisions when auth system is fully ready
    if (isAuthSystemReady) {
      if (isAuthenticated) {
        console.log(
          '✅ User is authenticated, redirecting from public route to:',
          redirectTo
        );
        navigate({ to: redirectTo });
      } else {
        console.log('🔓 User is not authenticated, showing public route');
      }
    }
  }, [isAuthenticated, isAuthSystemReady, navigate, redirectTo]);

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

  // If user is authenticated, don't render children (redirect will happen)
  if (isAuthenticated) {
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
          <p className='text-gray-600 text-lg'>Redirecting to chats...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
