import { StateCreator } from 'zustand'
import {
  PaginationData,
  ManufacturerData,
  ManufacturerFormBody,
} from '@/shared/types'
import { ManufacturesAPI } from '@/services'

export interface ManufactureSliceInterface {
  allManufactures: ManufacturerData[]
  currentPageManufactures: ManufacturerData[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  count: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  manufactureFilters: {}
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeManufactureFilter: (data: {}) => void
  fetchManufactures: (paginationData?: PaginationData) => Promise<boolean>
  fetchAllManufactures: (forceRefresh?: boolean) => Promise<boolean>
  addNewManufacture: (manufacture: ManufacturerFormBody) => Promise<boolean>
  editManufacture: (
    manufactureId: string,
    manufacture: ManufacturerFormBody
  ) => Promise<boolean>
}

export const manufactureSlice: StateCreator<ManufactureSliceInterface> = (
  set,
  get
) => ({
  allManufactures: [],
  currentPageManufactures: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  count: 0,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  manufactureFilters: {},

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeManufactureFilter: (data: {}) => {
    set({ manufactureFilters: data })
  },

  fetchManufactures: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await ManufacturesAPI.getManufactures(
        sort,
        paginationData,
        get().manufactureFilters
      )
      if (data) {
        set({ currentPageManufactures: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
        set({ count: data.count })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },

  fetchAllManufactures: async (forceRefresh = false) => {
    // Don't fetch if we already have data and don't need to force refresh
    if (get().allManufactures.length > 0 && !forceRefresh) {
      console.log('Manufactures already loaded, skipping API call')
      return true
    }

    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    const chunkSize = 50 // Fetch 50 manufactures at a time
    let allManufactures: ManufacturerData[] = []
    let offset = 0
    let hasMore = true

    try {
      while (hasMore) {
        const paginationData = {
          offset,
          limit: chunkSize,
        }

        const data = await ManufacturesAPI.getManufactures(sort, paginationData)

        if (data && data.rows.length > 0) {
          allManufactures = [...allManufactures, ...data.rows]
          offset += chunkSize

          // Check if we've fetched all manufactures
          if (
            data.rows.length < chunkSize ||
            allManufactures.length >= data.count
          ) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      set({ allManufactures })
      console.log(`Loaded ${allManufactures.length} manufactures in chunks`)
      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },

  addNewManufacture: async (manufacturer: ManufacturerFormBody) => {
    const manufactures = get().allManufactures

    const _manufacturesData: ManufacturerFormBody = {
      name: manufacturer.name,
    }

    try {
      const data = await ManufacturesAPI.addNewManufacturer(_manufacturesData)
      if (data) {
        manufactures.push(data)
        set({ allManufactures: [...manufactures] })
        return true
      }
    } catch (error) {
      console.error('Error adding manufacture:', error)
      throw error
    }
    return false
  },

  editManufacture: async (
    manufacturerId: string,
    manufacturer: ManufacturerFormBody
  ) => {
    const manufactures = get().allManufactures

    const _manufacturerData: ManufacturerFormBody = {
      name: manufacturer.name,
    }

    try {
      const data = await ManufacturesAPI.editManufacturer(
        manufacturerId,
        _manufacturerData
      )
      if (data) {
        const index = manufactures.findIndex(
          (manufacturer) => manufacturer.id === manufacturerId
        )
        if (index !== -1) {
          manufactures[index] = data
        }
        return true
      }
    } catch (error) {
      console.error('Error editing manufacturer:', error)
      throw error
    }
    return false
  },
})
