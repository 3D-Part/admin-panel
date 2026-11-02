import { StateCreator } from 'zustand'
import { PaginationData, User, UsersData } from '@/shared/types'
import UsersAPI from '@/services/users'
import BackofficeAPI from '@/services/backoffice'

export interface UsersSliceInterface {
  allUsers: User[]
  currentPageUsers: User[]
  activeUser: User
  currentPage: number
  itemsPerPage: number
  totalPages: number
  count: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  usersFilters: {}
  disputedOnly: boolean
  changeDisputedOnly: (data: boolean) => void
  changeActiveUser: (data: User) => void
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeUsersFilter: (data: {}) => void
  setSortField: (field: string, order: 'ASC' | 'DESC') => void
  fetchUsers: (paginationData?: PaginationData) => Promise<boolean>
  fetchAllUsers: (paginationData?: PaginationData) => Promise<boolean>
  // addNewManufacture: (manufacture: ManufacturerFormBody) => Promise<boolean>;
  // editManufacture: (
  //   manufactureId: string,
  //   manufacture: ManufacturerFormBody
  // ) => Promise<boolean>;
}

export const usersSlice: StateCreator<UsersSliceInterface> = (set, get) => ({
  allUsers: [],
  currentPageUsers: [],
  activeUser: {} as User,
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  count: 0,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  usersFilters: {},
  disputedOnly: false,

  changeDisputedOnly: (data: boolean) => {
    set({ disputedOnly: data })
  },

  changeActiveUser: (data: User) => {
    set({ activeUser: data })
  },

  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeUsersFilter: (data: {}) => {
    set({ usersFilters: data })
  },

  setSortField: (field: string, order: 'ASC' | 'DESC') => {
    set({ sortFiled: field, sortOrder: order })
  },

  fetchUsers: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      let filters: { filters?: object } = get().usersFilters
      if (get().disputedOnly) {
        const emails = await BackofficeAPI.getDisputedCustomers()
        if (!emails?.length) {
          set({ currentPageUsers: [], totalPages: 1, count: 0 })
          return true
        }
        filters = {
          filters: { ...filters.filters, email: { in: emails.join(',') } },
        }
      }
      const data = await UsersAPI.getUsers(sort, paginationData, filters)
      if (data) {
        set({ currentPageUsers: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
        set({ count: data.count })
      }

      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },

  fetchAllUsers: async () => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await UsersAPI.getUsers(sort)
      if (data) {
        set({ allUsers: data.rows })
      }
      return true
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return false
  },

  // addNewManufacture: async (manufacturer: ManufacturerFormBody) => {
  //   const manufactures = get().allUsers;

  //   const _manufacturesData: ManufacturerFormBody = {
  //     name: manufacturer.name,
  //   };

  //   try {
  //     const data = await ManufacturesAPI.addNewManufacturer(_manufacturesData);
  //     if (data) {
  //       manufactures.push(data);
  //       set({ allUsers: [...manufactures] });
  //       return true;
  //     }
  //   } catch (error) {
  //     console.error("Error adding manufacture:", error);
  //     throw error;
  //   }
  //   return false;
  // },

  // editManufacture: async (
  //   manufacturerId: string,
  //   manufacturer: ManufacturerFormBody
  // ) => {
  //   const manufactures = get().allUsers;

  //   const _SubscribersData: ManufacturerFormBody = {
  //     name: manufacturer.name,
  //   };

  //   try {
  //     const data = await ManufacturesAPI.editManufacturer(
  //       manufacturerId,
  //       _SubscribersData
  //     );
  //     if (data) {
  //       const index = manufactures.findIndex(
  //         (manufacturer) => manufacturer.id === manufacturerId
  //       );
  //       if (index !== -1) {
  //         manufactures[index] = data;
  //       }
  //       return true;
  //     }
  //   } catch (error) {
  //     console.error("Error editing manufacturer:", error);
  //     throw error;
  //   }
  //   return false;
  // },
})
