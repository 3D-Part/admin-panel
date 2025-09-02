import { StateCreator } from 'zustand'
import { PaginationData, User } from '@/shared/types'
import EmployeesAPI from '@/services/employees'

export interface EmployeesSliceInterface {
  allEmployees: User[]
  currentPageEmployees: User[]
  activeEmployee: User
  selectedEmployee: User | null
  currentPage: number
  itemsPerPage: number
  totalPages: number
  count: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  employeesFilters: {}
  changeActiveEmployee: (employee: User) => void
  changeSelectedEmployee: (employee: User | null) => void
  changeCurrentPage: (page: number) => void
  changeItemsPerPage: (itemsPerPage: number) => void
  changeEmployeesFilter: (filters: {}) => void
  fetchEmployees: (paginationData?: PaginationData) => Promise<boolean>
  fetchAllEmployees: () => Promise<boolean>
  deleteEmployee: (id: string) => Promise<boolean>
}

export const employeesSlice: StateCreator<EmployeesSliceInterface> = (
  set,
  get
) => ({
  allEmployees: [],
  currentPageEmployees: [],
  activeEmployee: {} as User,
  selectedEmployee: null,
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  count: 0,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  employeesFilters: {},

  changeActiveEmployee: (employee: User) => {
    set({ activeEmployee: employee })
  },

  changeSelectedEmployee: (employee: User | null) => {
    set({ selectedEmployee: employee })
  },

  changeCurrentPage: (page: number) => {
    set({ currentPage: page })
  },

  changeItemsPerPage: (itemsPerPage: number) => {
    set({ itemsPerPage })
  },

  changeEmployeesFilter: (filters: {}) => {
    set({ employeesFilters: filters })
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

  deleteEmployee: async (id: string) => {
    try {
      const success = await EmployeesAPI.deleteEmployee(id)
      if (success) {
        // Remove the deleted employee from both arrays
        const updatedCurrentPageEmployees = get().currentPageEmployees.filter(
          (employee) => employee.id !== id
        )
        const updatedAllEmployees = get().allEmployees.filter(
          (employee) => employee.id !== id
        )

        set({
          currentPageEmployees: updatedCurrentPageEmployees,
          allEmployees: updatedAllEmployees,
          count: get().count - 1,
        })

        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting employee:', error)
      return false
    }
  },
})
