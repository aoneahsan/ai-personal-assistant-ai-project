import AppSwipeHOC from '@/hoc/AppSwipeHOC';
import ENV_KEYS from '@/utils/envKeys';
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const appRootRoute = createRootRoute({
  component: () => {
    const router = useRouter();

    return (
      <>
        {/* HOCs which depends on router */}
        <AppSwipeHOC>
          <Outlet />
        </AppSwipeHOC>

        {!ENV_KEYS.isProduction && ENV_KEYS.tanstackRouterDevtools && (
          <TanStackRouterDevtools
            position='top-right'
            router={router}
          />
        )}
      </>
    );
  },
});

export default appRootRoute;
