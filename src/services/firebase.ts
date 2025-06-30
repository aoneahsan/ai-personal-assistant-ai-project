import { IPCAUser } from '@/types/user';
import {
  FIREBASE_CONFIG,
  PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS,
} from '@/utils/constants/generic/firebase';
import { initializeApp } from 'firebase/app';
import {
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  DocumentSnapshot,
  getDoc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Auth Service Interface
export interface AuthService {
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<UserCredential>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: (user: User) => Promise<void>;
  updateUserProfile: (
    user: User,
    displayName: string,
    photoURL?: string
  ) => Promise<void>;
  getCurrentUser: () => User | null;
  onAuthStateChange: (callback: (user: User | null) => void) => () => void;
}

// Authentication Methods
export const authService: AuthService = {
  // Sign in with email and password
  signInWithEmail: async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  },

  // Sign up with email and password
  signUpWithEmail: async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }

      return userCredential;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  },

  // Sign out current user
  signOutUser: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  },

  // Send email verification
  sendVerificationEmail: async (user: User): Promise<void> => {
    try {
      await sendEmailVerification(user);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  },

  // Update user profile
  updateUserProfile: async (
    user: User,
    displayName: string,
    photoURL?: string
  ): Promise<void> => {
    try {
      await updateProfile(user, { displayName, photoURL });
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(getAuthErrorMessage(authError.code));
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
};

// Firestore User Service
export const saveUserToFirestore = async (user: User): Promise<void> => {
  try {
    const userRef = doc(
      db,
      `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`,
      user.uid
    );

    // Normalize email to lowercase for consistent storage and searching
    const normalizedEmail = user.email?.toLowerCase?.() || '';

    const userData: IPCAUser = {
      id: user.uid,
      email: normalizedEmail,
      name: user.displayName || '',
      type: 'user',
    };

    console.log('💾 Saving user to Firestore:', {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      type: userData.type,
    });

    await setDoc(userRef, userData, { merge: true });
    console.log('✅ User saved to Firestore successfully');
  } catch (error) {
    console.error('❌ Error saving user to Firestore:', error);
    throw error;
  }
};

export const getUserFromFirestore = async (
  uid: string
): Promise<IPCAUser | null> => {
  try {
    const userRef = doc(
      db,
      `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_users`,
      uid
    );
    const userDoc: DocumentSnapshot = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as IPCAUser;
    }
    return null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    return null;
  }
};

// Error message handler
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/requires-recent-login':
      return 'Please re-authenticate to perform this action.';
    default:
      return 'An error occurred during authentication.';
  }
};

export default authService;
