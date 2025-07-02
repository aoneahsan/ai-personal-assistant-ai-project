import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import PublicRoute from '@/components/Auth/PublicRoute';
import AuthPage from '@/pages/Auth';
import Chat from '@/pages/Chat';
import ChatList from '@/pages/ChatList';
import NotFound from '@/pages/NotFound';
import { createRoute, ErrorComponentProps } from '@tanstack/react-router';
import React from 'react';
import rootRoute from './rootRoute';

// Error boundary component with correct props interface
const ErrorFallback = ({ error, reset }: ErrorComponentProps) => (
  <div className='min-h-screen flex align-items-center justify-content-center bg-gray-50'>
    <div className='text-center p-4'>
      <div className='text-red-500 text-6xl mb-4'>🚨</div>
      <h2 className='text-2xl font-bold text-gray-800 mb-2'>
        Something went wrong
      </h2>
      <p className='text-gray-600 mb-4'>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2'
      >
        Try Again
      </button>
      <button
        onClick={() => (window.location.href = '/auth')}
        className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
      >
        Go to Login
      </button>
    </div>
  </div>
);

// Root route - redirect to chats instead of dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <ChatList />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Auth route - public route with auth guard (redirects authenticated users)
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: () => (
    <PublicRoute>
      <AuthPage />
    </PublicRoute>
  ),
  errorComponent: ErrorFallback,
});

// Anonymous chat route - allows anonymous access
const anonymousChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/anonymous-chat',
  component: () => <Chat />,
  errorComponent: ErrorFallback,
});

// Chat routes - keeping these active with auth protection
const chatListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: () => (
    <ProtectedRoute>
      <ChatList />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: () => (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
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

// Anonymous chat room route (no authentication required)
const anonymousRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room',
  component: () => {
    const AnonymousRoomPage = React.lazy(() => import('@/pages/AnonymousRoom'));
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <AnonymousRoomPage />
      </React.Suspense>
    );
  },
});

// Anonymous chat room with room ID route (no authentication required)
const anonymousRoomWithIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$roomId',
  component: () => {
    const AnonymousRoomChatPage = React.lazy(
      () => import('@/pages/AnonymousRoom/AnonymousRoomChat')
    );
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <AnonymousRoomChatPage />
      </React.Suspense>
    );
  },
});

export const appRouteTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  anonymousChatRoute,
  // dashboardRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // modernDashboardRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // compactDashboardRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // editProfileRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  // compactEditProfileRoute, // DEVELOPER NOTE: Commented out - will uncomment when needed
  chatListRoute,
  chatRoute,
  notFoundRoute,
  anonymousRoomRoute,
  anonymousRoomWithIdRoute,
]);
