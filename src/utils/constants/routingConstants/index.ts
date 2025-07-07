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

  // Dashboard Nested Routes (using proper nested structure)
  DASHBOARD_CHATS: '/dashboard/chats',
  DASHBOARD_CHAT_VIEW: '/dashboard/chats/view/$chatId',
  DASHBOARD_CHAT_EMBEDS: '/dashboard/embeds',
  DASHBOARD_FEEDBACK_EMBEDS: '/dashboard/feedback-embeds',
  DASHBOARD_ACCOUNT: '/dashboard/account',
  EDIT_PROFILE: '/dashboard/profile',
  
  // Product Adoption Routes
  DASHBOARD_PRODUCT_ADOPTION: '/dashboard/product-adoption',
  DASHBOARD_PRODUCT_ADOPTION_TOURS: '/dashboard/product-adoption/tours',
  DASHBOARD_PRODUCT_ADOPTION_ANALYTICS: '/dashboard/product-adoption/analytics',
  DASHBOARD_PRODUCT_ADOPTION_WIDGETS: '/dashboard/product-adoption/widgets',

  // Anonymous Room Routes (no authentication required)
  ANONYMOUS_ROOM: '/room',
  ANONYMOUS_ROOM_WITH_ID: '/room/$roomId',

  // Standalone Routes (outside dashboard layout)
  EMBED_DEMO: '/embed-demo',
  EMBED_FEEDBACK: '/embed/feedback',
  ADMIN: '/admin',

  // Policy Routes (public access)
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
  [ROUTES.DASHBOARD_FEEDBACK_EMBEDS]: 'Feedback Embeds',
  [ROUTES.DASHBOARD_ACCOUNT]: 'Account',
  [ROUTES.DASHBOARD_PRODUCT_ADOPTION]: 'Product Adoption',
  [ROUTES.DASHBOARD_PRODUCT_ADOPTION_TOURS]: 'Product Tours',
  [ROUTES.DASHBOARD_PRODUCT_ADOPTION_ANALYTICS]: 'Adoption Analytics',
  [ROUTES.DASHBOARD_PRODUCT_ADOPTION_WIDGETS]: 'Adoption Widgets',
  [ROUTES.ANONYMOUS_ROOM]: 'Anonymous Room',
  [ROUTES.EMBED_DEMO]: 'Embed Demo',
  [ROUTES.EMBED_FEEDBACK]: 'Embed Feedback',
  [ROUTES.ADMIN]: 'Admin Dashboard',
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
    key: 'embeds',
    label: 'Chat Embeds',
    icon: 'pi pi-code',
    route: ROUTES.DASHBOARD_CHAT_EMBEDS,
  },
  {
    key: 'feedback-embeds',
    label: 'Feedback Embeds',
    icon: 'pi pi-comment',
    route: ROUTES.DASHBOARD_FEEDBACK_EMBEDS,
  },
  {
    key: 'account',
    label: 'Account',
    icon: 'pi pi-user',
    route: ROUTES.DASHBOARD_ACCOUNT,
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'pi pi-user-edit',
    route: ROUTES.EDIT_PROFILE,
  },
] as const;

export default ROUTES;
