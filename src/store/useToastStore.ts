import { create } from 'zustand'
import { Achievement } from '../types'

interface ToastState {
  pendingUnlocks: Achievement[]
  addUnlocks: (achievements: Achievement[]) => void
  clearUnlocks: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  pendingUnlocks: [],

  addUnlocks: (achievements) =>
    set((state) => ({
      pendingUnlocks: [...state.pendingUnlocks, ...achievements],
    })),

  clearUnlocks: () => set({ pendingUnlocks: [] }),
}))