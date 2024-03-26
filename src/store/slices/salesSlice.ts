import { StateCreator } from 'zustand'
import { PaginationData, PromoCode, Sale, SaleFormBody } from '@/shared/types'
import { SalesAPI } from '@/services'

export interface SalesSliceInterface {
  allSales: Sale[]
  activeSales: Sale
  currentPageSales: Sale[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  SalesFilters: {}
  changeActiveSales: (data: Sale) => void
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeSubscribersFilter: (data: {}) => void
  fetchSales: (paginationData?: PaginationData) => Promise<boolean>
  addNewSale: (promoCode: SaleFormBody) => Promise<Sale | false>
  editSale: (saleId: string, sale: SaleFormBody) => Promise<boolean>
}

export const salesSlice: StateCreator<SalesSliceInterface> = (set, get) => ({
  allSales: [],
  activeSales: {} as Sale,
  currentPageSales: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  SalesFilters: {},

  changeActiveSales: (data: Sale) => {
    set({ activeSales: data })
  },

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeSubscribersFilter: (data: {}) => {
    set({ SalesFilters: data })
  },

  fetchSales: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await SalesAPI.getSales(
        sort,
        paginationData,
        get().SalesFilters
      )
      if (data) {
        set({ currentPageSales: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },

  addNewSale: async (sale: SaleFormBody) => {
    const sales = get().allSales

    const _salesData: SaleFormBody = {
      startsAt: sale.startsAt,
      endsAt: sale.endsAt,
    }

    try {
      const data = await SalesAPI.addNewSale(_salesData)
      if (data) {
        set({ allSales: [...sales] })
        return data
      }
    } catch (error) {
      console.error('Error adding sale:', error)
      throw error
    }
    return false
  },

  editSale: async (saleId: string, sale: SaleFormBody) => {
    const sales = get().allSales

    const _saleData: SaleFormBody = {
      startsAt: sale.startsAt,
      endsAt: sale.endsAt,
    }

    try {
      const data = await SalesAPI.editSale(saleId, _saleData)
      if (data) {
        const index = sales.findIndex((sale) => sale.id === saleId)
        if (index !== -1) {
          sales[index] = data
        }

        set({ activeSales: data })
        return true
      }
    } catch (error) {
      console.error('Error editing sale:', error)
      throw error
    }
    return false
  },
})
