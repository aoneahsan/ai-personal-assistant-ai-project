import { IPCAUser } from '@/types/user';
import { create } from 'zustand';

interface IPCAUserDataZState {
  data: IPCAUser | null;
  updateData: (newData: IPCAUser | null) => void;
}

export const useUserDataZState = create<IPCAUserDataZState>((set) => ({
  data: null,
  updateData: (newData: IPCAUser | null) => set({ data: newData }),
}));

export const useIsAuthenticatedZState = () => {
  const userData = useUserDataZState((state) => state.data);
  return Boolean(userData?.id && userData?.email);
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
