import { create } from 'zustand';

interface DebugStore {
  paused: boolean;
  setPaused: (v: boolean) => void;
}

export const useDebugStore = create<DebugStore>()((set) => ({
  paused: false,
  setPaused: (paused) => set({ paused }),
}));
