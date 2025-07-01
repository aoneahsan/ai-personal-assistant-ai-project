import { consoleLog } from '@/utils/helpers/consoleHelper';
import {
  useIsAuthenticatedZState,
  useIsAuthSystemReady,
  useUserDataZState,
} from '@/zustandStates/userState';
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
  const userData = useUserDataZState((state) => state.data);
  const isAuthSystemReady = useIsAuthSystemReady();

  useEffect(() => {
    // Only proceed if auth system is ready
    if (!isAuthSystemReady) {
      consoleLog('⏳ Auth system not ready yet, waiting...', {
        isAuthSystemReady,
      });
      return;
    }

    consoleLog('🔒 Auth guard check:', {
      userData: userData ? 'present' : 'null',
      email: userData?.email,
      isAuthSystemReady,
    });

    // Call the callback if provided
    if (onAuthStateChange) {
      onAuthStateChange(isAuthenticated);
    }

    // Handle redirects based on auth state
    if (requireAuth && !isAuthenticated && redirectTo) {
      consoleLog(
        'Auth required but user not authenticated, redirecting to:',
        redirectTo
      );
      navigate({ to: redirectTo });
    } else if (!requireAuth && isAuthenticated && redirectTo) {
      consoleLog(
        'Auth not required but user authenticated, redirecting to:',
        redirectTo
      );
      navigate({ to: redirectTo });
    }
  }, [
    userData,
    isAuthSystemReady,
    isAuthenticated,
    requireAuth,
    redirectTo,
    navigate,
    onAuthStateChange,
  ]);

  return {
    isAuthenticated,
    isAuthSystemReady,
    userData,
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
