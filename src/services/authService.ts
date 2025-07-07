import { IPCAUser } from '@/types/user';
import {
  getFirebaseConfigStatus,
  isGoogleAuthConfigured,
} from '@/utils/constants/generic/firebase';
import {
  consoleError,
  consoleLog,
  consoleWarn,
} from '@/utils/helpers/consoleHelper';
import {
  useAuthInitializationZState,
  useUserDataZState,
} from '@/zustandStates/userState';
import { Capacitor } from '@capacitor/core';
import { EmailAuthProvider, User, linkWithCredential } from 'firebase/auth';
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
  ANONYMOUS = 'anonymous',
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

export interface AnonymousSignInResult extends SignInResult {
  isAnonymous: true;
  temporaryId: string;
}

// Unified Authentication Service
export class UnifiedAuthService {
  private updateUserData = useUserDataZState.getState().updateData;
  private updateAuthInitialization = useAuthInitializationZState.getState();
  private isInitialized = false;
  private authStateChangeTimeout: NodeJS.Timeout | null = null;

  // Initialize authentication services
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      consoleLog('🔄 Auth services already initialized, skipping...');
      return;
    }

    try {
      consoleLog('🔄 Starting authentication services initialization...');

      // Initialize Firebase Auth state listener
      firebaseAuthService.onAuthStateChange(
        this.handleAuthStateChange.bind(this)
      );

      // Check Firebase configuration
      const configStatus = await this.checkFirebaseConfiguration();
      consoleLog(
        '🔧 Firebase configuration status:',
        configStatus.isConfigured ? 'Ready' : 'Issues found'
      );

      if (!configStatus.isConfigured) {
        consoleWarn('Firebase Configuration Warning:', configStatus.message);
        consoleWarn(
          'Some authentication methods may not work properly. Please check your Firebase configuration.'
        );
      }

      // Initialize Google Auth if available
      if (configStatus.googleAuth.isConfigured) {
        try {
          consoleLog('Google Auth configuration found, initializing...');
          await googleAuthService.initialize();
          consoleLog('Google Auth initialized successfully');
        } catch (error) {
          consoleWarn('Google Auth initialization failed:', error);
        }
      } else {
        consoleWarn(
          'Google Auth not configured. Google sign-in will not be available.'
        );
      }

      // Log Apple Auth availability
      const isAppleAvailable = appleAuthService.isAvailable();
      consoleLog(
        `Apple Sign In available: ${isAppleAvailable} (Platform: ${this.getPlatformInfo().platform})`
      );

      // Mark services as ready
      this.updateAuthInitialization.setAuthServicesReady(true);
      this.isInitialized = true;

      consoleLog(
        '🎯 Auth initialization timeout set - will settle in 3 seconds if no user found'
      );

      // Set a timeout to settle auth state if no user is found
      this.authStateChangeTimeout = setTimeout(() => {
        this.updateAuthInitialization.setAuthStateSettled(true);
        this.updateAuthInitialization.setInitializing(false);
        consoleLog('✅ Auth state settled (timeout - no user found)');
      }, 3000);

      consoleLog('✅ Authentication services ready');
    } catch (error) {
      this.updateAuthInitialization.setInitializing(false);
      this.updateAuthInitialization.setAuthServicesReady(false);
      consoleError('❌ Error initializing auth services:', error);
      throw error;
    }
  }

  // Handle authentication state changes
  private async handleAuthStateChange(user: User | null): Promise<void> {
    consoleLog(
      '🔄 Auth state change triggered:',
      user ? user.email : 'signed out'
    );

    // Clear any existing timeout since we have a real auth state change
    if (this.authStateChangeTimeout) {
      clearTimeout(this.authStateChangeTimeout);
      this.authStateChangeTimeout = null;
    }

    if (user) {
      // User is signed in
      try {
        consoleLog('👤 User signed in:', user.email, 'UID:', user.uid);

        // Get user data from Firestore
        let userData = await getUserFromFirestore(user.uid);

        // If user doesn't exist in Firestore, save them
        if (!userData) {
          consoleLog(
            '📝 Creating new user record in Firestore for:',
            user.email
          );
          await saveUserToFirestore(user);
          userData = await getUserFromFirestore(user.uid);
        }

        if (userData) {
          // Update Zustand state
          this.updateUserData(userData);
          consoleLog('✅ User data updated in Zustand state:', userData.email);
        } else {
          consoleError(
            '❌ Failed to get user data from Firestore after saving'
          );
          // Clear user data since we can't access Firestore properly
          this.updateUserData(null);
        }
      } catch (error) {
        // Check if it's a permission error
        const isPermissionError =
          error instanceof Error &&
          (error.message.includes('permission') ||
            error.message.includes('insufficient permissions') ||
            error.message.includes('Missing or insufficient permissions'));

        if (isPermissionError) {
          consoleError(
            '❌ Permission error accessing Firestore, user may need to re-authenticate:',
            error
          );

          // Clear user data to force re-authentication
          this.updateUserData(null);
          this.updateAuthInitialization.reset();

          // Sign out the user to clear invalid auth state
          try {
            await firebaseAuthService.signOutUser();
            consoleLog('🔓 Signed out user due to permission error');
          } catch (signOutError) {
            consoleError('❌ Error signing out user:', signOutError);
          }

          return; // Exit early
        }

        consoleError('❌ Error handling auth state change:', error);
        // For other errors, clear user data to be safe
        this.updateUserData(null);
        consoleLog('🔓 Cleared user data due to error accessing Firestore');
      }
    } else {
      // User is signed out
      consoleLog('🔓 User signed out, clearing Zustand state');
      this.updateUserData(null);
    }

    // Mark auth state as settled and initialization as complete
    this.updateAuthInitialization.setAuthStateSettled(true);
    this.updateAuthInitialization.setInitializing(false);
    consoleLog('✅ Auth state settled');
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
      consoleLog(`Email sign-in attempt on ${platform.platform}`);

      const userCredential = await firebaseAuthService.signInWithEmail(
        email,
        password
      );
      consoleLog('Email sign-in successful');

      return {
        user: userCredential.user,
        provider: AuthProvider.EMAIL,
      };
    } catch (error) {
      consoleError('Error signing in with email:', error);
      throw error;
    }
  }

  async signUpWithEmail(signUpData: SignUpData): Promise<SignInResult> {
    try {
      this.checkConfiguration();

      const platform = this.getPlatformInfo();
      consoleLog(`Email sign-up attempt on ${platform.platform}`);

      const userCredential = await firebaseAuthService.signUpWithEmail(
        signUpData.email,
        signUpData.password,
        signUpData.displayName
      );
      consoleLog('Email sign-up successful');

      return {
        user: userCredential.user,
        isNewUser: true,
        provider: AuthProvider.EMAIL,
      };
    } catch (error) {
      consoleError('Error signing up with email:', error);
      throw error;
    }
  }

  // Google Authentication
  async signInWithGoogle(): Promise<SignInResult> {
    try {
      const platformInfo = this.getPlatformInfo();
      consoleLog(`Google sign-in attempt on ${platformInfo.platform}`);

      if (!isGoogleAuthConfigured()) {
        throw new Error(
          'Google authentication is not configured. Please check your environment variables.'
        );
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      const userCredential = await googleAuthService.signIn();
      consoleLog(`Google sign-in successful on ${platformInfo.platform}`);

      return {
        user: userCredential.user,
        provider: AuthProvider.GOOGLE,
      };
    } catch (error) {
      consoleError('Error signing in with Google:', error);
      throw error;
    }
  }

  // Apple Authentication
  async signInWithApple(): Promise<SignInResult> {
    try {
      const platformInfo = this.getPlatformInfo();
      consoleLog(`Apple sign-in attempt on ${platformInfo.platform}`);

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
      consoleLog(`Apple sign-in successful on ${platformInfo.platform}`);

      return {
        user: userCredential.user,
        provider: AuthProvider.APPLE,
      };
    } catch (error) {
      consoleError('Error signing in with Apple:', error);
      throw error;
    }
  }

  // Check if Apple Sign In is available
  isAppleSignInAvailable(): boolean {
    const isAvailable = appleAuthService.isAvailable();
    const platformInfo = this.getPlatformInfo();

    consoleLog(
      `Apple Sign In availability check - Platform: ${platformInfo.platform}, Available: ${isAvailable}`
    );

    return isAvailable;
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      const platformInfo = this.getPlatformInfo();
      consoleLog(`🔄 Sign out process starting on ${platformInfo.platform}...`);

      // Sign out from all platforms
      await Promise.all([
        firebaseAuthService.signOutUser(),
        platformInfo.isNative
          ? googleAuthService.signOut().catch(() => {})
          : Promise.resolve(),
      ]);

      consoleLog(`Sign out attempt on ${platformInfo.platform}`);

      // Clear local state
      this.updateUserData(null);

      consoleLog('Sign out successful');
    } catch (error) {
      consoleError('Error signing out:', error);
      throw error;
    }
  }

  // Password reset
  async resetPassword(email: string): Promise<void> {
    try {
      this.checkConfiguration();
      await firebaseAuthService.resetPassword(email);
      consoleLog('Password reset email sent');
    } catch (error) {
      consoleError('Error resetting password:', error);
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
      consoleLog('Email verification sent');
    } catch (error) {
      consoleError('Error sending email verification:', error);
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
      consoleLog('User profile updated');
    } catch (error) {
      consoleError('Error updating user profile:', error);
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

  private async checkFirebaseConfiguration(): Promise<{
    isConfigured: boolean;
    message: string;
    googleAuth: { isConfigured: boolean };
  }> {
    const configStatus = getFirebaseConfigStatus();
    return {
      isConfigured: configStatus.isConfigured,
      message: configStatus.message,
      googleAuth: { isConfigured: isGoogleAuthConfigured() },
    };
  }

  // Anonymous Authentication
  async signInAnonymously(): Promise<AnonymousSignInResult> {
    try {
      this.checkConfiguration();

      const platform = this.getPlatformInfo();
      consoleLog(`Anonymous sign-in attempt on ${platform.platform}`);

      const userCredential = await firebaseAuthService.signInAnonymously();
      consoleLog('Anonymous sign-in successful');

      // Generate a friendly temporary name for anonymous user
      const anonymousNames = [
        'Anonymous Panda',
        'Mystery User',
        'Guest User',
        'Friendly Stranger',
        'Chat Visitor',
        'Unknown Friend',
        'Secret Agent',
        'Incognito User',
        'Anonymous Hero',
        'Hidden User',
        'Ghost Chatter',
        'Phantom User',
      ];
      const randomName =
        anonymousNames[Math.floor(Math.random() * anonymousNames.length)];

      // Update the user's display name for better UX
      await firebaseAuthService.updateUserProfile(
        userCredential.user,
        randomName
      );

      return {
        user: userCredential.user,
        isNewUser: true,
        provider: AuthProvider.ANONYMOUS,
        isAnonymous: true,
        temporaryId: userCredential.user.uid,
      };
    } catch (error) {
      consoleError('Error signing in anonymously:', error);
      throw error;
    }
  }

  // Convert anonymous user to permanent account
  async convertAnonymousToEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<SignInResult> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || !currentUser.isAnonymous) {
        throw new Error('No anonymous user to convert');
      }

      consoleLog('Converting anonymous user to email account');

      // Create email credential
      const credential = EmailAuthProvider.credential(email, password);

      // Link the anonymous account with email/password
      const userCredential = await linkWithCredential(currentUser, credential);

      // Update profile with display name if provided
      if (displayName) {
        await firebaseAuthService.updateUserProfile(
          userCredential.user,
          displayName
        );
      }

      // Send email verification
      await firebaseAuthService.sendVerificationEmail(userCredential.user);

      consoleLog('Anonymous user converted to email account successfully');

      return {
        user: userCredential.user,
        isNewUser: false, // It's a conversion, not a new user
        provider: AuthProvider.EMAIL,
      };
    } catch (error) {
      consoleError('Error converting anonymous user:', error);
      throw error;
    }
  }

  // Check if current user is anonymous
  isAnonymousUser(): boolean {
    const user = this.getCurrentUser();
    return Boolean(user?.isAnonymous);
  }

  // Get anonymous user info
  getAnonymousUserInfo(): {
    isAnonymous: boolean;
    displayName: string;
    uid: string;
    signedInAt: Date;
  } | null {
    const user = this.getCurrentUser();
    if (!user || !user.isAnonymous) return null;

    return {
      isAnonymous: true,
      displayName: user.displayName || 'Anonymous User',
      uid: user.uid,
      signedInAt: new Date(user.metadata.creationTime || Date.now()),
    };
  }
}

// Create singleton instance
export const unifiedAuthService = new UnifiedAuthService();

export default unifiedAuthService;
