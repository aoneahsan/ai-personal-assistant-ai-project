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
  redirectTo = '/chats',
}) => {
  const isAuthenticated = useIsAuthenticatedZState();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give a small delay to allow authentication state to initialize
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (!isAuthenticated) {
        navigate({ to: '/auth' });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, redirectTo]);

  // Show loading state while checking authentication
  if (isChecking || !isAuthenticated) {
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
            {isChecking ? 'Loading...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
