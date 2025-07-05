import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
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
  const navigate = useNavigate();

  // Auto-redirect if authentication is required but user is not authenticated
  useEffect(() => {
    if (requireAuth && !user) {
      navigate({ to: redirectTo, replace: true });
    }
  }, [requireAuth, user, navigate, redirectTo]);

  // If auth is not required, always render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is not authenticated, show fallback or nothing (redirect is handled by useEffect)
  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  // If user is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
