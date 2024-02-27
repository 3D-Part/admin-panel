import { API } from '@/shared/helpers'
import { CategoryAttributeData } from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const addCategoryAttributesBulk = async (
  body: CategoryAttributeData[]
): Promise<boolean> => {
  try {
    const data = await API.post(
      `${API_BASE_URL}/shop/category-attributes-bulk`,
      body
    )

    return true
  } catch (error) {
    console.error('Error adding category attributes:', error)
    return false
  }
}

const removeCategoryAttributesBulk = async (
  ids: string[]
): Promise<boolean> => {
  try {
    const body = {
      ids: ids,
    }
    await API.remove(`${API_BASE_URL}/shop/category-attributes-bulk`, body)
    return true
  } catch (error) {
    console.error('Error removing attributes:', error)
    return false
  }
}

const CategoryAttributeAPI = {
  addCategoryAttributesBulk,
  removeCategoryAttributesBulk,
}

export default CategoryAttributeAPI
