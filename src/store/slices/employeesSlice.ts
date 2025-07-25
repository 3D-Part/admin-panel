import { StateCreator } from 'zustand'
import { PaginationData, User, UsersData } from '@/shared/types'
import EmployeesAPI from '@/services/employees'

export interface EmployeesSliceInterface {
  allEmployees: User[]
  currentPageEmployees: User[]
  activeEmployee: User
  currentPage: number
  itemsPerPage: number
  totalPages: number
  count: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  employeesFilters: {}
  changeActiveEmployee: (data: User) => void
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeEmployeesFilter: (data: {}) => void
  fetchEmployees: (paginationData?: PaginationData) => Promise<boolean>
  fetchAllEmployees: (paginationData?: PaginationData) => Promise<boolean>
}

export const employeesSlice: StateCreator<EmployeesSliceInterface> = (
  set,
  get
) => ({
  allEmployees: [],
  currentPageEmployees: [],
  activeEmployee: {} as User,
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  count: 0,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  employeesFilters: {},

  changeActiveEmployee: (data: User) => {
    set({ activeEmployee: data })
  },

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeEmployeesFilter: (data: {}) => {
    set({ employeesFilters: data })
  },

  fetchEmployees: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await EmployeesAPI.getEmployees(
        sort,
        paginationData,
        get().employeesFilters
      )
      if (data) {
        set({ currentPageEmployees: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
        set({ count: data.count })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },

  fetchAllEmployees: async () => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await EmployeesAPI.getEmployees(sort)
      if (data) {
        set({ allEmployees: data.rows })
      }
      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },
})
