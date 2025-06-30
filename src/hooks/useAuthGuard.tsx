import { useIsAuthenticatedZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

export const useAuthGuard = ({
  requireAuth = true,
  redirectTo,
  onAuthStateChange,
}: UseAuthGuardOptions = {}) => {
  const isAuthenticated = useIsAuthenticatedZState();
  const navigate = useNavigate();

  useEffect(() => {
    // Call the callback if provided
    if (onAuthStateChange) {
      onAuthStateChange(isAuthenticated);
    }

    // Handle redirects based on auth state
    if (requireAuth && !isAuthenticated && redirectTo) {
      console.log(
        'Auth required but user not authenticated, redirecting to:',
        redirectTo
      );
      navigate({ to: redirectTo });
    } else if (!requireAuth && isAuthenticated && redirectTo) {
      console.log(
        'Auth not required but user authenticated, redirecting to:',
        redirectTo
      );
      navigate({ to: redirectTo });
    }
  }, [isAuthenticated, requireAuth, redirectTo, navigate, onAuthStateChange]);

  return {
    isAuthenticated,
    isLoading: false, // Could be extended to track auth loading state
  };
};

// Convenience hooks for specific use cases
export const useRequireAuth = (redirectTo: string = '/auth') => {
  return useAuthGuard({ requireAuth: true, redirectTo });
};

export const useRequireGuest = (redirectTo: string = '/chats') => {
  return useAuthGuard({ requireAuth: false, redirectTo });
};
