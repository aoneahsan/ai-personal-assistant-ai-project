import { useIsAuthenticatedZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: redirectTo });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Show loading or nothing while checking authentication
  if (!isAuthenticated) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <i className='pi pi-spin pi-spinner text-4xl text-primary-500 mb-4'></i>
          <p className='text-gray-600'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
