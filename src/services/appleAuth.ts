import {
  SignInWithApple,
  SignInWithAppleResponse,
} from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';
import {
  OAuthProvider,
  signInWithCredential,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

// Apple Auth Service Interface
export interface AppleAuthService {
  isAvailable: () => boolean;
  signIn: () => Promise<UserCredential>;
}

// Generate a random nonce for Apple Sign In
const generateNonce = (): string => {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

// Apple Auth Methods
export const appleAuthService: AppleAuthService = {
  // Check if Apple Sign In is available (only on iOS)
  isAvailable: (): boolean => {
    return Capacitor.getPlatform() === 'ios';
  },

  // Sign in with Apple
  signIn: async (): Promise<UserCredential> => {
    try {
      // Check if Apple Sign In is available
      if (!appleAuthService.isAvailable()) {
        throw new Error('Apple Sign In is only available on iOS devices');
      }

      const nonce = generateNonce();

      // Sign in with Apple
      const appleResponse: SignInWithAppleResponse =
        await SignInWithApple.authorize({
          clientId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          redirectURI: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth/handler`,
          scopes: 'email name',
          state: 'state',
          nonce: nonce,
        });

      if (!appleResponse.response?.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Create Firebase credential with Apple ID token
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: appleResponse.response.identityToken,
        rawNonce: nonce,
      });

      // Sign in to Firebase with the Apple credential
      const userCredential = await signInWithCredential(auth, credential);

      return userCredential;
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw new Error('Failed to sign in with Apple. Please try again.');
    }
  },
};

export default appleAuthService;
