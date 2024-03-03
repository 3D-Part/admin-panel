import { StateCreator } from 'zustand'
import {
  PaginationData,
  PromoCode,
  PromoCodeFormBody,
  PromoCodesData,
} from '@/shared/types'
import PromoCodesAPI from '@/services/promoCodes'

export interface PromoCodesSliceInterface {
  allPromoCodes: PromoCode[]
  activePromoCode: PromoCode
  currentPagePromoCodes: PromoCode[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  PromoCodesFilters: {}
  changeActivePromoCode: (data: PromoCode) => void
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeSubscribersFilter: (data: {}) => void
  fetchPromoCodes: (paginationData?: PaginationData) => Promise<boolean>
  addNewPromoCode: (promoCode: PromoCodeFormBody) => Promise<boolean>
  editPromoCode: (
    promoCodeId: string,
    promoCode: PromoCodeFormBody
  ) => Promise<boolean>
}

export const promoCodesSlice: StateCreator<PromoCodesSliceInterface> = (
  set,
  get
) => ({
  allPromoCodes: [],
  activePromoCode: {} as PromoCode,
  currentPagePromoCodes: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  PromoCodesFilters: {},

  changeActivePromoCode: (data: PromoCode) => {
    set({ activePromoCode: data })
  },

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeSubscribersFilter: (data: {}) => {
    set({ PromoCodesFilters: data })
  },

  fetchPromoCodes: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await PromoCodesAPI.getPromoCodes(
        sort,
        paginationData,
        get().PromoCodesFilters
      )
      if (data) {
        set({ currentPagePromoCodes: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },

  addNewPromoCode: async (promoCode: PromoCodeFormBody) => {
    const promoCodes = get().allPromoCodes

    const _promoCodesData: PromoCodeFormBody = {
      code: promoCode.code,
      startsAt: promoCode.startsAt,
      endsAt: promoCode.endsAt,
      discountPercentage: promoCode.discountPercentage,
    }

    try {
      const data = await PromoCodesAPI.addNewPromoCode(_promoCodesData)
      if (data) {
        // promoCodes.push(data)
        set({ allPromoCodes: [...promoCodes] })
        return true
      }
    } catch (error) {
      console.error('Error adding promoCode:', error)
      throw error
    }
    return false
  },

  editPromoCode: async (promoCodeId: string, promoCode: PromoCodeFormBody) => {
    const promoCodes = get().allPromoCodes

    const _promoCodeData: PromoCodeFormBody = {
      code: promoCode.code,
      startsAt: promoCode.startsAt,
      endsAt: promoCode.endsAt,
      discountPercentage: promoCode.discountPercentage,
    }

    try {
      const data = await PromoCodesAPI.editPromoCode(
        promoCodeId,
        _promoCodeData
      )
      if (data) {
        const index = promoCodes.findIndex(
          (promoCode) => promoCode.id === promoCodeId
        )
        if (index !== -1) {
          promoCodes[index] = data
        }

        set({ activePromoCode: data })
        return true
      }
    } catch (error) {
      console.error('Error editing promo code:', error)
      throw error
    }
    return false
  },
})
