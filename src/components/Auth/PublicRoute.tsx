import { useIsAuthenticatedZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useState } from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/chats',
}) => {
  const isAuthenticated = useIsAuthenticatedZState();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give more time to allow authentication state to initialize and settle
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (isAuthenticated) {
        console.log(
          'User is authenticated, redirecting from public route to:',
          redirectTo
        );
        navigate({ to: redirectTo });
      } else {
        console.log('User is not authenticated, showing public route');
      }
    }, 300); // Increased from 100ms to 300ms

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, redirectTo]);

  // Show loading state while checking authentication
  if (isChecking) {
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
          <p className='text-gray-600 text-lg'>Loading...</p>
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
