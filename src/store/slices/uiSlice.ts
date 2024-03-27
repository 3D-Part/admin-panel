import { StateCreator } from 'zustand'

export interface UISliceInterface {
  isMobileMenuOpen: boolean
  isSalesModalOpen: boolean
  changeIsMobileMenuOpen: (value: boolean) => void
  changeIsSalesModalOpen: (value: boolean) => void
}

export const UISlice: StateCreator<UISliceInterface> = (set, get) => ({
  isMobileMenuOpen: false,
  isSalesModalOpen: false,

  changeIsMobileMenuOpen: (value: boolean) => {
    set({ isMobileMenuOpen: value })
  },
  changeIsSalesModalOpen: (value: boolean) => {
    set({ isSalesModalOpen: value })
  },
})
