import { RouterProvider, createRouter } from '@tanstack/react-router';
import { appRouteTree } from './routeTree';

const appRouter = createRouter({ routeTree: appRouteTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof appRouter;
  }
}

const AppRoutes = () => {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
};

export default AppRoutes;
