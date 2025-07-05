import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireGuest?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = ROUTES.DASHBOARD,
  fallback,
  requireGuest = false,
}) => {
  const user = useUserDataZState((state) => state.data);
  const navigate = useNavigate();

  // Auto-redirect if guest is required but user is authenticated
  useEffect(() => {
    if (requireGuest && user) {
      navigate({ to: redirectTo, replace: true });
    }
  }, [requireGuest, user, navigate, redirectTo]);

  // If guest is not required, always render children
  if (!requireGuest) {
    return <>{children}</>;
  }

  // If user is authenticated and we require guest, show fallback or nothing (redirect is handled by useEffect)
  if (user && requireGuest) {
    return fallback ? <>{fallback}</> : null;
  }

  // If user is not authenticated or guest is allowed, render children
  return <>{children}</>;
};

export default PublicRoute;
