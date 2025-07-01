import {
  consoleError,
  consoleLog,
  consoleWarn,
} from '@/utils/helpers/consoleHelper';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
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

// Apple Auth Methods
export const appleAuthService: AppleAuthService = {
  // Check if Apple Sign In is available (only on iOS)
  isAvailable: (): boolean => {
    const platform = Capacitor.getPlatform();
    consoleLog(`Checking Apple Sign In availability on platform: ${platform}`);

    const isAvailable = platform === 'ios';
    consoleLog(`Apple Sign In available: ${isAvailable}`);

    return isAvailable;
  },

  // Sign in with Apple
  signIn: async (): Promise<UserCredential> => {
    try {
      const platform = Capacitor.getPlatform();
      consoleLog(`Attempting Apple Sign In on platform: ${platform}`);

      // Check if Apple Sign In is available
      if (!appleAuthService.isAvailable()) {
        consoleError(`Apple Sign In not available on ${platform}`);
        throw new Error(
          `Apple Sign In is only available on iOS devices. Current platform: ${platform}`
        );
      }

      // Generate nonce for security
      const rawNonce = generateNonce();
      const hashedNonce = await hashNonce(rawNonce);

      // The nonce is required for Apple Sign In
      if (!rawNonce) {
        throw new Error('Failed to generate nonce for Apple Sign In');
      }

      consoleLog('Generating secure nonce for Apple Sign In');

      try {
        consoleLog('Initiating Apple Sign In with Capacitor plugin');

        const result = await SignInWithApple.authorize({
          clientId: import.meta.env.VITE_FIREBASE_PROJECT_ID + '.app',
          redirectURI: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com/__/auth/handler`,
          scopes: 'email name',
          state: hashedNonce,
          nonce: rawNonce,
        });

        consoleLog('Apple Sign In response received');

        if (!result.response.identityToken) {
          consoleError('No identity token received from Apple');
          throw new Error('No identity token received from Apple Sign In');
        }

        consoleLog('Creating Firebase credential with Apple identity token');

        // Create the Apple credential
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
          idToken: result.response.identityToken,
          rawNonce,
        });

        consoleLog('Signing in to Firebase with Apple credential');

        // Sign in to Firebase with the Apple credential
        const userCredential = await signInWithCredential(auth, credential);
        consoleLog('Apple Sign In completed successfully');

        return userCredential;
      } catch (error) {
        consoleError('Error signing in with Apple:', error);
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },
};

export default appleAuthService;

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
const hashNonce = async (str: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback - return the original string (not ideal but works for development)
  consoleWarn('crypto.subtle not available, using plain nonce');
  return str;
};
