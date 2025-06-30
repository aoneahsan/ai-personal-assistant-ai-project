import { useIsAuthenticatedZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth',
}) => {
  const isAuthenticated = useIsAuthenticatedZState();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give more time to allow authentication state to initialize and settle
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (!isAuthenticated) {
        console.log('User is not authenticated, redirecting to auth page');
        navigate({ to: redirectTo });
      } else {
        console.log(
          'User is authenticated, allowing access to protected route'
        );
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
          <p className='text-gray-600 text-lg'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show loading while redirect happens
  if (!isAuthenticated) {
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
