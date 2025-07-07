**Project Summary: AI Personal Assistant**

This document provides a comprehensive overview of the AI Personal Assistant project, including the technologies used, project structure, and architectural patterns. It can be used as a template for new projects to ensure consistency and a clear understanding of the development process.

**1. Core Technologies**

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** PrimeReact, PrimeFlex, PrimeIcons, SCSS
*   **State Management:** Zustand
*   **Routing:** Tanstack Router
*   **Data Fetching:** Axios, Tanstack Query (React Query)
*   **Form Handling:** React Hook Form, Zod (for validation)
*   **Mobile/Desktop:** Capacitor (for building cross-platform apps)
*   **Backend:** Firebase (Authentication, Firestore, Storage)
*   **Deployment:** Firebase Hosting

**2. Project Structure**

The project follows a feature-based structure, with a clear separation of concerns.

```
/src
|-- assets/
|-- axiosInstance/
|-- components/
|   |-- common/
|   |-- Admin/
|   |-- Auth/
|   `-- ... (other feature components)
|-- enums/
|-- hoc/
|-- hooks/
|-- modules/
|-- pages/
|   |-- Admin/
|   |-- Auth/
|   `-- ... (other feature pages)
|-- routes/
|-- services/
|-- styles/
|-- types/
|-- utils/
`-- zustandStates/
```

*   **`assets`**: Static assets like images and fonts.
*   **`axiosInstance`**: A centralized Axios instance for making API requests.
*   **`components`**: Reusable React components, organized by feature.
    *   **`common`**: Components that are shared across multiple features.
*   **`enums`**: TypeScript enums for defining constants.
*   **`hoc`**: Higher-Order Components for wrapping components with additional functionality.
*   **`hooks`**: Custom React hooks for reusing logic across components.
*   **`modules`**: Larger, self-contained feature modules.
*   **`pages`**: Top-level page components that are mapped to routes.
*   **`routes`**: Routing configuration using Tanstack Router.
*   **`services`**: Services for interacting with external APIs and the backend.
*   **`styles`**: Global styles and stylesheets.
*   **`types`**: TypeScript type definitions.
*   **`utils`**: Utility functions and helpers.
*   **`zustandStates`**: Zustand stores for managing global state.

**3. Architecture and Patterns**

*   **Component-Based Architecture:** The UI is built using a hierarchy of reusable React components.
*   **Higher-Order Components (HOCs):** HOCs are used to provide cross-cutting concerns like authentication, analytics, and feature flags.
*   **Custom Hooks:** Custom hooks are used to encapsulate and reuse stateful logic.
*   **Service Layer:** A dedicated service layer is used to abstract away the details of API communication.
*   **Centralized State Management:** Zustand is used for managing global application state in a simple and efficient way.
*   **Routing:** Tanstack Router is used for declarative, type-safe routing.
*   **Styling:** The application uses a combination of PrimeReact components, PrimeFlex for layout, and SCSS for custom styling.

**4. Backend and API**

*   **Firebase:** The project uses Firebase for its backend, including:
    *   **Authentication:** Firebase Authentication for user management.
    *   **Firestore:** A NoSQL database for storing application data.
    *   **Storage:** Firebase Storage for storing user-generated content like images and files.
*   **API Communication:**
    *   **Axios:** A centralized Axios instance is used for making HTTP requests to the backend.
    *   **Tanstack Query:** Tanstack Query is used for data fetching, caching, and synchronization.

**5. Testing Strategy**

*   **Framework:** No testing framework is currently configured. It is recommended to set up a testing framework like **Cypress** (which is already a dev dependency) or **React Testing Library** to ensure code quality and prevent regressions.
*   **Running Tests:** Once a testing framework is in place, a `test` script should be added to `package.json` to run the tests.

**6. Linting and Code Style**

*   **ESLint:** The project uses ESLint for static code analysis. The configuration is in `eslint.config.js`.
    *   **Run Linter:** `npm run lint`
*   **Prettier:** Prettier is used for code formatting. The configuration is in `.prettierrc`.
    *   **Format Code:** `npm run prettier`

**7. Build and Deployment**

*   **Vite:** The project uses Vite for building the application.
*   **Build Modes:**
    *   **Development:** `npm run dev` - Starts the development server.
    *   **Staging:** `npm run build:staging` - Builds the application for the staging environment.
    *   **Production:** `npm run build:production` - Builds the application for the production environment.
*   **Deployment:**
    *   **Firebase Hosting:** The application is deployed to Firebase Hosting.
    *   **Deployment Scripts:**
        *   `npm run deploy:web` - Deploys the application to Firebase Hosting.
        *   `npm run deploy:rules` - Deploys Firestore rules and indexes.
        *   `npm run deploy:staging` - Deploys the application to the staging environment.
        *   `npm run deploy:production` - Deploys the application to the production environment.

**8. Environment Variables**

Create a `.env` file in the root of the project with the following variables:

```
VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID=
VITE_GOOGLE_AUTH_IOS_APP_CLIENT_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_ENCRYPT_SALT=
VITE_SENTRY_ENVIRONMENT=
VITE_SENTRY_DSN=
VITE_ONE_SIGNAL_APP_ID=
VITE_PRODUCT_FRUITS_APP_ID=
VITE_SOCKET_IO_SERVER_URL=
VITE_AMPLITUDE_API_KEY=
VITE_TOLGEE_API_URL=
VITE_TOLGEE_API_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_DATABASE_URL=
```

**9. Mobile (Capacitor) Workflow**

*   **Capacitor:** The project uses Capacitor to build and run the application on mobile devices.
*   **Key Scripts:**
    *   `npm run cap:sync` - Syncs the web build with the native platforms.
    *   `npm run cap:android:run` - Runs the application on an Android device or emulator.
    *   `npm run cap:ios:run` - Runs the application on an iOS device or simulator.
    *   `npm run gen:android:assets` - Generates Android assets.
    *   `npm run gen:ios:assets` - Generates iOS assets.

**10. Key `npm` Scripts**

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run lint`: Lints the code using ESLint.
*   `npm run prettier`: Formats the code using Prettier.
*   `npm run deploy:web`: Deploys the application to Firebase Hosting.

**11. Authentication Flow**

*   **Unified Auth Service:** The application uses a unified authentication service (`src/services/authService.ts`) to handle all authentication methods.
*   **Providers:**
    *   **Email/Password:** Standard email and password authentication.
    *   **Google Sign-In:** Implemented for both web and mobile (iOS/Android) using the `@codetrix-studio/capacitor-google-auth` plugin.
    *   **Apple Sign-In:** Implemented for iOS using the `@capacitor-community/apple-sign-in` plugin.
*   **User Data:** User data is stored in Firestore and managed in the application using a Zustand store.

**12. Third-Party Service Integrations**

*   **Sentry:** Used for error tracking and performance monitoring. The configuration is in `src/sentryErrorLogging/index.ts`.
*   **OneSignal:** Used for push notifications. The configuration is in `src/hoc/OneSignalHOC/index.tsx`.
*   **Amplitude:** Used for product analytics. The configuration is in `src/hoc/AmplitudeHOC/index.tsx`.
*   **Product Fruits:** Used for user onboarding and engagement. The configuration is in `src/hoc/ProductFruitsHOC/index.tsx`.

**13. Code Generation**

*   **Tanstack Router:** The project uses Tanstack Router, which automatically generates a type-safe route tree. This eliminates the need for manual route configuration and provides better type safety.

This summary should provide a solid foundation for new projects, ensuring that developers have a clear understanding of the technologies, architecture, and best practices to follow.
