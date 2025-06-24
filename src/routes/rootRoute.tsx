import AppSwipeHOC from '@/hoc/AppSwipeHOC';
import ENV_KEYS from '@/utils/envKeys';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const appRootRoute = createRootRoute({
  component: () => (
    <>
      {/* HOCs which depends on router */}
      <AppSwipeHOC>
        <Outlet />
      </AppSwipeHOC>

      {!ENV_KEYS.isProduction && <TanStackRouterDevtools />}
    </>
  ),
});

export default appRootRoute;
