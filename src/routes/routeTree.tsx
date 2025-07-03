import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import PublicRoute from '@/components/Auth/PublicRoute';
import AuthPage from '@/pages/Auth';
import Chat from '@/pages/Chat';
import ChatList from '@/pages/ChatList';
import NotFound from '@/pages/NotFound';
import { createRoute, ErrorComponentProps } from '@tanstack/react-router';
import React, { lazy } from 'react';
import { z } from 'zod';
import rootRoute from './rootRoute';

// Search schema for chat routes
const chatSearchSchema = z
  .object({
    chatId: z.string().optional(),
    userId: z.string().optional(),
    userEmail: z.string().optional(),
    userName: z.string().optional(),
    userAvatar: z.string().optional(),
    contactId: z.string().optional(),
    roomId: z.string().optional(),
    mode: z.enum(['normal', 'anonymous']).optional(),
    clearHistory: z.boolean().optional(),
  })
  .optional();

// Lazy load dashboard components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ModernDashboard = lazy(() => import('@/pages/ModernDashboard'));
const CompactDashboard = lazy(() => import('@/pages/CompactDashboard'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const CompactEditProfile = lazy(() => import('@/pages/CompactEditProfile'));
const EmbedDemo = lazy(() => import('@/pages/EmbedDemo'));

// Error boundary component with correct props interface
const ErrorFallback = ({ error, reset }: ErrorComponentProps) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background)',
      padding: '20px',
    }}
  >
    <div
      style={{
        textAlign: 'center',
        padding: '40px',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚨</div>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
          margin: '0 0 12px 0',
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          marginBottom: '24px',
          lineHeight: '1.5',
          margin: '0 0 24px 0',
        }}
      >
        {error.message || 'An unexpected error occurred'}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={reset}
          style={{
            padding: '12px 24px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--color-primary-hover)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)';
          }}
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = '/auth')}
          style={{
            padding: '12px 24px',
            background: 'var(--color-surface-light)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--color-border-light)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-light)';
          }}
        >
          Go to Login
        </button>
      </div>
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
  validateSearch: chatSearchSchema,
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
  validateSearch: chatSearchSchema,
  component: () => (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Dashboard routes - now active
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

const modernDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/modern-dashboard',
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <ModernDashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

const compactDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compact-dashboard',
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <CompactDashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-profile',
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <EditProfile />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

const compactEditProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compact-edit-profile',
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <CompactEditProfile />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

const embedDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/embed-demo',
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <EmbedDemo />
      </React.Suspense>
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
  errorComponent: ErrorFallback,
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
  errorComponent: ErrorFallback,
});

export const appRouteTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  anonymousChatRoute,
  dashboardRoute,
  modernDashboardRoute,
  compactDashboardRoute,
  editProfileRoute,
  compactEditProfileRoute,
  embedDemoRoute,
  chatListRoute,
  chatRoute,
  notFoundRoute,
  anonymousRoomRoute,
  anonymousRoomWithIdRoute,
]);
