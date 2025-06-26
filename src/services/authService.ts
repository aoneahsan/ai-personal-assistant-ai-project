import { IPCAUser } from '@/types/user';
import {
  getFirebaseConfigStatus,
  isGoogleAuthConfigured,
} from '@/utils/constants/generic/firebase';
import { useUserDataZState } from '@/zustandStates/userState';
import { Capacitor } from '@capacitor/core';
import { User } from 'firebase/auth';
import { appleAuthService } from './appleAuth';
import {
  authService as firebaseAuthService,
  getUserFromFirestore,
  saveUserToFirestore,
} from './firebase';
import { googleAuthService } from './googleAuth';

// Authentication Types
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export interface SignInResult {
  user: User;
  isNewUser?: boolean;
  provider: AuthProvider;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

// Unified Authentication Service
export class UnifiedAuthService {
  private updateUserData = useUserDataZState.getState().updateData;
  private isInitialized = false;

  // Initialize authentication services
  async initialize(): Promise<void> {
    try {
      const platform = Capacitor.getPlatform();
      console.log(
        `Initializing authentication services for platform: ${platform}`
      );

      // Check Firebase configuration
      const configStatus = getFirebaseConfigStatus();

      if (!configStatus.isConfigured) {
        console.warn('Firebase Configuration Warning:', configStatus.message);
        console.warn(
          'Please check your .env file and ensure all required environment variables are set.'
        );
      }

      // Initialize Google Auth based on platform
      if (isGoogleAuthConfigured()) {
        console.log('Google Auth configuration found, initializing...');
        await googleAuthService.initialize();
        console.log('Google Auth initialized successfully');
      } else {
        console.warn(
          'Google Auth not configured - VITE_GOOGLE_MOBILE_AUTH_CLIENT_ID missing'
        );
      }

      // Log Apple Auth availability
      const isAppleAvailable = appleAuthService.isAvailable();
      console.log(
        `Apple Sign In available: ${isAppleAvailable} (Platform: ${platform})`
      );

      // Listen to authentication state changes
      firebaseAuthService.onAuthStateChange(
        this.handleAuthStateChange.bind(this)
      );

      this.isInitialized = true;
      console.log(
        `Authentication services initialized successfully for ${platform}`
      );
    } catch (error) {
      console.error('Error initializing auth services:', error);
      // Don't throw error to prevent app crash
    }
  }

  // Handle authentication state changes
  private async handleAuthStateChange(user: User | null): Promise<void> {
    if (user) {
      // User is signed in
      try {
        console.log('User signed in:', user.email);

        // Get user data from Firestore
        let userData = await getUserFromFirestore(user.uid);

        // If user doesn't exist in Firestore, save them
        if (!userData) {
          console.log('Creating new user record in Firestore');
          await saveUserToFirestore(user);
          userData = await getUserFromFirestore(user.uid);
        }

        // Update Zustand state
        this.updateUserData(userData);
        console.log('User data updated in state');
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    } else {
      // User is signed out
      console.log('User signed out');
      this.updateUserData(null);
    }
  }

  // Check if service is properly configured
  private checkConfiguration(): void {
    const configStatus = getFirebaseConfigStatus();
    if (!configStatus.isConfigured) {
      throw new Error(`Authentication not configured: ${configStatus.message}`);
    }
  }

  // Get platform information
  getPlatformInfo() {
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';

    return {
      platform,
      isNative,
      isWeb: platform === 'web',
      isIOS: platform === 'ios',
      isAndroid: platform === 'android',
    };
  }

  // Email/Password Authentication
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<SignInResult> {
    try {
      this.checkConfiguration();

      const platform = this.getPlatformInfo();
      console.log(`Email sign-in attempt on ${platform.platform}`);

      const userCredential = await firebaseAuthService.signInWithEmail(
        email,
        password
      );
      console.log('Email sign-in successful');

      return {
        user: userCredential.user,
        provider: AuthProvider.EMAIL,
      };
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }

  async signUpWithEmail(signUpData: SignUpData): Promise<SignInResult> {
    try {
      this.checkConfiguration();

      const platform = this.getPlatformInfo();
      console.log(`Email sign-up attempt on ${platform.platform}`);

      const userCredential = await firebaseAuthService.signUpWithEmail(
        signUpData.email,
        signUpData.password,
        signUpData.displayName
      );
      console.log('Email sign-up successful');

      return {
        user: userCredential.user,
        isNewUser: true,
        provider: AuthProvider.EMAIL,
      };
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  }

  // Google Authentication
  async signInWithGoogle(): Promise<SignInResult> {
    try {
      const platformInfo = this.getPlatformInfo();
      console.log(`Google sign-in attempt on ${platformInfo.platform}`);

      if (!isGoogleAuthConfigured()) {
        throw new Error(
          'Google authentication is not configured. Please check your environment variables.'
        );
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      const userCredential = await googleAuthService.signIn();
      console.log(`Google sign-in successful on ${platformInfo.platform}`);

      return {
        user: userCredential.user,
        provider: AuthProvider.GOOGLE,
      };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  // Apple Authentication
  async signInWithApple(): Promise<SignInResult> {
    try {
      const platformInfo = this.getPlatformInfo();
      console.log(`Apple sign-in attempt on ${platformInfo.platform}`);

      if (!appleAuthService.isAvailable()) {
        const platform = platformInfo.platform;

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

      const userCredential = await appleAuthService.signIn();
      console.log(`Apple sign-in successful on ${platformInfo.platform}`);

      return {
        user: userCredential.user,
        provider: AuthProvider.APPLE,
      };
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }
  }

  // Check if Apple Sign In is available
  isAppleSignInAvailable(): boolean {
    const isAvailable = appleAuthService.isAvailable();
    const platformInfo = this.getPlatformInfo();

    console.log(
      `Apple Sign In availability check - Platform: ${platformInfo.platform}, Available: ${isAvailable}`
    );

    return isAvailable;
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      const platformInfo = this.getPlatformInfo();
      console.log(`Sign out attempt on ${platformInfo.platform}`);

      // Sign out from all services
      await Promise.all([
        firebaseAuthService.signOutUser(),
        googleAuthService.signOut().catch(() => {}), // Ignore errors if user wasn't signed in with Google
      ]);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<void> {
    try {
      this.checkConfiguration();
      await firebaseAuthService.resetPassword(email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<void> {
    try {
      const user = firebaseAuthService.getCurrentUser();
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await firebaseAuthService.sendVerificationEmail(user);
      console.log('Email verification sent');
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(
    displayName: string,
    photoURL?: string
  ): Promise<void> {
    try {
      const user = firebaseAuthService.getCurrentUser();
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await firebaseAuthService.updateUserProfile(user, displayName, photoURL);

      // Update Firestore as well
      await saveUserToFirestore(user);
      console.log('User profile updated');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return firebaseAuthService.getCurrentUser();
  }

  // Get current user data from Zustand
  getCurrentUserData(): IPCAUser | null {
    return useUserDataZState.getState().data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return Boolean(this.getCurrentUser());
  }

  // Get configuration status for debugging
  getConfigurationStatus() {
    const platformInfo = this.getPlatformInfo();

    return {
      platform: platformInfo,
      firebase: getFirebaseConfigStatus(),
      google: isGoogleAuthConfigured(),
      apple: appleAuthService.isAvailable(),
      initialized: this.isInitialized,
    };
  }
}

// Create singleton instance
export const unifiedAuthService = new UnifiedAuthService();

export default unifiedAuthService;
