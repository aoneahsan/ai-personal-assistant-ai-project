import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import AuthPage from '@/pages/Auth';
import Chat from '@/pages/Chat';
import ChatList from '@/pages/ChatList';
import CompactDashboard from '@/pages/CompactDashboard';
import CompactEditProfile from '@/pages/CompactEditProfile';
import Dashboard from '@/pages/Dashboard';
import EditProfile from '@/pages/EditProfile';
import ModernDashboard from '@/pages/ModernDashboard';
import NotFound from '@/pages/NotFound';
import { createRoute } from '@tanstack/react-router';
import rootRoute from './rootRoute';

// Root route - redirect to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

// Auth route - public route
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
});

// Protected routes - all require authentication
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});

const modernDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/modern-dashboard',
  component: () => (
    <ProtectedRoute>
      <ModernDashboard />
    </ProtectedRoute>
  ),
});

const compactDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compact-dashboard',
  component: () => (
    <ProtectedRoute>
      <CompactDashboard />
    </ProtectedRoute>
  ),
});

const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-profile',
  component: () => (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  ),
});

const compactEditProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compact-edit-profile',
  component: () => (
    <ProtectedRoute>
      <CompactEditProfile />
    </ProtectedRoute>
  ),
});

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

export const appRouteTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  dashboardRoute,
  modernDashboardRoute,
  compactDashboardRoute,
  editProfileRoute,
  compactEditProfileRoute,
  chatListRoute,
  chatRoute,
  notFoundRoute,
]);
