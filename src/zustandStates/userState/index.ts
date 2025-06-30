import { auth } from '@/services/firebase';
import { IPCAUser } from '@/types/user';
import React from 'react';
import { create } from 'zustand';

interface IPCAUserDataZState {
  data: IPCAUser | null;
  updateData: (newData: IPCAUser | null) => void;
}

export const useUserDataZState = create<IPCAUserDataZState>((set) => ({
  data: null,
  updateData: (newData: IPCAUser | null) => set({ data: newData }),
}));

// Authentication initialization state
interface AuthInitializationState {
  isInitializing: boolean;
  isAuthServicesReady: boolean;
  isAuthStateSettled: boolean;
  setInitializing: (initializing: boolean) => void;
  setAuthServicesReady: (ready: boolean) => void;
  setAuthStateSettled: (settled: boolean) => void;
  reset: () => void;
}

export const useAuthInitializationZState = create<AuthInitializationState>(
  (set) => ({
    isInitializing: true,
    isAuthServicesReady: false,
    isAuthStateSettled: false,
    setInitializing: (initializing: boolean) =>
      set({ isInitializing: initializing }),
    setAuthServicesReady: (ready: boolean) =>
      set({ isAuthServicesReady: ready }),
    setAuthStateSettled: (settled: boolean) =>
      set({ isAuthStateSettled: settled }),
    reset: () =>
      set({
        isInitializing: true,
        isAuthServicesReady: false,
        isAuthStateSettled: false,
      }),
  })
);

export const useIsAuthenticatedZState = () => {
  const userData = useUserDataZState((state) => state.data);

  // First check Zustand store for user data
  const hasUserData = Boolean(userData?.id && userData?.email);

  // Fallback to Firebase auth state for immediate checks (only if Zustand is empty)
  const hasFirebaseAuth = !hasUserData && Boolean(auth.currentUser);

  // Return true if either condition is met
  const isAuthenticated = hasUserData || hasFirebaseAuth;

  // Minimal debug logging to prevent performance issues
  if (import.meta.env.DEV && Math.random() < 0.01) {
    // Only log 1% of the time to reduce noise
    console.log('Auth State Check:', {
      hasUserData,
      hasFirebaseAuth,
      isAuthenticated,
      userDataId: userData?.id || 'none',
      firebaseUserId: auth.currentUser?.uid || 'none',
    });
  }

  return isAuthenticated;
};

// Hook to check if auth system is fully ready
export const useIsAuthSystemReady = () => {
  const { isInitializing, isAuthServicesReady, isAuthStateSettled } =
    useAuthInitializationZState();

  const isReady = !isInitializing && isAuthServicesReady && isAuthStateSettled;

  // Only log when state changes to reduce noise
  const prevStateRef = React.useRef<boolean>(isReady);
  if (prevStateRef.current !== isReady) {
    prevStateRef.current = isReady;
    if (import.meta.env.DEV) {
      console.log('🔄 Auth System Status Changed:', {
        isInitializing,
        isAuthServicesReady,
        isAuthStateSettled,
        isReady,
      });
    }
  }

  return isReady;
};

// User Profile State for detailed profile information
export interface UserProfileData {
  name: string;
  email: string;
  avatar: string | null;
  generalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    address: string;
  };
  workInfo: {
    position: string;
    department: string;
    employeeId: string;
    startDate: string;
    salary: string;
    manager: string;
  };
  birthInfo: {
    placeOfBirth: string;
    nationality: string;
    timezone: string;
  };
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
}

interface UserProfileZState {
  profile: UserProfileData | null;
  updateProfile: (newProfile: UserProfileData) => void;
  updatePartialProfile: (partialProfile: Partial<UserProfileData>) => void;
  resetProfile: () => void;
}

// Default profile data
const defaultProfile: UserProfileData = {
  name: 'ahsan mahmood',
  email: 'ahsan.mahmood@zaions.com',
  avatar: null,
  generalInfo: {
    firstName: 'ahsan',
    lastName: 'mahmood',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
  },
  workInfo: {
    position: 'Senior Software Engineer',
    department: 'Engineering',
    employeeId: 'EMP001',
    startDate: '2020-03-15',
    salary: '$95,000',
    manager: 'Jane Smith',
  },
  birthInfo: {
    placeOfBirth: 'New York, USA',
    nationality: 'American',
    timezone: 'EST (UTC-5)',
  },
  preferences: {
    theme: 'Light',
    language: 'English',
    notifications: true,
  },
};

export const useUserProfileZState = create<UserProfileZState>((set, get) => ({
  profile: defaultProfile,
  updateProfile: (newProfile: UserProfileData) => {
    set({ profile: newProfile });
  },
  updatePartialProfile: (partialProfile: Partial<UserProfileData>) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      const updatedProfile = {
        ...currentProfile,
        ...partialProfile,
        // Deep merge nested objects
        generalInfo: {
          ...currentProfile.generalInfo,
          ...partialProfile.generalInfo,
        },
        workInfo: { ...currentProfile.workInfo, ...partialProfile.workInfo },
        birthInfo: { ...currentProfile.birthInfo, ...partialProfile.birthInfo },
        preferences: {
          ...currentProfile.preferences,
          ...partialProfile.preferences,
        },
      };
      set({ profile: updatedProfile });
    }
  },
  resetProfile: () => {
    set({ profile: defaultProfile });
  },
}));
