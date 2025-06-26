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

// Generate a random nonce for Apple Sign In (cryptographically secure)
const generateNonce = (): string => {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
  let result = '';

  // Use crypto.getRandomValues if available (more secure)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    for (let i = 0; i < array.length; i++) {
      result += charset.charAt(array[i] % charset.length);
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < 32; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }

  return result;
};

// Hash the nonce using SHA256 (required for Apple Sign In)
const sha256 = async (str: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback - return the original string (not ideal but works for development)
  console.warn('crypto.subtle not available, using plain nonce');
  return str;
};

// Apple Auth Methods
export const appleAuthService: AppleAuthService = {
  // Check if Apple Sign In is available (only on iOS)
  isAvailable: (): boolean => {
    const platform = Capacitor.getPlatform();
    console.log(`Checking Apple Sign In availability on platform: ${platform}`);

    const isAvailable = platform === 'ios';
    console.log(`Apple Sign In available: ${isAvailable}`);

    return isAvailable;
  },

  // Sign in with Apple
  signIn: async (): Promise<UserCredential> => {
    try {
      const platform = Capacitor.getPlatform();
      console.log(`Attempting Apple Sign In on platform: ${platform}`);

      // Check if Apple Sign In is available
      if (!appleAuthService.isAvailable()) {
        console.error(`Apple Sign In not available on ${platform}`);

        if (platform === 'web') {
          throw new Error(
            'Apple Sign In is not available on web browsers. Please use Google Sign In or email/password instead.'
          );
        } else if (platform === 'android') {
          throw new Error(
            'Apple Sign In is not available on Android devices. Please use Google Sign In or email/password instead.'
          );
        } else {
          throw new Error('Apple Sign In is only available on iOS devices');
        }
      }

      console.log('Generating secure nonce for Apple Sign In');
      const rawNonce = generateNonce();
      const hashedNonce = await sha256(rawNonce);

      // Sign in with Apple
      console.log('Initiating Apple Sign In with Capacitor plugin');
      const appleResponse: SignInWithAppleResponse =
        await SignInWithApple.authorize({
          clientId: import.meta.env.VITE_FIREBASE_PROJECT_ID + '.app',
          redirectURI: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth/handler`,
          scopes: 'email name',
          state: generateNonce(), // Use random state
          nonce: hashedNonce,
        });

      console.log('Apple Sign In response received');

      if (!appleResponse.response?.identityToken) {
        console.error('No identity token received from Apple');
        throw new Error('No identity token received from Apple');
      }

      console.log('Creating Firebase credential with Apple identity token');
      // Create Firebase credential with Apple ID token
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: appleResponse.response.identityToken,
        rawNonce: rawNonce, // Use the original raw nonce
      });

      // Sign in to Firebase with the Apple credential
      console.log('Signing in to Firebase with Apple credential');
      const userCredential = await signInWithCredential(auth, credential);

      console.log('Apple Sign In completed successfully');
      return userCredential;
    } catch (error: any) {
      console.error('Error signing in with Apple:', error);

      // Handle specific Apple Sign In errors
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Apple Sign In failed. Please try again.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Apple Sign In is not enabled. Please contact support.'
        );
      } else if (
        error.message?.includes('user cancelled') ||
        error.message?.includes('canceled')
      ) {
        throw new Error('Apple Sign In was cancelled.');
      } else if (error.message?.includes('not available')) {
        // Re-throw our custom availability messages
        throw error;
      }

      // Default error message
      throw new Error('Failed to sign in with Apple. Please try again.');
    }
  },
};

export default appleAuthService;
