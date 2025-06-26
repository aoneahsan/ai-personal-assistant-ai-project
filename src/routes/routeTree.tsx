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

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const modernDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/modern-dashboard',
  component: ModernDashboard,
});

const compactDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compact-dashboard',
  component: CompactDashboard,
});

const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-profile',
  component: EditProfile,
});

const compactEditProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compact-edit-profile',
  component: CompactEditProfile,
});

const chatListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: ChatList,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: Chat,
});

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
