import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import AuthPage from '@/pages/Auth';
import Chat from '@/pages/Chat';
import ChatList from '@/pages/ChatList';
import NotFound from '@/pages/NotFound';
import { createRoute } from '@tanstack/react-router';
import rootRoute from './rootRoute';

// Root route - redirect to chats instead of dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <ChatList />
    </ProtectedRoute>
  ),
});

// Auth route - public route
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
});

// Chat routes - keeping these active
const chatListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: () => (
    <ProtectedRoute>
      <ChatList />
    </ProtectedRoute>
  ),
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: () => (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  ),
});

// 404 route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

// DEVELOPER NOTE: Commented out routes - will uncomment when needed
// const dashboardRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/dashboard',
//   component: () => (
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   ),
// });

// const modernDashboardRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/modern-dashboard',
//   component: () => (
//     <ProtectedRoute>
//       <ModernDashboard />
//     </ProtectedRoute>
//   ),
// });

// const compactDashboardRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/compact-dashboard',
//   component: () => (
//     <ProtectedRoute>
//       <CompactDashboard />
//     </ProtectedRoute>
//   ),
// });

// const editProfileRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/edit-profile',
//   component: () => (
//     <ProtectedRoute>
//       <EditProfile />
//     </ProtectedRoute>
//   ),
// });

// const compactEditProfileRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/compact-edit-profile',
//   component: () => (
//     <ProtectedRoute>
//       <CompactEditProfile />
//     </ProtectedRoute>
//   ),
// });

export const appRouteTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  // dashboardRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // modernDashboardRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // compactDashboardRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // editProfileRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // compactEditProfileRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  chatListRoute,
  chatRoute,
  notFoundRoute,
]);
