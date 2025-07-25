import { StateCreator } from 'zustand'
import { PaginationData, SubscribersData, Subscriber } from '@/shared/types'
import SubscribersAPI from '@/services/subscibers'

export interface SubscribersSliceInterface {
  allSubscribers: SubscribersData[]
  currentPageSubscribers: Subscriber[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  count: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  subscribersFilters: {}
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeSubscribersFilter: (data: {}) => void
  fetchSubscribers: (paginationData?: PaginationData) => Promise<boolean>
}

export const subscribersSlice: StateCreator<SubscribersSliceInterface> = (
  set,
  get
) => ({
  allSubscribers: [],
  currentPageSubscribers: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  count: 0,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  subscribersFilters: {},

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeSubscribersFilter: (data: {}) => {
    set({ subscribersFilters: data })
  },

  fetchSubscribers: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await SubscribersAPI.getSubscribers(
        sort,
        paginationData,
        get().subscribersFilters
      )
      if (data) {
        set({ currentPageSubscribers: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
        set({ count: data.count })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },
})
