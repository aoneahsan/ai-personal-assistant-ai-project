import { IPCAUser } from '@/types/user';
import {
  FIREBASE_CONFIG,
  PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS,
} from '@/utils/constants/generic/firebase';
import { consoleError, consoleLog } from '@/utils/helpers/consoleHelper';
import { initializeApp } from 'firebase/app';
import {
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  StorageReference,
  uploadBytes,
} from 'firebase/storage';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Auth Service Interface
export interface AuthService {
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<UserCredential>;
  signInAnonymously: () => Promise<UserCredential>;
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

  // Sign in anonymously
  signInAnonymously: async (): Promise<UserCredential> => {
    try {
      const userCredential = await signInAnonymously(auth);
      consoleLog('Anonymous sign-in successful:', userCredential.user.uid);
      return userCredential;
    } catch (error) {
      const authError = error as AuthError;
      consoleError('Anonymous sign-in error:', authError);
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
      displayName: user.displayName || '',
      isEmailVerified: user.emailVerified,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    consoleLog('💾 Saving user to Firestore:', {
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName,
      isEmailVerified: userData.isEmailVerified,
    });

    await setDoc(userRef, userData, { merge: true });
    consoleLog('✅ User saved to Firestore successfully');
  } catch (error) {
    consoleError('❌ Error saving user to Firestore:', error);
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
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as IPCAUser;
    } else {
      return null;
    }
  } catch (error) {
    consoleError('Error getting user from Firestore:', error);
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

// File upload types
export interface FileUploadResult {
  url: string;
  fileName: string;
  size: number;
  type: string;
  uploadedAt: Date;
  expiresAt: Date; // 10 days from upload
}

// File Storage Service
export class FileStorageService {
  private readonly STORAGE_PREFIX = `${PROJECT_PREFIX_FOR_COLLECTIONS_AND_FOLDERS}_files`;
  private readonly BACKUP_DAYS = 10; // Files expire after 10 days

  // Upload audio file
  async uploadAudio(
    file: File,
    chatId: string,
    senderId: string
  ): Promise<FileUploadResult> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `${this.STORAGE_PREFIX}/audio/${chatId}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      consoleLog('🎵 Uploading audio file:', fileName);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const uploadedAt = new Date();
      const expiresAt = new Date(
        uploadedAt.getTime() + this.BACKUP_DAYS * 24 * 60 * 60 * 1000
      );

      consoleLog('✅ Audio uploaded successfully:', downloadURL);

      return {
        url: downloadURL,
        fileName,
        size: file.size,
        type: file.type,
        uploadedAt,
        expiresAt,
      };
    } catch (error) {
      consoleError('❌ Error uploading audio:', error);
      throw error;
    }
  }

  // Upload image file
  async uploadImage(
    file: File,
    chatId: string,
    senderId: string
  ): Promise<FileUploadResult> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `${this.STORAGE_PREFIX}/images/${chatId}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      consoleLog('🖼️ Uploading image file:', fileName);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const uploadedAt = new Date();
      const expiresAt = new Date(
        uploadedAt.getTime() + this.BACKUP_DAYS * 24 * 60 * 60 * 1000
      );

      consoleLog('✅ Image uploaded successfully:', downloadURL);

      return {
        url: downloadURL,
        fileName,
        size: file.size,
        type: file.type,
        uploadedAt,
        expiresAt,
      };
    } catch (error) {
      consoleError('❌ Error uploading image:', error);
      throw error;
    }
  }

  // Upload video file
  async uploadVideo(
    file: File,
    chatId: string,
    senderId: string
  ): Promise<FileUploadResult> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `${this.STORAGE_PREFIX}/videos/${chatId}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      consoleLog('🎥 Uploading video file:', fileName);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const uploadedAt = new Date();
      const expiresAt = new Date(
        uploadedAt.getTime() + this.BACKUP_DAYS * 24 * 60 * 60 * 1000
      );

      consoleLog('✅ Video uploaded successfully:', downloadURL);

      return {
        url: downloadURL,
        fileName,
        size: file.size,
        type: file.type,
        uploadedAt,
        expiresAt,
      };
    } catch (error) {
      consoleError('❌ Error uploading video:', error);
      throw error;
    }
  }

  // Delete file from storage
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      consoleLog('🗑️ File deleted successfully:', filePath);
    } catch (error) {
      consoleError('❌ Error deleting file:', error);
      throw error;
    }
  }

  // Get storage reference for a file
  getFileRef(filePath: string): StorageReference {
    return ref(storage, filePath);
  }

  // Get backup policy info
  getBackupPolicy() {
    return {
      days: this.BACKUP_DAYS,
      description: `Files are automatically deleted after ${this.BACKUP_DAYS} days to save storage space`,
      configurable: true, // This will be a user setting in the future
    };
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService();

export default authService;
