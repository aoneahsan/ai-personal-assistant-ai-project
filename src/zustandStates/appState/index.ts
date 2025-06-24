import { create } from 'zustand';

interface _IAppState {
  show: boolean;
  setIsVisible: (show: boolean) => void;
}

export const useAppWiseLoaderZState = create<_IAppState>((set) => ({
  show: false,
  setIsVisible: (show: boolean) => set({ show }),
}));
