import { StateCreator } from 'zustand'

export interface UISliceInterface {
  isMobileMenuOpen: boolean
  changeIsMobileMenuOpen: (value: boolean) => void
}

export const UISlice: StateCreator<UISliceInterface> = (set, get) => ({
  isMobileMenuOpen: false,

  changeIsMobileMenuOpen: (value: boolean) => {
    set({ isMobileMenuOpen: value })
  },
})
