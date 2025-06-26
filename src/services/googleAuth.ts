import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import {
  GoogleAuthProvider,
  signInWithCredential,
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

// Initialize Google Auth
export const initializeGoogleAuth = async (): Promise<void> => {
  try {
    await GoogleAuth.initialize({
      clientId: import.meta.env.VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID,
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  } catch (error) {
    console.error('Error initializing Google Auth:', error);
    throw error;
  }
};

// Google Auth Methods
export const googleAuthService: GoogleAuthService = {
  // Initialize Google Auth
  initialize: async (): Promise<void> => {
    try {
      if (Capacitor.isNativePlatform()) {
        await initializeGoogleAuth();
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      throw error;
    }
  },

  // Sign in with Google
  signIn: async (): Promise<UserCredential> => {
    try {
      // Initialize if not already done
      if (Capacitor.isNativePlatform()) {
        await initializeGoogleAuth();
      }

      const googleUser = await GoogleAuth.signIn();

      if (!googleUser.authentication?.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Create Firebase credential with Google ID token
      const credential = GoogleAuthProvider.credential(
        googleUser.authentication.idToken
      );

      // Sign in to Firebase with the Google credential
      const userCredential = await signInWithCredential(auth, credential);

      return userCredential;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw new Error('Failed to sign in with Google. Please try again.');
    }
  },

  // Sign out from Google
  signOut: async (): Promise<void> => {
    try {
      await GoogleAuth.signOut();
    } catch (error) {
      console.error('Error signing out from Google:', error);
      throw error;
    }
  },

  // Refresh Google Auth
  refresh: async (): Promise<void> => {
    try {
      await GoogleAuth.refresh();
    } catch (error) {
      console.error('Error refreshing Google Auth:', error);
      throw error;
    }
  },
};

export default googleAuthService;
