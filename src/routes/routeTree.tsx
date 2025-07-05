import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import PublicRoute from '@/components/Auth/PublicRoute';
import DashboardLayout from '@/components/common/DashboardLayout';
import AuthPage from '@/pages/Auth';
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
const EmbedDemo = lazy(() => import('@/pages/EmbedDemo'));
const AdminDashboard = lazy(() => import('@/pages/Admin'));
const EditProfile = lazy(() => import('@/pages/EditProfile'));
const ChatView = lazy(() => import('@/components/Chat/ChatView'));

// Dashboard page components
const DashboardOverview = lazy(
  () => import('@/pages/Dashboard/DashboardOverview')
);
const DashboardChats = lazy(() => import('@/pages/Dashboard/DashboardChats'));
const DashboardChatEmbeds = lazy(
  () => import('@/pages/Dashboard/DashboardChatEmbeds')
);
const DashboardAccount = lazy(
  () => import('@/pages/Dashboard/DashboardAccount')
);

// Policy page components
const PrivacyPolicy = lazy(() => import('@/pages/Policy/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/Policy/TermsOfService'));
const DataDeletionPolicy = lazy(
  () => import('@/pages/Policy/DataDeletionPolicy')
);
const CookiePolicy = lazy(() => import('@/pages/Policy/CookiePolicy'));

// Error boundary component
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
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
);

// Auth route - public route with auth guard
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

// Dashboard Layout Route (Parent for all dashboard routes)
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Dashboard nested routes
const dashboardOverviewRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/',
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardOverview />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const dashboardChatsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/chats',
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardChats />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const dashboardChatViewRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/chats/view/$chatId',
  validateSearch: chatSearchSchema,
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ChatView />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const dashboardChatEmbedsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/embeds',
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardChatEmbeds />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const dashboardAccountRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/account',
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardAccount />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

const dashboardProfileRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: '/profile',
  component: () => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <EditProfile />
    </React.Suspense>
  ),
  errorComponent: ErrorFallback,
});

// Root route - redirect to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Standalone routes (outside dashboard layout)
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

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.ADMIN,
  component: () => (
    <ProtectedRoute>
      <React.Suspense fallback={<div>Loading...</div>}>
        <AdminDashboard />
      </React.Suspense>
    </ProtectedRoute>
  ),
  errorComponent: ErrorFallback,
});

// Anonymous routes (no authentication required)
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

// Create the route tree with proper nesting
export const appRouteTree = rootRoute.addChildren([
  // Root redirect to dashboard
  indexRoute,

  // Auth route
  authRoute,

  // Dashboard layout with nested routes
  dashboardLayoutRoute.addChildren([
    dashboardOverviewRoute,
    dashboardChatsRoute,
    dashboardChatViewRoute,
    dashboardChatEmbedsRoute,
    dashboardAccountRoute,
    dashboardProfileRoute,
  ]),

  // Standalone routes
  embedDemoRoute,
  adminDashboardRoute,

  // Anonymous routes
  anonymousRoomRoute,
  anonymousRoomWithIdRoute,

  // Policy routes
  privacyPolicyRoute,
  termsOfServiceRoute,
  dataDeletionPolicyRoute,
  cookiePolicyRoute,
]);
