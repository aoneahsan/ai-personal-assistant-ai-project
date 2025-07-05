import { useEffect, useState } from 'react';
import { useSystemConfigStore } from '../zustandStates/systemConfigState';
import { useUserDataZState } from '../zustandStates/userState';

interface SystemConfigInitializationState {
  isInitializing: boolean;
  initializationComplete: boolean;
  error: string | null;
  retryCount: number;
}

export const useSystemConfigInitialization = () => {
  const [state, setState] = useState<SystemConfigInitializationState>({
    isInitializing: false,
    initializationComplete: false,
    error: null,
    retryCount: 0,
  });

  const {
    initializeConfig,
    loadConfig,
    isInitialized,
    isLoading,
    error: configError,
    subscribeToChanges,
  } = useSystemConfigStore();

  const user = useUserDataZState((state) => state.data);

  // Maximum retry attempts
  const MAX_RETRIES = 3;

  const initializeSystemConfig = async (userId?: string) => {
    if (state.isInitializing || state.initializationComplete) {
      return;
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    try {
      // Try to load existing configurations first (doesn't require auth)
      await loadConfig();

      // If we have a user ID and configurations are empty, try to initialize
      if (userId && !isInitialized) {
        try {
          await initializeConfig(userId);
        } catch (initError) {
          console.warn(
            'Failed to initialize with user ID, but continuing with loaded config:',
            initError
          );
          // Don't throw here - we might have fallback configurations
        }
      }

      setState((prev) => ({
        ...prev,
        isInitializing: false,
        initializationComplete: true,
        error: null,
        retryCount: 0,
      }));
    } catch (error) {
      console.error('Failed to initialize system configuration:', error);

      // Check if this is a permission error
      const isPermissionError =
        error instanceof Error &&
        (error.message.includes('permission') ||
          error.message.includes('insufficient'));

      if (isPermissionError) {
        console.warn(
          'Permission error detected - system may not be fully authenticated yet'
        );
        // Set a less severe error message for permission issues
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: 'System configurations will load once authenticated',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to initialize system configuration',
        }));
      }
    }
  };

  const retryInitialization = async () => {
    if (state.retryCount >= MAX_RETRIES) {
      console.error(
        'Max retries reached for system configuration initialization'
      );
      return;
    }

    setState((prev) => ({ ...prev, retryCount: prev.retryCount + 1 }));

    // Wait a bit before retrying
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 * (state.retryCount + 1))
    );

    await initializeSystemConfig(user?.id);
  };

  // Initialize on mount or when user changes
  useEffect(() => {
    // Only initialize if not already initialized
    if (!isInitialized && !state.isInitializing) {
      initializeSystemConfig(user?.id);
    }
  }, [user?.id, isInitialized]);

  // Subscribe to real-time configuration changes
  useEffect(() => {
    if (state.initializationComplete) {
      const unsubscribe = subscribeToChanges((config) => {
        console.log('System configuration updated:', config);
      });

      return unsubscribe;
    }
  }, [state.initializationComplete, subscribeToChanges]);

  // Handle configuration errors
  useEffect(() => {
    if (configError && !state.error) {
      setState((prev) => ({ ...prev, error: configError }));
    }
  }, [configError]);

  // Auto-retry when user becomes available
  useEffect(() => {
    if (user?.id && state.error && state.error.includes('authenticated')) {
      console.log(
        'User authenticated, retrying system configuration initialization...'
      );
      initializeSystemConfig(user.id);
    }
  }, [user?.id, state.error]);

  return {
    // Initialization state
    isInitializing: state.isInitializing || isLoading,
    initializationComplete: state.initializationComplete && isInitialized,
    error: state.error || configError,
    retryCount: state.retryCount,
    canRetry: state.retryCount < MAX_RETRIES,

    // Actions
    retryInitialization,
    forceInitialization: () => initializeSystemConfig(user?.id),

    // System config state
    isSystemConfigReady: isInitialized && state.initializationComplete,
  };
};

export default useSystemConfigInitialization;
