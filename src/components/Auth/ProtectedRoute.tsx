import { ROUTES } from '@/utils/constants/routingConstants';
import {
  useIsAuthSystemReady,
  useUserDataZState,
} from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = ROUTES.AUTH,
  fallback,
  requireAuth = true,
}) => {
  const user = useUserDataZState((state) => state.data);
  const isAuthSystemReady = useIsAuthSystemReady();
  const navigate = useNavigate();

  // Auto-redirect if authentication is required but user is not authenticated
  useEffect(() => {
    // Only redirect if auth system is ready and user is definitely not authenticated
    if (requireAuth && isAuthSystemReady && !user) {
      navigate({ to: redirectTo, replace: true });
    }
  }, [requireAuth, user, isAuthSystemReady, navigate, redirectTo]);

  // If auth is not required, always render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If auth system is not ready yet, show fallback or loading
  if (!isAuthSystemReady) {
    return fallback ? <>{fallback}</> : null;
  }

  // If user is not authenticated, show fallback or nothing (redirect is handled by useEffect)
  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  // If user is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
