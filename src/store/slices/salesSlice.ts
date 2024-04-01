import { StateCreator } from 'zustand'
import { PaginationData, Sale, SaleFormBody, SalesData } from '@/shared/types'
import { SalesAPI } from '@/services'

export interface SalesSliceInterface {
  activeSale: Sale | null
  currentPageSales: Sale[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  SalesFilters: {}
  changeActiveSale: (data: Sale) => void
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeSalesFilter: (data: {}) => void
  fetchSales: (paginationData?: PaginationData) => Promise<boolean>
  fetchActiveSale: () => Promise<Sale | null>
  addNewSale: (sale: SaleFormBody) => Promise<Sale | null>
  editSale: (saleId: string, sale: SaleFormBody) => Promise<Sale | null>
  removeSale: (saleId: string) => Promise<boolean>
}

export const salesSlice: StateCreator<SalesSliceInterface> = (set, get) => ({
  activeSale: null,
  currentPageSales: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  SalesFilters: {},

  changeActiveSale: (data: Sale) => {
    set({ activeSale: data })
  },

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeSalesFilter: (data: {}) => {
    set({ SalesFilters: data })
  },

  fetchSales: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await SalesAPI.getAllSales(
        sort,
        paginationData,
        get().SalesFilters
      )
      if (data) {
        set({ currentPageSales: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
        return true
      }
    } catch (error) {
      console.error('Error with getting sales:', error)
    }
    return false
  },

  fetchActiveSale: async (): Promise<Sale | null> => {
    try {
      const data = await SalesAPI.getActiveSale()
      if (data) {
        set({ activeSale: data })
        return data
      }
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return null
  },

  addNewSale: async (sale: SaleFormBody) => {
    const _salesData: SaleFormBody = {
      name: sale.name,
      startsAt: sale.startsAt,
      endsAt: sale.endsAt,
    }

    try {
      const data = await SalesAPI.addNewSale(_salesData)
      if (data) {
        set({ activeSale: data })
        return data
      }
    } catch (error) {
      console.error('Error adding sale:', error)
      throw error
    }
    return null
  },

  editSale: async (saleId: string, sale: SaleFormBody) => {
    const _salesData: SaleFormBody = {
      name: sale.name,
      startsAt: sale.startsAt,
      endsAt: sale.endsAt,
    }
    try {
      const data = await SalesAPI.editSale(saleId, _salesData)
      if (data) {
        set({ activeSale: data })
        return data
      }
    } catch (error) {
      console.error('Error editing sale:', error)
      throw error
    }
    return null
  },

  removeSale: async (saleId: string) => {
    try {
      const data = await SalesAPI.removeSale(saleId)
      if (data) {
        set({ activeSale: null })
        return true
      }
    } catch (error) {
      console.error('Error removing sale:', error)
      throw error
    }
    return false
  },
})
