# Firebase Authentication Setup Guide

This project uses Firebase authentication with email/password, Google, and Apple sign-in methods. Here's how to set it up:

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication in the Firebase console
4. Configure sign-in methods:
   - **Email/Password**: Enable this method
   - **Google**: Enable and configure OAuth consent screen
   - **Apple**: Enable (iOS only)

## 2. Environment Variables

Copy the values from your Firebase project settings and update your `.env` file:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google Auth Configuration
VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID=your-google-client-id
VITE_GOOGLE_AUTH_IOS_APP_CLIENT_ID=your-ios-client-id
```

## 3. Google Authentication Setup

### For Web:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add your domain to authorized origins
4. Use the Web Client ID for `VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID`

### For iOS:

1. Create an iOS OAuth client ID in Google Cloud Console
2. Download the `GoogleService-Info.plist` file
3. Add it to your iOS project
4. Use the iOS Client ID for `VITE_GOOGLE_AUTH_IOS_APP_CLIENT_ID`

### For Android:

1. Create an Android OAuth client ID
2. Add your app's SHA-1 fingerprint
3. Download `google-services.json`
4. Place it in `android/app/` directory

## 4. Apple Sign In Setup (iOS Only)

1. Enable Apple Sign In in your Apple Developer account
2. Configure your iOS app with Apple Sign In capability
3. Apple Sign In will automatically work on iOS devices

## 5. Capacitor Configuration

The Capacitor configuration is already set up in `capacitor.config.ts`. Make sure your environment variables are correctly set.

## 6. Firebase Security Rules

Update your Firestore security rules to protect user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /pca_users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Usage

### In Components:

```typescript
import { unifiedAuthService } from '@/services/authService';

// Sign in with email
await unifiedAuthService.signInWithEmail(email, password);

// Sign in with Google
await unifiedAuthService.signInWithGoogle();

// Sign in with Apple (iOS only)
await unifiedAuthService.signInWithApple();

// Sign out
await unifiedAuthService.signOut();
```

### Authentication State:

```typescript
import {
  useUserDataZState,
  useIsAuthenticatedZState,
} from '@/zustandStates/userState';

const userData = useUserDataZState((state) => state.data);
const isAuthenticated = useIsAuthenticatedZState();
```

## 8. Platform-Specific Notes

### Web:

- Google Sign In works with popup/redirect flow
- Apple Sign In is not available on web browsers

### iOS:

- Both Google and Apple Sign In are fully supported
- Apple Sign In uses native iOS authentication

### Android:

- Google Sign In works natively
- Apple Sign In is not available on Android

## 9. Testing

1. Set up your environment variables
2. Run `yarn dev` for web testing
3. Use `yarn cap run ios` or `yarn cap run android` for mobile testing
4. Test all authentication methods on their respective platforms

## 10. Troubleshooting

### Common Issues:

- **Google Sign In fails**: Check client IDs and SHA-1 fingerprints
- **Apple Sign In not available**: Only works on iOS 13+ devices
- **Firebase errors**: Verify API keys and project configuration
- **Network errors**: Check internet connection and Firebase project status

### Debugging:

- Check browser console for error messages
- Verify environment variables are loaded correctly
- Test authentication methods individually
- Check Firebase Authentication logs in the console
