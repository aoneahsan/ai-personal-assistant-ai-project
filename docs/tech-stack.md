# Technology Stack

## Frontend Technologies

### Core Framework
- **React 19.1.0** - Latest React version with concurrent features
- **TypeScript 5.7.2** - Type-safe development
- **Vite 7.0.2** - Lightning-fast build tool and dev server

### UI & Styling
- **PrimeReact 10.9.6** - Comprehensive UI component library
- **PrimeFlex** - Utility-first CSS framework
- **PrimeIcons** - Icon library
- **SCSS** - Enhanced CSS with variables and mixins
- **CSS Modules** - Component-scoped styling

### State Management & Data Fetching
- **Zustand 5.0.4** - Lightweight state management
- **TanStack Query 6.1.5** - Powerful data fetching and caching
- **Axios 1.7.9** - HTTP client for API requests

### Routing & Navigation
- **TanStack Router 1.87.15** - Type-safe, modern routing
- **React Router DOM 7.1.1** - Alternative routing (being phased out)

### Form Management
- **React Hook Form 7.55.1** - Performant form handling
- **Zod 3.24.1** - Schema validation

### Real-time Communication
- **Socket.io-client 4.8.1** - WebSocket communication
- **SimplePeer 9.11.1** - WebRTC for peer-to-peer connections

### Media Handling
- **react-audio-voice-recorder 2.2.0** - Audio recording
- **react-media-recorder 1.7.1** - Media recording capabilities
- **Swiper 11.1.16** - Touch slider for media galleries

## Backend Technologies

### Firebase Services (10.15.1)
- **Firebase Auth** - Multi-provider authentication
- **Cloud Firestore** - NoSQL real-time database
- **Firebase Storage** - File and media storage
- **Firebase Hosting** - Web hosting and CDN
- **Firebase Analytics** - Usage tracking

### Mobile Development
- **Capacitor 6.3.0** - Cross-platform mobile runtime
- **@capacitor/ios** - iOS native bridge
- **@capacitor/android** - Android native bridge
- **capacitor-plugin-safe-area** - Handle device safe areas

## Third-Party Integrations

### Analytics & Monitoring
- **Sentry** - Error tracking and performance monitoring
- **Amplitude** - Product analytics
- **Google Analytics** - Web analytics

### User Experience
- **OneSignal** - Push notifications
- **Tolgee** - Internationalization (i18n)
- **Product Fruits** - User onboarding and tours

### Development Tools
- **ESLint 9.19.0** - Code linting
- **Prettier** - Code formatting
- **Vite PWA Plugin 0.21.1** - Progressive Web App support

## Package Management

### Dependencies Summary
```json
{
  "dependencies": 47 packages,
  "devDependencies": 14 packages,
  "peerDependencies": 2 packages
}
```

### Key Utility Libraries
- **Day.js 1.11.13** - Date manipulation
- **Moment.js 2.30.1** - Legacy date handling
- **Nanoid 5.0.9** - Unique ID generation
- **Crypto-JS 4.2.0** - Encryption utilities
- **React Icons 5.4.0** - Icon sets

## Build & Deployment

### Build Tools
- **Vite** - Primary build tool
- **TypeScript** - Compilation and type checking
- **SCSS** - CSS preprocessing

### Deployment Platforms
- **Firebase Hosting** - Web deployment
- **App Store** - iOS distribution
- **Google Play** - Android distribution

## Development Environment

### Recommended Setup
- **Node.js** - v18+ recommended
- **pnpm** - Preferred package manager
- **VS Code** - Recommended IDE

### Scripts
```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build

# Mobile
pnpm mobile:sync  # Sync web to mobile
pnpm ios:run      # Run iOS app
pnpm android:run  # Run Android app

# Quality
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript checking
```

## Browser Support

- **Chrome** - Latest 2 versions
- **Firefox** - Latest 2 versions
- **Safari** - Latest 2 versions
- **Edge** - Latest 2 versions
- **Mobile Safari** - iOS 13+
- **Chrome Mobile** - Android 7+

## Performance Optimizations

- **Code Splitting** - Route-based lazy loading
- **Tree Shaking** - Unused code elimination
- **Asset Optimization** - Image and file compression
- **Caching** - Service Worker and HTTP caching
- **PWA Support** - Offline capabilities