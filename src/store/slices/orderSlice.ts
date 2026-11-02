import { StateCreator } from 'zustand'
import { PaginationData, OrdersData, Order } from '@/shared/types'
import { OrdersAPI } from '@/services'
import { OrderStatusEnum } from '@/shared/enums'

export interface OrdersSliceInterface {
  allOrders: Order[]
  currentPageOrders: Order[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  count: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  orderFilter: object
  disputedOnly: boolean
  offersOnly: boolean
  changeDisputedOnly: (data: boolean) => void
  changeOffersOnly: (data: boolean) => void
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeOrderFilter: (data: object) => void
  setSortField: (field: string, order: 'ASC' | 'DESC') => void
  fetchOrders: (paginationData?: PaginationData) => Promise<boolean>
  // fetchAllOrders: (paginationData?: PaginationData) => Promise<boolean>;
}

export const ordersSlice: StateCreator<OrdersSliceInterface> = (set, get) => ({
  allOrders: [],
  currentPageOrders: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  count: 0,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  orderFilter: {},
  disputedOnly: false,
  offersOnly: false,

  changeDisputedOnly: (data: boolean) => {
    set({ disputedOnly: data })
  },

  changeOffersOnly: (data: boolean) => {
    set({ offersOnly: data })
  },

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeOrderFilter: (data: object) => {
    set({ orderFilter: data })
  },

  setSortField: (field: string, order: 'ASC' | 'DESC') => {
    set({ sortFiled: field, sortOrder: order })
  },

  fetchOrders: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const orderFilter = get().orderFilter as { filters?: object }
      const data = await OrdersAPI.getOrders(sort, paginationData, {
        filters: {
          ...orderFilter.filters,
          // offers have their own list and stay out of the orders
          status: get().offersOnly
            ? { is: OrderStatusEnum.ProformaSent }
            : (orderFilter.filters as any)?.status ?? {
                not: OrderStatusEnum.ProformaSent,
              },
          ...(get().disputedOnly && { disputed: { is: true } }),
        },
      })
      if (data) {
        set({ currentPageOrders: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
        set({ count: data.count })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
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
  //     console.error("Error with getting data:", error);
  //   }
  //   return false;
  // },
})
