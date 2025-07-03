import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import PublicRoute from '@/components/Auth/PublicRoute';
import AuthPage from '@/pages/Auth';
import Chat from '@/pages/Chat';
import ChatList from '@/pages/ChatList';
import NotFound from '@/pages/NotFound';
import { ROUTES } from '@/utils/constants/routingConstants';
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

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const EmbedDemo = lazy(() => import('@/pages/EmbedDemo'));
const ChatView = lazy(() => import('@/components/Chat/ChatView'));

// Policy page components
const PrivacyPolicy = lazy(() => import('@/pages/Policy/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/Policy/TermsOfService'));
const DataDeletionPolicy = lazy(
  () => import('@/pages/Policy/DataDeletionPolicy')
);
const CookiePolicy = lazy(() => import('@/pages/Policy/CookiePolicy'));

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
          onClick={() => (window.location.href = ROUTES.AUTH)}
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

// Root route - redirect to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Auth route - public route with auth guard (redirects authenticated users)
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.AUTH,
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
  path: ROUTES.ANONYMOUS_CHAT,
  validateSearch: chatSearchSchema,
  component: () => <Chat />,
  errorComponent: ErrorFallback,
});

// Chat routes - with auth protection
const chatListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.CHATS,
  component: () => (
    <ProtectedRoute>
      <ChatList />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.CHAT,
  validateSearch: chatSearchSchema,
  component: () => (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Dashboard Chats route
const dashboardChatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD_CHATS,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Dashboard Chat Embeds route
const dashboardChatEmbedsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD_CHAT_EMBEDS,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Dashboard Account route
const dashboardAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD_ACCOUNT,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Individual Chat View route
const chatViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD_CHAT_VIEW,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Profile route
const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.EDIT_PROFILE,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <EditProfile />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Embed demo route
const embedDemoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.EMBED_DEMO,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <EmbedDemo />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Policy routes - public access
const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.PRIVACY_POLICY,
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <PrivacyPolicy />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.TERMS_OF_SERVICE,
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TermsOfService />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const dataDeletionPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DATA_DELETION_POLICY,
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DataDeletionPolicy />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const cookiePolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.COOKIE_POLICY,
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <CookiePolicy />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

// 404 route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.NOT_FOUND,
  component: NotFound,
});

// Anonymous chat room route (no authentication required)
const anonymousRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.ANONYMOUS_ROOM,
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
  dashboardChatsRoute,
  dashboardChatEmbedsRoute,
  dashboardAccountRoute,
  chatViewRoute,
  editProfileRoute,
  embedDemoRoute,
  chatListRoute,
  chatRoute,
  // Policy routes
  privacyPolicyRoute,
  termsOfServiceRoute,
  dataDeletionPolicyRoute,
  cookiePolicyRoute,
  // Other routes
  notFoundRoute,
  anonymousRoomRoute,
  anonymousRoomWithIdRoute,
]);
