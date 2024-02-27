import { StateCreator } from 'zustand'
import { PaginationData, OrdersData, Order } from '@/shared/types'
import { OrdersAPI } from '@/services'

export interface OrdersSliceInterface {
  allOrders: Order[]
  currentPageOrders: Order[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  fetchOrders: (paginationData?: PaginationData) => Promise<boolean>
  // fetchAllOrders: (paginationData?: PaginationData) => Promise<boolean>;
}

export const ordersSlice: StateCreator<OrdersSliceInterface> = (set, get) => ({
  allOrders: [],
  currentPageOrders: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  fetchOrders: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await OrdersAPI.getOrders(sort, paginationData)
      if (data) {
        set({ currentPageOrders: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
      }

      return true
    } catch (error) {
      console.error('Greška pri dohvatu podataka:', error)
    }
    return false
  },

  // fetchAllOrders: async () => {
  //   const sort = {
  //     field: get().sortFiled,
  //     order: get().sortOrder,
  //   };

  //   try {
  //     const data = await OrderAPI.getOrders(sort);
  //     if (data) {
  //       set({ allOrders: data.rows });
  //     }
  //     return true;
  //   } catch (error) {
  //     console.error("Greška pri dohvatu podataka:", error);
  //   }
  //   return false;
  // },
})
