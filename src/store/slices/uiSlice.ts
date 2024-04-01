import { StateCreator } from 'zustand'

export interface UISliceInterface {
  isMobileMenuOpen: boolean
  isSaleEditModalOpen: boolean
  isSaleAddNewModalOpen: boolean
  changeIsMobileMenuOpen: (value: boolean) => void
  changeIsSaleEditModalOpen: (value: boolean) => void
  changeIsSaleAddNewModalOpen: (value: boolean) => void
}

export const UISlice: StateCreator<UISliceInterface> = (set, get) => ({
  isMobileMenuOpen: false,
  isSaleEditModalOpen: false,
  isSaleAddNewModalOpen: false,

  changeIsMobileMenuOpen: (value: boolean) => {
    set({ isMobileMenuOpen: value })
  },
  changeIsSaleEditModalOpen: (value: boolean) => {
    set({ isSaleEditModalOpen: value })
  },
  changeIsSaleAddNewModalOpen: (value: boolean) => {
    set({ isSaleAddNewModalOpen: value })
  },
})
