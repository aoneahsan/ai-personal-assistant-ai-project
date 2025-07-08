import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

// Google Auth Service Interface
export interface GoogleAuthService {
  initialize: () => Promise<void>;
  signIn: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Initialize Google Auth - only for native platforms
export const initializeGoogleAuth = async (): Promise<void> => {
  try {
    const platform = Capacitor.getPlatform();

    // Only initialize for native platforms (iOS/Android)
    if (platform === 'ios' || platform === 'android') {
      consoleLog(`Initializing Google Auth for ${platform} platform`);

      await GoogleAuth.initialize({
        clientId: import.meta.env.VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      consoleLog('Google Auth initialized successfully for native platform');
    } else {
      consoleLog('Web platform detected - Google Auth will use Firebase popup');
    }
  } catch (error) {
    consoleError('Error initializing Google Auth:', error);
    throw error;
  }
};

// Google Auth Methods
export const googleAuthService: GoogleAuthService = {
  // Initialize Google Auth
  initialize: async (): Promise<void> => {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === 'ios' || platform === 'android') {
        await initializeGoogleAuth();
      }
      // No initialization needed for web - Firebase handles it
    } catch (error) {
      consoleError('Error initializing Google Auth:', error);
      // Don't throw error on initialization failure to prevent app crash
      if (
        Capacitor.getPlatform() === 'ios' ||
        Capacitor.getPlatform() === 'android'
      ) {
        throw error;
      }
    }
  },

  // Sign in with Google
  signIn: async (): Promise<UserCredential> => {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === 'ios' || platform === 'android') {
        // Native platform - use Capacitor Google Auth
        consoleLog(`Using native Google Auth for ${platform}`);

        // Ensure Google Auth is initialized
        await initializeGoogleAuth();

        const googleUser = await GoogleAuth.signIn();
        consoleLog('Google Auth native sign-in successful');

        if (!googleUser.authentication?.idToken) {
          throw new Error('No ID token received from Google');
        }

        // Create Firebase credential with Google ID token
        const credential = GoogleAuthProvider.credential(
          googleUser.authentication.idToken,
          googleUser.authentication.accessToken
        );

        // Sign in to Firebase with the Google credential
        const userCredential = await signInWithCredential(auth, credential);
        consoleLog('Firebase credential sign-in successful');
        return userCredential;
      } else {
        // Web platform - use Firebase popup
        consoleLog('Using Firebase popup for web platform');

        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const userCredential = await signInWithPopup(auth, provider);
        consoleLog('Firebase popup sign-in successful');
        return userCredential;
      }
    } catch (error: unknown) {
      consoleError('Error signing in with Google:', error);

      // Handle specific error cases
      const errorCode =
        error && typeof error === 'object' && 'code' in error ? error.code : '';
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : '';

      if (errorCode === 'auth/popup-closed-by-user') {
        throw new Error('Sign in was cancelled. Please try again.');
      } else if (errorCode === 'auth/popup-blocked') {
        throw new Error(
          'Pop-up was blocked. Please allow pop-ups and try again.'
        );
      } else if (errorCode === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in attempt is in progress.');
      } else if (
        errorMessage?.includes('user cancelled') ||
        errorMessage?.includes('canceled')
      ) {
        throw new Error('Sign in was cancelled. Please try again.');
      }

      // Platform-specific error handling
      const platform = Capacitor.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        throw new Error(
          'Failed to sign in with Google on mobile. Please try again.'
        );
      } else {
        throw new Error('Failed to sign in with Google. Please try again.');
      }
    }
  },

  // Sign out from Google
  signOut: async (): Promise<void> => {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === 'ios' || platform === 'android') {
        consoleLog(`Signing out from Google Auth on ${platform}`);
        await GoogleAuth.signOut();
      }
      // For web, Firebase signOut will handle it
      consoleLog('Google sign-out completed');
    } catch (error) {
      consoleError('Error signing out from Google:', error);
      // Don't throw error on sign out failure
    }
  },

  // Refresh Google Auth - only for native platforms
  refresh: async (): Promise<void> => {
    try {
      const platform = Capacitor.getPlatform();

      if (platform === 'ios' || platform === 'android') {
        consoleLog(`Refreshing Google Auth on ${platform}`);
        await GoogleAuth.refresh();
      }
      // No refresh needed for web platform
    } catch (error) {
      consoleError('Error refreshing Google Auth:', error);
      throw error;
    }
  },
};

export default googleAuthService;
