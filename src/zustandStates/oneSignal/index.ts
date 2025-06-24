import { create } from 'zustand';

interface IOneSignalZState {
  isInitialized: boolean;
  setIsInitialized: () => void;
}

export const useOneSignalZState = create<IOneSignalZState>((set) => ({
  isInitialized: false,
  setIsInitialized: () => set(() => ({ isInitialized: true })),
}));
