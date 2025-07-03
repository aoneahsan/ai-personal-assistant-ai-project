import AuthStateDebug from '@/components/Auth/AuthStateDebug';
import AppSwipeHOC from '@/hoc/AppSwipeHOC';
import { unifiedAuthService } from '@/services/authService';
import ENV_KEYS from '@/utils/envKeys';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useState } from 'react';

const RootComponent = () => {
  const router = useRouter();
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize authentication services on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        consoleLog('🔄 Initializing authentication at root level...');
        setIsInitializing(true);
        setInitError(null);

        await unifiedAuthService.initialize();
        consoleLog('✅ Authentication services initialized at root level');

        // Add small delay to ensure auth state is properly set
        setTimeout(() => {
          setIsInitializing(false);
        }, 200);
      } catch (error) {
        consoleError(
          '❌ Failed to initialize authentication at root level:',
          error
        );
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setInitError(errorMessage);
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading state while initializing
  if (isInitializing) {
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
          <p className='text-gray-600 text-lg'>Starting application...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className='min-h-screen flex align-items-center justify-content-center bg-gray-50'>
        <div className='text-center p-4'>
          <div className='text-red-500 text-6xl mb-4'>⚠️</div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Initialization Error
          </h2>
          <p className='text-gray-600 mb-4'>
            Failed to initialize authentication services
          </p>
          <p className='text-sm text-gray-500 mb-4'>{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* HOCs which depends on router */}
      <AppSwipeHOC>
        <Outlet />
      </AppSwipeHOC>

      {/* Debug Components - Development Only */}
      {!ENV_KEYS.isProduction && (
        <>
          <AuthStateDebug />
          {ENV_KEYS.tanstackRouterDevtools && (
            <TanStackRouterDevtools
              position='top-right'
              router={router}
            />
          )}
        </>
      )}
    </>
  );
};

const appRootRoute = createRootRoute({
  component: RootComponent,
});

export default appRootRoute;
