import { IPCAUser } from '@/types/user';
import { useUserDataZState } from '@/zustandStates/userState';
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

  // Initialize authentication services
  async initialize(): Promise<void> {
    try {
      await googleAuthService.initialize();

      // Listen to authentication state changes
      firebaseAuthService.onAuthStateChange(
        this.handleAuthStateChange.bind(this)
      );
    } catch (error) {
      console.error('Error initializing auth services:', error);
    }
  }

  // Handle authentication state changes
  private async handleAuthStateChange(user: User | null): Promise<void> {
    if (user) {
      // User is signed in
      try {
        // Get user data from Firestore
        let userData = await getUserFromFirestore(user.uid);

        // If user doesn't exist in Firestore, save them
        if (!userData) {
          await saveUserToFirestore(user);
          userData = await getUserFromFirestore(user.uid);
        }

        // Update Zustand state
        this.updateUserData(userData);
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    } else {
      // User is signed out
      this.updateUserData(null);
    }
  }

  // Email/Password Authentication
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<SignInResult> {
    try {
      const userCredential = await firebaseAuthService.signInWithEmail(
        email,
        password
      );

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
      const userCredential = await firebaseAuthService.signUpWithEmail(
        signUpData.email,
        signUpData.password,
        signUpData.displayName
      );

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
      const userCredential = await googleAuthService.signIn();

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
      if (!appleAuthService.isAvailable()) {
        throw new Error('Apple Sign In is only available on iOS devices');
      }

      const userCredential = await appleAuthService.signIn();

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
    return appleAuthService.isAvailable();
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Sign out from all services
      await Promise.all([
        firebaseAuthService.signOutUser(),
        googleAuthService.signOut().catch(() => {}), // Ignore errors if user wasn't signed in with Google
      ]);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<void> {
    try {
      await firebaseAuthService.resetPassword(email);
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
}

// Create singleton instance
export const unifiedAuthService = new UnifiedAuthService();

export default unifiedAuthService;
