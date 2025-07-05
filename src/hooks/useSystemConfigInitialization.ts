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
  // Maximum initialization time (10 seconds)
  const MAX_INIT_TIME = 10000;

  const initializeSystemConfig = async (userId?: string) => {
    if (state.isInitializing || state.initializationComplete) {
      return;
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    // Set a timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      console.warn(
        'System configuration initialization timed out, proceeding with fallback'
      );
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        initializationComplete: true,
        error: null,
        retryCount: 0,
      }));
    }, MAX_INIT_TIME);

    try {
      // Try to load existing configurations first (publicly readable)
      await loadConfig();

      // Clear timeout since we succeeded
      clearTimeout(initTimeout);

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
      // Clear timeout on error
      clearTimeout(initTimeout);

      console.error('Failed to initialize system configuration:', error);

      // If this is a permission error, proceed anyway with fallback
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (
        errorMessage.includes('permission') ||
        errorMessage.includes('unauthorized')
      ) {
        console.warn(
          'Permission error detected, proceeding with fallback configuration'
        );
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          initializationComplete: true,
          error: null,
          retryCount: 0,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: errorMessage,
        }));
      }
    }
  };

  const retryInitialization = async () => {
    if (state.retryCount >= MAX_RETRIES) {
      console.error(
        'Max retries reached for system configuration initialization'
      );
      // Force completion to prevent infinite loading
      setState((prev) => ({
        ...prev,
        initializationComplete: true,
        isInitializing: false,
        error: 'Max retries reached, proceeding with fallback configuration',
      }));
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
    // Only initialize if not already initialized and not currently initializing
    if (
      !isInitialized &&
      !state.isInitializing &&
      !state.initializationComplete
    ) {
      initializeSystemConfig(user?.id);
    }
  }, [
    user?.id,
    isInitialized,
    state.isInitializing,
    state.initializationComplete,
  ]);

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

  // Force completion after a maximum time to prevent infinite loading
  useEffect(() => {
    const forceCompletionTimeout = setTimeout(() => {
      if (state.isInitializing && !state.initializationComplete) {
        console.warn(
          'Force completing system config initialization due to timeout'
        );
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          initializationComplete: true,
          error: null,
        }));
      }
    }, 15000); // 15 seconds maximum

    return () => clearTimeout(forceCompletionTimeout);
  }, [state.isInitializing, state.initializationComplete]);

  return {
    // Initialization state
    isInitializing: state.isInitializing || isLoading,
    initializationComplete: state.initializationComplete || isInitialized,
    error: state.error || configError,
    retryCount: state.retryCount,
    canRetry: state.retryCount < MAX_RETRIES,

    // Actions
    retryInitialization,
    forceInitialization: () => initializeSystemConfig(user?.id),

    // System config state
    isSystemConfigReady:
      (isInitialized && state.initializationComplete) ||
      state.initializationComplete,
  };
};

export default useSystemConfigInitialization;
