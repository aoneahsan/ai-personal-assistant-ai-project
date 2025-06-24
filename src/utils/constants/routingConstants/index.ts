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
