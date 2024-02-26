import { StateCreator } from 'zustand'
import { PaginationData, SubscribersData, Subscriber } from '@/shared/types'
import SubscribersAPI from '@/services/subscibers'

export interface SubscribersSliceInterface {
    allSubscribers: SubscribersData[]
    currentPageSubscribers: Subscriber[]
    currentPage: number
    itemsPerPage: number
    totalPages: number
    sortFiled: string
    sortOrder: 'ASC' | 'DESC'
    subscribersFilters: {}
    changeCurrentPage: (data: number) => void
    changeItemsPerPage: (data: number) => void
    changeSubscribersFilter: (data: {}) => void
    fetchSubscribers: (paginationData?: PaginationData) => Promise<boolean>
    // allSubscribers: (paginationData?: PaginationData) => Promise<boolean>;
    // addNewManufacture: (manufacture: ManufacturerFormBody) => Promise<boolean>;
    // editManufacture: (
    //   manufactureId: string,
    //   manufacture: ManufacturerFormBody
    // ) => Promise<boolean>;
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
            }

            return true
        } catch (error) {
            console.error('Error with getting data:', error)
        }
        return false
    },

    // allSubscribers: async () => {
    //   const sort = {
    //     field: get().sortFiled,
    //     order: get().sortOrder,
    //   };

    //   try {
    //     const data = await ManufacturesAPI.getManufactures(sort);
    //     if (data) {
    //       set({ allSubscribers: data.rows });
    //     }
    //     return true;
    //   } catch (error) {
    //     console.error("Greška pri dohvatu podataka:", error);
    //   }
    //   return false;
    // },

    // addNewManufacture: async (manufacturer: ManufacturerFormBody) => {
    //   const manufactures = get().allSubscribers;

    //   const _manufacturesData: ManufacturerFormBody = {
    //     name: manufacturer.name,
    //   };

    //   try {
    //     const data = await ManufacturesAPI.addNewManufacturer(_manufacturesData);
    //     if (data) {
    //       manufactures.push(data);
    //       set({ allSubscribers: [...manufactures] });
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
    //   const manufactures = get().allSubscribers;

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
