import { StateCreator } from 'zustand'
import {
  PaginationData,
  PromoCode,
  PromoCodeFormBody,
  PromoCodesData,
} from '@/shared/types'
import PromoCodesAPI from '@/services/promoCodes'

export interface PromoCodesSliceInterface {
  allPromoCodes: PromoCodesData[]
  currentPagePromoCodes: PromoCode[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  PromoCodesFilters: {}
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeSubscribersFilter: (data: {}) => void
  fetchPromoCodes: (paginationData?: PaginationData) => Promise<boolean>
  addNewPromoCode: (manufacture: PromoCodeFormBody) => Promise<boolean>
  // allSubscribers: (paginationData?: PaginationData) => Promise<boolean>;
  // editManufacture: (
  //   manufactureId: string,
  //   manufacture: ManufacturerFormBody
  // ) => Promise<boolean>;
}

export const promoCodesSlice: StateCreator<PromoCodesSliceInterface> = (
  set,
  get
) => ({
  allPromoCodes: [],
  currentPagePromoCodes: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  PromoCodesFilters: {},

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
        promoCodes.push(data)
        set({ allPromoCodes: [...promoCodes] })
        return true
      }
    } catch (error) {
      console.error('Error adding manufacture:', error)
      throw error
    }
    return false
  },

  // editManufacture: async (
  //   manufacturerId: string,
  //   manufacturer: ManufacturerFormBody
  // ) => {
  //   const promoCodes = get().allSubscribers;

  //   const _PromoCodesData: ManufacturerFormBody = {
  //     name: manufacturer.name,
  //   };

  //   try {
  //     const data = await promoCodesAPI.editManufacturer(
  //       manufacturerId,
  //       _PromoCodesData
  //     );
  //     if (data) {
  //       const index = promoCodes.findIndex(
  //         (manufacturer) => manufacturer.id === manufacturerId
  //       );
  //       if (index !== -1) {
  //         promoCodes[index] = data;
  //       }
  //       return true;
  //     }
  //   } catch (error) {
  //     console.error("Error editing manufacturer:", error);
  //     throw error;
  //   }
  //   return false;
  // },
})
