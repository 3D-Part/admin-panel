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
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  manufactureFilters: {}
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeManufactureFilter: (data: {}) => void
  fetchManufactures: (paginationData?: PaginationData) => Promise<boolean>
  fetchAllManufactures: (paginationData?: PaginationData) => Promise<boolean>
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
      }

      return true
    } catch (error) {
      console.error('Greška pri dohvatu podataka:', error)
    }
    return false
  },

  fetchAllManufactures: async () => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await ManufacturesAPI.getManufactures(sort)
      if (data) {
        set({ allManufactures: data.rows })
      }
      return true
    } catch (error) {
      console.error('Greška pri dohvatu podataka:', error)
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
