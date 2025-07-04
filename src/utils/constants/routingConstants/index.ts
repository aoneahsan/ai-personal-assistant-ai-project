// Add route search params here, like pageStep, etc.
export const routeSearchParams = {} as const;

// Add pages inner routes here, like profile, settings, etc.
export const pagesInnerRoutes = {} as const;

export const appRoutes = {
  root: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  home: '/',
  profile: '/profile',
  logout: '/logout',
} as const;

// Named Routes Constants
// Use these constants throughout the app for consistent navigation

export const ROUTES = {
  // Authentication
  AUTH: '/auth',

  // Main Routes
  ROOT: '/',
  DASHBOARD: '/dashboard',
  EDIT_PROFILE: '/edit-profile',

  // Dashboard Sections
  DASHBOARD_CHATS: '/dashboard/chats',
  DASHBOARD_CHAT_VIEW: '/dashboard/chats/view/$chatId',
  DASHBOARD_CHAT_EMBEDS: '/dashboard/chat-embeds',
  DASHBOARD_ACCOUNT: '/dashboard/account',

  // Chat Routes
  CHAT: '/chat',
  ANONYMOUS_CHAT: '/anonymous-chat',

  // Anonymous Room Routes
  ANONYMOUS_ROOM: '/room',
  ANONYMOUS_ROOM_WITH_ID: '/room/$roomId',

  // Demo Routes
  EMBED_DEMO: '/embed-demo',

  // Policy Routes
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
  DATA_DELETION_POLICY: '/data-deletion-policy',
  COOKIE_POLICY: '/cookie-policy',
} as const;

// Route Labels for Display
export const ROUTE_LABELS = {
  [ROUTES.ROOT]: 'Home',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.EDIT_PROFILE]: 'Edit Profile',
  [ROUTES.DASHBOARD_CHATS]: 'Chats',
  [ROUTES.DASHBOARD_CHAT_VIEW]: 'Chat View',
  [ROUTES.DASHBOARD_CHAT_EMBEDS]: 'Chat Embeds',
  [ROUTES.DASHBOARD_ACCOUNT]: 'Account',
  [ROUTES.CHAT]: 'Chat',
  [ROUTES.ANONYMOUS_CHAT]: 'Anonymous Chat',
  [ROUTES.ANONYMOUS_ROOM]: 'Anonymous Room',
  [ROUTES.EMBED_DEMO]: 'Embed Demo',
  [ROUTES.AUTH]: 'Authentication',
  [ROUTES.PRIVACY_POLICY]: 'Privacy Policy',
  [ROUTES.TERMS_OF_SERVICE]: 'Terms of Service',
  [ROUTES.DATA_DELETION_POLICY]: 'Data Deletion Policy',
  [ROUTES.COOKIE_POLICY]: 'Cookie Policy',
} as const;

// Navigation Helper Type
export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

// Navigation Items for Menus
export const NAVIGATION_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'pi pi-home',
    route: ROUTES.DASHBOARD,
  },
  {
    key: 'chats',
    label: 'Chats',
    icon: 'pi pi-comments',
    route: ROUTES.DASHBOARD_CHATS,
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'pi pi-user',
    route: ROUTES.EDIT_PROFILE,
  },
  {
    key: 'embed-demo',
    label: 'Embed Demo',
    icon: 'pi pi-code',
    route: ROUTES.EMBED_DEMO,
  },
] as const;

export default ROUTES;
