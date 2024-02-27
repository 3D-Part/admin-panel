import { StateCreator } from 'zustand'
import { CategoriesAPI } from '@/services'
import { CategoryFormBody, CategoryData, PaginationData } from '@/shared/types'

export interface CategorySliceInterface {
  allCategories: CategoryData[]
  currentPageCategories: CategoryData[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  sortFiled: string
  sortOrder: 'ASC' | 'DESC'
  categoryFilters: {}
  changeCurrentPage: (data: number) => void
  changeItemsPerPage: (data: number) => void
  changeCategoryFilter: (data: {}) => void
  fetchCategories: (paginationData?: PaginationData) => Promise<boolean>
  fetchAllCategories: () => Promise<boolean>
  addNewCategory: (
    category: CategoryFormBody
  ) => Promise<CategoryData | boolean>
  editCategory: (
    categoryId: string,
    category: CategoryFormBody
  ) => Promise<boolean>
}

export const categorySlice: StateCreator<CategorySliceInterface> = (
  set,
  get
) => ({
  allCategories: [],
  currentPageCategories: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: 'createdAt',
  sortOrder: 'DESC',
  categoryFilters: {},
  changeCurrentPage: (data: number) => {
    set({ currentPage: data })
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data })
  },

  changeCategoryFilter: (data: {}) => {
    set({ categoryFilters: data })
  },

  fetchCategories: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await CategoriesAPI.getCategories(
        sort,
        paginationData,
        get().categoryFilters
      )
      if (data) {
        set({ currentPageCategories: data.rows })
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) })
      }

      return true
    } catch (error) {
      console.error('Greška pri dohvatu podataka:', error)
    }
    return false
  },

  fetchAllCategories: async () => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    }

    try {
      const data = await CategoriesAPI.getCategories(sort)
      if (data) {
        set({ allCategories: data.rows })
      }
      return true
    } catch (error) {
      console.error('Greška pri dohvatu podataka:', error)
    }
    return false
  },

  addNewCategory: async (category: CategoryFormBody) => {
    const categories = get().allCategories

    const _categoryData: CategoryFormBody = {
      name: category.name,
      slug: category.slug,
      description: category.description,
    }

    if (category.parentCategoryId) {
      _categoryData.parentCategoryId = category.parentCategoryId
    }

    try {
      const data = await CategoriesAPI.addNewCategory(_categoryData)
      if (data) {
        categories.push(data)
        set({ allCategories: [...categories] })
        return data
      }
    } catch (error) {
      console.error('Error adding category:', error)
      throw error
    }
    return false
  },

  editCategory: async (categoryId: string, category: CategoryFormBody) => {
    const categories = get().allCategories

    const _categoryData: CategoryFormBody = {
      name: category.name,
      slug: category.slug,
      description: category.description,
    }

    if (category.parentCategoryId) {
      _categoryData.parentCategoryId = category.parentCategoryId
    }

    try {
      const data = await CategoriesAPI.editCategory(categoryId, _categoryData)
      if (data) {
        const index = categories.findIndex(
          (category) => category.id === categoryId
        )
        if (index !== -1) {
          categories[index] = data
        }
        // categories.push(data);
        // set({ categories: [...categories] });
        return true
      }
    } catch (error) {
      console.error('Error editing category:', error)
      throw error
    }
    return false
  },
})
