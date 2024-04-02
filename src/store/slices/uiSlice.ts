import { StateCreator } from 'zustand'

export interface UISliceInterface {
  isMobileMenuOpen: boolean
  isSaleEditModalOpen: boolean
  isSaleAddNewModalOpen: boolean
  isAddProductsOnSaleModalOpen: boolean
  changeIsMobileMenuOpen: (value: boolean) => void
  changeIsSaleEditModalOpen: (value: boolean) => void
  changeIsSaleAddNewModalOpen: (value: boolean) => void
  changeIsAddProductsOnSaleModalOpen: (value: boolean) => void
}

export const UISlice: StateCreator<UISliceInterface> = (set, get) => ({
  isMobileMenuOpen: false,
  isSaleEditModalOpen: false,
  isSaleAddNewModalOpen: false,
  isAddProductsOnSaleModalOpen: false,

  changeIsMobileMenuOpen: (value: boolean) => {
    set({ isMobileMenuOpen: value })
  },
  changeIsSaleEditModalOpen: (value: boolean) => {
    set({ isSaleEditModalOpen: value })
  },
  changeIsSaleAddNewModalOpen: (value: boolean) => {
    set({ isSaleAddNewModalOpen: value })
  },
  changeIsAddProductsOnSaleModalOpen: (value: boolean) => {
    set({ isAddProductsOnSaleModalOpen: value })
  },
})
