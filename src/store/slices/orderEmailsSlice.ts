import OrderEmailsAPI from '@/services/ordersEmails'
import { StateCreator } from 'zustand'
import { PaginationData, OrdersEmailsData, OrderEmail } from '@/shared/types'

export interface OrdersEmailsSliceInterface {
  allEmails: OrdersEmailsData[]
  currentPageEmails: OrderEmail[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  emailsFilters: {}
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeEmailsFilter: (data: {}) => void
  fetchOrdersEmails: (paginationData?: PaginationData) => Promise<boolean>
}

export const ordersEmailsSlice: StateCreator<OrdersEmailsSliceInterface> = (
  set,
  get
) => ({
  allEmails: [],
  currentPageEmails: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  emailsFilters: {},

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeEmailsFilter: (data: {}) => {
    set({ emailsFilters: data })
  },

  fetchOrdersEmails: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await OrderEmailsAPI.getOrdersEmails(
        sort,
        paginationData,
        get().emailsFilters
      )
      if (data) {
        set({ currentPageEmails: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },
})
