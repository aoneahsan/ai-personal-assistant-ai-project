import AuthStateDebug from '@/components/Auth/AuthStateDebug';
import AppSwipeHOC from '@/hoc/AppSwipeHOC';
import { unifiedAuthService } from '@/services/authService';
import ENV_KEYS from '@/utils/envKeys';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useEffect } from 'react';

const appRootRoute = createRootRoute({
  component: () => {
    const router = useRouter();

    // Initialize authentication services on app start
    useEffect(() => {
      const initAuth = async () => {
        try {
          await unifiedAuthService.initialize();
          console.log('Authentication services initialized at root level');
        } catch (error) {
          console.error('Failed to initialize authentication services:', error);
        }
      };

      initAuth();
    }, []);

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
  },
});

export default appRootRoute;
